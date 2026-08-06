import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Route,
  Bus,
  MapPin,
  Plus,
  LogOut,
  X,
  Search,
  Activity,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Bell,
  Play,
  BarChart3,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Radio,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import BusSimulatorModal from '../components/BusSimulatorModal';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [stops, setStops] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);

  // Broadcast Alert Form State
  const [alertData, setAlertData] = useState({ title: '', message: '', type: 'SERVICE_UPDATE' });
  const [showAlertModal, setShowAlertModal] = useState(false);

  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    if (!userInfo || userInfo.role !== 'ADMIN') {
      if (userInfo && userInfo.role === 'USER') {
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    } else {
      fetchData();
      fetchAnalytics();
    }
  }, [navigate]);

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data: routeData } = await axios.get('http://localhost:5000/api/routes', config);
      const { data: busData } = await axios.get('http://localhost:5000/api/buses', config);
      setRoutes(routeData);
      setBuses(busData);
    } catch (error) {
      toast.error('Failed to fetch admin data');
    }
  };

  const fetchAnalytics = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/analytics/dashboard');
      setAnalytics(data);
    } catch (error) {
      console.error('Analytics error:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'stops' && selectedRouteId) {
      fetchStops(selectedRouteId);
    }
  }, [activeTab, selectedRouteId]);

  const fetchStops = async (routeId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`http://localhost:5000/api/stops/route/${routeId}`, config);
      setStops(data);
    } catch (error) {
      toast.error('Failed to fetch stops');
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setFormData({});
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (modalType === 'buses' && formData.registrationNumber?.length < 4) {
      toast.error('Bus registration number is too short');
      setIsLoading(false);
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      if (modalType === 'routes') {
        const payload = {
          ...formData,
          path: formData.path ? JSON.parse(formData.path) : [{ lat: 13.3409, lng: 77.1005 }, { lat: 13.35, lng: 77.11 }],
        };
        await axios.post('http://localhost:5000/api/routes', payload, config);
        toast.success('Route created successfully');
      } else if (modalType === 'buses') {
        await axios.post('http://localhost:5000/api/buses', formData, config);
        toast.success('Bus added successfully');
      } else if (modalType === 'stops') {
        await axios.post('http://localhost:5000/api/stops', formData, config);
        toast.success('Stop added successfully');
        if (formData.route === selectedRouteId) fetchStops(selectedRouteId);
      } else if (modalType === 'profile') {
        const { data } = await axios.put('http://localhost:5000/api/auth/profile', formData, config);
        localStorage.setItem('userInfo', JSON.stringify(data));
        toast.success('Profile updated successfully');
      }

      setShowModal(false);
      fetchData();
      fetchAnalytics();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendAlert = async (e) => {
    e.preventDefault();
    if (!alertData.message) {
      toast.error('Please enter an alert message');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/notifications/alert', alertData);
      toast.success('Service alert broadcasted to all passengers!');
      setShowAlertModal(false);
      setAlertData({ title: '', message: '', type: 'SERVICE_UPDATE' });
    } catch (err) {
      toast.error('Could not broadcast alert');
    }
  };

  // Filtering & Pagination
  const filteredRoutes = routes.filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredBuses = buses.filter(
    (b) =>
      b.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.driverName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPaginatedData = (data) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  };

  const totalPages = Math.ceil((activeTab === 'routes' ? filteredRoutes.length : filteredBuses.length) / itemsPerPage);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans relative overflow-x-hidden">
      {/* Top Navbar */}
      <Navbar userInfo={userInfo} onOpenProfile={() => openModal('profile')} />

      {/* Admin Subheader Banner */}
      <div className="bg-slate-900 text-white px-6 lg:px-12 py-6 shadow-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4" /> System Administrator Control Center
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight mt-1">Admin Operations Console</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAlertModal(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
            >
              <Bell className="w-4 h-4" /> Broadcast Service Alert
            </button>
            <button
              onClick={() => setShowSimulator(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
            >
              <Play className="w-4 h-4 fill-current" /> Launch Bus GPS Simulator
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl w-full mx-auto p-4 md:p-8 flex-1 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('analytics');
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'analytics'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <BarChart3 className="w-4 h-4" /> Analytics & Reports
            </button>
            <button
              onClick={() => {
                setActiveTab('buses');
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'buses'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Bus className="w-4 h-4" /> Bus Fleet ({buses.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('routes');
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'routes'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Route className="w-4 h-4" /> Routes ({routes.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('stops');
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'stops'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <MapPin className="w-4 h-4" /> Stops & Schedules
            </button>
          </div>

          <div className="flex items-center gap-3">
            {(activeTab === 'routes' || activeTab === 'buses') && (
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl outline-none focus:border-blue-500 text-sm font-medium w-56"
                />
              </div>
            )}

            {activeTab !== 'analytics' && (
              <button
                onClick={() => openModal(activeTab)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-md flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" /> Add New {activeTab.slice(0, -1)}
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Analytics & Reports */}
        {activeTab === 'analytics' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
                <div className="bg-blue-100 text-blue-600 p-3.5 rounded-2xl">
                  <Bus className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Fleet Buses</h3>
                  <p className="text-3xl font-extrabold text-slate-900">{analytics?.summary?.totalBuses || buses.length}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
                <div className="bg-emerald-100 text-emerald-600 p-3.5 rounded-2xl">
                  <Activity className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Active Running Buses</h3>
                  <p className="text-3xl font-extrabold text-slate-900">
                    {analytics?.summary?.activeBuses || buses.filter((b) => b.status === 'RUNNING').length}
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
                <div className="bg-indigo-100 text-indigo-600 p-3.5 rounded-2xl">
                  <Route className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Transit Routes</h3>
                  <p className="text-3xl font-extrabold text-slate-900">{analytics?.summary?.totalRoutes || routes.length}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
                <div className="bg-emerald-100 text-emerald-700 p-3.5 rounded-2xl">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">On-Time Service Rate</h3>
                  <p className="text-3xl font-extrabold text-slate-900">{analytics?.summary?.onTimePercentage || 96}%</p>
                </div>
              </div>
            </div>

            {/* Bus Performance Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 space-y-4">
              <h3 className="text-lg font-extrabold text-slate-900">Bus Fleet Performance & Occupancy Stats</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-3">Registration #</th>
                      <th className="p-3">Driver Name</th>
                      <th className="p-3">Assigned Route</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Speed</th>
                      <th className="p-3">Delay</th>
                      <th className="p-3">Capacity & Passenger Load</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(analytics?.busPerformance || buses).map((bus, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{bus.registrationNumber}</td>
                        <td className="p-3 font-medium">{bus.driverName}</td>
                        <td className="p-3">{bus.routeName || bus.route?.name || 'Unassigned'}</td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              bus.status === 'RUNNING'
                                ? 'bg-emerald-100 text-emerald-700'
                                : bus.status === 'MAINTENANCE'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {bus.status}
                          </span>
                        </td>
                        <td className="p-3 font-semibold">{bus.speedKmH || bus.speed || 30} km/h</td>
                        <td className="p-3 font-bold text-amber-600">+{bus.delayMinutes || 0} mins</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-blue-600 h-full rounded-full"
                                style={{ width: `${bus.occupancyPercentage || 40}%` }}
                              />
                            </div>
                            <span className="font-bold text-[11px]">{bus.occupancyPercentage || 40}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 2: Bus Management */}
        {activeTab === 'buses' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {getPaginatedData(filteredBuses).map((bus) => (
                <div key={bus._id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-base">{bus.registrationNumber}</h4>
                      <p className="text-xs text-slate-500 font-medium">Driver: {bus.driverName}</p>
                    </div>
                    <span
                      className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full ${
                        bus.status === 'RUNNING'
                          ? 'bg-emerald-100 text-emerald-700'
                          : bus.status === 'MAINTENANCE'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {bus.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <p>Route: <span className="font-bold text-slate-800">{bus.route?.name || 'Unassigned'}</span></p>
                    <p className="mt-1">Delay: <span className="font-bold text-amber-600">+{bus.delayMinutes || 0} mins</span></p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tab 3: Route Management */}
        {activeTab === 'routes' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {getPaginatedData(filteredRoutes).map((route) => (
                <div key={route._id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                  <h4 className="font-extrabold text-slate-900 text-lg">{route.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    <span>{route.startPoint} &rarr; {route.destination}</span>
                  </div>
                  <p className="text-xs text-slate-400">Path coordinates count: {route.path?.length || 0}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tab 4: Stop Management */}
        {activeTab === 'stops' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Route to View & Manage Stops
              </label>
              <select
                value={selectedRouteId}
                onChange={(e) => setSelectedRouteId(e.target.value)}
                className="w-full md:w-1/2 p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold outline-none focus:border-blue-500"
              >
                <option value="">-- Select Route --</option>
                {routes.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedRouteId ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {stops.map((stop) => (
                  <div key={stop._id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start gap-3">
                    <div className="bg-blue-600 text-white font-extrabold w-8 h-8 rounded-lg flex items-center justify-center text-sm">
                      {stop.stopOrder}
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-800 text-sm">{stop.name}</h5>
                      <p className="text-slate-400 text-xs mt-0.5">Lat: {stop.latitude}, Lng: {stop.longitude}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 italic border border-dashed border-slate-200 rounded-xl">
                Please select a route above to load stops.
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Broadcast Alert Modal */}
      <AnimatePresence>
        {showAlertModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden"
            >
              <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-amber-50">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-600" />
                  <h3 className="font-extrabold text-slate-900 text-lg">Broadcast Service Alert</h3>
                </div>
                <button onClick={() => setShowAlertModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSendAlert} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Alert Headline Title</label>
                  <input
                    type="text"
                    value={alertData.title}
                    onChange={(e) => setAlertData({ ...alertData, title: e.target.value })}
                    placeholder="e.g. Route 101 Traffic Delay Alert"
                    className="w-full p-3 border border-slate-300 rounded-xl text-sm outline-none focus:border-amber-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Alert Category</label>
                  <select
                    value={alertData.type}
                    onChange={(e) => setAlertData({ ...alertData, type: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold outline-none"
                  >
                    <option value="SERVICE_UPDATE">Service Update</option>
                    <option value="DELAY">Traffic Delay</option>
                    <option value="APPROACHING">Approaching Warning</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Message Content</label>
                  <textarea
                    rows={3}
                    value={alertData.message}
                    onChange={(e) => setAlertData({ ...alertData, message: e.target.value })}
                    placeholder="Enter real-time alert details for passengers..."
                    className="w-full p-3 border border-slate-300 rounded-xl text-sm outline-none focus:border-amber-500 font-medium"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAlertModal(false)}
                    className="flex-1 py-3 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-md text-sm"
                  >
                    Broadcast Alert
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Simulator Modal */}
      <BusSimulatorModal isOpen={showSimulator} onClose={() => setShowSimulator(false)} />

      {/* General Add Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
                <h3 className="text-xl font-extrabold text-slate-900 capitalize">
                  {modalType === 'profile' ? 'Update Admin Profile' : `Add New ${modalType.slice(0, -1)}`}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {modalType === 'buses' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Registration Number</label>
                      <input
                        type="text"
                        name="registrationNumber"
                        required
                        onChange={handleInputChange}
                        className="w-full p-3 border border-slate-300 rounded-xl text-sm font-medium outline-none focus:border-blue-500"
                        placeholder="e.g. KA-01-F-1234"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Driver Name</label>
                      <input
                        type="text"
                        name="driverName"
                        required
                        onChange={handleInputChange}
                        className="w-full p-3 border border-slate-300 rounded-xl text-sm font-medium outline-none focus:border-blue-500"
                        placeholder="e.g. Ramesh Kumar"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Assign Route</label>
                      <select
                        name="route"
                        required
                        onChange={handleInputChange}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold outline-none"
                      >
                        <option value="">-- Select Route --</option>
                        {routes.map((r) => (
                          <option key={r._id} value={r._id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                      <select
                        name="status"
                        required
                        onChange={handleInputChange}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold outline-none"
                      >
                        <option value="RUNNING">RUNNING</option>
                        <option value="IDLE">IDLE</option>
                        <option value="MAINTENANCE">MAINTENANCE</option>
                      </select>
                    </div>
                  </>
                )}

                {modalType === 'routes' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Route Name</label>
                      <input
                        type="text"
                        name="name"
                        required
                        onChange={handleInputChange}
                        className="w-full p-3 border border-slate-300 rounded-xl text-sm font-medium outline-none focus:border-blue-500"
                        placeholder="e.g. Route 101 - Central Express"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Start Point</label>
                      <input
                        type="text"
                        name="startPoint"
                        required
                        onChange={handleInputChange}
                        className="w-full p-3 border border-slate-300 rounded-xl text-sm font-medium outline-none focus:border-blue-500"
                        placeholder="e.g. City Bus Terminal"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Destination</label>
                      <input
                        type="text"
                        name="destination"
                        required
                        onChange={handleInputChange}
                        className="w-full p-3 border border-slate-300 rounded-xl text-sm font-medium outline-none focus:border-blue-500"
                        placeholder="e.g. Tech Park Metro"
                      />
                    </div>
                  </>
                )}

                {modalType === 'stops' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Stop Name</label>
                      <input
                        type="text"
                        name="name"
                        required
                        onChange={handleInputChange}
                        className="w-full p-3 border border-slate-300 rounded-xl text-sm font-medium outline-none focus:border-blue-500"
                        placeholder="e.g. Civic Hospital"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Latitude</label>
                        <input
                          type="number"
                          step="any"
                          name="latitude"
                          required
                          onChange={handleInputChange}
                          className="w-full p-3 border border-slate-300 rounded-xl text-sm font-medium outline-none"
                          placeholder="13.3409"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Longitude</label>
                        <input
                          type="number"
                          step="any"
                          name="longitude"
                          required
                          onChange={handleInputChange}
                          className="w-full p-3 border border-slate-300 rounded-xl text-sm font-medium outline-none"
                          placeholder="77.1005"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Assign Route</label>
                      <select
                        name="route"
                        required
                        onChange={handleInputChange}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold outline-none"
                      >
                        <option value="">-- Select Route --</option>
                        {routes.map((r) => (
                          <option key={r._id} value={r._id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Stop Order Sequence</label>
                      <input
                        type="number"
                        name="stopOrder"
                        required
                        min="1"
                        onChange={handleInputChange}
                        className="w-full p-3 border border-slate-300 rounded-xl text-sm font-medium outline-none"
                        placeholder="1, 2, 3..."
                      />
                    </div>
                  </>
                )}

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md text-sm flex items-center justify-center gap-2"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Item'}
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

export default AdminDashboard;
