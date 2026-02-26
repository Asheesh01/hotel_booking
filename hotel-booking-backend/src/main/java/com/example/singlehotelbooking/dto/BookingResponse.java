package com.example.singlehotelbooking.dto;

import com.example.singlehotelbooking.entity.Booking;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long id;
    private String reservationNumber;
    private String roomCategoryName;
    private Double pricePerNight;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer roomsBooked;
    private String status;
    private LocalDateTime createdAt;
    private Double originalPrice;
    private Double discountAmount;
    private Double totalPrice;
    private Integer loyaltyPointsEarned;
    private String roomNumbers;

    public static BookingResponse fromEntity(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .reservationNumber(booking.getReservationNumber())
                .roomCategoryName(booking.getRoomCategory().getName())
                .pricePerNight(booking.getRoomCategory().getPricePerNight())
                .checkInDate(booking.getCheckInDate())
                .checkOutDate(booking.getCheckOutDate())
                .roomsBooked(booking.getRoomsBooked())
                .status(booking.getStatus().name())
                .createdAt(booking.getCreatedAt())
                .originalPrice(booking.getOriginalPrice())
                .discountAmount(booking.getDiscountAmount())
                .totalPrice(booking.getTotalPrice())
                .loyaltyPointsEarned((int) (booking.getTotalPrice() * 0.1))
                .roomNumbers(booking.getRoomNumbers())
                .build();
    }
}
