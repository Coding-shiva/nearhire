import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useLocation } from '../context/LocationContext';
import { Bell, Plus, Trash2, CheckCircle2, MapPin, Briefcase } from 'lucide-react';
import { EmptyState } from '../components/SkeletonLoader';

const JobAlerts = () => {
  const { coordinates, locationName } = useLocation();
  const [alerts, setAlerts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // New alert form
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Technology / IT');
  const [skills, setSkills] = useState('');
  const [radiusKm, setRadiusKm] = useState(25);
  const [experienceLevel, setExperienceLevel] = useState('Fresher');

  const fetchAlertsAndNotifs = async () => {
    try {
      const [alertsRes, notifsRes] = await Promise.all([
        api.get('/alerts'),
        api.get('/alerts/notifications'),
      ]);
      if (alertsRes.data?.data) setAlerts(alertsRes.data.data);
      if (notifsRes.data?.data) setNotifications(notifsRes.data.data.notifications || []);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertsAndNotifs();
  }, []);

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    try {
      const skillList = skills.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await api.post('/alerts', {
        title: title || `${category} within ${radiusKm}km`,
        category,
        skills: skillList,
        radiusKm,
        experienceLevel,
        locationName,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
      });
      if (res.data?.data) {
        setAlerts([res.data.data, ...alerts]);
        setShowForm(false);
        setTitle('');
        setSkills('');
      }
    } catch (err) {
      alert('Failed to create alert.');
    }
  };

  const handleDeleteAlert = async (id) => {
    try {
      await api.delete(`/alerts/${id}`);
      setAlerts((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      console.error('Delete alert failed:', err);
    }
  };

  const handleMarkRead = async () => {
    try {
      await api.post('/alerts/notifications/mark-read');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Mark read failed:', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Job Alerts & Matches</h1>
            <p className="text-xs text-slate-500">
              Get notified immediately when new nearby jobs match your preferences
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-200"
        >
          <Plus className="w-4 h-4" />
          Create New Alert
        </button>
      </div>

      {/* Create Alert Form Accordion */}
      {showForm && (
        <form onSubmit={handleCreateAlert} className="bg-white rounded-3xl p-6 border border-indigo-200 shadow-xl shadow-indigo-50/50 space-y-4 animate-in fade-in">
          <h3 className="font-extrabold text-slate-900 text-base">Configure Custom Job Radar</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Alert Title</label>
              <input
                type="text"
                placeholder="e.g. React Developer Noida"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="Technology / IT">Technology / IT</option>
                <option value="Sales">Sales</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Finance">Finance</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Key Skills (comma-separated)</label>
              <input
                type="text"
                placeholder="React, Node.js, MongoDB"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Discovery Radius</label>
              <select
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value={10}>10 km</option>
                <option value={25}>25 km</option>
                <option value={50}>50 km</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
            >
              Save Alert
            </button>
          </div>
        </form>
      )}

      {/* Grid: Alerts & Notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Active Alert Subscriptions */}
        <div className="space-y-4">
          <h2 className="text-base font-extrabold text-slate-900">Your Active Alerts ({alerts.length})</h2>
          {alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.map((a) => (
                <div key={a._id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 text-sm">{a.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-indigo-600" />
                        {a.radiusKm} km radius
                      </span>
                      <span>•</span>
                      <span>{a.category || 'All Categories'}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteAlert(a._id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    title="Delete Alert"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
              No alerts set up. Create one to be notified when matching jobs are posted.
            </div>
          )}
        </div>

        {/* In-app Notification Inbox */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900">Notification History</h2>
            {notifications.some((n) => !n.read) && (
              <button
                onClick={handleMarkRead}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold"
              >
                Mark all read
              </button>
            )}
          </div>

          {notifications.length > 0 ? (
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {notifications.map((n) => (
                <div
                  key={n._id}
                  className={`p-3.5 rounded-2xl border transition text-xs ${
                    n.read ? 'bg-white border-slate-200 text-slate-600' : 'bg-indigo-50/70 border-indigo-200 text-slate-900 font-medium'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <h5 className="font-bold text-xs">{n.title}</h5>
                    <span className="text-[10px] text-slate-400">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-600">{n.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
              No notifications yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobAlerts;
