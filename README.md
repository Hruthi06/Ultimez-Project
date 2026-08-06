# 🚌 Your Destination - Real-Time Bus Tracking Application (Phase 2 Completed)

A modern, customer-attractive real-time bus tracking application designed to help passengers track buses live, view estimated arrival times (ETA), locate nearby bus stops, and plan journeys efficiently.

---

## 🌟 Key Features & Phase 2 Deliverables

### ⏱️ 1. Estimated Arrival Time (ETA) System
- **Haversine Distance Calculations:** Precise stop-by-stop distance calculations along active transit routes.
- **Stop-Wise ETA Display:** Countdown predictions (`5 mins`, `Arriving now`) considering real-time bus speeds and delay adjustments.
- **WebSocket Synchronization:** Dynamic real-time updates pushed directly to passenger map interfaces.

### 🗺️ 2. Route Search & Journey Planner
- **Source & Destination Selection:** Instant transit search by stop names or coordinates.
- **Route Recommendations:** Intelligent suggestions tagged with badges (**"Fastest & Direct"**, **"Direct Route"**).
- **Step-by-Step Itinerary:** Clear travel instructions, total distance, duration estimates, and transfer details.

### 📍 3. Nearby Bus Stop Finder
- **GPS Location Detection:** Uses HTML5 Geolocation API with automatic city center fallback.
- **Proximity Distance Badges:** Sorted list of nearby bus stops with exact distance tags (`350 m away`, `1.2 km away`).
- **Upcoming Bus Arrivals:** Displays next arriving buses and countdown ETAs for each nearby stop.

### 🔔 4. Real-Time Notifications & Service Alerts
- **Bus Approaching Alerts:** Instant alerts when tracked buses enter arrival range.
- **Route Delay Alerts:** Delay notifications broadcast by drivers and admins.
- **Interactive Notification Center:** Slide-over drawer with unread badge counters and toast notifications.

### 📊 5. Tracking Dashboard & Fleet Analytics
- **Active Bus Fleet Metrics:** Real-time stats on total running, idle, and maintenance buses.
- **On-Time Performance Rate:** Overall service punctuality metrics and delay history logs.
- **Fleet Occupancy Load:** Live passenger capacity and load percentages.

### ⚡ 6. Real-Time WebSockets & Live GPS Simulator
- **Socket.IO Integration:** Instant broadcast of bus location updates across all connected clients.
- **Built-in Bus Simulator:** Admin modal tool that continuously streams mock GPS coordinates along route paths so markers glide smoothly on the live Leaflet map.

### 🛡️ 7. Security, Validation & API Documentation
- **Interactive Swagger Documentation:** Available at `http://localhost:5000/api-docs`.
- **API Security & Optimization:** Rate limiting, request input validation, Helmet headers, activity logging, and JWT authentication.

---

## 🛠️ Technology Stack

- **Frontend:** React.js, Tailwind CSS, React Leaflet (OpenStreetMap & CARTO Tiles), Framer Motion, Axios, Socket.IO Client, Lucide React, React Hot Toast
- **Backend:** Node.js, Express.js, Socket.IO, Mongoose, Helmet, Express Rate Limit, Morgan
- **Database:** MongoDB / MongoDB Atlas
- **API Documentation:** Swagger UI Express & Swagger JSDoc (OpenAPI 3.0)
- **Authentication:** JWT (JSON Web Tokens) & bcryptjs

---

## 📁 Repository Structure

```text
backend/
 ├── src/
 │   ├── config/         # MongoDB DB & Swagger OpenAPI configurations
 │   ├── controllers/    # Auth, Bus, Route, Stop, ETA, Journey, Nearby, Notification, Analytics
 │   ├── middleware/     # Auth verification & request input validation
 │   ├── models/         # Bus, Route, Stop, Tracking, User, Notification, ActivityLog schemas
 │   └── routes/         # Express API routes
 ├── seedAdmin.js        # Super Admin seeder
 ├── seedPhase2Data.js   # Phase 2 sample route, bus, stop, and alert seeder
 └── server.js          # Express server & Socket.IO WebSockets handler

frontend/
 ├── src/
 │   ├── components/     # Navbar, ETABadge, JourneyPlanner, NearbyStops, NotificationCenter, BusSimulatorModal
 │   ├── pages/          # Login, Register, UserDashboard, AdminDashboard, Tracking
 │   ├── App.jsx         # Main React routing setup
 │   └── index.css       # Tailwind CSS & global styles
```

---

## 🚀 Step-by-Step Running Guide

### 1. Environment Setup
Create a `.env` file inside the `backend/` directory:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/your_destination
JWT_SECRET=ultimez_super_secret_jwt_key_2026
```

### 2. Start Backend Server & Seed Data
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Seed Phase 2 Sample Routes, Stops, Buses, Alerts & Admin Account
node seedPhase2Data.js
node seedAdmin.js

# Start Express Backend Server
npm run dev
```
- Backend runs on: `http://localhost:5000`
- Interactive Swagger API Specs: `http://localhost:5000/api-docs`

### 3. Start Frontend Development Server
Open a new terminal tab/window:
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite Frontend Dev Server
npm run dev
```
- Frontend app runs on: `http://localhost:5173`

---

## 🔑 Demo & Testing Credentials

- **Super Admin Credentials:**
  - **Email:** `admin@ultimez.com`
  - **Password:** `admin123`
  - *Access:* Admin Operations Console, Fleet Analytics, Service Alert Broadcast, Live GPS Bus Simulator.

- **Passenger Account:**
  - Register a new passenger account on the registration page or log in as a passenger.
  - *Access:* Passenger Portal Overview, Journey Planner, Nearby Bus Stop Finder, Live Bus Tracking Map.