package com.smartparking.controller;

import com.smartparking.service.impl.ParkingServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired private ParkingServiceImpl parkingService;

    @GetMapping("/monitor")
    public ResponseEntity<Map<String, Object>> getMonitorData() {
        return ResponseEntity.ok(parkingService.getAdminMonitorData());
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        return ResponseEntity.ok(parkingService.getAdminMonitorData());
    }
}
