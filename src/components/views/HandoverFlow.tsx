import React, { useState } from 'react';
import { Handover, Task, Shift, Priority, Status } from '../../types';
import { RefreshCw, Calendar, MapPin, User, AlertTriangle, Send, CheckCircle2, ChevronRight, Info, Sparkles, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { db, auth } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface HandoverFlowProps {
  handovers: Handover[];
  tasks: Task[];
  stats: {
    openCount: number;
    riskCount: number;
    carryCount: number;
    handoverCount: number;
  };
  aiInteractions: {role: 'user' | 'assistant', content: string}[];
}

export default function HandoverFlow({ handovers, tasks, stats, aiInteractions }: HandoverFlowProps) {
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [newHo, setNewHo] = useState<Partial<Handover>>({
    fromShift: Shift.MORNING,
    toShift: Shift.MID,
    fromOffice: 'Riyadh Office',
    toOffice: 'Cairo HQ',
    outgoing: 'Ahmed Essmat',
    incoming: '',
    watchouts: '',
    taskIds: tasks.filter(t => t.carry || t.priority === Priority.HIGH).map(t => t.id)
  });

  const activeTasks = tasks.filter(t => newHo.taskIds?.includes(t.id));

  const handleAIAnalysis = async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || isAnalyzing) return;

    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const taskDetails = activeTasks.map(t => `- [${t.priority}] ${t.title}: ${t.details || 'No details'}`).join('\n');
      const otherOpenTasks = tasks.filter(t => !newHo.taskIds?.includes(t.id) && t.status !== Status.DONE)
        .map(t => `- [${t.priority}] ${t.title}`).join('\n');
      
      const recentInteractions = aiInteractions.slice(-3).map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
      
      const systemMetrics = `
        System Status Metrics:
        - Total Open Tasks: ${stats.openCount}
        - High Risk Items: ${stats.riskCount}
        - Carry-over Volume: ${stats.carryCount}
        - Handover Backlog: ${stats.handoverCount}
      `;

      const prompt = `
        You are an Operations Intelligence Assistant. Analyze the current operational state for a shift handover from ${newHo.fromShift} to ${newHo.toShift}.
        
        SELECTED HANDOVER TASKS:
        ${taskDetails}
        
        OTHER RELEVANT OPEN TASKS:
        ${otherOpenTasks || 'None'}
        
        ${systemMetrics}
        
        RECENT AI COPILOT INTERACTIONS (Context):
        ${recentInteractions || 'No recent interactions'}
        
        Synthesize a list of critical watchouts and action items for the incoming team. 
        Focus on high-priority items, potential blockers, and urgent deadlines.
        Take into account the broader context of the system metrics and recent discussions.
        Return a concise, professional operational note. Do not use markdown headers, use clear bullet points.
      `;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      
      const text = result.text;
      
      if (text) {
        setNewHo(prev => ({ ...prev, watchouts: text.trim() }));
      }
    } catch (error) {
      console.error('Handover Analysis Failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveHandover = async () => {
    if (!auth.currentUser) return;

    const fresh: Partial<Handover> = {
      date: new Date().toISOString().split('T')[0],
      fromShift: newHo.fromShift as Shift,
      toShift: newHo.toShift as Shift,
      fromOffice: newHo.fromOffice!,
      toOffice: newHo.toOffice!,
      outgoing: newHo.outgoing!,
      incoming: newHo.incoming || 'TBD',
      status: 'Pending',
      watchouts: newHo.watchouts,
      taskIds: newHo.taskIds || [],
      createdAt: new Date().toISOString(),
      creatorId: auth.currentUser.uid
    };

    await addDoc(collection(db, 'handovers'), fresh);
    setStep(3);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-center relative after:absolute after:left-0 after:right-0 after:top-1/2 after:-translate-y-1/2 after:h-[1px] after:bg-dawn after:-z-10 px-8">
        {[1, 2, 3].map((s) => (
          <div 
            key={s} 
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 z-10 ring-8 ring-stone ${
              step === s ? 'bg-citrus text-white scale-110 shadow-lg shadow-citrus/20' : 
              step > s ? 'bg-ink text-white' : 'bg-white text-muted border border-dawn'
            }`}
          >
            {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
          </div>
        ))}
      </div>

      <div className="glass-card">
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-citrus/10 rounded-xl">
                <Calendar className="w-6 h-6 text-citrus" />
              </div>
              <div>
                <h3 className="relaxed-title text-xl">Shift Structure</h3>
                <p className="text-xs font-bold text-muted/60 uppercase tracking-widest">Define the bridge</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted block mb-2">Outgoing Shift</label>
                  <select 
                    value={newHo.fromShift}
                    onChange={(e) => setNewHo({...newHo, fromShift: e.target.value as Shift})}
                    className="w-full bg-stone/50 border border-dawn rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-citrus/20"
                  >
                    {Object.values(Shift).map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted block mb-2">Source Hub</label>
                  <input 
                    type="text" 
                    value={newHo.fromOffice}
                    onChange={(e) => setNewHo({...newHo, fromOffice: e.target.value})}
                    className="w-full bg-stone/50 border border-dawn rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-citrus/20"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted block mb-2">Incoming Shift</label>
                  <select 
                     value={newHo.toShift}
                     onChange={(e) => setNewHo({...newHo, toShift: e.target.value as Shift})}
                    className="w-full bg-stone/50 border border-dawn rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-citrus/20"
                  >
                     {Object.values(Shift).map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted block mb-2">Destination Hub</label>
                  <input 
                    type="text" 
                    value={newHo.toOffice}
                    onChange={(e) => setNewHo({...newHo, toOffice: e.target.value})}
                    className="w-full bg-stone/50 border border-dawn rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-citrus/20"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3 text-blue-700">
              <Info className="w-5 h-5 flex-shrink-0" />
              <p className="text-xs font-bold leading-relaxed">
                TryGC FlowOS automatically calculates the bridge timing based on region offsets.
              </p>
            </div>

            <div className="flex justify-end mt-8">
              <button 
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-8 py-3 bg-ink text-white rounded-xl font-bold text-sm hover:translate-x-1 transition-all"
              >
                <span>Continue to Outcomes</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-citrus/10 rounded-xl">
                <Send className="w-6 h-6 text-citrus" />
              </div>
              <div>
                <h3 className="relaxed-title text-xl">Transfer Outcomes</h3>
                <p className="text-xs font-bold text-muted/60 uppercase tracking-widest">Select relevant tasks for sync</p>
              </div>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {tasks.filter(t => t.status !== Status.DONE).map(t => (
                <label 
                  key={t.id} 
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                    newHo.taskIds?.includes(t.id) ? 'bg-citrus/5 border-citrus/20 shadow-sm' : 'bg-stone/30 border-dawn hover:border-muted/30'
                  }`}
                >
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 accent-citrus"
                    checked={newHo.taskIds?.includes(t.id)}
                    onChange={(e) => {
                      const ids = newHo.taskIds || [];
                      setNewHo({...newHo, taskIds: e.target.checked ? [...ids, t.id] : ids.filter(id => id !== t.id)});
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="block text-sm font-bold text-ink truncate">{t.title}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted/60">{t.owner} · {t.priority} priority</span>
                  </div>
                </label>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted block">Critical Watchouts</label>
                <button 
                  onClick={handleAIAnalysis}
                  disabled={activeTasks.length === 0 || isAnalyzing}
                  className="flex items-center gap-1.5 text-[9px] font-bold text-citrus hover:text-citrus/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all uppercase tracking-widest"
                >
                  {isAnalyzing ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Sparkles className="w-2.5 h-2.5" />}
                  <span>Synthesize with AI</span>
                </button>
              </div>
              <textarea 
                value={newHo.watchouts}
                onChange={(e) => setNewHo({...newHo, watchouts: e.target.value})}
                placeholder="What must the next team absolutely know?"
                className="w-full bg-stone/50 border border-dawn rounded-xl px-4 py-3 text-sm font-bold min-h-[120px] focus:outline-none focus:ring-2 focus:ring-citrus/20 custom-scrollbar"
              />
            </div>

            <div className="flex justify-between mt-8">
              <button 
                onClick={() => setStep(1)}
                className="px-6 py-3 text-muted font-bold text-sm hover:text-ink transition-colors"
              >
                Back to structure
              </button>
              <button 
                onClick={saveHandover}
                className="flex items-center gap-2 px-8 py-3 bg-ink text-white rounded-xl font-bold text-sm hover:translate-x-1 transition-all"
              >
                <span>Initiate Transfer</span>
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="relaxed-title text-2xl mb-2">Handover Synchronized</h3>
            <p className="text-muted font-medium max-w-md mx-auto mb-8">
              The handover from <span className="text-ink font-bold">{newHo.fromShift}</span> to <span className="text-ink font-bold">{newHo.toShift}</span> is now active in the register.
            </p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => setStep(1)}
                className="px-6 py-2.5 bg-ink text-white rounded-xl font-bold text-sm"
              >
                Done
              </button>
              <button className="px-6 py-2.5 bg-stone border border-dawn text-muted rounded-xl font-bold text-sm">
                Copy Link
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="relaxed-title text-xl">Recent Transfer Log</h3>
        <div className="grid grid-cols-2 gap-4">
          {handovers.map(ho => (
            <div key={ho.id} className="p-4 bg-white border border-dawn rounded-2xl flex items-center justify-between">
              <div>
                <span className="block text-xs font-black uppercase tracking-widest text-ink">{ho.fromShift} → {ho.toShift}</span>
                <span className="text-[10px] font-bold text-muted/60">{ho.fromOffice} to {ho.toOffice}</span>
              </div>
              <div className="text-right">
                <span className={`block text-[10px] font-black uppercase tracking-tighter ${ho.status === 'Acknowledged' ? 'text-green-500' : 'text-citrus'}`}>{ho.status}</span>
                <span className="text-[10px] font-bold text-muted/40">{new Date(ho.createdAt).toLocaleDateString('en-GB')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
