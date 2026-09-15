import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Briefcase, Calendar, Clock, MapPin, CheckCircle2, ChevronRight } from 'lucide-react';
import { EmptyState } from '../components/SkeletonLoader';

const STATUS_COLORS = {
  saved: 'bg-slate-100 text-slate-700 border-slate-200',
  applied: 'bg-blue-50 text-blue-700 border-blue-200',
  shortlisted: 'bg-amber-50 text-amber-700 border-amber-200',
  interview: 'bg-purple-50 text-purple-700 border-purple-200',
  selected: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
};

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await api.get('/applications');
        if (res.data?.data) {
          setApplications(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch applications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Application Pipeline</h1>
          <p className="text-xs text-slate-500 mt-1">Track status updates from recruiters</p>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
          {applications.length} Total Submissions
        </span>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
          ))}
        </div>
      ) : applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((app) => {
            const job = app.job;
            if (!job) return null;
            return (
              <div
                key={app._id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">{job.companyName}</span>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                        STATUS_COLORS[app.status] || STATUS_COLORS.applied
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                  <Link to={`/jobs/${job._id}`} className="font-bold text-base text-slate-900 hover:text-indigo-600 block">
                    {job.title}
                  </Link>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {job.locationName}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Applied on {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  {app.matchScore > 0 && (
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                      {app.matchScore}% Match
                    </span>
                  )}
                  <Link
                    to={`/jobs/${job._id}`}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition"
                  >
                    View Job
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No applications submitted yet"
          description="Start discovering jobs in your area and apply with a single click."
          actionText="Find Nearby Jobs"
          onAction={() => window.location.assign('/jobs')}
        />
      )}
    </div>
  );
};

export default Applications;
