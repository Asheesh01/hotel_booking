package com.example.singlehotelbooking.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "room_availability", uniqueConstraints = @UniqueConstraint(columnNames = { "room_category_id", "date" }))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomAvailability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_category_id", nullable = false)
    private RoomCategory roomCategory;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private Integer availableRooms;
}
