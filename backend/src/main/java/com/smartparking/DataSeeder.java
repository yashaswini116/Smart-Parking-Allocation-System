package com.smartparking;

import com.smartparking.model.*;
import com.smartparking.model.enums.UserRole;
import com.smartparking.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Seeds the database with 4 demo parking lots in Bengaluru
 * and pre-populates slot grids (bike/car/EV) for each lot.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired private ParkingLotRepository lotRepository;
    @Autowired private SlotRepository slotRepository;
    @Autowired private UserRepository userRepository;

    @Override
    public void run(String... args) {
        if (lotRepository.count() > 0) return; // Already seeded

        // ===== SEED USERS =====
        User admin = new User("Admin", "admin@smartpark.com", "9999999999", "admin123", UserRole.ADMIN);
        User user1 = new User("Yasha Sharma", "yasha@gmail.com", "9876543210", "user123", UserRole.USER);
        User user2 = new User("Ravi Kumar", "ravi@gmail.com", "9123456789", "user123", UserRole.USER);
        userRepository.saveAll(List.of(admin, user1, user2));

        // ===== SEED PARKING LOTS =====
        List<ParkingLot> lots = new ArrayList<>();

        ParkingLot lot1 = new ParkingLot("Indiranagar Smart Park", "100 Feet Road, Indiranagar", "Bengaluru",
                12.9784, 77.6408, 20, 30, 10);
        lot1.setDescription("Premium parking with EV charging stations near metro");
        lot1.setOpenHours("24/7");
        lot1.setContactPhone("080-12345678");
        lot1.setBikeHourlyRate(20); lot1.setCarHourlyRate(50); lot1.setEvHourlyRate(55);

        ParkingLot lot2 = new ParkingLot("Koramangala Parking Hub", "5th Block, Koramangala", "Bengaluru",
                12.9352, 77.6245, 30, 50, 15);
        lot2.setDescription("Multi-level parking hub in the heart of Koramangala");
        lot2.setOpenHours("06:00 AM - 11:00 PM");
        lot2.setContactPhone("080-23456789");
        lot2.setBikeHourlyRate(15); lot2.setCarHourlyRate(45); lot2.setEvHourlyRate(50);

        ParkingLot lot3 = new ParkingLot("MG Road Metro Park", "MG Road, Near Trinity Metro", "Bengaluru",
                12.9755, 77.6069, 40, 60, 20);
        lot3.setDescription("Convenient parking adjacent to MG Road metro station");
        lot3.setOpenHours("05:00 AM - 12:00 AM");
        lot3.setContactPhone("080-34567890");
        lot3.setBikeHourlyRate(25); lot3.setCarHourlyRate(60); lot3.setEvHourlyRate(65);

        ParkingLot lot4 = new ParkingLot("Whitefield Tech Park", "ITPL Main Road, Whitefield", "Bengaluru",
                12.9698, 77.7500, 50, 80, 25);
        lot4.setDescription("Large corporate parking facility with CCTV surveillance");
        lot4.setOpenHours("24/7");
        lot4.setContactPhone("080-45678901");
        lot4.setBikeHourlyRate(10); lot4.setCarHourlyRate(40); lot4.setEvHourlyRate(45);

        lots = lotRepository.saveAll(List.of(lot1, lot2, lot3, lot4));

        // ===== SEED SLOTS FOR EACH LOT =====
        List<AbstractParkingSlot> allSlots = new ArrayList<>();
        for (ParkingLot lot : lots) {
            // Bike slots
            for (int i = 0; i < lot.getTotalBikeSlots(); i++) {
                BikeSlot slot = new BikeSlot("B" + String.format("%02d", i + 1), lot.getId(), "G", i);
                allSlots.add(slot);
            }
            // Car slots
            for (int i = 0; i < lot.getTotalCarSlots(); i++) {
                CarSlot slot = new CarSlot("C" + String.format("%02d", i + 1), lot.getId(), "1", i);
                allSlots.add(slot);
            }
            // EV slots
            for (int i = 0; i < lot.getTotalEvSlots(); i++) {
                EVSlot slot = new EVSlot("E" + String.format("%02d", i + 1), lot.getId(), "2", i);
                allSlots.add(slot);
            }
        }
        slotRepository.saveAll(allSlots);

        System.out.println("✅ DataSeeder: Seeded " + lots.size() + " parking lots with "
                + allSlots.size() + " total slots.");
        System.out.println("✅ DataSeeder: Created users — admin@smartpark.com / admin123 | yasha@gmail.com / user123");
    }
}
