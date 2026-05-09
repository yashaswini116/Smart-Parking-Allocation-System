package com.smartparking.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "parking_lots")
public class ParkingLot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private double latitude;

    @Column(nullable = false)
    private double longitude;

    private String imageUrl;
    private String description;

    // Capacity per vehicle type
    private int totalBikeSlots;
    private int totalCarSlots;
    private int totalEvSlots;

    // Hourly rates
    private double bikeHourlyRate = 20.0;
    private double carHourlyRate = 50.0;
    private double evHourlyRate = 55.0;

    private boolean active = true;
    private String openHours = "24/7";
    private String contactPhone;

    private LocalDateTime createdAt = LocalDateTime.now();

    public ParkingLot() {}

    public ParkingLot(String name, String address, String city,
                      double latitude, double longitude,
                      int totalBikeSlots, int totalCarSlots, int totalEvSlots) {
        this.name = name;
        this.address = address;
        this.city = city;
        this.latitude = latitude;
        this.longitude = longitude;
        this.totalBikeSlots = totalBikeSlots;
        this.totalCarSlots = totalCarSlots;
        this.totalEvSlots = totalEvSlots;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }
    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public int getTotalBikeSlots() { return totalBikeSlots; }
    public void setTotalBikeSlots(int totalBikeSlots) { this.totalBikeSlots = totalBikeSlots; }
    public int getTotalCarSlots() { return totalCarSlots; }
    public void setTotalCarSlots(int totalCarSlots) { this.totalCarSlots = totalCarSlots; }
    public int getTotalEvSlots() { return totalEvSlots; }
    public void setTotalEvSlots(int totalEvSlots) { this.totalEvSlots = totalEvSlots; }
    public double getBikeHourlyRate() { return bikeHourlyRate; }
    public void setBikeHourlyRate(double bikeHourlyRate) { this.bikeHourlyRate = bikeHourlyRate; }
    public double getCarHourlyRate() { return carHourlyRate; }
    public void setCarHourlyRate(double carHourlyRate) { this.carHourlyRate = carHourlyRate; }
    public double getEvHourlyRate() { return evHourlyRate; }
    public void setEvHourlyRate(double evHourlyRate) { this.evHourlyRate = evHourlyRate; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public String getOpenHours() { return openHours; }
    public void setOpenHours(String openHours) { this.openHours = openHours; }
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public int getTotalCapacity() {
        return totalBikeSlots + totalCarSlots + totalEvSlots;
    }
}
