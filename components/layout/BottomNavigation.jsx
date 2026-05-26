"use client";
import { Compass, User, Network } from 'lucide-react';
import { useAppStore } from '@/store/useStore';

export default function BottomNavigation() {
  const { viewMode, setViewMode } = useAppStore();
  
  return (
    <nav className="absolute bottom-0 left-0 right-0 h-16 bg-white/85 backdrop-blur-md border-t border-slate-100 flex items-center justify-around px-4 z-50 shrink-0 select-none">
      <button onClick={() => setViewMode('home')} className={`justify-center flex flex-col items-center gap-[2px] transition-all w-20 h-full ${viewMode === 'home' ? 'text-indigo-600 font-extrabold scale-110' : 'text-slate-400 hover:text-slate-600'}`}>
        <Compass size={18} /><span className="text-[9px]">홈</span>
      </button>
      <button onClick={() => setViewMode('profile')} className={`justify-center flex flex-col items-center gap-[2px] transition-all w-20 h-full ${viewMode === 'profile' ? 'text-indigo-600 font-extrabold scale-110' : 'text-slate-400 hover:text-slate-600'}`}>
        <User size={18} /><span className="text-[9px]">프로필</span>
      </button>
      <button onClick={() => setViewMode('archive')} className={`justify-center flex flex-col items-center gap-[2px] transition-all w-20 h-full ${viewMode === 'archive' ? 'text-indigo-600 font-extrabold scale-110' : 'text-slate-400 hover:text-slate-600'}`}>
        <Network size={18} /><span className="text-[9px] font-medium">스페이스</span>
      </button>
    </nav>
  );
}
