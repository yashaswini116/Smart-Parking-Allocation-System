package com.smartparking.service.impl;

import com.smartparking.model.Booking;
import com.smartparking.model.Payment;
import com.smartparking.model.enums.BookingStatus;
import com.smartparking.model.enums.PaymentStatus;
import com.smartparking.repository.BookingRepository;
import com.smartparking.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Payment service — simulates secure payment processing.
 * Supports: CARD, UPI, WALLET, CASH
 */
@Service
@Transactional
public class PaymentServiceImpl {

    @Autowired private PaymentRepository paymentRepository;
    @Autowired private BookingRepository bookingRepository;

    public Map<String, Object> processPayment(Map<String, Object> request) {
        String bookingId = request.get("bookingId").toString();
        Long userId = Long.parseLong(request.get("userId").toString());
        String method = request.getOrDefault("method", "CARD").toString();

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        double amount = booking.getAmount() != null ? booking.getAmount() : 0;

        String paymentId = "PAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String txnId = "TXN" + System.currentTimeMillis();

        Payment payment = new Payment(paymentId, bookingId, userId, amount, method);
        payment.setTransactionId(txnId);
        payment.setTimestamp(LocalDateTime.now());

        // Simulate payment processing (mock success)
        boolean success = simulatePayment(method, request);

        if (success) {
            payment.setStatus(PaymentStatus.SUCCESS);
            if (method.equals("CARD")) {
                String card = request.getOrDefault("cardNumber", "****").toString();
                payment.setCardLastFour(card.length() >= 4 ? card.substring(card.length() - 4) : "****");
            } else if (method.equals("UPI")) {
                payment.setUpiId(request.getOrDefault("upiId", "user@upi").toString());
            }

            booking.setPaymentDone(true);
            booking.setPaymentId(paymentId);
            if (booking.getStatus() == BookingStatus.COMPLETED) {
                // Payment done, all good
            }
            bookingRepository.save(booking);
        } else {
            payment.setStatus(PaymentStatus.FAILED);
        }

        paymentRepository.save(payment);

        Map<String, Object> result = new HashMap<>();
        result.put("paymentId", paymentId);
        result.put("transactionId", txnId);
        result.put("amount", amount);
        result.put("method", method);
        result.put("status", payment.getStatus().name());
        result.put("bookingId", bookingId);
        result.put("timestamp", payment.getTimestamp().toString());
        result.put("success", success);
        return result;
    }

    public Map<String, Object> getPaymentByBooking(String bookingId) {
        Optional<Payment> paymentOpt = paymentRepository.findByBookingId(bookingId);
        if (paymentOpt.isEmpty()) return Map.of("message", "No payment found");
        Payment p = paymentOpt.get();
        return Map.of(
                "paymentId", p.getId(),
                "bookingId", p.getBookingId(),
                "amount", p.getAmount(),
                "method", p.getMethod() != null ? p.getMethod() : "",
                "status", p.getStatus().name(),
                "transactionId", p.getTransactionId() != null ? p.getTransactionId() : "",
                "timestamp", p.getTimestamp().toString()
        );
    }

    public List<Map<String, Object>> getPaymentsByUser(Long userId) {
        return paymentRepository.findByUserId(userId).stream().map(p -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("paymentId", p.getId());
            dto.put("bookingId", p.getBookingId());
            dto.put("amount", p.getAmount());
            dto.put("method", p.getMethod());
            dto.put("status", p.getStatus().name());
            dto.put("transactionId", p.getTransactionId());
            dto.put("timestamp", p.getTimestamp().toString());
            return dto;
        }).toList();
    }

    private boolean simulatePayment(String method, Map<String, Object> request) {
        // Simulate 95% success rate for all methods
        int randomChance = new Random().nextInt(100);
        return randomChance < 95;
    }
}
