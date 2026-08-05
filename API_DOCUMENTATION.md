# API Documentation

Base URL: `http://localhost:5000/api`

## Authentication (`/auth`)

### Register User
- **Method:** `POST /auth/register`
- **Body:** `{ "name": "John Doe", "email": "john@example.com", "password": "password123", "role": "USER" }`
- **Response:** `{ "_id": "...", "name": "...", "email": "...", "token": "..." }`

### Login User
- **Method:** `POST /auth/login`
- **Body:** `{ "email": "john@example.com", "password": "password123" }`
- **Response:** `{ "_id": "...", "name": "...", "email": "...", "role": "USER", "token": "..." }`

### Update Profile
- **Method:** `PUT /auth/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** `{ "name": "John New", "password": "newpassword123" }`
- **Response:** Updated user object with new token.

---

## Routes (`/routes`)

### Get All Routes
- **Method:** `GET /routes`
- **Response:** Array of Route objects.

### Create Route (Admin Only)
- **Method:** `POST /routes`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Body:** `{ "name": "Route 1", "startPoint": "A", "destination": "B", "path": [...] }`

---

## Buses (`/buses`)

### Get All Buses
- **Method:** `GET /buses`
- **Response:** Array of Bus objects.

### Create Bus (Admin Only)
- **Method:** `POST /buses`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Body:** `{ "registrationNumber": "KA-01", "driverName": "Doe", "route": "<route_id>", "status": "RUNNING" }`

---

## Stops (`/stops`)

### Get Stops by Route
- **Method:** `GET /stops/route/:routeId`
- **Response:** Array of Stop objects sorted by stopOrder.

### Create Stop (Admin Only)
- **Method:** `POST /stops`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Body:** `{ "name": "Central", "latitude": 12.9, "longitude": 77.5, "route": "<route_id>", "stopOrder": 1 }`
