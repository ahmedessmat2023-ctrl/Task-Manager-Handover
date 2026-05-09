import React, { useState } from 'react';
import { X, Calendar, User, MapPin, Flag, Zap, Info, Sparkles, Loader2 } from 'lucide-react';
import { Task, Status, Priority, Shift } from '../types';
import { OFFICES, TEAMS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
}

export default function TaskModal({ isOpen, onClose, onSave }: TaskModalProps) {
  const [form, setForm] = useState<Partial<Task>>({
    title: '',
    campaign: '',
    owner: 'Ahmed Essmat',
    country: 'KSA',
    office: 'Riyadh Office',
    team: 'Influencer Ops',
    priority: Priority.MEDIUM,
    status: Status.BACKLOG,
    shift: Shift.MORNING,
    due: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    carry: false,
    details: '',
  });

  const [isSuggesting, setIsSuggesting] = useState(false);

  if (!isOpen) return null;

  const handleAISuggest = async (field: 'title' | 'details') => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || isSuggesting) return;

    setIsSuggesting(true);
    try {
      const genAI = new GoogleGenAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

      const prompt = field === 'title' 
        ? `Improve this task title for clarity and professionalism: "${form.title}". Current context: campaign "${form.campaign}", team "${form.team}". Return only the improved title.`
        : `Expand this task description into a professional operational note: "${form.title} - ${form.details}". Context: team "${form.team}", region "${form.office}". Use bullet points if necessary.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
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
    if (!form.title) return;
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
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted block">Associated Campaign</label>
              <input 
                type="text"
                placeholder="e.g. Ramadan 2024, Brand Launch..."
                value={form.campaign}
                onChange={e => setForm({...form, campaign: e.target.value})}
                className="w-full bg-stone/50 border border-dawn rounded-xl px-6 py-3 text-sm font-bold focus:border-citrus outline-none"
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted block">Executing Team</label>
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
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted flex items-center gap-2">
                    <User className="w-3 h-3" />
                    <span>Lead Owner</span>
                  </label>
                  <input 
                    type="text"
                    value={form.owner}
                    onChange={e => setForm({...form, owner: e.target.value})}
                    className="w-full bg-stone/50 border border-dawn rounded-xl px-4 py-3 text-sm font-bold focus:border-citrus outline-none"
                  />
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
              className="px-8 py-2.5 bg-ink text-white rounded-xl text-sm font-bold hover:scale-[1.02] transition-all"
            >
              Confirm Outcome
            </button>
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
