package com.example.singlehotelbooking.service;

import com.example.singlehotelbooking.entity.Booking;

public interface EmailService {
    void sendBookingConfirmationEmail(String toEmail, Booking booking);
}
