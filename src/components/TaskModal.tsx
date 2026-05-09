import React, { useState, useMemo } from 'react';
import { X, Calendar, User, MapPin, Flag, Zap, Info, Sparkles, Loader2, Megaphone, Users, Mail, Check, AlertCircle as AlertIcon, Globe, Plus } from 'lucide-react';
import { Task, Status, Priority, Shift } from '../types';
import { OFFICES, TEAMS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
}

const KNOWN_USERS = [
  { name: 'Ahmed Essmat', email: 'ahmed@ops.com' },
  { name: 'Mona KSA', email: 'mona@ksa.ops' },
  { name: 'Nour UAE', email: 'nour@uae.ops' },
  { name: 'Fahad KW', email: 'fahad@kw.ops' },
];

export default function TaskModal({ isOpen, onClose, onSave }: TaskModalProps) {
  const [form, setForm] = useState<Partial<Task>>({
    title: '',
    campaign: '',
    owner: 'Ahmed Essmat',
    country: 'KSA',
    office: 'Riyadh Office',
    team: TEAMS[0],
    priority: Priority.MEDIUM,
    status: Status.BACKLOG,
    shift: Shift.MORNING,
    due: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    carry: false,
    details: '',
  });

  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const emailError = useMemo(() => {
    if (!form.owner) return null;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(form.owner)) return 'Invalid email format';
    return null;
  }, [form.owner]);

  const suggestions = useMemo(() => {
    if (!form.owner || form.owner.includes('@')) return [];
    return KNOWN_USERS.filter(u => 
      u.name.toLowerCase().includes(form.owner!.toLowerCase()) ||
      u.email.toLowerCase().includes(form.owner!.toLowerCase())
    );
  }, [form.owner]);

  if (!isOpen) return null;

  const handleAISuggest = async (field: 'title' | 'details') => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || isSuggesting) return;

    setIsSuggesting(true);
    try {
      const ai = new GoogleGenAI({ apiKey });

      const prompt = field === 'title' 
        ? `Improve this task title for clarity and professionalism: "${form.title}". Current context: campaign "${form.campaign}", team "${form.team}". Return only the improved title.`
        : `Expand this task description into a professional operational note: "${form.title} - ${form.details}". Context: team "${form.team}", region "${form.office}". Use bullet points if necessary.`;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      
      const text = result.text;
      
      if (text) {
        setForm(prev => ({ ...prev, [field]: text.trim() }));
      }
    } catch (error) {
      console.error('AI Suggestion Failed:', error);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || emailError) return;
    onSave(form);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          <header className="px-8 py-6 border-b border-dawn flex items-center justify-between">
            <div>
              <h2 className="relaxed-title text-2xl text-ink">New Core Outcome</h2>
              <p className="text-xs font-bold text-muted uppercase tracking-widest mt-1">Daily Task Definition</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-stone rounded-full transition-colors">
              <X className="w-5 h-5 text-muted" />
            </button>
          </header>

          <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted block">Outcome Title</label>
                <button 
                  type="button"
                  onClick={() => handleAISuggest('title')}
                  disabled={!form.title || isSuggesting}
                  className="flex items-center gap-1.5 text-[9px] font-bold text-citrus hover:text-citrus/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all uppercase tracking-widest"
                >
                  {isSuggesting ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Sparkles className="w-2.5 h-2.5" />}
                  <span>Refine Title</span>
                </button>
              </div>
              <input 
                autoFocus
                type="text"
                required
                placeholder="What is the objective?"
                value={form.title}
                onChange={e => setForm({...form, title: e.target.value})}
                className="w-full text-xl font-semibold bg-stone/30 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-citrus/20 outline-none placeholder:text-muted/40"
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted flex items-center gap-2">
                <Megaphone className="w-3 h-3" />
                <span>Associated Campaign</span>
              </label>
              <input 
                type="text"
                placeholder="e.g. Ramadan 2024, Brand Launch..."
                value={form.campaign}
                onChange={e => setForm({...form, campaign: e.target.value})}
                className="w-full bg-stone/50 border border-dawn rounded-xl px-6 py-3 text-sm font-bold focus:border-citrus outline-none"
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted flex items-center gap-2">
                <Globe className="w-3 h-3" />
                <span>Target Country</span>
              </label>
              <input 
                type="text"
                placeholder="e.g. KSA, UAE, Egypt..."
                value={form.country}
                onChange={e => setForm({...form, country: e.target.value})}
                className="w-full bg-stone/50 border border-dawn rounded-xl px-6 py-3 text-sm font-bold focus:border-citrus outline-none"
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted flex items-center gap-2">
                <Users className="w-3 h-3" />
                <span>Executing Team</span>
              </label>
              <select 
                value={form.team}
                onChange={e => setForm({...form, team: e.target.value})}
                className="w-full bg-stone/50 border border-dawn rounded-xl px-6 py-3 text-sm font-bold focus:border-citrus outline-none"
              >
                {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2 relative">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3" />
                      <span>Owner Email</span>
                    </div>
                    {form.owner && !emailError && <Check className="w-3 h-3 text-green-500" />}
                  </label>
                  <div className="relative">
                    <input 
                      type="text"
                      placeholder="assignee@company.com"
                      value={form.owner}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      onChange={e => setForm({...form, owner: e.target.value})}
                      className={`w-full bg-stone/50 border rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all ${
                        emailError ? 'border-red-500 shadow-sm shadow-red-500/10' : 'border-dawn focus:border-citrus'
                      }`}
                    />
                    <AnimatePresence>
                      {showSuggestions && suggestions.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="absolute z-10 w-full mt-2 bg-white border border-dawn rounded-xl shadow-xl overflow-hidden"
                        >
                          {suggestions.map(u => (
                            <button
                              key={u.email}
                              type="button"
                              onClick={() => {
                                setForm({...form, owner: u.email});
                                setShowSuggestions(false);
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-stone transition-colors flex items-center justify-between group"
                            >
                              <div>
                                <span className="block text-xs font-bold text-ink">{u.name}</span>
                                <span className="text-[10px] text-muted">{u.email}</span>
                              </div>
                              <Plus className="w-3 h-3 text-citrus opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  {emailError && (
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-red-500 uppercase tracking-widest mt-1">
                      <AlertIcon className="w-2.5 h-2.5" />
                      <span>{emailError}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    <span>Regional Hub</span>
                  </label>
                  <select 
                    value={form.office}
                    onChange={e => setForm({...form, office: e.target.value})}
                    className="w-full bg-stone/50 border border-dawn rounded-xl px-4 py-3 text-sm font-bold focus:border-citrus outline-none"
                  >
                    {OFFICES.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    <span>Commitment Date</span>
                  </label>
                  <input 
                    type="datetime-local"
                    value={form.due}
                    onChange={e => setForm({...form, due: e.target.value})}
                    className="w-full bg-stone/50 border border-dawn rounded-xl px-4 py-3 text-sm font-bold focus:border-citrus outline-none"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted flex items-center gap-2">
                    <Flag className="w-3 h-3" />
                    <span>Priority Level</span>
                  </label>
                  <div className="flex gap-2">
                    {Object.values(Priority).map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setForm({...form, priority: p})}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black border transition-all ${
                          form.priority === p 
                            ? 'bg-ink text-white border-ink shadow-md' 
                            : 'bg-white text-muted border-dawn hover:border-citrus'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted flex items-center gap-2">
                    <Zap className="w-3 h-3" />
                    <span>Current Status</span>
                  </label>
                  <select 
                    value={form.status}
                    onChange={e => setForm({...form, status: e.target.value as Status})}
                    className="w-full bg-stone/50 border border-dawn rounded-xl px-4 py-3 text-sm font-bold focus:border-citrus outline-none"
                  >
                    {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="p-4 bg-citrus/5 rounded-2xl border border-citrus/10 mt-auto">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 accent-citrus"
                      checked={form.carry}
                      onChange={e => setForm({...form, carry: e.target.checked})}
                    />
                    <div>
                      <span className="block text-xs font-bold text-ink">Carry over to next shift</span>
                      <span className="text-[9px] font-bold text-muted/60 leading-none">Auto-includes in next handover</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted flex items-center gap-2">
                  <Info className="w-3 h-3" />
                  <span>Detailed Notes & Description</span>
                </label>
                <button 
                  type="button"
                  onClick={() => handleAISuggest('details')}
                  disabled={!form.title || isSuggesting}
                  className="flex items-center gap-1.5 text-[9px] font-bold text-citrus hover:text-citrus/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all uppercase tracking-widest"
                >
                  {isSuggesting ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Sparkles className="w-2.5 h-2.5" />}
                  <span>Draft Notes via AI</span>
                </button>
              </div>
              <textarea 
                value={form.details}
                onChange={e => setForm({...form, details: e.target.value})}
                placeholder="Provide any additional context, background, or detailed notes for this outcome..."
                className="w-full bg-stone/50 border border-dawn rounded-2xl px-6 py-4 text-sm font-medium focus:border-citrus outline-none min-h-[100px]"
              />
            </div>
          </form>

          <footer className="px-8 py-6 bg-stone/50 border-t border-dawn flex justify-end gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-bold text-muted hover:text-ink transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={!!emailError}
              className="px-8 py-2.5 bg-ink text-white rounded-xl text-sm font-bold hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
            >
              Confirm Outcome
            </button>
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
