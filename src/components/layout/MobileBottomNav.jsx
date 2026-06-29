import React from 'react';
import { History, User, Network } from 'lucide-react';
import { useAppStore } from '../../store/AppStore';

const MobileBottomNav = () => {
  const { viewMode, setViewMode } = useAppStore();
  return (
    <div className="md:hidden fixed bottom-6 left-4 right-4 z-50 pointer-events-none">
      <nav className="w-full h-16 rounded-[2rem] backdrop-blur-xl flex items-center justify-around px-2 shadow-2xl pointer-events-auto transition-all duration-500 bg-white/80 border border-zinc-200/60 shadow-zinc-200/50">
        <button onClick={() => setViewMode('timeline')} className={`flex flex-col items-center justify-center gap-1 w-16 h-full transition-all rounded-2xl ${viewMode === 'timeline' ? 'text-indigo-600 scale-105' : 'text-zinc-400 hover:text-zinc-600'}`}><History size={20} /><span className="text-[9px] font-bold">발자취</span></button>
        <button onClick={() => setViewMode('profile')} className={`flex flex-col items-center justify-center gap-1 w-16 h-full transition-all rounded-2xl ${viewMode === 'profile' ? 'text-indigo-600 scale-105' : 'text-zinc-400 hover:text-zinc-600'}`}><User size={20} /><span className="text-[9px] font-bold">인덱스</span></button>
        <button onClick={() => setViewMode('archive')} className={`flex flex-col items-center justify-center gap-1 w-16 h-full transition-all rounded-2xl ${viewMode === 'archive' ? 'text-indigo-600 scale-105' : 'text-zinc-400 hover:text-zinc-600'}`}><Network size={20} /><span className="text-[9px] font-bold">취향</span></button>
      </nav>
    </div>
  );
};
export default MobileBottomNav;