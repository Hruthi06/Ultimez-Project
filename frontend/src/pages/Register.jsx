import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Bus, Mail, Lock, User } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', { name, email, password });
      localStorage.setItem('userInfo', JSON.stringify(res.data));
      if (res.data.role === 'ADMIN') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md light-glass p-8 relative z-10"
      >
        <div className="flex justify-center mb-6">
          <div className="bg-primary/20 p-4 rounded-full">
            <Bus className="w-12 h-12 text-primary" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-center mb-2 text-slate-800">Create Account</h2>
        <p className="text-slate-500 text-center mb-8">Join Your Destination today</p>
        
        <form onSubmit={handleRegister} className="space-y-6">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className="w-full bg-white/50 border border-slate-300 rounded-lg py-3 px-10 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:bg-white transition-colors shadow-sm"
              required
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full bg-white/50 border border-slate-300 rounded-lg py-3 px-10 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:bg-white transition-colors shadow-sm"
              required
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-white/50 border border-slate-300 rounded-lg py-3 px-10 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:bg-white transition-colors shadow-sm"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_25px_rgba(59,130,246,0.7)]"
          >
            Register
          </button>
        </form>

        <p className="text-center mt-6 text-slate-500">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Login here</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
