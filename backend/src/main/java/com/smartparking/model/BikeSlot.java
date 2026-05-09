package com.smartparking.model;

import com.smartparking.model.enums.VehicleType;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

/**
 * OOP - Inheritance: BikeSlot extends AbstractParkingSlot
 * Bikes have smaller slots and lower fees
 */
@Entity
@DiscriminatorValue("BIKE")
public class BikeSlot extends AbstractParkingSlot {

    private static final double BIKE_RATE_PER_HOUR = 20.0;

    public BikeSlot() {
        super();
        setVehicleType(VehicleType.BIKE);
    }

    public BikeSlot(String slotNumber, Long lotId, String floor, Integer slotIndex) {
        super(slotNumber, VehicleType.BIKE, lotId, floor, slotIndex);
    }

    @Override
    public double calculateFee(long durationMinutes) {
        double hours = Math.ceil(durationMinutes / 60.0);
        if (hours < 1) hours = 1; // Minimum 1 hour charge
        return hours * BIKE_RATE_PER_HOUR;
    }

    @Override
    public String getSlotCategory() {
        return "Bike Parking";
    }

    @Override
    public boolean supportsCharging() {
        return false;
    }
}
