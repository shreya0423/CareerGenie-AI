import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, BookOpen, User, BarChart3,
  MessageCircle, Briefcase, Shield, LogOut,
  Menu, X, Brain, ChevronRight, Sparkles
} from 'lucide-react';
import AIChatbot from '../AIChatbot';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/assessment', icon: BookOpen, label: 'Career Assessment' },
  { path: '/profile', icon: User, label: 'My Profile' },
  { path: '/results', icon: BarChart3, label: 'Results' },
  { path: '/careers', icon: Briefcase, label: 'Explore Careers' },
  { path: '/chatbot', icon: MessageCircle, label: 'AI Guide' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

  const dropdownRef = useRef();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // ✅ Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0a0a1a] font-body text-white">

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 bg-[#0d0d26] border-r border-white/5 flex flex-col flex-shrink-0`}>
        
        <div className="p-5 flex items-center gap-3 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
            <Brain size={20} className="text-white" />
          </div>
          {sidebarOpen && (
            <span className="font-display font-bold text-sm leading-tight">
              Career<br />AI System
            </span>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
                ${active
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={18} />
                {sidebarOpen && <span className="text-sm">{label}</span>}
                {sidebarOpen && active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}

          {user?.is_admin && (
            <Link
              to="/admin"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl
              ${location.pathname === '/admin'
                ? 'bg-amber-500/20 text-amber-400'
                : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <Shield size={18} />
              {sidebarOpen && <span className="text-sm">Admin</span>}
            </Link>
          )}
        </nav>

        <div className="p-4 mt-auto border-t border-white/5 opacity-40 hover:opacity-100">
          <div className="px-3 py-2 rounded-xl bg-white/5 text-[10px] text-center uppercase tracking-widest font-bold">
            Career AI v2
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">

        {/* Topbar */}
        <header className="h-16 border-b border-white/5 bg-[#0d0d26]/50 backdrop-blur flex items-center px-6">
          
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div className="flex-1" />

          {/* ✅ PROFILE DROPDOWN (FINAL FIX) */}
          <div className="relative" ref={dropdownRef}>
            
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-xs font-bold">
                {(user?.full_name || user?.username || '?')[0].toUpperCase()}
              </div>
              <ChevronRight size={14} className={`transition-transform ${profileOpen ? 'rotate-180' : 'rotate-90'}`} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-[#1a1a2e] border border-white/10 rounded-2xl shadow-2xl p-5 z-50">
                
                <div className="flex flex-col gap-4">

                  <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-lg font-bold">
                      {(user?.full_name || user?.username || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{user?.full_name || user?.username}</p>
                      <p className="text-xs text-white/40">{user?.email}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] text-primary-400 uppercase mb-2 flex gap-1 items-center">
                      <BookOpen size={10} /> Education
                    </p>
                    <p className="text-xs text-white/70">
                      {user?.education_level || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-accent-400 uppercase mb-2 flex gap-1 items-center">
                      <Sparkles size={10} /> Skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(user?.skills || []).length > 0 ? (
                        user.skills.map((s, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-white/60">
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-white/30 italic">
                          No skills added
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="mt-2 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white text-xs font-semibold"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>

                </div>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
          <AIChatbot />
        </main>

      </div>
    </div>
  );
}