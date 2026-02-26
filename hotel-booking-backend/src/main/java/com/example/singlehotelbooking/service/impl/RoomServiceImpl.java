package com.example.singlehotelbooking.service.impl;

import com.example.singlehotelbooking.dto.RoomCategoryDto;
import com.example.singlehotelbooking.entity.RoomCategory;
import com.example.singlehotelbooking.exception.ResourceNotFoundException;
import com.example.singlehotelbooking.repository.RoomAvailabilityRepository;
import com.example.singlehotelbooking.repository.RoomCategoryRepository;
import com.example.singlehotelbooking.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final RoomCategoryRepository roomCategoryRepository;
    private final RoomAvailabilityRepository roomAvailabilityRepository;

    @Override
    public List<RoomCategory> getAllRooms() {
        return roomCategoryRepository.findAll();
    }

    @Override
    public List<RoomCategory> searchByPriceRange(Double minPrice, Double maxPrice) {
        return roomCategoryRepository.findByPricePerNightBetween(minPrice, maxPrice);
    }

    @Override
    public boolean checkAvailability(Long categoryId, LocalDate checkIn, LocalDate checkOut, Integer roomsNeeded) {
        RoomCategory category = roomCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Room category not found with id: " + categoryId));

        List<LocalDate> dates = checkIn.datesUntil(checkOut).toList();

        for (LocalDate date : dates) {
            var availability = roomAvailabilityRepository
                    .findByRoomCategoryAndDate(category, date);

            int available;
            if (availability.isPresent()) {
                available = availability.get().getAvailableRooms();
            } else {
                // No record means all rooms are available
                available = category.getTotalRooms();
            }

            if (available < roomsNeeded) {
                return false;
            }
        }
        return true;
    }

    @Override
    @Transactional
    public RoomCategory createRoomCategory(RoomCategoryDto dto) {
        RoomCategory category = RoomCategory.builder()
                .name(dto.getName())
                .pricePerNight(dto.getPricePerNight())
                .totalRooms(dto.getTotalRooms())
                .amenities(dto.getAmenities())
                .imageUrls(dto.getImageUrls() != null ? dto.getImageUrls() : new ArrayList<>())
                .build();
        return roomCategoryRepository.save(category);
    }

    @Override
    @Transactional
    public RoomCategory updateRoomCategory(Long id, RoomCategoryDto dto) {
        RoomCategory category = roomCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room category not found with id: " + id));

        if (dto.getName() != null)
            category.setName(dto.getName());
        if (dto.getPricePerNight() != null)
            category.setPricePerNight(dto.getPricePerNight());
        if (dto.getTotalRooms() != null)
            category.setTotalRooms(dto.getTotalRooms());
        if (dto.getAmenities() != null)
            category.setAmenities(dto.getAmenities());
        if (dto.getImageUrls() != null)
            category.setImageUrls(dto.getImageUrls());

        return roomCategoryRepository.save(category);
    }
}
