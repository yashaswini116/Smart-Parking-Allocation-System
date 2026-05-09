package com.smartparking.model;

import com.smartparking.model.enums.VehicleType;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

/**
 * OOP - Inheritance: CarSlot extends AbstractParkingSlot
 * Standard car slot with full-rate pricing
 */
@Entity
@DiscriminatorValue("CAR")
public class CarSlot extends AbstractParkingSlot {

    private static final double CAR_RATE_PER_HOUR = 50.0;

    public CarSlot() {
        super();
        setVehicleType(VehicleType.CAR);
    }

    public CarSlot(String slotNumber, Long lotId, String floor, Integer slotIndex) {
        super(slotNumber, VehicleType.CAR, lotId, floor, slotIndex);
    }

    @Override
    public double calculateFee(long durationMinutes) {
        double hours = Math.ceil(durationMinutes / 60.0);
        if (hours < 1) hours = 1;
        return hours * CAR_RATE_PER_HOUR;
    }

    @Override
    public String getSlotCategory() {
        return "Car Parking";
    }

    @Override
    public boolean supportsCharging() {
        return false;
    }
}
