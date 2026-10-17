import React, { useState } from 'react';
import { 
  ArrowRight, User, Sparkles, Lock, 
  FileText, BarChart3, Globe, ExternalLink,
  CheckCircle2, Compass, Bookmark, Copy,
  Check, ChevronRight, KeyRound, Network,
  History, Terminal, Laptop, Code2
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

  // 인터랙티브 프로필 프리뷰 카드 내부 탭 상태
  const [previewTab, setPreviewTab] = useState('developer');
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText('https://cravelog.me/@taeya00');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-full bg-[#F8FAFC] text-zinc-900 pb-24 md:pb-20">
      
      {/* ========================================================= */}
      {/* 1. HERO SECTION (Minimal & Clean Light Aesthetic) */}
      {/* ========================================================= */}
      <section className="relative pt-12 pb-14 md:pt-16 md:pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        
        {/* Soft Ambient Background Glow */}
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

        {/* Minimal Subtitle */}
        <p className="text-sm sm:text-base md:text-lg text-zinc-500 font-medium max-w-xl mx-auto mb-8 leading-relaxed break-keep">
          링크 하나로 완성하는 나만의 프로필과 포트폴리오. <br className="hidden sm:inline" />
          매일의 작업과 배움을 가볍고 정갈하게 기록하세요.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto mb-14">
          <button
            onClick={() => visitUserProfile('taeya00')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <User size={16} />
            <span>개발자 프로필 보기 (@taeya00)</span>
            <ArrowRight size={15} />
          </button>

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
        {/* ⭐️ RESTORED: INTERACTIVE LIVE PROFILE PREVIEW CARD (@taeya00) */}
        {/* ========================================================= */}
        <div className="max-w-4xl mx-auto text-left relative group">
          
          {/* Subtle Outer Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-200/50 via-violet-200/40 to-cyan-200/50 rounded-[2.2rem] blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          {/* Browser Container */}
          <div className="relative bg-white border border-zinc-200/90 rounded-[2rem] shadow-xl overflow-hidden transition-all">
            
            {/* Mac Browser Style Window Top Bar */}
            <div className="bg-zinc-100/80 border-b border-zinc-200/80 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
              
              {/* Traffic Light Dots */}
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>

              {/* Address Bar */}
              <div className="flex-1 max-w-md mx-auto hidden sm:flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-white border border-zinc-200/80 text-xs font-mono text-zinc-600 shadow-xs">
                <div className="flex items-center gap-2 truncate">
                  <Lock size={12} className="text-emerald-500 shrink-0" />
                  <span className="text-zinc-400">https://</span>
                  <span className="text-zinc-800 font-bold">cravelog.me/@taeya00</span>
                </div>
                <button 
                  onClick={handleCopyLink}
                  className="text-zinc-400 hover:text-zinc-700 transition-colors shrink-0 pl-2 cursor-pointer"
                  title="링크 복사"
                >
                  {copiedLink ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                </button>
              </div>

              {/* Live Status Badge */}
              <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>LIVE PREVIEW</span>
              </div>

            </div>

            {/* Profile Overview Header inside Mockup */}
            <div className="p-5 sm:p-7 bg-gradient-to-b from-zinc-50/60 to-white border-b border-zinc-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                
                <div className="flex items-start sm:items-center gap-4">
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-violet-500 to-indigo-600 p-[2px] shadow-sm">
                      <div className="w-full h-full rounded-[14px] bg-white overflow-hidden flex items-center justify-center font-black text-xl text-indigo-600">
                        {user?.profileImageUrl ? (
                          <img src={user.profileImageUrl} alt="taeya00" className="w-full h-full object-cover" />
                        ) : (
                          <span>T</span>
                        )}
                      </div>
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-lg sm:text-xl font-black text-zinc-900">태야</h3>
                      <span className="text-xs font-mono font-bold text-zinc-400">@taeya00</span>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-[10px] font-bold">
                        개발자
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-600 font-medium">
                      풀스택 개발자 • CraveLog 빌더
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Seoul, Korea • Spring Boot & React 아키텍처
                    </p>
                  </div>
                </div>

                {/* Direct Action Button to real profile */}
                <button
                  onClick={() => visitUserProfile('taeya00')}
                  className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 shrink-0 active:scale-95 cursor-pointer"
                >
                  <span>실제 프로필 방문</span>
                  <ArrowRight size={13} />
                </button>

              </div>

              {/* Persona Navigation Tabs inside Terminal */}
              <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'developer', label: '💻 기술 스택', badge: 'Tech' },
                  { id: 'career', label: '💼 주요 프로젝트', badge: 'Career' },
                  { id: 'archive', label: '📁 기록 & 컬렉션', badge: 'Archive' },
                  { id: 'privacy', label: '🔒 공개 권한 (PIN)', badge: 'Protected' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setPreviewTab(tab.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 border cursor-pointer ${
                      previewTab === tab.id
                        ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                        : 'bg-zinc-50 text-zinc-600 border-zinc-200/80 hover:text-zinc-900 hover:bg-zinc-100'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      previewTab === tab.id 
                        ? 'bg-white/20 text-zinc-200' 
                        : 'bg-zinc-200/80 text-zinc-500'
                    }`}>
                      {tab.badge}
                    </span>
                  </button>
                ))}
              </div>

            </div>

            {/* Interactive Tab Body */}
            <div className="p-5 sm:p-7 min-h-[190px] flex flex-col justify-center bg-zinc-50/40">
              
              {/* TAB 1: DEVELOPER */}
              {previewTab === 'developer' && (
                <div className="animate-in fade-in duration-200 space-y-3.5">
                  <div className="flex flex-wrap gap-2">
                    {['Java 21', 'Spring Boot 3', 'React 19', 'Tailwind CSS', 'MySQL 8', 'Redis', 'Docker'].map((tech) => (
                      <span key={tech} className="px-3 py-1.5 rounded-xl bg-white border border-zinc-200/90 text-xs font-medium text-zinc-700 shadow-2xs">
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-zinc-200/80 text-xs text-zinc-600 leading-relaxed">
                    <p className="text-indigo-600 font-bold mb-1">// 한 줄 소개</p>
                    <p>"안정적인 백엔드 구조와 매끄러운 프론트엔드 경험을 만드는 것을 지향합니다."</p>
                  </div>
                </div>
              )}

              {/* TAB 2: CAREER */}
              {previewTab === 'career' && (
                <div className="animate-in fade-in duration-200 space-y-2.5">
                  <div className="p-3.5 rounded-xl bg-white border border-zinc-200/80 flex items-center justify-between shadow-2xs">
                    <div>
                      <p className="text-xs font-bold text-zinc-900">CraveLog 플랫폼 풀스택 개발</p>
                      <p className="text-[11px] text-zinc-500">풀스택 아키텍처 및 4단계 스마트 권한 모델 설계</p>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">2026 ~ 현재</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-zinc-200/80 flex items-center justify-between shadow-2xs">
                    <div>
                      <p className="text-xs font-bold text-zinc-900">고성능 데이터 & 캐싱 인프라</p>
                      <p className="text-[11px] text-zinc-500">RESTful API 설계, JPA 최적화 및 Redis 캐시 계층</p>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-md">프로젝트</span>
                  </div>
                </div>
              )}

              {/* TAB 3: ARCHIVE */}
              {previewTab === 'archive' && (
                <div className="animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-white border border-zinc-200/80 flex items-center gap-3 shadow-2xs">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <Network size={17} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-zinc-900 truncate">기술 아카이브 트리</p>
                        <p className="text-[11px] text-zinc-500">계층형 카테고리와 태그별 분류</p>
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white border border-zinc-200/80 flex items-center gap-3 shadow-2xs">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <History size={17} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-zinc-900 truncate">성장 타임라인</p>
                        <p className="text-[11px] text-zinc-500">작업 과정과 회고를 시간순으로 기록</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: PRIVACY */}
              {previewTab === 'privacy' && (
                <div className="animate-in fade-in duration-200 p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                      <KeyRound size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-indigo-950">비밀번호(PIN) 잠금 보호 기능</p>
                      <p className="text-[11px] text-zinc-500 leading-relaxed mt-0.5">
                        비공개 기록은 비밀번호를 알고 있는 사람에게만 안전하게 공유됩니다.
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-[10px] font-mono font-bold shrink-0">
                    PROTECTED
                  </span>
                </div>
              )}

            </div>

            {/* Terminal Bottom Action Banner */}
            <div className="bg-zinc-100/70 border-t border-zinc-200/80 px-5 sm:px-7 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
              <span className="text-zinc-500 flex items-center gap-1.5 font-medium">
                <Sparkles size={13} className="text-indigo-600" />
                @taeya00님의 실제 기록과 프로젝트를 지금 바로 확인해보세요.
              </span>
              <button
                onClick={() => visitUserProfile('taeya00')}
                className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 self-start sm:self-auto transition-colors cursor-pointer"
              >
                <span>프로필 전체 보기</span>
                <ChevronRight size={14} />
              </button>
            </div>

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
