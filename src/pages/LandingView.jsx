import React from 'react';
import { 
  ArrowRight, User, Sparkles, Lock, 
  FileText, BarChart3, Globe, ExternalLink,
  CheckCircle2, Compass, Bookmark
} from 'lucide-react';
import { useAppStore } from '../store/AppStore';

const LandingView = () => {
  const { 
    visitUserProfile, 
    setLoginModalOpen, 
    setViewMode, 
    isAdmin 
  } = useAppStore();

  return (
    <div className="min-h-full bg-[#F8FAFC] text-zinc-900 pb-24 md:pb-20">
      
      {/* ========================================================= */}
      {/* 1. HERO SECTION (Minimalist & Clean Light Aesthetic) */}
      {/* ========================================================= */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        
        {/* Soft Background Radial Gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 bg-gradient-to-b from-indigo-100/50 via-violet-50/30 to-transparent blur-3xl pointer-events-none -z-10" />

        {/* Small Status Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-xs font-bold mb-6">
          <Sparkles size={13} className="text-indigo-600" />
          <span>나를 표현하는 가장 쉬운 방법</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-zinc-950 tracking-tight leading-[1.18] mb-4 break-keep">
          기록과 프로필을 하나로, <br className="hidden sm:inline" />
          <span className="text-indigo-600">CraveLog</span>
        </h1>

        {/* Subtitle - Single Minimal Sentence */}
        <p className="text-sm sm:text-base md:text-lg text-zinc-500 font-medium max-w-xl mx-auto mb-8 leading-relaxed break-keep">
          링크 하나로 완성하는 나만의 프로필과 포트폴리오. <br className="hidden sm:inline" />
          매일의 작업과 배움을 가볍고 정갈하게 기록하세요.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto mb-14">
          {/* Primary CTA: Developer Profile Shortcut */}
          <button
            onClick={() => visitUserProfile('taeya00')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <User size={16} />
            <span>개발자 프로필 보기 (@taeya00)</span>
            <ArrowRight size={15} />
          </button>

          {/* Secondary CTA: Get Started */}
          <button
            onClick={() => {
              if (isAdmin) setViewMode('profile');
              else setLoginModalOpen(true);
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            {isAdmin ? '내 프로필로 이동' : '시작하기'}
          </button>
        </div>

        {/* ========================================================= */}
        {/* DEVELOPER PROFILE PREVIEW CARD (@taeya00) */}
        {/* ========================================================= */}
        <div 
          onClick={() => visitUserProfile('taeya00')}
          className="max-w-xl mx-auto bg-white rounded-3xl border border-zinc-200/80 p-5 sm:p-6 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 text-left cursor-pointer group relative overflow-hidden"
        >
          {/* Top subtle highlight */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600 opacity-80" />

          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-base shadow-sm">
                T
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-zinc-900 group-hover:text-indigo-600 transition-colors">
                    태야
                  </h3>
                  <span className="text-xs font-bold text-zinc-400">@taeya00</span>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-[10px] font-bold">
                    개발자
                  </span>
                </div>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">
                  풀스택 개발자 • CraveLog 운영자
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50/80 px-2.5 py-1.5 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">
              <span>둘러보기</span>
              <ArrowRight size={13} />
            </div>
          </div>

          <p className="text-xs text-zinc-600 leading-relaxed font-medium mb-4 bg-zinc-50/80 p-3 rounded-xl border border-zinc-100">
            "더 나은 사용자 경험을 만드는 풀스택 개발자의 기록과 아카이브입니다."
          </p>

          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-zinc-500">
            <span className="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-700">#Spring_Boot</span>
            <span className="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-700">#React</span>
            <span className="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-700">#성장기록</span>
            <span className="ml-auto text-[11px] text-zinc-400 font-mono">cravelog.me/@taeya00</span>
          </div>
        </div>

      </section>

      {/* ========================================================= */}
      {/* 2. SIMPLE CORE FEATURES (No difficult jargon) */}
      {/* ========================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto mb-16">
        
        <div className="text-center max-w-md mx-auto mb-10">
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight mb-2">
            꼭 필요한 기능만 담았습니다
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 font-medium">
            복잡한 설정 없이 바로 나만의 페이지를 시작할 수 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          
          {/* Card 1: 프로필 */}
          <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <User size={20} />
            </div>
            <h3 className="text-base font-bold text-zinc-900 mb-1.5">
              나만의 프로필
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              이력서, SNS, 블로그 링크를 한 페이지에 깔끔하게 정리해 공유하세요.
            </p>
          </div>

          {/* Card 2: 성장 기록 */}
          <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-4">
              <FileText size={20} />
            </div>
            <h3 className="text-base font-bold text-zinc-900 mb-1.5">
              성장 기록
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              공부한 내용, 진행 중인 프로젝트, 생각들을 타임라인으로 남기세요.
            </p>
          </div>

          {/* Card 3: 공개 범위 설정 */}
          <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Lock size={20} />
            </div>
            <h3 className="text-base font-bold text-zinc-900 mb-1.5">
              공개 범위 설정
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              전체 공개부터 비밀번호 잠금, 비공개 메모까지 안전하게 보호됩니다.
            </p>
          </div>

          {/* Card 4: 방문자 통계 */}
          <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <BarChart3 size={20} />
            </div>
            <h3 className="text-base font-bold text-zinc-900 mb-1.5">
              방문자 통계
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              내 프로필과 기록을 얼마나 많은 사람이 방문했는지 한눈에 확인하세요.
            </p>
          </div>

        </div>

      </section>

      {/* ========================================================= */}
      {/* 3. BOTTOM BANNER */}
      {/* ========================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-zinc-200/80 shadow-sm text-center relative overflow-hidden">
          
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight mb-2">
            지금 나만의 CraveLog를 시작해보세요
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 font-medium max-w-md mx-auto mb-6">
            회원가입 후 몇 분 만에 링크 하나로 나만의 공간을 완성할 수 있습니다.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => visitUserProfile('taeya00')}
              className="w-full sm:w-auto px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span>@taeya00 프로필 둘러보기</span>
              <ArrowRight size={14} />
            </button>
            <button
              onClick={() => {
                if (isAdmin) setViewMode('profile');
                else setLoginModalOpen(true);
              }}
              className="w-full sm:w-auto px-6 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95"
            >
              {isAdmin ? '내 프로필로 이동' : '무료로 시작하기'}
            </button>
          </div>

        </div>
      </section>

    </div>
  );
};

export default LandingView;
