package com.example.singlehotelbooking.controller;

import com.example.singlehotelbooking.entity.Booking;
import com.example.singlehotelbooking.entity.RoomCategory;
import com.example.singlehotelbooking.repository.BookingRepository;
import com.example.singlehotelbooking.repository.RoomAvailabilityRepository;
import com.example.singlehotelbooking.repository.RoomCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/reception")
@RequiredArgsConstructor
public class ReceptionController {

    private final BookingRepository bookingRepository;
    private final RoomCategoryRepository roomCategoryRepository;
    private final RoomAvailabilityRepository roomAvailabilityRepository;

    /** All bookings, newest first */
    @GetMapping("/bookings")
    public ResponseEntity<List<Map<String, Object>>> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAllByOrderByCreatedAtDesc();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Booking b : bookings) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", b.getId());
            m.put("reservationNumber", b.getReservationNumber());
            m.put("guestName", b.getUser().getName());
            m.put("guestEmail", b.getUser().getEmail());
            m.put("roomCategoryName", b.getRoomCategory().getName());
            m.put("checkInDate", b.getCheckInDate().toString());
            m.put("checkOutDate", b.getCheckOutDate().toString());
            m.put("roomsBooked", b.getRoomsBooked());
            m.put("status", b.getStatus());
            m.put("createdAt", b.getCreatedAt().toString());
            result.add(m);
        }
        return ResponseEntity.ok(result);
    }

    /** Today's room availability for every category */
    @GetMapping("/rooms/availability")
    public ResponseEntity<List<Map<String, Object>>> getRoomAvailability() {
        LocalDate today = LocalDate.now();
        List<RoomCategory> categories = roomCategoryRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (RoomCategory rc : categories) {
            int available = roomAvailabilityRepository
                    .findByRoomCategoryAndDate(rc, today)
                    .map(ra -> ra.getAvailableRooms())
                    .orElse(rc.getTotalRooms()); // if no record: all rooms available

            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", rc.getId());
            m.put("name", rc.getName());
            m.put("totalRooms", rc.getTotalRooms());
            m.put("availableToday", available);
            m.put("bookedToday", rc.getTotalRooms() - available);
            m.put("pricePerNight", rc.getPricePerNight());
            result.add(m);
        }
        return ResponseEntity.ok(result);
    }

    /** Daily revenue (grouped by check-in date) */
    @GetMapping("/revenue/daily")
    public ResponseEntity<List<Map<String, Object>>> getDailyRevenue() {
        List<Object[]> raw = bookingRepository.getDailyRevenueByCheckIn();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : raw) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("date", row[0].toString());
            m.put("revenue", row[1] == null ? 0 : ((Number) row[1]).doubleValue());
            result.add(m);
        }
        return ResponseEntity.ok(result);
    }

    /** Summary stats for the dashboard header cards */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        LocalDate today = LocalDate.now();
        long totalBookings = bookingRepository.count();
        long todayCheckIns = bookingRepository.countCheckInsOnDate(today);

        // Today's revenue
        List<Object[]> revenue = bookingRepository.getDailyRevenueByCheckIn();
        double todayRevenue = revenue.stream()
                .filter(r -> r[0].toString().equals(today.toString()))
                .mapToDouble(r -> r[1] == null ? 0 : ((Number) r[1]).doubleValue())
                .sum();
        double totalRevenue = revenue.stream()
                .mapToDouble(r -> r[1] == null ? 0 : ((Number) r[1]).doubleValue())
                .sum();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalBookings", totalBookings);
        stats.put("todayCheckIns", todayCheckIns);
        stats.put("todayRevenue", todayRevenue);
        stats.put("totalRevenue", totalRevenue);
        return ResponseEntity.ok(stats);
    }
}
