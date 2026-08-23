import React from 'react';
import { Ghost, Home, ArrowLeft } from 'lucide-react';
import { useAppStore } from '../store/AppStore';

const NotFoundView = () => {
  const { setViewMode } = useAppStore();

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] p-6 text-center animate-in fade-in duration-500">
      <div className="relative">
        <div className="w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center animate-bounce mb-6 mx-auto shadow-inner">
          <Ghost size={56} className="text-indigo-400" />
        </div>
        <div className="absolute -bottom-2 -right-4 text-6xl font-black text-indigo-900/10 select-none">
          404
        </div>
      </div>
      
      <h2 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight mb-3">
        앗, 페이지를 찾을 수 없어요!
      </h2>
      <p className="text-sm md:text-base text-zinc-500 font-medium mb-8 max-w-md leading-relaxed">
        요청하신 페이지가 사라졌거나, 잘못된 경로로 접근하셨습니다. <br/>
        입력하신 주소가 정확한지 다시 한번 확인해 주세요.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <button 
          onClick={() => window.history.back()} 
          className="px-6 py-3 bg-white border border-zinc-200 text-zinc-600 rounded-xl text-sm font-bold hover:bg-zinc-50 hover:text-zinc-900 transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <ArrowLeft size={16} /> 이전 페이지로
        </button>
        <button 
          onClick={() => setViewMode('profile')} 
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <Home size={16} /> 홈으로 가기
        </button>
      </div>
    </div>
  );
};

export default NotFoundView;