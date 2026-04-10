import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizAPI } from '../services/api';
import { ChevronRight, ChevronLeft, CheckCircle, Circle, Brain } from 'lucide-react';

export default function QuizPage() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function init() {
      try {
        const [qRes, sRes] = await Promise.all([quizAPI.getQuestions(), quizAPI.startQuiz()]);
        setQuestions(qRes.data);
        setSessionId(sRes.data.session_id);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    init();
  }, []);

  const q = questions[current];
  const progress = ((current) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  const handleSelect = (optValue, optScores) => {
    setSelected(optValue);
    setTimeout(() => {
      const totalScore = Object.values(optScores || {}).reduce((a, b) => a + b, 0);
      const newAnswers = { ...answers, [q.id]: { selected_option: optValue, score_value: totalScore / Math.max(Object.keys(optScores || {}).length, 1) } };
      setAnswers(newAnswers);
      if (current < questions.length - 1) { setCurrent(current + 1); setSelected(null); }
    }, 300);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        session_id: sessionId,
        answers: Object.entries(answers).map(([qid, ans]) => ({
          question_id: parseInt(qid),
          selected_option: ans.selected_option,
          score_value: ans.score_value
        }))
      };
      const res = await quizAPI.submitQuiz(payload);
      localStorage.setItem('quiz_scores', JSON.stringify(res.data.career_scores));
      navigate('/results');
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const categoryColors = { Technical: 'text-blue-400', Aptitude: 'text-emerald-400', Personality: 'text-violet-400', Interests: 'text-pink-400' };

  return (
    <div className="max-w-3xl mx-auto text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Sora', sans-serif" }}>Career Assessment</h1>
          <span className="text-sm text-white/40">{current + 1} / {questions.length}</span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
            style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
        </div>
        
        {/* Question dots */}
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {questions.map((_, i) => (
            <button key={i} onClick={() => { setCurrent(i); setSelected(answers[questions[i].id]?.selected_option || null); }}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all
                ${i === current ? 'bg-primary-500 text-white scale-110' : answers[questions[i]?.id] ? 'bg-primary-500/30 text-primary-400' : 'bg-white/10 text-white/30'}`}>
              {answers[questions[i]?.id] ? '✓' : i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Question card */}
      {q && (
        <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/[0.08] mb-6">
          <div className="flex items-center gap-2 mb-6">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full bg-white/5 uppercase tracking-wide ${categoryColors[q.category] || 'text-white/50'}`}>
              {q.category}
            </span>
          </div>
          
          <h2 className="text-xl font-semibold mb-6 leading-relaxed" style={{ fontFamily: "'Sora', sans-serif" }}>{q.text}</h2>

          <div className="space-y-3">
            {q.options.map((opt) => {
              const isSelected = selected === opt.value || (!selected && answers[q.id]?.selected_option === opt.value);
              return (
                <button key={opt.value} onClick={() => handleSelect(opt.value, opt.career_scores)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-3
                    ${isSelected
                      ? 'border-primary-500/60 bg-primary-500/15 text-white'
                      : 'border-white/[0.06] bg-white/[0.02] text-white/70 hover:border-white/20 hover:bg-white/[0.05] hover:text-white'}`}>
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all
                    ${isSelected ? 'border-primary-400 bg-primary-500 text-white' : 'border-white/20 text-white/30'}`}>
                    {opt.value}
                  </div>
                  <span className="text-sm leading-relaxed">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => { setCurrent(Math.max(0, current - 1)); setSelected(answers[questions[current - 1]?.id]?.selected_option || null); }}
          disabled={current === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronLeft size={16} /> Previous
        </button>

        <span className="text-sm text-white/30">{answeredCount} answered</span>

        {current === questions.length - 1 ? (
          <button onClick={handleSubmit} disabled={submitting || answeredCount < questions.length}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
            {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle size={16} /> Get Results</>}
          </button>
        ) : (
          <button onClick={() => { setCurrent(Math.min(questions.length - 1, current + 1)); setSelected(answers[questions[current + 1]?.id]?.selected_option || null); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all">
            Next <ChevronRight size={16} />
          </button>
        )}
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');`}</style>
    </div>
  );
}
