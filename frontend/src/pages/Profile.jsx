import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, MapPin, Briefcase, Sparkles, Check, Save } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    headline: user?.headline || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    experienceLevel: user?.experienceLevel || 'Fresher',
    skills: (user?.skills || []).join(', '),
    locationName: user?.locationName || 'Noida Sector 62',
    preferredRadiusKm: user?.preferredRadiusKm || 25,
    preferredWorkMode: user?.preferredWorkMode || 'Any',
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const skillsArray = formData.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await updateProfile({
        ...formData,
        skills: skillsArray,
        preferredRadiusKm: Number(formData.preferredRadiusKm),
      });

      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err) {
      alert('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
            {formData.name.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Your Candidate Profile</h1>
            <p className="text-xs text-slate-500">
              Used by AI match scoring to calculate compatibility with job openings
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            Profile updated successfully! AI match scores will recalculate on your next job view.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                required
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Headline / Professional Title</label>
            <input
              type="text"
              placeholder="e.g. MERN Stack Developer | React & Node.js"
              value={formData.headline}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Skills (Separated by commas for AI matching)
            </label>
            <input
              type="text"
              placeholder="React, JavaScript, Node.js, Express, MongoDB, Tailwind CSS"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                <option value="5+ years">5+ years</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Preferred Location Name</label>
              <input
                type="text"
                value={formData.locationName}
                onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Default Discovery Radius</label>
              <select
                value={formData.preferredRadiusKm}
                onChange={(e) => setFormData({ ...formData, preferredRadiusKm: Number(e.target.value) })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value={10}>10 km</option>
                <option value={25}>25 km (Recommended)</option>
                <option value={50}>50 km</option>
                <option value={100}>100 km</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Brief Bio</label>
            <textarea
              rows={4}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-md shadow-indigo-200 transition flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Profile & Update AI Matching'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
