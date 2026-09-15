import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { Compass, User, Mail, Lock, Building, ArrowRight } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const { coordinates, locationName } = useLocation();
  const navigate = useNavigate();

  const [role, setRole] = useState('USER'); // 'USER' or 'EMPLOYER'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [headline, setHeadline] = useState('');
  const [skills, setSkills] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const skillsArray = skills.split(',').map((s) => s.trim()).filter(Boolean);
      await register({
        name,
        email,
        password,
        role,
        headline,
        skills: skillsArray,
        locationName,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
      });
      navigate(role === 'EMPLOYER' ? '/employer' : '/');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl shadow-slate-100 max-w-lg w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-indigo-200">
            <Compass className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Create NearHire Account</h1>
          <p className="text-xs text-slate-500">Discover or post location-verified career opportunities</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex rounded-2xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setRole('USER')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              role === 'USER' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            Job Seeker
          </button>
          <button
            type="button"
            onClick={() => setRole('EMPLOYER')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              role === 'EMPLOYER' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building className="w-4 h-4" />
            Employer / Recruiter
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              {role === 'EMPLOYER' ? 'Recruiter / Company Rep Name' : 'Full Name'}
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Work or Personal Email</label>
            <input
              type="email"
              required
              placeholder="name@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Password (min 6 characters)</label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Professional Title / Headline</label>
            <input
              type="text"
              placeholder={role === 'EMPLOYER' ? 'HR Manager at InnovaTech' : 'React & Node.js Developer'}
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
            />
          </div>

          {role === 'USER' && (
            <div>
              <label className="font-bold text-slate-700 block mb-1">Skills (comma-separated)</label>
              <input
                type="text"
                placeholder="React, JavaScript, Node.js, Express"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : `Sign Up as ${role === 'EMPLOYER' ? 'Employer' : 'Job Seeker'}`}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-indigo-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
