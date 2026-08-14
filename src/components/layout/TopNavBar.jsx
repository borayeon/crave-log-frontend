import React, { useState } from 'react';
import { Menu, Sparkles, Search, User, LogOut, Lock, Plus, Eye, EyeOff, X, Settings } from 'lucide-react';
import { useAppStore } from '../../store/AppStore';

const TopNavBar = () => {
  const { 
    viewMode, setViewMode, isSidebarOpen, setIsSidebarOpen, isAdmin, 
    setLoginModalOpen, setAddRecordModalOpen, showToast, handleLogout, 
    isGuestMode, setIsGuestMode, searchQuery, setSearchQuery, searchUsers,
    visitedHandle, resetToMyProfile 
  } = useAppStore();

  // 상태 관리: 모바일 검색창 & 사용자 드롭다운 메뉴
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false); 

  const titleMap = { 
    profile: '프로필 (Profile)', 
    edit_profile: '프로필 설정 (Set Profile)', 
    archive: '컬렉션 (Collection)', 
    timeline: '타임라인 (Timeline)', 
    search: '검색 결과 (Search)',
    account_settings: '계정 설정 (Settings)'
  };

  const handleSearchSubmit = () => {
    searchUsers(searchQuery);
    setViewMode('search');
    setIsMobileSearchOpen(false); 
  };

  const handleGoToProfile = () => {
    if (visitedHandle) resetToMyProfile();
    setViewMode('profile');
  };

  const isViewingOther = isGuestMode || visitedHandle; 
  const canEdit = !isViewingOther; 

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-zinc-200/60 flex items-center justify-between px-4 md:px-8 sticky top-0 z-50 shrink-0 gap-4 relative">
      
      {/* 모바일 검색 팝업 오버레이 */}
      {isMobileSearchOpen && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-[60] flex items-center px-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <Search size={18} className="text-zinc-400 shrink-0 mr-2" />
          <input 
            autoFocus
            type="text" 
            value={searchQuery || ''} 
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSearchSubmit(); }}
            placeholder="사용자 및 기록 검색..." 
            className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-zinc-800"
          />
          <button 
            onClick={() => setIsMobileSearchOpen(false)} 
            className="p-2 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-full transition-colors shrink-0"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* 기본 네비게이션 좌측 (로고 및 타이틀) */}
      <div className="flex items-center gap-3 shrink-0">
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden md:flex w-9 h-9 rounded-xl bg-zinc-50 items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition"><Menu size={18} /></button>
        
        <button 
          onClick={handleGoToProfile}
          className="md:hidden w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 hover:bg-indigo-100 transition-colors"
        >
          <Sparkles size={14} />
        </button>

        <h2 className="text-sm font-black text-zinc-800 tracking-tight flex items-center gap-2">
          <button 
            onClick={handleGoToProfile}
            className="hidden md:inline text-zinc-400 hover:text-indigo-600 transition-colors"
          >
            CraveLog
          </button>
          <span className="hidden md:inline text-zinc-300">/</span>
          {titleMap[viewMode] || '검색'}
        </h2>
      </div>
      
      {/* 우측 메뉴 영역 */}
      <div className="flex items-center justify-end gap-2 md:gap-3 flex-1">
        
        {/* 검색창 (데스크톱) */}
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

        {/* 검색 돋보기 아이콘 (모바일) */}
        <button 
          onClick={() => setIsMobileSearchOpen(true)} 
          className="sm:hidden w-9 h-9 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 rounded-full transition-colors"
        >
          <Search size={18} />
        </button>

        {isAdmin ? (
          <>
            {/* ⭐️ 가장 중요한 '새 기록' 액션은 외부에 단독 배치 */}
            {canEdit && (
              <button onClick={() => setAddRecordModalOpen(true)} className="px-3 md:px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 transition shadow-sm flex items-center gap-1.5 md:mr-1">
                <Plus size={14} /> <span className="hidden md:inline">새 기록</span>
              </button>
            )}
            
            {/* ⭐️ 나머지 메뉴를 깔끔하게 통합한 사용자 드롭다운 */}
            <div className="relative">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} 
                className={`w-9 h-9 rounded-full flex items-center justify-center transition shadow-sm border ${isUserMenuOpen ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:text-indigo-600 hover:bg-indigo-50'}`}
                title="사용자 메뉴"
              >
                <User size={16} />
              </button>

              {isUserMenuOpen && (
                <>
                  {/* 드롭다운 외부 영역 클릭 시 닫히도록 하는 투명 배경 */}
                  <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)}></div>
                  
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-zinc-100 rounded-2xl shadow-xl overflow-hidden py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    
                    <button 
                      onClick={() => { handleGoToProfile(); setIsUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-zinc-700 hover:bg-zinc-50 transition text-left"
                    >
                      <User size={16} className="text-zinc-400" /> 마이페이지
                    </button>

                    {canEdit && (
                      <button 
                        onClick={() => { setViewMode('account_settings'); setIsUserMenuOpen(false); }} 
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-zinc-700 hover:bg-zinc-50 transition text-left"
                      >
                        <Settings size={16} className="text-zinc-400" /> 계정 설정
                      </button>
                    )}

                    <button 
                      onClick={() => {
                        if (visitedHandle) resetToMyProfile();
                        else setIsGuestMode(!isGuestMode);
                        setViewMode('profile');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-zinc-700 hover:bg-zinc-50 transition text-left"
                    >
                      {isViewingOther ? <EyeOff size={16} className="text-zinc-400" /> : <Eye size={16} className="text-zinc-400" />}
                      {isViewingOther ? '내 프로필로 복귀' : '게스트 뷰 체험'}
                    </button>

                    <div className="h-px bg-zinc-100 my-1 mx-2"></div>

                    <button 
                      onClick={() => { handleLogout(); showToast("로그아웃 되었습니다. 👋"); setIsUserMenuOpen(false); }} 
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 transition text-left"
                    >
                      <LogOut size={16} className="text-rose-400" /> 로그아웃
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <button onClick={() => setLoginModalOpen(true)} className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center text-white hover:bg-zinc-800 transition shadow-sm" title="로그인">
            <Lock size={14} />
          </button>
        )}
      </div>
    </header>
  );
};

export default TopNavBar;