package com.example.singlehotelbooking.config;

import com.example.singlehotelbooking.entity.RoomCategory;
import com.example.singlehotelbooking.entity.Promotion;
import com.example.singlehotelbooking.repository.RoomCategoryRepository;
import com.example.singlehotelbooking.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

        private final RoomCategoryRepository roomCategoryRepository;
        private final PromotionRepository promotionRepository;
        private final com.example.singlehotelbooking.repository.RoomRepository roomRepository;

        @Override
        public void run(String... args) {
                seedRooms();
                seedPromotions();
        }

        private void seedPromotions() {
                if (promotionRepository.count() > 0) {
                        log.info("Promotions already seeded. Skipping data initialization.");
                        return;
                }

                log.info("Seeding sample promotions...");
                promotionRepository.saveAll(List.of(
                                Promotion.builder()
                                                .code("WELCOME10")
                                                .discountPercentage(10)
                                                .expiryDate(LocalDate.now().plusYears(1))
                                                .isActive(true)
                                                .description("Welcome discount for new guests")
                                                .build(),
                                Promotion.builder()
                                                .code("SAVE20")
                                                .discountPercentage(20)
                                                .expiryDate(LocalDate.now().plusYears(1))
                                                .isActive(true)
                                                .description("Seasonal savings offer")
                                                .build(),
                                Promotion.builder()
                                                .code("FESTIVE30")
                                                .discountPercentage(30)
                                                .expiryDate(LocalDate.now().plusYears(1))
                                                .isActive(true)
                                                .description("Holiday special discount")
                                                .build()));
                log.info("✅ Successfully seeded {} promotions.", 3);
        }

        private void seedRooms() {
                if (roomCategoryRepository.count() == 0) {
                        log.info("Seeding hotel room data...");

                        List<RoomCategory> rooms = List.of(

                                        RoomCategory.builder()
                                                        .name("Standard Room")
                                                        .pricePerNight(2500.0)
                                                        .totalRooms(20)
                                                        .amenities(
                                                                        "Free WiFi, Air Conditioning, 32\" LED TV, Mini Fridge, Daily Housekeeping, Work Desk")
                                                        .imageUrls(List.of(
                                                                        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
                                                                        "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80"))
                                                        .build(),

                                        RoomCategory.builder()
                                                        .name("Deluxe Room")
                                                        .pricePerNight(4500.0)
                                                        .totalRooms(15)
                                                        .amenities(
                                                                        "Free WiFi, Air Conditioning, 43\" Smart TV, Mini Bar, Rain Shower, Bathtub, Room Service, City View")
                                                        .imageUrls(List.of(
                                                                        "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80",
                                                                        "https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?w=800&q=80"))
                                                        .build(),

                                        RoomCategory.builder()
                                                        .name("Superior Suite")
                                                        .pricePerNight(7500.0)
                                                        .totalRooms(10)
                                                        .amenities(
                                                                        "Free WiFi, Air Conditioning, 55\" Smart TV, Premium Mini Bar, Jacuzzi, Separate Living Area, Butler Service, Panoramic View, Nespresso Machine")
                                                        .imageUrls(List.of(
                                                                        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
                                                                        "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80"))
                                                        .build(),

                                        RoomCategory.builder()
                                                        .name("Presidential Suite")
                                                        .pricePerNight(15000.0)
                                                        .totalRooms(3)
                                                        .amenities(
                                                                        "Free WiFi, Air Conditioning, 75\" Smart TV, Full Bar, Private Pool, Private Dining, 24/7 Butler, Helipad Access, Rooftop Terrace, Luxury Toiletries")
                                                        .imageUrls(List.of(
                                                                        "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&q=80",
                                                                        "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80"))
                                                        .build(),

                                        RoomCategory.builder()
                                                        .name("Family Room")
                                                        .pricePerNight(5500.0)
                                                        .totalRooms(8)
                                                        .amenities(
                                                                        "Free WiFi, Air Conditioning, 2 x 43\" Smart TV, Kitchenette, Bunk Beds + King Bed, Kids Play Area, Board Games, Babysitting Service, Family Dining")
                                                        .imageUrls(List.of(
                                                                        "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80",
                                                                        "https://images.unsplash.com/photo-1544015759-62143a93d8ba?w=800&q=80"))
                                                        .build());

                        roomCategoryRepository.saveAll(rooms);
                        log.info("✅ Successfully seeded {} hotel room categories.", rooms.size());
                } else {
                        log.info("Room categories already seeded.");
                }

                // Seed individual rooms for each category if they don't exist
                if (roomRepository.count() == 0) {
                        log.info("Seeding individual rooms...");
                        List<RoomCategory> categories = roomCategoryRepository.findAll();
                        for (RoomCategory category : categories) {
                                for (int i = 1; i <= category.getTotalRooms(); i++) {
                                        String prefix = category.getName()
                                                        .substring(0, Math.min(3, category.getName().length()))
                                                        .toUpperCase();
                                        String roomNumber = prefix + "-" + (100 + i);
                                        roomRepository.save(com.example.singlehotelbooking.entity.Room.builder()
                                                        .roomNumber(roomNumber)
                                                        .category(category)
                                                        .build());
                                }
                        }
                        log.info("✅ Successfully seeded individual rooms.");
                }
        }
}
