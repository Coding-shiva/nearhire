import React from 'react';
import { Sparkles, CheckCircle, XCircle, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AiMatchModal = ({ isOpen, onClose, job }) => {
  const { user } = useAuth();
  if (!isOpen || !job) return null;

  const matchScore = job.matchScore || 0;
  const matchedSkills = job.matchedSkills || [];
  const missingSkills = job.missingSkills || [];
  const reason = job.matchReason || 'Analysis completed based on required skills & distance.';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-2 text-indigo-200 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-300" />
            AI Compatibility Match
          </div>
          <h3 className="text-xl font-bold">{job.title}</h3>
          <p className="text-xs text-indigo-100">{job.companyName}</p>
        </div>

        {/* Gauge Body */}
        <div className="p-6 space-y-6">
          {/* Match Score Display */}
          <div className="flex items-center gap-5 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
            <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center rounded-2xl bg-indigo-600 text-white font-black text-2xl shadow-lg shadow-indigo-200">
              {matchScore}%
            </div>
            <div>
              <h4 className="font-extrabold text-slate-800 text-base">
                {matchScore >= 80 ? 'Exceptional Match' : matchScore >= 50 ? 'Strong Potential Match' : 'Basic Match'}
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{reason}</p>
            </div>
          </div>

          {/* Matched Skills */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Matched Skills ({matchedSkills.length})
            </h5>
            {matchedSkills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {matchedSkills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No exact skill matches recorded yet.</p>
            )}
          </div>

          {/* Missing Skills */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5 mb-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Skills to Upskill ({missingSkills.length})
            </h5>
            {missingSkills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {missingSkills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-emerald-600 font-semibold">You match all requested skills!</p>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-900 hover:bg-indigo-600 text-white font-bold rounded-xl text-sm transition shadow-md"
          >
            Got it, continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiMatchModal;
