import React, { useState, useRef, useEffect } from 'react';
import { Task, Handover } from '../../types';
import { Send, Bot, User, Sparkles, AlertCircle, Quote, Terminal, Copy, CheckCircle2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';

interface AICopilotProps {
  tasks: Task[];
  handovers: Handover[];
  messages: {role: 'user' | 'assistant', content: string}[];
  setMessages: React.Dispatch<React.SetStateAction<{role: 'user' | 'assistant', content: string}[]>>;
}

export default function AICopilot({ tasks, handovers, messages, setMessages }: AICopilotProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        throw new Error('MISSING_KEY');
      }

      const ai = new GoogleGenAI({ apiKey });
      const context = `
        Current Operations State:
        - Total Tasks: ${tasks.length}
        - Open Tasks: ${tasks.filter(t => t.status !== 'Done').length}
        - High Priorities: ${tasks.filter(t => t.priority === 'High').length}
        - Recent Handovers: ${handovers.length}
        
        Task Details:
        ${JSON.stringify(tasks.slice(0, 5), null, 2)}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { parts: [{ text: `You are an Operations Copilot. Answer concisely and professionally. Context: ${context}. User query: ${userMsg}` }] }
        ],
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response.text || "I'm sorry, I couldn't process that query." }]);
    } catch (err: any) {
      let friendlyMessage = "Operational error: AI service disconnected. Please check the workspace configuration.";
      
      if (err.message === 'MISSING_KEY') {
        friendlyMessage = "Gemini API Key is missing or invalid. Please configure it in the AI Studio Secrets panel to enable AI features.";
      } else if (err.message?.includes('429') || err.message?.includes('quota')) {
        friendlyMessage = "The AI service is currently at capacity or quota has been reached. Please try again in a few minutes.";
      } else if (err.message?.includes('fetch') || !navigator.onLine) {
        friendlyMessage = "Network connection error. Please check your internet connection and try again.";
      } else if (err.message?.includes('safety')) {
        friendlyMessage = "The request was flagged by safety filters. Please rephrase your query.";
      }

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `⚠️ ${friendlyMessage}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6">
      <div className="flex-1 glass-card p-0 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-dawn bg-stone/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-ink text-white rounded-lg">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-sm font-bold text-ink">Ops Copilot v1.0</span>
              <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Live Pulse Active
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-slate-soft rounded-lg text-muted transition-colors">
              <Terminal className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-slate-soft rounded-lg text-muted transition-colors">
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-6 custom-scrollbar" ref={scrollRef}>
          <AnimatePresence>
            {messages.map((m, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${m.role === 'user' ? 'bg-dawn text-ink' : 'bg-citrus text-white'}`}>
                  {m.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>
                <div className={`p-4 rounded-2xl max-w-[80%] text-sm font-medium leading-relaxed ${
                  m.role === 'user' ? 'bg-ink text-white rounded-tr-none' : 'bg-stone/50 border border-dawn text-ink rounded-tl-none'
                }`}>
                  {m.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <div className="flex gap-4">
               <div className="w-8 h-8 rounded-lg bg-citrus text-white flex items-center justify-center">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                  <RefreshCw className="w-4 h-4" />
                </motion.div>
              </div>
              <div className="p-4 rounded-2xl bg-stone/50 border border-dawn font-bold text-muted animate-pulse text-xs tracking-widest uppercase">
                Synthesizing Ops Data...
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-dawn">
          <div className="relative group">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about shift risks, task summaries, or handover drafts..."
              className="w-full bg-stone/50 border border-dawn rounded-2xl pl-4 pr-14 py-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-citrus/20 focus:border-citrus transition-all"
            />
            <button 
              onClick={handleSend}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-ink text-white rounded-xl flex items-center justify-center hover:bg-ink/90 transition-all shadow-lg shadow-ink/10"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-3 flex gap-4 px-2">
            {[
              { label: 'Risk Summary', icon: AlertCircle },
              { label: 'Handover Draft', icon: RefreshCw },
              { label: 'Daily Goals', icon: CheckCircle2 }
            ].map((suggest, i) => (
              <button 
                key={i}
                onClick={() => setInput(suggest.label)}
                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-muted hover:text-citrus transition-colors"
              >
                <suggest.icon className="w-3 h-3" />
                <span>{suggest.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="glass-card p-4 flex gap-4 border-l-4 border-l-citrus">
          <Quote className="w-5 h-5 text-citrus opacity-40 shrink-0" />
          <p className="text-[10px] font-bold text-muted italic leading-relaxed">
            "Prioritizing outcomes over performance metrics leads to more relaxed and sustainable team cultures."
          </p>
        </div>
        <div className="glass-card p-4 space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-widest text-muted">Intelligence Mode</span>
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-green-50 text-green-600 rounded-md text-[9px] font-black border border-green-100">Live Context</span>
            <span className="px-2 py-1 bg-stone text-muted rounded-md text-[9px] font-black border border-dawn">Historical Sync</span>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-black uppercase tracking-widest text-muted">Session Tokens</span>
            <span className="relaxed-title text-lg">1,240 / 50k</span>
          </div>
          <div className="w-10 h-10 rounded-full border-4 border-citrus border-t-dawn rotate-45" />
        </div>
      </div>
    </div>
  );
}
