import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import JobCard from '../components/JobCard';
import WalkInCard from '../components/WalkInCard';
import { Building2, MapPin, Globe, Mail, Phone, CheckCircle2, Calendar } from 'lucide-react';

const CompanyDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await api.get(`/companies/${id}`);
        if (res.data?.data) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load company:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center text-sm font-semibold text-slate-500">
        Loading company details...
      </div>
    );
  }

  if (!data || !data.company) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <h2 className="text-xl font-bold">Company Not Found</h2>
        <Link to="/companies" className="text-xs text-indigo-600 underline mt-2 block">
          Back to Companies
        </Link>
      </div>
    );
  }

  const { company, activeJobs, walkIns } = data;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Company Header Card */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start justify-between gap-6">
        <div className="flex items-start gap-5">
          <img
            src={company.logo || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&auto=format&fit=crop&q=80'}
            alt={company.name}
            className="w-20 h-20 rounded-2xl object-cover border border-slate-100 p-1 flex-shrink-0"
          />
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{company.name}</h1>
              {company.verified && (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              )}
            </div>
            <span className="text-xs font-semibold text-indigo-600 block">{company.industry}</span>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {company.address?.area}, {company.address?.city}
              </span>
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-indigo-600 hover:underline"
                >
                  <Globe className="w-3.5 h-3.5" />
                  Website
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center w-full md:w-auto flex-shrink-0">
          <span className="text-2xl font-black text-slate-900 block">{activeJobs.length}</span>
          <span className="text-xs font-semibold text-slate-500 uppercase">Active Jobs</span>
        </div>
      </div>

      {/* Description */}
      {company.description && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200">
          <h2 className="text-base font-extrabold text-slate-900 mb-3">About {company.name}</h2>
          <p className="text-xs text-slate-600 leading-relaxed">{company.description}</p>
        </div>
      )}

      {/* Walk-in Drives */}
      {walkIns && walkIns.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-500" />
            Walk-in Drives ({walkIns.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {walkIns.map((job) => (
              <WalkInCard key={job._id} job={job} />
            ))}
          </div>
        </div>
      )}

      {/* Active Jobs */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-indigo-600" />
          Current Openings ({activeJobs.length})
        </h2>
        {activeJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeJobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500">No active job openings currently posted.</p>
        )}
      </div>
    </div>
  );
};

export default CompanyDetails;
