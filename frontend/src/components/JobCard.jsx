import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Briefcase,
  Clock,
  Bookmark,
  Sparkles,
  Calendar,
  CheckCircle2,
  Building,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const formatSalary = (min, max) => {
  if (!min && !max) return 'Competitive';
  const minLPA = min ? (min / 100000).toFixed(1) : 0;
  const maxLPA = max ? (max / 100000).toFixed(1) : null;
  return maxLPA ? `₹${minLPA} - ${maxLPA} LPA` : `₹${minLPA}+ LPA`;
};

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return 'Recently';
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `Posted ${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Posted yesterday';
  return `Posted ${days}d ago`;
};

const JobCard = ({ job, onSaveToggle }) => {
  const { isAuthenticated } = useAuth();
  const [saved, setSaved] = useState(job.isSaved || false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('Please log in to save jobs to your profile.');
      return;
    }

    try {
      setSaving(true);
      const res = await api.post(`/jobs/${job._id}/save`);
      setSaved(res.data.data.saved);
      if (onSaveToggle) onSaveToggle(job._id, res.data.data.saved);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="group bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
      {/* Top row */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <img
              src={job.companyLogo || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&auto=format&fit=crop&q=80'}
              alt={job.companyName}
              className="w-12 h-12 rounded-xl object-cover border border-slate-100 bg-slate-50 p-1 flex-shrink-0"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&auto=format&fit=crop&q=80';
              }}
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-500">{job.companyName}</span>
                {job.verified && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 inline" title="Verified Employer" />
                )}
              </div>
              <Link to={`/jobs/${job._id}`} className="block">
                <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition text-base line-clamp-1">
                  {job.title}
                </h3>
              </Link>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className={`p-2 rounded-xl border transition ${
              saved
                ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
            title={saved ? 'Remove from saved' : 'Save job'}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-indigo-600' : ''}`} />
          </button>
        </div>

        {/* Badges bar */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {/* Distance Badge */}
          {job.distance !== undefined && job.distance !== null && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
              <MapPin className="w-3 h-3 text-emerald-600" />
              {job.distance} km away
            </span>
          )}

          {/* Walk-in badge */}
          {job.walkIn && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200 animate-pulse">
              <Calendar className="w-3 h-3 text-amber-600" />
              Walk-in Drive
            </span>
          )}

          {/* AI Match Score Badge */}
          {job.matchScore > 0 && (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                job.matchScore >= 80
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              <Sparkles className="w-3 h-3 text-indigo-600" />
              {job.matchScore}% Match
            </span>
          )}

          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs">
            {job.experienceLevel || 'Fresher'}
          </span>

          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs">
            {job.workMode || 'On-site'}
          </span>
        </div>

        {/* Description snippet */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
          {job.description}
        </p>

        {/* Skills Chips */}
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {job.skills.slice(0, 4).map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200/80 text-[11px] font-medium"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="px-1.5 py-0.5 rounded text-[11px] text-slate-400 font-semibold">
                +{job.skills.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bottom Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-sm font-extrabold text-slate-900 block">
            {formatSalary(job.salaryMin, job.salaryMax)}
          </span>
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTimeAgo(job.postedAt)}
          </span>
        </div>

        <Link
          to={`/jobs/${job._id}`}
          className="px-3.5 py-1.5 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-semibold rounded-xl transition duration-200 shadow-sm"
        >
          View Job
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
