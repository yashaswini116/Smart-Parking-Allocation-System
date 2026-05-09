package com.smartparking.model;

import com.smartparking.model.enums.VehicleType;
import jakarta.persistence.MappedSuperclass;

/**
 * ADA - Abstraction: AbstractVehicle defines the contract for all vehicle types.
 * OOP - Inheritance: Bike, Car, ElectricVehicle extend this class.
 * OOP - Polymorphism: getFuelType() and getIcon() are overridden by subclasses.
 */
@MappedSuperclass
public abstract class AbstractVehicle {

    protected String vehicleNumber;
    protected String ownerName;
    protected VehicleType vehicleType;

    public AbstractVehicle() {}

    public AbstractVehicle(String vehicleNumber, String ownerName, VehicleType vehicleType) {
        this.vehicleNumber = vehicleNumber;
        this.ownerName = ownerName;
        this.vehicleType = vehicleType;
    }

    // Abstract methods — must be overridden by each vehicle subclass (Polymorphism)
    public abstract String getFuelType();
    public abstract String getVehicleCategory();
    public abstract double getParkingFeeMultiplier();

    // Concrete methods shared by all vehicles
    public String getFormattedNumber() {
        return vehicleNumber != null ? vehicleNumber.toUpperCase() : "N/A";
    }

    public boolean isElectric() {
        return vehicleType == VehicleType.EV;
    }

    // Getters and Setters (Encapsulation)
    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

    public VehicleType getVehicleType() { return vehicleType; }
    public void setVehicleType(VehicleType vehicleType) { this.vehicleType = vehicleType; }

    @Override
    public String toString() {
        return String.format("%s[%s] owned by %s", getVehicleCategory(), vehicleNumber, ownerName);
    }
}
