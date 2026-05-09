package com.smartparking.model;

import com.smartparking.model.enums.VehicleType;

/**
 * OOP - Inheritance: ElectricVehicle extends AbstractVehicle
 * OOP - Polymorphism: Overrides abstract methods with EV-specific behavior
 * EVs get priority allocation and charging station access
 */
public class ElectricVehicle extends AbstractVehicle {

    private boolean needsCharging;

    public ElectricVehicle() {
        super();
        this.vehicleType = VehicleType.EV;
        this.needsCharging = true;
    }

    public ElectricVehicle(String vehicleNumber, String ownerName, boolean needsCharging) {
        super(vehicleNumber, ownerName, VehicleType.EV);
        this.needsCharging = needsCharging;
    }

    @Override
    public String getFuelType() {
        return "Electric";
    }

    @Override
    public String getVehicleCategory() {
        return "Electric Vehicle";
    }

    @Override
    public double getParkingFeeMultiplier() {
        return 0.8; // EVs get a 20% discount to promote green vehicles
    }

    public boolean isNeedsCharging() { return needsCharging; }
    public void setNeedsCharging(boolean needsCharging) { this.needsCharging = needsCharging; }
}
