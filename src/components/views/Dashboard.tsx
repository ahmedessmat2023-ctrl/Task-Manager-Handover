import React from 'react';
import { Task, Handover, Priority, Status } from '../../types';
import { AlertCircle, ArrowRight, Zap, TrendingUp, Clock, Layout, CheckSquare, Globe, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  tasks: Task[];
  handovers: Handover[];
  stats: {
    openCount: number;
    riskCount: number;
    carryCount: number;
    handoverCount: number;
  };
}

export default function Dashboard({ tasks, handovers, stats }: DashboardProps) {
  const risks = tasks.filter(t => t.priority === Priority.HIGH || t.status === Status.BLOCKED).slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Hero Rhythm Section */}
      <section className="grid grid-cols-3 gap-6">
        <div className="col-span-2 glass-card relative overflow-hidden group">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-citrus/10 text-citrus rounded-lg border border-citrus/20 text-xs font-bold mb-4 uppercase tracking-widest">
              <Zap className="w-3 h-3" />
              <span>Live Operating Pulse</span>
            </div>
            <h2 className="relaxed-title text-4xl mb-4 max-w-lg">Your workspace is steady today, Ahmed.</h2>
            <p className="text-muted font-medium mb-8 max-w-xl leading-relaxed">
              There are <span className="text-ink font-bold">{stats.openCount} open outcomes</span> across all regions. 
              Focus on the <span className="text-red-500 font-bold">{stats.riskCount} items marked for attention</span> before shift end.
            </p>
            <div className="flex gap-4">
              <button className="px-6 py-2.5 bg-ink text-white rounded-xl font-bold text-sm hover:scale-[1.02] transition-all">
                Review Risks
              </button>
              <button className="px-6 py-2.5 bg-stone border border-dawn text-muted rounded-xl font-bold text-sm hover:bg-slate-soft transition-all">
                View Reports
              </button>
            </div>
          </div>
          
          <div className="absolute right-[-40px] bottom-[-40px] opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
            <Layout className="w-[300px] h-[300px]" />
          </div>
        </div>

        <div className="glass-card flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-1">Health Metric</span>
              <span className="relaxed-title text-3xl">78%</span>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
          </div>
          <div className="mt-8 mb-4">
            <div className="flex justify-between text-xs font-bold mb-2">
              <span className="text-muted">Target Completion</span>
              <span className="text-ink">122 / 156 items</span>
            </div>
            <div className="h-2 bg-dawn rounded-full overflow-hidden">
              <div className="h-full bg-green-500 w-[78%] rounded-full shadow-sm" />
            </div>
          </div>
          <p className="text-[10px] font-bold text-muted/60 leading-relaxed uppercase tracking-wider">
            Optimized for current Cairo HQ shift metrics.
          </p>
        </div>
      </section>

      {/* KPI Row */}
      <section className="grid grid-cols-4 gap-6">
        {[
          { label: 'Open Tasks', val: stats.openCount, note: 'Outcome pending', icon: CheckSquare },
          { label: 'Risk Items', val: stats.riskCount, note: 'Action required', icon: AlertCircle, color: 'text-red-500' },
          { label: 'Carry-over', val: stats.carryCount, note: 'Multi-shift', icon: RefreshCw, color: 'text-citrus' },
          { label: 'Active Hubs', val: 4, note: 'Connected offices', icon: Globe, color: 'text-blue-500' },
        ].map((kpi, i) => (
          <div key={i} className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">{kpi.label}</span>
              <kpi.icon className={`w-4 h-4 ${kpi.color || 'text-muted'}`} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="relaxed-title text-3xl">{kpi.val}</span>
              <span className="text-xs font-bold text-muted/60">{kpi.note}</span>
            </div>
          </div>
        ))}
      </section>

      {/* Main Grid: Risks & Handover */}
      <section className="grid grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="relaxed-title text-xl">Immediate Priorities</h3>
            <button className="text-xs font-bold text-muted hover:text-ink transition-colors px-3 py-1 border border-dawn rounded-lg">View All</button>
          </div>
          <div className="space-y-3">
            {risks.map(task => (
              <div key={task.id} className="p-4 bg-white border border-dawn rounded-2xl hover:border-citrus/20 hover:shadow-md transition-all group cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-xl flex-shrink-0 ${task.status === Status.BLOCKED ? 'bg-red-50 text-red-500' : 'bg-citrus/5 text-citrus'}`}>
                    {task.status === Status.BLOCKED ? <AlertCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-sm font-bold text-ink truncate group-hover:text-citrus transition-colors">{task.title}</span>
                    <div className="flex items-center gap-3 mt-1 underline-offset-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted">{task.owner}</span>
                      <span className="w-1 h-1 bg-dawn rounded-full" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted">{task.office}</span>
                      <span className="w-1 h-1 bg-dawn rounded-full" />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${task.priority === Priority.HIGH ? 'text-red-500' : 'text-citrus'}`}>{task.priority}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-dawn group-hover:text-ink transition-colors opacity-0 group-hover:opacity-100" />
                </div>
              </div>
            ))}
            {risks.length === 0 && (
              <div className="p-8 text-center bg-stone/30 border border-dashed border-dawn rounded-3xl">
                <p className="text-sm font-bold text-muted">A clear list. No urgent risks currently.</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="relaxed-title text-xl">Recent Transfers</h3>
            <button className="text-xs font-bold text-muted hover:text-ink transition-colors px-3 py-1 border border-dawn rounded-lg">History</button>
          </div>
          <div className="space-y-4 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[1px] before:bg-dawn">
            {handovers.map(ho => (
              <div key={ho.id} className="relative pl-10">
                <div className="absolute left-0 top-0 w-[35px] h-[35px] bg-white border border-dawn rounded-full flex items-center justify-center z-10 ring-4 ring-stone">
                  <RefreshCw className="w-4 h-4 text-citrus" />
                </div>
                <div>
                   <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-black uppercase tracking-widest text-ink">{ho.fromShift} → {ho.toShift}</span>
                      {ho.status === 'Pending' ? (
                        <span className="px-2 py-0.5 bg-citrus/10 text-citrus rounded-md text-[9px] font-black uppercase tracking-tighter border border-citrus/20">Pending</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-md text-[9px] font-black uppercase tracking-tighter border border-green-100">Sync Clear</span>
                      )}
                   </div>
                   <p className="text-xs font-bold text-muted leading-relaxed">
                    {ho.outgoing} transferred <span className="text-ink">{ho.taskIds.length} tasks</span> from {ho.fromOffice} to {ho.toOffice}.
                   </p>
                   <span className="block text-[10px] font-bold text-muted/60 mt-2">
                    Handover initiated {new Date(ho.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

