package com.example.singlehotelbooking.repository;

import com.example.singlehotelbooking.entity.RoomAvailability;
import com.example.singlehotelbooking.entity.RoomCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface RoomAvailabilityRepository extends JpaRepository<RoomAvailability, Long> {

    List<RoomAvailability> findByRoomCategoryAndDateBetween(
            RoomCategory roomCategory, LocalDate startDate, LocalDate endDate);

    Optional<RoomAvailability> findByRoomCategoryAndDate(RoomCategory roomCategory, LocalDate date);
}
