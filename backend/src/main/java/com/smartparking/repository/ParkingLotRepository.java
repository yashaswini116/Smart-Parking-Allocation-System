package com.smartparking.repository;

import com.smartparking.model.ParkingLot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ParkingLotRepository extends JpaRepository<ParkingLot, Long> {
    List<ParkingLot> findByActiveTrue();
    List<ParkingLot> findByCity(String city);
}
