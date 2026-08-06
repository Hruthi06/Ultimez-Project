import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, AlertTriangle, Clock, CheckCircle2, Info, Radio } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const NotificationCenter = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('http://localhost:5000/api/notifications');
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`);
      setNotifications(notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
      toast.success('Notification marked as read');
    } catch (err) {
      toast.error('Could not update notification');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'DELAY':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'APPROACHING':
        return <Radio className="w-5 h-5 text-emerald-500 animate-pulse" />;
      case 'SERVICE_UPDATE':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex justify-end bg-slate-900/40 backdrop-blur-xs">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Notifications & Alerts</h3>
                  <p className="text-xs text-slate-500">Live service updates & bus warnings</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading ? (
                <div className="p-8 text-center text-slate-400 text-sm">Loading alerts...</div>
              ) : notifications.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400" />
                  <p className="font-medium text-slate-600">No active notifications</p>
                  <p className="text-xs text-slate-400 mt-1">You are all caught up with travel updates.</p>
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item._id}
                    className={`p-4 rounded-xl border transition-all ${
                      item.isRead
                        ? 'bg-slate-50/60 border-slate-200/60 opacity-75'
                        : 'bg-white border-blue-100 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="mt-0.5">{getIcon(item.type)}</div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed mb-2.5">{item.message}</p>

                        {!item.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(item._id)}
                            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 text-center text-xs text-slate-400">
              Updates in real time via Socket.IO
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default NotificationCenter;
