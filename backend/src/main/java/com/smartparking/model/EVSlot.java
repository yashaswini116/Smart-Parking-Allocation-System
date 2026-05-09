package com.smartparking.model;

import com.smartparking.model.enums.VehicleType;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

/**
 * OOP - Inheritance: EVSlot extends AbstractParkingSlot
 * EV slots include charging stations and get discounted rates
 */
@Entity
@DiscriminatorValue("EV")
public class EVSlot extends AbstractParkingSlot {

    private static final double EV_RATE_PER_HOUR = 40.0;
    private static final double CHARGING_FEE_PER_HOUR = 15.0;

    private boolean chargingEnabled = true;

    public EVSlot() {
        super();
        setVehicleType(VehicleType.EV);
    }

    public EVSlot(String slotNumber, Long lotId, String floor, Integer slotIndex) {
        super(slotNumber, VehicleType.EV, lotId, floor, slotIndex);
        this.chargingEnabled = true;
    }

    @Override
    public double calculateFee(long durationMinutes) {
        double hours = Math.ceil(durationMinutes / 60.0);
        if (hours < 1) hours = 1;
        double parkingFee = hours * EV_RATE_PER_HOUR;
        double chargingFee = chargingEnabled ? hours * CHARGING_FEE_PER_HOUR : 0;
        return parkingFee + chargingFee;
    }

    @Override
    public String getSlotCategory() {
        return "EV Charging Station";
    }

    @Override
    public boolean supportsCharging() {
        return true;
    }

    public boolean isChargingEnabled() { return chargingEnabled; }
    public void setChargingEnabled(boolean chargingEnabled) { this.chargingEnabled = chargingEnabled; }
}
