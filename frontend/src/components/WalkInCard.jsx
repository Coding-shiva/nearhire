import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  Phone,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const isSameDay = (d1, d2) => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

const getUrgencyBadge = (walkInDateStr) => {
  if (!walkInDateStr) return null;
  const walkInDate = new Date(walkInDateStr);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  if (isSameDay(walkInDate, now)) {
    return (
      <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 text-xs font-extrabold animate-bounce">
        TODAY
      </span>
    );
  }
  if (isSameDay(walkInDate, tomorrow)) {
    return (
      <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-extrabold">
        TOMORROW
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
      {walkInDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
    </span>
  );
};

const WalkInCard = ({ job }) => {
  const urgencyBadge = getUrgencyBadge(job.walkInDate);

  return (
    <div className="bg-white rounded-2xl border-2 border-amber-200/80 p-5 shadow-lg shadow-amber-50/50 hover:shadow-xl hover:border-amber-400 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
      {/* Top Banner Accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500"></div>

      <div>
        {/* Header with Urgency Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-500 text-white font-extrabold text-[11px] tracking-wide">
              WALK-IN
            </span>
            {urgencyBadge}
          </div>

          {job.distance !== null && job.distance !== undefined && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {job.distance} km
            </span>
          )}
        </div>

        {/* Title and Company */}
        <div className="flex items-start gap-3 mb-4">
          <img
            src={job.companyLogo || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&auto=format&fit=crop&q=80'}
            alt={job.companyName}
            className="w-12 h-12 rounded-xl object-cover border border-slate-100 p-1 flex-shrink-0"
          />
          <div>
            <span className="text-xs font-semibold text-slate-500">{job.companyName}</span>
            <Link to={`/jobs/${job._id}`}>
              <h3 className="font-extrabold text-slate-900 hover:text-amber-600 transition text-base line-clamp-1">
                {job.title}
              </h3>
            </Link>
          </div>
        </div>

        {/* Date, Time & Venue info */}
        <div className="bg-amber-50/60 rounded-xl p-3 space-y-2 mb-4 text-xs border border-amber-100">
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <Calendar className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              Date: {job.walkInDate ? new Date(job.walkInDate).toDateString() : 'Immediate In-Person'}
            </span>
          </div>

          {(job.walkInStartTime || job.walkInEndTime) && (
            <div className="flex items-center gap-2 text-slate-700">
              <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                Timings: {job.walkInStartTime || '10:00 AM'} - {job.walkInEndTime || '04:00 PM'}
              </span>
            </div>
          )}

          {job.venue && (
            <div className="flex items-start gap-2 text-slate-700">
              <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-2">Venue: {job.venue}</span>
            </div>
          )}
        </div>

        {/* Required Documents */}
        {job.requiredDocuments && job.requiredDocuments.length > 0 && (
          <div className="mb-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Documents to Carry:
            </span>
            <div className="flex flex-wrap gap-1">
              {job.requiredDocuments.map((doc, i) => (
                <span key={i} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                  {doc}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-500">Exp: {job.experienceLevel || 'Any'}</span>
          <span className="block text-sm font-extrabold text-slate-900">
            {job.salaryMax ? `₹${(job.salaryMin/100000).toFixed(1)} - ${(job.salaryMax/100000).toFixed(1)} LPA` : 'Best in Industry'}
          </span>
        </div>

        <Link
          to={`/jobs/${job._id}`}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition shadow-md shadow-amber-200"
        >
          Drive Details
        </Link>
      </div>
    </div>
  );
};

export default WalkInCard;
