import React from 'react';
import { Compass, Github, Twitter, Linkedin, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-slate-900">
                Near<span className="text-indigo-600">Hire</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Advanced AI-powered geospatial job discovery platform connecting talent with immediate local opportunities in Noida, Delhi, Gurugram, and Ghaziabad.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Explore</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><Link to="/jobs" className="hover:text-indigo-600 transition">Nearby Jobs</Link></li>
              <li><Link to="/walk-ins" className="hover:text-indigo-600 transition">Walk-in Drives</Link></li>
              <li><Link to="/companies" className="hover:text-indigo-600 transition">Top Companies</Link></li>
              <li><Link to="/alerts" className="hover:text-indigo-600 transition">Job Alerts</Link></li>
            </ul>
          </div>

          {/* Top Categories */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Categories</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><Link to="/jobs?category=Technology%20%2F%20IT" className="hover:text-indigo-600 transition">Technology & IT</Link></li>
              <li><Link to="/jobs?category=Sales" className="hover:text-indigo-600 transition">Sales & Business Dev</Link></li>
              <li><Link to="/jobs?category=Human%20Resources" className="hover:text-indigo-600 transition">Human Resources</Link></li>
              <li><Link to="/jobs?category=Finance" className="hover:text-indigo-600 transition">Finance & Accounts</Link></li>
            </ul>
          </div>

          {/* Coverage Cities */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">NCR Hubs</h4>
            <div className="flex flex-wrap gap-1.5 text-xs text-slate-500">
              <span className="px-2 py-1 bg-slate-100 rounded-md">Noida Sec 62</span>
              <span className="px-2 py-1 bg-slate-100 rounded-md">Noida Sec 18</span>
              <span className="px-2 py-1 bg-slate-100 rounded-md">Connaught Place</span>
              <span className="px-2 py-1 bg-slate-100 rounded-md">Cyber City Gurgaon</span>
              <span className="px-2 py-1 bg-slate-100 rounded-md">Raj Nagar Ghaziabad</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} NearHire Platform. Built for real-world job discovery.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-600 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-600 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-600 cursor-pointer">API Docs</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
