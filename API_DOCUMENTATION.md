# Your-Destination Real-Time Bus Tracking API (Phase 2)

Base URL: `http://localhost:5000/api`
Interactive Swagger Documentation: `http://localhost:5000/api-docs`

---

## 📖 Swagger OpenAPI Documentation
Open `http://localhost:5000/api-docs` in any web browser to view, test, and execute all interactive endpoints.

---

## 🔐 1. Authentication (`/auth`)

### Register User
- **Method:** `POST /api/auth/register`
- **Body:** `{ "name": "John Doe", "email": "john@example.com", "password": "password123", "role": "USER" }`

### Login User
- **Method:** `POST /api/auth/login`
- **Body:** `{ "email": "john@example.com", "password": "password123" }`

### Update Profile
- **Method:** `PUT /api/auth/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** `{ "name": "John New", "password": "newpassword123" }`

---

## ⏱️ 2. Estimated Arrival Time (ETA) Engine (`/eta`)

### Get Stop-Wise Bus ETA Predictions
- **Method:** `GET /api/eta/bus/:busId`
- **Description:** Returns stop-by-stop Haversine distance, travel time estimates, delay adjustments, and countdown text.

### Get Upcoming Buses at a Stop
- **Method:** `GET /api/eta/stop/:stopId`
- **Description:** Returns upcoming active buses approaching a specific stop ordered by arrival time.

---

## 🗺️ 3. Route Search & Journey Planner (`/journey`)

### Plan Journey
- **Method:** `POST /api/journey/plan`
- **Body:** `{ "origin": "City Bus Terminal", "destination": "Tech Park Metro" }`
- **Description:** Searches transit routes connecting origin and destination, providing direct & transfer options, estimated travel duration, total distance, next bus ETAs, and recommendation badges.

---

## 📍 4. Nearby Bus Stop Finder (`/nearby`)

### Find Nearby Bus Stops
- **Method:** `GET /api/nearby/stops?lat=13.3409&lng=77.1005&radius=5`
- **Description:** Returns nearby bus stops within search radius sorted by distance from user GPS coordinates, along with upcoming bus ETAs at each stop.

---

## 🔔 5. Real-Time Notifications & Service Alerts (`/notifications`)

### Get Notifications
- **Method:** `GET /api/notifications`
- **Description:** Returns active delay warnings, approaching alerts, and system broadcasts with unread count.

### Broadcast Service Alert (Admin)
- **Method:** `POST /api/notifications/alert`
- **Body:** `{ "title": "Route 101 Traffic Delay", "message": "Delay of 5 mins near Commercial Street", "type": "DELAY" }`

---

## 📊 6. Tracking Dashboard Analytics (`/analytics`)

### Get Dashboard Metrics & Bus Performance Stats
- **Method:** `GET /api/analytics/dashboard`
- **Description:** Returns active buses count, on-time percentage, total routes, occupancy rates, and bus fleet performance metrics.

---

## ⚡ 7. Real-Time WebSockets (Socket.IO)

**Connection URL:** `http://localhost:5000`

### Emitted Events (Client & Admin)
- `updateLocation`: `{ busId, routeId, lat, lng, speed, delayMinutes }` - Broadcasts live GPS coordinates.
- `reportDelay`: `{ busId, routeId, delayMinutes, message }` - Reports route delays.

### Listened Events (Passengers)
- `busLocationUpdate`: Triggers live map marker movement.
- `newNotification`: Displays toast notification and updates alert drawer.
