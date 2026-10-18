import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, User, Sparkles, Lock, 
  FileText, BarChart3, ChevronRight 
} from 'lucide-react';
import { useAppStore } from '../store/AppStore';

const LandingView = () => {
  const { 
    visitUserProfile, 
    setLoginModalOpen, 
    setViewMode, 
    isAdmin,
    apiFetch,
    t,
    currentLang 
  } = useAppStore();

  const [creatorProfile, setCreatorProfile] = useState(null);

  // 태야(taeya00) 개발자 프로필 실시간 조회
  useEffect(() => {
    let isMounted = true;
    const fetchCreator = async () => {
      try {
        const res = await apiFetch('/users/taeya00/profile');
        if (res?.ok) {
          const data = await res.json();
          if (isMounted && data) {
            setCreatorProfile(data);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch creator profile:', err);
      }
    };
    fetchCreator();
    return () => { isMounted = false; };
  }, [apiFetch]);

  const profileImg = creatorProfile?.profileImageUrl;

  return (
    <div className="min-h-full bg-[#F8FAFC] text-zinc-900 pb-24 md:pb-20">
      
      {/* ========================================================= */}
      {/* 1. HERO SECTION (Simple & Clear Typography) */}
      {/* ========================================================= */}
      <section className="relative pt-12 pb-8 md:pt-16 md:pb-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        
        {/* Soft Background Radial Gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 bg-gradient-to-b from-indigo-100/50 via-violet-50/30 to-transparent blur-3xl pointer-events-none -z-10" />

        {/* Small Status Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-xs font-bold mb-5">
          <Sparkles size={13} className="text-indigo-600" />
          <span>{t('landing.badge', '나를 표현하는 가장 쉬운 방법')}</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-zinc-950 tracking-tight leading-[1.18] mb-4 break-keep">
          {t('landing.title_1', '기록과 프로필을 하나로,')} <br className="hidden sm:inline" />
          <span className="text-indigo-600">CraveLog</span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base md:text-lg text-zinc-500 font-medium max-w-xl mx-auto leading-relaxed break-keep">
          {t('landing.desc', '링크 하나로 완성하는 나만의 프로필과 포트폴리오. 매일의 작업과 배움을 가볍고 정갈하게 기록하세요.')}
        </p>

      </section>

      {/* ========================================================= */}
      {/* 2. ⭐️ FEATURED DEVELOPER SHOWCASE CARD (@taeya00) */}
      {/* ========================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto mb-16">
        <div className="bg-gradient-to-br from-[#1C1645] via-[#101426] to-[#0A0D18] rounded-[2.5rem] p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden border border-indigo-500/30 group">
          
          {/* Ambient Lighting inside card */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            
            {/* Left: Creator Profile Overview */}
            <div className="flex items-start sm:items-center gap-5">
              <div className="relative shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-indigo-400 via-rose-400 to-amber-300 p-[3px] shadow-xl">
                  <div className="w-full h-full rounded-[22px] bg-zinc-900 overflow-hidden flex items-center justify-center font-black text-2xl text-white">
                    {profileImg ? (
                      <img src={profileImg} alt="taeya00" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-indigo-900/60 flex items-center justify-center font-black text-2xl text-white">
                        T
                      </div>
                    )}
                  </div>
                </div>
                <span 
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-zinc-950 flex items-center justify-center text-white" 
                  title="Creator Online"
                >
                  <Sparkles size={11} className="text-white fill-white" />
                </span>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 flex items-center gap-1 shadow-xs">
                    <Sparkles size={11} /> CREATOR & HOST
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">@taeya00</span>
                </div>
                
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                  Taeya <span className="text-sm sm:text-base text-zinc-400 font-normal">/ {currentLang === 'zh' ? '开发者精选主页' : currentLang === 'en' ? 'Featured Developer' : '개발자 대표 프로필'}</span>
                </h3>
                
                <p className="text-xs sm:text-sm text-zinc-300 font-medium mt-1.5 max-w-md leading-relaxed break-keep">
                  {currentLang === 'zh' 
                    ? '“连接世间所有渴望（Crave）与成长足迹（Log）的平台。专注研究 Spring Boot 与现代 Web 架构。”' 
                    : currentLang === 'en' 
                    ? '"Connecting all cravings and growth logs in the world. Researching Spring Boot and modern web architecture."' 
                    : '"세상의 모든 갈망(Crave)과 성장의 기록(Log)을 잇는 플랫폼을 만듭니다. 스프링 부트와 모던 웹 아키텍처를 연구합니다."'}
                </p>
              </div>
            </div>

            {/* Right: Quick Action Hub */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 w-full md:w-auto">
              
              <button
                onClick={() => visitUserProfile('taeya00')}
                className="w-full px-5 py-3 rounded-2xl bg-white text-zinc-950 font-black text-xs sm:text-sm hover:bg-zinc-100 transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 group/btn cursor-pointer"
              >
                <span>{t('landing.visit_profile', '대표 프로필 방문하기')}</span>
                <ArrowRight size={15} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={async () => {
                    await visitUserProfile('taeya00');
                    setViewMode('archive');
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 text-xs font-bold transition-all text-center cursor-pointer active:scale-95"
                >
                  {t('nav.archive', '컬렉션')}
                </button>
                <button
                  onClick={async () => {
                    await visitUserProfile('taeya00');
                    setViewMode('timeline');
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 text-xs font-bold transition-all text-center cursor-pointer active:scale-95"
                >
                  {t('nav.timeline', '타임라인')}
                </button>
              </div>

            </div>

          </div>

          {/* Quick Highlights underneath */}
          <div className="mt-6 pt-6 border-t border-zinc-800/80 flex flex-wrap items-center gap-2 text-xs font-bold text-zinc-400">
            <span className="text-indigo-400 text-[11px] font-mono uppercase tracking-wider">HIGHLIGHTS:</span>
            <span className="px-2.5 py-1 rounded-lg bg-zinc-800/60 text-zinc-300 font-mono text-[11px]">#Java_Spring_Boot</span>
            <span className="px-2.5 py-1 rounded-lg bg-zinc-800/60 text-zinc-300 font-mono text-[11px]">#React_Vite</span>
            <span className="px-2.5 py-1 rounded-lg bg-zinc-800/60 text-zinc-300 font-mono text-[11px]">#MySQL_Redis</span>
            <span className="px-2.5 py-1 rounded-lg bg-zinc-800/60 text-zinc-300 font-mono text-[11px]">#{t('nav.access_short', '접근보안')}</span>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. SIMPLE CORE FEATURES (No buzzwords) */}
      {/* ========================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto mb-16">
        
        <div className="text-center max-w-md mx-auto mb-10">
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight mb-2">
            {currentLang === 'zh' ? '专注核心，化繁为简' : currentLang === 'en' ? 'Essential Features Crafted for You' : '꼭 필요한 기능만 담았습니다'}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 font-medium">
            {currentLang === 'zh' ? '无需繁琐设置，即刻开启专属于您的个人空间。' : currentLang === 'en' ? 'Start your personal page immediately without complex setup.' : '복잡한 설정 없이 바로 나만의 페이지를 시작할 수 있습니다.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          
          {/* Card 1: 프로필 */}
          <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <User size={20} />
            </div>
            <h3 className="text-base font-bold text-zinc-900 mb-1.5">
              {currentLang === 'zh' ? '专属个人主页' : currentLang === 'en' ? 'Personal Profile' : '나만의 프로필'}
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              {currentLang === 'zh' ? '将简历、社交账号与博客链接聚合在单个页面优雅分享。' : currentLang === 'en' ? 'Organize resume, socials, and blog links neatly in one page.' : '이력서, SNS, 블로그 링크를 한 페이지에 깔끔하게 정리해 공유하세요.'}
            </p>
          </div>

          {/* Card 2: 성장 기록 */}
          <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-4">
              <FileText size={20} />
            </div>
            <h3 className="text-base font-bold text-zinc-900 mb-1.5">
              {currentLang === 'zh' ? '成长记录与随笔' : currentLang === 'en' ? 'Growth Journey' : '성장 기록'}
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              {currentLang === 'zh' ? '以时间线的方式随时记录所学知识、正在进行的项目与灵感。' : currentLang === 'en' ? 'Log learnings, active projects, and daily thoughts in a timeline.' : '공부한 내용, 진행 중인 프로젝트, 생각들을 타임라인으로 남기세요.'}
            </p>
          </div>

          {/* Card 3: 공개 범위 설정 */}
          <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Lock size={20} />
            </div>
            <h3 className="text-base font-bold text-zinc-900 mb-1.5">
              {currentLang === 'zh' ? '权限安全控制' : currentLang === 'en' ? 'Access & Security' : '공개 범위 설정'}
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              {currentLang === 'zh' ? '从全公开、关注者限定，到PIN密码锁与完全私密随心设置。' : currentLang === 'en' ? 'Safely protected from public to PIN locks and private notes.' : '전체 공개부터 비밀번호 잠금, 비공개 메모까지 안전하게 보호됩니다.'}
            </p>
          </div>

          {/* Card 4: 방문자 통계 */}
          <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <BarChart3 size={20} />
            </div>
            <h3 className="text-base font-bold text-zinc-900 mb-1.5">
              {currentLang === 'zh' ? '访客数据统计' : currentLang === 'en' ? 'Visitor Analytics' : '방문자 통계'}
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              {currentLang === 'zh' ? '一目了然地查看主页和记录的访问流量与访客趋势。' : currentLang === 'en' ? 'Track visitors and views on your profile and logs at a glance.' : '내 프로필과 기록을 얼마나 많은 사람이 방문했는지 한눈에 확인하세요.'}
            </p>
          </div>

        </div>

      </section>

      {/* ========================================================= */}
      {/* 4. BOTTOM SIMPLE BANNER */}
      {/* ========================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-zinc-200/80 shadow-sm text-center relative overflow-hidden">
          
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight mb-2">
            {t('landing.cta_title', '지금 나만의 CraveLog를 시작해보세요')}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 font-medium max-w-md mx-auto mb-6">
            {currentLang === 'zh' ? '只需几分钟，即可用一个链接完成专属个性化空间的构建。' : currentLang === 'en' ? 'Complete your unique space in minutes with just a single link.' : '회원가입 후 몇 분 만에 링크 하나로 나만의 공간을 완성할 수 있습니다.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => visitUserProfile('taeya00')}
              className="w-full sm:w-auto px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span>{t('landing.visit_profile', '대표 프로필 방문하기')}</span>
              <ArrowRight size={14} />
            </button>
            <button
              onClick={() => {
                if (isAdmin) setViewMode('profile');
                else setLoginModalOpen(true);
              }}
              className="w-full sm:w-auto px-6 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95"
            >
              {isAdmin ? t('landing.cta_btn_my', '내 프로필로 이동') : t('landing.cta_btn_start', '무료로 시작하기')}
            </button>
          </div>

        </div>
      </section>

    </div>
  );
};

export default LandingView;
