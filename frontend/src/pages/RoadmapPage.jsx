import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { careerAPI } from '../services/api';
import { ArrowLeft, CheckCircle, Clock, ExternalLink, BookOpen, Target } from 'lucide-react';

const PHASE_COLORS = ['from-blue-500 to-cyan-500', 'from-violet-500 to-purple-500', 'from-emerald-500 to-teal-500', 'from-orange-500 to-amber-500'];

export default function RoadmapPage() {
  const { careerName } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState({});

  useEffect(() => {
    careerAPI.getRoadmap(decodeURIComponent(careerName))
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [careerName]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  const steps = data?.roadmap?.steps || [];
  const totalTasks = steps.reduce((a, s) => a + (s.tasks?.length || 0), 0);
  const completedTasks = Object.values(completed).filter(Boolean).length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/results" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Sora', sans-serif" }}>{decodeURIComponent(careerName)} Roadmap</h1>
          <p className="text-white/40 text-sm">Your personalized career path</p>
        </div>
      </div>

      {/* Progress overview */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-primary-500/10 to-accent-500/10 border border-primary-500/20 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-primary-400" />
            <span className="font-semibold text-sm">Progress Tracker</span>
          </div>
          <span className="text-2xl font-bold text-primary-400" style={{ fontFamily: "'Sora', sans-serif" }}>{progress}%</span>
        </div>
        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-white/40 mt-2">{completedTasks} of {totalTasks} tasks completed</p>
      </div>

      {/* Roadmap phases */}
      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-white/10" />
        
        <div className="space-y-6">
          {steps.map((step, i) => (
            <div key={i} className="relative pl-20">
              {/* Phase number */}
              <div className={`absolute left-4 w-9 h-9 rounded-full bg-gradient-to-br ${PHASE_COLORS[i % PHASE_COLORS.length]} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg`}>
                {i + 1}
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/15 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-base" style={{ fontFamily: "'Sora', sans-serif" }}>{step.phase}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Clock size={13} className="text-white/30" />
                      <span className="text-xs text-white/40">{step.duration}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {step.tasks?.map((task, j) => {
                    const key = `${i}-${j}`;
                    const done = completed[key];
                    return (
                      <label key={j} className="flex items-center gap-3 cursor-pointer group">
                        <button onClick={() => setCompleted(c => ({ ...c, [key]: !c[key] }))}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0
                            ${done ? 'border-emerald-400 bg-emerald-400' : 'border-white/20 group-hover:border-primary-400'}`}>
                          {done && <CheckCircle size={12} className="text-white" />}
                        </button>
                        <span className={`text-sm transition-all ${done ? 'line-through text-white/30' : 'text-white/70'}`}>{task}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resources */}
      {data?.resources?.length > 0 && (
        <div className="mt-8 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={16} className="text-primary-400" />
            <h3 className="font-semibold" style={{ fontFamily: "'Sora', sans-serif" }}>Learning Resources</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.resources.map((r, i) => (
              <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-primary-500/15 flex items-center justify-center">
                  <ExternalLink size={14} className="text-primary-400" />
                </div>
                <span className="text-sm font-medium group-hover:text-primary-300 transition-colors">{r.title}</span>
              </a>
            ))}
          </div>
        </div>
      )}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');`}</style>
    </div>
  );
}
