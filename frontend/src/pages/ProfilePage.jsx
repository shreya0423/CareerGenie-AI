import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { Save, Plus, X, User, GraduationCap, Briefcase, Heart } from 'lucide-react';

const SKILL_OPTIONS = ['Python', 'JavaScript', 'Machine Learning', 'Data Analysis', 'Figma', 'UI Design', 'Finance', 'Excel', 'SQL', 'Networking', 'Security', 'Project Management', 'Agile', 'Marketing', 'SEO', 'Communication', 'Leadership', 'Statistics', 'R', 'Tableau', 'React', 'Node.js', 'Java', 'C++', 'DevOps'];
const INTEREST_OPTIONS = ['Technology', 'Design', 'Finance', 'Data', 'Security', 'Business', 'Management', 'Marketing', 'Art', 'Artificial Intelligence', 'Healthcare', 'Education', 'Science', 'Writing', 'Problem Solving', 'Entrepreneurship', 'Research'];
const EDU_OPTIONS = ["High School", "Associate's Degree", "Bachelor's Degree", "Master's Degree", "PhD", "Bootcamp", "Self-taught"];
const PERSONALITY_OPTIONS = ["Analytical", "Creative", "Leadership", "Social", "Organized", "Entrepreneurial"];
const WORK_OPTIONS = ["Remote", "Onsite", "Hybrid", "Flexible"];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    age: user?.age || '',
    education_level: user?.education_level || '',
    gpa: user?.gpa || '',
    skills: user?.skills || [],
    interests: user?.interests || [],
    personality_type: user?.personality_type || '',
    work_preference: user?.work_preference || '',
    experience_years: user?.experience_years || 0,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleItem = (field, item) => {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(item) ? f[field].filter(x => x !== item) : [...f[field], item]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await userAPI.updateProfile(form);
      updateUser(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const Section = ({ icon: Icon, title, children }) => (
    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-primary-500/15 flex items-center justify-center">
          <Icon size={16} className="text-primary-400" />
        </div>
        <h2 className="font-semibold" style={{ fontFamily: "'Sora', sans-serif" }}>{title}</h2>
      </div>
      {children}
    </div>
  );

  const TagSelector = ({ options, selected, field, color = 'primary' }) => (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const active = selected.includes(opt);
        return (
          <button key={opt} onClick={() => toggleItem(field, opt)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border
              ${active ? 'bg-primary-500/20 border-primary-500/40 text-primary-300' : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-white/20'}`}>
            {opt}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Sora', sans-serif" }}>My Profile</h1>
          <p className="text-white/40 text-sm mt-1">Build your profile for better career matches</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all
            ${saved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-gradient-to-r from-primary-500 to-accent-500 hover:opacity-90'}`}>
          <Save size={15} />
          {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save Profile'}
        </button>
      </div>

      <div className="space-y-5">
        <Section icon={User} title="Personal Info">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { key: 'age', label: 'Age', type: 'number', placeholder: '22' },
              { key: 'gpa', label: 'GPA (0-4.0)', type: 'number', placeholder: '3.5', step: '0.1' },
              { key: 'experience_years', label: 'Experience (years)', type: 'number', placeholder: '0' },
            ].map(({ key, label, type, placeholder, step }) => (
              <div key={key}>
                <label className="text-xs text-white/40 mb-1.5 block">{label}</label>
                <input type={type} step={step} value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-primary-500/50 text-sm" />
              </div>
            ))}
          </div>
        </Section>

        <Section icon={GraduationCap} title="Education & Preferences">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Education Level</label>
              <select value={form.education_level} onChange={e => setForm({ ...form, education_level: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0d0d26] border border-white/10 text-white focus:outline-none focus:border-primary-500/50 text-sm">
                <option value="">Select...</option>
                {EDU_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Personality Type</label>
              <select value={form.personality_type} onChange={e => setForm({ ...form, personality_type: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0d0d26] border border-white/10 text-white focus:outline-none focus:border-primary-500/50 text-sm">
                <option value="">Select...</option>
                {PERSONALITY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Work Preference</label>
              <select value={form.work_preference} onChange={e => setForm({ ...form, work_preference: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0d0d26] border border-white/10 text-white focus:outline-none focus:border-primary-500/50 text-sm">
                <option value="">Select...</option>
                {WORK_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
        </Section>

        <Section icon={Briefcase} title={`Skills (${form.skills.length} selected)`}>
          <TagSelector options={SKILL_OPTIONS} selected={form.skills} field="skills" />
        </Section>

        <Section icon={Heart} title={`Interests (${form.interests.length} selected)`}>
          <TagSelector options={INTEREST_OPTIONS} selected={form.interests} field="interests" />
        </Section>
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');`}</style>
    </div>
  );
}
