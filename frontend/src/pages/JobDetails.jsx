import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import api from '../services/api';
import AiMatchModal from '../components/AiMatchModal';
import {
  MapPin,
  Briefcase,
  Clock,
  Calendar,
  Sparkles,
  Building2,
  Bookmark,
  Send,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Phone,
  Mail,
  Share2,
} from 'lucide-react';

const JobDetails = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { coordinates } = useLocation();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  // Application Form State
  const [coverNote, setCoverNote] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  // Report Form State
  const [reportReason, setReportReason] = useState('expired');
  const [reportDesc, setReportDesc] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/jobs/${id}`, {
          params: {
            lat: coordinates.lat,
            lng: coordinates.lng,
          },
        });
        if (res.data?.data) {
          setJob(res.data.data);
          setSaved(res.data.data.isSaved || false);
        }
      } catch (err) {
        console.error('Failed to fetch job details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id, coordinates]);

  const handleSaveToggle = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to save jobs.');
      return;
    }
    try {
      const res = await api.post(`/jobs/${id}/save`);
      setSaved(res.data.data.saved);
    } catch (err) {
      console.error('Failed to save:', err);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please sign in to apply.');
      return;
    }
    setApplying(true);
    try {
      await api.post('/applications', {
        jobId: id,
        coverNote,
        resumeUrl,
      });
      setApplySuccess(true);
      setTimeout(() => {
        setIsApplyModalOpen(false);
        setApplySuccess(false);
      }, 2000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setApplying(false);
    }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/jobs/${id}/report`, {
        reason: reportReason,
        description: reportDesc,
      });
      setReportSuccess(true);
      setTimeout(() => {
        setIsReportModalOpen(false);
        setReportSuccess(false);
      }, 2000);
    } catch (err) {
      alert('Failed to submit report.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-semibold text-slate-500">Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Job Not Found</h2>
        <p className="text-xs text-slate-500 mt-2 mb-6">This posting might have expired or been removed.</p>
        <Link to="/jobs" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">
          Back to Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/jobs" className="hover:text-indigo-600">Jobs</Link>
        <span>/</span>
        <span className="text-slate-400">{job.category}</span>
        <span>/</span>
        <span className="text-slate-800 font-semibold truncate max-w-xs">{job.title}</span>
      </div>

      {/* Main Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <img
              src={job.companyLogo || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&auto=format&fit=crop&q=80'}
              alt={job.companyName}
              className="w-16 h-16 rounded-2xl object-cover border border-slate-100 p-1 flex-shrink-0"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">{job.companyName}</span>
                {job.verified ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    <CheckCircle2 className="w-3 h-3" /> Verified Employer
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    Unverified Source
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                {job.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                  {job.locationName}
                </span>
                {job.distance !== null && job.distance !== undefined && (
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {job.distance} km away from you
                  </span>
                )}
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Posted {new Date(job.postedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleSaveToggle}
              className={`p-3 rounded-2xl border transition ${
                saved
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                  : 'border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
              title="Save Job"
            >
              <Bookmark className={`w-5 h-5 ${saved ? 'fill-indigo-600' : ''}`} />
            </button>
            {job.applyUrl && (
              <a
                href={job.applyUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-initial px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-2xl transition flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                Official Careers Portal
              </a>
            )}
            <button
              onClick={() => setIsApplyModalOpen(true)}
              className="flex-1 sm:flex-initial px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-200 transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Apply Now
            </button>
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Offered Salary</span>
            <span className="font-extrabold text-slate-900 text-sm">
              {job.salaryMax ? `₹${(job.salaryMin/100000).toFixed(1)} - ${(job.salaryMax/100000).toFixed(1)} LPA` : 'Competitive'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Experience</span>
            <span className="font-extrabold text-slate-900 text-sm">{job.experienceLevel || 'Fresher'}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Work Mode</span>
            <span className="font-extrabold text-slate-900 text-sm">{job.workMode || 'On-site'}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Job Type</span>
            <span className="font-extrabold text-slate-900 text-sm">{job.employmentType || 'Full Time'}</span>
          </div>
        </div>

        {/* AI Match Score Card */}
        {job.matchScore > 0 && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg">
                {job.matchScore}%
              </div>
              <div>
                <span className="text-xs font-bold text-indigo-900 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  AI Profile Match Score
                </span>
                <p className="text-xs text-slate-600 mt-0.5 max-w-md">{job.matchReason}</p>
              </div>
            </div>
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="text-xs font-bold px-4 py-2 bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl border border-indigo-200 transition flex-shrink-0"
            >
              Skill Breakdown
            </button>
          </div>
        )}
      </div>

      {/* Walk-in details banner if applicable */}
      {job.walkIn && (
        <div className="bg-amber-50 rounded-3xl p-6 border-2 border-amber-200 space-y-4">
          <div className="flex items-center gap-2 text-amber-800 font-extrabold text-sm uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-amber-600" />
            Walk-in Interview Schedule & Venue
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-white p-3 rounded-xl border border-amber-200">
              <span className="text-slate-400 block font-semibold">Drive Date:</span>
              <span className="text-slate-900 font-bold text-sm">
                {job.walkInDate ? new Date(job.walkInDate).toDateString() : 'Immediate In-Person'}
              </span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-amber-200">
              <span className="text-slate-400 block font-semibold">Timings:</span>
              <span className="text-slate-900 font-bold text-sm">
                {job.walkInStartTime || '10:00 AM'} - {job.walkInEndTime || '04:00 PM'}
              </span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-amber-200">
              <span className="text-slate-400 block font-semibold">Contact:</span>
              <span className="text-slate-900 font-bold text-sm">
                {job.contactPhone || job.contactEmail || 'HR Desk Available'}
              </span>
            </div>
          </div>
          {job.venue && (
            <div className="bg-white p-3.5 rounded-xl border border-amber-200 text-xs">
              <span className="text-slate-400 block font-semibold mb-1">Interview Venue:</span>
              <p className="text-slate-800 font-medium">{job.venue}</p>
            </div>
          )}
        </div>
      )}

      {/* Main Details Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Description, Responsibilities, Requirements */}
        <div className="lg:col-span-2 space-y-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base mb-3">About the Role</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{job.description}</p>
          </div>

          {job.responsibilities && job.responsibilities.length > 0 && (
            <div>
              <h3 className="font-extrabold text-slate-900 text-base mb-3">Key Responsibilities</h3>
              <ul className="space-y-2 text-xs text-slate-600 list-disc list-inside leading-relaxed">
                {job.responsibilities.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {job.requirements && job.requirements.length > 0 && (
            <div>
              <h3 className="font-extrabold text-slate-900 text-base mb-3">Requirements & Qualifications</h3>
              <ul className="space-y-2 text-xs text-slate-600 list-disc list-inside leading-relaxed">
                {job.requirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h3 className="font-extrabold text-slate-900 text-base mb-3">Target Skills & Tech Stack</h3>
            <div className="flex flex-wrap gap-2">
              {job.skills && job.skills.map((skill, i) => (
                <span key={i} className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Company summary, report, source badge */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm">Company Overview</h3>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>{job.companyName}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{job.locationName}</span>
              </div>
            </div>
            {job.company && (
              <Link
                to={`/companies/${job.company._id || job.company}`}
                className="block w-full text-center py-2 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition"
              >
                View Company Profile
              </Link>
            )}
          </div>

          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 text-xs space-y-3">
            <span className="font-bold text-slate-700 block">Job Attribution & Source</span>
            <p className="text-slate-500">
              Source: <strong className="text-slate-700 uppercase">{job.source}</strong>
            </p>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 font-semibold transition"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Report this posting
            </button>
          </div>
        </div>
      </div>

      {/* AI Match Modal */}
      <AiMatchModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        job={job}
      />

      {/* Apply Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-100 space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Apply for {job.title}</h3>
            {applySuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold text-center">
                ✓ Application submitted successfully! Tracking added to your dashboard.
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Resume Link or Portfolio URL</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/your-resume or LinkedIn"
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Short Cover Note</label>
                  <textarea
                    rows={4}
                    placeholder="Briefly state why your skills match this role..."
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsApplyModalOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={applying}
                    className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 disabled:opacity-50"
                  >
                    {applying ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-100 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Report Job Posting</h3>
            {reportSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold text-center">
                ✓ Report received. Thank you for keeping NearHire safe.
              </div>
            ) : (
              <form onSubmit={handleReport} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Reason</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="expired">Job is already expired / closed</option>
                    <option value="fake_scam">Suspected scam or asks for money</option>
                    <option value="incorrect_location">Incorrect location coordinates</option>
                    <option value="wrong_salary">Misleading salary</option>
                    <option value="other">Other issue</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Additional details</label>
                  <textarea
                    rows={3}
                    value={reportDesc}
                    onChange={(e) => setReportDesc(e.target.value)}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsReportModalOpen(false)}
                    className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;
