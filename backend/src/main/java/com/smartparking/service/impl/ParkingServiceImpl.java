package com.smartparking.service.impl;

import com.smartparking.model.AbstractParkingSlot;
import com.smartparking.model.Booking;
import com.smartparking.model.ParkingLot;
import com.smartparking.model.enums.BookingStatus;
import com.smartparking.model.enums.SlotStatus;
import com.smartparking.model.enums.VehicleType;
import com.smartparking.repository.BookingRepository;
import com.smartparking.repository.ParkingLotRepository;
import com.smartparking.repository.SlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Parking Service — manages parking lots and real-time slot availability.
 * ADA - Algorithms: Haversine formula for distance calculation O(n)
 * ADA - Data Structures: TreeMap for sorted lot results
 */
@Service
@Transactional
public class ParkingServiceImpl {

    @Autowired private ParkingLotRepository lotRepository;
    @Autowired private SlotRepository slotRepository;
    @Autowired private BookingRepository bookingRepository;

    // ========================= PARKING LOTS =========================

    public List<Map<String, Object>> getAllLots() {
        return lotRepository.findByActiveTrue().stream()
                .map(this::toLotDto)
                .toList();
    }

    public Map<String, Object> getLotById(Long id) {
        ParkingLot lot = lotRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lot not found: " + id));
        return toLotDto(lot);
    }

    public ParkingLot saveLot(ParkingLot lot) {
        return lotRepository.save(lot);
    }

    public boolean deleteLot(Long id) {
        if (!lotRepository.existsById(id)) return false;
        lotRepository.deleteById(id);
        return true;
    }

    /**
     * ADA - Algorithm: Haversine formula to sort nearby lots by distance.
     * Time Complexity: O(n log n) where n = number of active lots
     */
    public List<Map<String, Object>> getNearbyLots(double userLat, double userLng, double radiusKm) {
        List<ParkingLot> allLots = lotRepository.findByActiveTrue();

        // ADA - Data Structure: TreeMap sorted by distance (key = distance)
        TreeMap<Double, Map<String, Object>> sortedByDistance = new TreeMap<>();

        for (ParkingLot lot : allLots) {
            double distance = haversineDistance(userLat, userLng, lot.getLatitude(), lot.getLongitude());
            if (distance <= radiusKm) {
                Map<String, Object> dto = toLotDto(lot);
                dto.put("distanceKm", Math.round(distance * 100.0) / 100.0);
                // Use distance + lot ID to avoid TreeMap key collision
                sortedByDistance.put(distance + (lot.getId() * 0.00001), dto);
            }
        }

        return new ArrayList<>(sortedByDistance.values());
    }

