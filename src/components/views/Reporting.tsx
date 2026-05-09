import React from 'react';
import { Task, Handover, Status, Priority } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { TrendingUp, Users, Globe, ExternalLink, Download, FileText, CheckCircle, AlertCircle, RefreshCw, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface ReportingProps {
  tasks: Task[];
  handovers: Handover[];
  stats: {
    openCount: number;
    riskCount: number;
    carryCount: number;
    handoverCount: number;
  };
}

export default function Reporting({ tasks, handovers, stats }: ReportingProps) {
  // Analytical processing
  const totalCompleted = tasks.filter(t => t.status === Status.DONE).length;
  const closureRate = tasks.length > 0 ? (totalCompleted / tasks.length) * 100 : 0;
  
  const tasksByTeam = tasks.reduce((acc, t) => {
    acc[t.team] = (acc[t.team] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const teamData = Object.entries(tasksByTeam).map(([name, value]) => ({ name, value }));

  const tasksByCountry = tasks.reduce((acc, t) => {
    acc[t.country] = (acc[t.country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const countryData = Object.entries(tasksByCountry).map(([name, value]) => ({ name, value }));

  const statusData = Object.values(Status).map(s => ({
    name: s,
    value: tasks.filter(t => t.status === s).length
  }));

  const COLORS = ['#1E293B', '#FFD23F', '#3B82F6', '#EF4444', '#10B981', '#6366F1'];

  return (
    <div className="space-y-10 pb-20">
      {/* Leadership Briefing Header */}
      <section className="glass-card bg-citrus/5 border-citrus/20 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-citrus/10 text-citrus rounded-lg border border-citrus/20 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            <Zap className="w-3 h-3" />
            <span>AI Synthetic Synthesis</span>
          </div>
          <h2 className="relaxed-title text-3xl mb-3">Executive Summary Brief</h2>
          <p className="text-muted font-medium max-w-2xl leading-relaxed">
            The workspace is operating at <span className="text-ink font-bold">{closureRate.toFixed(1)}% closure velocity</span>. 
            There are {stats.riskCount} risks identified in the KSA/UAE corridor requiring immediate mitigation. 
            Carry-over volume has {stats.carryCount > 3 ? 'increased' : 'stabilized'} compared to the previous shift cycle.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-dawn rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-stone transition-all">
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-ink text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg shadow-ink/20">
            <FileText className="w-3.5 h-3.5" />
            <span>Copy Brief</span>
          </button>
        </div>
      </section>

      {/* KPI Stats Row */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Closure Rate', val: `${closureRate.toFixed(1)}%`, icon: CheckCircle, color: 'text-green-500', trend: '+4% vs Yesterday' },
          { label: 'Risk Intensity', val: stats.riskCount, icon: AlertCircle, color: 'text-red-500', trend: 'Critical Attention' },
          { label: 'Shift Transfers', val: handovers.length, icon: RefreshCw, color: 'text-citrus', trend: 'Continuity Active' },
          { label: 'Global Load', val: tasks.length, icon: Globe, color: 'text-blue-500', trend: 'Active outcomes' },
        ].map((kpi, i) => (
          <div key={i} className="glass-card p-6 relative overflow-hidden group">
             <div className="flex items-center justify-between mb-4">
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">{kpi.label}</span>
               <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
             </div>
             <div className="flex items-baseline gap-2 mb-2">
               <span className="relaxed-title text-3xl font-bold">{kpi.val}</span>
             </div>
             <div className="text-[10px] font-bold text-muted/60 uppercase tracking-widest">
               {kpi.trend}
             </div>
          </div>
        ))}
      </section>

      {/* Charts Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="relaxed-title text-xl">Workload by Department</h3>
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-1">Outcome distribution per team</p>
            </div>
            <ExternalLink className="w-4 h-4 text-dawn" />
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748B' }} width={100} />
                <RechartsTooltip 
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', padding: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#1E293B" radius={[0, 4, 4, 0]} barSize={20}>
                  {teamData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="relaxed-title text-xl">Regional Performance</h3>
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-1">Total outcome load per country</p>
            </div>
            <Globe className="w-4 h-4 text-dawn" />
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={countryData} margin={{ top: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748B' }} />
                <RechartsTooltip 
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', padding: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={30}>
                  {countryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[COLORS.length - 1 - (index % COLORS.length)]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* State Breakdown Segment */}
      <section className="glass-card">
        <div className="flex items-center gap-2 mb-8">
          <TrendingUp className="w-5 h-5 text-citrus" />
          <h3 className="relaxed-title text-xl">Operating State Analysis</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {statusData.map((item, i) => (
            <div key={i} className="p-5 bg-stone/30 rounded-2xl border border-dawn text-center">
              <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-2">{item.name}</span>
              <span className="relaxed-title text-2xl mb-1 block">{item.value}</span>
              <div className="h-1 bg-dawn rounded-full overflow-hidden mt-3 max-w-[60px] mx-auto">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.value / tasks.length) * 100}%` }}
                  className="h-full bg-ink"
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
