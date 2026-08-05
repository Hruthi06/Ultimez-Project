import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Route, Bus, MapPin, Plus, LogOut, X, Search, Activity, Users, Settings, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [stops, setStops] = useState([]);
  
  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    if (!userInfo || userInfo.role !== 'ADMIN') {
      // Basic frontend role check
      if (userInfo && userInfo.role === 'USER') {
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    } else {
      fetchData();
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
      toast.error('Failed to fetch dashboard data');
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

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    toast.success('Logged out successfully');
    navigate('/login');
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
    
    // Basic frontend validation
    if (modalType === 'buses' && formData.registrationNumber?.length < 4) {
      toast.error('Bus number is too short');
      setIsLoading(false);
      return;
    }
    
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      
      if (modalType === 'routes') {
        const payload = {
          ...formData,
          path: formData.path ? JSON.parse(formData.path) : [{ lat: 13.3409, lng: 77.1005 }, { lat: 13.35, lng: 77.11 }]
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
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving data');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtering & Pagination Logic
  const filteredRoutes = routes.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredBuses = buses.filter(b => 
    b.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.driverName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const getPaginatedData = (data) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  };
  
  const totalPages = Math.ceil((activeTab === 'routes' ? filteredRoutes.length : filteredBuses.length) / itemsPerPage);

  // Recent Activity (Mocked from DB data for now)
  const recentActivity = [...buses, ...routes]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex overflow-hidden relative">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Sidebar */}
      <div className="w-64 light-glass m-4 flex flex-col p-4 z-10 border border-slate-200 rounded-xl shadow-sm">
        <div className="flex items-center gap-3 mb-10 p-2">
          <div className="bg-primary/10 p-2 rounded-lg text-primary">
            <Bus className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Admin Panel</h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          <button onClick={() => { setActiveTab('dashboard'); setSearchQuery(''); setCurrentPage(1); }} className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-slate-100 text-slate-600'}`}>
            <Activity className="w-5 h-5" /> Overview
          </button>
          <button onClick={() => { setActiveTab('routes'); setSearchQuery(''); setCurrentPage(1); }} className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'routes' ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-slate-100 text-slate-600'}`}>
            <Route className="w-5 h-5" /> Routes
          </button>
          <button onClick={() => { setActiveTab('buses'); setSearchQuery(''); setCurrentPage(1); }} className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'buses' ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-slate-100 text-slate-600'}`}>
            <Bus className="w-5 h-5" /> Buses
          </button>
          <button onClick={() => { setActiveTab('stops'); setSearchQuery(''); setCurrentPage(1); }} className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'stops' ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-slate-100 text-slate-600'}`}>
            <MapPin className="w-5 h-5" /> Stops
          </button>
          <button onClick={() => openModal('profile')} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
            <Settings className="w-5 h-5" /> Profile
          </button>
        </nav>

        <button onClick={handleLogout} className="mt-auto flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 text-red-500 font-semibold transition-colors">
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto z-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={activeTab}>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <h2 className="text-3xl font-bold capitalize text-slate-900">{activeTab === 'dashboard' ? 'System Overview' : `${activeTab} Management`}</h2>
            
            <div className="flex items-center gap-4">
              {(activeTab === 'routes' || activeTab === 'buses') && (
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder={`Search ${activeTab}...`} 
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm w-64 bg-white/50"
                  />
                </div>
              )}
              {activeTab !== 'dashboard' && (
                <button onClick={() => openModal(activeTab)} className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-md text-sm font-medium">
                  <Plus className="w-4 h-4" /> Add New
                </button>
              )}
            </div>
          </div>

          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="bg-blue-50 text-blue-600 p-3 rounded-lg"><Bus className="w-6 h-6" /></div>
                  <div><p className="text-sm text-slate-500 font-medium">Total Buses</p><h3 className="text-2xl font-bold text-slate-900">{buses.length}</h3></div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="bg-green-50 text-green-600 p-3 rounded-lg"><Activity className="w-6 h-6" /></div>
                  <div><p className="text-sm text-slate-500 font-medium">Active Buses</p><h3 className="text-2xl font-bold text-slate-900">{buses.filter(b => b.status === 'RUNNING').length}</h3></div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="bg-purple-50 text-purple-600 p-3 rounded-lg"><Route className="w-6 h-6" /></div>
                  <div><p className="text-sm text-slate-500 font-medium">Total Routes</p><h3 className="text-2xl font-bold text-slate-900">{routes.length}</h3></div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="bg-orange-50 text-orange-600 p-3 rounded-lg"><Users className="w-6 h-6" /></div>
                  <div><p className="text-sm text-slate-500 font-medium">Admin Users</p><h3 className="text-2xl font-bold text-slate-900">1</h3></div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {recentActivity.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                      <div className="bg-slate-50 p-2 rounded-full text-slate-400">
                        {item.registrationNumber ? <Bus className="w-4 h-4" /> : <Route className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm text-slate-800 font-medium">
                          {item.registrationNumber ? `Bus added: ${item.registrationNumber}` : `Route created: ${item.name}`}
                        </p>
                        <p className="text-xs text-slate-400">{new Date(item.createdAt || Date.now()).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  {recentActivity.length === 0 && <p className="text-slate-500 text-sm">No recent activity.</p>}
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'routes' || activeTab === 'buses' || activeTab === 'stops') && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[400px] flex flex-col">
              
              {activeTab === 'routes' && (
                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {getPaginatedData(filteredRoutes).map(route => (
                      <div key={route._id} className="bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-xl font-semibold mb-2 text-slate-800">{route.name}</h3>
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span>{route.startPoint} &rarr; {route.destination}</span>
                        </div>
                      </div>
                    ))}
                    {filteredRoutes.length === 0 && <p className="text-slate-500 col-span-full">No routes found.</p>}
                  </div>
                </div>
              )}

              {activeTab === 'buses' && (
                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {getPaginatedData(filteredBuses).map(bus => (
                      <div key={bus._id} className="bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-bold text-slate-800">{bus.registrationNumber}</h3>
                          <span className={`px-2 py-1 text-[10px] font-bold tracking-wide rounded-full ${
                            bus.status === 'RUNNING' ? 'bg-green-100 text-green-700' : 
                            bus.status === 'MAINTENANCE' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {bus.status}
                          </span>
                        </div>
                        <p className="text-slate-600 text-sm mb-1"><span className="font-medium">Driver:</span> {bus.driverName}</p>
                        <p className="text-slate-600 text-sm"><span className="font-medium">Route:</span> {bus.route?.name || 'Unassigned'}</p>
                      </div>
                    ))}
                    {filteredBuses.length === 0 && <p className="text-slate-500 col-span-full">No buses found.</p>}
                  </div>
                </div>
              )}

              {activeTab === 'stops' && (
                <div className="flex-1">
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Select a Route to view its stops</label>
                    <select 
                      value={selectedRouteId} 
                      onChange={(e) => setSelectedRouteId(e.target.value)}
                      className="w-full md:w-1/3 p-2.5 border border-slate-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-white text-sm"
                    >
                      <option value="">-- Select Route --</option>
                      {routes.map(r => (
                        <option key={r._id} value={r._id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  {selectedRouteId ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {stops.map(stop => (
                        <div key={stop._id} className="bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-sm flex items-start gap-3">
                          <div className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                            {stop.stopOrder}
                          </div>
                          <div>
                            <h3 className="text-md font-semibold text-slate-800">{stop.name}</h3>
                            <p className="text-slate-500 text-xs mt-1">Lat: {stop.latitude}, Lng: {stop.longitude}</p>
                          </div>
                        </div>
                      ))}
                      {stops.length === 0 && <p className="text-slate-500 text-sm">No stops found for this route.</p>}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-48 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                      <p className="text-slate-400">Please select a route above to view stops.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Pagination Controls */}
              {(activeTab === 'routes' || activeTab === 'buses') && totalPages > 1 && (
                <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, activeTab === 'routes' ? filteredRoutes.length : filteredBuses.length)} of {activeTab === 'routes' ? filteredRoutes.length : filteredBuses.length} results
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded bg-slate-100 text-slate-600 disabled:opacity-50 hover:bg-slate-200 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded bg-slate-100 text-slate-600 disabled:opacity-50 hover:bg-slate-200 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Dynamic Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-xl font-bold text-slate-900 capitalize">
                  {modalType === 'profile' ? 'Update Profile' : `Add New ${modalType.slice(0, -1)}`}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                
                {modalType === 'profile' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                      <input type="text" name="name" defaultValue={userInfo.name} onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">New Password <span className="text-slate-400 font-normal">(Leave blank to keep current)</span></label>
                      <input type="password" name="password" minLength={8} onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm" placeholder="Min. 8 characters" />
                    </div>
                  </>
                )}

                {modalType === 'routes' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Route Name</label>
                      <input type="text" name="name" required onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm" placeholder="e.g. Route 1" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Start Point</label>
                      <input type="text" name="startPoint" required onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm" placeholder="e.g. Central Station" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Destination</label>
                      <input type="text" name="destination" required onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm" placeholder="e.g. Airport" />
                    </div>
                  </>
                )}

                {modalType === 'buses' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Registration Number</label>
                      <input type="text" name="registrationNumber" required minLength={4} onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm" placeholder="e.g. KA-01-AB-1234" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Driver Name</label>
                      <input type="text" name="driverName" required onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm" placeholder="e.g. John Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Assign Route</label>
                      <select name="route" required onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-sm">
                        <option value="">-- Select Route --</option>
                        {routes.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                      <select name="status" required onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-sm">
                        <option value="">-- Select Status --</option>
                        <option value="IDLE">IDLE</option>
                        <option value="RUNNING">RUNNING</option>
                        <option value="MAINTENANCE">MAINTENANCE</option>
                      </select>
                    </div>
                  </>
                )}

                {modalType === 'stops' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Stop Name</label>
                      <input type="text" name="name" required onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm" placeholder="e.g. Main Square" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Latitude</label>
                        <input type="number" step="any" name="latitude" required onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm" placeholder="13.3409" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Longitude</label>
                        <input type="number" step="any" name="longitude" required onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm" placeholder="77.1005" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Assign Route</label>
                      <select name="route" required onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-sm">
                        <option value="">-- Select Route --</option>
                        {routes.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Stop Order</label>
                      <input type="number" name="stopOrder" required min="1" onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm" placeholder="1, 2, 3..." />
                    </div>
                  </>
                )}

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setShowModal(false)} disabled={isLoading} className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors disabled:opacity-50 text-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={isLoading} className="flex-1 py-2.5 bg-primary text-white rounded-lg hover:bg-blue-600 font-medium transition-colors shadow-sm disabled:opacity-70 flex justify-center items-center gap-2 text-sm">
                    {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save'}
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
