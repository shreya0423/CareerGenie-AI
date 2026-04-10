import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, User, BarChart3, MessageCircle, ArrowRight, Zap, Brain, Star, Target } from 'lucide-react';

const steps = [
  { num: 1, icon: User, title: 'Build Your Profile', desc: 'Add your skills, education and interests', path: '/profile', color: 'from-blue-500 to-cyan-500', done: false },
  { num: 2, icon: BookOpen, title: 'General Assessment', desc: 'Core aptitude and personality quiz', path: '/assessment', color: 'from-violet-500 to-purple-500', done: false },
  { num: 3, icon: Target, title: 'Field Assessment', desc: 'Assess specific domain knowledge', path: '/field-assessment', color: 'from-pink-500 to-rose-500', done: false },
  { num: 4, icon: Brain, title: 'Get AI Prediction', desc: 'ML model analyzes your perfect careers', path: '/results', color: 'from-emerald-500 to-teal-500', done: false },
  { num: 5, icon: BarChart3, title: 'View Results', desc: 'See match percentages and roadmaps', path: '/results', color: 'from-orange-500 to-amber-500', done: false },
];

const quickActions = [
  { icon: BookOpen, label: 'General Quiz', path: '/assessment', color: 'text-violet-400', bg: 'bg-violet-500/10' },
  { icon: Target, label: 'Field Quiz', path: '/field-assessment', color: 'text-pink-400', bg: 'bg-pink-500/10' },
  { icon: BarChart3, label: 'Results', path: '/results', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { icon: MessageCircle, label: 'AI Guide', path: '/chatbot', color: 'text-blue-400', bg: 'bg-blue-500/10' },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">👋</span>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "'Sora', sans-serif" }}>
            Welcome back, {user?.full_name?.split(' ')[0] || user?.username}!
          </h1>
        </div>
        <p className="text-white/40">Your AI-powered career discovery dashboard</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {quickActions.map(({ icon: Icon, label, path, color, bg }) => (
          <Link key={path + label} to={path}
            className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/20 hover:bg-white/[0.06] transition-all group">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">{label}</span>
          </Link>
        ))}
      </div>

      {/* Journey Steps */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>Your Career Journey</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {steps.map(({ num, icon: Icon, title, desc, path, color }) => (
            <Link key={num} to={path}
              className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/20 transition-all group relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${color} opacity-5 rounded-full -mr-8 -mt-8`} />
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 text-white font-bold text-sm`}>
                {num}
              </div>
              <h3 className="font-semibold text-white mb-1 text-sm" style={{ fontFamily: "'Sora', sans-serif" }}>{title}</h3>
              <p className="text-xs text-white/40 mb-3">{desc}</p>
              <div className="flex items-center gap-1 text-xs text-white/30 group-hover:text-primary-400 transition-colors">
                <span>Go</span> <ArrowRight size={12} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-primary-500/15 to-accent-500/15 border border-primary-500/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap size={16} className="text-primary-400" />
              <span className="text-sm font-semibold text-primary-300">Ready to get started?</span>
            </div>
            <p className="text-white/50 text-sm">Complete the career assessment to unlock your personalized AI recommendations</p>
          </div>
          <Link to="/quiz"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-sm font-semibold hover:opacity-90 transition-opacity flex-shrink-0">
            Take the Quiz <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');`}</style>
    </div>
  );
}
