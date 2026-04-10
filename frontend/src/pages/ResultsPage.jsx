import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { careerAPI, assessmentAPI } from '../services/api';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts';
import { Brain, DollarSign, Sparkles, Briefcase, Activity } from 'lucide-react';

const COLORS = ['#6366f1', '#a855f7', '#06b6d4'];

export default function ResultsPage() {
  const { user } = useAuth();
  const [results, setResults] = useState(null);
  const [fieldResults, setFieldResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    // Check local storage for initial tab
    const type = localStorage.getItem('assessment_type') || 'general';
    setActiveTab(type);

    const savedField = localStorage.getItem('field_assessment_result');
    if (savedField) {
      setFieldResults(JSON.parse(savedField));
    }
  }, []);

  const runPrediction = async () => {
    setLoading(true);
    setError('');

    try {
      const scores = JSON.parse(localStorage.getItem('assessment_scores') || '{}');
      const legacyScores = JSON.parse(localStorage.getItem('assessment_legacy') || '{}');
      const insightsArray = JSON.parse(localStorage.getItem('assessment_insights') || '[]');

      const payload = {
        skills: user?.skills || [],
        interests: user?.interests || [],
        education_level: user?.education_level || "Bachelor's Degree",
        gpa: parseFloat(user?.gpa) || 3.0,
        personality_type: user?.personality_type || 'Analytical',
        experience_years: parseInt(user?.experience_years) || 0,
        quiz_scores: legacyScores,
      };

      const res1 = await careerAPI.predict(payload);
      const ml_recs = res1.data.recommendations;

      let aiData = null;
      let roadmapData = [];
      let topFields = [];
      try {
        const res2 = await assessmentAPI.result({
          scores: scores,
          ml_recommendations: ml_recs
        });
        aiData = res2.data.ai_recommendation || { raw: "⚠️ AI insights unavailable structure." };
        roadmapData = res2.data.roadmap || [];
        // Extract top fields from /submit API response if stored, else from AI stream
        topFields = aiData.streams || ml_recs.map(m => m.career_name).slice(0, 3) || [];
      } catch (err) {
        console.error("AI recommendation failed", err);
        aiData = { raw: "⚠️ AI insights unavailable. Showing ML predictions only." };
      }

      setResults({
        traditional: ml_recs,
        ai: aiData,
        roadmap: roadmapData,
        categoryScores: scores,
        insights: insightsArray,
        topFields: topFields
      });

    } catch (e) {
      setError('Prediction failed. Ensure you have completed the assessment.');
    } finally {
      setLoading(false);
    }
  };

  const barData = results?.traditional?.map((r) => ({
    name: r.career_name?.split(' ').slice(0, 2).join(' '),
    match: r.match_percentage,
  })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#020617] to-[#0f172a] text-white p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Brain className="text-indigo-400" />
          Career AI Dashboard
        </h1>

        <div className="flex items-center gap-3">
          <Link
            to="/assessment"
            className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 font-semibold shadow-sm transition"
          >
            Retake Assessment
          </Link>
          <Link
            to="/field-assessment"
            className="px-6 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30 font-semibold transition"
          >
            Field Assessment
          </Link>
        </div>
      </div>

      {/* TABS (Glassmorphism) */}
      <div className="flex p-1 bg-white/5 rounded-2xl w-fit mb-10 border border-white/10 backdrop-blur-md relative mx-auto shadow-lg">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${activeTab === 'general' ? 'bg-gradient-to-r from-indigo-500/80 to-purple-500/80 text-white shadow-lg' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
        >
          <Activity size={18} /> General Assessment
        </button>
        <button
          onClick={() => setActiveTab('field')}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${activeTab === 'field' ? 'bg-gradient-to-r from-emerald-500/80 to-teal-500/80 text-white shadow-lg' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
        >
          <Briefcase size={18} /> Field-Based Assessment
        </button>
      </div>

      {error && <div className="text-red-400 mb-4 text-center">{error}</div>}

      {/* -------------------- GENERAL TAB -------------------- */}
      {activeTab === 'general' && (
        <>
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-white/70 space-y-4">
              <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
              <p className="animate-pulse text-lg tracking-wide text-indigo-200">Analyzing your profile & synthesizing AI insights...</p>
            </div>
          )}

          {!results && !loading && (
            <div className="text-center py-20 text-indigo-200/50 flex flex-col items-center">
              <Sparkles size={48} className="mb-4 text-indigo-400/30" />
              <p className="text-xl font-light tracking-wider">Click below to generate your personalized career plan</p>
              <button
                onClick={runPrediction}
                className="mt-8 px-8 py-3 rounded-full bg-indigo-500 border border-indigo-400 hover:bg-indigo-600 hover:scale-105 transition-all text-white backdrop-blur-md shadow-[0_0_20px_rgba(99,102,241,0.5)]"
              >
                ✨ Get AI Insights
              </button>
            </div>
          )}

          {results && results.traditional && !loading && (
            <>
              {/* CATEGORY SCORES & INSIGHTS (NEW ASSESSMENT UI) */}
              <div className="grid md:grid-cols-2 gap-6 mb-10">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shrink-0">
                  <h3 className="mb-4 font-bold text-xl text-white">📊 Assessment Scores</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {results.categoryScores && Object.entries(results.categoryScores).map(([cat, score]) => (
                      <div key={cat} className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                        <p className="text-xs text-white/50 uppercase tracking-widest">{cat}</p>
                        <p className="text-2xl font-black text-indigo-300 mt-1">{score}%</p>
                        <div className="w-full bg-black/30 h-1.5 rounded-full mt-2">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${score}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 backdrop-blur-xl shrink-0">
                  <h3 className="mb-4 font-bold text-xl text-indigo-300">💡 Assessment Insights & Top Fields</h3>
                  <p className="text-sm text-indigo-200 mb-3">Based on your evaluation, AI has predicted these top domains for you:</p>
                  <div className="flex gap-2 flex-wrap mb-4">
                    {results.topFields?.map((tf, i) => (
                      <span key={i} className="px-3 py-1 bg-indigo-500 border border-indigo-400 text-white rounded-full text-xs shadow-md">⭐ {tf}</span>
                    ))}
                  </div>
                  <ul className="space-y-2 max-h-32 overflow-y-auto">
                    {results.insights?.map((insight, idx) => (
                      <li key={idx} className="flex items-start gap-4 p-2 rounded-xl bg-white/5 backdrop-blur-md shadow-sm border border-indigo-500/10">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 saturate-200 shrink-0" />
                        <span className="text-sm font-medium text-indigo-50">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <hr className="border-white/5 my-8" />

              <h2 className="text-2xl font-bold mb-6">🎯 ML Prediction Outcomes</h2>
              
              <div className="grid md:grid-cols-3 gap-6 mb-10">
                {results.traditional.map((r, i) => (
                  <div key={i} className={`p-6 rounded-2xl backdrop-blur-xl border border-white/10 shadow-xl transition hover:scale-[1.03] ${i === 0 ? 'bg-indigo-500/10 border-indigo-400/30' : 'bg-white/5'}`}>
                    {i === 0 && <span className="text-xs bg-indigo-500/30 px-2 py-1 rounded-full">⭐ Best Match</span>}
                    <h3 className="text-lg font-bold mt-2">{r.career_name}</h3>
                    <p className="text-indigo-400 mt-2 font-semibold">{r.match_percentage}% Match</p>
                    <p className="text-green-400 flex items-center gap-1 text-sm mt-1"><DollarSign size={14} /> ${(r.avg_salary / 1000).toFixed(0)}K</p>
                    <Link to={`/roadmap/${encodeURIComponent(r.career_name)}`} className="block mt-4 text-sm text-purple-400 hover:underline">View Roadmap →</Link>
                  </div>
                ))}
              </div>

              <div className="mb-10 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                <h3 className="mb-4 font-semibold text-lg">📊 Match Comparison</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barData}>
                    <XAxis dataKey="name" stroke="#aaa" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="match" radius={[6, 6, 0, 0]}>
                      {barData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {results.ai && (
                <div className="mb-10 p-8 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 border border-white/10 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] -z-10 group-hover:bg-purple-500/30 transition-all"></div>
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 tracking-wide">
                    <Sparkles className="text-purple-400 animate-pulse" /> AI Career Advisor Insights
                  </h2>
                  {results.ai.raw ? (
                    <p className="text-white/70 italic p-4 bg-white/5 rounded-xl border border-white/10">{results.ai.raw}</p>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-8">
                       <div className="md:col-span-2 p-6 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] transition">
                        <h4 className="text-green-400 font-semibold mb-2">💡 Reasoning</h4>
                        <p className="text-sm/relaxed text-white/80 mt-1">{results.ai.reason}</p>
                      </div>
                      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] transition">
                        <h4 className="text-purple-400 font-semibold mb-3">🎓 Suggested Degrees (Courses)</h4>
                        <ul className="space-y-2">
                          {(results.ai.courses || []).map((c, i) => <li key={i} className="flex items-start gap-2 text-sm text-white/80"><div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0"></div><span>{c}</span></li>)}
                        </ul>
                      </div>
                      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] transition">
                        <h4 className="text-yellow-400 font-semibold mb-3">⚡ Suggested Skills</h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {(results.ai.skills || []).map((s, i) => (
                            <span key={i} className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 rounded-lg text-xs">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* -------------------- FIELD TAB -------------------- */}
      {activeTab === 'field' && (
        <>
          {!fieldResults ? (
             <div className="text-center py-20 text-emerald-200/50 flex flex-col items-center">
              <Briefcase size={48} className="mb-4 text-emerald-400/30" />
              <p className="text-xl font-light tracking-wider">You haven't completed a Field-Based Assessment yet.</p>
              <Link
                to="/field-assessment"
                className="mt-8 px-8 py-3 rounded-full bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:scale-105 transition-all font-bold"
              >
                Start Field Assessment
              </Link>
             </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Field Summary Card */}
              <div className="mb-8 p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 border border-emerald-500/20 backdrop-blur-xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/20 rounded-full blur-[60px] pointer-events-none"></div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-sm font-semibold text-emerald-400 uppercase tracking-widest mb-1">Targeted Field</h2>
                    <p className="text-3xl font-bold text-white">{fieldResults.field}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-emerald-200/60 font-medium">Domain Expertise Score</p>
                    <p className="text-4xl font-black text-emerald-400">{fieldResults.score}%</p>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-black/40 h-2 rounded-full mb-6">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full" style={{ width: `${fieldResults.score}%` }} />
                </div>
              </div>

              {/* UG Courses Map */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:border-white/20 transition-all">
                  <h3 className="mb-4 font-bold text-xl text-teal-300 flex items-center gap-2"><Briefcase size={20}/> Mapping to UG Degrees</h3>
                  <div className="flex flex-wrap gap-3">
                    {fieldResults.ug_courses?.map((course, idx) => (
                      <span key={idx} className="px-4 py-2 bg-teal-500/10 border border-teal-500/30 text-teal-100 rounded-lg text-sm font-medium shadow-sm">
                        {course}
                      </span>
                    ))}
                    {(!fieldResults.ug_courses || fieldResults.ug_courses.length === 0) && (
                      <span className="text-white/50 text-sm">No specific degrees mapped directly.</span>
                    )}
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:border-white/20 transition-all">
                  <h3 className="mb-4 font-bold text-xl text-yellow-300 flex items-center gap-2">🧠 AI Recommended Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {fieldResults.ai_recommendation?.skills?.map((s, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 rounded-lg text-sm">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Roadmap & Insights */}
              <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/[0.05] backdrop-blur-xl shadow-xl">
                 <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
                  <Sparkles className="text-emerald-400 animate-pulse" /> Strategic AI Guidance
                </h2>
                
                <div className="mb-8 p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                  <h4 className="text-emerald-400 font-semibold mb-2">💡 Why This Path</h4>
                  <p className="text-emerald-50/80 leading-relaxed">{fieldResults.ai_recommendation?.reason}</p>
                </div>

                <h4 className="text-cyan-400 font-semibold mb-4 text-lg">🗺️ Personalized Career Roadmap</h4>
                <div className="relative border-l-2 border-cyan-500/30 ml-3 space-y-6">
                  {fieldResults.roadmap?.map((step, idx) => (
                    <div key={idx} className="ml-6 relative">
                      <div className="absolute w-4 h-4 bg-cyan-500 rounded-full -left-[1.90rem] top-1 border-4 border-[#0f172a] shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-all">
                        {typeof step === 'string' ? (
                          <p className="font-medium text-white/90">{step}</p>
                        ) : (
                          <>
                             <p className="font-bold text-white/90 text-lg mb-1">{step.title}</p>
                             <p className="text-white/70 text-sm">{step.description}</p>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  {(!fieldResults.roadmap || fieldResults.roadmap.length === 0) && (
                    <p className="text-white/50 ml-6 italic">Roadmap generation processing or unavailable.</p>
                  )}
                </div>
              </div>

            </div>
          )}
        </>
      )}

    </div>
  );
}