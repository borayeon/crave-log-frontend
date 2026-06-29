import React from 'react';
import { User, Network, History, Sparkles, Rocket } from 'lucide-react';
import { useAppStore } from '../../store/AppStore';

const Sidebar = () => {
  const { viewMode, setViewMode, user, isSidebarOpen, isAdmin, setLoginModalOpen } = useAppStore();
  const navItems = [
    { id: 'profile', icon: <User size={20} />, label: '인덱스', desc: '나의 프로필' },
    { id: 'archive', icon: <Network size={20} />, label: '취향 보관함', desc: '내가 좋아하는 것들' },
    { id: 'timeline', icon: <History size={20} />, label: '발자취', desc: '시간순 기록' },
  ];

  return (
    <aside className={`hidden md:flex flex-col h-full border-r bg-[#F8FAFC] border-zinc-200/60 text-zinc-600 shrink-0 transition-all duration-300 overflow-hidden ${isSidebarOpen ? 'w-72' : 'w-0 border-none'}`}>
      <div className="w-72 flex flex-col h-full">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm bg-white text-indigo-600 border border-zinc-200"><Sparkles size={18} /></div>
          <h1 className="text-xl font-black tracking-tight text-zinc-900">CraveLog.</h1>
        </div>
        <nav className="flex-1 px-4 py-2 space-y-2">
          {navItems.map(item => {
            const active = viewMode === item.id;
            return (
              <button key={item.id} onClick={() => setViewMode(item.id)} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 text-left group ${active ? 'bg-white text-indigo-600 shadow-sm border border-zinc-200/80' : 'hover:bg-white hover:text-zinc-900 border border-transparent hover:shadow-sm'}`}>
                <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'opacity-70 group-hover:scale-110'}`}>{item.icon}</div>
                <div><p className="text-sm font-black tracking-tight">{item.label}</p><p className={`text-[10px] mt-0.5 font-bold ${active ? 'opacity-80' : 'opacity-50'}`}>{item.desc}</p></div>
              </button>
            )
          })}
        </nav>
        <div className="p-6">
          {isAdmin ? (
            <div className="p-4 rounded-3xl flex flex-col gap-4 shadow-sm bg-white border border-zinc-200/80 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-rose-400 p-[2px] shrink-0"><div className="w-full h-full rounded-full flex items-center justify-center font-black text-sm bg-white text-zinc-900">{user.name.charAt(0)}</div></div>
                <div className="flex-1 min-w-0 text-left"><h4 className="text-sm font-bold truncate text-zinc-900">{user.name}</h4><p className="text-[10px] truncate text-zinc-400">@{user.handle}</p></div>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-3xl flex flex-col gap-3 shadow-sm bg-zinc-50 border border-zinc-200/80 text-center items-center animate-in fade-in">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 mb-1"><Rocket size={18} /></div>
              <p className="text-[11px] font-bold text-zinc-500 leading-relaxed">나만의 취향 공간이<br/>필요하신가요?</p>
              <button onClick={() => setLoginModalOpen(true)} className="w-full mt-1 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition">CraveLog 시작하기</button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;