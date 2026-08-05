import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import Tracking from './pages/Tracking';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Admin Dashboard */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        {/* User Dashboard */}
        <Route path="/dashboard" element={<UserDashboard />} />
        {/* Tracking Map */}
        <Route path="/tracking" element={<Tracking />} />
      </Routes>
    </Router>
  );
}

export default App;
