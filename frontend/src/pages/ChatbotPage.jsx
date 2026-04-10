import React, { useState, useRef, useEffect } from 'react';
import { chatAPI } from '../services/api';
import { Send, Bot, User, Sparkles } from 'lucide-react';

const SUGGESTIONS = [
  "What career suits me?", "How to start in tech?",
  "Best programming languages?", "How to get high salary?",
  "Remote work careers?", "Career change tips?"
];

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "👋 Hi! I'm your AI Career Guide powered by NLP! Ask me anything about careers, skills, salaries, or how to break into your dream field. I'm here to help!",
      time: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text = input) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: 'user', text: text.trim(), time: new Date() };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await chatAPI.sendMessage({ message: text.trim() });
      const { reply, suggestions } = res.data;
      setMessages(m => [...m, { role: 'assistant', text: reply, suggestions, time: new Date() }]);
    } catch {
      setMessages(m => [...m, { role: 'assistant', text: "Sorry, I'm having trouble right now. Please try again!", time: new Date() }]);
    } finally { setLoading(false); }
  };

  const formatTime = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="max-w-3xl mx-auto h-full flex flex-col text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 p-4 rounded-2xl bg-gradient-to-r from-primary-500/10 to-accent-500/10 border border-primary-500/20">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
          <Bot size={20} />
        </div>
        <div>
          <h1 className="font-bold" style={{ fontFamily: "'Sora', sans-serif" }}>AI Career Guide</h1>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white/40">Online · NLP Powered</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 min-h-0" style={{ maxHeight: 'calc(100vh - 320px)' }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 
              ${msg.role === 'assistant' ? 'bg-gradient-to-br from-primary-500 to-accent-500' : 'bg-white/10'}`}>
              {msg.role === 'assistant' ? <Bot size={15} /> : <User size={15} />}
            </div>
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed
                ${msg.role === 'assistant' ? 'bg-white/[0.05] border border-white/[0.06]' : 'bg-primary-500/20 border border-primary-500/30'}`}>
                {msg.text}
              </div>
              {msg.suggestions?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {msg.suggestions.map((s, si) => (
                    <button key={si} onClick={() => send(s)}
                      className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/60 hover:text-white hover:border-primary-500/40 transition-all">
                      {s}
                    </button>
                  ))}
                </div>
              )}
              <span className="text-xs text-white/20">{formatTime(msg.time)}</span>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Bot size={15} />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white/[0.05] border border-white/[0.06]">
              <div className="flex gap-1.5">
                {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick suggestions */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
        {SUGGESTIONS.map(s => (
          <button key={s} onClick={() => send(s)}
            className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/50 hover:text-white hover:border-primary-500/40 transition-all flex-shrink-0">
            <Sparkles size={10} className="inline mr-1" />{s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Ask about careers, skills, salaries..."
          className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-primary-500/50 text-sm transition-colors" />
        <button onClick={() => send()} disabled={!input.trim() || loading}
          className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40">
          <Send size={16} />
        </button>
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');
      .scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}
