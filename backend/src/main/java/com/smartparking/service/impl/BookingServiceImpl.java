package com.smartparking.service.impl;

import com.smartparking.model.*;
import com.smartparking.model.enums.*;
import com.smartparking.repository.*;
import com.smartparking.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.PriorityBlockingQueue;

/**
 * ADA - Data Structures:
 *   - ConcurrentHashMap: O(1) slot lookup by ID
 *   - PriorityBlockingQueue: Waiting queue ordered by booking time (FIFO priority)
 *   - TreeMap: Sorted lot listing by distance
 * ADA - Algorithms:
 *   - Haversine formula for geo-distance calculation
 *   - Greedy slot allocation via Strategy pattern
 * OOP - Interface segregation: Implements BookingService interface
 */
@Service
@Transactional
public class BookingServiceImpl {

    @Autowired private BookingRepository bookingRepository;
    @Autowired private SlotRepository slotRepository;
    @Autowired private ParkingLotRepository lotRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private PaymentRepository paymentRepository;

    @Autowired
    @Qualifier("nearestAvailableStrategy")
    private SlotAllocationStrategy nearestStrategy;

    @Autowired
    @Qualifier("priorityEVStrategy")
    private SlotAllocationStrategy evStrategy;

    // ADA - Data Structure: Waiting queues per lot per vehicle type
    // Key: "lotId_VEHICLE_TYPE"
    private final Map<String, PriorityBlockingQueue<WaitingEntry>> waitingQueues = new ConcurrentHashMap<>();

    // ========================= BOOKING =========================

