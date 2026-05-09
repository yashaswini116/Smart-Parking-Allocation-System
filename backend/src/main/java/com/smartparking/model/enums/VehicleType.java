package com.smartparking.model.enums;

public enum VehicleType {
    BIKE("Bike", "🏍️", 20.0),
    CAR("Car", "🚗", 50.0),
    EV("Electric Vehicle", "⚡", 40.0);

    private final String displayName;
    private final String icon;
    private final double hourlyRate;

    VehicleType(String displayName, String icon, double hourlyRate) {
        this.displayName = displayName;
        this.icon = icon;
        this.hourlyRate = hourlyRate;
    }

    public String getDisplayName() { return displayName; }
    public String getIcon() { return icon; }
    public double getHourlyRate() { return hourlyRate; }
}
