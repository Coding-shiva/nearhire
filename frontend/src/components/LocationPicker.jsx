import React, { useState } from 'react';
import { useLocation } from '../context/LocationContext';
import { MapPin, Navigation, Search, X, Check } from 'lucide-react';

const LocationPicker = () => {
  const {
    locationName,
    radiusKm,
    setRadiusKm,
    showLocationModal,
    setShowLocationModal,
    requestBrowserLocation,
    setManualLocation,
    loadingLocation,
    PRESET_LOCATIONS,
  } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');

  if (!showLocationModal) return null;

  const filteredPresets = PRESET_LOCATIONS.filter((loc) =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Change Your Location</h3>
              <p className="text-xs text-slate-500">Find jobs and walk-in drives nearby</p>
            </div>
          </div>
          <button
            onClick={() => setShowLocationModal(false)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* GPS Button */}
          <button
            onClick={requestBrowserLocation}
            disabled={loadingLocation}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-200 transition disabled:opacity-50"
          >
            <Navigation className={`w-4 h-4 ${loadingLocation ? 'animate-spin' : ''}`} />
            {loadingLocation ? 'Detecting GPS Coordinates...' : 'Use Current Device Location'}
          </button>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search area (e.g. Sector 62, Connaught Place)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          {/* Radius Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Discovery Radius: <span className="text-indigo-600 font-bold">{radiusKm} km</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[5, 10, 25, 50, 100].map((r) => (
                <button
                  key={r}
                  onClick={() => setRadiusKm(r)}
                  className={`py-1.5 text-xs font-semibold rounded-lg border transition ${
                    radiusKm === r
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {r} km
                </button>
              ))}
            </div>
          </div>

          {/* Preset Locations */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Popular NCR Tech Hubs
            </label>
            <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-xl">
              {filteredPresets.map((loc) => {
                const isSelected = locationName === loc.name;
                return (
                  <button
                    key={loc.name}
                    onClick={() => setManualLocation(loc)}
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition" />
                      <div>
                        <div className="text-sm font-medium text-slate-800">{loc.name}</div>
                        <div className="text-xs text-slate-400">{loc.city}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