    public Map<String, Object> createBooking(Map<String, Object> request) {
        Long lotId = Long.parseLong(request.get("lotId").toString());
        Long userId = Long.parseLong(request.get("userId").toString());
        String vehicleTypeStr = request.get("vehicleType").toString();
        String vehicleNumber = request.get("vehicleNumber").toString();
        String ownerName = request.getOrDefault("ownerName", "User").toString();

        VehicleType vehicleType = VehicleType.valueOf(vehicleTypeStr);

        ParkingLot lot = lotRepository.findById(lotId)
                .orElseThrow(() -> new RuntimeException("Lot not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Find available slots
        List<AbstractParkingSlot> availableSlots = slotRepository
                .findByLotIdAndVehicleTypeAndStatus(lotId, vehicleType, SlotStatus.AVAILABLE);

        AbstractParkingSlot allocatedSlot;

        if (availableSlots.isEmpty()) {
            // Add to waiting queue
            String queueKey = lotId + "_" + vehicleType.name();
            waitingQueues.computeIfAbsent(queueKey, k ->
                    new PriorityBlockingQueue<>(10, Comparator.comparing(WaitingEntry::getJoinedAt)));

            String waitingBookingId = "WAIT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            WaitingEntry entry = new WaitingEntry(waitingBookingId, userId, lotId, vehicleType,
                    vehicleNumber, ownerName, LocalDateTime.now());
            waitingQueues.get(queueKey).offer(entry);

            int position = waitingQueues.get(queueKey).size();
            Map<String, Object> result = new HashMap<>();
            result.put("status", "WAITING");
            result.put("message", "All slots are occupied. You are #" + position + " in the waiting queue.");
            result.put("queuePosition", position);
            result.put("bookingId", waitingBookingId);
            return result;
        }

        // Use EV strategy for EVs, nearest strategy for others
        SlotAllocationStrategy strategy = (vehicleType == VehicleType.EV) ? evStrategy : nearestStrategy;
        Optional<AbstractParkingSlot> slotOpt = strategy.allocate(lotId, vehicleType, availableSlots);

        if (slotOpt.isEmpty()) {
            throw new RuntimeException("No suitable slot found");
        }

        allocatedSlot = slotOpt.get();
        String bookingId = "BK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        // Create booking
        Booking booking = new Booking(bookingId, userId, lotId, allocatedSlot.getId(),
                vehicleType, vehicleNumber, lot.getName(), allocatedSlot.getSlotNumber());
        booking.setOwnerName(ownerName);
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setUserName(user.getName());
        booking.setUserPhone(user.getPhone());

        // Calculate estimated fee (2 hours default)
        double estimatedFee = allocatedSlot.calculateFee(120);
        booking.setAmount(estimatedFee);

        bookingRepository.save(booking);

        // Mark slot as reserved
        allocatedSlot.setStatus(SlotStatus.RESERVED);
        allocatedSlot.setCurrentBookingId(bookingId);
        slotRepository.save(allocatedSlot);

        Map<String, Object> result = new HashMap<>();
        result.put("status", "CONFIRMED");
        result.put("bookingId", bookingId);
        result.put("slotNumber", allocatedSlot.getSlotNumber());
        result.put("lotName", lot.getName());
        result.put("vehicleType", vehicleType.name());
        result.put("estimatedFee", estimatedFee);
        result.put("strategyUsed", strategy.getStrategyName());
        result.put("booking", toBookingDto(booking));
        return result;
    }

    public Map<String, Object> recordEntry(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setEntryTime(LocalDateTime.now());
        booking.setStatus(BookingStatus.ACTIVE);

        // Mark slot as occupied
        AbstractParkingSlot slot = slotRepository.findById(booking.getSlotId()).orElseThrow();
        slot.setStatus(SlotStatus.OCCUPIED);
        slotRepository.save(slot);
        bookingRepository.save(booking);

        return Map.of("message", "Entry recorded", "entryTime", booking.getEntryTime().toString(), "booking", toBookingDto(booking));
    }

    public Map<String, Object> recordExit(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setExitTime(LocalDateTime.now());
        booking.setStatus(BookingStatus.COMPLETED);

        AbstractParkingSlot slot = slotRepository.findById(booking.getSlotId()).orElseThrow();

        // Calculate final fee using polymorphic calculateFee()
        double finalFee = slot.calculateFee(booking.getDurationMinutes());
        booking.setAmount(finalFee);

        // Release slot
        slot.release();
        slotRepository.save(slot);
        bookingRepository.save(booking);

        // Process next from waiting queue
        processWaitingQueue(booking.getLotId(), booking.getVehicleType());

        return Map.of(
                "message", "Exit recorded. Please proceed to payment.",
                "finalFee", finalFee,
                "durationMinutes", booking.getDurationMinutes(),
                "booking", toBookingDto(booking)
        );
    }

    public List<Map<String, Object>> getUserBookings(Long userId) {
        return bookingRepository.findByUserIdOrderByBookingTimeDesc(userId)
                .stream().map(this::toBookingDto).toList();
    }

    public Map<String, Object> getBookingById(String bookingId) {
        Booking b = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        return toBookingDto(b);
    }

    public boolean cancelBooking(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        if (booking.getStatus() == BookingStatus.ACTIVE) return false;
        booking.setStatus(BookingStatus.CANCELLED);

        AbstractParkingSlot slot = slotRepository.findById(booking.getSlotId()).orElse(null);
        if (slot != null) { slot.release(); slotRepository.save(slot); }
        bookingRepository.save(booking);
        return true;
    }

    // ========================= WAITING QUEUE =========================

    private void processWaitingQueue(Long lotId, VehicleType vehicleType) {
        String queueKey = lotId + "_" + vehicleType.name();
        PriorityBlockingQueue<WaitingEntry> queue = waitingQueues.get(queueKey);
        if (queue == null || queue.isEmpty()) return;

        WaitingEntry next = queue.poll();
        if (next == null) return;

        List<AbstractParkingSlot> available = slotRepository
                .findByLotIdAndVehicleTypeAndStatus(lotId, vehicleType, SlotStatus.AVAILABLE);
        if (available.isEmpty()) return;

        SlotAllocationStrategy strategy = (vehicleType == VehicleType.EV) ? evStrategy : nearestStrategy;
        Optional<AbstractParkingSlot> slotOpt = strategy.allocate(lotId, vehicleType, available);
        slotOpt.ifPresent(slot -> {
            ParkingLot lot = lotRepository.findById(lotId).orElseThrow();
            Booking booking = new Booking(next.getBookingId(), next.getUserId(), lotId, slot.getId(),
                    vehicleType, next.getVehicleNumber(), lot.getName(), slot.getSlotNumber());
            booking.setOwnerName(next.getOwnerName());
            booking.setStatus(BookingStatus.CONFIRMED);
            bookingRepository.save(booking);
            slot.setStatus(SlotStatus.RESERVED);
            slot.setCurrentBookingId(next.getBookingId());
            slotRepository.save(slot);
        });
    }

    public Map<String, Object> getWaitingQueue(Long lotId, String vehicleType) {
        String queueKey = lotId + "_" + vehicleType;
        PriorityBlockingQueue<WaitingEntry> queue = waitingQueues.get(queueKey);
        int size = (queue == null) ? 0 : queue.size();
        List<Map<String, Object>> entries = new ArrayList<>();
        if (queue != null) {
            queue.forEach(e -> entries.add(Map.of(
                    "bookingId", e.getBookingId(),
                    "vehicleNumber", e.getVehicleNumber(),
                    "joinedAt", e.getJoinedAt().toString(),
                    "position", entries.size() + 1
            )));
        }
        return Map.of("lotId", lotId, "vehicleType", vehicleType, "queueSize", size, "entries", entries);
    }

    // ========================= DTO =========================

    private Map<String, Object> toBookingDto(Booking b) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", b.getId());
        dto.put("userId", b.getUserId());
        dto.put("lotId", b.getLotId());
        dto.put("lotName", b.getLotName());
        dto.put("slotId", b.getSlotId());
        dto.put("slotNumber", b.getSlotNumber());
        dto.put("vehicleType", b.getVehicleType() != null ? b.getVehicleType().name() : null);
        dto.put("vehicleNumber", b.getVehicleNumber());
        dto.put("ownerName", b.getOwnerName());
        dto.put("status", b.getStatus().name());
        dto.put("bookingTime", b.getBookingTime() != null ? b.getBookingTime().toString() : null);
        dto.put("entryTime", b.getEntryTime() != null ? b.getEntryTime().toString() : null);
        dto.put("exitTime", b.getExitTime() != null ? b.getExitTime().toString() : null);
        dto.put("amount", b.getAmount());
        dto.put("paymentDone", b.isPaymentDone());
        dto.put("durationMinutes", b.getDurationMinutes());
        dto.put("userName", b.getUserName());
        dto.put("userPhone", b.getUserPhone());
        return dto;
    }
}
