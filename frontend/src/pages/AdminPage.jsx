import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, BarChart3, BookOpen, TrendingUp, Shield, Activity } from 'lucide-react';

const COLORS = ['#4f6ef7', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'];

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [careerPop, setCareerPop] = useState([]);
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminAPI.getStats(), adminAPI.getUsers(), adminAPI.getCareerPopularity(), adminAPI.getQuizAnalytics()])
      .then(([s, u, c, q]) => { setStats(s.data); setUsers(u.data); setCareerPop(c.data); setQuizData(q.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  const statCards = [
    { icon: Users, label: 'Total Users', value: stats?.total_users || 0, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { icon: Activity, label: 'Active Users', value: stats?.active_users || 0, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { icon: BookOpen, label: 'Quizzes Completed', value: stats?.total_quizzes_completed || 0, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { icon: TrendingUp, label: 'New Users (7d)', value: stats?.new_users_last_7_days || 0, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
          <Shield size={20} className="text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Sora', sans-serif" }}>Admin Dashboard</h1>
          <p className="text-white/40 text-sm">Platform analytics and management</p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <div className="text-2xl font-bold mb-0.5" style={{ fontFamily: "'Sora', sans-serif" }}>{value.toLocaleString()}</div>
            <div className="text-xs text-white/40">{label}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        {/* Career popularity bar */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <h3 className="font-semibold text-sm mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>Career Path Popularity</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={careerPop} layout="vertical">
              <XAxis type="number" tick={{ fill: '#ffffff40', fontSize: 10 }} />
              <YAxis type="category" dataKey="career" tick={{ fill: '#ffffff60', fontSize: 10 }} width={80} />
              <Tooltip contentStyle={{ background: '#0d0d26', border: '1px solid #ffffff15', borderRadius: 8, color: '#fff', fontSize: 12 }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {careerPop.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Career distribution pie */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <h3 className="font-semibold text-sm mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>Career Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={careerPop} dataKey="count" nameKey="career" cx="50%" cy="50%" outerRadius={70} paddingAngle={3}>
                {careerPop.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#0d0d26', border: '1px solid #ffffff15', borderRadius: 8, color: '#fff', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {careerPop.slice(0, 4).map((c, i) => (
              <div key={i} className="flex items-center gap-1 text-xs text-white/40">
                <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                {c.career.split(' ')[0]}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quiz analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Sessions', value: quizData?.total_sessions || 0, suffix: '' },
          { label: 'Completion Rate', value: quizData?.completion_rate || 0, suffix: '%' },
          { label: 'Avg Completion', value: quizData?.avg_completion_time_minutes || 0, suffix: ' min' },
        ].map(({ label, value, suffix }) => (
          <div key={label} className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
            <div className="text-3xl font-bold text-primary-400 mb-1" style={{ fontFamily: "'Sora', sans-serif" }}>{value}{suffix}</div>
            <div className="text-sm text-white/40">{label}</div>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
        <div className="p-4 border-b border-white/[0.06]">
          <h3 className="font-semibold" style={{ fontFamily: "'Sora', sans-serif" }}>Recent Users</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['ID', 'Username', 'Email', 'Education', 'Admin', 'Joined'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-white/40 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.slice(0, 10).map(u => (
                <tr key={u.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-white/40 text-xs">{u.id}</td>
                  <td className="px-4 py-3 font-medium">{u.username}</td>
                  <td className="px-4 py-3 text-white/50 text-xs">{u.email}</td>
                  <td className="px-4 py-3 text-white/40 text-xs">{u.education_level || '-'}</td>
                  <td className="px-4 py-3">
                    {u.is_admin ? <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-xs">Admin</span> : <span className="text-white/30 text-xs">User</span>}
                  </td>
                  <td className="px-4 py-3 text-white/40 text-xs">{u.created_at?.substring(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');`}</style>
    </div>
  );
}
