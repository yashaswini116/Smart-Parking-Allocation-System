package com.smartparking.controller;

import com.smartparking.model.ParkingLot;
import com.smartparking.service.impl.ParkingServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/lots")
@CrossOrigin(origins = "*")
public class ParkingController {

    @Autowired private ParkingServiceImpl parkingService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllLots() {
        return ResponseEntity.ok(parkingService.getAllLots());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getLotById(@PathVariable Long id) {
        return ResponseEntity.ok(parkingService.getLotById(id));
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<Map<String, Object>>> getNearbyLots(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "10.0") double radius) {
        return ResponseEntity.ok(parkingService.getNearbyLots(lat, lng, radius));
    }

    @GetMapping("/{id}/slots")
    public ResponseEntity<List<Map<String, Object>>> getSlotsByLot(@PathVariable Long id) {
        return ResponseEntity.ok(parkingService.getSlotsByLot(id));
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<Map<String, Object>> getLotAvailability(@PathVariable Long id) {
        return ResponseEntity.ok(parkingService.getLotAvailability(id));
    }

    @PostMapping
    public ResponseEntity<ParkingLot> createLot(@RequestBody ParkingLot lot) {
        return ResponseEntity.ok(parkingService.saveLot(lot));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ParkingLot> updateLot(@PathVariable Long id, @RequestBody ParkingLot lot) {
        lot.setId(id);
        return ResponseEntity.ok(parkingService.saveLot(lot));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteLot(@PathVariable Long id) {
        boolean deleted = parkingService.deleteLot(id);
        return ResponseEntity.ok(Map.of("deleted", deleted, "id", id));
    }

    @PutMapping("/slots/{slotId}/status")
    public ResponseEntity<Map<String, Object>> updateSlotStatus(
            @PathVariable Long slotId,
            @RequestParam String status) {
        return ResponseEntity.ok(parkingService.updateSlotStatus(slotId, status));
    }
}
