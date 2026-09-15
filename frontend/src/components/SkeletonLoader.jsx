import React from 'react';

export const JobCardSkeleton = () => (
  <div className="bg-white rounded-2xl p-5 border border-slate-200 animate-pulse space-y-4">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-slate-200"></div>
        <div className="space-y-2">
          <div className="w-24 h-3 bg-slate-200 rounded"></div>
          <div className="w-40 h-4 bg-slate-200 rounded"></div>
        </div>
      </div>
      <div className="w-8 h-8 rounded-lg bg-slate-200"></div>
    </div>
    <div className="flex gap-2">
      <div className="w-20 h-6 bg-slate-200 rounded-full"></div>
      <div className="w-16 h-6 bg-slate-200 rounded-full"></div>
    </div>
    <div className="space-y-1.5">
      <div className="w-full h-3 bg-slate-200 rounded"></div>
      <div className="w-4/5 h-3 bg-slate-200 rounded"></div>
    </div>
    <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
      <div className="w-24 h-4 bg-slate-200 rounded"></div>
      <div className="w-20 h-7 bg-slate-200 rounded-xl"></div>
    </div>
  </div>
);

export const EmptyState = ({ title = 'No jobs found', description = 'Try adjusting your filters or expanding your radius.', actionText, onAction }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
    <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
    <h3 className="font-bold text-slate-800 text-lg mb-1">{title}</h3>
    <p className="text-xs text-slate-500 mb-6 leading-relaxed">{description}</p>
    {actionText && onAction && (
      <button
        onClick={onAction}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-indigo-200"
      >
        {actionText}
      </button>
    )}
  </div>
);
