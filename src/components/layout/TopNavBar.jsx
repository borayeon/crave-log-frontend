import React, { useState } from 'react';
import { Menu, Sparkles, Search, User, LogOut, Lock, Plus, Eye, EyeOff, X, Settings, ShieldCheck, Globe, Check } from 'lucide-react';
import { useAppStore } from '../../store/AppStore';
import { trackSearchEvent } from '../../utils/analyticsTracker';

const TopNavBar = () => {
  const { 
    viewMode, setViewMode, isSidebarOpen, setIsSidebarOpen, isAdmin, 
    setLoginModalOpen, setAddRecordModalOpen, showToast, handleLogout, 
    isGuestMode, setIsGuestMode, searchQuery, setSearchQuery, searchUsers,
    visitedHandle, resetToMyProfile, visitUserProfile,
    t, currentLang, setLanguage, SUPPORTED_LANGS 
  } = useAppStore();

  // 상태 관리: 모바일 검색창 & 사용자 드롭다운 메뉴 & 언어 선택 드롭다운
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false); 
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const currentLangObj = SUPPORTED_LANGS?.find(l => l.code === currentLang) || { code: 'ko', short: 'KO', flag: '🇰🇷', label: '한국어' };

  const titleMap = { 
    landing: t('nav.home_full', '홈 / 소개 (Home)'),
    profile: t('nav.profile_full', '프로필 (Profile)'), 
    edit_profile: t('nav.edit_profile_full', '프로필 설정 (Set Profile)'), 
    archive: t('nav.archive_full', '컬렉션 (Collection)'), 
    timeline: t('nav.timeline_full', '타임라인 (Timeline)'), 
    search: t('nav.search_full', '검색 결과 (Search)'),
    account_settings: t('nav.account_settings_full', '계정 설정 (Settings)'),
    access_control: t('nav.access_control', '공개 권한 & 팔로우')
  };

  const handleSearchSubmit = () => {
    if (searchQuery && searchQuery.trim()) {
      trackSearchEvent(searchQuery.trim());
    }
    searchUsers(searchQuery);
    setViewMode('search');
    setIsMobileSearchOpen(false); 
  };

  const handleHomeClick = () => {
    if (isAdmin) {
      if (visitedHandle) resetToMyProfile();
      else setViewMode('profile');
    } else {
      setViewMode('landing');
    }
  };

  const handleGoToProfile = () => {
    if (!isAdmin && !visitedHandle) {
      setLoginModalOpen(true);
      showToast('로그인이 필요한 서비스입니다. 🔒');
      return;
    }
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
            placeholder={t('header.search_placeholder', '사용자 및 기록 검색...')} 
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
          onClick={handleHomeClick}
          className="md:hidden w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 hover:bg-indigo-100 transition-colors"
          title={isAdmin ? t('header.home_tooltip_user', '내 프로필로 이동') : t('header.home_tooltip_guest', 'CraveLog 홈 / 소개로 이동')}
        >
          <Sparkles size={14} />
        </button>

        <h2 className="text-sm font-black text-zinc-800 tracking-tight flex items-center gap-2">
          <button 
            onClick={handleHomeClick}
            className="hidden md:inline text-zinc-400 hover:text-indigo-600 transition-colors cursor-pointer"
            title={isAdmin ? t('header.home_tooltip_user', '내 프로필로 이동') : t('header.home_tooltip_guest', 'CraveLog 홈 / 소개로 이동')}
          >
            CraveLog
          </button>
          <span className="hidden md:inline text-zinc-300">/</span>
          {titleMap[viewMode] || t('nav.search', '검색')}
        </h2>
      </div>
      
      {/* 우측 메뉴 영역 */}
      <div className="flex items-center justify-end gap-2 md:gap-3 flex-1">
        
        {/* 검색창 (데스크톱) */}
        <div className="hidden sm:flex items-center relative w-full max-w-[200px] md:max-w-[240px] lg:max-w-[280px]">
          <button onClick={handleSearchSubmit} className="absolute left-2.5 p-1.5 text-zinc-400 hover:text-indigo-500 hover:bg-zinc-200/50 rounded-full transition-colors z-10" title={t('header.search_btn', '검색하기')}>
            <Search size={16} />
          </button>
          <input 
            type="text" 
            value={searchQuery || ''} 
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSearchSubmit(); }}
            placeholder={t('header.search_placeholder', '사용자 및 기록 검색...')} 
            className="w-full bg-zinc-100/80 border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-full py-2 pl-10 pr-4 text-xs font-bold text-zinc-800 outline-none transition-all shadow-sm"
          />
        </div>

        {/* 검색 돋보기 아이콘 (모바일) */}
        <button 
          onClick={() => setIsMobileSearchOpen(true)} 
          className="sm:hidden w-9 h-9 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 rounded-full transition-colors"
          title={t('header.search_btn', '검색하기')}
        >
          <Search size={18} />
        </button>

        {/* 🌐 언어 선택 드롭다운 (다국어 지원: 한국어, English, 简体中文) */}
        <div className="relative">
          <button 
            onClick={() => { setIsLangMenuOpen(!isLangMenuOpen); setIsUserMenuOpen(false); }}
            className={`h-9 px-2.5 rounded-full flex items-center gap-1.5 transition text-xs font-bold border shadow-sm ${
              isLangMenuOpen 
                ? 'bg-indigo-50 text-indigo-600 border-indigo-200' 
                : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:text-indigo-600 hover:bg-indigo-50'
            }`}
            title={t('lang.select', '언어 선택')}
          >
            <Globe size={15} className="text-zinc-500 group-hover:text-indigo-600" />
            <span className="text-[11px] font-extrabold">{currentLangObj.short}</span>
          </button>

          {isLangMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsLangMenuOpen(false)}></div>
              
              <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-zinc-100 rounded-2xl shadow-xl overflow-hidden py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 flex items-center gap-1.5">
                  <Globe size={12} /> {t('lang.select', '언어 선택')}
                </div>
                {SUPPORTED_LANGS.map((lang) => (
                  <button 
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsLangMenuOpen(false);
                      showToast(t('toast.lang_changed', '언어가 변경되었습니다.'));
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold transition text-left ${
                      currentLang === lang.code 
                        ? 'bg-indigo-50/80 text-indigo-600 font-extrabold' 
                        : 'text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-sm">{lang.flag}</span>
                      <span>{lang.label}</span>
                    </span>
                    {currentLang === lang.code && <Check size={14} className="text-indigo-600" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {isAdmin ? (
          <>
            {/* ⭐️ 가장 중요한 '새 기록' 액션은 외부에 단독 배치 */}
            {canEdit && (
              <button onClick={() => setAddRecordModalOpen(true)} className="px-3 md:px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 transition shadow-sm flex items-center gap-1.5 md:mr-1">
                <Plus size={14} /> <span className="hidden md:inline">{t('header.new_record', '새 기록')}</span>
              </button>
            )}
            
            {/* ⭐️ 나머지 메뉴를 깔끔하게 통합한 사용자 드롭다운 */}
            <div className="relative">
              <button 
                onClick={() => { setIsUserMenuOpen(!isUserMenuOpen); setIsLangMenuOpen(false); }} 
                className={`w-9 h-9 rounded-full flex items-center justify-center transition shadow-sm border ${isUserMenuOpen ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:text-indigo-600 hover:bg-indigo-50'}`}
                title={t('header.user_menu', '사용자 메뉴')}
              >
                <User size={16} />
              </button>

              {isUserMenuOpen && (
                <>
                  {/* 드롭다운 외부 영역 클릭 시 닫히도록 하는 투명 배경 */}
                  <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)}></div>
                  
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-zinc-100 rounded-2xl shadow-xl overflow-hidden py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    
                    <button 
                      onClick={() => { handleGoToProfile(); setIsUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-zinc-700 hover:bg-zinc-50 transition text-left"
                    >
                      <User size={16} className="text-zinc-400" /> {t('header.mypage', '마이페이지')}
                    </button>

                    {/* 🔒 사용자 전용 공개 권한 & 팔로우 관리 */}
                    <button 
                      onClick={() => { setViewMode('access_control'); setIsUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-zinc-700 hover:bg-zinc-50 transition text-left"
                    >
                      <ShieldCheck size={16} className="text-indigo-600" /> {t('header.access_control', '공개 권한 & 팔로우')}
                    </button>

                    {canEdit && (
                      <button 
                        onClick={() => { setViewMode('account_settings'); setIsUserMenuOpen(false); }} 
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-zinc-700 hover:bg-zinc-50 transition text-left"
                      >
                        <Settings size={16} className="text-zinc-400" /> {t('header.account_settings', '계정 설정')}
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
                      {isViewingOther ? t('header.guest_mode_off', '내 프로필로 복귀') : t('header.guest_mode_on', '게스트 뷰 체험')}
                    </button>

                    <div className="h-px bg-zinc-100 my-1 mx-2"></div>

                    <button 
                      onClick={() => { setViewMode('landing'); setIsUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-zinc-700 hover:bg-zinc-50 transition text-left"
                    >
                      <Sparkles size={16} className="text-zinc-400" /> {t('header.about', 'CraveLog 소개')}
                    </button>

                    <button 
                      onClick={() => { handleLogout(); showToast(t('toast.logged_out', '로그아웃 되었습니다. 👋')); setIsUserMenuOpen(false); }} 
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 transition text-left"
                    >
                      <LogOut size={16} className="text-rose-400" /> {t('header.logout', '로그아웃')}
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <button onClick={() => setLoginModalOpen(true)} className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center text-white hover:bg-zinc-800 transition shadow-sm" title={t('header.login', '로그인')}>
            <Lock size={14} />
          </button>
        )}
      </div>
    </header>
  );
};

export default TopNavBar;