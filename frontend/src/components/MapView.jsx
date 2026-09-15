import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, Sparkles } from 'lucide-react';

// Custom Map center controller
const MapRecenter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

// Custom SVG Markers
const userLocationIcon = new L.DivIcon({
  className: 'custom-user-marker',
  html: `<div style="background-color: #4f46e5; width: 22px; height: 22px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 12px rgba(79, 70, 229, 0.6); position: relative;">
          <div style="position: absolute; top: -6px; left: -6px; width: 28px; height: 28px; border-radius: 50%; background-color: rgba(79, 70, 229, 0.2); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
         </div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const jobMarkerIcon = new L.DivIcon({
  className: 'custom-job-marker',
  html: `<div style="background-color: #0f172a; width: 28px; height: 28px; border-radius: 8px; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
         </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const walkInMarkerIcon = new L.DivIcon({
  className: 'custom-walkin-marker',
  html: `<div style="background-color: #f59e0b; width: 30px; height: 30px; border-radius: 8px; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 8px rgba(245, 158, 11, 0.4);">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
         </div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const MapView = ({ jobs = [], userCenter, radiusKm = 25 }) => {
  const centerLat = userCenter?.lat || 28.6280;
  const centerLng = userCenter?.lng || 77.3649;
  const center = [centerLat, centerLng];

  return (
    <div className="w-full h-[550px] rounded-2xl overflow-hidden border border-slate-200 shadow-md relative">
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <MapRecenter center={center} />
        
        {/* OpenStreetMap Tile layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Location Marker & Discovery Circle */}
        <Marker position={center} icon={userLocationIcon}>
          <Popup>
            <div className="p-1">
              <span className="font-bold text-xs text-slate-800">Your Discovery Center</span>
              <p className="text-[11px] text-slate-500">Radius: {radiusKm} km</p>
            </div>
          </Popup>
        </Marker>

        <Circle
          center={center}
          radius={radiusKm * 1000}
          pathOptions={{
            color: '#4f46e5',
            fillColor: '#818cf8',
            fillOpacity: 0.08,
            weight: 1.5,
            dashArray: '4, 4',
          }}
        />

        {/* Job Pins */}
        {jobs.map((job) => {
          if (!job.location?.coordinates || job.location.coordinates.length < 2) return null;
          const [lng, lat] = job.location.coordinates;
          const isWalkIn = job.walkIn;

          return (
            <Marker
              key={job._id}
              position={[lat, lng]}
              icon={isWalkIn ? walkInMarkerIcon : jobMarkerIcon}
            >
              <Popup>
                <div className="p-2 max-w-[220px]">
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-400 mb-1">
                    <span>{job.companyName}</span>
                    {isWalkIn && (
                      <span className="bg-amber-100 text-amber-800 px-1 rounded text-[9px]">WALK-IN</span>
                    )}
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 leading-tight mb-1">{job.title}</h4>
                  
                  <div className="flex items-center justify-between text-[11px] text-slate-600 mb-2">
                    <span>{job.distance !== null ? `${job.distance} km away` : job.locationName}</span>
                    <span className="font-semibold text-slate-900">
                      {job.salaryMax ? `₹${(job.salaryMin/100000).toFixed(1)}-${(job.salaryMax/100000).toFixed(1)}L` : ''}
                    </span>
                  </div>

                  <Link
                    to={`/jobs/${job._id}`}
                    className="block w-full text-center py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
                  >
                    View Job Details
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;
