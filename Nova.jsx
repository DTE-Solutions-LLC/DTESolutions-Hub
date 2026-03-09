import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Send, Mic, History, Settings as SettingsIcon, 
  CheckCircle2, AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePeriod } from '../contexts/PeriodContext';
import { useNova } from '../hooks/useNova';
import { novaAPI } from '../services/api';
import clsx from 'clsx';
import './Nova.css';

/**
 * Nova: The Behavioral Financial Conscience.
 * Refactored to use useNova hook for context and habit tracking.
 */
const Nova = () => {
  const { user } = useAuth();
  const { selectedMonth, selectedYear } = usePeriod();
  const { 
    loading, 
    stats, 
    stress, 
    insight, 
    advice,
    habitCompleted, 
    completeHabit
  } = useNova(selectedMonth, selectedYear);

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const messagesEndRef = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);

  // Initialize first message when insight is loaded
  useEffect(() => {
    if (!loading && insight && messages.length === 0) {
      setMessages([{
        id: 1,
        sender: 'nova',
        text: `Hey ${user?.name?.split(' ')[0]} 👋 ${insight.headline || "Listening to your pulse..."}<br/><br/>${insight.body || "I'm analyzing your recent patterns. How are you feeling right now?"}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'mood-check'
      }]);
    }
  }, [loading, insight, user, messages.length]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages, isTyping, scrollToBottom]);

  const handleSend = useCallback(async (overrideInput) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const history = messages.map(m => ({
        role: m.sender === 'nova' ? 'assistant' : 'user',
        content: m.text.replace(/<br\/>/g, '\n')
      }));

      const res = await novaAPI.chat(textToSend, history);
      
      if (!isMounted.current) return;
      
      setIsTyping(false);
      const novaMsg = {
        id: Date.now() + 1,
        sender: 'nova',
        text: res.data.response.replace(/\n/g, '<br/>'),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: res.data.response.includes('$') ? 'insight' : 'normal'
      };
      setMessages(prev => [...prev, novaMsg]);
    } catch (err) {
      console.error("Nova chat error:", err);
      if (isMounted.current) {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'nova',
          text: "I'm having a little trouble connecting right now. Let's try again in a second.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    }
  }, [input, messages]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  return (
    <div className="nova-shell animate-in">
      <main className="nova-chat-main">
        <div className="nova-chat-header">
          <div className="nova-id flex items-center gap-3">
            <div className="nova-orb"><div className="nova-dot" /></div>
            <div>
              <div className="nova-name font-bold text-[var(--text-primary)]">Nova</div>
              <div className="nova-desc text-[var(--text-muted)]">Your behavioral finance coach · always on</div>
            </div>
          </div>
          <div className="hdr-actions flex gap-2">
            <button className="icon-btn p-2 rounded-xl border border-[var(--border-color)] text-[var(--text-muted)] hover:bg-white/5 transition-colors" aria-label="View History"><History size={16} /></button>
            <button className="icon-btn p-2 rounded-xl border border-[var(--border-color)] text-[var(--text-muted)] hover:bg-white/5 transition-colors" aria-label="Nova Settings"><SettingsIcon size={16} /></button>
          </div>
        </div>

        {/* Structured Behavioral Insight Section */}
        {advice && (
          <section className="mx-6 mt-6 p-6 rounded-[28px] bg-[var(--accent-color)]/5 border border-[var(--accent-color)]/10 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)] shadow-[0_0_8px_var(--accent-color)]" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent-color)] font-mono">Nova’s Insight</h2>
            </div>
            <div className="text-[13px] text-[var(--text-primary)] leading-relaxed font-medium mb-5 italic">
              "{advice}"
            </div>
            {!habitCompleted ? (
              <button
                onClick={completeHabit}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[var(--accent-color)] text-[var(--bg-primary)] text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-[var(--accent-color)]/20"
              >
                <CheckCircle2 size={14} strokeWidth={3} />
                <span>I’ll do it</span>
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 text-[var(--success)] text-[10px] font-black uppercase tracking-widest bg-[var(--success)]/10 py-3 rounded-2xl border border-[var(--success)]/20 animate-in zoom-in-95">
                <CheckCircle2 size={14} />
                <span>Habit Commitment Locked</span>
              </div>
            )}
          </section>
        )}

        {showBanner && stress?.status !== 'Low' && (
          <div className="nova-insight-banner flex items-start gap-3 bg-[var(--warning)]/5 border border-[var(--warning)]/10 p-4 rounded-2xl mx-6 mt-4">
            <div className="i-dot w-2 h-2 rounded-full bg-[var(--warning)] animate-pulse mt-1" />
            <div className="i-text text-xs text-[var(--text-secondary)] leading-relaxed flex-1">
              <strong className="text-[var(--text-primary)] font-bold">Stress pattern detected</strong> — Your stress index is {stress?.overall}. This matches your historical trigger windows.
            </div>
            <button 
              className="i-dismiss text-[11px] text-[var(--accent-color)] cursor-pointer font-mono font-bold uppercase tracking-wider hover:underline" 
              onClick={() => setShowBanner(false)}
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="nova-messages scrollbar-hide" role="log">
          <div className="text-center py-6">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] font-mono">Heartbeat Sync // Today</span>
          </div>

          {messages.map((msg) => (
            <div key={msg.id} className={clsx("flex gap-4 mb-2", msg.sender === 'user' ? 'flex-row-reverse' : '')}>
              <div className={clsx(
                "w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 shadow-lg",
                msg.sender === 'nova' ? 'bg-[radial-gradient(circle_at_35%_35%,_var(--accent-bright),_var(--accent-color)_60%,_var(--green-d))] text-[var(--bg-primary)]' : 'bg-gradient-to-br from-[var(--green-d)] to-[var(--accent-color)] text-[var(--bg-primary)]'
              )}>
                {msg.sender === 'nova' ? 'N' : user?.name?.substring(0, 1).toUpperCase()}
              </div>
              <div className="max-w-[75%] space-y-2">
                <div 
                  className={clsx("nova-bubble shadow-xl", msg.sender === 'user' ? 'u' : 'n', msg.type === 'insight' ? 'insight' : '')}
                  dangerouslySetInnerHTML={{ __html: msg.text }}
                />
                
                {msg.type === 'mood-check' && (
                  <div className="mt-4 p-5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[24px] space-y-4 shadow-2xl">
                    <p className="text-[10px] text-[var(--accent-color)] font-black uppercase tracking-[0.2em] font-mono">Acknowledge Pulse ↓</p>
                    <div className="flex flex-wrap gap-2">
                      {['😤 Stressed', '😔 Low', '😐 Neutral', '😊 Good'].map(mood => (
                        <button 
                          key={mood} 
                          onClick={() => handleSend(mood)}
                          className="px-4 py-2 rounded-full border border-[var(--border-color)] text-[11px] text-[var(--text-secondary)] hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] transition-all font-bold bg-white/[0.02]"
                        >
                          {mood}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {msg.type === 'insight' && !habitCompleted && (
                  <button 
                    onClick={completeHabit}
                    className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/20 text-[var(--accent-color)] text-[11px] font-black uppercase tracking-widest hover:bg-[var(--accent-color)]/20 transition-all"
                  >
                    <CheckCircle2 size={14} />
                    I'll do it
                  </button>
                )}

                {msg.type === 'insight' && habitCompleted && (
                  <div className="mt-2 flex items-center gap-2 text-[var(--success)] text-[10px] font-bold uppercase tracking-widest px-1">
                    <CheckCircle2 size={12} />
                    Committed to focus
                  </div>
                )}

                <p className={clsx("text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] font-mono", msg.sender === 'user' ? 'text-right' : '')}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[10px] text-[var(--accent-color)] font-black">N</div>
              <div className="flex gap-1.5 p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[20px] rounded-tl-none shadow-2xl">
                <div className="w-1.5 h-1.5 bg-[var(--accent-color)]/40 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-[var(--accent-color)]/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-[var(--accent-color)]/40 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="nova-input-area">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-6 px-1">
            {[
              { label: 'Show monthly trigger cost', color: 'green' },
              { label: 'Set pause reminder', color: 'amber' },
              { label: 'What are my top triggers?', color: 'trigger' },
              { label: 'Break this habit', color: 'green' }
            ].map(s => (
              <button 
                key={s.label} 
                onClick={() => handleSend(s.label)}
                className={clsx("nova-suggestion-chip shadow-lg", s.color === 'trigger' ? 'trigger' : s.color === 'amber' ? 'amber' : '')}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="nova-input-row focus-within:border-[var(--accent-color)]/30 transition-all shadow-2xl border border-[var(--border-color)] rounded-[24px] bg-[var(--bg-secondary)]">
            <textarea 
              className="flex-1 bg-transparent border-none outline-none p-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-primary)]/20 resize-none max-h-32 min-h-[56px] font-medium"
              placeholder="Talk to Nova…"
              rows="1"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Nova Chat Input"
            />
            <div className="flex items-center gap-3 pb-3 px-3">
              <button className="p-2 text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-colors" aria-label="Voice Command"><Mic size={20} /></button>
              <button 
                onClick={() => handleSend()}
                className="w-12 h-12 rounded-[16px] bg-[var(--accent-color)] text-[var(--bg-primary)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(48,196,118,0.3)]"
                aria-label="Send Message"
              >
                <Send size={20} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      </main>

      <aside className="nova-right-panel scrollbar-hide bg-[var(--bg-secondary)] border-l border-[var(--border-color)]">
        {loading ? (
          <div className="p-8 flex flex-col items-center gap-4 animate-pulse">
            <div className="w-20 h-20 rounded-full bg-[var(--accent-color)]/10" />
            <div className="h-4 w-32 bg-[var(--accent-color)]/10 rounded" />
          </div>
        ) : (
          <>
            <div>
              <div className="text-[10px] font-black tracking-[0.3em] uppercase text-[var(--text-muted)] font-mono mb-4">Stress Index</div>
              <div className="nova-s-card !p-6 shadow-2xl border border-[var(--border-color)] bg-[var(--card-bg)] rounded-[32px]">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[13px] font-bold text-[var(--text-secondary)] tracking-tight uppercase font-mono">Current Status</span>
                  <span className={clsx(
                    "text-[10px] px-2.5 py-1 rounded-lg font-black uppercase tracking-widest",
                    stress?.status === 'Critical' ? 'bg-[var(--urgent)]/10 text-[var(--urgent)] shadow-[0_0_10px_rgba(224,85,85,0.2)]' :
                    stress?.status === 'Elevated' ? 'bg-[var(--warning)]/10 text-[var(--warning)] shadow-[0_0_10px_rgba(232,146,60,0.2)]' :
                    'bg-[var(--success)]/10 text-[var(--success)] shadow-[0_0_10px_rgba(48,196,118,0.2)]'
                  )}>
                    {stress?.status || 'Balanced'}
                  </span>
                </div>
                <div className="nova-s-ring relative w-32 h-32 mx-auto">
                  <svg viewBox="0 0 88 88" className="w-full h-full transform -rotate-90">
                    <circle cx="44" cy="44" r="37" stroke="var(--border-color)" strokeWidth="7" fill="none" opacity="0.2"/>
                    <circle 
                      cx="44" cy="44" r="37" 
                      stroke={stress?.status === 'Critical' ? 'var(--urgent)' : stress?.status === 'Elevated' ? 'var(--warning)' : 'var(--success)'} 
                      strokeWidth="7" fill="none"
                      strokeDasharray="233" 
                      strokeDashoffset={233 - (233 * (stress?.overall || 0) / 100)}
                      strokeLinecap="round"
                      className="transition-all duration-1500 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={clsx("text-2xl font-light tracking-tighter", stress?.status === 'Critical' ? 'text-[var(--urgent)]' : stress?.status === 'Elevated' ? 'text-[var(--warning)]' : 'text-[var(--success)]')}>
                      {stress?.overall || 0}
                    </span>
                    <span className="text-[9px] text-[var(--text-muted)] font-black font-mono">/ 100</span>
                  </div>
                </div>
                <div className="space-y-3 mt-6">
                  {Object.entries(stress?.factors || {}).map(([label, value]) => (
                    <div key={label} className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] font-mono">
                        <span>{label}</span>
                        <span>{value}%</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-1000" 
                          style={{ 
                            width: `${value}%`, 
                            backgroundColor: value > 70 ? 'var(--urgent)' : value > 40 ? 'var(--warning)' : 'var(--success)' 
                          }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-black tracking-[0.3em] uppercase text-[var(--text-muted)] font-mono mb-4">Trigger Clusters</div>
              <div className="nova-s-card space-y-5 !p-5 shadow-2xl border border-[var(--border-color)] bg-[var(--card-bg)] rounded-[32px]">
                {(stats?.spendingByCategory || []).slice(0, 3).map((cat, idx) => (
                  <div key={cat.category} className="flex items-center gap-4 group">
                    <div className="w-11 h-11 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                      {idx === 0 ? '🍕' : idx === 1 ? '🛍️' : '🚗'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-[var(--text-primary)] truncate tracking-tight">{cat.category}</p>
                      <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider font-mono">Behavioral Signal</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-mono font-bold text-[var(--warning)]">${cat.amount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-black tracking-[0.3em] uppercase text-[var(--text-muted)] font-mono mb-4">Growth Momentum</div>
              <div className="nova-g-card !p-6 shadow-2xl border border-[var(--border-color)] bg-[var(--card-bg)] rounded-[32px]">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="text-[14px] font-bold text-[var(--success)] tracking-tight">Savings Rate</div>
                    <div className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest font-mono">vs last cycle</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-light text-[var(--success)] tracking-tighter">+18.4%</div>
                    <div className="text-[10px] font-black text-[var(--success)] uppercase font-mono tracking-widest animate-pulse">On Track</div>
                  </div>
                </div>
                <div className="nova-g-bars items-end h-12 flex gap-1 justify-between">
                  {(stats?.dailyTrend || []).map((day, i) => (
                    <div 
                      key={i} 
                      className={clsx("flex-1 bg-[var(--success)]/20 rounded-sm", i === (stats.dailyTrend.length - 1) ? 'bg-[var(--success)] shadow-[0_0_10px_var(--success)]' : '')} 
                      style={{ height: `${Math.min((day.amount / (stats.monthlyExpenses / 7 || 1)) * 100, 100)}%` }} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
};

export default Nova;
