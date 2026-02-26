package com.example.singlehotelbooking.service;

import com.example.singlehotelbooking.dto.BookingRequest;
import com.example.singlehotelbooking.dto.BookingResponse;

import java.time.LocalDate;
import java.util.List;

public interface BookingService {
    BookingResponse createBooking(String userEmail, BookingRequest request);

    List<BookingResponse> getBookingHistory(String userEmail);

    BookingResponse rebookBooking(String userEmail, String reservationNumber,
            LocalDate newCheckIn, LocalDate newCheckOut);
}
