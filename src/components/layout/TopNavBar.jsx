import React from 'react';
import { Menu, Sparkles, Search, User, LogOut, Lock, Plus, Eye, EyeOff } from 'lucide-react';
import { useAppStore } from '../../store/AppStore';

const TopNavBar = () => {
  const { 
    viewMode, setViewMode, isSidebarOpen, setIsSidebarOpen, isAdmin, 
    setLoginModalOpen, setAddRecordModalOpen, showToast, handleLogout, 
    isGuestMode, setIsGuestMode, searchQuery, setSearchQuery, searchUsers,
    visitedHandle, resetToMyProfile // ⭐️ 추가
  } = useAppStore(); 

  const titleMap = { profile: '인덱스 (Index)', edit_profile: '프로필 설정 (Set Profile)', archive: '취향 보관함 (Taste Archive)', timeline: '발자취 (Timeline)', search: '검색 결과 (Search)' };

  const handleSearchSubmit = () => {
    searchUsers(searchQuery);
    setViewMode('search');
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-zinc-200/60 flex items-center justify-between px-4 md:px-8 sticky top-0 z-50 shrink-0 gap-4">
      <div className="flex items-center gap-3 shrink-0">
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden md:flex w-9 h-9 rounded-xl bg-zinc-50 items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition"><Menu size={18} /></button>
        <div className="md:hidden w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600"><Sparkles size={14} /></div>
        <h2 className="text-sm font-black text-zinc-800 tracking-tight flex items-center gap-2"><span className="hidden md:inline text-zinc-400">CraveLog / </span>{titleMap[viewMode] || '검색'}</h2>
      </div>
      <div className="flex items-center justify-end gap-2 md:gap-3 flex-1">
        <div className="hidden sm:flex items-center relative w-full max-w-[200px] md:max-w-[260px] lg:max-w-[320px]">
          <button onClick={handleSearchSubmit} className="absolute left-2.5 p-1.5 text-zinc-400 hover:text-indigo-500 hover:bg-zinc-200/50 rounded-full transition-colors z-10" title="검색하기">
            <Search size={16} />
          </button>
          <input 
            type="text" 
            value={searchQuery || ''} 
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSearchSubmit(); }}
            placeholder="사용자 및 기록 검색..." 
            className="w-full bg-zinc-100/80 border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-full py-2 pl-10 pr-4 text-xs font-bold text-zinc-800 outline-none transition-all shadow-sm"
          />
        </div>

        {isAdmin ? (
          <>
            {/* ⭐️ 내 프로필 복귀 / 게스트 체험 통합 버튼 */}
            <button 
              onClick={() => {
                if (visitedHandle) {
                  resetToMyProfile(); // 남의 프로필 구경 중이었다면 복귀
                } else {
                  setIsGuestMode(!isGuestMode); // 내 프로필에서 뷰만 전환
                }
              }} 
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition shadow-sm flex items-center gap-1.5 md:mr-2 ${(isGuestMode || visitedHandle) ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}
            >
              {(isGuestMode || visitedHandle) ? <EyeOff size={14} /> : <Eye size={14} />}
              <span className="hidden md:inline">
                {(isGuestMode || visitedHandle) ? '내 프로필로 복귀' : '게스트 뷰 체험'}
              </span>
            </button>

            {/* 게스트 모드나 남의 프로필을 볼 때는 새 기록 버튼 숨김 */}
            {(!isGuestMode && !visitedHandle) && (
              <button onClick={() => setAddRecordModalOpen(true)} className="px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 transition shadow-sm flex items-center gap-1.5 md:mr-2">
                <Plus size={14} /> 새 기록
              </button>
            )}
            <button onClick={() => { 
                if(visitedHandle) resetToMyProfile();
                setViewMode('profile'); 
              }} 
              className="w-9 h-9 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 transition shadow-sm" title="마이페이지">
              <User size={16} />
            </button>
            <button onClick={() => { handleLogout(); showToast("로그아웃 되었습니다. 👋"); }} className="w-9 h-9 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-500 hover:text-rose-600 hover:bg-rose-50 transition shadow-sm"><LogOut size={16} /></button>
          </>
        ) : (
          <button onClick={() => setLoginModalOpen(true)} className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center text-white hover:bg-zinc-800 transition shadow-sm"><Lock size={14} /></button>
        )}
      </div>
    </header>
  );
};

export default TopNavBar;