    /**
     * ADA - Algorithm: Haversine Great-Circle Distance Formula
     * Calculates distance between two geographic coordinates in kilometers.
     */
    private double haversineDistance(double lat1, double lng1, double lat2, double lng2) {
        final double R = 6371.0; // Earth's radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // ========================= SLOTS =========================

    public List<Map<String, Object>> getSlotsByLot(Long lotId) {
        return slotRepository.findByLotId(lotId).stream()
                .map(this::toSlotDto)
                .toList();
    }

    public Map<String, Object> getLotAvailability(Long lotId) {
        Map<String, Object> result = new HashMap<>();
        for (VehicleType type : VehicleType.values()) {
            long available = slotRepository.countByLotIdAndVehicleTypeAndStatus(lotId, type, SlotStatus.AVAILABLE);
            long occupied = slotRepository.countByLotIdAndVehicleTypeAndStatus(lotId, type, SlotStatus.OCCUPIED);
            long reserved = slotRepository.countByLotIdAndVehicleTypeAndStatus(lotId, type, SlotStatus.RESERVED);
            result.put(type.name().toLowerCase() + "Available", available);
            result.put(type.name().toLowerCase() + "Occupied", occupied);
            result.put(type.name().toLowerCase() + "Reserved", reserved);
        }
        long totalAvailable = slotRepository.countByLotIdAndStatus(lotId, SlotStatus.AVAILABLE);
        long totalOccupied = slotRepository.countByLotIdAndStatus(lotId, SlotStatus.OCCUPIED);
        result.put("totalAvailable", totalAvailable);
        result.put("totalOccupied", totalOccupied);
        result.put("lotId", lotId);
        return result;
    }

    public Map<String, Object> updateSlotStatus(Long slotId, String status) {
        AbstractParkingSlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found"));
        slot.setStatus(SlotStatus.valueOf(status));
        slotRepository.save(slot);
        return toSlotDto(slot);
    }

    // ========================= ADMIN MONITOR =========================

    public Map<String, Object> getAdminMonitorData() {
        Map<String, Object> data = new HashMap<>();
        List<ParkingLot> lots = lotRepository.findByActiveTrue();
        List<Map<String, Object>> lotStats = new ArrayList<>();

        long globalActive = bookingRepository.findByStatus(BookingStatus.ACTIVE).size();
        long globalCompleted = bookingRepository.findByStatus(BookingStatus.COMPLETED).size();
        long globalPending = bookingRepository.findByStatus(BookingStatus.CONFIRMED).size();
        long totalSlots = slotRepository.count();
        long totalAvailable = slotRepository.countByLotIdAndStatus(0L, SlotStatus.AVAILABLE); // Will fix below
        totalAvailable = 0;

        for (ParkingLot lot : lots) {
            Map<String, Object> stat = new HashMap<>();
            stat.put("lotId", lot.getId());
            stat.put("lotName", lot.getName());
            stat.put("address", lot.getAddress());

            long avail = slotRepository.countByLotIdAndStatus(lot.getId(), SlotStatus.AVAILABLE);
            long occup = slotRepository.countByLotIdAndStatus(lot.getId(), SlotStatus.OCCUPIED);
            long reserv = slotRepository.countByLotIdAndStatus(lot.getId(), SlotStatus.RESERVED);
            long active = bookingRepository.countByLotIdAndStatus(lot.getId(), BookingStatus.ACTIVE);
            long entered = bookingRepository.countByLotIdAndStatus(lot.getId(), BookingStatus.ACTIVE);
            long exited = bookingRepository.countByLotIdAndStatus(lot.getId(), BookingStatus.COMPLETED);

            stat.put("available", avail);
            stat.put("occupied", occup);
            stat.put("reserved", reserv);
            stat.put("active", active);
            stat.put("entered", entered);
            stat.put("exited", exited);
            stat.put("totalCapacity", lot.getTotalCapacity());
            stat.put("occupancyRate", lot.getTotalCapacity() > 0
                    ? Math.round((double)(occup + reserv) / lot.getTotalCapacity() * 100) : 0);

            totalAvailable += avail;
            lotStats.add(stat);
        }

        data.put("lots", lotStats);
        data.put("globalActive", globalActive);
        data.put("globalCompleted", globalCompleted);
        data.put("globalPending", globalPending);
        data.put("totalSlots", slotRepository.count());
        data.put("totalAvailable", totalAvailable);

        // Recent activity
        List<Booking> recentBookings = bookingRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(Booking::getBookingTime, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(10)
                .toList();
        data.put("recentActivity", recentBookings.stream().map(b -> Map.of(
                "bookingId", b.getId(),
                "vehicleNumber", b.getVehicleNumber() != null ? b.getVehicleNumber() : "",
                "lotName", b.getLotName() != null ? b.getLotName() : "",
                "status", b.getStatus().name(),
                "vehicleType", b.getVehicleType() != null ? b.getVehicleType().name() : "",
                "bookingTime", b.getBookingTime() != null ? b.getBookingTime().toString() : ""
        )).toList());

        return data;
    }

    // ========================= DTOs =========================

    private Map<String, Object> toLotDto(ParkingLot lot) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", lot.getId());
        dto.put("name", lot.getName());
        dto.put("address", lot.getAddress());
        dto.put("city", lot.getCity());
        dto.put("latitude", lot.getLatitude());
        dto.put("longitude", lot.getLongitude());
        dto.put("totalBikeSlots", lot.getTotalBikeSlots());
        dto.put("totalCarSlots", lot.getTotalCarSlots());
        dto.put("totalEvSlots", lot.getTotalEvSlots());
        dto.put("bikeHourlyRate", lot.getBikeHourlyRate());
        dto.put("carHourlyRate", lot.getCarHourlyRate());
        dto.put("evHourlyRate", lot.getEvHourlyRate());
        dto.put("openHours", lot.getOpenHours());
        dto.put("contactPhone", lot.getContactPhone());
        dto.put("active", lot.isActive());
        dto.put("totalCapacity", lot.getTotalCapacity());
        dto.put("imageUrl", lot.getImageUrl());
        dto.put("description", lot.getDescription());

        // Real-time availability
        long bikeAvail = slotRepository.countByLotIdAndVehicleTypeAndStatus(lot.getId(), VehicleType.BIKE, SlotStatus.AVAILABLE);
        long carAvail = slotRepository.countByLotIdAndVehicleTypeAndStatus(lot.getId(), VehicleType.CAR, SlotStatus.AVAILABLE);
        long evAvail = slotRepository.countByLotIdAndVehicleTypeAndStatus(lot.getId(), VehicleType.EV, SlotStatus.AVAILABLE);
        dto.put("bikeAvailable", bikeAvail);
        dto.put("carAvailable", carAvail);
        dto.put("evAvailable", evAvail);
        dto.put("totalAvailable", bikeAvail + carAvail + evAvail);
        return dto;
    }

    private Map<String, Object> toSlotDto(AbstractParkingSlot slot) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", slot.getId());
        dto.put("slotNumber", slot.getSlotNumber());
        dto.put("status", slot.getStatus().name());
        dto.put("vehicleType", slot.getVehicleType().name());
        dto.put("lotId", slot.getLotId());
        dto.put("floor", slot.getFloor());
        dto.put("slotIndex", slot.getSlotIndex());
        dto.put("currentBookingId", slot.getCurrentBookingId());
        dto.put("slotCategory", slot.getSlotCategory());
        dto.put("supportsCharging", slot.supportsCharging());
        return dto;
    }
}
