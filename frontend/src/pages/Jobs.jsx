import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLocation } from '../context/LocationContext';
import api from '../services/api';
import JobCard from '../components/JobCard';
import MapView from '../components/MapView';
import FilterSidebar from '../components/FilterSidebar';
import { JobCardSkeleton, EmptyState } from '../components/SkeletonLoader';
import {
  Search,
  MapPin,
  List,
  Map as MapIcon,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { coordinates, radiusKm, locationName, setShowLocationModal } = useLocation();

  // State
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters State
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'All',
    skills: searchParams.get('skills') || '',
    experienceLevel: searchParams.get('experienceLevel') || 'All',
    workMode: searchParams.get('workMode') || 'All',
    radius: searchParams.get('radius') || radiusKm,
    postedWithin: searchParams.get('postedWithin') || '',
    walkIn: searchParams.get('walkIn') || '',
    sortBy: searchParams.get('sortBy') || 'nearest',
    page: parseInt(searchParams.get('page')) || 1,
  });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {
        lat: coordinates.lat,
        lng: coordinates.lng,
        radius: filters.radius,
        category: filters.category !== 'All' ? filters.category : undefined,
        skills: filters.skills || undefined,
        experienceLevel: filters.experienceLevel !== 'All' ? filters.experienceLevel : undefined,
        workMode: filters.workMode !== 'All' ? filters.workMode : undefined,
        postedWithin: filters.postedWithin || undefined,
        walkIn: filters.walkIn || undefined,
        sortBy: filters.sortBy,
        page: filters.page,
        limit: 15,
        search: filters.search || undefined,
      };

      const res = await api.get('/jobs/nearby', { params });
      if (res.data?.data) {
        setJobs(res.data.data.jobs || []);
        setTotalPages(res.data.data.totalPages || 1);
        setTotalCount(res.data.data.total || 0);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [coordinates, filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to page 1 on filter change
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: 'All',
      skills: '',
      experienceLevel: 'All',
      workMode: 'All',
      radius: radiusKm,
      postedWithin: '',
      walkIn: '',
      sortBy: 'nearest',
      page: 1,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Search & Controls Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by job title, skill, or company..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        {/* Location & View Controls */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          {/* Location summary button */}
          <button
            onClick={() => setShowLocationModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition"
          >
            <MapPin className="w-3.5 h-3.5 text-indigo-600" />
            <span className="truncate max-w-[120px]">{locationName}</span>
            <span className="text-indigo-600">({filters.radius}km)</span>
          </button>

          {/* Sort Select */}
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="nearest">Nearest Distance</option>
            <option value="latest">Latest Posted</option>
            <option value="salary_desc">Salary: High to Low</option>
            <option value="salary_asc">Salary: Low to High</option>
          </select>

          {/* List vs Map View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                viewMode === 'list'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                viewMode === 'map'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Map View"
            >
              <MapIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Filter Toggle Button */}
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid with Sidebar + Results */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Filter Sidebar (Desktop) */}
        <div className={`md:col-span-1 ${mobileFilterOpen ? 'block' : 'hidden md:block'}`}>
          <FilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
          />
        </div>

        {/* Results Column */}
        <div className="md:col-span-3 space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>
              Showing <strong className="text-slate-800">{jobs.length}</strong> of{' '}
              <strong className="text-slate-800">{totalCount}</strong> jobs near{' '}
              <strong className="text-slate-800">{locationName}</strong>
            </span>
            <span>Page {filters.page} of {totalPages}</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <JobCardSkeleton key={i} />
              ))}
            </div>
          ) : viewMode === 'map' ? (
            <div className="space-y-6">
              <MapView jobs={jobs} userCenter={coordinates} radiusKm={Number(filters.radius)} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.slice(0, 4).map((job) => (
                  <JobCard key={job._id} job={job} />
                ))}
              </div>
            </div>
          ) : jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No matching jobs found"
              description={`We couldn't find active jobs matching your filters within ${filters.radius} km of ${locationName}.`}
              actionText="Expand Search to 50 km"
              onAction={() => handleFilterChange('radius', 50)}
            />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                disabled={filters.page <= 1}
                onClick={() => handleFilterChange('page', filters.page - 1)}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handleFilterChange('page', pageNum)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition ${
                      filters.page === pageNum
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                        : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                disabled={filters.page >= totalPages}
                onClick={() => handleFilterChange('page', filters.page + 1)}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Jobs;
