import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import io from 'socket.io-client';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Bus, Clock, Radio, Play, ChevronRight, X, Sparkles, Layers } from 'lucide-react';
import Navbar from '../components/Navbar';
import ETABadge from '../components/ETABadge';
import BusSimulatorModal from '../components/BusSimulatorModal';
import toast from 'react-hot-toast';

// Custom icons using standard Leaflet DivIcon with inline SVG styling
const createBusIcon = (isMoving = true) =>
  L.divIcon({
    className: 'custom-bus-marker',
    html: `
      <div class="relative flex items-center justify-center w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-full shadow-lg border-2 border-white ring-4 ring-blue-500/20">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 6v6"/>
          <path d="M16 6v6"/>
          <path d="M4 12v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6"/>
          <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6H4Z"/>
          <path d="M6 18h.01"/>
          <path d="M18 18h.01"/>
        </svg>
        ${isMoving ? '<span class="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-ping"></span>' : ''}
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

const createStopIcon = () =>
  L.divIcon({
    className: 'custom-stop-marker',
    html: `
      <div class="w-6 h-6 bg-white border-2 border-emerald-600 rounded-full flex items-center justify-center shadow-md">
        <div class="w-2.5 h-2.5 bg-emerald-600 rounded-full"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

const socket = io('http://localhost:5000');

// Recenter Map Helper component
const MapRecenter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 13, { duration: 1.2 });
    }
  }, [center, map]);
  return null;
};

