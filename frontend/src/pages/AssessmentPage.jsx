import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assessmentAPI } from '../services/api';
import { ChevronRight, ChevronLeft, CheckCircle, Brain, Target, Compass, Heart, Activity } from 'lucide-react';

export default function AssessmentPage() {
  const [questions, setQuestions] = useState(null); // { technical: [], aptitude: [], ... }
  const [activeSection, setActiveSection] = useState('technical');
  const [answers, setAnswers] = useState({ technical: {}, aptitude: {}, personality: {}, interests: {} });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const sections = [
    { id: 'technical', label: 'Technical', icon: <Brain size={18} /> },
    { id: 'aptitude', label: 'Aptitude', icon: <Target size={18} /> },
    { id: 'personality', label: 'Personality', icon: <Compass size={18} /> },
    { id: 'interests', label: 'Interests', icon: <Heart size={18} /> },
  ];

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await assessmentAPI.getQuestions();
        setQuestions(res.data);
      } catch (err) {
        console.error('Failed to fetch assessment questions', err);
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, []);

  const handleSelect = (qId, optionObj) => {
    setAnswers(prev => ({
      ...prev,
      [activeSection]: { 
        ...prev[activeSection], 
        [qId]: optionObj
      }
    }));
  };

  const getProgress = (sectionId) => {
    if (!questions) return 0;
    const answered = Object.keys(answers[sectionId]).length;
    const total = questions[sectionId]?.length || 1;
    return (answered / total) * 100;
  };

  const currentQuestions = questions ? questions[activeSection] : [];
  const currentQIndex = questions ? sections.findIndex(s => s.id === activeSection) : 0;
  
  const isLastSection = currentQIndex === sections.length - 1;
  const isFirstSection = currentQIndex === 0;

  const handleNextSection = () => {
    if (!isLastSection) setActiveSection(sections[currentQIndex + 1].id);
  };

  const handlePrevSection = () => {
    if (!isFirstSection) setActiveSection(sections[currentQIndex - 1].id);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Format answers for backend
      const formattedAnswers = {};
      Object.keys(answers).forEach(section => {
        formattedAnswers[section] = Object.entries(answers[section]).map(([qId, opt]) => ({
          question_id: parseInt(qId),
          selected_option: opt.value,
          score_value: opt.score_value,
          career_scores: opt.career_scores || {}
        }));
      });

      const res = await assessmentAPI.submit({ answers: formattedAnswers });
      localStorage.setItem('assessment_scores', JSON.stringify(res.data.scores));
      localStorage.setItem('assessment_legacy', JSON.stringify(res.data.legacy_career_scores));
      localStorage.setItem('assessment_insights', JSON.stringify(res.data.insights));
      navigate('/results');
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 text-white">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
      <p className="mt-4 text-indigo-200 animate-pulse">Loading Intelligent Assessment...</p>
    </div>
  );

  // Overall check if all questions are answered
  const totalQuestions = sections.reduce((acc, s) => acc + (questions?.[s.id]?.length || 0), 0);
  const totalAnswered = sections.reduce((acc, s) => acc + Object.keys(answers[s.id]).length, 0);
  const allAnswered = totalQuestions > 0 && totalAnswered === totalQuestions;

  return (
    <div className="max-w-4xl mx-auto text-white flex flex-col gap-8 pb-10" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* HEADER & TABS */}
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold flex items-center gap-3" style={{ fontFamily: "'Sora', sans-serif" }}>
          <Activity className="text-indigo-400" size={28} />
          Intelligent Assessment
        </h1>

        {/* Section Tabs (Glassmorphism) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-white/5 p-2 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg">
          {sections.map((sec) => {
            const isActive = activeSection === sec.id;
            const prog = getProgress(sec.id);
            return (
              <button 
                key={sec.id} 
                onClick={() => setActiveSection(sec.id)}
                className={`relative overflow-hidden flex flex-col items-center justify-center gap-2 p-3 rounded-xl transition-all duration-300
                  ${isActive 
                    ? 'bg-gradient-to-br from-indigo-500/80 to-purple-500/80 text-white shadow-xl shadow-indigo-500/20 shadow-inner' 
                    : 'hover:bg-white/5 text-white/50'}`}
              >
                <div className="flex items-center gap-2 z-10 w-full justify-center">
                  {sec.icon} <span className="font-semibold text-sm">{sec.label}</span>
                </div>
                {/* Micro Progress Bar inside Tab */}
                <div className="w-full bg-black/20 h-1.5 rounded-full mt-1 z-10 overflow-hidden">
                  <div className={`h-full bg-white transition-all duration-500 ease-out`} style={{ width: `${prog}%` }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* QUESTIONS LISTING */}
      <div className="flex flex-col gap-6 relative">
        {currentQuestions.map((q, index) => {
          const selectedVal = answers[activeSection][q.id]?.value;
          return (
            <div 
              key={q.id} 
              className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:bg-white/[0.04] transition-all duration-300 transform"
            >
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-lg shrink-0 shadow-inner">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-6 leading-relaxed" style={{ fontFamily: "'Sora', sans-serif" }}>{q.text}</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {q.options.map((opt) => {
                      const isSelected = selectedVal === opt.value;
                      return (
                        <button 
                          key={opt.value}
                          onClick={() => handleSelect(q.id, opt)}
                          className={`text-left p-4 rounded-2xl border transition-all duration-200 flex items-start gap-4 hover:-translate-y-1 shadow-md
                            ${isSelected
                              ? 'border-indigo-500/50 bg-indigo-500/20 text-white shadow-indigo-500/20'
                              : 'border-white/10 bg-white/[0.02] text-white/70 hover:border-white/30 hover:bg-white/10 hover:text-white'}`}
                        >
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all mt-0.5
                            ${isSelected ? 'border-indigo-400 bg-indigo-500 text-white' : 'border-white/20 text-transparent'}`}>
                            {isSelected ? '✓' : ''}
                          </div>
                          <span className="text-sm leading-relaxed">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* NAVIGATION OUTSIDE */}
      <div className="flex items-center justify-between mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
        <button 
          onClick={handlePrevSection}
          disabled={isFirstSection}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed font-medium"
        >
          <ChevronLeft size={18} /> Previous Section
        </button>

        <div className="text-sm text-white/40 font-medium">
          Answered {totalAnswered} of {totalQuestions}
        </div>

        {isLastSection ? (
          <button 
            onClick={handleSubmit} 
            disabled={submitting || !allAnswered}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
          >
            {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle size={18} /> Submit Assessment</>}
          </button>
        ) : (
          <button 
            onClick={handleNextSection}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-all font-medium"
          >
            Next Section <ChevronRight size={18} />
          </button>
        )}
      </div>

    </div>
  );
}
