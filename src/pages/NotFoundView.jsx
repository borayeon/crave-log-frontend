import React from 'react';
import { Ghost, Home, ArrowLeft } from 'lucide-react';
import { useAppStore } from '../store/AppStore';

const NotFoundView = () => {
  const { setViewMode, t, currentLang } = useAppStore();

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
        {currentLang === 'zh' ? '哎呀，找不到该页面！' : currentLang === 'en' ? 'Oops, Page Not Found!' : '앗, 페이지를 찾을 수 없어요!'}
      </h2>
      <p className="text-sm md:text-base text-zinc-500 font-medium mb-8 max-w-md leading-relaxed">
        {currentLang === 'zh' ? (
          <>您请求的页面可能已被移除或路径不正确。<br/>请检查您输入的网址是否准确。</>
        ) : currentLang === 'en' ? (
          <>The requested page may have been removed or the URL is incorrect.<br/>Please check the address and try again.</>
        ) : (
          <>요청하신 페이지가 사라졌거나, 잘못된 경로로 접근하셨습니다. <br/>입력하신 주소가 정확한지 다시 한번 확인해 주세요.</>
        )}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <button 
          onClick={() => window.history.back()} 
          className="px-6 py-3 bg-white border border-zinc-200 text-zinc-600 rounded-xl text-sm font-bold hover:bg-zinc-50 hover:text-zinc-900 transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <ArrowLeft size={16} /> {currentLang === 'zh' ? '返回上一页' : currentLang === 'en' ? 'Go Back' : '이전 페이지로'}
        </button>
        <button 
          onClick={() => setViewMode('profile')} 
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <Home size={16} /> {currentLang === 'zh' ? '返回主页' : currentLang === 'en' ? 'Go Home' : '홈으로 가기'}
        </button>
      </div>
    </div>
  );
};

export default NotFoundView;