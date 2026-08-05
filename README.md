# Your Destination - Real-Time Bus Tracking App

A modern, real-time bus tracking application designed to help passengers track buses, view estimated arrival times, locate nearby bus stops, and plan journeys efficiently.

## Project Overview
This project simulates the functionality used by modern public transport systems and introduces real-time data processing, location services, maps integration, and scalable backend development.

## Features
- **User Authentication:** JWT-based login and registration.
- **Role-Based Access Control (RBAC):** Separate Admin and User panels.
- **Live Tracking:** Real-time bus location updates using Socket.io.
- **Interactive Map:** Powered by React-Leaflet and CARTO tiles.
- **Admin Dashboard:** Full CRUD management for Buses, Routes, and Stops with pagination and statistics.
- **Profile Management:** Secure password and profile updates.
- **Responsive Design:** Clean, modern "light glass" UI that works on all devices.

## Folder Structure
```
backend/
 ├── controllers/    # Request handlers (logic)
 ├── models/         # Mongoose schema definitions
 ├── routes/         # Express API route definitions
 ├── middleware/     # Auth and security checks
 ├── config/         # Database and environment configurations
 ├── server.js       # Entry point

frontend/
 ├── src/
 │   ├── components/ # Reusable UI components
 │   ├── pages/      # Full views (Login, AdminDashboard, etc.)
 │   ├── App.jsx     # Main React router
 │   └── index.css   # Global styles and tailwind config
```

## Architecture Diagram
```
User
  ↓
React Frontend (UI, React-Leaflet, State)
  ↓
Express API (Security, Routing)
  ↓
JWT Authentication & Socket.io (Real-time)
  ↓
MongoDB (Data Persistence)
```

## Technologies Used
- **Frontend:** React, Tailwind CSS, React-Router-Dom, Framer Motion, Leaflet
- **Backend:** Node.js, Express, Socket.io
- **Database:** MongoDB, Mongoose
- **Security:** Helmet, Express-Rate-Limit, CORS, bcrypt, jsonwebtoken

## Installation & Setup

1. **Clone the repository**
2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```
3. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```
4. **Environment Variables**
   Create a `.env` file in the `backend/` folder:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_key
   ```
5. **Run the Application**
   - Start Backend: `npm run dev` (in backend dir)
   - Start Frontend: `npm run dev` (in frontend dir)