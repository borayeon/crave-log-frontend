import React from 'react';
import { Lock, MessageSquare } from 'lucide-react';
import { useAppStore, API_BASE_URL } from '../../store/AppStore';

const AuthModal = () => {
  const { loginModalOpen, setLoginModalOpen } = useAppStore();
  
  if (!loginModalOpen) return null;

  const handleLogin = () => {
    // ⭐️ VITE_API_BASE_URL (예: https://crave-log-api.onrender.com/api/v1) 에서
    // 뒤의 /api/v1 부분을 떼어내고 순수 백엔드 도메인만 추출합니다.
    const backendDomain = API_BASE_URL.replace('/api/v1', '');
    
    // 카카오 로그인 인증 창으로 브라우저 이동!
    window.location.href = `${backendDomain}/oauth2/authorization/kakao`;
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/60 z-[150] flex justify-center items-center p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setLoginModalOpen(false)}>
      <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 flex flex-col items-center shadow-2xl border border-zinc-100" onClick={e => e.stopPropagation()}>
        <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6 border border-zinc-100 shadow-sm">
          <Lock size={28} className="text-zinc-400" />
        </div>
        <h2 className="text-xl font-black text-zinc-900 tracking-tight mb-2">CraveLog 시작하기</h2>
        <p className="text-xs text-zinc-500 text-center leading-relaxed font-medium mb-8">
          카카오 계정으로 간편하게 로그인하고<br/>나만의 취향 공간을 만들어보세요.
        </p>
        <button onClick={handleLogin} className="w-full py-3.5 bg-[#FEE500] hover:bg-[#E5CF00] text-black rounded-xl font-black text-sm flex items-center justify-center gap-2 transition duration-300 shadow-sm">
          <MessageSquare size={16} className="fill-black" /> 카카오 계정으로 계속하기
        </button>
        <button onClick={() => setLoginModalOpen(false)} className="w-full mt-3 py-3.5 bg-white border border-zinc-200 text-zinc-600 rounded-xl font-bold text-sm hover:bg-zinc-50 transition duration-300">
          나중에 하기
        </button>
      </div>
    </div>
  );
};

export default AuthModal;