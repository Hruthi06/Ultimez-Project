const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const routeRoutes = require('./src/routes/routeRoutes');
const busRoutes = require('./src/routes/busRoutes');
const stopRoutes = require('./src/routes/stopRoutes');
const trackingRoutes = require('./src/routes/trackingRoutes');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
app.use(helmet());
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/stops', stopRoutes);
app.use('/api/tracking', trackingRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Socket.io for Real-Time Tracking
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Listen for bus location updates and broadcast to clients
  socket.on('updateLocation', (data) => {
    // Expected data: { busId, routeId, lat, lng }
    io.emit('busLocationUpdate', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.get('/', (req, res) => {
  res.send('Your Destination API is running...');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
