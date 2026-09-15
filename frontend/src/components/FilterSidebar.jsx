import React from 'react';
import { Filter, RotateCcw, MapPin, Briefcase, DollarSign, Clock, Layers } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Technology / IT',
  'Sales',
  'Human Resources',
  'Finance',
  'Marketing',
  'Operations',
  'Customer Support',
  'Design',
];

const SKILL_SUGGESTIONS = [
  'React',
  'Node.js',
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'AWS',
  'Docker',
  'MongoDB',
  'Lead Generation',
  'Inside Sales',
  'Recruitment',
  'Talent Acquisition',
  'Advanced Excel',
  'Figma',
];

const FilterSidebar = ({ filters, onFilterChange, onResetFilters }) => {
  const handleCategoryClick = (cat) => {
    onFilterChange('category', cat === filters.category ? 'All' : cat);
  };

  const handleSkillToggle = (skill) => {
    let current = filters.skills ? filters.skills.split(',').filter(Boolean) : [];
    if (current.includes(skill)) {
      current = current.filter((s) => s !== skill);
    } else {
      current.push(skill);
    }
    onFilterChange('skills', current.join(','));
  };

  const activeSkills = filters.skills ? filters.skills.split(',') : [];

  return (
    <aside className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-600" />
          <h3 className="font-bold text-slate-900 text-sm">Filters</h3>
        </div>
        <button
          onClick={onResetFilters}
          className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold transition"
        >
          <RotateCcw className="w-3 h-3" />
          Reset All
        </button>
      </div>

      {/* 1. Distance Radius */}
      <div>
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
          <MapPin className="w-3.5 h-3.5 text-indigo-600" />
          Distance Radius
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {[5, 10, 25, 50, 100].map((dist) => (
            <button
              key={dist}
              onClick={() => onFilterChange('radius', dist)}
              className={`py-1.5 text-xs font-semibold rounded-lg border transition ${
                Number(filters.radius) === dist
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {dist}km
            </button>
          ))}
        </div>
      </div>

      {/* 2. Main Categories */}
      <div>
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
          <Layers className="w-3.5 h-3.5 text-indigo-600" />
          Industry Category
        </label>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          {CATEGORIES.map((cat) => {
            const isSelected = (filters.category || 'All') === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                  isSelected
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{cat}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Popular Skills */}
      <div>
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
          <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
          Skills & Tech Stack
        </label>
        <div className="flex flex-wrap gap-1.5">
          {SKILL_SUGGESTIONS.map((skill) => {
            const isSelected = activeSkills.includes(skill);
            return (
              <button
                key={skill}
                onClick={() => handleSkillToggle(skill)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                  isSelected
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {skill}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Experience Level */}
      <div>
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
          Experience
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {['All', 'Fresher', '0-1 year', '1-3 years', '3-5 years', '5+ years'].map((exp) => (
            <button
              key={exp}
              onClick={() => onFilterChange('experienceLevel', exp === filters.experienceLevel ? 'All' : exp)}
              className={`py-1.5 px-2 text-xs font-medium rounded-lg border transition text-center ${
                (filters.experienceLevel || 'All') === exp
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {exp}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Work Mode */}
      <div>
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
          Work Mode
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {['All', 'On-site', 'Hybrid', 'Remote'].map((wm) => (
            <button
              key={wm}
              onClick={() => onFilterChange('workMode', wm === filters.workMode ? 'All' : wm)}
              className={`py-1.5 text-xs font-medium rounded-lg border transition text-center ${
                (filters.workMode || 'All') === wm
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {wm}
            </button>
          ))}
        </div>
      </div>

      {/* 6. Freshness */}
      <div>
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-2">
          <Clock className="w-3.5 h-3.5 text-indigo-600" />
          Posted Within
        </label>
        <select
          value={filters.postedWithin || ''}
          onChange={(e) => onFilterChange('postedWithin', e.target.value)}
          className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Any Time</option>
          <option value="1h">Last 1 Hour</option>
          <option value="today">Today (Last 24 Hours)</option>
          <option value="3d">Last 3 Days</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>

      {/* 7. Walk-in toggle */}
      <div className="pt-2 border-t border-slate-100">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.walkIn === 'true' || filters.walkIn === true}
            onChange={(e) => onFilterChange('walkIn', e.target.checked ? 'true' : '')}
            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
          />
          <span className="text-xs font-bold text-slate-800">Walk-In Drives Only</span>
        </label>
      </div>
    </aside>
  );
};

export default FilterSidebar;
