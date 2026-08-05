const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./src/models/User');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/your_destination';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log(`MongoDB Connected to ${MONGO_URI}`);
    
    // Delete existing admin if any or update password
    await User.deleteOne({ email: 'admin@ultimez.com' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    await User.create({
      name: 'Super Admin',
      email: 'admin@ultimez.com',
      password: hashedPassword,
      role: 'ADMIN'
    });
    
    console.log('Admin user created/reset successfully in your_destination database!');
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
