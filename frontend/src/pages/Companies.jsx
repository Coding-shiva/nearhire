import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Building2, MapPin, CheckCircle2, Search, ArrowUpRight } from 'lucide-react';
import { EmptyState } from '../components/SkeletonLoader';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const res = await api.get('/companies', { params: { search } });
        if (res.data?.data) {
          setCompanies(res.data.data.companies || []);
        }
      } catch (err) {
        console.error('Failed to load companies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Top NCR Employers</h1>
          <p className="text-xs text-slate-500 mt-1">
            Discover verified companies hiring across Noida, Delhi, Gurugram, and Ghaziabad
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search company by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
          ))}
        </div>
      ) : companies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <Link
              key={company._id}
              to={`/companies/${company._id}`}
              className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <img
                    src={company.logo || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&auto=format&fit=crop&q=80'}
                    alt={company.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-100 p-1"
                  />
                  {company.verified && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                    </span>
                  )}
                </div>

                <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-indigo-600 transition flex items-center gap-1">
                  {company.name}
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                </h3>

                <span className="text-xs font-semibold text-indigo-600 block mt-0.5">
                  {company.industry}
                </span>

                <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                  {company.description || 'Hiring active talent for tech, business, and operations.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {company.address?.city || 'NCR'}
                </span>
                <span className="font-bold text-slate-700">Explore Openings →</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No companies found"
          description="Try clearing your search query."
          actionText="Clear Search"
          onAction={() => setSearch('')}
        />
      )}
    </div>
  );
};

export default Companies;
