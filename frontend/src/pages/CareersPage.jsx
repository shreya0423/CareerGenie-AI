import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { careerAPI } from '../services/api';
import { Search, TrendingUp, DollarSign, Map, Filter } from 'lucide-react';

const CATEGORIES = [
  'All', 'Technology & Computer Science', 'Engineering', 'Medical & Healthcare', 
  'Business & Management', 'Commerce & Finance', 'Design & Creative Arts', 
  'Science & Research', 'Law & Legal Studies', 'Architecture & Planning', 
  'Humanities & Social Sciences', 'Education & Teaching', 'Media & Communication', 
  'Hospitality & Culinary Arts', 'Agriculture & Environmental Studies', 
  'Aviation & Maritime', 'Sports & Physical Education'
];

export default function CareersPage() {
  const [careers, setCareers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    careerAPI.listCareers().then(r => { setCareers(r.data); setFiltered(r.data); }).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let f = careers;
    if (category !== 'All') f = f.filter(c => c.category === category);
    if (search) f = f.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase()));
    setFiltered(f);
  }, [search, category, careers]);

  const growthColor = (rate) => rate > 20 ? 'text-emerald-400' : rate > 10 ? 'text-amber-400' : 'text-white/50';

  return (
    <div className="text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Sora', sans-serif" }}>Explore Careers</h1>
        <p className="text-white/40 text-sm">Browse all available career paths and find your fit</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search careers..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-primary-500/50 text-sm" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border
                ${category === cat ? 'bg-primary-500/20 border-primary-500/40 text-primary-300' : 'bg-white/5 border-white/10 text-white/50 hover:text-white'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(career => (
            <div key={career.id} className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/15 hover:bg-white/[0.05] transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-sm mb-1" style={{ fontFamily: "'Sora', sans-serif" }}>{career.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50">{career.category}</span>
                </div>
              </div>

              <p className="text-xs text-white/40 leading-relaxed mb-4 line-clamp-2">{career.description}</p>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="flex items-center gap-1.5 text-xs">
                  <DollarSign size={12} className="text-emerald-400" />
                  <span className="text-white/60">${(career.avg_salary / 1000).toFixed(0)}K avg</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <TrendingUp size={12} className={growthColor(career.growth_rate)} />
                  <span className={`${growthColor(career.growth_rate)}`}>{career.growth_rate}% growth</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {career.required_skills?.slice(0, 3).map(s => (
                  <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20">{s}</span>
                ))}
              </div>

              <Link to={`/roadmap/${encodeURIComponent(career.name)}`}
                className="flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 font-medium transition-colors">
                <Map size={12} /> View Roadmap
              </Link>
            </div>
          ))}
        </div>
      )}

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');
      .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }`}</style>
    </div>
  );
}
