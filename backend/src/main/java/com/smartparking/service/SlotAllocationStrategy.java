package com.smartparking.service;

import com.smartparking.model.AbstractParkingSlot;
import com.smartparking.model.enums.VehicleType;
import java.util.List;
import java.util.Optional;

/**
 * ADA - Abstraction: Strategy interface for smart slot allocation
 * OOP - Polymorphism: Different strategies implement this interface differently
 * Design Pattern: Strategy Pattern
 */
public interface SlotAllocationStrategy {
    /**
     * Allocate the best available slot for a given vehicle type in a lot.
     * @param lotId the parking lot ID
     * @param vehicleType the type of vehicle
     * @param availableSlots list of available slots to choose from
     * @return the best slot, or empty if none available
     */
    Optional<AbstractParkingSlot> allocate(Long lotId, VehicleType vehicleType,
                                           List<AbstractParkingSlot> availableSlots);

    String getStrategyName();
}
