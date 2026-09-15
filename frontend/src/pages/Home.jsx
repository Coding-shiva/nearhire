import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLocation } from '../context/LocationContext';
import api from '../services/api';
import JobCard from '../components/JobCard';
import WalkInCard from '../components/WalkInCard';
import { JobCardSkeleton } from '../components/SkeletonLoader';
import {
  Compass,
  MapPin,
  Search,
  Sparkles,
  Calendar,
  Building2,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

const Home = () => {
  const { coordinates, locationName, radiusKm, setShowLocationModal } = useLocation();
  const navigate = useNavigate();

  const [feed, setFeed] = useState({
    nearbyJobs: [],
    walkIns: [],
    fresherJobs: [],
    todayJobs: [],
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);
      try {
        const res = await api.get('/jobs/home-feed', {
          params: {
            lat: coordinates.lat,
            lng: coordinates.lng,
          },
        });
        if (res.data?.data) {
          setFeed(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load home feed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [coordinates]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (selectedCategory) params.append('category', selectedCategory);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="space-y-16 pb-20">
      {/* 1. Hero Section */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-indigo-50/70 via-white to-transparent overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          {/* Location Badge */}
          <button
            onClick={() => setShowLocationModal(true)}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100/70 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition shadow-sm border border-indigo-200"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Discovering jobs within <span className="underline">{radiusKm} km</span> of {locationName}</span>
            <span className="text-[10px] bg-white px-2 py-0.5 rounded-full shadow-xs">Change</span>
          </button>

          {/* Main Tagline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.15]">
            Find Great Jobs In Your <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600">
              Immediate Neighborhood
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 font-normal">
            NearHire leverages browser geolocation and AI matching to discover active openings from verified tech, sales, and corporate employers in Noida, Delhi, Gurugram, and Ghaziabad.
          </p>

          {/* Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-3xl mx-auto bg-white p-2.5 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 flex flex-col sm:flex-row items-center gap-2"
          >
            <div className="flex-1 flex items-center gap-3 px-3 w-full">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Job title, skill (e.g. React, BDE, HR Recruiter)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-sm font-medium py-2 text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
              />
            </div>

            <div className="hidden sm:block h-8 w-[1px] bg-slate-200"></div>

            <div className="w-full sm:w-auto flex items-center justify-between gap-2 px-2">
              <button
                type="button"
                onClick={() => setShowLocationModal(true)}
                className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold hover:text-indigo-600 py-2 px-2 rounded-lg"
              >
                <MapPin className="w-4 h-4 text-indigo-500" />
                <span className="max-w-[120px] truncate">{locationName}</span>
              </button>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md shadow-indigo-200 transition"
              >
                Search Nearby
              </button>
            </div>
          </form>

          {/* Quick Categories Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
            <span className="text-slate-400 font-semibold">Popular:</span>
            {['Technology / IT', 'Sales', 'Human Resources', 'Finance', 'Marketing'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  navigate(`/jobs?category=${encodeURIComponent(cat)}`);
                }}
                className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-full border border-slate-200 font-medium transition"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Walk-in Drives Section */}
      {feed.walkIns && feed.walkIns.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 text-amber-600 text-xs font-bold uppercase tracking-wider mb-1">
                <Calendar className="w-4 h-4" />
                Direct In-Person Hiring
              </div>
              <h2 className="text-2xl font-black text-slate-900">Walk-in Drives Near You</h2>
            </div>
            <Link
              to="/walk-ins"
              className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition"
            >
              View All Drives <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {feed.walkIns.map((job) => (
              <WalkInCard key={job._id} job={job} />
            ))}
          </div>
        </section>
      )}

      {/* 3. Jobs Near You (Distance Sorted) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
              <Compass className="w-4 h-4" />
              Within {radiusKm} km
            </div>
            <h2 className="text-2xl font-black text-slate-900">Jobs Near You</h2>
          </div>
          <Link
            to="/jobs"
            className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition"
          >
            Explore Map & Directory <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        ) : feed.nearbyJobs && feed.nearbyJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {feed.nearbyJobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500 text-sm">No jobs within {radiusKm} km currently.</p>
            <button
              onClick={() => setShowLocationModal(true)}
              className="mt-3 text-indigo-600 font-bold text-xs underline"
            >
              Increase radius to 50 km
            </button>
          </div>
        )}
      </section>

      {/* 4. Freshers & Today's Openings Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Fresher Jobs */}
          <div className="bg-slate-100/60 rounded-3xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                Fresher & Entry-Level Jobs
              </h3>
              <Link to="/jobs?experienceLevel=Fresher" className="text-xs font-bold text-indigo-600">
                View More
              </Link>
            </div>
            <div className="space-y-3">
              {feed.fresherJobs?.slice(0, 3).map((job) => (
                <div
                  key={job._id}
                  className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <Link to={`/jobs/${job._id}`} className="font-bold text-sm text-slate-900 hover:text-indigo-600 block">
                      {job.title}
                    </Link>
                    <span className="text-xs text-slate-500">{job.companyName} • {job.locationName}</span>
                  </div>
                  <Link
                    to={`/jobs/${job._id}`}
                    className="text-xs font-semibold px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100"
                  >
                    Apply
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Posted Today */}
          <div className="bg-slate-100/60 rounded-3xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Posted Today
              </h3>
              <Link to="/jobs?postedWithin=today" className="text-xs font-bold text-indigo-600">
                View More
              </Link>
            </div>
            <div className="space-y-3">
              {feed.todayJobs?.slice(0, 3).map((job) => (
                <div
                  key={job._id}
                  className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <Link to={`/jobs/${job._id}`} className="font-bold text-sm text-slate-900 hover:text-indigo-600 block">
                      {job.title}
                    </Link>
                    <span className="text-xs text-slate-500">{job.companyName} • {job.locationName}</span>
                  </div>
                  <Link
                    to={`/jobs/${job._id}`}
                    className="text-xs font-semibold px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100"
                  >
                    Apply
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Platform Quality & Safety Guarantees */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base">Accurate Geospatial Radii</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                MongoDB 2dsphere indexing and the Haversine formula guarantee real straight-line distance to offices in Sector 62, Cyber City, and Connaught Place.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base">Automated AI Skills Engine</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Skill extraction and synonym normalization (e.g. ReactJS $\to$ React) calculate personalized match scores and missing skills to prepare for interviews.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base">Zero Duplicates & Scams</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automated multi-factor hash deduplication and nightly expiry sweepers archive dead listings and maintain trusted data quality.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
