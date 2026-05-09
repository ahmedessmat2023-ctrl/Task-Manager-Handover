import React, { useState, useMemo } from 'react';
import { Home, CheckSquare, RefreshCw, Globe, MessageSquare, Settings, LogOut, Search, Plus, Calendar, Flag, User, MapPin, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { INITIAL_USER, OFFICES, TEAMS } from './constants';
import { Task, Handover, Status, Priority, Shift } from './types';
import { useFirebase } from './components/FirebaseContext';
import { db } from './lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Components
import Sidebar from './components/Sidebar';
import Dashboard from './components/views/Dashboard';
import TaskBoard from './components/views/TaskBoard';
import HandoverFlow from './components/views/HandoverFlow';
import AICopilot from './components/views/AICopilot';
import OfficeMap from './components/views/OfficeMap';
import SettingsView from './components/views/Settings';

export default function App() {
  const { user, appUser, tasks, handovers, login, loading, isReady } = useFirebase();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'handover' | 'offices' | 'ai' | 'settings'>('dashboard');

  const stats = useMemo(() => {
    const open = tasks.filter(t => t.status !== Status.DONE);
    const risks = open.filter(t => t.priority === Priority.HIGH || t.status === Status.BLOCKED);
    return {
      openCount: open.length,
      riskCount: risks.length,
      carryCount: open.filter(t => t.carry).length,
      handoverCount: handovers.filter(h => h.status === 'Pending').length
    };
  }, [tasks, handovers]);

  const [copilotMessages, setCopilotMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: 'Operational intelligence is ready. How can I assist with your shift flow or risk synthesis today?' }
  ]);

  if (!isReady || loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-stone">
        <Sparkles className="w-12 h-12 text-citrus animate-pulse mb-4" />
        <p className="text-sm font-black uppercase tracking-[0.3em] text-ink animate-pulse">Initializing Ecosystem</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-stone p-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl p-12 border border-dawn shadow-2xl text-center space-y-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-citrus/10 rounded-3xl">
            <Globe className="w-10 h-10 text-citrus" />
          </div>
          <div>
            <h1 className="relaxed-title text-3xl text-ink mb-2">OpsHub Alpha</h1>
            <p className="text-muted font-medium">Please sign in to access the regional operations register.</p>
          </div>
          <button 
            onClick={login}
            className="w-full py-4 bg-ink text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
          >
            <img src="https://www.gstatic.com/firebase/anonymous-scan.png" className="w-5 h-5 invert" alt="" />
            Continue with Identity
          </button>
        </motion.div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard tasks={tasks} handovers={handovers} stats={stats} />;
      case 'tasks': return <TaskBoard tasks={tasks} />;
      case 'handover': return <HandoverFlow handovers={handovers} tasks={tasks} stats={stats} aiInteractions={copilotMessages} />;
      case 'offices': return <OfficeMap offices={OFFICES} tasks={tasks} />;
      case 'ai': return <AICopilot tasks={tasks} handovers={handovers} messages={copilotMessages} setMessages={setCopilotMessages} />;
      case 'settings': return <SettingsView />;
      default: return <Dashboard tasks={tasks} handovers={handovers} stats={stats} />;
    }
  };

  return (
    <div className="flex h-screen bg-stone overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        stats={stats}
      />
      
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 flex items-center justify-between px-8 bg-stone/50 backdrop-blur-md border-b border-dawn">
          <div>
            <h1 className="relaxed-title text-2xl text-ink uppercase tracking-tight">
              {activeTab === 'dashboard' ? 'Daily Rhythm' : 
               activeTab === 'tasks' ? 'Task Register' : 
               activeTab === 'handover' ? 'Shift Continuity' : 
               activeTab === 'offices' ? 'Regional Presence' : 
               activeTab === 'settings' ? 'System Settings' : 'Operations Copilot'}
            </h1>
            <p className="text-sm text-muted font-medium">
              {activeTab === 'dashboard' ? 'A focused view of today’s priorities and team flow.' : 
               activeTab === 'tasks' ? 'Managing daily outcomes across all regions.' : 
               activeTab === 'handover' ? 'Guiding the bridge between outgoing and incoming teams.' : 
               activeTab === 'offices' ? 'Live status across active operating hubs.' : 
               activeTab === 'settings' ? 'Configure your workspace and preferences.' : 'AI intelligence layers for the modern workspace.'}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-citrus transition-colors" />
              <input 
                type="text" 
                placeholder="Find anything..." 
                className="pl-10 pr-4 py-2 bg-white/50 border border-dawn rounded-xl focus:outline-none focus:ring-2 focus:ring-citrus/20 focus:border-citrus transition-all w-64 text-sm font-medium"
              />
            </div>
            {activeTab !== 'settings' && (
              <button 
                onClick={() => setActiveTab('tasks')}
                className="flex items-center gap-2 px-4 py-2 bg-ink text-white rounded-xl font-semibold text-sm hover:bg-ink/90 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>New Entry</span>
              </button>
            )}
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
