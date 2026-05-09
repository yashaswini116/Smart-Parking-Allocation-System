# 🅿️ SmartPark — Intelligent Parking Allocation System

SmartPark is a robust, full-stack parking management solution designed to streamline the parking experience for users and provide powerful monitoring tools for administrators. Built with a focus on **Object-Oriented Programming (OOP)** principles and **Advanced Data Structures**, it offers real-time slot allocation, interactive mapping, and secure payment processing.

---

## 🚀 Features

### 👤 User Features
- **📍 Nearby Search**: Find the nearest parking lots using live geolocation and the Haversine distance formula.
* **🗺️ Interactive Map**: Visualize parking availability with color-coded markers on a dynamic Leaflet map.
- **📅 Smart Booking**: Instant booking for **Bikes**, **Cars**, and **Electric Vehicles (EV)**.
- **⚡ EV Charging Support**: Dedicated slots for electric vehicles with charging capability tracking.
- **💳 Multi-Method Payments**: Secure simulated payments via Credit/Debit Cards, UPI, Wallets, or Cash.
- **📋 Parking History**: Keep track of all your past and active bookings, including entry/exit timings and fees.
- **⏳ Waiting Queue**: Automated FIFO queue management when parking lots reach full capacity.

### 🛡️ Admin Suite
- **📊 Analytics Dashboard**: Monitor global occupancy rates, active sessions, and recent system activity.
- **🔍 Real-Time Monitor**: Drill down into specific parking lots to see detailed slot maps and status updates.
- **🏢 Lot Management**: Full CRUD capabilities to manage parking lot configurations, rates, and capacities.
- **⚙️ Manual Overrides**: Ability to override slot statuses for maintenance or emergency reservations.

---

## 🛠️ Technology Stack

### **Backend (Java Spring Boot)**
- **Java 17** with Spring Boot 3.2+
- **Spring Data JPA** for robust database interaction.
- **H2 In-Memory Database** for high-performance data persistence.
- **OOP Principles**:
    - **Abstraction**: Base classes for vehicles and slots.
    - **Inheritance**: Specialized entities for different vehicle and slot types.
    - **Polymorphism**: Dynamic fee calculation and allocation strategies.
- **Allocation Strategy Pattern**: Switch between `NearestAvailable` and `PriorityEV` strategies.

### **Frontend (React)**
- **Vite** for lightning-fast development.
- **Vanilla CSS** with a custom design system (Dark Mode, Glassmorphism).
- **React Leaflet** for interactive map integration.
- **Lucide React** for modern, crisp iconography.

---

## 🏗️ Architecture (ADA & OOP)

The system is designed with a strong focus on **ADA (Abstraction, Data structures, Algorithms)**:
- **Algorithms**: Implements the **Haversine formula** for geodesic distance calculations between user and lots.
- **Data Structures**:
    - `PriorityBlockingQueue` for thread-safe waiting queue management.
    - `ConcurrentHashMap` for high-concurrency real-time monitor caching.
- **Patterns**: Uses the **Strategy Design Pattern** for flexible slot allocation logic.

---

## 🏁 Getting Started

### Prerequisites
- **JDK 17** or higher
- **Node.js** (v18+)
- **Maven**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yashaswini116/Smart-Parking-Allocation-System.git
   cd Smart-Parking-Allocation-System
   ```

2. **Run the Backend**:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   *The API will be available at `http://localhost:8080/api`*

3. **Run the Frontend**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
   *The application will be available at `http://localhost:5173/`*

---

## 🔑 Demo Access

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@smartpark.com` | `admin123` |
| **User** | `yasha@gmail.com` | `user123` |

---

## 📸 Screenshots

*(Add screenshots here after deployment)*

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---

**Developed with ❤️ by [Yashaswini](https://github.com/yashaswini116)**
