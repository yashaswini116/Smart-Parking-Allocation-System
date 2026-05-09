package com.smartparking.repository;

import com.smartparking.model.Booking;
import com.smartparking.model.enums.BookingStatus;
import com.smartparking.model.enums.VehicleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, String> {
    List<Booking> findByUserIdOrderByBookingTimeDesc(Long userId);
    List<Booking> findByLotId(Long lotId);
    List<Booking> findByLotIdAndStatus(Long lotId, BookingStatus status);
    List<Booking> findByStatus(BookingStatus status);
    long countByLotIdAndStatus(Long lotId, BookingStatus status);
    long countByLotIdAndVehicleTypeAndStatus(Long lotId, VehicleType vehicleType, BookingStatus status);
}
