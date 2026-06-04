"use client";
import Toast from '@/components/common/Toast';
import BottomNavigation from '@/components/layout/BottomNavigation';
import TimelineView from '@/components/timeline/TimelineView';
import ProfileView from '@/components/profile/ProfileView';
import SpaceView from '@/components/space/SpaceView';

// 🚀 AppProvider와 useAppStore를 모두 가져옵니다.
import { AppProvider, useAppStore } from '@/store/useStore';

// 1. 실제 UI를 그리고 상태를 꺼내 쓰는 자식 컴포넌트
const AppContent = () => {
  // Context API 방식이므로 구조분해할당으로 꺼내옵니다.
  const { viewMode } = useAppStore();

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex justify-center items-center font-sans p-0 sm:p-4">
      <div className="w-full max-w-md bg-white h-screen sm:h-[82vh] sm:max-h-[800px] sm:min-h-[680px] flex flex-col relative shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden sm:rounded-[2rem] transition-all duration-300">
        <Toast />
        {viewMode === 'home' && <TimelineView />}
        {viewMode === 'profile' && <ProfileView />}
        {viewMode === 'archive' && <SpaceView />}
        <BottomNavigation />
      </div>
    </div>
  );
};

// 2. 최상단 부모 컴포넌트 (Provider로 감싸기만 함)
export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}