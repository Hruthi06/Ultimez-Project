import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map,
  MapPin,
  Search,
  LogOut,
  Clock,
  Route as RouteIcon,
  Settings,
  X,
  Loader2,
  Navigation,
  Compass,
  Bell,
  Sparkles,
  Bus,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import JourneyPlanner from '../components/JourneyPlanner';
import NearbyStops from '../components/NearbyStops';
import ETABadge from '../components/ETABadge';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Profile Modal State
  const [showProfile, setShowProfile] = useState(false);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('userInfo'));
    if (!user) {
      navigate('/login');
    } else {
      setUserInfo(user);
      fetchRoutes();
    }
  }, [navigate]);

  const fetchRoutes = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/routes');
      setRoutes(data);
    } catch (error) {
      toast.error('Error fetching routes');
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.put('http://localhost:5000/api/auth/profile', formData, config);

      localStorage.setItem('userInfo', JSON.stringify(data));
      setUserInfo(data);
      toast.success('Profile updated successfully');
      setShowProfile(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!userInfo) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans relative overflow-x-hidden">
      {/* Top Navbar */}
      <Navbar userInfo={userInfo} onOpenProfile={() => setShowProfile(true)} />

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 text-white px-6 lg:px-12 py-8 relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-blue-300 text-xs font-bold uppercase tracking-widest mb-2">
              <Sparkles className="w-4 h-4 text-blue-400" /> Welcome to Phase 2 Passenger Portal
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">
              Hello, <span className="capitalize text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200">{userInfo.name}</span>
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Track live bus locations, calculate stop-wise ETAs, find nearby bus stops, and plan your journey seamlessly.
            </p>
          </div>

          <button
            onClick={() => navigate('/tracking')}
            className="self-start md:self-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Navigation className="w-5 h-5" /> Open Live Tracking Map
          </button>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto p-4 md:p-8 flex-1 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <Compass className="w-4 h-4" /> Overview & Routes
          </button>
          <button
            onClick={() => setActiveTab('planner')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'planner'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <RouteIcon className="w-4 h-4" /> Journey Planner
          </button>
          <button
            onClick={() => setActiveTab('nearby')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'nearby'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <MapPin className="w-4 h-4" /> Nearby Bus Stops
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
                <div className="bg-blue-100 text-blue-600 p-3.5 rounded-2xl">
                  <RouteIcon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Active Transit Routes</h3>
                  <p className="text-3xl font-extrabold text-slate-900">{routes.length}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between relative overflow-hidden">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-100 text-emerald-600 p-3.5 rounded-2xl">
                    <Clock className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">WebSocket Live Engine</h3>
                    <p className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                      Connected <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
                <div className="bg-indigo-100 text-indigo-600 p-3.5 rounded-2xl">
                  <Bus className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Estimated Precision</h3>
                  <p className="text-3xl font-extrabold text-slate-900">~98.5%</p>
                </div>
              </div>
            </div>

            {/* Explore Routes Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-extrabold text-slate-900">Available Bus Routes</h3>
                <span className="text-xs text-slate-500">Click route to open live map tracking</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {routes.map((route) => (
                  <div
                    key={route._id}
                    onClick={() => navigate('/tracking')}
                    className="bg-white hover:bg-blue-50/30 p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all group cursor-pointer space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {route.name}
                      </h4>
                      <ETABadge etaText="~5-10 mins" size="small" />
                    </div>

                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                      <MapPin className="w-4 h-4 text-emerald-500" />
                      <span className="font-semibold">{route.startPoint}</span>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                      <span className="font-semibold">{route.destination}</span>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                      <span className="text-slate-400">Path stops: {route.path?.length || 5} points</span>
                      <span className="text-blue-600 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Track Route Live &rarr;
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'planner' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <JourneyPlanner onSelectRouteForTracking={() => navigate('/tracking')} />
          </motion.div>
        )}

        {activeTab === 'nearby' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <NearbyStops onSelectStopForMap={() => navigate('/tracking')} />
          </motion.div>
        )}
      </main>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfile && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
                <h3 className="text-xl font-extrabold text-slate-900">Profile Settings</h3>
                <button onClick={() => setShowProfile(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleProfileSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="text"
                    value={userInfo.email}
                    disabled
                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-100 text-slate-500 text-sm font-medium cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={userInfo.name}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-slate-300 rounded-xl text-sm font-medium outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    New Password <span className="text-slate-400 font-normal">(Leave blank to keep current)</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    minLength={8}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-slate-300 rounded-xl text-sm font-medium outline-none focus:border-blue-500"
                    placeholder="Min. 8 characters"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowProfile(false)}
                    className="flex-1 py-3 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserDashboard;
