package com.example.singlehotelbooking.service;

import com.example.singlehotelbooking.dto.RoomCategoryDto;
import com.example.singlehotelbooking.entity.RoomCategory;

import java.time.LocalDate;
import java.util.List;

public interface RoomService {
    List<RoomCategory> getAllRooms();

    List<RoomCategory> searchByPriceRange(Double minPrice, Double maxPrice);

    boolean checkAvailability(Long categoryId, LocalDate checkIn, LocalDate checkOut, Integer roomsNeeded);

    RoomCategory createRoomCategory(RoomCategoryDto dto);

    RoomCategory updateRoomCategory(Long id, RoomCategoryDto dto);
}
