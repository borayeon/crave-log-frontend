import React, { useState } from 'react';
import { 
  Sparkles, ArrowRight, ShieldCheck, Layers, Lock, 
  ExternalLink, Globe, Rocket, Zap, CheckCircle2, 
  Code2, Laptop, Share2, History, Network, 
  Terminal, ChevronRight, KeyRound, Eye, 
  Activity, FileCode, Check, Copy
} from 'lucide-react';
import { useAppStore } from '../store/AppStore';

const LandingView = () => {
  const { 
    visitUserProfile, 
    setLoginModalOpen, 
    setViewMode, 
    isAdmin, 
    user 
  } = useAppStore();

  // 인터랙티브 프리뷰 카드 내부 탭 상태
  const [previewTab, setPreviewTab] = useState('developer');
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://cravelog.me/@taeya00');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-full bg-[#07090E] text-slate-100 overflow-x-hidden selection:bg-indigo-500 selection:text-white pb-28 md:pb-20">
      
      {/* ========================================================= */}
      {/* 1. HERO SECTION (Dark Neon & Ambient Glow) */}
      {/* ========================================================= */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Subtle Cyber Grid Background */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.15) 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />

        {/* Dynamic Glow Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/20 via-violet-600/20 to-cyan-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-10 right-1/4 w-72 h-72 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

        <div className="text-center max-w-4xl mx-auto relative z-10">
          
          {/* Eyebrow Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-indigo-500/30 text-indigo-300 text-xs font-mono mb-8 backdrop-blur-xl shadow-xl shadow-indigo-950/40 hover:border-indigo-500/50 transition-all cursor-default">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300">CraveLog 2.0</span>
            <span className="text-slate-600">•</span>
            <span className="text-indigo-400 flex items-center gap-1 font-sans font-bold">
              <Sparkles size={12} /> The Identity Platform for Builders
            </span>
          </div>

          {/* Grand Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-[-0.04em] text-white leading-[1.12] mb-6 break-keep">
            기록하고, 증명하고, <br />
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-rose-400 bg-clip-text text-transparent">
              나만의 색깔로 연결되는 곳.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg lg:text-xl text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto mb-10 break-keep">
            단순한 이력서와 파편화된 기술 블로그를 넘어, <br className="hidden sm:inline" />
            <span className="text-white font-bold">멀티 페르소나</span>와{' '}
            <span className="text-indigo-400 font-bold">4단계 스마트 권한 통제</span>로 완성하는 프라이빗 테크 아카이브.
          </p>

          {/* CTA Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            
            {/* ⭐️ PRIMARY CTA: Developer Profile Portal Shortcut */}
            <button
              onClick={() => visitUserProfile('taeya00')}
              className="w-full sm:w-auto relative group px-7 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 text-white font-black text-sm sm:text-base transition-all duration-300 shadow-[0_0_35px_rgba(99,102,241,0.35)] hover:shadow-[0_0_55px_rgba(99,102,241,0.55)] hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 border border-white/20"
            >
              <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-inner group-hover:rotate-12 transition-transform">
                <Terminal size={15} />
              </div>
              <span>개발자 계정 바로가기</span>
              <span className="px-2 py-0.5 rounded-lg bg-black/40 text-cyan-200 text-xs font-mono font-bold border border-white/10">
                @taeya00
              </span>
              <ArrowRight size={16} className="text-white/80 group-hover:translate-x-1.5 transition-transform" />
            </button>

            {/* SECONDARY CTA: Get Started / Dashboard */}
            <button
              onClick={() => {
                if (isAdmin) setViewMode('profile');
                else setLoginModalOpen(true);
              }}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 text-slate-200 font-black text-sm sm:text-base transition-all backdrop-blur-xl shadow-lg flex items-center justify-center gap-2.5 active:scale-95 hover:text-white"
            >
              <Sparkles size={16} className="text-indigo-400" />
              <span>{isAdmin ? '내 프로필 대시보드' : '무료로 시작하기'}</span>
            </button>

          </div>

          {/* Minimal 3-Pillar Feature Chips */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-slate-400">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm shadow-sm">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>One-Link 멀티 페르소나</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm shadow-sm">
              <CheckCircle2 size={13} className="text-indigo-400" />
              <span>4단계 스마트 프라이버시 통제</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm shadow-sm">
              <CheckCircle2 size={13} className="text-cyan-400" />
              <span>타임라인 & 지식 아카이브</span>
            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* INTERACTIVE LIVE PROFILE TERMINAL MOCKUP (@taeya00) */}
        {/* ========================================================= */}
        <div className="mt-16 sm:mt-20 max-w-4xl mx-auto relative group">
          
          {/* Subtle Outer Neon Halo Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/30 via-cyan-500/20 to-purple-500/30 rounded-[2.5rem] blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          {/* Terminal Container */}
          <div className="relative bg-slate-950/90 border border-slate-800/90 rounded-[2rem] shadow-2xl backdrop-blur-2xl overflow-hidden">
            
            {/* Terminal Title Bar */}
            <div className="bg-slate-900/80 border-b border-slate-800/80 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>

              {/* Mock Address Bar */}
              <div className="flex-1 max-w-md mx-auto hidden sm:flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-2 truncate">
                  <Lock size={12} className="text-emerald-400 shrink-0" />
                  <span className="text-slate-500">https://</span>
                  <span className="text-slate-200 font-bold">cravelog.me/@taeya00</span>
                </div>
                <button 
                  onClick={handleCopyLink}
                  className="text-slate-500 hover:text-slate-300 transition-colors shrink-0 pl-2"
                  title="링크 복사"
                >
                  {copiedLink ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-indigo-400">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                <span>LIVE PREVIEW</span>
              </div>
            </div>

            {/* Profile Overview Header inside Mockup */}
            <div className="p-6 sm:p-8 bg-gradient-to-b from-slate-900/40 to-transparent border-b border-slate-800/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                
                <div className="flex items-start sm:items-center gap-4 sm:gap-5">
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 via-violet-500 to-cyan-400 p-[2px] shadow-lg">
                      <div className="w-full h-full rounded-[14px] bg-slate-900 overflow-hidden flex items-center justify-center font-black text-xl text-white">
                        {user?.profileImageUrl ? (
                          <img src={user.profileImageUrl} alt="taeya00" className="w-full h-full object-cover" />
                        ) : (
                          <span>T</span>
                        )}
                      </div>
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-[9px] text-white font-black">
                      ✓
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl sm:text-2xl font-black text-white">Taeya</h3>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[11px] font-mono">
                        @taeya00
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 font-medium">
                      Fullstack Engineer & CraveLog Creator
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Seoul, Korea • Computer Science & Distributed Systems
                    </p>
                  </div>
                </div>

                {/* Direct Action Button to real profile */}
                <button
                  onClick={() => visitUserProfile('taeya00')}
                  className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md flex items-center gap-1.5 shrink-0 active:scale-95 group/btn"
                >
                  <span>실제 프로필 열람</span>
                  <ArrowRight size={13} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>

              </div>

              {/* Persona Navigation Tabs inside Terminal */}
              <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'developer', label: '💻 개발자 (Developer)', badge: 'Public' },
                  { id: 'career', label: '💼 커리어 (Career)', badge: 'Roadmap' },
                  { id: 'archive', label: '📂 컬렉션 (Archive)', badge: 'Tech Tree' },
                  { id: 'privacy', label: '🔒 보안 잠금 (PIN)', badge: 'Protected' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setPreviewTab(tab.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 border ${
                      previewTab === tab.id
                        ? 'bg-slate-800 text-white border-indigo-500/50 shadow-sm'
                        : 'bg-slate-900/50 text-slate-400 border-slate-800/80 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      previewTab === tab.id 
                        ? 'bg-indigo-500/20 text-indigo-300' 
                        : 'bg-slate-800 text-slate-500'
                    }`}>
                      {tab.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Tab Body */}
            <div className="p-6 sm:p-8 min-h-[220px] flex flex-col justify-center">
              
              {/* TAB 1: DEVELOPER */}
              {previewTab === 'developer' && (
                <div className="animate-in fade-in duration-300 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {['Java 21', 'Spring Boot 3', 'React 19', 'Tailwind CSS', 'MySQL 8', 'Redis', 'Docker', 'Google Analytics 4'].map((tech) => (
                      <span key={tech} className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono font-medium text-slate-300">
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed">
                    <p className="text-indigo-400 font-bold mb-1">// Mission Statement</p>
                    <p>"대규모 트래픽과 철저한 개인정보 보호를 만족하는 하이브리드 아키텍처를 추구합니다."</p>
                  </div>
                </div>
              )}

              {/* TAB 2: CAREER */}
              {previewTab === 'career' && (
                <div className="animate-in fade-in duration-300 space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">CraveLog Core Engineering</p>
                      <p className="text-[11px] text-slate-400">Fullstack Architecture & Security Isolation Model</p>
                    </div>
                    <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-md">2026 ~ Present</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">Distributed Web Infrastructure</p>
                      <p className="text-[11px] text-slate-400">RESTful API Design & High Performance Caching</p>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded-md">Research</span>
                  </div>
                </div>
              )}

              {/* TAB 3: ARCHIVE */}
              {previewTab === 'archive' && (
                <div className="animate-in fade-in duration-300 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                        <Network size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">기술 아카이브 트리</p>
                        <p className="text-[10px] text-slate-400">계층형 카테고리 & 태그 분류</p>
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                        <History size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">시간순 타임라인</p>
                        <p className="text-[10px] text-slate-400">멀티미디어 성장 로그 피드</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: PRIVACY */}
              {previewTab === 'privacy' && (
                <div className="animate-in fade-in duration-300 p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
                      <KeyRound size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-indigo-200">비밀번호 PIN 잠금 보호 활성화됨</p>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        인가된 팔로워 또는 4자리 패스코드 소유자에게만 백엔드 원천 복호화가 제공됩니다.
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono font-bold shrink-0">
                    PROTECTED
                  </span>
                </div>
              )}

            </div>

            {/* Terminal Bottom Action Banner */}
            <div className="bg-slate-900/60 border-t border-slate-800/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Sparkles size={13} className="text-cyan-400" />
                @taeya00님의 실제 라이브 기록 및 컬렉션을 지금 바로 탐색해보세요.
              </span>
              <button
                onClick={() => visitUserProfile('taeya00')}
                className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 self-start sm:self-auto transition-colors"
              >
                <span>프로필 전체 화면으로 이동</span>
                <ChevronRight size={14} />
              </button>
            </div>

          </div>

        </div>

      </section>

      {/* ========================================================= */}
      {/* 2. CORE ARCHITECTURE BENTO GRID */}
      {/* ========================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-28">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-400 mb-2">
            Engineered For Creators & Engineers
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            단순한 링크 트리를 넘어선, <br />
            당신의 전문성을 증명하는 아키텍처.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Bento Card 1 */}
          <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800/80 hover:border-indigo-500/50 transition-all duration-300 group hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Layers size={22} />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">
              One-Link Multiple Identities
            </span>
            <h3 className="text-lg font-bold text-white mt-1 mb-2">
              멀티 페르소나
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              이력서, 포트폴리오, 취향 아카이브를 하나의 프로필에서 탭별로 관리하고 맞춤형 토큰 링크로 분리 공유합니다.
            </p>
          </div>

          {/* Bento Card 2 */}
          <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800/80 hover:border-emerald-500/50 transition-all duration-300 group hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <ShieldCheck size={22} />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
              Zero Leakage Security
            </span>
            <h3 className="text-lg font-bold text-white mt-1 mb-2">
              4단계 접근 통제
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              전체공개(0), 팔로워공개(1), 비밀 PIN 잠금(2), 비공개(4)로 기록을 보호하며 비인가자는 백엔드에서 원천 마스킹됩니다.
            </p>
          </div>

          {/* Bento Card 3 */}
          <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800/80 hover:border-cyan-500/50 transition-all duration-300 group hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Network size={22} />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
              Living Knowledge Graph
            </span>
            <h3 className="text-lg font-bold text-white mt-1 mb-2">
              타임라인 & 컬렉션
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              유튜브, 아티클, 코드 스니펫 등 멀티미디어 기록과 카테고리 태그 트리가 결합되어 시간순 성장의 궤적을 그립니다.
            </p>
          </div>

          {/* Bento Card 4 */}
          <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800/80 hover:border-violet-500/50 transition-all duration-300 group hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Activity size={22} />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-violet-400">
              Telemetry & Admin Isolation
            </span>
            <h3 className="text-lg font-bold text-white mt-1 mb-2">
              하이브리드 분석
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              퍼블릭 웹과 분리된 독립 로컬 관리자 콘솔과 GA4 연동을 통해 순방문자수, 체류 시간, 유입 경로를 완벽히 모니터링합니다.
            </p>
          </div>

        </div>

      </section>

      {/* ========================================================= */}
      {/* 3. BOTTOM CALL-TO-ACTION PORTAL */}
      {/* ========================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="relative rounded-[2.5rem] bg-gradient-to-r from-indigo-900/60 via-slate-900 to-slate-900 border border-indigo-500/40 p-8 sm:p-14 text-center text-white shadow-2xl overflow-hidden">
          
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-4">
            모든 갈망(Crave)과 성장(Log)이 시작되는 곳.
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-xl mx-auto mb-9 leading-relaxed">
            지금 CraveLog에서 당신만의 차별화된 멀티 페르소나 프로필을 개설하고, 개발자 계정의 라이브 아카이브를 직접 경험해보세요.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={() => visitUserProfile('taeya00')}
              className="w-full sm:w-auto px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-black transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-95"
            >
              <span>개발자 프로필 (@taeya00) 열람</span>
              <ArrowRight size={15} />
            </button>
            <button
              onClick={() => {
                if (isAdmin) setViewMode('profile');
                else setLoginModalOpen(true);
              }}
              className="w-full sm:w-auto px-7 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs sm:text-sm font-black transition-all active:scale-95 hover:text-white"
            >
              {isAdmin ? '내 프로필 대시보드' : '무료로 시작하기'}
            </button>
          </div>

        </div>
      </section>

    </div>
  );
};

export default LandingView;
