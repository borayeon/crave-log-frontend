import React from 'react';
import { AppProvider, useAppStore } from './store/AppStore';
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

const AppContent = () => {
  const { viewMode } = useAppStore();

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