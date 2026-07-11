import React from 'react';
import { AppProvider, useAppStore } from './store/AppStore';
import { Sparkles, Loader2 } from 'lucide-react'; 

import Toast from './components/common/Toast';
import AuthModal from './components/common/AuthModal';
import AddRecordModal from './components/features/AddRecordModal';
import Sidebar from './components/layout/Sidebar';
import TopNavBar from './components/layout/TopNavBar';
import MobileBottomNav from './components/layout/MobileBottomNav';
import ProfileView from './pages/ProfileView';
import EditProfileView from './pages/EditProfileView';
import ArchiveView from './pages/ArchiveView';
import TimelineView from './pages/TimelineView';
import SearchView from './pages/SearchView';
import AccountSettingsView from './pages/AccountSettingsView'; // ⭐️ 계정 설정 컴포넌트 임포트

const AppContent = () => {
  const { viewMode, isLoading } = useAppStore();

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
      <AddRecordModal />
      <Sidebar />

      <main className="flex-1 relative overflow-hidden flex flex-col min-w-0">
         <TopNavBar />
         <div className="flex-1 overflow-y-auto">
           {viewMode === 'profile' && <ProfileView />}
           {viewMode === 'edit_profile' && <EditProfileView />}
           {viewMode === 'archive' && <ArchiveView />}
           {viewMode === 'timeline' && <TimelineView />}
           {viewMode === 'search' && <SearchView />}
           {viewMode === 'account_settings' && <AccountSettingsView />} {/* ⭐️ 계정 설정 뷰 렌더링 연결 */}
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