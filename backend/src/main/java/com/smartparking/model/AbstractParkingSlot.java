package com.smartparking.model;

import com.smartparking.model.enums.SlotStatus;
import com.smartparking.model.enums.VehicleType;
import jakarta.persistence.*;

/**
 * ADA - Abstraction: AbstractParkingSlot defines the slot contract.
 * OOP - Inheritance: BikeSlot, CarSlot, EVSlot extend this.
 * OOP - Polymorphism: calculateFee() and getSlotCategory() overridden by each.
 * Uses SINGLE_TABLE inheritance strategy for efficient DB storage.
 */
@Entity
@Table(name = "parking_slots")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "slot_type", discriminatorType = DiscriminatorType.STRING)
public abstract class AbstractParkingSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String slotNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SlotStatus status = SlotStatus.AVAILABLE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleType vehicleType;

    @Column(nullable = false)
    private Long lotId;

    private String currentBookingId;
    private String floor;
    private Integer slotIndex;

    public AbstractParkingSlot() {}

    public AbstractParkingSlot(String slotNumber, VehicleType vehicleType, Long lotId, String floor, Integer slotIndex) {
        this.slotNumber = slotNumber;
        this.vehicleType = vehicleType;
        this.lotId = lotId;
        this.floor = floor;
        this.slotIndex = slotIndex;
    }

    // Abstract methods — Polymorphism
    public abstract double calculateFee(long durationMinutes);
    public abstract String getSlotCategory();
    public abstract boolean supportsCharging();

    // Concrete shared methods
    public boolean isAvailable() {
        return this.status == SlotStatus.AVAILABLE;
    }

    public void occupy(String bookingId) {
        this.status = SlotStatus.OCCUPIED;
        this.currentBookingId = bookingId;
    }

    public void release() {
        this.status = SlotStatus.AVAILABLE;
        this.currentBookingId = null;
    }

    // Getters & Setters (Encapsulation)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSlotNumber() { return slotNumber; }
    public void setSlotNumber(String slotNumber) { this.slotNumber = slotNumber; }

    public SlotStatus getStatus() { return status; }
    public void setStatus(SlotStatus status) { this.status = status; }

    public VehicleType getVehicleType() { return vehicleType; }
    public void setVehicleType(VehicleType vehicleType) { this.vehicleType = vehicleType; }

    public Long getLotId() { return lotId; }
    public void setLotId(Long lotId) { this.lotId = lotId; }

    public String getCurrentBookingId() { return currentBookingId; }
    public void setCurrentBookingId(String currentBookingId) { this.currentBookingId = currentBookingId; }

    public String getFloor() { return floor; }
    public void setFloor(String floor) { this.floor = floor; }

    public Integer getSlotIndex() { return slotIndex; }
    public void setSlotIndex(Integer slotIndex) { this.slotIndex = slotIndex; }
}
