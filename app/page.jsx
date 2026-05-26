"use client";
import Toast from '@/components/common/Toast';
import BottomNavigation from '@/components/layout/BottomNavigation';
import TimelineView from '@/components/timeline/TimelineView';
import ProfileView from '@/components/profile/ProfileView';
import SpaceView from '@/components/space/SpaceView';
import { useAppStore } from '@/store/useStore';

export default function App() {
  const viewMode = useAppStore(state => state.viewMode);

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
}
