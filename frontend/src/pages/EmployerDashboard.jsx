import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import {
  Briefcase,
  PlusCircle,
  Users,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
} from 'lucide-react';

const EmployerDashboard = () => {
  const { user } = useAuth();
  const { locationName, coordinates } = useLocation();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' or 'post' or 'applicants'

  // Post Job form state
  const [formData, setFormData] = useState({
    title: '',
    companyName: 'InnovaTech Solutions',
    description: '',
    category: 'Technology / IT',
    skills: '',
    salaryMin: 500000,
    salaryMax: 1000000,
    experienceLevel: 'Fresher',
    employmentType: 'Full Time',
    workMode: 'On-site',
    locationName: 'Sector 62, Noida',
    city: 'Noida',
    walkIn: false,
    walkInDate: '',
    walkInStartTime: '10:00 AM',
    walkInEndTime: '04:00 PM',
    venue: '',
  });

  const [posting, setPosting] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);

  // Applicants view state
  const [selectedJobForApplicants, setSelectedJobForApplicants] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  const fetchEmployerJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/employer/jobs');
      if (res.data?.data) {
        setJobs(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load employer jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployerJobs();
  }, []);

  const handlePostJob = async (e) => {
    e.preventDefault();
    setPosting(true);
    try {
      const skillsArray = formData.skills.split(',').map((s) => s.trim()).filter(Boolean);
      await api.post('/employer/jobs', {
        ...formData,
        skills: skillsArray,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
      });
      setPostSuccess(true);
      fetchEmployerJobs();
      setTimeout(() => {
        setPostSuccess(false);
        setActiveTab('jobs');
      }, 2000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post job.');
    } finally {
      setPosting(false);
    }
  };

  const handleViewApplicants = async (job) => {
    setSelectedJobForApplicants(job);
    setActiveTab('applicants');
    setLoadingApplicants(true);
    try {
      const res = await api.get(`/employer/jobs/${job._id}/applicants`);
      if (res.data?.data) {
        setApplicants(res.data.data.applicants || []);
      }
    } catch (err) {
      console.error('Failed to load applicants:', err);
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleUpdateApplicantStatus = async (appId, newStatus) => {
    try {
      await api.put(`/applications/${appId}/status`, { status: newStatus });
      setApplicants((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
      );
    } catch (err) {
      alert('Failed to update applicant status.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Employer Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Recruitment Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Post geospatial job opportunities and walk-in drives for Noida, Delhi, Gurugram, and Ghaziabad talent.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('post')}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Post New Job or Walk-in
        </button>
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-slate-100 p-1 max-w-md">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'jobs' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          My Postings ({jobs.length})
        </button>
        <button
          onClick={() => setActiveTab('post')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'post' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          Post Opportunity
        </button>
        {selectedJobForApplicants && (
          <button
            onClick={() => setActiveTab('applicants')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'applicants' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            Applicants ({applicants.length})
          </button>
        )}
      </div>

      {/* 1. Post Job Form */}
      {activeTab === 'post' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Post New Job or Walk-in Drive</h2>

          {postSuccess && (
            <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold mb-6">
              ✓ Job listing published successfully! It is now live in the geospatial radar.
            </div>
          )}

          <form onSubmit={handlePostJob} className="space-y-6 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior React Developer"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Company Display Name</label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Job Description</label>
              <textarea
                rows={5}
                required
                placeholder="Describe role responsibilities, team, and day-to-day work..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Industry Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  <option value="Technology / IT">Technology / IT</option>
                  <option value="Sales">Sales</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Finance">Finance</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Experience Level</label>
                <select
                  value={formData.experienceLevel}
                  onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  <option value="Fresher">Fresher (0 years)</option>
                  <option value="0-1 year">0 - 1 year</option>
                  <option value="1-3 years">1 - 3 years</option>
                  <option value="3-5 years">3 - 5 years</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Work Mode</label>
                <select
                  value={formData.workMode}
                  onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  <option value="On-site">On-site</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Location / Office Area</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sector 62, Noida"
                  value={formData.locationName}
                  onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">City</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Skills (comma-separated)</label>
                <input
                  type="text"
                  placeholder="React, Node.js, Express"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            {/* Walk-in Drive Checkbox */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.walkIn}
                  onChange={(e) => setFormData({ ...formData, walkIn: e.target.checked })}
                  className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                />
                <span className="font-bold text-amber-900 text-sm">
                  This is a Walk-in Interview Drive (Direct In-Person)
                </span>
              </label>

              {formData.walkIn && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Drive Date</label>
                    <input
                      type="date"
                      value={formData.walkInDate}
                      onChange={(e) => setFormData({ ...formData, walkInDate: e.target.value })}
                      className="w-full p-2.5 bg-white border border-amber-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Timings</label>
                    <input
                      type="text"
                      placeholder="10:00 AM - 04:00 PM"
                      value={formData.walkInStartTime}
                      onChange={(e) => setFormData({ ...formData, walkInStartTime: e.target.value })}
                      className="w-full p-2.5 bg-white border border-amber-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Venue Address</label>
                    <input
                      type="text"
                      placeholder="Tower B, 4th floor, Sector 62..."
                      value={formData.venue}
                      onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                      className="w-full p-2.5 bg-white border border-amber-200 rounded-xl"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={posting}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 transition disabled:opacity-50"
            >
              {posting ? 'Publishing to Radar...' : 'Publish Job Opportunity'}
            </button>
          </form>
        </div>
      )}

      {/* 2. My Postings List */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-sm text-slate-500">Loading your postings...</div>
          ) : jobs.length > 0 ? (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job._id}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">{job.category}</span>
                      {job.walkIn && (
                        <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-extrabold">
                          WALK-IN
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{job.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {job.locationName}
                      </span>
                      <span>•</span>
                      <span>{job.applicationsCount || 0} Applicants</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewApplicants(job)}
                      className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                    >
                      <Users className="w-4 h-4" />
                      View Applicants ({job.applicationsCount || 0})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
              <p className="text-xs text-slate-500">You haven't posted any jobs or walk-in drives yet.</p>
              <button
                onClick={() => setActiveTab('post')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
              >
                Post Your First Opportunity
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. Applicants Pipeline View */}
      {activeTab === 'applicants' && selectedJobForApplicants && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <span className="text-xs text-slate-400">Applicants for:</span>
              <h2 className="text-xl font-bold text-slate-900">{selectedJobForApplicants.title}</h2>
            </div>
            <button
              onClick={() => setActiveTab('jobs')}
              className="text-xs text-indigo-600 font-bold"
            >
              ← Back to Postings
            </button>
          </div>

          {loadingApplicants ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading applicants...</div>
          ) : applicants.length > 0 ? (
            <div className="space-y-4">
              {applicants.map((app) => (
                <div
                  key={app._id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">
                        {app.applicant?.name || 'Applicant'}
                      </span>
                      {app.matchScore > 0 && (
                        <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full text-[10px]">
                          {app.matchScore}% Match
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500">{app.applicant?.headline}</p>
                    <div className="flex items-center gap-3 text-slate-400 text-[11px] pt-1">
                      <span>{app.applicant?.email}</span>
                      {app.applicant?.phone && <span>• {app.applicant?.phone}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">Status:</span>
                    <select
                      value={app.status}
                      onChange={(e) => handleUpdateApplicantStatus(app._id, e.target.value)}
                      className="p-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800"
                    >
                      <option value="applied">Applied</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="interview">Interview Scheduled</option>
                      <option value="selected">Selected / Offer Rolled Out</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
              No applications received for this posting yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployerDashboard;
