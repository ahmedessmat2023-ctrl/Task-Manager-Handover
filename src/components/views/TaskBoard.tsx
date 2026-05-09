import React, { useState } from 'react';
import { Task, Status, Priority, Shift } from '../../types';
import { Search, Filter, MoreHorizontal, ArrowUpDown, Clock, AlertCircle, CheckCircle2, Plus } from 'lucide-react';
import TaskModal from '../TaskModal';

interface TaskBoardProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

export default function TaskBoard({ tasks, setTasks }: TaskBoardProps) {
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredTasks = tasks.filter(t => 
    (statusFilter === 'All' || t.status === statusFilter) &&
    (t.title.toLowerCase().includes(filter.toLowerCase()) || 
     t.owner.toLowerCase().includes(filter.toLowerCase()) || 
     t.office.toLowerCase().includes(filter.toLowerCase()))
  );

  const toggleStatus = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const statuses = Object.values(Status);
        const currentIndex = statuses.indexOf(t.status);
        const nextIndex = (currentIndex + 1) % statuses.length;
        return { ...t, status: statuses[nextIndex], updatedAt: new Date().toISOString() };
      }
      return t;
    }));
  };

  const handleSaveTask = (taskData: Partial<Task>) => {
    const newTask: Task = {
      ...(taskData as Task),
      id: Math.random().toString(36).slice(2),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      country: taskData.country || 'KSA',
      team: taskData.team || 'Operations',
      did: [],
    } as Task;
    
    setTasks(prev => [newTask, ...prev]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="mr-4 flex items-center gap-2 px-4 py-2 bg-citrus text-white rounded-xl font-bold text-xs shadow-lg shadow-citrus/20 hover:scale-[1.02] transition-all"
          >
            <Plus className="w-3 h-3" />
            <span>New Task</span>
          </button>
          {['All', ...Object.values(Status)].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                statusFilter === s 
                  ? 'bg-ink text-white border-ink' 
                  : 'bg-white text-muted border-dawn hover:border-citrus'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input 
              type="text" 
              placeholder="Filter register..." 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-dawn rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-citrus/20"
            />
          </div>
          <button className="p-2 bg-white border border-dawn rounded-xl hover:bg-slate-soft transition-colors">
            <Filter className="w-4 h-4 text-muted" />
          </button>
          <button className="p-2 bg-white border border-dawn rounded-xl hover:bg-slate-soft transition-colors text-muted hover:text-ink font-bold text-xs uppercase tracking-widest flex items-center gap-2">
            <ArrowUpDown className="w-3 h-3" />
            <span>Sort</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-dawn rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone/50 border-b border-dawn">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted">Core Outcome</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted">Identity</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted">Region</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted">Priority</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted">Current State</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted">Commitment</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr 
                  key={task.id} 
                  className="group hover:bg-stone/30 transition-colors border-b border-dawn last:border-0"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 flex-shrink-0 ${task.status === Status.DONE ? 'text-green-500' : 'text-dawn'}`}>
                        {task.status === Status.DONE ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 border-2 border-current rounded-md" />}
                      </div>
                      <div>
                        <span className={`block text-sm font-bold leading-snug transition-colors ${task.status === Status.DONE ? 'text-muted line-through' : 'text-ink group-hover:text-citrus'}`}>
                          {task.title}
                        </span>
                        {task.campaign && (
                          <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-widest text-muted/60">{task.campaign}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 bg-dawn rounded-full flex items-center justify-center text-[10px] font-bold text-muted border border-white">
                        {task.owner.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-xs font-bold text-muted">{task.owner}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg leading-none">🌍</span>
                      <span className="text-xs font-bold text-muted">{task.office}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                      task.priority === Priority.HIGH ? 'bg-red-50 text-red-500 border-red-100' : 
                      task.priority === Priority.MEDIUM ? 'bg-citrus/10 text-citrus border-citrus/20' : 'bg-blue-50 text-blue-500 border-blue-100'
                    }`}>
                      {task.priority === Priority.HIGH && <AlertCircle className="w-2.5 h-2.5" />}
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <button 
                      onClick={() => toggleStatus(task.id)}
                      className="group/status flex items-center gap-2 hover:bg-slate-soft p-1.5 rounded-lg transition-all"
                    >
                      <span className={`block w-1.5 h-1.5 rounded-full ${
                        task.status === Status.DONE ? 'bg-green-500' : 
                        task.status === Status.BLOCKED ? 'bg-red-500' :
                        task.status === Status.IN_PROGRESS ? 'bg-blue-500' :
                        task.status === Status.WAITING ? 'bg-amber-500' : 'bg-dawn'
                      }`} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted group-hover/status:text-ink">{task.status}</span>
                    </button>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-1.5 text-muted font-bold text-[11px]">
                      <Clock className="w-3.5 h-3.5 opacity-50" />
                      <span>{new Date(task.due).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 hover:bg-slate-soft rounded-lg transition-colors text-muted opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredTasks.length === 0 && (
            <div className="p-16 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-stone/50 rounded-full mb-4">
                <Search className="w-6 h-6 text-muted" />
              </div>
              <h3 className="text-lg font-bold text-ink">No outcomes matching filters</h3>
              <p className="text-sm text-muted font-medium mt-1">Try adjusting your search or filters to see more tasks.</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs font-bold px-4">
        <span className="text-muted">Displaying <span className="text-ink">{filteredTasks.length}</span> of <span className="text-ink">{tasks.length}</span> total daily outcomes.</span>
        <div className="flex items-center gap-1">
          <button className="px-2 py-1 text-muted hover:text-ink disabled:opacity-30" disabled>Previous</button>
          {[1].map(p => (
            <button key={p} className="w-6 h-6 flex items-center justify-center bg-ink text-white rounded-md">{p}</button>
          ))}
          <button className="px-2 py-1 text-muted hover:text-ink disabled:opacity-30" disabled>Next</button>
        </div>
      </div>
      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveTask}
      />
    </div>
  );
}
