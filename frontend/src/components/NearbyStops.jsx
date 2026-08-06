import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Bus, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ETABadge from './ETABadge';

const NearbyStops = ({ onSelectStopForMap }) => {
  const [loading, setLoading] = useState(false);
  const [stops, setStops] = useState([]);
  const [userCoords, setUserCoords] = useState({ lat: 13.3409, lng: 77.1005 });
  const [usingGPS, setUsingGPS] = useState(false);

  useEffect(() => {
    detectLocationAndFetchStops();
  }, []);

  const detectLocationAndFetchStops = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserCoords({ lat, lng });
          setUsingGPS(true);
          fetchNearby(lat, lng);
        },
        (error) => {
          console.warn('Geolocation access denied or unavailable. Using default city center.');
          setUsingGPS(false);
          fetchNearby(13.3409, 77.1005);
        },
        { timeout: 8000 }
      );
    } else {
      fetchNearby(13.3409, 77.1005);
    }
  };

  const fetchNearby = async (lat, lng) => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/nearby/stops?lat=${lat}&lng=${lng}&radius=8`);
      setStops(data.stops || []);
    } catch (err) {
      toast.error('Could not fetch nearby bus stops');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-emerald-600 animate-pulse" /> Nearby Bus Stop Finder
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {usingGPS ? '📍 Showing stops near your GPS location' : '📍 Showing stops around City Center Terminal'}
          </p>
        </div>

        <button
          onClick={detectLocationAndFetchStops}
          disabled={loading}
          className="self-start sm:self-auto px-4 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-2 border border-slate-200"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Stops
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 font-medium text-sm">
          <Clock className="w-8 h-8 mx-auto mb-2 animate-spin text-blue-500 opacity-60" />
          Detecting nearby transit stops...
        </div>
      ) : stops.length === 0 ? (
        <div className="p-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
          <AlertCircle className="w-10 h-10 mx-auto mb-2 text-slate-300" />
          <p className="font-bold text-slate-700">No nearby stops found within 8km</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stops.map((stop) => (
            <div
              key={stop.stopId}
              className="bg-slate-50 hover:bg-slate-100/80 p-5 rounded-xl border border-slate-200/80 transition-all hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-600" /> {stop.stopName}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">{stop.routeName}</p>
                  </div>
                  <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200 shadow-2xs">
                    {stop.distanceFormatted} away
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Upcoming Buses ({stop.upcomingBusesCount})
                  </p>
                  {stop.upcomingBuses.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No active buses approaching this stop right now.</p>
                  ) : (
                    stop.upcomingBuses.map((bus) => (
                      <div
                        key={bus.busId}
                        className="bg-white p-2.5 rounded-lg border border-slate-200 flex justify-between items-center text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Bus className="w-4 h-4 text-blue-600" />
                          <div>
                            <span className="font-bold text-slate-800">{bus.registrationNumber}</span>
                            <span className="text-slate-400 text-[10px] block">Driver: {bus.driverName}</span>
                          </div>
                        </div>
                        <ETABadge etaMinutes={bus.etaMinutes} etaText={bus.etaText} size="small" />
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 flex justify-between items-center text-xs">
                <span className="text-slate-400 text-[11px]">
                  {stop.startPoint} &rarr; {stop.destination}
                </span>
                <button
                  onClick={() => onSelectStopForMap && onSelectStopForMap(stop)}
                  className="font-bold text-blue-600 hover:text-blue-800"
                >
                  Locate on Map &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NearbyStops;
