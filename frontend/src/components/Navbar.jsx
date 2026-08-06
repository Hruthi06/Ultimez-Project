import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Map, Bell, User, LogOut, Compass, Navigation, BarChart3, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import NotificationCenter from './NotificationCenter';

const Navbar = ({ userInfo, onOpenProfile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotificationCount();
    const interval = setInterval(fetchNotificationCount, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotificationCount = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/notifications');
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      // Ignore initial load fetch errors if backend restarting
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const isAdmin = userInfo?.role === 'ADMIN';

  return (
    <>
      <header className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm px-4 lg:px-8 py-3.5 flex items-center justify-between transition-all">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(isAdmin ? '/admin-dashboard' : '/dashboard')}>
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white p-2.5 rounded-xl shadow-md shadow-blue-500/20">
            <Map className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Your Destination
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                Phase 2
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">Real-Time Transit & Journey Planner</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
          {!isAdmin ? (
            <>
              <button
                onClick={() => navigate('/dashboard')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  location.pathname === '/dashboard'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Compass className="w-4 h-4" /> Overview
              </button>
              <button
                onClick={() => navigate('/tracking')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  location.pathname === '/tracking'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Navigation className="w-4 h-4" /> Live Tracking
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/admin-dashboard')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  location.pathname === '/admin-dashboard'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <ShieldCheck className="w-4 h-4" /> Admin Console
              </button>
              <button
                onClick={() => navigate('/tracking')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  location.pathname === '/tracking'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Navigation className="w-4 h-4" /> Live Map
              </button>
            </>
          )}
        </nav>

        {/* Right Quick Actions */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <button
            onClick={() => setShowNotifications(true)}
            className="relative p-2.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-all border border-slate-200/60"
            title="Notifications & Alerts"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Info */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm uppercase">
                {userInfo?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-slate-800 capitalize leading-tight">{userInfo?.name || 'Passenger'}</p>
                <p className="text-[10px] font-medium text-slate-500 uppercase">{userInfo?.role || 'Passenger'}</p>
              </div>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Notification Center Drawer */}
      <NotificationCenter isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </>
  );
};

export default Navbar;