const Tracking = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState('all');
  const [selectedBusEta, setSelectedBusEta] = useState(null);
  const [activeBusId, setActiveBusId] = useState(null);
  const [showSimulator, setShowSimulator] = useState(false);
  const [mapCenter, setMapCenter] = useState([13.3409, 77.1005]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('userInfo'));
    setUserInfo(user || { name: 'Passenger', role: 'USER' });

    fetchInitialData();

    // Socket listener for live bus movement updates
    socket.on('busLocationUpdate', (data) => {
      setBuses((prevBuses) => {
        const index = prevBuses.findIndex((b) => b._id === data.busId);
        if (index > -1) {
          const updated = [...prevBuses];
          updated[index] = {
            ...updated[index],
            lat: data.lat,
            lng: data.lng,
            speed: data.speed || updated[index].speed,
            delayMinutes: data.delayMinutes !== undefined ? data.delayMinutes : updated[index].delayMinutes,
          };
          return updated;
        }
        return prevBuses;
      });
    });

    socket.on('delayAlert', (data) => {
      toast.error(`Delay Alert: ${data.message || 'Traffic delay reported on route'}`);
    });

    return () => {
      socket.off('busLocationUpdate');
      socket.off('delayAlert');
    };
  }, []);

  const fetchInitialData = async () => {
    try {
      const { data: routeData } = await axios.get('http://localhost:5000/api/routes');
      setRoutes(routeData);

      const { data: busData } = await axios.get('http://localhost:5000/api/buses');

      const formattedBuses = busData.map((b, idx) => ({
        ...b,
        lat: b.currentLocation?.lat || 13.3409 + idx * 0.005,
        lng: b.currentLocation?.lng || 77.1005 + idx * 0.005,
      }));
      setBuses(formattedBuses);

      const { data: stopData } = await axios.get('http://localhost:5000/api/stops');
      setStops(stopData);
    } catch (error) {
      console.error('Error fetching tracking data:', error);
    }
  };

  const handleSelectBus = async (bus) => {
    setActiveBusId(bus._id);
    setMapCenter([bus.lat, bus.lng]);

    try {
      const { data } = await axios.get(`http://localhost:5000/api/eta/bus/${bus._id}`);
      setSelectedBusEta(data);
    } catch (err) {
      toast.error('Could not load stop-wise ETA for this bus');
    }
  };

  const filteredBuses = selectedRoute === 'all' ? buses : buses.filter((b) => b.route?._id === selectedRoute || b.route === selectedRoute);
  const selectedRouteObj = selectedRoute !== 'all' ? routes.find((r) => r._id === selectedRoute) : null;
  const filteredStops = selectedRoute === 'all' ? stops : stops.filter((s) => s.route?._id === selectedRoute || s.route === selectedRoute);

  return (
    <div className="h-screen w-full flex flex-col bg-slate-900 overflow-hidden font-sans">
      {/* Top Navbar */}
      <Navbar userInfo={userInfo} onOpenProfile={() => {}} />

      {/* Main Map Container */}
      <div className="flex-1 w-full h-full flex flex-col md:flex-row relative">
        {/* Floating Sidebar Controls */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full md:w-96 bg-white/95 backdrop-blur-xl z-[500] p-5 m-3 rounded-2xl shadow-2xl border border-slate-200/80 flex flex-col max-h-[85vh] md:max-h-[calc(100vh-100px)] overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-blue-600" /> Live Bus Tracker
              </h2>
              <p className="text-xs text-slate-500">Real-time arrival prediction engine</p>
            </div>
            <button
              onClick={() => setShowSimulator(true)}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Live Simulator
            </button>
          </div>

          {/* Route Filter Dropdown */}
          <div className="space-y-1.5 mb-4">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Filter by Route</label>
            <select
              value={selectedRoute}
              onChange={(e) => {
                setSelectedRoute(e.target.value);
                setSelectedBusEta(null);
              }}
              className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl p-2.5 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all"
            >
              <option value="all">🚌 All Active Transit Routes</option>
              {routes.map((route) => (
                <option key={route._id} value={route._id}>
                  {route.name} ({route.startPoint} &rarr; {route.destination})
                </option>
              ))}
            </select>
          </div>

          {/* Active Buses List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Active Buses ({filteredBuses.length})</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                Live Socket Active
              </span>
            </h3>

            {filteredBuses.map((bus) => (
              <div
                key={bus._id}
                onClick={() => handleSelectBus(bus)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  activeBusId === bus._id
                    ? 'bg-blue-50/90 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                      <Bus className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900 text-sm">{bus.registrationNumber}</p>
                      <p className="text-[11px] text-slate-500">{bus.driverName}</p>
                    </div>
                  </div>
                  <ETABadge etaText={`${bus.speed || 30} km/h`} delayMinutes={bus.delayMinutes || 0} size="small" />
                </div>

                <div className="flex justify-between items-center text-xs text-slate-600 pt-2 border-t border-slate-200/60 mt-2">
                  <span>Route: {bus.route?.name || 'Central Route'}</span>
                  <span className="font-bold text-blue-600 flex items-center gap-0.5">
                    View ETAs <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Stop-wise ETA Panel */}
          {selectedBusEta && (
            <div className="mt-4 pt-4 border-t border-slate-200 bg-slate-50 -mx-5 -mb-5 p-5 max-h-56 overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" /> Stop-wise ETA ({selectedBusEta.registrationNumber})
                </h4>
                <button onClick={() => setSelectedBusEta(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                {selectedBusEta.stops?.map((stop, sIdx) => (
                  <div key={sIdx} className="bg-white p-2.5 rounded-lg border border-slate-200/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800">{stop.stopOrder}. {stop.stopName}</span>
                      <span className="text-slate-400 text-[10px] block">{stop.distanceKm} km away</span>
                    </div>
                    <ETABadge etaText={stop.etaText} size="small" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Map Canvas */}
        <div className="flex-1 h-full w-full z-0 relative">
          <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%', zIndex: 0 }}>
            <MapRecenter center={mapCenter} />
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; OpenStreetMap contributors &copy; CARTO'
            />

            {/* Active Bus Markers */}
            {filteredBuses.map((bus) => (
              <Marker key={bus._id} position={[bus.lat, bus.lng]} icon={createBusIcon(true)}>
                <Popup>
                  <div className="p-1 text-slate-800">
                    <h3 className="font-extrabold text-base text-blue-700">{bus.registrationNumber}</h3>
                    <p className="text-xs font-semibold text-slate-600">Driver: {bus.driverName}</p>
                    <p className="text-xs text-slate-500">Route: {bus.route?.name || 'Local Route'}</p>
                    <p className="text-xs text-emerald-600 font-bold mt-1">Status: Running (~{bus.speed || 30} km/h)</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Route Polyline Path */}
            {selectedRouteObj && selectedRouteObj.path && selectedRouteObj.path.length > 0 && (
              <Polyline
                positions={selectedRouteObj.path.map((p) => [p.lat, p.lng])}
                color="#2563eb"
                weight={6}
                opacity={0.8}
              />
            )}

            {/* Route Stops */}
            {filteredStops.map((stop) => (
              <Marker key={stop._id} position={[stop.latitude, stop.longitude]} icon={createStopIcon()}>
                <Popup>
                  <div className="p-1 text-slate-800">
                    <h4 className="font-bold text-sm text-emerald-700">{stop.name}</h4>
                    <p className="text-xs text-slate-500">Stop Sequence #: {stop.stopOrder}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Simulator Modal */}
      <BusSimulatorModal isOpen={showSimulator} onClose={() => setShowSimulator(false)} />
    </div>
  );
};

export default Tracking;
