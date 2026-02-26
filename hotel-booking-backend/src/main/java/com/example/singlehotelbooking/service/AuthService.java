package com.example.singlehotelbooking.service;

import com.example.singlehotelbooking.dto.AuthResponse;
import com.example.singlehotelbooking.dto.LoginRequest;
import com.example.singlehotelbooking.dto.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}
