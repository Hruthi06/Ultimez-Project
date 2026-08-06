const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Route = require('./src/models/Route');
const Stop = require('./src/models/Stop');
const Bus = require('./src/models/Bus');
const Notification = require('./src/models/Notification');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/your_destination';

const sampleRoutes = [
  {
    name: 'Route 101 - Central Express',
    startPoint: 'City Bus Terminal',
    destination: 'Tech Park Metro',
    path: [
      { lat: 13.3409, lng: 77.1005 },
      { lat: 13.3450, lng: 77.1050 },
      { lat: 13.3500, lng: 77.1100 },
      { lat: 13.3550, lng: 77.1150 },
      { lat: 13.3600, lng: 77.1200 },
    ],
  },
  {
    name: 'Route 202 - Metro Shuttle',
    startPoint: 'Railway Station',
    destination: 'University Circle',
    path: [
      { lat: 13.3300, lng: 77.0900 },
      { lat: 13.3350, lng: 77.0950 },
      { lat: 13.3400, lng: 77.1000 },
      { lat: 13.3480, lng: 77.1080 },
    ],
  },
];

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for Phase 2 data seeding...');

    // Clear existing routes, stops, buses, notifications
    await Route.deleteMany({});
    await Stop.deleteMany({});
    await Bus.deleteMany({});
    await Notification.deleteMany({});

    console.log('Cleared existing data.');

    // Seed Routes
    const createdRoutes = await Route.insertMany(sampleRoutes);
    console.log(`Created ${createdRoutes.length} routes.`);

    const route1 = createdRoutes[0];
    const route2 = createdRoutes[1];

    // Seed Stops
    const stopsData = [
      // Route 1 Stops
      { name: 'City Bus Terminal', latitude: 13.3409, longitude: 77.1005, route: route1._id, stopOrder: 1 },
      { name: 'Commercial Street', latitude: 13.3450, longitude: 77.1050, route: route1._id, stopOrder: 2 },
      { name: 'Civic Hospital', latitude: 13.3500, longitude: 77.1100, route: route1._id, stopOrder: 3 },
      { name: 'Tech Park Metro', latitude: 13.3600, longitude: 77.1200, route: route1._id, stopOrder: 4 },

      // Route 2 Stops
      { name: 'Railway Station', latitude: 13.3300, longitude: 77.0900, route: route2._id, stopOrder: 1 },
      { name: 'Market Square', latitude: 13.3350, longitude: 77.0950, route: route2._id, stopOrder: 2 },
      { name: 'City Bus Terminal Junction', latitude: 13.3400, longitude: 77.1000, route: route2._id, stopOrder: 3 },
      { name: 'University Circle', latitude: 13.3480, longitude: 77.1080, route: route2._id, stopOrder: 4 },
    ];

    const createdStops = await Stop.insertMany(stopsData);
    console.log(`Created ${createdStops.length} stops.`);

    // Seed Buses
    const busesData = [
      {
        registrationNumber: 'KA-01-F-1234',
        driverName: 'Ramesh Kumar',
        route: route1._id,
        status: 'RUNNING',
        currentLocation: { lat: 13.3420, lng: 77.1020 },
        speed: 35,
        delayMinutes: 2,
        capacity: 45,
        currentPassengers: 28,
      },
      {
        registrationNumber: 'KA-01-F-5678',
        driverName: 'Suresh Patil',
        route: route1._id,
        status: 'RUNNING',
        currentLocation: { lat: 13.3510, lng: 77.1110 },
        speed: 30,
        delayMinutes: 0,
        capacity: 45,
        currentPassengers: 14,
      },
      {
        registrationNumber: 'KA-02-E-9900',
        driverName: 'Anil Gowda',
        route: route2._id,
        status: 'RUNNING',
        currentLocation: { lat: 13.3360, lng: 77.0960 },
        speed: 28,
        delayMinutes: 4,
        capacity: 50,
        currentPassengers: 32,
      },
      {
        registrationNumber: 'KA-02-E-1122',
        driverName: 'Vikram Singh',
        route: route2._id,
        status: 'IDLE',
        currentLocation: { lat: 13.3300, lng: 77.0900 },
        speed: 0,
        delayMinutes: 0,
        capacity: 50,
        currentPassengers: 0,
      },
    ];

    const createdBuses = await Bus.insertMany(busesData);
    console.log(`Created ${createdBuses.length} buses.`);

    // Seed Notifications
    const notificationData = [
      {
        title: 'Route 101 On Time',
        message: 'Bus KA-01-F-1234 is currently running on schedule towards Tech Park Metro.',
        type: 'GENERAL',
      },
      {
        title: 'Minor Traffic Delay',
        message: 'Route 202 experiencing a 4-minute delay near Market Square due to heavy traffic.',
        type: 'DELAY',
        route: route2._id,
      },
      {
        title: 'Upcoming Service Enhancement',
        message: 'New electric buses will be deployed on Central Express routes starting next week.',
        type: 'SERVICE_UPDATE',
      },
    ];

    await Notification.insertMany(notificationData);
    console.log('Created sample notifications.');

    console.log('Phase 2 Data Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding Phase 2 data:', error);
    process.exit(1);
  }
};

seedData();
