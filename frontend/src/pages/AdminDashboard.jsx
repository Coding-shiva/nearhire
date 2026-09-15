import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  ShieldCheck,
  Users,
  Building2,
  Briefcase,
  AlertTriangle,
  Database,
  CheckCircle,
  XCircle,
  Play,
  RotateCw,
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [sources, setSources] = useState([]);
  const [ingestionLogs, setIngestionLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'reports', 'sources', 'logs'

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, reportsRes, sourcesRes, logsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/reports'),
        api.get('/admin/sources'),
        api.get('/admin/ingestion-logs'),
      ]);

      if (statsRes.data?.data) setStats(statsRes.data.data);
      if (reportsRes.data?.data) setReports(reportsRes.data.data);
      if (sourcesRes.data?.data) setSources(sourcesRes.data.data);
      if (logsRes.data?.data) setIngestionLogs(logsRes.data.data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleSource = async (id) => {
    try {
      await api.put(`/admin/sources/${id}/toggle`);
      fetchData();
    } catch (err) {
      alert('Failed to toggle source.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-20 text-center text-sm font-semibold text-slate-500">
        Loading Admin Operations Console...
      </div>
    );
  }

  const summary = stats?.summary || {};
  const charts = stats?.charts || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" /> NearHire Admin Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">System Operations & Ingestion Radar</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time geospatial analytics, source ingestion pipelines, and fraud moderation.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
        >
          <RotateCw className="w-4 h-4" /> Refresh Metrics
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex rounded-2xl bg-slate-100 p-1 max-w-xl text-xs font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2 rounded-xl transition ${
            activeTab === 'overview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
          }`}
        >
          Platform Stats
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex-1 py-2 rounded-xl transition ${
            activeTab === 'reports' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
          }`}
        >
          Reported Jobs ({reports.length})
        </button>
        <button
          onClick={() => setActiveTab('sources')}
          className={`flex-1 py-2 rounded-xl transition ${
            activeTab === 'sources' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
          }`}
        >
          Sources ({sources.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex-1 py-2 rounded-xl transition ${
            activeTab === 'logs' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
          }`}
        >
          Ingestion Logs
        </button>
      </div>

      {/* 1. Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stat Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase">Total Active Jobs</span>
              <span className="text-2xl font-black text-slate-900 block mt-1">{summary.activeJobs || 0}</span>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                +{summary.jobsAddedToday || 0} added today
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase">Walk-in Drives</span>
              <span className="text-2xl font-black text-amber-600 block mt-1">{summary.walkInJobs || 0}</span>
              <span className="text-[11px] text-slate-500 font-medium mt-1 block">Direct in-person</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase">Registered Users</span>
              <span className="text-2xl font-black text-slate-900 block mt-1">{summary.totalUsers || 0}</span>
              <span className="text-[11px] text-indigo-600 font-medium mt-1 block">Talent & Seekers</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase">Verified Companies</span>
              <span className="text-2xl font-black text-slate-900 block mt-1">{summary.totalCompanies || 0}</span>
              <span className="text-[11px] text-slate-500 font-medium mt-1 block">NCR Hubs</span>
            </div>
          </div>

          {/* Category & City Distribution Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm">Jobs by Category</h3>
              <div className="space-y-2">
                {charts.jobsByCategory?.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">{c.category || 'Other'}</span>
                    <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                      {c.count} jobs
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm">Jobs by NCR City Hub</h3>
              <div className="space-y-2">
                {charts.jobsByCity?.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">{c.city}</span>
                    <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                      {c.count} jobs
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Reported Jobs Tab */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Flagged & Reported Postings</h2>
          {reports.length > 0 ? (
            <div className="divide-y divide-slate-100 text-xs">
              {reports.map((r) => (
                <div key={r._id} className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-rose-600 uppercase text-[10px] tracking-wider block">
                      Reason: {r.reason}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{r.job?.title || 'Unknown Job'}</h4>
                    <p className="text-slate-500 mt-0.5">{r.description || 'No comment provided'}</p>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Reported by: {r.reportedBy?.email || 'Anonymous Seeker'}
                    </span>
                  </div>
                  <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-md font-bold text-[10px] uppercase">
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No reports submitted currently.</p>
          )}
        </div>
      )}

      {/* 3. Ingestion Sources Tab */}
      {activeTab === 'sources' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Configured Job Feeds & Sources</h2>
          </div>

          <div className="space-y-3">
            {sources.map((s) => (
              <div
                key={s._id}
                className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">{s.name}</h4>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold uppercase">
                      {s.sourceType}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">{s.url || 'Internal Mock Adapter'}</p>
                  <span className="text-[10px] text-emerald-600 font-semibold block mt-1">
                    Total fetched: {s.totalJobsFetched || 0} • Added: {s.totalJobsAdded || 0}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleSource(s._id)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs ${
                      s.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {s.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Ingestion Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Recent Automated Ingestion Runs</h2>
          {ingestionLogs.length > 0 ? (
            <div className="divide-y divide-slate-100 text-xs">
              {ingestionLogs.map((log) => (
                <div key={log._id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800">{log.sourceName}</span>
                    <span className="text-slate-400 block text-[11px]">
                      {new Date(log.fetchedAt).toLocaleString()} • Duration: {log.executionTimeMs}ms
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-600">
                      +{log.jobsAdded} added / {log.duplicatesFound} dups
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        log.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No logs recorded yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
