import React, { useState } from 'react';
import { 
  Sparkles, ArrowRight, Search, User, ShieldCheck, 
  Layers, Lock, Compass, ExternalLink, Globe, 
  Rocket, Zap, CheckCircle2, Code2, Laptop, 
  Share2, History, Network, Heart, Terminal, 
  ChevronRight, ArrowUpRight, Flame
} from 'lucide-react';
import { useAppStore } from '../store/AppStore';

const LandingView = () => {
  const { 
    visitUserProfile, 
    setLoginModalOpen, 
    searchUsers, 
    setViewMode, 
    isAdmin, 
    user,
    showToast 
  } = useAppStore();

  const [localQuery, setLocalQuery] = useState('');

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (!localQuery || !localQuery.trim()) {
      showToast('검색어를 입력해 주세요.');
      return;
    }
    searchUsers(localQuery.trim());
  };

  const trendingTags = ['Spring Boot', 'React', 'Java', 'Fullstack', 'Frontend', 'DevOps'];

  return (
    <div className="min-h-full pb-24 md:pb-16 text-zinc-800 animate-in fade-in duration-500">
      
      {/* ========================================================= */}
      {/* 1. HERO SECTION */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-tr from-indigo-500/10 via-violet-500/15 to-rose-400/10 blur-3xl pointer-events-none -z-10 rounded-full" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-indigo-500/5 blur-2xl pointer-events-none -z-10 rounded-full" />
        
        <div className="text-center max-w-3xl mx-auto">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-indigo-200/80 shadow-sm text-xs font-black text-indigo-600 mb-6 backdrop-blur-md hover:border-indigo-300 transition-all cursor-default">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
            <Sparkles size={13} className="text-indigo-500" />
            <span>The Next-Gen Multimodal Identity & Tech Archive</span>
          </div>

          {/* Grand Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-950 leading-[1.15] mb-6">
            모든 성장과 영감의 기록, <br />
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-rose-500 bg-clip-text text-transparent">
              CraveLog
            </span>
            에서 온전히 하나로.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg font-medium text-zinc-600 leading-relaxed max-w-2xl mx-auto mb-9 break-keep">
            개발자 이력서부터 프로젝트 아카이브, 소중한 회고와 라이프스타일까지.
            <br className="hidden sm:inline" />
            멀티 페르소나와 4단계 프라이버시 보호로 나만의 독창적인 취향 공간을 완성하세요.
          </p>

          {/* Call to Actions (CTA) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 mb-12">
            {/* Primary CTA: Developer Account Shortcut */}
            <button
              onClick={() => visitUserProfile('taeya00')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-500 hover:to-violet-600 text-white font-black text-sm transition-all shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2.5 group active:scale-95"
            >
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white">
                <Code2 size={14} />
              </div>
              <span>개발자 계정 바로가기 (@taeya00)</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Secondary CTA: Get Started or My Profile */}
            <button
              onClick={() => {
                if (isAdmin) {
                  setViewMode('profile');
                } else {
                  setLoginModalOpen(true);
                }
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-zinc-50 border border-zinc-200/90 text-zinc-800 font-black text-sm transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 active:scale-95"
            >
              <Sparkles size={16} className="text-indigo-500" />
              <span>{isAdmin ? '내 프로필로 이동' : 'CraveLog 시작하기'}</span>
            </button>
          </div>

          {/* Integrated Search Box in Hero */}
          <form 
            onSubmit={handleSearchSubmit}
            className="w-full max-w-xl mx-auto relative flex items-center shadow-lg shadow-zinc-200/50 rounded-2xl bg-white border border-zinc-200/80 p-1.5 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100/60 transition-all"
          >
            <div className="pl-3.5 pr-2 text-zinc-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="궁금한 사용자나 기술 키워드를 검색해보세요..."
              className="w-full bg-transparent border-none outline-none text-xs sm:text-sm font-bold text-zinc-800 placeholder:text-zinc-400 py-2.5"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-indigo-600 text-white text-xs font-black transition-colors shrink-0"
            >
              검색
            </button>
          </form>

          {/* Quick Trending Tags */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3.5 text-[11px] font-bold text-zinc-500">
            <span className="text-zinc-400 flex items-center gap-1">
              <Flame size={12} className="text-rose-500" /> 추천 키워드:
            </span>
            {trendingTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setLocalQuery(tag);
                  searchUsers(tag);
                }}
                className="px-2.5 py-0.5 rounded-lg bg-white/70 border border-zinc-200/60 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. FEATURED DEVELOPER SHOWCASE CARD (@taeya00) */}
      {/* ========================================================= */}
      <section className="px-4 sm:px-6 lg:px-12 max-w-5xl mx-auto mb-16">
        <div className="bg-gradient-to-br from-indigo-900 via-zinc-900 to-zinc-950 rounded-[2.5rem] p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden border border-indigo-500/30 group">
          {/* Ambient Lighting inside card */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            {/* Left: Creator Profile Overview */}
            <div className="flex items-start sm:items-center gap-5">
              <div className="relative shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-indigo-400 via-rose-400 to-amber-300 p-[3px] shadow-xl">
                  <div className="w-full h-full rounded-[22px] bg-zinc-900 overflow-hidden flex items-center justify-center font-black text-2xl text-white">
                    {user?.profileImageUrl ? (
                      <img src={user.profileImageUrl} alt="taeya00" className="w-full h-full object-cover" />
                    ) : (
                      <span>T</span>
                    )}
                  </div>
                </div>
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-zinc-900 flex items-center justify-center text-[10px]" title="Online Creator">
                  ✦
                </span>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                    <Sparkles size={11} /> Creator & Host
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">@taeya00</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                  Taeya <span className="text-base text-zinc-400 font-normal">/ 개발자 대표 프로필</span>
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 font-medium mt-1.5 max-w-md leading-relaxed break-keep">
                  "세상의 모든 갈망(Crave)과 성장의 기록(Log)을 잇는 플랫폼을 만듭니다. 스프링 부트와 모던 웹 아키텍처를 연구합니다."
                </p>
              </div>
            </div>

            {/* Right: Quick Action Hub */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 w-full md:w-auto">
              <button
                onClick={() => visitUserProfile('taeya00')}
                className="w-full px-5 py-3 rounded-2xl bg-white text-zinc-950 font-black text-xs sm:text-sm hover:bg-zinc-100 transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 group/btn"
              >
                <span>대표 프로필 방문하기</span>
                <ArrowRight size={15} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={async () => {
                    await visitUserProfile('taeya00');
                    setViewMode('archive');
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 text-xs font-bold transition-all text-center"
                >
                  컬렉션 열람
                </button>
                <button
                  onClick={async () => {
                    await visitUserProfile('taeya00');
                    setViewMode('timeline');
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 text-xs font-bold transition-all text-center"
                >
                  타임라인 열람
                </button>
              </div>
            </div>
          </div>

          {/* Quick Tags underneath */}
          <div className="mt-6 pt-6 border-t border-zinc-800/80 flex flex-wrap items-center gap-2 text-xs font-bold text-zinc-400">
            <span className="text-indigo-400 text-[11px] font-mono uppercase tracking-wider">Highlights:</span>
            <span className="px-2.5 py-1 rounded-lg bg-zinc-800/60 text-zinc-300 font-mono text-[11px]">#Java_Spring_Boot</span>
            <span className="px-2.5 py-1 rounded-lg bg-zinc-800/60 text-zinc-300 font-mono text-[11px]">#React_Vite</span>
            <span className="px-2.5 py-1 rounded-lg bg-zinc-800/60 text-zinc-300 font-mono text-[11px]">#MySQL_Redis</span>
            <span className="px-2.5 py-1 rounded-lg bg-zinc-800/60 text-zinc-300 font-mono text-[11px]">#4단계_접근보안</span>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. FOUR CORE PILLARS (BENTO GRID) */}
      {/* ========================================================= */}
      <section className="px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto mb-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-black uppercase tracking-widest text-indigo-600 mb-2">
            Why CraveLog?
          </h2>
          <p className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950">
            단순한 링크 모음이 아닌, 당신의 모든 것을 증명하는 공간
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1 */}
          <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Layers size={22} />
            </div>
            <div className="text-[11px] font-black uppercase tracking-wider text-indigo-600 mb-1">
              Multi-Persona
            </div>
            <h3 className="text-lg font-black text-zinc-900 mb-2 tracking-tight">
              멀티 페르소나 프로필
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              개발자 이력서, 이직용 커리어, 개인적인 취향/아카이브를 하나의 프로필에서 탭별로 분리하고 맞춤형 공유 링크로 제공합니다.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 flex flex-col group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <ShieldCheck size={22} />
            </div>
            <div className="text-[11px] font-black uppercase tracking-wider text-emerald-600 mb-1">
              4-Tier Security
            </div>
            <h3 className="text-lg font-black text-zinc-900 mb-2 tracking-tight">
              4단계 스마트 공개 통제
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              전체공개(0), 팔로워공개(1), 비밀 PIN 잠금(2), 비공개(4)로 기록을 보호하며, 비인가자에게는 백엔드에서 원천 마스킹됩니다.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-sm hover:shadow-xl hover:border-rose-200 transition-all duration-300 flex flex-col group">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <History size={22} />
            </div>
            <div className="text-[11px] font-black uppercase tracking-wider text-rose-600 mb-1">
              Living Archive
            </div>
            <h3 className="text-lg font-black text-zinc-900 mb-2 tracking-tight">
              타임라인 & 컬렉션
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              유튜브, 아티클, 코드 스니펫 등 멀티미디어 기록과 카테고리 태그 트리가 결합되어 시간 순서대로 성장의 궤적을 그립니다.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-sm hover:shadow-xl hover:border-violet-200 transition-all duration-300 flex flex-col group">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 border border-violet-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Compass size={22} />
            </div>
            <div className="text-[11px] font-black uppercase tracking-wider text-violet-600 mb-1">
              Hybrid Analytics
            </div>
            <h3 className="text-lg font-black text-zinc-900 mb-2 tracking-tight">
              하이브리드 분석 엔진
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              자체 100% 비콘 수집과 GA4 마케팅 분석을 결합하여 순방문자, 페이지뷰, 화면별 체류 시간을 한눈에 측정합니다.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. BOTTOM CALL-TO-ACTION BANNER */}
      {/* ========================================================= */}
      <section className="px-4 sm:px-6 lg:px-12 max-w-5xl mx-auto">
        <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 rounded-[2.5rem] p-8 sm:p-12 text-center text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-3">
            당신의 갈망과 성장을 기록할 준비가 되셨나요?
          </h2>
          <p className="text-xs sm:text-sm text-indigo-100 font-medium max-w-xl mx-auto mb-8 leading-relaxed">
            지금 CraveLog에서 무료로 당신만의 인터랙티브 프로필과 아카이브를 만들고, 전 세계와 연결되어 보세요.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => visitUserProfile('taeya00')}
              className="w-full sm:w-auto px-6 py-3.5 bg-zinc-950 hover:bg-black text-white rounded-2xl text-xs sm:text-sm font-black transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95"
            >
              <span>개발자 계정 (@taeya00) 바로가기</span>
              <ArrowRight size={15} />
            </button>
            <button
              onClick={() => {
                if (isAdmin) setViewMode('profile');
                else setLoginModalOpen(true);
              }}
              className="w-full sm:w-auto px-6 py-3.5 bg-white text-indigo-600 hover:bg-indigo-50 rounded-2xl text-xs sm:text-sm font-black transition-all shadow-lg active:scale-95"
            >
              {isAdmin ? '내 대시보드로 이동' : '무료로 시작하기'}
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingView;
