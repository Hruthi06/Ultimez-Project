const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./src/config/swagger');

const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const routeRoutes = require('./src/routes/routeRoutes');
const busRoutes = require('./src/routes/busRoutes');
const stopRoutes = require('./src/routes/stopRoutes');
const trackingRoutes = require('./src/routes/trackingRoutes');
const etaRoutes = require('./src/routes/etaRoutes');
const journeyRoutes = require('./src/routes/journeyRoutes');
const nearbyRoutes = require('./src/routes/nearbyRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Security and Logging Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // relaxed limit for real-time app usage
});
app.use(limiter);

app.use(cors());
app.use(express.json());

// API Documentation UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/stops', stopRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/eta', etaRoutes);
app.use('/api/journey', journeyRoutes);
app.use('/api/nearby', nearbyRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Store io reference for controllers
app.set('socketio', io);

// Socket.io for Real-Time Tracking & Simulation
io.on('connection', (socket) => {
  console.log('⚡ New client connected:', socket.id);
  
  // Listen for bus location updates and broadcast to all connected passengers
  socket.on('updateLocation', (data) => {
    // Expected data: { busId, routeId, lat, lng, speed, delayMinutes }
    io.emit('busLocationUpdate', data);
  });

  // Listen for bus delay events broadcast by driver/admin
  socket.on('reportDelay', (data) => {
    io.emit('delayAlert', data);
  });

  // Listen for approaching bus alerts
  socket.on('busApproaching', (data) => {
    io.emit('approachingAlert', data);
  });

  socket.on('disconnect', () => {
    console.log('⚡ Client disconnected:', socket.id);
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Your Destination Phase 2 API is running successfully!',
    documentation: 'http://localhost:5000/api-docs',
    status: 'ACTIVE',
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📖 API Documentation available at http://localhost:${PORT}/api-docs`);
});

