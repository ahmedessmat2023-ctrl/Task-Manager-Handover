import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Shield, Palette, Database, CheckCircle2, Trash2, Download, Upload, AlertCircle, Save, Bell, Sliders, Globe, Users, Plus, X } from 'lucide-react';
import { db, auth } from '../../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, writeBatch, doc, getDoc, setDoc } from 'firebase/firestore';
import { logAction, ActionType } from '../../lib/auditLogger';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [theme, setTheme] = useState(localStorage.getItem('trygc_theme') || 'flow');
  const [saving, setSaving] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [config, setConfig] = useState<any>({
    sla: 30,
    teams: ['Operations', 'Success', 'Logistics', 'Marketing'],
    locations: ['Cairo', 'Riyadh', 'Dubai', 'Amman']
  });
  const [newTeam, setNewTeam] = useState('');

  useEffect(() => {
    async function loadConfig() {
      const snap = await getDoc(doc(db, 'settings', 'global'));
      if (snap.exists()) {
        setConfig(snap.data());
      }
    }
    loadConfig();
  }, []);

  const saveConfig = async (newConfig: any) => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'global'), newConfig);
      setConfig(newConfig);
      await logAction(ActionType.OFFICE_UPDATE, { type: 'global_config_update' });
    } catch (error) {
      console.error('Config save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const themes = [
    { id: 'flow', name: 'Flow Modern', desc: 'Glassmorphism & Soft Stone tones', colors: ['bg-[#FAFAF9]', 'bg-[#FFD23F]'] },
    { id: 'tech', name: 'Deep Tech', desc: 'Dark mode with Neon accents', colors: ['bg-[#0A0A0B]', 'bg-[#00F0FF]'] },
    { id: 'minimal', name: 'Swiss Minimal', desc: 'High contrast & Mono grid', colors: ['bg-white', 'bg-black'] }
  ];

  const handleThemeChange = (themeId: string) => {
    setTheme(themeId);
    localStorage.setItem('trygc_theme', themeId);
    document.documentElement.setAttribute('data-theme', themeId);
  };

  const handleExportData = async () => {
    const data: any = { tasks: [], handovers: [], offices: [] };
    
    const taskSnap = await getDocs(collection(db, 'tasks'));
    taskSnap.forEach(doc => data.tasks.push({ id: doc.id, ...doc.data() }));

    const hoSnap = await getDocs(collection(db, 'handovers'));
    hoSnap.forEach(doc => data.handovers.push({ id: doc.id, ...doc.data() }));

    const officeSnap = await getDocs(collection(db, 'offices'));
    officeSnap.forEach(doc => data.offices.push({ id: doc.id, ...doc.data() }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowos-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleResetData = async () => {
    setSaving(true);
    try {
      const collections = ['tasks', 'handovers', 'offices', 'audit_logs'];
      for (const collName of collections) {
        const snap = await getDocs(collection(db, collName));
        const batch = writeBatch(db);
        snap.forEach(d => batch.delete(d.ref));
        await batch.commit();
      }
      setShowConfirmReset(false);
      window.location.reload();
    } catch (error) {
      console.error('Reset failed:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-32">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-stone rounded-2xl border border-dawn">
             <SettingsIcon className="w-6 h-6 text-ink" />
          </div>
          <div>
            <h2 className="relaxed-title text-3xl">System Configuration</h2>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-muted">Environment & Logic Tuning</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Sidebar Nav */}
        <div className="col-span-3 space-y-2">
          {[
            { id: 'general', icon: Globe, label: 'General' },
            { id: 'appearance', icon: Palette, label: 'Appearance' },
            { id: 'operations', icon: Sliders, label: 'Ops Engine' },
            { id: 'teams', icon: Users, label: 'Team Roles' },
            { id: 'data', icon: Database, label: 'Data Management' },
            { id: 'security', icon: Shield, label: 'Security' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all group ${
                activeTab === tab.id ? 'bg-ink text-white shadow-xl shadow-ink/10' : 'text-muted hover:bg-stone'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-citrus' : 'text-muted group-hover:text-ink'}`} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="col-span-9 bg-white border border-dawn rounded-[32px] p-10 shadow-2xl min-h-[600px]">
          {activeTab === 'appearance' && (
            <div className="space-y-10">
              <div className="space-y-2">
                <h3 className="relaxed-title text-2xl">Aesthetic Core</h3>
                <p className="text-sm font-medium text-muted">Switch the visual identity of your command center.</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {themes.map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleThemeChange(t.id)}
                    className={`p-6 rounded-[28px] border-2 transition-all text-left space-y-4 hover:scale-[1.02] ${
                      theme === t.id ? 'border-citrus bg-citrus/5 shadow-xl shadow-citrus/5' : 'border-dawn bg-stone/20 grayscale'
                    }`}
                  >
                    <div className="flex gap-2">
                      <div className={`w-8 h-8 rounded-xl ${t.colors[0]} border border-dawn`} />
                      <div className={`w-8 h-8 rounded-xl ${t.colors[1]} shadow-lg`} />
                    </div>
                    <div>
                      <span className="block font-black text-xs uppercase tracking-widest text-ink mb-1">{t.name}</span>
                      <span className="text-[10px] font-bold text-muted/60 leading-relaxed">{t.desc}</span>
                    </div>
                    {theme === t.id && (
                      <div className="flex items-center gap-2 text-citrus pt-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Active Identity</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="space-y-8">
               <div className="space-y-2">
                <h3 className="relaxed-title text-2xl">Regional Parameters</h3>
                <p className="text-sm font-medium text-muted">Configure default operating states and regional defaults.</p>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted">Command Center Name</label>
                  <input 
                    type="text" 
                    value={config.name || 'FlowOS Global'} 
                    onChange={e => saveConfig({...config, name: e.target.value})}
                    className="w-full bg-stone/50 border border-dawn rounded-xl px-4 py-3 font-bold text-sm focus:border-citrus outline-none" 
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted">Default SLA (Minutes)</label>
                  <input 
                    type="number" 
                    value={config.sla} 
                    onChange={e => saveConfig({...config, sla: parseInt(e.target.value)})}
                    className="w-full bg-stone/50 border border-dawn rounded-xl px-4 py-3 font-bold text-sm focus:border-citrus outline-none" 
                  />
                </div>
              </div>

              <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-3xl space-y-4">
                <div className="flex items-center gap-2 text-blue-700">
                  <Globe className="w-5 h-5" />
                  <span className="font-black text-xs uppercase tracking-widest">Auto-Bridge Logic</span>
                </div>
                <p className="text-xs font-medium text-blue-600 leading-relaxed italic">
                  "When active, FlowOS will automatically propose shift transfers based on local timezone hub transitions. For example, Cairo HQ → NYC Bridge happens at 14:00 UTC."
                </p>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => saveConfig({...config, autoBridge: !config.autoBridge})}
                    className={`w-10 h-5 rounded-full relative transition-colors ${config.autoBridge ? 'bg-blue-600' : 'bg-dawn'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${config.autoBridge ? 'right-1' : 'left-1'}`} />
                  </button>
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-700">
                    {config.autoBridge ? 'System Proposed enabled' : 'Auto-Bridge Disabled'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'teams' && (
            <div className="space-y-10">
               <div className="space-y-2">
                <h3 className="relaxed-title text-2xl">Organizational Grid</h3>
                <p className="text-sm font-medium text-muted">Manage active teams permitted to register outcomes.</p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newTeam}
                    onChange={e => setNewTeam(e.target.value)}
                    placeholder="Enter new team name..."
                    className="flex-1 bg-stone/50 border border-dawn rounded-xl px-4 py-3 font-bold text-sm focus:border-citrus outline-none"
                  />
                  <button 
                    onClick={() => {
                      if (newTeam.trim()) {
                        saveConfig({...config, teams: [...(config.teams || []), newTeam.trim()]});
                        setNewTeam('');
                      }
                    }}
                    className="px-6 bg-ink text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-ink/90 transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Team</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {(config.teams || []).map((t: string, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-stone/30 rounded-2xl border border-dawn group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-muted border border-dawn shadow-sm">
                          <Users className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-ink">{t}</span>
                      </div>
                      <button 
                        onClick={() => {
                          const nt = [...config.teams];
                          nt.splice(i, 1);
                          saveConfig({...config, teams: nt});
                        }}
                        className="p-2 text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-10">
               <div className="space-y-2">
                <h3 className="relaxed-title text-2xl">Integrity & Backups</h3>
                <p className="text-sm font-medium text-muted">Export operational logs or reset the environment environment state.</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <button 
                  onClick={handleExportData}
                  className="flex flex-col items-center justify-center p-10 bg-white border border-dawn rounded-[32px] hover:border-citrus transition-all group"
                >
                  <Download className="w-8 h-8 text-muted group-hover:text-citrus transition-colors mb-4" />
                  <span className="font-black text-xs uppercase tracking-widest text-ink">Export Workspace</span>
                  <span className="text-[9px] font-bold text-muted/40 mt-2 text-center px-4">Download all tasks, handovers, and offices as JSON.</span>
                </button>

                <button 
                  onClick={() => setShowConfirmReset(true)}
                  className="flex flex-col items-center justify-center p-10 bg-white border border-dawn rounded-[32px] hover:border-red-500 transition-all group"
                >
                  <Trash2 className="w-8 h-8 text-muted group-hover:text-red-500 transition-colors mb-4" />
                  <span className="font-black text-xs uppercase tracking-widest text-red-500">Atomic Reset</span>
                  <span className="text-[9px] font-bold text-muted/40 mt-2 text-center px-4">Wipe all operational data from Firestore. Irreversible.</span>
                </button>
              </div>

              {showConfirmReset && (
                <div className="p-8 bg-red-50 border border-red-100 rounded-3xl space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex gap-4">
                    <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
                    <div className="space-y-2">
                      <span className="block font-black text-xs uppercase tracking-widest text-red-500">Dangerous Operation</span>
                      <p className="text-xs font-bold text-red-900/60 leading-relaxed">
                        You are about to delete all tasks, offices, and handovers. This action cannot be undone. Are you absolutely certain?
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={handleResetData}
                      disabled={saving}
                      className="px-6 py-3 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Resetting...' : 'Yes, Confirm Deletion'}
                    </button>
                    <button 
                      onClick={() => setShowConfirmReset(false)}
                      disabled={saving}
                      className="px-6 py-3 bg-white border border-red-100 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100/30 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'operations' && (
            <div className="space-y-8">
               <div className="space-y-2">
                <h3 className="relaxed-title text-2xl">Operational Logic</h3>
                <p className="text-sm font-medium text-muted">Fine-tune the heuristics used for risk detection and triage.</p>
              </div>

              <div className="space-y-6">
                {[
                  { label: 'Auto-Risk Flagging', desc: 'Flag tasks as High Risk if not acknowledged within 15 mins.', active: true },
                  { label: 'Carry-over Threshold', desc: 'Warn when a task is carried over across more than 2 shifts.', active: true },
                  { label: 'Regional Isolation', desc: 'Restrict office views based on user regional access.', active: false },
                  { label: 'Shift Overlap Buffer', desc: 'Display tasks from adjacent shifts for better context.', active: true }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-6 bg-stone/30 rounded-2xl border border-dawn">
                    <div className="space-y-1">
                      <span className="block text-sm font-bold text-ink">{item.label}</span>
                      <span className="text-[10px] font-medium text-muted leading-relaxed">{item.desc}</span>
                    </div>
                    <button className={`w-12 h-6 rounded-full relative transition-colors ${item.active ? 'bg-citrus' : 'bg-dawn'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${item.active ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
