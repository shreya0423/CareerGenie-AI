import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Brain, ArrowRight, Zap, BarChart3, Map, MessageCircle, Star, ChevronDown } from 'lucide-react';

const features = [
  { icon: Brain, title: 'ML-Powered Matching', desc: 'Random Forest model analyzes 12+ dimensions of your profile for precision career matching.' },
  { icon: BarChart3, title: 'Visual Analytics', desc: 'Beautiful interactive charts showing your career compatibility scores and insights.' },
  { icon: Map, title: 'Personalized Roadmaps', desc: 'Step-by-step career roadmaps with milestones, timelines, and curated resources.' },
  { icon: MessageCircle, title: 'AI Career Guide', desc: 'Chat with our intelligent bot for real-time career advice and guidance.' },
  { icon: Zap, title: '15-Question Assessment', desc: 'Science-backed quiz covering aptitude, personality, interests and technical skills.' },
  { icon: Star, title: 'Top 3 Career Matches', desc: 'Get ranked career recommendations with precise match percentages.' },
];

export default function LandingPage() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animId;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        r: Math.random() * 2 + 0.5, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.1
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(79, 110, 247, ${p.opacity})`;
        ctx.fill();
      });
      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(79, 110, 247, ${0.1 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <div className="min-h-screen bg-[#05051a] font-body text-white overflow-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif" }}>
      
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />
      
      {/* Gradient orbs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary-500/10 blur-3xl pointer-events-none" style={{ zIndex: 0 }} />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent-500/10 blur-3xl pointer-events-none" style={{ zIndex: 0 }} />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <Brain size={20} />
          </div>
          <span className="font-bold text-lg" style={{ fontFamily: "'Sora', sans-serif" }}>CareerAI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-white/60 hover:text-white text-sm font-medium transition-colors">Sign In</Link>
          <Link to="/register" className="px-5 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-sm font-semibold transition-all hover:scale-105 shadow-lg shadow-primary-500/25">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center px-4 pt-16 pb-32 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-8">
          <Zap size={14} />
          
        </div>
        
        <h1 className="text-6xl md:text-7xl font-bold leading-tight mb-6" style={{ fontFamily: "'Sora', sans-serif" }}>
          Discover Your Career 
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400"
            style={{ backgroundSize: '200% 200%', animation: 'gradient 4s linear infinite' }}>
            Ideal Career Path
          </span>
        </h1>

        <p className="text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
          Take our AI-powered assessment and get personalized career recommendations.
           Your future starts with one quiz.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link to="/register"
            className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 font-semibold text-lg hover:scale-105 transition-all shadow-2xl shadow-primary-500/30">
            Start Your Assessment
            <ArrowRight size={20} />
          </Link>
          <Link to="/login"
            className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 font-semibold text-lg hover:bg-white/10 transition-all">
            Sign In
          </Link>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-12 mt-20">
          {[['15+', 'Quiz Questions'], ['8', 'Career Paths'], ['95%', 'Accuracy'], ['3', 'Top Matches']].map(([num, label]) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-bold text-primary-400" style={{ fontFamily: "'Sora', sans-serif" }}>{num}</div>
              <div className="text-sm text-white/40 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-4 pb-32 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>Everything You Need</h2>
          <p className="text-white/40">Comprehensive tools for intelligent career discovery</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title}
              className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-primary-500/30 hover:bg-primary-500/5 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center mb-4 group-hover:bg-primary-500/20 transition-colors">
                <Icon size={22} className="text-primary-400" />
              </div>
              <h3 className="font-semibold text-white mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>{title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-4 pb-24 text-center">
        <div className="max-w-2xl mx-auto p-12 rounded-3xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-white/10">
          <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>Ready to find your path?</h2>
          <p className="text-white/50 mb-8">Join thousands who discovered their perfect career match</p>
          <Link to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 font-semibold text-lg hover:scale-105 transition-all shadow-xl">
            Begin Free Assessment <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes gradient { 0%,100% { background-position: 0% 50% } 50% { background-position: 100% 50% } }
      `}</style>
    </div>
  );
}
