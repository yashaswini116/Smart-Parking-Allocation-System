package com.smartparking.model;

import com.smartparking.model.enums.BookingStatus;
import com.smartparking.model.enums.VehicleType;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    private String id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long lotId;

    @Column(nullable = false)
    private Long slotId;

    private String lotName;
    private String slotNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleType vehicleType;

    @Column(nullable = false)
    private String vehicleNumber;

    private String ownerName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status = BookingStatus.PENDING;

    private LocalDateTime bookingTime = LocalDateTime.now();
    private LocalDateTime entryTime;
    private LocalDateTime exitTime;

    private Double amount;
    private String paymentId;
    private boolean paymentDone = false;

    private String userName;
    private String userPhone;

    public Booking() {}

    public Booking(String id, Long userId, Long lotId, Long slotId,
                   VehicleType vehicleType, String vehicleNumber,
                   String lotName, String slotNumber) {
        this.id = id;
        this.userId = userId;
        this.lotId = lotId;
        this.slotId = slotId;
        this.vehicleType = vehicleType;
        this.vehicleNumber = vehicleNumber;
        this.lotName = lotName;
        this.slotNumber = slotNumber;
    }

    public long getDurationMinutes() {
        if (entryTime == null || exitTime == null) return 0;
        return ChronoUnit.MINUTES.between(entryTime, exitTime);
    }

    // Getters & Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getLotId() { return lotId; }
    public void setLotId(Long lotId) { this.lotId = lotId; }
    public Long getSlotId() { return slotId; }
    public void setSlotId(Long slotId) { this.slotId = slotId; }
    public String getLotName() { return lotName; }
    public void setLotName(String lotName) { this.lotName = lotName; }
    public String getSlotNumber() { return slotNumber; }
    public void setSlotNumber(String slotNumber) { this.slotNumber = slotNumber; }
    public VehicleType getVehicleType() { return vehicleType; }
    public void setVehicleType(VehicleType vehicleType) { this.vehicleType = vehicleType; }
    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }
    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }
    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { this.status = status; }
    public LocalDateTime getBookingTime() { return bookingTime; }
    public void setBookingTime(LocalDateTime bookingTime) { this.bookingTime = bookingTime; }
    public LocalDateTime getEntryTime() { return entryTime; }
    public void setEntryTime(LocalDateTime entryTime) { this.entryTime = entryTime; }
    public LocalDateTime getExitTime() { return exitTime; }
    public void setExitTime(LocalDateTime exitTime) { this.exitTime = exitTime; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public String getPaymentId() { return paymentId; }
    public void setPaymentId(String paymentId) { this.paymentId = paymentId; }
    public boolean isPaymentDone() { return paymentDone; }
    public void setPaymentDone(boolean paymentDone) { this.paymentDone = paymentDone; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public String getUserPhone() { return userPhone; }
    public void setUserPhone(String userPhone) { this.userPhone = userPhone; }
}
