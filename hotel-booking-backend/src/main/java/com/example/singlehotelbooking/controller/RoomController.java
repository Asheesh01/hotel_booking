package com.example.singlehotelbooking.controller;

import com.example.singlehotelbooking.dto.RoomCategoryDto;
import com.example.singlehotelbooking.entity.RoomCategory;
import com.example.singlehotelbooking.service.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    // ─── Public endpoints ───────────────────────────────────────

    @GetMapping("/api/rooms")
    public ResponseEntity<List<RoomCategory>> getAllRooms() {
        return ResponseEntity.ok(roomService.getAllRooms());
    }

    @GetMapping("/api/rooms/search")
    public ResponseEntity<List<RoomCategory>> searchByPrice(
            @RequestParam Double minPrice,
            @RequestParam Double maxPrice) {
        return ResponseEntity.ok(roomService.searchByPriceRange(minPrice, maxPrice));
    }

    @GetMapping("/api/rooms/filter")
    public ResponseEntity<List<RoomCategory>> filterRooms(
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String amenity,
            @RequestParam(required = false) LocalDate checkIn,
            @RequestParam(required = false) LocalDate checkOut,
            @RequestParam(defaultValue = "1") Integer roomsNeeded) {

        List<RoomCategory> all = roomService.getAllRooms();

        return ResponseEntity.ok(all.stream()
                .filter(r -> minPrice == null || r.getPricePerNight() >= minPrice)
                .filter(r -> maxPrice == null || r.getPricePerNight() <= maxPrice)
                .filter(r -> amenity == null || amenity.isBlank() ||
                        (r.getAmenities() != null &&
                                r.getAmenities().toLowerCase().contains(amenity.toLowerCase())))
                .filter(r -> {
                    if (checkIn == null || checkOut == null)
                        return true;
                    return roomService.checkAvailability(r.getId(), checkIn, checkOut, roomsNeeded);
                })
                .toList());
    }

    @GetMapping("/api/rooms/availability")
    public ResponseEntity<Map<String, Object>> checkAvailability(
            @RequestParam Long categoryId,
            @RequestParam LocalDate checkIn,
            @RequestParam LocalDate checkOut,
            @RequestParam(defaultValue = "1") Integer roomsNeeded) {

        boolean available = roomService.checkAvailability(categoryId, checkIn, checkOut, roomsNeeded);
        return ResponseEntity.ok(Map.of(
                "categoryId", categoryId,
                "checkIn", checkIn,
                "checkOut", checkOut,
                "roomsNeeded", roomsNeeded,
                "available", available));
    }

    // ─── Admin endpoints ─────────────────────────────────────────

    @PostMapping("/api/admin/rooms")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RoomCategory> createRoom(@Valid @RequestBody RoomCategoryDto dto) {
        return new ResponseEntity<>(roomService.createRoomCategory(dto), HttpStatus.CREATED);
    }

    @PutMapping("/api/admin/rooms/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RoomCategory> updateRoom(
            @PathVariable Long id,
            @RequestBody RoomCategoryDto dto) {
        return ResponseEntity.ok(roomService.updateRoomCategory(id, dto));
    }
}
