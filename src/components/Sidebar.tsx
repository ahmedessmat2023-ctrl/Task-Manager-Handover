import React from 'react';
import { Home, CheckSquare, RefreshCw, Globe, MessageSquare, Settings, LogOut } from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  user: User;
  stats: {
    riskCount: number;
    handoverCount: number;
  };
}

export default function Sidebar({ activeTab, setActiveTab, user, stats }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Main Home', icon: Home, badge: stats.riskCount > 0 ? stats.riskCount : null, badgeColor: 'bg-red-500' },
    { id: 'tasks', label: 'Daily Tasks', icon: CheckSquare },
    { id: 'handover', label: 'Shift Handover', icon: RefreshCw, badge: stats.handoverCount > 0 ? stats.handoverCount : null, badgeColor: 'bg-citrus' },
    { id: 'offices', label: 'Regional View', icon: Globe },
    { id: 'ai', label: 'AI Copilot', icon: MessageSquare },
  ];

  return (
    <aside className="w-72 bg-white border-r border-dawn flex flex-col p-6">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-citrus rounded-xl flex items-center justify-center shadow-lg shadow-citrus/20">
          <span className="text-white font-black text-xl tracking-tighter italic">T</span>
        </div>
        <div>
          <span className="block font-display font-bold text-lg tracking-tight text-ink leading-none">TryGC FlowOS</span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted mt-1 block">Control Center</span>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted/60 mb-4 px-3">Primary Flows</div>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${
              activeTab === item.id 
                ? 'bg-ink text-white font-bold shadow-lg shadow-ink/10' 
                : 'text-muted hover:bg-stone/80 hover:text-ink font-semibold'
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-citrus' : 'text-muted group-hover:text-ink'}`} />
              <span className="text-sm">{item.label}</span>
            </div>
            {item.badge && (
              <span className={`w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white rounded-full ${item.badgeColor}`}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-6">
        <div className="p-4 bg-stone/50 rounded-2xl border border-dawn">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-dawn rounded-full flex items-center justify-center font-bold text-muted border border-white">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <span className="block text-sm font-bold text-ink leading-none">{user.name}</span>
              <span className="text-xs font-semibold text-muted mt-1 block">{user.role}</span>
            </div>
          </div>
          <button className="w-full flex items-center gap-2 p-2 text-muted hover:text-ink text-xs font-bold transition-colors">
            <Settings className="w-4 h-4" />
            <span>Profile Settings</span>
          </button>
        </div>

        <button className="w-full flex items-center justify-center gap-2 p-3 text-muted hover:text-red-500 text-sm font-bold transition-all border border-transparent hover:border-red-100 hover:bg-red-50 rounded-xl">
          <LogOut className="w-4 h-4" />
          <span>Exit Workspace</span>
        </button>
      </div>
    </aside>
  );
}
