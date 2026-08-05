# Testing Checklist

## Authentication
- [ ] User can register a new account.
- [ ] User can login with valid credentials.
- [ ] User cannot login with invalid credentials.
- [ ] User receives a JWT upon successful login.
- [ ] Role-Based Access Control: Regular users cannot access Admin Dashboard routes.
- [ ] Profile Update: User can update their name and password successfully.

## Bus Management (Admin)
- [ ] Admin can view the list of all buses.
- [ ] Admin can add a new bus with valid details (Reg No, Driver, Status).
- [ ] Status badges update correctly (RUNNING, IDLE, MAINTENANCE).
- [ ] Pagination works when more than 6 buses are added.
- [ ] Search filter successfully filters buses by Reg No or Driver Name.

## Route Management (Admin)
- [ ] Admin can view the list of all routes.
- [ ] Admin can add a new route (Name, Start, Destination).
- [ ] Search filter successfully filters routes by Name.
- [ ] Statistics cards update accurately when a new route is created.

## Stop Management (Admin)
- [ ] Admin can select a route and view its associated stops.
- [ ] Admin can add a new stop to a specific route with Lat/Lng coordinates.
- [ ] Stops list updates immediately after adding a new stop.

## Live Tracking & User Dashboard
- [ ] User Dashboard displays the correct count of active routes and buses.
- [ ] Map loads successfully using CARTO Voyager tiles.
- [ ] Active routes are drawn on the map as polylines.
- [ ] Buses are displayed as markers on the map.
- [ ] (Simulated) Socket.io updates move the bus markers in real-time.
