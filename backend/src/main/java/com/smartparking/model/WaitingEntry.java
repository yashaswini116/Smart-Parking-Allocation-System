package com.smartparking.model;

import com.smartparking.model.enums.VehicleType;
import java.time.LocalDateTime;

/**
 * ADA - Data Structure: Used as entries in PriorityBlockingQueue<WaitingEntry>
 * Comparable by joinedAt ensures FIFO ordering within the priority queue.
 */
public class WaitingEntry implements Comparable<WaitingEntry> {

    private String bookingId;
    private Long userId;
    private Long lotId;
    private VehicleType vehicleType;
    private String vehicleNumber;
    private String ownerName;
    private LocalDateTime joinedAt;

    public WaitingEntry() {}

    public WaitingEntry(String bookingId, Long userId, Long lotId,
                        VehicleType vehicleType, String vehicleNumber,
                        String ownerName, LocalDateTime joinedAt) {
        this.bookingId = bookingId;
        this.userId = userId;
        this.lotId = lotId;
        this.vehicleType = vehicleType;
        this.vehicleNumber = vehicleNumber;
        this.ownerName = ownerName;
        this.joinedAt = joinedAt;
    }

    @Override
    public int compareTo(WaitingEntry other) {
        return this.joinedAt.compareTo(other.joinedAt); // FIFO: earliest first
    }

    public String getBookingId() { return bookingId; }
    public void setBookingId(String bookingId) { this.bookingId = bookingId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getLotId() { return lotId; }
    public void setLotId(Long lotId) { this.lotId = lotId; }
    public VehicleType getVehicleType() { return vehicleType; }
    public void setVehicleType(VehicleType vehicleType) { this.vehicleType = vehicleType; }
    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }
    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }
    public LocalDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }
}
