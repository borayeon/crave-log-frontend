import React from 'react';
import { History, User, Network, Sparkles, ShieldCheck } from 'lucide-react';
import { useAppStore } from '../../store/AppStore';

const MobileBottomNav = () => {
  const { viewMode, setViewMode, isAdmin, visitedHandle, setLoginModalOpen, showToast, resetToMyProfile, t } = useAppStore();
  
  return (
    <div className="md:hidden fixed bottom-6 left-4 right-4 z-50 pointer-events-none">
      <nav className="w-full h-16 rounded-[2rem] backdrop-blur-xl flex items-center justify-around px-2 shadow-2xl pointer-events-auto transition-all duration-500 bg-white/80 border border-zinc-200/60 shadow-zinc-200/50">
        
        {/* 비로그인 방문자일 때는 '소개' 노출 */}
        {!isAdmin && (
          <button onClick={() => setViewMode('landing')} className={`flex flex-col items-center justify-center gap-1 w-14 h-full transition-all rounded-2xl ${viewMode === 'landing' ? 'text-indigo-600 scale-105' : 'text-zinc-400 hover:text-zinc-600'}`}>
              <Sparkles size={18} />
              <span className="text-[9px] font-bold">{t('nav.intro_short', '소개')}</span>
          </button>
        )}

        <button 
          onClick={() => {
            if (!isAdmin && !visitedHandle) {
              setLoginModalOpen(true);
              showToast(t('toast.login_required', '로그인이 필요한 서비스입니다. 🔒'));
              return;
            }
            if (isAdmin && visitedHandle) {
              resetToMyProfile();
            } else {
              setViewMode('profile');
            }
          }} 
          className={`flex flex-col items-center justify-center gap-1 w-14 h-full transition-all rounded-2xl ${viewMode === 'profile' ? 'text-indigo-600 scale-105' : 'text-zinc-400 hover:text-zinc-600'}`}
        >
            <User size={18} />
            <span className="text-[9px] font-bold">{isAdmin ? t('nav.my_profile', '내 프로필') : t('nav.profile', '프로필')}</span>
        </button>
        
        <button 
          onClick={() => {
            if (!isAdmin && !visitedHandle) {
              setLoginModalOpen(true);
              showToast(t('toast.login_required', '로그인이 필요한 서비스입니다. 🔒'));
              return;
            }
            setViewMode('archive');
          }} 
          className={`flex flex-col items-center justify-center gap-1 w-14 h-full transition-all rounded-2xl ${viewMode === 'archive' ? 'text-indigo-600 scale-105' : 'text-zinc-400 hover:text-zinc-600'}`}
        >
            <Network size={18} />
            <span className="text-[9px] font-bold">{t('nav.archive', '컬렉션')}</span>
        </button>

        <button 
          onClick={() => {
            if (!isAdmin && !visitedHandle) {
              setLoginModalOpen(true);
              showToast(t('toast.login_required', '로그인이 필요한 서비스입니다. 🔒'));
              return;
            }
            setViewMode('timeline');
          }} 
          className={`flex flex-col items-center justify-center gap-1 w-14 h-full transition-all rounded-2xl ${viewMode === 'timeline' ? 'text-indigo-600 scale-105' : 'text-zinc-400 hover:text-zinc-600'}`}
        >
            <History size={18} />
            <span className="text-[9px] font-bold">{t('nav.timeline', '타임라인')}</span>
        </button>

        {/* 로그인 회원 전용: 공개 & 팔로우 관리 */}
        {isAdmin && (
          <button 
            onClick={() => setViewMode('access_control')} 
            className={`flex flex-col items-center justify-center gap-1 w-14 h-full transition-all rounded-2xl ${viewMode === 'access_control' ? 'text-indigo-600 scale-105' : 'text-zinc-400 hover:text-zinc-600'}`}
          >
              <ShieldCheck size={18} />
              <span className="text-[9px] font-bold">{t('nav.access_short', '공개/팔로우')}</span>
          </button>
        )}

      </nav>
    </div>
  );
};

export default MobileBottomNav;