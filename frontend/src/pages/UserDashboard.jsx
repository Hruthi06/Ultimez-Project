import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, MapPin, Search, LogOut, Clock, Route, Settings, X, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [routes, setRoutes] = useState([]);

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

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    toast.success('Logged out successfully');
    navigate('/login');
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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row overflow-hidden relative">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Sidebar */}
      <div className="w-full md:w-72 light-glass m-4 flex flex-col p-6 z-10 border border-slate-200 rounded-xl shadow-sm">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-primary/10 p-3 rounded-xl text-primary">
            <Map className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Your Destination</h1>
            <p className="text-xs text-slate-500">Passenger Portal</p>
          </div>
        </div>
        
        <div className="mb-8">
          <p className="text-slate-500 text-sm mb-1">Welcome back,</p>
          <h2 className="text-2xl font-bold text-slate-900 capitalize">{userInfo.name}</h2>
        </div>

        <nav className="flex-1 space-y-3">
          <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-primary/10 text-primary font-semibold transition-colors">
            <Search className="w-5 h-5" /> Dashboard
          </button>
          <button onClick={() => navigate('/tracking')} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
            <MapPin className="w-5 h-5" /> Live Tracking
          </button>
          <button onClick={() => { setFormData({}); setShowProfile(true); }} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
            <Settings className="w-5 h-5" /> Profile Settings
          </button>
        </nav>

        <button onClick={handleLogout} className="mt-auto flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 text-red-500 font-semibold transition-colors">
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto z-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-3xl font-bold text-slate-900">Overview</h2>
            <button onClick={() => navigate('/tracking')} className="bg-primary hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-md font-medium">
              <MapPin className="w-5 h-5" /> Track Buses Now
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
              <div className="bg-blue-50 text-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Route className="w-6 h-6" />
              </div>
              <h3 className="text-slate-500 text-sm font-medium">Available Routes</h3>
              <p className="text-3xl font-bold text-slate-900">{routes.length}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden">
              <div className="bg-emerald-50 text-emerald-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-slate-500 text-sm font-medium">Live Services</h3>
              <p className="text-3xl font-bold text-slate-900">Active</p>
              <div className="absolute top-6 right-6 w-3 h-3 bg-green-500 rounded-full animate-ping" />
            </div>
          </div>

          <h3 className="text-xl font-bold text-slate-900 mb-4">Explore Routes</h3>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[300px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {routes.map(route => (
                <div key={route._id} className="bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-pointer" onClick={() => navigate('/tracking')}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-slate-800 group-hover:text-primary transition-colors">{route.name}</h3>
                    <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">ETA: ~15 mins</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-3">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{route.startPoint} &rarr; {route.destination}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-400">Total Distance: Est. 12 km</p>
                    <button className="text-sm text-primary font-medium flex items-center gap-1">
                      View on Map
                    </button>
                  </div>
                </div>
              ))}
              {routes.length === 0 && <p className="text-slate-500">No routes currently available.</p>}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfile && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-xl font-bold text-slate-900">Profile Settings</h3>
                <button onClick={() => setShowProfile(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleProfileSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input type="text" value={userInfo.email} disabled className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 text-sm cursor-not-allowed" />
                  <p className="text-xs text-slate-400 mt-1">Email cannot be changed.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input type="text" name="name" defaultValue={userInfo.name} onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">New Password <span className="text-slate-400 font-normal">(Leave blank to keep current)</span></label>
                  <input type="password" name="password" minLength={8} onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm" placeholder="Min. 8 characters" />
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setShowProfile(false)} disabled={isLoading} className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors disabled:opacity-50 text-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={isLoading} className="flex-1 py-2.5 bg-primary text-white rounded-lg hover:bg-blue-600 font-medium transition-colors shadow-sm disabled:opacity-70 flex justify-center items-center gap-2 text-sm">
                    {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Profile'}
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
