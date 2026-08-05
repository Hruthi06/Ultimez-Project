import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import io from 'socket.io-client';
import axios from 'axios';
import { motion } from 'framer-motion';

const customIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png', // Bus icon
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

const socket = io('http://localhost:5000');

const Tracking = () => {
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState('all');

  useEffect(() => {
    fetchInitialData();

    socket.on('busLocationUpdate', (data) => {
      setBuses((prevBuses) => {
        const busIndex = prevBuses.findIndex((b) => b._id === data.busId);
        if (busIndex > -1) {
          const newBuses = [...prevBuses];
          newBuses[busIndex] = { ...newBuses[busIndex], lat: data.lat, lng: data.lng };
          return newBuses;
        }
        return prevBuses;
      });
    });

    return () => {
      socket.off('busLocationUpdate');
    };
  }, []);

  const fetchInitialData = async () => {
    try {
      const { data: routeData } = await axios.get('http://localhost:5000/api/routes');
      setRoutes(routeData);
      
      const { data: busData } = await axios.get('http://localhost:5000/api/buses');
      
      const activeBuses = busData.filter(b => b.status === 'RUNNING').map(b => ({
        ...b,
        lat: 13.3409, 
        lng: 77.1005 + (Math.random() * 0.01),
      }));
      setBuses(activeBuses);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (selectedRoute !== 'all') {
      fetchStops(selectedRoute);
    } else {
      setStops([]);
    }
  }, [selectedRoute]);

  const fetchStops = async (routeId) => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/stops/route/${routeId}`);
      setStops(data);
    } catch (error) {
      console.error('Error fetching stops:', error);
    }
  };

  const filteredBuses = selectedRoute === 'all' ? buses : buses.filter(b => b.route?._id === selectedRoute);
  
  // Find the selected route object to draw its path
  const selectedRouteObj = selectedRoute !== 'all' ? routes.find(r => r._id === selectedRoute) : null;

  return (
    <div className="h-screen w-full flex flex-col md:flex-row bg-slate-50 overflow-hidden relative">
      {/* Sidebar overlay for Route Selection */}
      <motion.div 
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-full md:w-80 h-auto md:h-full light-glass z-[1000] p-6 m-4 absolute md:relative top-0 left-0 border border-slate-200"
      >
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Live Tracking</h2>
        
        <div className="space-y-4">
          <label className="text-slate-700 text-sm font-semibold">Select Route</label>
          <select 
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
            className="w-full bg-white text-slate-800 border border-slate-300 shadow-sm rounded-lg p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          >
            <option value="all">All Routes</option>
            {routes.map(route => (
              <option key={route._id} value={route._id}>{route.name}</option>
            ))}
          </select>
        </div>

        <div className="mt-8 space-y-4">
          <h3 className="text-slate-800 font-semibold mb-2">Active Buses ({filteredBuses.length})</h3>
          {filteredBuses.map(bus => (
            <div key={bus._id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex justify-between items-center">
              <div>
                <p className="text-slate-800 font-medium">{bus.registrationNumber}</p>
                <p className="text-green-600 font-medium text-xs">Moving</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Map Area */}
      <div className="flex-1 h-full z-0">
        <MapContainer center={[13.3409, 77.1005]} zoom={13} style={{ height: '100%', width: '100%', zIndex: 0 }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          />
          {filteredBuses.map((bus) => (
            <Marker key={bus._id} position={[bus.lat, bus.lng]} icon={customIcon}>
              <Popup>
                <div className="text-slate-800">
                  <h3 className="font-bold text-lg">{bus.registrationNumber}</h3>
                  <p>Route: {bus.route?.name}</p>
                  <p className="text-green-600 font-semibold">ETA: Calculating...</p>
                </div>
              </Popup>
            </Marker>
          ))}
          
          {selectedRouteObj && selectedRouteObj.path && selectedRouteObj.path.length > 0 && (
            <Polyline 
              positions={selectedRouteObj.path.map(p => [p.lat, p.lng])} 
              color="#3b82f6" 
              weight={5} 
              opacity={0.7} 
            />
          )}

          {stops.map(stop => (
            <Marker key={stop._id} position={[stop.latitude, stop.longitude]}>
              <Popup>
                <div className="text-slate-800">
                  <h4 className="font-bold">{stop.name}</h4>
                  <p className="text-sm">Stop Order: {stop.stopOrder}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default Tracking;
