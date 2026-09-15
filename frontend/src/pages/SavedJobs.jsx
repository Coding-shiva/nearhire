import React, { useState, useEffect } from 'react';
import api from '../services/api';
import JobCard from '../components/JobCard';
import { EmptyState, JobCardSkeleton } from '../components/SkeletonLoader';
import { Bookmark } from 'lucide-react';

const SavedJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    try {
      const res = await api.get('/jobs/user/saved');
      if (res.data?.data) {
        setJobs(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load saved jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleSaveToggle = (jobId, isSaved) => {
    if (!isSaved) {
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
          <Bookmark className="w-5 h-5 fill-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Saved Opportunities</h1>
          <p className="text-xs text-slate-500">Bookmarked jobs saved for future review or application</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      ) : jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} onSaveToggle={handleSaveToggle} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No saved jobs"
          description="Click the bookmark icon on any job card to save it here for later."
          actionText="Browse Jobs"
          onAction={() => window.location.assign('/jobs')}
        />
      )}
    </div>
  );
};

export default SavedJobs;
