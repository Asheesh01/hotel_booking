package com.example.singlehotelbooking.repository;

import com.example.singlehotelbooking.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    Optional<Promotion> findByCodeAndIsActiveTrueAndExpiryDateAfter(String code, LocalDate date);
}
