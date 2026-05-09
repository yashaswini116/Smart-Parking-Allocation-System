package com.smartparking.service;

import com.smartparking.model.AbstractParkingSlot;
import com.smartparking.model.enums.VehicleType;
import org.springframework.stereotype.Component;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

/**
 * ADA - Algorithms: Greedy nearest-index-first allocation
 * OOP - Polymorphism: Implements SlotAllocationStrategy
 * Picks the slot with the smallest slotIndex (closest to entrance)
 */
@Component("nearestAvailableStrategy")
public class NearestAvailableStrategy implements SlotAllocationStrategy {

    @Override
    public Optional<AbstractParkingSlot> allocate(Long lotId, VehicleType vehicleType,
                                                   List<AbstractParkingSlot> availableSlots) {
        if (availableSlots == null || availableSlots.isEmpty()) {
            return Optional.empty();
        }
        // ADA - Data Structure: Comparator with sorted stream (O(n log n))
        // Greedy: always pick the slot with lowest index (nearest to entry gate)
        return availableSlots.stream()
                .filter(slot -> slot.getLotId().equals(lotId) && slot.getVehicleType() == vehicleType)
                .min(Comparator.comparingInt(s -> s.getSlotIndex() != null ? s.getSlotIndex() : Integer.MAX_VALUE));
    }

    @Override
    public String getStrategyName() {
        return "Nearest Available (Greedy)";
    }
}
