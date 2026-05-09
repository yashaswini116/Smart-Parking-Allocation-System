package com.smartparking.repository;

import com.smartparking.model.AbstractParkingSlot;
import com.smartparking.model.enums.SlotStatus;
import com.smartparking.model.enums.VehicleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SlotRepository extends JpaRepository<AbstractParkingSlot, Long> {
    List<AbstractParkingSlot> findByLotId(Long lotId);
    List<AbstractParkingSlot> findByLotIdAndVehicleType(Long lotId, VehicleType vehicleType);
    List<AbstractParkingSlot> findByLotIdAndVehicleTypeAndStatus(Long lotId, VehicleType vehicleType, SlotStatus status);
    long countByLotIdAndVehicleTypeAndStatus(Long lotId, VehicleType vehicleType, SlotStatus status);
    long countByLotIdAndStatus(Long lotId, SlotStatus status);
    Optional<AbstractParkingSlot> findFirstByLotIdAndVehicleTypeAndStatus(Long lotId, VehicleType vehicleType, SlotStatus status);
}
