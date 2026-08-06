import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, Radio, Bus, RefreshCw, Zap, ShieldCheck } from 'lucide-react';
import io from 'socket.io-client';
import axios from 'axios';
import toast from 'react-hot-toast';

const socket = io('http://localhost:5000');

const BusSimulatorModal = ({ isOpen, onClose }) => {
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedBusId, setSelectedBusId] = useState('');
  const [simulationSpeed, setSimulationSpeed] = useState(2000); // 2 sec interval

  useEffect(() => {
    if (isOpen) {
      fetchInitialData();
    }
  }, [isOpen]);

  const fetchInitialData = async () => {
    try {
      const { data: busData } = await axios.get('http://localhost:5000/api/buses');
      const { data: routeData } = await axios.get('http://localhost:5000/api/routes');
      setBuses(busData);
      setRoutes(routeData);
      if (busData.length > 0) {
        setSelectedBusId(busData[0]._id);
      }
    } catch (err) {
      toast.error('Error loading simulation bus data');
    }
  };

  useEffect(() => {
    let intervalId = null;

    if (isSimulating && selectedBusId) {
      const targetBus = buses.find((b) => b._id === selectedBusId);
      const targetRoute = routes.find((r) => r._id === targetBus?.route?._id || r._id === targetBus?.route);

      const path = targetRoute?.path?.length > 0
        ? targetRoute.path
        : [
            { lat: 13.3409, lng: 77.1005 },
            { lat: 13.3450, lng: 77.1050 },
            { lat: 13.3500, lng: 77.1100 },
            { lat: 13.3550, lng: 77.1150 },
            { lat: 13.3600, lng: 77.1200 },
          ];

      let stepIndex = 0;

      intervalId = setInterval(() => {
        const point = path[stepIndex % path.length];

        // Emit live location update over WebSockets
        socket.emit('updateLocation', {
          busId: targetBus._id,
          registrationNumber: targetBus.registrationNumber,
          routeId: targetRoute?._id,
          lat: point.lat + (Math.random() * 0.0005 - 0.00025), // add micro jitter for realism
          lng: point.lng + (Math.random() * 0.0005 - 0.00025),
          speed: Math.floor(Math.random() * 15) + 25, // 25-40 km/h
          delayMinutes: Math.floor(Math.random() * 3),
        });

        stepIndex++;
      }, simulationSpeed);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isSimulating, selectedBusId, simulationSpeed, buses, routes]);

  const toggleSimulation = () => {
    if (!selectedBusId) {
      toast.error('Please select a bus to simulate');
      return;
    }
    setIsSimulating(!isSimulating);
    if (!isSimulating) {
      toast.success('Real-time GPS movement simulation started!');
    } else {
      toast('Simulation paused.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden"
          >
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600">
                  <Radio className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Live Bus GPS Simulator</h3>
                  <p className="text-xs text-slate-500">Real-time WebSocket coordinate generator</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Bus to Move</label>
                <select
                  value={selectedBusId}
                  onChange={(e) => setSelectedBusId(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all"
                >
                  {buses.map((bus) => (
                    <option key={bus._id} value={bus._id}>
                      {bus.registrationNumber} - {bus.driverName} ({bus.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">GPS Broadcast Speed Interval</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSimulationSpeed(3000)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      simulationSpeed === 3000 ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    Normal (3s)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulationSpeed(1500)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      simulationSpeed === 1500 ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    Fast (1.5s)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulationSpeed(800)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      simulationSpeed === 800 ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    Ultra (0.8s)
                  </button>
                </div>
              </div>

              {/* Status Display */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl text-white ${isSimulating ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}>
                    <Bus className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">
                      {isSimulating ? 'Simulation Active' : 'Simulation Idle'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {isSimulating ? 'Broadcasting live coordinates to WebSocket clients' : 'Click start to stream mock GPS updates'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={toggleSimulation}
                  className={`flex-1 py-3 font-bold text-white rounded-xl shadow-md flex items-center justify-center gap-2 transition-all ${
                    isSimulating ? 'bg-amber-600 hover:bg-amber-700' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                  }`}
                >
                  {isSimulating ? (
                    <>
                      <Pause className="w-5 h-5" /> Pause GPS Stream
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current" /> Start Live GPS Movement
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BusSimulatorModal;
