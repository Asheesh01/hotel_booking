package com.example.singlehotelbooking.repository;

import com.example.singlehotelbooking.entity.Room;
import com.example.singlehotelbooking.entity.RoomCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByCategory(RoomCategory category);
}
