package com.smartparking.service;

import com.smartparking.model.AbstractParkingSlot;
import com.smartparking.model.EVSlot;
import com.smartparking.model.enums.VehicleType;
import org.springframework.stereotype.Component;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

/**
 * OOP - Polymorphism: Different strategy for EVs — prioritizes charging-enabled slots
 * ADA - Algorithms: Filter + sort with charging preference
 */
@Component("priorityEVStrategy")
public class PriorityEVStrategy implements SlotAllocationStrategy {

    @Override
    public Optional<AbstractParkingSlot> allocate(Long lotId, VehicleType vehicleType,
                                                   List<AbstractParkingSlot> availableSlots) {
        if (availableSlots == null || availableSlots.isEmpty()) {
            return Optional.empty();
        }

        // For EVs: prefer slots with charging enabled first
        return availableSlots.stream()
                .filter(slot -> slot.getLotId().equals(lotId) && slot.getVehicleType() == VehicleType.EV)
                .sorted(Comparator
                        .<AbstractParkingSlot, Boolean>comparing(s -> !(s instanceof EVSlot && ((EVSlot) s).isChargingEnabled()))
                        .thenComparingInt(s -> s.getSlotIndex() != null ? s.getSlotIndex() : Integer.MAX_VALUE))
                .findFirst();
    }

    @Override
    public String getStrategyName() {
        return "EV Priority (Charging-First)";
    }
}
