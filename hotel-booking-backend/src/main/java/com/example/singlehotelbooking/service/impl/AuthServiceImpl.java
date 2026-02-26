package com.example.singlehotelbooking.service.impl;

import com.example.singlehotelbooking.dto.AuthResponse;
import com.example.singlehotelbooking.dto.LoginRequest;
import com.example.singlehotelbooking.dto.RegisterRequest;
import com.example.singlehotelbooking.entity.User;
import com.example.singlehotelbooking.exception.ResourceNotFoundException;
import com.example.singlehotelbooking.exception.UserAlreadyExistsException;
import com.example.singlehotelbooking.repository.UserRepository;
import com.example.singlehotelbooking.security.JwtUtil;
import com.example.singlehotelbooking.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("User already exists with email: " + request.getEmail());
        }

        // Parse requested role
        User.Role role = User.Role.USER;
        if (request.getRole() != null) {
            if (request.getRole().equalsIgnoreCase("ADMIN")) {
                role = User.Role.ADMIN;
            } else if (request.getRole().equalsIgnoreCase("RECEPTION")) {
                role = User.Role.RECEPTION;
            }
        }

        // Singleton enforcement: only ONE ADMIN and ONE RECEPTION account allowed
        if (role == User.Role.ADMIN && userRepository.existsByRole(User.Role.ADMIN)) {
            throw new UserAlreadyExistsException(
                    "An Admin account already exists. Only one Admin is allowed. Please use the existing Admin account.");
        }
        if (role == User.Role.RECEPTION && userRepository.existsByRole(User.Role.RECEPTION)) {
            throw new UserAlreadyExistsException(
                    "A Reception account already exists. Only one Receptionist account is allowed. Please use the existing Reception account.");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();

        userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails, user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .role(user.getRole().name())
                .name(user.getName())
                .email(user.getEmail())
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails, user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .role(user.getRole().name())
                .name(user.getName())
                .email(user.getEmail())
                .build();
    }
}
