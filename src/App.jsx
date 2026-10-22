import React, { useEffect } from 'react';
import { AppProvider, useAppStore } from './store/AppStore';
import { Sparkles, Loader2 } from 'lucide-react'; 

import Toast from './components/common/Toast';
import AuthModal from './components/common/AuthModal';
import OnboardingPersonaModal from './components/common/OnboardingPersonaModal';
import AddRecordModal from './components/features/AddRecordModal';
import Sidebar from './components/layout/Sidebar';
import TopNavBar from './components/layout/TopNavBar';
import MobileBottomNav from './components/layout/MobileBottomNav';
import LandingView from './pages/LandingView';
import ProfileView from './pages/ProfileView';
import EditProfileView from './pages/EditProfileView';
import ArchiveView from './pages/ArchiveView';
import TimelineView from './pages/TimelineView';
import SearchView from './pages/SearchView';
import AccountSettingsView from './pages/AccountSettingsView';
import AccessControlView from './pages/AccessControlView';
import Footer from './components/Footer'; 
import NotFoundView from './pages/NotFoundView'; // ⭐️ 404 페이지 임포트 유지
import { trackPlatformVisit, initGoogleAnalytics } from './utils/analyticsTracker';

const AppContent = () => {
  const { viewMode, isLoading, isAdmin } = useAppStore();

  // ⭐️ GA4 초기화 (측정 ID가 환경변수에 있을 시 자동 주입)
  useEffect(() => {
    initGoogleAnalytics();
  }, []);

  // ⭐️ 플랫폼 전체 트래픽 비콘 자동 전송 (화면 이동 시 비동기 집계)
  useEffect(() => {
    if (!isLoading && viewMode) {
      trackPlatformVisit(viewMode);
    }
  }, [viewMode, isLoading]);

  // 🚨 전역 로딩 화면: 데이터가 모두 준비되기 전까지는 사이드바나 네비게이션을 아예 그리지 않습니다!
  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#F8FAFC] gap-5">
        <div className="w-20 h-20 rounded-[2rem] bg-white flex items-center justify-center text-indigo-500 shadow-xl border border-zinc-200/60 animate-bounce">
          <Sparkles size={36} />
        </div>
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
          <p className="text-sm font-black text-zinc-500 tracking-widest uppercase">CraveLog Loading...</p>
        </div>
      </div>
    );
  }

  // 로딩이 끝나면 진짜 화면을 렌더링합니다.
  return (
    <div className="flex h-screen w-full overflow-hidden transition-colors duration-700 font-sans bg-[#F8FAFC]">
      <Toast />
      <AuthModal />
      <OnboardingPersonaModal />
      <AddRecordModal />
      <Sidebar />

      <main className="flex-1 relative overflow-hidden flex flex-col min-w-0">
         <TopNavBar />
         
         {/* ⭐️ 화면이 스크롤되는 영역 */}
         <div className="flex-1 overflow-y-auto flex flex-col">
           {/* 콘텐츠들이 렌더링되는 영역 (flex-1을 주어 콘텐츠가 짧아도 푸터를 맨 밑으로 밀어냅니다) */}
           <div className="flex-1">
             {viewMode === 'landing' && <LandingView />}
             {viewMode === 'profile' && <ProfileView />}
             {viewMode === 'edit_profile' && <EditProfileView />}
             {viewMode === 'archive' && <ArchiveView />}
             {viewMode === 'timeline' && <TimelineView />}
             {viewMode === 'search' && <SearchView />}
             {viewMode === 'account_settings' && (isAdmin ? <AccountSettingsView /> : <LandingView />)}
             {viewMode === 'access_control' && (isAdmin ? <AccessControlView /> : <LandingView />)}
             
             {/* ⭐️ 404 에러 페이지 로직: 위에서 정의한 뷰가 아닐 때 렌더링됩니다 */}
             {!['landing', 'profile', 'edit_profile', 'archive', 'timeline', 'search', 'account_settings', 'access_control'].includes(viewMode) && (
               <NotFoundView />
             )}
           </div>
           
           {/* ⭐️ 모든 화면 스크롤의 맨 밑에 공통으로 나타나는 푸터 */}
           <Footer />
         </div>
      </main>

      <MobileBottomNav />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}