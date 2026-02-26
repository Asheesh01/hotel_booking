package com.example.singlehotelbooking.service.impl;

import com.example.singlehotelbooking.dto.BookingRequest;
import com.example.singlehotelbooking.dto.BookingResponse;
import com.example.singlehotelbooking.entity.Booking;
import com.example.singlehotelbooking.entity.RoomAvailability;
import com.example.singlehotelbooking.entity.RoomCategory;
import com.example.singlehotelbooking.entity.User;
import com.example.singlehotelbooking.exception.ResourceNotFoundException;
import com.example.singlehotelbooking.exception.RoomNotAvailableException;
import com.example.singlehotelbooking.repository.BookingRepository;
import com.example.singlehotelbooking.repository.RoomAvailabilityRepository;
import com.example.singlehotelbooking.repository.RoomCategoryRepository;
import com.example.singlehotelbooking.repository.UserRepository;
import com.example.singlehotelbooking.service.BookingService;
import com.example.singlehotelbooking.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final RoomCategoryRepository roomCategoryRepository;
    private final RoomAvailabilityRepository roomAvailabilityRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final com.example.singlehotelbooking.repository.PromotionRepository promotionRepository;
    private final com.example.singlehotelbooking.repository.RoomRepository roomRepository;

    @Override
    @Transactional
    public BookingResponse createBooking(String userEmail, BookingRequest request) {
        if (!request.getCheckOutDate().isAfter(request.getCheckInDate())) {
            throw new IllegalArgumentException("Check-out date must be after check-in date");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        RoomCategory roomCategory = roomCategoryRepository.findById(request.getRoomCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Room category not found"));

        // Calculate nights and prices
        long nights = java.time.temporal.ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());
        double originalPrice = nights * roomCategory.getPricePerNight() * request.getRoomsBooked();
        double discountAmount = 0.0;

        // Apply promotion if provided
        if (request.getPromoCode() != null && !request.getPromoCode().isBlank()) {
            var promo = promotionRepository.findByCodeAndIsActiveTrueAndExpiryDateAfter(
                    request.getPromoCode(), LocalDate.now());
            if (promo.isPresent()) {
                discountAmount = (originalPrice * promo.get().getDiscountPercentage()) / 100.0;
            }
        }

        double totalPrice = originalPrice - discountAmount;
        int loyaltyPointsToAdd = (int) (totalPrice * 0.1);

        // Find available rooms
        List<Booking> conflictingBookings = bookingRepository.findConflictingBookings(
                roomCategory, request.getCheckInDate(), request.getCheckOutDate());

        java.util.Set<Long> occupiedRoomIds = conflictingBookings.stream()
                .flatMap(b -> b.getAssignedRooms().stream())
                .map(com.example.singlehotelbooking.entity.Room::getId)
                .collect(java.util.stream.Collectors.toSet());

        List<com.example.singlehotelbooking.entity.Room> allRoomsInCategory = roomRepository
                .findByCategory(roomCategory);
        List<com.example.singlehotelbooking.entity.Room> availableRooms = allRoomsInCategory.stream()
                .filter(r -> !occupiedRoomIds.contains(r.getId()))
                .limit(request.getRoomsBooked())
                .toList();

        if (availableRooms.size() < request.getRoomsBooked()) {
            throw new RoomNotAvailableException("Not enough rooms available for the selected dates.");
        }

        // Update availability for each date in range
        List<LocalDate> dates = request.getCheckInDate()
                .datesUntil(request.getCheckOutDate()).toList();

        for (LocalDate date : dates) {
            RoomAvailability availability = roomAvailabilityRepository
                    .findByRoomCategoryAndDate(roomCategory, date)
                    .orElse(RoomAvailability.builder()
                            .roomCategory(roomCategory)
                            .date(date)
                            .availableRooms(roomCategory.getTotalRooms())
                            .build());

            if (availability.getAvailableRooms() < request.getRoomsBooked()) {
                throw new RoomNotAvailableException(
                        "Not enough rooms available for date: " + date +
                                ". Available: " + availability.getAvailableRooms());
            }

            availability.setAvailableRooms(availability.getAvailableRooms() - request.getRoomsBooked());
            roomAvailabilityRepository.save(availability);
        }

        Booking booking = Booking.builder()
                .reservationNumber("RES-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .user(user)
                .roomCategory(roomCategory)
                .checkInDate(request.getCheckInDate())
                .checkOutDate(request.getCheckOutDate())
                .roomsBooked(request.getRoomsBooked())
                .status(Booking.BookingStatus.CONFIRMED)
                .originalPrice(originalPrice)
                .discountAmount(discountAmount)
                .totalPrice(totalPrice)
                .assignedRooms(availableRooms)
                .build();

        // Update user loyalty points
        user.setLoyaltyPoints(user.getLoyaltyPoints() + loyaltyPointsToAdd);
        userRepository.save(user);

        Booking savedBooking = bookingRepository.save(booking);

        // Send confirmation email (async-safe, won't break on SMTP failure)
        try {
            emailService.sendBookingConfirmationEmail(user.getEmail(), savedBooking);
        } catch (Exception e) {
            log.warn("Failed to send email confirmation: {}", e.getMessage());
        }

        return BookingResponse.fromEntity(savedBooking);
    }

    @Override
    public List<BookingResponse> getBookingHistory(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return bookingRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(BookingResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BookingResponse rebookBooking(String userEmail, String reservationNumber,
            LocalDate newCheckIn, LocalDate newCheckOut) {
        Booking originalBooking = bookingRepository.findByReservationNumber(reservationNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + reservationNumber));

        // Verify the booking belongs to the requesting user
        if (!originalBooking.getUser().getEmail().equals(userEmail)) {
            throw new ResourceNotFoundException("Booking not found for current user");
        }

        BookingRequest rebookRequest = new BookingRequest();
        rebookRequest.setRoomCategoryId(originalBooking.getRoomCategory().getId());
        rebookRequest.setCheckInDate(newCheckIn);
        rebookRequest.setCheckOutDate(newCheckOut);
        rebookRequest.setRoomsBooked(originalBooking.getRoomsBooked());

        return createBooking(userEmail, rebookRequest);
    }
}
