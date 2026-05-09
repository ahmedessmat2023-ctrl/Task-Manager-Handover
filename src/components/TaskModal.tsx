import React, { useState, useMemo } from 'react';
import { X, Calendar, User, MapPin, Flag, Zap, Info, Sparkles, Loader2, Megaphone, Users, Mail, Check, AlertCircle as AlertIcon, Globe, Plus, Bell, Trash2 as TrashIcon, Clock } from 'lucide-react';
import { Task, Status, Priority, Shift, Reminder } from '../types';
import { OFFICES, TEAMS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
}

const KNOWN_USERS = [
  { name: 'Ahmed Essmat', email: 'ahmed@ops.com', role: 'Operations Lead' },
  { name: 'Mona KSA', email: 'mona@ksa.ops', role: 'Regional Manager' },
  { name: 'Nour UAE', email: 'nour@uae.ops', role: 'Logistics Head' },
  { name: 'Fahad KW', email: 'fahad@kw.ops', role: 'Support Analyst' },
  { name: 'Sara Qat', email: 'sara@qat.ops', role: 'Supply Chain' },
  { name: 'Omar Egy', email: 'omar@egy.ops', role: 'Fleet Manager' },
];

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

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
    reminders: [],
  });

  const [reminderTime, setReminderTime] = useState(new Date(Date.now() + 3600000).toISOString().slice(0, 16));

  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const emailError = useMemo(() => {
    if (!form.owner) return null;
    if (!EMAIL_REGEX.test(form.owner)) return 'Please enter a valid business email address';
    return null;
  }, [form.owner]);

  const suggestions = useMemo(() => {
    const input = form.owner?.toLowerCase() || '';
    if (!input || input.includes('@')) return [];
    
    return KNOWN_USERS.filter(u => 
      u.name.toLowerCase().includes(input) ||
      u.email.toLowerCase().includes(input)
    ).slice(0, 4);
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
                    {form.owner && !emailError && (
                      <motion.div 
                        initial={{ scale: 0 }} 
                        animate={{ scale: 1 }} 
                        className="flex items-center gap-1 text-[9px] font-bold text-green-600 uppercase tracking-widest"
                      >
                        <Check className="w-3 h-3" />
                        <span>Verified Format</span>
                      </motion.div>
                    )}
                  </label>
                  <div className="relative group/owner">
                    <input 
                      type="email"
                      placeholder="assignee@company.com"
                      value={form.owner}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      onChange={e => setForm({...form, owner: e.target.value})}
                      className={`w-full bg-stone/50 border rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all ${
                        emailError 
                          ? 'border-red-500 shadow-sm shadow-red-500/10' 
                          : form.owner && !emailError 
                            ? 'border-green-500/50 focus:border-green-500' 
                            : 'border-dawn focus:border-citrus'
                      }`}
                    />
                    <AnimatePresence>
                      {showSuggestions && suggestions.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute z-20 w-full mt-2 bg-white border border-dawn rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
                        >
                          <div className="px-4 py-2 bg-stone/50 border-b border-dawn">
                            <span className="text-[10px] font-black text-muted uppercase tracking-widest">Suggested Accounts</span>
                          </div>
                          {suggestions.map(u => (
                            <button
                              key={u.email}
                              type="button"
                              onClick={() => {
                                setForm({...form, owner: u.email});
                                setShowSuggestions(false);
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-citrus/5 transition-all flex items-center justify-between group active:scale-[0.98]"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-citrus/10 flex items-center justify-center text-citrus text-[10px] font-bold">
                                  {u.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="min-w-0">
                                  <span className="block text-xs font-bold text-ink truncate">{u.name}</span>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-muted truncate">{u.email}</span>
                                    <span className="w-1 h-1 rounded-full bg-stone" />
                                    <span className="text-[10px] text-citrus/60 font-semibold truncate">{u.role}</span>
                                  </div>
                                </div>
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

            <div className="space-y-4 p-6 bg-amber-50/30 rounded-2xl border border-amber-100">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-700 flex items-center gap-2">
                <Bell className="w-3 h-3" />
                <span>Operational Reminders</span>
              </label>
              
              <div className="flex gap-2">
                <input 
                  type="datetime-local"
                  value={reminderTime}
                  onChange={e => setReminderTime(e.target.value)}
                  className="flex-1 bg-white border border-amber-100 rounded-xl px-4 py-2 text-xs font-bold focus:border-amber-400 outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newReminder: Reminder = { time: reminderTime, triggered: false };
                    setForm({...form, reminders: [...(form.reminders || []), newReminder]});
                  }}
                  className="px-4 py-2 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-colors shadow-sm"
                >
                  Add Reminder
                </button>
              </div>

              {form.reminders && form.reminders.length > 0 && (
                <div className="space-y-2 mt-4">
                  {form.reminders.map((r, i) => (
                    <div key={i} className="flex items-center justify-between bg-white px-4 py-2 rounded-lg border border-amber-50 shadow-sm animate-in fade-in slide-in-from-left-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span className="text-xs font-bold text-amber-900">
                          {new Date(r.time).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newReminders = [...(form.reminders || [])];
                          newReminders.splice(i, 1);
                          setForm({...form, reminders: newReminders});
                        }}
                        className="p-1.5 text-amber-300 hover:text-red-500 transition-colors"
                      >
                        <TrashIcon className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
