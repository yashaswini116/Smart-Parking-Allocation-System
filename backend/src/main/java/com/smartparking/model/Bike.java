package com.smartparking.model;

import com.smartparking.model.enums.VehicleType;

/**
 * OOP - Inheritance: Bike extends AbstractVehicle
 * OOP - Polymorphism: Overrides abstract methods from AbstractVehicle
 */
public class Bike extends AbstractVehicle {

    public Bike() {
        super();
        this.vehicleType = VehicleType.BIKE;
    }

    public Bike(String vehicleNumber, String ownerName) {
        super(vehicleNumber, ownerName, VehicleType.BIKE);
    }

    @Override
    public String getFuelType() {
        return "Petrol/Diesel";
    }

    @Override
    public String getVehicleCategory() {
        return "Bike";
    }

    @Override
    public double getParkingFeeMultiplier() {
        return 0.5; // Bikes pay half the base rate
    }
}
