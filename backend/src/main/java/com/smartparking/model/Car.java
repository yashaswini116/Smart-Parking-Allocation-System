package com.smartparking.model;

import com.smartparking.model.enums.VehicleType;

/**
 * OOP - Inheritance: Car extends AbstractVehicle
 * OOP - Polymorphism: Overrides abstract methods from AbstractVehicle
 */
public class Car extends AbstractVehicle {

    public Car() {
        super();
        this.vehicleType = VehicleType.CAR;
    }

    public Car(String vehicleNumber, String ownerName) {
        super(vehicleNumber, ownerName, VehicleType.CAR);
    }

    @Override
    public String getFuelType() {
        return "Petrol/Diesel/CNG";
    }

    @Override
    public String getVehicleCategory() {
        return "Car";
    }

    @Override
    public double getParkingFeeMultiplier() {
        return 1.0; // Standard rate
    }
}
