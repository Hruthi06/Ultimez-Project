import React, { useState } from 'react';
import { Search, MapPin, ArrowRight, Clock, Route as RouteIcon, Bus, CheckCircle, Sparkles, Navigation } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ETABadge from './ETABadge';

const JourneyPlanner = ({ onSelectRouteForTracking }) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!origin.trim() && !destination.trim()) {
      toast.error('Please enter an origin or destination stop');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post('http://localhost:5000/api/journey/plan', {
        origin,
        destination,
      });
      setResults(data);
      if (data.suggestions.length === 0) {
        toast('No direct routes found for this search. Displaying all available services.');
      } else {
        toast.success(`Found ${data.suggestions.length} route recommendation(s)!`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error planning journey');
    } finally {
      setLoading(false);
    }
  };

  const quickPopular = [
    { from: 'City Bus Terminal', to: 'Tech Park Metro' },
    { from: 'Railway Station', to: 'University Circle' },
    { from: 'Commercial Street', to: 'Civic Hospital' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <RouteIcon className="w-5 h-5 text-blue-600" /> Journey Planner
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Find best bus routes, travel duration & recommendations</p>
        </div>
        <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
          Smart Travel AI
        </span>
      </div>

      {/* Form */}
      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="md:col-span-2 relative">
          <label className="block text-xs font-bold text-slate-600 mb-1">Origin / Boarding Stop</label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-blue-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="e.g. City Bus Terminal, Railway Station"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="md:col-span-2 relative">
          <label className="block text-xs font-bold text-slate-600 mb-1">Destination Stop</label>
          <div className="relative">
            <Navigation className="w-4 h-4 text-emerald-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Tech Park Metro, University Circle"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="md:col-span-1 flex items-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? <Clock className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Find Routes
          </button>
        </div>
      </form>

      {/* Quick Search Tags */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs text-slate-400 font-medium">Popular Journeys:</span>
        {quickPopular.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setOrigin(item.from);
              setDestination(item.to);
            }}
            className="text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 px-3 py-1 rounded-lg border border-slate-200 transition-all flex items-center gap-1 font-medium"
          >
            {item.from} <ArrowRight className="w-3 h-3 text-slate-400" /> {item.to}
          </button>
        ))}
      </div>

      {/* Results Section */}
      {results && (
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="font-bold text-slate-800 text-sm flex items-center justify-between">
            <span>Route Recommendations ({results.suggestions.length})</span>
            <span className="text-xs text-slate-400 font-normal">Sorted by duration</span>
          </h3>

          <div className="space-y-3">
            {results.suggestions.map((route, index) => (
              <div
                key={index}
                className="bg-slate-50 hover:bg-blue-50/40 p-4 rounded-xl border border-slate-200 transition-all hover:shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-lg">
                      {route.routeName}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> {route.recommendationBadge}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <ETABadge etaText={route.nextBusETA} size="small" />
                    <button
                      onClick={() => onSelectRouteForTracking && onSelectRouteForTracking(route.routeId)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-white border border-blue-200 px-3 py-1.5 rounded-lg shadow-2xs transition-all flex items-center gap-1"
                    >
                      View Live Map <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-white p-3 rounded-lg border border-slate-200/80">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Estimated Duration</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-500" /> ~{route.estimatedDurationMinutes} mins
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Total Distance</span>
                    <span className="font-bold text-slate-800">{route.totalDistanceKm} km</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Transfers</span>
                    <span className="font-bold text-slate-800">{route.transfers === 0 ? 'Direct (0)' : route.transfers}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Active Buses</span>
                    <span className="font-bold text-slate-800">{route.availableBusesCount} running</span>
                  </div>
                </div>

                {/* Steps Breakdown */}
                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Itinerary Breakdown</p>
                  {route.steps.map((step, sIdx) => (
                    <div key={sIdx} className="text-xs text-slate-700 flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-blue-500 mt-0.5" />
                      <span>{step.instruction}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JourneyPlanner;
