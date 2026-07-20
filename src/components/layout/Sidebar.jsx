import React from 'react';
import { User, Network, History, Sparkles, Rocket } from 'lucide-react';
import { useAppStore } from '../../store/AppStore';

const Sidebar = () => {
  const { viewMode, setViewMode, user, isSidebarOpen, isAdmin, setLoginModalOpen } = useAppStore();
  
  // ⭐️ 1. 명칭 직관적으로 변경
  const navItems = [
    { id: 'profile', icon: <User size={20} />, label: '프로필', desc: '나를 소개하는 공간' },
    { id: 'archive', icon: <Network size={20} />, label: '컬렉션', desc: '내 취향 모아보기' },
    { id: 'timeline', icon: <History size={20} />, label: '타임라인', desc: '시간순 기록장' },
  ];

  return (
    <>
      <div className={`hidden md:block shrink-0 transition-all duration-300 ${isSidebarOpen ? 'w-72' : 'w-20'}`} />

      <aside 
        className={`hidden md:flex flex-col h-full bg-[#F8FAFC] border-r border-zinc-200/60 text-zinc-600 fixed left-0 top-0 bottom-0 z-[60] transition-all duration-300 group overflow-hidden ${
          isSidebarOpen ? 'w-72' : 'w-20 hover:w-72 hover:shadow-2xl'
        }`}
      >
        <div className="w-72 flex flex-col h-full">
          
          {/* ⭐️ 2. 로고 영역을 버튼처럼 클릭 가능하게 변경 (홈으로 이동) */}
          <div 
            onClick={() => setViewMode('profile')}
            className="h-20 flex items-center px-5 gap-3 mt-2 shrink-0 cursor-pointer group/logo"
            title="홈으로 가기"
          >
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm bg-white text-indigo-600 border border-zinc-200 shrink-0 group-hover/logo:bg-indigo-50 transition-colors">
              <Sparkles size={18} className="group-hover/logo:scale-110 transition-transform" />
            </div>
            <h1 className={`text-xl font-black tracking-tight text-zinc-900 transition-all duration-300 whitespace-nowrap group-hover/logo:text-indigo-600 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              CraveLog.
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-2">
            <p className={`px-3 text-[10px] font-black uppercase tracking-widest mb-4 text-zinc-400 transition-opacity duration-300 whitespace-nowrap ${isSidebarOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              Navigation
            </p>
            {navItems.map(item => {
              const active = viewMode === item.id;
              return (
                <button 
                  key={item.id} 
                  onClick={() => setViewMode(item.id)} 
                  className={`w-full flex items-center gap-3 p-2 rounded-2xl transition-all duration-300 text-left group/btn ${
                    active ? 'bg-white text-indigo-600 shadow-sm border border-zinc-200/80' : 'hover:bg-white hover:text-zinc-900 border border-transparent hover:shadow-sm'
                  }`}
                >
                  <div className={`w-10 h-10 flex items-center justify-center shrink-0 transition-transform duration-300 ${active ? 'scale-110' : 'opacity-70 group-hover/btn:scale-110'}`}>
                    {item.icon}
                  </div>
                  <div className={`transition-opacity duration-300 whitespace-nowrap overflow-hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <p className="text-sm font-black tracking-tight">{item.label}</p>
                    <p className={`text-[10px] mt-0.5 font-bold ${active ? 'opacity-80' : 'opacity-50'}`}>{item.desc}</p>
                  </div>
                </button>
              )
            })}
          </nav>
          
          {/* Bottom Profile / Login Area */}
          <div className="p-4 mb-4">
            {isAdmin ? (
              <div className={`rounded-3xl flex items-center gap-3 transition-all duration-300 overflow-hidden ${isSidebarOpen ? 'p-4 bg-white shadow-sm border border-zinc-200/80' : 'p-2 bg-transparent group-hover:bg-white group-hover:shadow-sm group-hover:border group-hover:border-zinc-200/80 group-hover:p-4'}`}>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-rose-400 p-[2px] shrink-0">
                  <div className="w-full h-full rounded-full flex items-center justify-center font-black text-sm bg-white text-zinc-900 overflow-hidden">
                     {user?.profileImageUrl ? (
                        <img src={user.profileImageUrl} alt="profile" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-zinc-900">{user?.name?.charAt(0) || '?'}</span>
                    )}
                  </div>
                </div>
                <div className={`flex-1 min-w-0 text-left transition-opacity duration-300 whitespace-nowrap ${isSidebarOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <h4 className="text-sm font-bold truncate text-zinc-900">{user?.name}</h4>
                  <p className="text-[10px] truncate text-zinc-400">@{user?.handle}</p>
                </div>
              </div>
            ) : (
              <div className={`rounded-3xl flex flex-col items-center gap-3 transition-all duration-300 overflow-hidden ${isSidebarOpen ? 'p-5 bg-zinc-50 shadow-sm border border-zinc-200/80 text-center' : 'p-2 group-hover:p-5 group-hover:bg-zinc-50 group-hover:shadow-sm group-hover:border border-transparent group-hover:text-center'}`}>
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 shrink-0">
                  <Rocket size={18} />
                </div>
                <div className={`w-full transition-opacity duration-300 whitespace-nowrap ${isSidebarOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <p className="text-[11px] font-bold text-zinc-500 leading-relaxed mb-2">
                    나만의 취향 공간이<br/>필요하신가요?
                  </p>
                  <button onClick={() => setLoginModalOpen(true)} className="w-full py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition">
                    CraveLog 시작하기
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </aside>
    </>
  );
};

export default Sidebar;