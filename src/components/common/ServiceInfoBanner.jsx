import React from 'react';
import { Sparkles, Fingerprint, BookOpen, Quote } from 'lucide-react';
import { useAppStore } from '../../store/AppStore.jsx'; // Added .jsx extension

const ServiceInfoBanner = () => {
  // 전역 상태에서 로그인 여부(isAdmin)를 가져옵니다.
  const { isAdmin } = useAppStore();

  // ⭐️ 핵심 조건: 로그인한 사용자(isAdmin === true)에게는 이 배너를 렌더링하지 숨깁니다.
  if (isAdmin) return null;

  return (
    <div className="mx-4 mt-auto mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-br from-indigo-50 to-violet-50/30 border border-indigo-100/60 rounded-2xl p-5 shadow-sm relative overflow-hidden group">
        
        {/* 장식용 배경 효과 (은은한 빛) */}
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-indigo-200/30 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-300/40 transition-colors duration-500"></div>
        <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-violet-200/30 rounded-full blur-2xl pointer-events-none group-hover:bg-violet-300/40 transition-colors duration-500"></div>

        <div className="flex items-center gap-2 mb-4 relative z-10">
          <div className="w-6 h-6 rounded-full bg-white shadow-sm text-indigo-500 flex items-center justify-center shrink-0 border border-indigo-100">
             <Sparkles size={12} className="fill-indigo-100" />
          </div>
          <h3 className="text-[13px] font-black text-indigo-900 tracking-tight">CraveLog 소개</h3>
        </div>
        
        <ul className="space-y-3 mb-5 relative z-10">
          <li className="flex items-start gap-2.5">
            <Fingerprint size={14} className="text-indigo-400 mt-0.5 shrink-0" />
            <p className="text-[11px] font-bold text-zinc-600 leading-relaxed">
              이력서나 포트폴리오를 넘어, <br/>
              <span className="text-indigo-700">나라는 사람의 취향과 성향</span>을<br/>아카이빙하는 공간입니다.
            </p>
          </li>
          <li className="flex items-start gap-2.5">
            <BookOpen size={14} className="text-indigo-400 mt-0.5 shrink-0" />
            <p className="text-[11px] font-bold text-zinc-600 leading-relaxed">
              개발 지식부터 소소한 일상까지 <br/>
              <span className="text-indigo-700">모든 기록을 나만의 색깔로</span><br/>보관하고 공유하세요.
            </p>
          </li>
        </ul>

        <div className="pt-3.5 border-t border-indigo-100/60 relative z-10 text-center">
           <Quote size={12} className="text-indigo-300 mx-auto mb-1.5 opacity-50" />
           <p className="text-[9px] font-black text-indigo-400/80 uppercase tracking-widest">
              Your Story, Your Log
           </p>
        </div>
      </div>
    </div>
  );
};

export default ServiceInfoBanner;