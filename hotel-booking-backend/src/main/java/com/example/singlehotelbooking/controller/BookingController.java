package com.example.singlehotelbooking.controller;

import com.example.singlehotelbooking.dto.BookingRequest;
import com.example.singlehotelbooking.dto.BookingResponse;
import com.example.singlehotelbooking.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody BookingRequest request) {
        return ResponseEntity.ok(bookingService.createBooking(userDetails.getUsername(), request));
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> getMyBookings(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(bookingService.getBookingHistory(userDetails.getUsername()));
    }

    @PostMapping("/{reservationNumber}/rebook")
    public ResponseEntity<BookingResponse> rebook(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String reservationNumber,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate newCheckIn,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate newCheckOut) {

        return ResponseEntity.ok(bookingService.rebookBooking(
                userDetails.getUsername(), reservationNumber, newCheckIn, newCheckOut));
    }
}
