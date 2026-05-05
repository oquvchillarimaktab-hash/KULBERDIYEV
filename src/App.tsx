/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  CheckSquare, 
  Clock, 
  Search, 
  Bell, 
  User, 
  Plus, 
  Trash2, 
  Play, 
  Pause, 
  RotateCcw,
  Sparkles,
  Send,
  Zap,
  Star,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

// --- Types ---
interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

// --- Components ---

const GlassCard = ({ children, className = "", id }: { children: React.ReactNode, className?: string, id?: string }) => (
  <motion.div 
    id={id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`glass-card ${className}`}
  >
    {children}
  </motion.div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ai' | 'tasks' | 'focus'>('dashboard');
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', text: 'Ilova interfeysini yakunlash', completed: false, priority: 'high' },
    { id: '2', text: 'Gemini AI bilan integratsiya qilish', completed: true, priority: 'medium' },
    { id: '3', text: 'Mijoz bilan uchrashuv', completed: false, priority: 'low' },
  ]);
  const [newTaskText, setNewTaskText] = useState('');
  
  // AI State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Timer State
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  // Gemini Setup
  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      text: newTaskText,
      completed: false,
      priority: 'medium'
    };
    setTasks([...tasks, newTask]);
    setNewTaskText('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks(tasks.filter(t => t.id !== id));
  };

  const sendMessage = async () => {
    if (!aiInput.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: aiInput };
    setChatHistory(prev => [...prev, userMessage]);
    setAiInput('');
    setIsTyping(true);

    try {
      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: aiInput,
        config: {
          systemInstruction: "Siz 'Asilbek AI' ismli aqlli va juda qulay yordamchisiz. Foydalanuvchi bilan o'zbek tilida, do'stona, samimiy va professional tarzda muloqot qiling. Sizning maqsadingiz foydalanuvchining ishlarini osonlashtirish va unga eng to'g'ri maslahatlarni berishdir. Javoblaringiz chiroyli va tushunarli bo'lsin."
        }
      });
      
      const modelMessage: ChatMessage = { role: 'model', content: response.text || "Kechirasiz, xatolik yuz berdi." };
      setChatHistory(prev => [...prev, modelMessage]);
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, { role: 'model', content: "Server bilan bog'lanishda xatolik yuz berdi." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div id="dashboard-content" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <GlassCard className="p-6 md:col-span-2 flex flex-col justify-between min-h-[240px]">
              <div>
                <h2 className="text-4xl font-bold mb-2 tracking-tight">Xayrli kun, O'zbekiston!</h2>
                <p className="text-neutral-400">Bugun 5-may, 2026. Sizda 2 ta muhim vazifa bor.</p>
              </div>
              <div className="flex gap-4 mt-8">
                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex-1">
                  <div className="text-blue-400 text-sm mb-1 uppercase tracking-wider font-bold">Mahsuldorlik</div>
                  <div className="text-2xl font-mono">84%</div>
                </div>
                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex-1">
                  <div className="text-purple-400 text-sm mb-1 uppercase tracking-wider font-bold">Fokus vaqti</div>
                  <div className="text-2xl font-mono">2.5s</div>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Sun className="text-yellow-500 w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Toshkent</h3>
                <p className="text-3xl font-mono">+24°C</p>
                <p className="text-neutral-500 text-sm">Ochiq osmon</p>
              </div>
            </GlassCard>

            <GlassCard className="p-6 md:col-span-1 lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  Tezkor maslahat
                </h3>
              </div>
              <p className="text-neutral-300 italic">"Mahsuldorlik - bu ko'p ish qilish emas, balki to'g'ri ishlarni qilishdir."</p>
            </GlassCard>

            <GlassCard className="p-6">
               <h3 className="text-xl font-bold mb-4">Musiqa holati</h3>
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-neutral-800 rounded-lg animate-pulse" />
                 <div>
                   <div className="font-medium">Deep Focus Mix</div>
                   <div className="text-xs text-neutral-500">Lofi Girl</div>
                 </div>
               </div>
            </GlassCard>
          </div>
        );
      case 'ai':
        return (
          <GlassCard id="ai-chat" className="h-[calc(100vh-140px)] flex flex-col p-0">
            <div className="p-6 border-bottom border-white/5 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Sparkles className="text-white w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Asilbek AI</h3>
                  <p className="text-xs text-green-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    Online | Sizning yordamchingiz
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {chatHistory.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-70 space-y-4">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="text-blue-400 w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-bold">Salom! Men Asilbek AI-man.</h2>
                  <p className="text-neutral-400 max-w-xs">Bugun sizga qanday yordam bera olaman? Men vazifalar, rejalashtirish yoki shunchaki suhbatda ko'maklashishim mumkin.</p>
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-4 rounded-2xl ${
                    msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white/10 text-neutral-100 rounded-tl-none border border-white/10'
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/10 p-4 rounded-2xl rounded-tl-none animate-pulse text-xs text-neutral-400">
                    Zenit AI yozmoqda...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-6 border-t border-white/5">
              <div className="relative flex items-center gap-3">
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Xabar yozing..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button 
                  onClick={sendMessage}
                  className="absolute right-2 p-3 bg-white text-black rounded-xl hover:bg-blue-100 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </GlassCard>
        );
      case 'tasks':
        return (
          <div id="tasks-container" className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold">Kundalik vazifalar</h2>
            <div className="flex gap-3">
              <input 
                type="text" 
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                placeholder="Yangi vazifa qo'shish..."
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button 
                onClick={handleAddTask}
                className="p-4 bg-white text-black rounded-2xl hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-7 h-7" />
              </button>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onClick={() => toggleTask(task.id)}
                    className={`interactive-glass p-5 rounded-2xl flex items-center justify-between group ${task.completed ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        task.completed ? 'bg-green-500 border-green-500' : 'border-white/20'
                      }`}>
                        {task.completed && <CheckSquare className="w-4 h-4 text-white" />}
                      </div>
                      <span className={`text-lg ${task.completed ? 'line-through text-neutral-500' : ''}`}>
                        {task.text}
                      </span>
                    </div>
                    <button 
                      onClick={(e) => deleteTask(task.id, e)}
                      className="p-2 text-neutral-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        );
      case 'focus':
        return (
          <div id="focus-container" className="h-[calc(100vh-200px)] flex items-center justify-center">
            <GlassCard className="p-12 text-center space-y-12 max-w-md w-full">
              <div className="relative">
                <div className={`w-64 h-64 rounded-full border-4 border-white/5 flex items-center justify-center mx-auto transition-transform duration-1000 ${isActive ? 'scale-105 shadow-[0_0_50px_rgba(255,255,255,0.1)]' : ''}`}>
                   <div className="text-7xl font-mono font-light tracking-tighter">
                     {formatTime(timeLeft)}
                   </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center -z-10 blur-3xl opacity-20">
                   <div className={`w-full h-full bg-blue-500 rounded-full transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Fokus sessiyasi</h3>
                <p className="text-neutral-500">Chuqur ishlash uchun vaqt xonasi</p>
              </div>

              <div className="flex justify-center gap-6">
                <button 
                  onClick={() => setIsActive(!isActive)}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                    isActive ? 'bg-white/10 text-white' : 'bg-white text-black'
                  }`}
                >
                  {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                </button>
                <button 
                  onClick={() => { setTimeLeft(25 * 60); setIsActive(false); }}
                  className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <RotateCcw className="w-8 h-8" />
                </button>
              </div>

              <div className="flex justify-center gap-2">
                {[25, 45, 60].map(m => (
                  <button 
                    key={m}
                    onClick={() => { setTimeLeft(m * 60); setIsActive(false); }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      timeLeft === m * 60 ? 'bg-white/20 text-white' : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </GlassCard>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden p-4 md:p-6 lg:p-8 gap-6">
      {/* Sidebar Navigation */}
      <nav id="main-nav" className="hidden lg:flex flex-col w-20 glass rounded-3xl py-8 items-center justify-between">
        <div className="flex flex-col items-center gap-8">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-white/20">
            <Zap className="text-black w-7 h-7" />
          </div>
          
          <div className="flex flex-col gap-4">
            <NavItem icon={<LayoutDashboard />} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <NavItem icon={<Sparkles />} active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />
            <NavItem icon={<CheckSquare />} active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} />
            <NavItem icon={<Clock />} active={activeTab === 'focus'} onClick={() => setActiveTab('focus')} />
          </div>
        </div>
        
        <div className="flex flex-col gap-4">
          <NavItem icon={<Bell />} active={false} onClick={() => {}} />
          <NavItem icon={<User />} active={false} onClick={() => {}} />
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 overflow-hidden flex flex-col gap-6">
        {/* Header */}
        <header className="flex justify-between items-center px-4 h-12">
          <div className="lg:hidden flex items-center gap-2">
             <Zap className="w-6 h-6 text-white" />
             <span className="font-bold text-xl">Zenit</span>
          </div>
          <div className="flex-1 max-w-md mx-8 hidden sm:block">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input 
                type="text" 
                placeholder="Izlash..." 
                className="w-full bg-white/5 border border-white/5 rounded-full py-2 pl-12 pr-4 text-sm focus:bg-white/10 focus:outline-none transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-bold">Foydalanuvchi</span>
              <span className="text-xs text-neutral-500">Premium</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-neutral-800 border border-white/10" />
          </div>
        </header>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-y-auto px-1 md:px-4 custom-scrollbar pb-20 lg:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile Navbar */}
        <nav className="lg:hidden fixed bottom-4 left-4 right-4 h-16 glass rounded-2xl flex items-center justify-around px-2 z-50">
          <MobileNavItem icon={<LayoutDashboard />} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <MobileNavItem icon={<Sparkles />} active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />
          <MobileNavItem icon={<CheckSquare />} active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} />
          <MobileNavItem icon={<Clock />} active={activeTab === 'focus'} onClick={() => setActiveTab('focus')} />
        </nav>
      </main>
    </div>
  );
}

const NavItem = ({ icon, active, onClick }: { icon: React.ReactNode, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`p-3 rounded-xl transition-all duration-300 group relative ${
      active ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-neutral-500 hover:text-white'
    }`}
  >
    {icon}
    {!active && (
      <div className="absolute left-full ml-4 px-2 py-1 bg-white text-black text-[10px] uppercase font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Navigatsiyaat
      </div>
    )}
  </button>
);

const MobileNavItem = ({ icon, active, onClick }: { icon: React.ReactNode, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`p-3 rounded-xl transition-all ${
      active ? 'text-white' : 'text-neutral-500'
    }`}
  >
    <div className={active ? 'scale-110' : ''}>
      {icon}
    </div>
    {active && <div className="w-1 h-1 bg-white rounded-full mx-auto mt-1" />}
  </button>
);
