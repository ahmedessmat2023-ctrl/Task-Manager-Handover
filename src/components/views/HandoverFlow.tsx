import React, { useState } from 'react';
import { Handover, Task, Shift, Priority, Status } from '../../types';
import { RefreshCw, Calendar, MapPin, User, AlertTriangle, Send, CheckCircle2, ChevronRight, Info } from 'lucide-react';

interface HandoverFlowProps {
  handovers: Handover[];
  setHandovers: React.Dispatch<React.SetStateAction<Handover[]>>;
  tasks: Task[];
}

export default function HandoverFlow({ handovers, setHandovers, tasks }: HandoverFlowProps) {
  const [step, setStep] = useState(1);
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

  const saveHandover = () => {
    const fresh: Handover = {
      id: Math.random().toString(36).slice(2),
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
    };
    setHandovers([fresh, ...handovers]);
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

            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted block mb-2">Critical Watchouts</label>
              <textarea 
                value={newHo.watchouts}
                onChange={(e) => setNewHo({...newHo, watchouts: e.target.value})}
                placeholder="What must the next team absolutely know?"
                className="w-full bg-stone/50 border border-dawn rounded-xl px-4 py-3 text-sm font-bold min-h-[100px] focus:outline-none focus:ring-2 focus:ring-citrus/20"
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
