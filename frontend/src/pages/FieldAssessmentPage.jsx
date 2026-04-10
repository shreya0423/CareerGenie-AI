import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fieldAssessmentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ChevronRight, ChevronLeft, CheckCircle, Target, Briefcase, ChevronDown } from 'lucide-react';

export default function FieldAssessmentPage() {
  const { user } = useAuth();
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchFields() {
      try {
        const res = await fieldAssessmentAPI.getFields();
        setFields(res.data.fields || []);
      } catch (err) {
        console.error('Failed to fetch fields', err);
      } finally {
        setLoading(false);
      }
    }
    fetchFields();
  }, []);

  const handleFieldSelect = async (e) => {
    const field = e.target.value;
    setSelectedField(field);
    setAnswers({});
    if (!field) {
      setQuestions([]);
      return;
    }
    
    setLoadingQuestions(true);
    try {
      const res = await fieldAssessmentAPI.getQuestions(field);
      setQuestions(res.data.questions || []);
    } catch (err) {
      console.error("Failed to load questions", err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleSelectOption = (qId, option) => {
    setAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([qId, opt]) => ({
        question_id: parseInt(qId),
        selected_option: opt.value,
        score_value: opt.score_value
      }));

      const payload = {
        field: selectedField,
        answers: formattedAnswers,
        user_interests: user?.interests || []
      };

      const res = await fieldAssessmentAPI.submit(payload);
      
      // Store result and mark type
      localStorage.setItem('assessment_type', 'field');
      localStorage.setItem('field_assessment_result', JSON.stringify(res.data));
      
      navigate('/results');
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const totalQuestions = questions.length;
  const totalAnswered = Object.keys(answers).length;
  const allAnswered = totalQuestions > 0 && totalAnswered === totalQuestions;

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 text-white">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
      <p className="mt-4 text-emerald-200 animate-pulse">Loading Field Modules...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto text-white flex flex-col gap-8 pb-10" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold flex items-center gap-3" style={{ fontFamily: "'Sora', sans-serif" }}>
          <Briefcase className="text-emerald-400" size={28} />
          Field-Based Assessment
        </h1>
        <p className="text-white/60">Select your targeted domain and complete the specialized assessment.</p>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg">
          <label className="block text-sm font-semibold text-emerald-300 mb-3">Choose Your Target Field</label>
          <div className="relative">
            <select 
              value={selectedField}
              onChange={handleFieldSelect}
              className="w-full appearance-none bg-white/[0.04] border border-white/20 text-white rounded-xl p-4 pr-10 focus:outline-none focus:border-emerald-500 transition-all font-medium"
            >
              <option value="" className="bg-slate-900 text-white/50">-- Select a Field --</option>
              {fields.map(f => (
                <option key={f} value={f} className="bg-slate-800 text-white">{f}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          </div>
        </div>
      </div>

      {loadingQuestions && (
        <div className="flex justify-center p-10"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>
      )}

      {selectedField && questions.length > 0 && !loadingQuestions && (
        <div className="flex flex-col gap-6 relative">
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center justify-between text-emerald-200 font-medium">
            <span>Specialized Questions for {selectedField}</span>
            <span className="text-sm bg-emerald-500/20 px-3 py-1 rounded-full">{totalQuestions} Questions</span>
          </div>

          {questions.map((q, index) => {
            const selectedVal = answers[q.id]?.value;
            return (
              <div 
                key={q.id} 
                className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:bg-white/[0.04] transition-all duration-300 transform"
              >
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-lg shrink-0 shadow-inner">
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
                            onClick={() => handleSelectOption(q.id, opt)}
                            className={`text-left p-4 rounded-2xl border transition-all duration-200 flex items-start gap-4 hover:-translate-y-1 shadow-md
                              ${isSelected
                                ? 'border-emerald-500/50 bg-emerald-500/20 text-white shadow-emerald-500/20'
                                : 'border-white/10 bg-white/[0.02] text-white/70 hover:border-white/30 hover:bg-white/10 hover:text-white'}`}
                          >
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all mt-0.5
                              ${isSelected ? 'border-emerald-400 bg-emerald-500 text-white' : 'border-white/20 text-transparent'}`}>
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

          <div className="flex items-center justify-between mt-4 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm sticky bottom-6 z-10">
            <div className="text-sm text-white/40 font-medium">
              Completed {totalAnswered} of {totalQuestions}
            </div>

            <button 
              onClick={handleSubmit} 
              disabled={submitting || !allAnswered}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none ml-auto text-white"
            >
              {submitting ? (
                <div className="flex items-center gap-2"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing Field AI...</div>
              ) : (
                <><CheckCircle size={18} /> Reveal AI Roadmap</>
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
