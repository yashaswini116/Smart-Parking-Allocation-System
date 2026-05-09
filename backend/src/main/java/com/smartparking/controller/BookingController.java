package com.smartparking.controller;

import com.smartparking.service.impl.BookingServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired private BookingServiceImpl bookingService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createBooking(@RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(bookingService.createBooking(request));
    }

    @PutMapping("/{bookingId}/entry")
    public ResponseEntity<Map<String, Object>> recordEntry(@PathVariable String bookingId) {
        return ResponseEntity.ok(bookingService.recordEntry(bookingId));
    }

    @PutMapping("/{bookingId}/exit")
    public ResponseEntity<Map<String, Object>> recordExit(@PathVariable String bookingId) {
        return ResponseEntity.ok(bookingService.recordExit(bookingId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getUserBookings(@PathVariable Long userId) {
        return ResponseEntity.ok(bookingService.getUserBookings(userId));
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<Map<String, Object>> getBooking(@PathVariable String bookingId) {
        return ResponseEntity.ok(bookingService.getBookingById(bookingId));
    }

    @DeleteMapping("/{bookingId}")
    public ResponseEntity<Map<String, Object>> cancelBooking(@PathVariable String bookingId) {
        boolean cancelled = bookingService.cancelBooking(bookingId);
        return ResponseEntity.ok(Map.of("cancelled", cancelled, "bookingId", bookingId));
    }

    @GetMapping("/waiting/{lotId}/{vehicleType}")
    public ResponseEntity<Map<String, Object>> getWaitingQueue(
            @PathVariable Long lotId,
            @PathVariable String vehicleType) {
        return ResponseEntity.ok(bookingService.getWaitingQueue(lotId, vehicleType));
    }
}
