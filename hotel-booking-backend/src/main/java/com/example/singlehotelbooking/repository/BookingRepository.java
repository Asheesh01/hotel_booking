package com.example.singlehotelbooking.repository;

import com.example.singlehotelbooking.entity.Booking;
import com.example.singlehotelbooking.entity.RoomCategory;
import com.example.singlehotelbooking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserOrderByCreatedAtDesc(User user);

    Optional<Booking> findByReservationNumber(String reservationNumber);

    @org.springframework.data.jpa.repository.Query("SELECT b FROM Booking b WHERE b.roomCategory = :category " +
            "AND b.status = 'CONFIRMED' " +
            "AND NOT (b.checkOutDate <= :checkIn OR b.checkInDate >= :checkOut)")
    List<Booking> findConflictingBookings(
            @org.springframework.data.repository.query.Param("category") RoomCategory category,
            @org.springframework.data.repository.query.Param("checkIn") java.time.LocalDate checkIn,
            @org.springframework.data.repository.query.Param("checkOut") java.time.LocalDate checkOut);

    List<Booking> findAllByOrderByCreatedAtDesc();

    @Query("SELECT b.checkInDate, SUM(rc.pricePerNight * b.roomsBooked) FROM Booking b " +
            "JOIN b.roomCategory rc WHERE b.status = 'CONFIRMED' " +
            "GROUP BY b.checkInDate ORDER BY b.checkInDate DESC")
    List<Object[]> getDailyRevenueByCheckIn();

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.checkInDate = :date AND b.status = 'CONFIRMED'")
    Long countCheckInsOnDate(@Param("date") java.time.LocalDate date);
}
