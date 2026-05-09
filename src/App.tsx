import React, { useState, useMemo } from 'react';
import { Home, CheckSquare, RefreshCw, Globe, MessageSquare, Settings, LogOut, Search, Plus, Calendar, Flag, User, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { INITIAL_USER, INITIAL_TASKS, INITIAL_HANDOVERS, OFFICES, TEAMS } from './constants';
import { Task, Handover, Status, Priority, Shift } from './types';

// Components
import Sidebar from './components/Sidebar';
import Dashboard from './components/views/Dashboard';
import TaskBoard from './components/views/TaskBoard';
import HandoverFlow from './components/views/HandoverFlow';
import AICopilot from './components/views/AICopilot';
import OfficeMap from './components/views/OfficeMap';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'handover' | 'offices' | 'ai'>('dashboard');
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [handovers, setHandovers] = useState<Handover[]>(INITIAL_HANDOVERS);
  const [user] = useState(INITIAL_USER);

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

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard tasks={tasks} handovers={handovers} stats={stats} />;
      case 'tasks': return <TaskBoard tasks={tasks} setTasks={setTasks} />;
      case 'handover': return <HandoverFlow handovers={handovers} setHandovers={setHandovers} tasks={tasks} />;
      case 'offices': return <OfficeMap offices={OFFICES} tasks={tasks} />;
      case 'ai': return <AICopilot tasks={tasks} handovers={handovers} />;
      default: return <Dashboard tasks={tasks} handovers={handovers} stats={stats} />;
    }
  };

  return (
    <div className="flex h-screen bg-stone overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        stats={stats}
      />
      
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 flex items-center justify-between px-8 bg-stone/50 backdrop-blur-md border-b border-dawn">
          <div>
            <h1 className="relaxed-title text-2xl text-ink">
              {activeTab === 'dashboard' ? 'Daily Rhythm' : 
               activeTab === 'tasks' ? 'Task Register' : 
               activeTab === 'handover' ? 'Shift Continuity' : 
               activeTab === 'offices' ? 'Regional Presence' : 'Operations Copilot'}
            </h1>
            <p className="text-sm text-muted font-medium">
              {activeTab === 'dashboard' ? 'A focused view of today’s priorities and team flow.' : 
               activeTab === 'tasks' ? 'Managing daily outcomes across all regions.' : 
               activeTab === 'handover' ? 'Guiding the bridge between outgoing and incoming teams.' : 
               activeTab === 'offices' ? 'Live status across active operating hubs.' : 'AI intelligence layers for the modern workspace.'}
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
            <button className="flex items-center gap-2 px-4 py-2 bg-ink text-white rounded-xl font-semibold text-sm hover:bg-ink/90 transition-all shadow-sm">
              <Plus className="w-4 h-4" />
              <span>New Entry</span>
            </button>
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
