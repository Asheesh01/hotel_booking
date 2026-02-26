package com.example.singlehotelbooking.repository;

import com.example.singlehotelbooking.entity.RoomCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoomCategoryRepository extends JpaRepository<RoomCategory, Long> {
    List<RoomCategory> findByPricePerNightBetween(Double minPrice, Double maxPrice);

    boolean existsByName(String name);
}
