import React, { useState, useEffect } from 'react';
import { useLocation } from '../context/LocationContext';
import api from '../services/api';
import WalkInCard from '../components/WalkInCard';
import { EmptyState, JobCardSkeleton } from '../components/SkeletonLoader';
import { Calendar, Clock, MapPin, Sparkles, Filter } from 'lucide-react';

const WalkIns = () => {
  const { coordinates, locationName } = useLocation();
  const [walkIns, setWalkIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'today', 'tomorrow', 'week'

  useEffect(() => {
    const fetchWalkIns = async () => {
      setLoading(true);
      try {
        const res = await api.get('/jobs/walk-ins', {
          params: {
            filter,
            lat: coordinates.lat,
            lng: coordinates.lng,
          },
        });
        if (res.data?.data) {
          setWalkIns(res.data.data.jobs || []);
        }
      } catch (err) {
        console.error('Failed to load walk-in drives:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWalkIns();
  }, [coordinates, filter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-8 sm:p-12 text-white shadow-xl shadow-amber-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-extrabold tracking-wide uppercase">
            <Calendar className="w-3.5 h-3.5" />
            Direct In-Person Hiring
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Walk-In Interview Drives in NCR
          </h1>
          <p className="text-sm text-amber-50 leading-relaxed">
            Attend direct face-to-face recruitment drives without waiting weeks for resume callbacks. Carry your resume and ID to receive on-the-spot offer letters.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center flex-shrink-0">
          <span className="text-3xl font-black block">{walkIns.length}</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-100">
            Active Drives Near You
          </span>
        </div>
      </div>

      {/* Tabs / Filter Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Upcoming' },
            { id: 'today', label: 'Happening Today' },
            { id: 'tomorrow', label: 'Tomorrow' },
            { id: 'week', label: 'Next 7 Days' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition ${
                filter === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <MapPin className="w-4 h-4 text-amber-600" />
          <span>Showing drives sorted from <strong>{locationName}</strong></span>
        </div>
      </div>

      {/* Drives Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      ) : walkIns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {walkIns.map((job) => (
            <WalkInCard key={job._id} job={job} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No walk-in drives scheduled for this filter"
          description="Check other tabs like 'All Upcoming' or check back soon as companies post new drives daily."
          actionText="View All Upcoming Drives"
          onAction={() => setFilter('all')}
        />
      )}
    </div>
  );
};

export default WalkIns;
