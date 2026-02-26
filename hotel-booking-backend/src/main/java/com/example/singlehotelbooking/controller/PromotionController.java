package com.example.singlehotelbooking.controller;

import com.example.singlehotelbooking.entity.Promotion;
import com.example.singlehotelbooking.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/promotions")
@RequiredArgsConstructor
public class PromotionController {

    private final PromotionRepository promotionRepository;

    @GetMapping("/validate")
    public ResponseEntity<?> validateCode(@RequestParam String code) {
        return promotionRepository.findByCodeAndIsActiveTrueAndExpiryDateAfter(code, LocalDate.now())
                .map(p -> ResponseEntity.ok(Map.of(
                        "valid", true,
                        "discountPercentage", p.getDiscountPercentage(),
                        "description", p.getDescription() != null ? p.getDescription() : "")))
                .orElse(ResponseEntity.ok(Map.of("valid", false, "message", "Invalid or expired promo code")));
    }

    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Promotion> createPromotion(@RequestBody Promotion promotion) {
        if (promotion.getIsActive() == null)
            promotion.setIsActive(true);
        return ResponseEntity.ok(promotionRepository.save(promotion));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllPromotions() {
        return ResponseEntity.ok(promotionRepository.findAll());
    }
}
