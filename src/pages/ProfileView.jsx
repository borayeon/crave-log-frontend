import React, { useState, useEffect, useMemo } from 'react';
import { 
  Code, Briefcase, HeartHandshake, Link, Edit2, 
  Rocket, User, Sparkles, MapPin, Target, 
  ArrowRight, Heart, MessageSquare, Lock, 
  ExternalLink, Terminal, Quote, Palette, Compass, Share2, ChevronRight, GraduationCap
} from 'lucide-react';
import { useAppStore } from '../store/AppStore';

const ProfileView = () => {
  const { setViewMode, user, showToast, isAdmin, setLoginModalOpen, isGuestMode } = useAppStore();
  const [activeTab, setActiveTab] = useState('developer'); 

  const isGuest = !isAdmin || isGuestMode;

  const handleShare = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?u=${user?.handle || ''}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast("프로필 링크가 클립보드에 복사되었습니다! 🔗");
    }).catch(err => {
      showToast("링크 복사에 실패했습니다.");
    });
  };

  const safeUser = useMemo(() => {
    if (!user) return {};
    const parsedUser = JSON.parse(JSON.stringify(user));
    const jsonFields = ['developer', 'career', 'idol', 'hobby', 'vision', 'quotes', 'qna', 'tags', 'goals', 'links'];
    
    jsonFields.forEach(field => {
      if (typeof parsedUser[field] === 'string') {
        try { parsedUser[field] = JSON.parse(parsedUser[field]); } 
        catch (e) { parsedUser[field] = null; }
      }
    });

    if (!parsedUser.qna || parsedUser.qna.length === 0) {
        if (parsedUser.idol?.qna?.length > 0) {
            parsedUser.qna = parsedUser.idol.qna;
        }
    }
    return parsedUser;
  }, [user]);

  const isProfileEmpty = (!safeUser.name || safeUser.name === "손님") && (safeUser.tags || []).length === 0;

  const allTabsMap = {
    developer: { id: 'developer', icon: <Code size={28} strokeWidth={1.5}/>, label: 'Developer', color: 'bg-indigo-50 text-indigo-500' },
    career: { id: 'career', icon: <Briefcase size={28} strokeWidth={1.5}/>, label: 'Career', color: 'bg-blue-50 text-blue-500' },
    idol: { id: 'idol', icon: <HeartHandshake size={28} strokeWidth={1.5}/>, label: 'Idol', color: 'bg-rose-50 text-rose-500' },
    qna: { id: 'qna', icon: <MessageSquare size={28} strokeWidth={1.5}/>, label: 'Q&A', color: 'bg-violet-50 text-violet-500' },
    hobby: { id: 'hobby', icon: <Palette size={28} strokeWidth={1.5}/>, label: 'Hobby', color: 'bg-amber-50 text-amber-500' },
    vision: { id: 'vision', icon: <Compass size={28} strokeWidth={1.5}/>, label: 'Vision', color: 'bg-teal-50 text-teal-500' },
    quotes: { id: 'quotes', icon: <Quote size={28} strokeWidth={1.5}/>, label: 'Quotes', color: 'bg-slate-100 text-slate-500' }
  };

  const privacyObj = useMemo(() => {
      let p = { developer: true, career: true, idol: true, qna: true, hobby: true, vision: true, quotes: true };
      if (safeUser.privacy) {
          if (typeof safeUser.privacy === 'string') {
              try { p = { ...p, ...JSON.parse(safeUser.privacy) }; } catch(e) {}
          } else if (typeof safeUser.privacy === 'object') {
              p = { ...p, ...safeUser.privacy };
          }
      }
      return p;
  }, [safeUser.privacy]);

  const isTabPrivate = (tabId) => {
      const val = privacyObj[tabId];
      return String(val).toLowerCase() === 'false' || String(val) === '0';
  };

  const availableTabs = ['developer', 'career', 'idol', 'qna', 'hobby', 'vision', 'quotes']
    .map(id => allTabsMap[id])
    .filter(tab => {
        if (!tab) return false;
        if (isGuest && isTabPrivate(tab.id)) return false; 
        return true; 
    });

  useEffect(() => {
    if (isGuest && activeTab && isTabPrivate(activeTab)) {
      const firstAvailable = availableTabs[0];
      setActiveTab(firstAvailable ? firstAvailable.id : null);
    } else if (!activeTab && availableTabs.length > 0) {
      setActiveTab(availableTabs[0].id);
    }
  }, [isGuest, activeTab, privacyObj, availableTabs]);

  const renderVisionPreview = () => {
    const defaultVision = { core: "", subs: Array(8).fill(""), details: Array.from({length: 8}, () => Array(8).fill("")) };
    const v = {
        core: safeUser.vision?.core || defaultVision.core,
        subs: safeUser.vision?.subs?.length === 8 ? safeUser.vision.subs : defaultVision.subs,
        details: safeUser.vision?.details?.length === 8 ? safeUser.vision.details : defaultVision.details
    };
    const blocks = [];
    for (let i = 0; i < 9; i++) {
        if (i === 4) {
            blocks.push([v.subs[0], v.subs[1], v.subs[2], v.subs[3], v.core, v.subs[4], v.subs[5], v.subs[6], v.subs[7]]);
        } else {
            const subIdx = i < 4 ? i : i - 1;
            const d = v.details[subIdx] || Array(8).fill("");
            blocks.push([d[0], d[1], d[2], d[3], v.subs[subIdx], d[4], d[5], d[6], d[7]]);
        }
    }
    return (
        <div className="bg-zinc-900 p-6 md:p-12 rounded-[2rem] shadow-sm text-white relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-teal-500/10 md:bg-teal-500/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
            
            <div className="text-center mb-8 md:mb-12 relative z-10">
                <h3 className="text-2xl md:text-4xl font-black mb-3 flex items-center justify-center gap-3"><Compass className="text-teal-400"/> Mandalart</h3>
                <p className="text-teal-200/80 text-[11px] md:text-sm font-medium uppercase tracking-widest">나의 비전을 이루기 위한 81가지 세부 계획</p>
            </div>
            
            <div className="grid grid-cols-3 gap-1 md:gap-2 p-1.5 md:p-2 bg-white/10 backdrop-blur-md rounded-2xl w-full max-w-2xl mx-auto aspect-square relative z-10 shadow-2xl">
                {blocks.map((block, bIdx) => (
                    <div key={bIdx} className="grid grid-cols-3 gap-px bg-white/20 border border-white/10 rounded-xl overflow-hidden shadow-inner">
                        {block.map((cell, cIdx) => {
                            const isCore = bIdx === 4 && cIdx === 4;
                            const isMainSub = bIdx === 4 && cIdx !== 4;
                            const isCenterOfOuter = bIdx !== 4 && cIdx === 4;
                            let bg = "bg-white/90";
                            let text = "text-slate-800";
                            let font = "font-bold text-[7px] sm:text-[9px] md:text-xs";
                            if (isCore) { bg = "bg-teal-500 shadow-lg z-10"; text = "text-white"; font = "font-black text-[9px] sm:text-[11px] md:text-sm"; } 
                            else if (isMainSub || isCenterOfOuter) { bg = "bg-teal-50"; text = "text-teal-900"; font = "font-black text-[8px] sm:text-[10px] md:text-sm"; }
                            return (
                                <div key={cIdx} className={`${bg} ${text} ${font} flex items-center justify-center text-center p-0.5 md:p-1 overflow-hidden break-words leading-tight transition-colors hover:brightness-95 cursor-default`}>
                                    {cell || '-'}
                                </div>
                            )
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
  };

  return (
    // ⭐️ PC: max-w-5xl 확장, 모바일: w-full 유지
    <div className="max-w-5xl mx-auto w-full min-h-screen bg-[#F0F2F5] pb-24 md:pb-32 relative animate-in fade-in duration-300 md:px-6 md:pt-6">
      
      {/* 1. 상단 커버 영역 (헤더) */}
      <div className="bg-gradient-to-br from-[#12B8A6] to-[#0F766E] h-56 md:h-80 rounded-b-[2.5rem] md:rounded-[3rem] relative px-6 md:px-12 pt-10 md:pt-12 flex flex-col justify-between overflow-hidden shadow-md">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-20 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        
        <div className="flex justify-end gap-2 md:gap-3 relative z-10">
           {!isProfileEmpty && (
             <button onClick={handleShare} className="h-9 md:h-10 px-3 md:px-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full flex items-center justify-center gap-2 transition font-bold text-xs md:text-sm shadow-sm">
                 <Share2 size={16} /> <span className="hidden md:inline">공유</span>
             </button>
           )}
          {isAdmin && !isGuestMode ? (
            <button onClick={() => setViewMode('edit_profile')} className="h-9 md:h-10 px-3 md:px-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full flex items-center justify-center gap-2 transition font-bold text-xs md:text-sm shadow-sm">
              <Edit2 size={16} /> <span className="hidden md:inline">프로필 설정</span>
            </button>
          ) : !isAdmin ? (
             <button onClick={() => setLoginModalOpen(true)} className="h-9 md:h-10 px-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full text-xs md:text-sm font-bold transition flex items-center gap-1.5 shadow-sm">
              <Rocket size={14} /> 내 프로필 만들기
            </button>
          ) : null}
        </div>

        {!isProfileEmpty && safeUser.status && (
          <div className="relative z-10 mb-16 md:mb-20 self-start md:self-end md:mr-10 inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md border border-white/30 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-2xl shadow-sm">
              <Sparkles size={12} className="text-yellow-200" />
              <span className="text-[11px] md:text-xs font-bold tracking-wider">{safeUser.status}</span>
          </div>
        )}
      </div>

      {/* 2. 메인 프로필 명함 (Business Card) */}
      {/* ⭐️ PC: 가로 배치로 확장, 모바일: 기존 세로 배치 */}
      <div className="mx-5 md:mx-12 -mt-16 md:-mt-24 bg-white rounded-[2rem] p-6 md:p-10 shadow-lg relative z-20">
        {isProfileEmpty && !isAdmin ? (
          <div className="flex flex-col items-center justify-center py-10 md:py-16 text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-zinc-50 text-zinc-300 rounded-full flex items-center justify-center mb-4 md:mb-6 shadow-inner"><User size={32}/></div>
            <h3 className="text-lg md:text-2xl font-black text-zinc-900 mb-2">설정된 프로필이 없습니다</h3>
            <p className="text-xs md:text-sm font-medium text-zinc-500 mb-4">가입하고 나만의 명함을 만들어보세요.</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row md:items-stretch gap-6 md:gap-10">
            {/* 좌측: 이름 및 핵심 요약 (모바일에서는 상단 배치) */}
            <div className="flex-1 flex flex-col min-w-0 md:border-r md:border-zinc-100 md:pr-10">
              <div className="flex justify-between items-center mb-5 md:mb-8 border-b md:border-none border-zinc-100 pb-3 md:pb-0">
                <span className="text-[10px] md:text-xs font-black text-zinc-400 uppercase tracking-widest">Business Card</span>
              </div>

              <div className="flex flex-row md:flex-col lg:flex-row gap-5 md:gap-6 lg:gap-8 items-center md:items-start lg:items-center mb-5 md:mb-0">
                <div className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 shrink-0 bg-zinc-100 rounded-3xl overflow-hidden border border-zinc-200 shadow-inner">
                  {safeUser.profileImageUrl ? (
                      <img src={safeUser.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl lg:text-6xl font-black text-zinc-300">
                        {safeUser.name ? safeUser.name.charAt(0) : '?'}
                      </div>
                  )}
                </div>
                
                <div className="flex-1 flex flex-col justify-center min-w-0 md:mt-2 lg:mt-0">
                  <h2 className="text-2xl md:text-4xl font-black text-zinc-900 mb-1 md:mb-2 truncate">{safeUser.name || '이름 없음'}</h2>
                  <p className="text-[11px] md:text-sm font-bold text-teal-600 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-lg inline-block w-max mb-3 md:mb-5 shadow-sm">@{safeUser.handle || 'handle'}</p>
                  
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex items-center gap-2.5 text-xs md:text-sm font-bold text-zinc-600 truncate">
                      <Briefcase size={14} className="text-zinc-400 shrink-0"/> {safeUser.role || '소속/직무 미입력'}
                    </div>
                    <div className="flex items-center gap-2.5 text-xs md:text-sm font-bold text-zinc-600 truncate">
                      <GraduationCap size={14} className="text-zinc-400 shrink-0"/> {safeUser.major || '전공 미입력'}
                    </div>
                    <div className="flex items-center gap-2.5 text-xs md:text-sm font-bold text-zinc-600 truncate">
                      <MapPin size={14} className="text-zinc-400 shrink-0"/> {safeUser.location || '지역 미입력'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 우측: 바이오 및 태그 (PC에서는 우측, 모바일에서는 하단) */}
            <div className="flex-1 flex flex-col justify-center md:pl-2">
              <div className="bg-zinc-50 rounded-[1.5rem] p-5 md:p-6 border border-zinc-100 shadow-inner h-full flex flex-col">
                <Quote size={20} className="text-zinc-300 mb-2 md:mb-4"/>
                <p className="text-sm md:text-base text-zinc-700 font-bold leading-relaxed mb-4 md:mb-6 flex-1">
                  "{safeUser.bio || '나를 표현하는 한 줄 소개가 들어갑니다.'}"
                </p>
                <div className="flex flex-wrap gap-2">
                    {(safeUser.tags || []).map(tag => (
                      <span key={tag} className="px-3 py-1.5 bg-white border border-zinc-200 text-zinc-600 text-[10px] md:text-xs font-black rounded-xl shadow-sm hover:border-zinc-300 transition-colors cursor-default">#{tag}</span>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {!isProfileEmpty && (
        <>
          {/* 3. 데이터 탐색 (AI 추천 스타일 버튼 메뉴) */}
          <div className="mt-8 md:mt-12 px-5 md:px-12">
            <div className="flex items-center justify-between mb-1 md:mb-2">
              <h3 className="text-base md:text-xl font-black text-zinc-900">데이터 탐색</h3>
              <ChevronRight size={20} className="text-zinc-400 md:hidden"/>
            </div>
            <p className="text-[11px] md:text-sm text-zinc-500 font-medium mb-4 md:mb-6">CraveLog가 수집한 상세 프로필 데이터를 확인해보세요.</p>
            
            {/* ⭐️ PC: 자동 줄바꿈(wrap) 및 중앙 정렬, 모바일: 가로 스크롤 */}
            <div className="flex md:flex-wrap md:justify-start gap-3 md:gap-5 overflow-x-auto scrollbar-hide pb-4 -mx-5 px-5 md:mx-0 md:px-0">
              {availableTabs.map(tab => {
                  const isActive = activeTab === tab.id;
                  const isPrivate = isTabPrivate(tab.id);
                  
                  return (
                    <button 
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex flex-col items-center gap-2 md:gap-3 shrink-0 transition-all duration-300 ${isActive ? 'scale-105 md:scale-110 -translate-y-1' : 'hover:-translate-y-1 opacity-70 hover:opacity-100'}`}
                    >
                      <div className={`w-20 h-20 md:w-24 md:h-24 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center shadow-sm relative border transition-colors ${isActive ? 'border-zinc-300 shadow-md' : 'border-transparent'} ${tab.color}`}>
                        {React.cloneElement(tab.icon, { className: 'w-7 h-7 md:w-8 md:h-8' })}
                        {isPrivate && <div className="absolute top-2 md:top-3 right-2 md:right-3 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm"><Lock size={10} className="text-zinc-500"/></div>}
                      </div>
                      <span className={`text-[11px] md:text-xs font-black ${isActive ? 'text-zinc-900' : 'text-zinc-500'}`}>{tab.label}</span>
                    </button>
                  );
              })}
            </div>
          </div>

          {/* 4. 활성화된 탭 컨텐츠 영역 (흰색 카드 스타일 + 반응형 그리드) */}
          {availableTabs.length === 0 && isGuest ? (
              <div className="mx-5 md:mx-12 mt-6 p-10 md:p-20 flex flex-col items-center justify-center bg-white rounded-[2rem] shadow-sm border border-zinc-100">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-zinc-50 flex items-center justify-center rounded-full mb-4 shadow-inner"><Lock size={28} className="text-zinc-400" /></div>
                  <h3 className="text-base md:text-xl font-black text-zinc-800">비공개 프로필</h3>
                  <p className="text-xs md:text-sm font-medium text-zinc-500 mt-2">세부 정보가 비공개 설정되어 있습니다.</p>
              </div>
          ) : (
              <div className="mx-5 md:mx-12 mt-4 md:mt-8 animate-in slide-in-from-bottom-4 duration-500">
                  
                  {/* Developer Tab */}
                  {activeTab === 'developer' && availableTabs.some(t => t.id === 'developer') && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                        
                        <div className="md:col-span-1 flex flex-col gap-4 md:gap-6">
                          <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-zinc-100">
                            <h4 className="text-xs md:text-sm font-black text-zinc-400 uppercase tracking-widest mb-3 md:mb-5 flex items-center gap-2"><User size={16}/> About Me</h4>
                            <p className="text-sm md:text-base text-zinc-700 leading-relaxed font-medium whitespace-pre-line">
                              {safeUser.developer?.about || '입력된 자기소개가 없습니다.'}
                            </p>
                          </div>
                          
                          <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-zinc-100">
                            <h4 className="text-xs md:text-sm font-black text-zinc-400 uppercase tracking-widest mb-4 md:mb-6 flex items-center gap-2"><Code size={16}/> Tech Stack</h4>
                            <div className="space-y-5">
                                {['backend', 'db', 'frontend', 'tools'].map(type => {
                                    const stackString = safeUser.developer?.techStack?.[type];
                                    if (!stackString) return null;
                                    return (
                                        <div key={type}>
                                            <span className="block text-[10px] md:text-xs font-black text-zinc-400 uppercase mb-2">{type}</span>
                                            <div className="flex flex-wrap gap-2">
                                                {stackString.split(',').map((tech, i) => (
                                                    <span key={i} className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-xl text-xs font-bold hover:bg-zinc-100 transition-colors cursor-default">{tech.trim()}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-zinc-100 h-full">
                             <h4 className="text-xs md:text-sm font-black text-zinc-400 uppercase tracking-widest mb-5 md:mb-6 flex items-center gap-2"><Rocket size={16}/> POST & Portfolio</h4>
                             <div className="grid grid-cols-1 gap-4 md:gap-6">
                                {(safeUser.developer?.projects || []).map((proj, idx) => (
                                    <div key={idx} className="p-5 md:p-6 bg-zinc-50 rounded-[1.5rem] border border-zinc-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                                        <div className="flex justify-between items-start mb-3">
                                            <h5 className="text-lg md:text-xl font-black text-zinc-900">{proj.name}</h5>
                                            <div className="flex gap-2 text-zinc-400 bg-white px-2 py-1 rounded-lg border border-zinc-200 shadow-sm">
                                                {proj.githubUrl && <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 p-1 transition"><Terminal size={16} /></a>}
                                                {proj.liveUrl && <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 p-1 transition"><ExternalLink size={16} /></a>}
                                            </div>
                                        </div>
                                        <p className="text-xs md:text-sm text-zinc-500 font-medium leading-relaxed">{proj.desc}</p>
                                    </div>
                                ))}
                                {(!safeUser.developer?.projects || safeUser.developer.projects.length === 0) && <p className="text-sm text-zinc-400 font-medium text-center py-10 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">등록된 프로젝트가 없습니다.</p>}
                             </div>
                          </div>
                        </div>
                      </div>
                  )}

                  {/* Career Tab */}
                  {activeTab === 'career' && availableTabs.some(t => t.id === 'career') && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                        <div className="md:col-span-1 flex flex-col gap-4 md:gap-6">
                          <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-zinc-100">
                            <h4 className="text-xs md:text-sm font-black text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Target size={16}/> Target Job</h4>
                            <p className="text-xl md:text-2xl font-black text-blue-600">{safeUser.career?.targetJob || '미입력'}</p>
                          </div>
                          <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-zinc-100 flex-1">
                             <h4 className="text-xs md:text-sm font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2"><MapPin size={16}/> Career Goals</h4>
                             <div className="flex flex-col gap-4">
                               <div className="p-4 md:p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                                  <h5 className="text-[10px] md:text-xs font-black text-blue-500 uppercase tracking-widest mb-2">단기 목표</h5>
                                  <p className="text-xs md:text-sm font-bold text-zinc-800 leading-relaxed">{safeUser.career?.careerGoals?.short || '-'}</p>
                               </div>
                               <div className="p-4 md:p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                                  <h5 className="text-[10px] md:text-xs font-black text-blue-500 uppercase tracking-widest mb-2">중장기 목표</h5>
                                  <p className="text-xs md:text-sm font-bold text-zinc-800 leading-relaxed">{safeUser.career?.careerGoals?.long || '-'}</p>
                               </div>
                             </div>
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-zinc-100 h-full">
                             <h4 className="text-xs md:text-sm font-black text-zinc-400 uppercase tracking-widest mb-5 md:mb-6 flex items-center gap-2"><Briefcase size={16}/> 이력 및 강점</h4>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                                {(safeUser.career?.strengths || []).map((str, idx) => (
                                    <div key={idx} className="p-5 md:p-6 bg-zinc-50 rounded-[1.5rem] border border-zinc-100/80 hover:bg-white hover:shadow-md transition-all duration-300">
                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-sm md:text-base mb-4 shadow-sm">{idx+1}</div>
                                        <h5 className="text-base md:text-lg font-black text-zinc-900 mb-2">{str.title}</h5>
                                        <p className="text-xs md:text-sm text-zinc-500 font-medium leading-relaxed">{str.desc}</p>
                                    </div>
                                ))}
                                {(!safeUser.career?.strengths || safeUser.career.strengths.length === 0) && (
                                    <div className="sm:col-span-2 text-center py-10 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
                                        <p className="text-sm text-zinc-400 font-medium">등록된 이력 및 강점이 없습니다.</p>
                                    </div>
                                )}
                             </div>
                          </div>
                        </div>
                      </div>
                  )}

                  {/* Idol Tab */}
                  {activeTab === 'idol' && availableTabs.some(t => t.id === 'idol') && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                        <div className="md:col-span-1 bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-zinc-100 h-full">
                          <h4 className="text-xs md:text-sm font-black text-zinc-400 uppercase tracking-widest mb-5 md:mb-6 flex items-center gap-2"><Sparkles size={16}/> Profile Info</h4>
                          <div className="space-y-4 md:space-y-5">
                              <div className="flex justify-between items-center bg-rose-50/30 p-3 md:p-4 rounded-xl border border-rose-100/50"><span className="text-xs font-bold text-rose-400">Nickname</span><span className="text-sm md:text-base font-black text-zinc-800">{safeUser.idol?.nickname || '-'}</span></div>
                              <div className="flex justify-between items-center bg-rose-50/30 p-3 md:p-4 rounded-xl border border-rose-100/50"><span className="text-xs font-bold text-rose-400">Birthday</span><span className="text-sm md:text-base font-black text-zinc-800">{safeUser.idol?.birthday || '-'}</span></div>
                              <div className="flex justify-between items-center bg-rose-50/30 p-3 md:p-4 rounded-xl border border-rose-100/50"><span className="text-xs font-bold text-rose-400">Age</span><span className="text-sm md:text-base font-black text-zinc-800">{safeUser.idol?.age || '-'}</span></div>
                              <div className="flex justify-between items-center bg-rose-50/30 p-3 md:p-4 rounded-xl border border-rose-100/50"><span className="text-xs font-bold text-rose-400">Specialty</span><span className="text-sm md:text-base font-black text-zinc-800">{safeUser.idol?.specialty || '-'}</span></div>
                          </div>
                        </div>

                        <div className="md:col-span-2 bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-zinc-100 h-full">
                          <h4 className="text-xs md:text-sm font-black text-zinc-400 uppercase tracking-widest mb-5 md:mb-6 flex items-center gap-2"><Heart size={16}/> Favorites</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                              <div className="p-5 bg-zinc-50 rounded-[1.5rem] border border-zinc-100">
                                <span className="block text-[10px] md:text-xs font-black text-zinc-400 uppercase mb-3">Colors</span>
                                <div className="flex flex-wrap gap-2">{(safeUser.idol?.favorites?.colors || []).map(c=><span key={c} className="px-3 py-1.5 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-700 shadow-sm">{c}</span>)}</div>
                              </div>
                              <div className="p-5 bg-orange-50/50 rounded-[1.5rem] border border-orange-100">
                                <span className="block text-[10px] md:text-xs font-black text-orange-400 uppercase mb-3">Foods</span>
                                <div className="flex flex-wrap gap-2">{(safeUser.idol?.favorites?.foods || []).map(c=><span key={c} className="px-3 py-1.5 bg-white border border-orange-200 rounded-xl text-xs font-bold text-orange-700 shadow-sm">{c}</span>)}</div>
                              </div>
                              <div className="p-5 bg-indigo-50/50 rounded-[1.5rem] border border-indigo-100">
                                <span className="block text-[10px] md:text-xs font-black text-indigo-400 uppercase mb-3">Games</span>
                                <div className="flex flex-wrap gap-2">{(safeUser.idol?.favorites?.games || []).map(c=><span key={c} className="px-3 py-1.5 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-indigo-700 shadow-sm">{c}</span>)}</div>
                              </div>
                              <div className="p-5 bg-emerald-50/50 rounded-[1.5rem] border border-emerald-100">
                                <span className="block text-[10px] md:text-xs font-black text-emerald-400 uppercase mb-3">Music</span>
                                <div className="flex flex-wrap gap-2">{(safeUser.idol?.favorites?.music || []).map(c=><span key={c} className="px-3 py-1.5 bg-white border border-emerald-200 rounded-xl text-xs font-bold text-emerald-700 shadow-sm">{c}</span>)}</div>
                              </div>
                          </div>
                        </div>
                      </div>
                  )}

                  {/* QnA Tab */}
                  {activeTab === 'qna' && availableTabs.some(t => t.id === 'qna') && (
                      <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-zinc-100">
                          <h4 className="text-xs md:text-sm font-black text-zinc-400 uppercase tracking-widest mb-6 md:mb-8 flex items-center gap-2"><MessageSquare size={16}/> 100문 100답</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                              {((safeUser.qna) || []).map((item, idx) => (
                                  <div key={idx} className="p-5 md:p-6 bg-violet-50/30 rounded-[1.5rem] border border-violet-100/50 relative overflow-hidden hover:bg-violet-50 transition-colors duration-300">
                                      <div className="absolute top-0 right-2 md:right-4 text-5xl md:text-6xl font-black text-violet-100/50 pointer-events-none transform -translate-y-1">Q</div>
                                      <p className="text-sm md:text-base font-black text-violet-900 mb-3 relative z-10 pr-8">{item.q}</p>
                                      <p className="text-xs md:text-sm font-medium text-zinc-600 relative z-10 leading-relaxed">{item.a}</p>
                                  </div>
                              ))}
                              {(!safeUser.qna || safeUser.qna.length === 0) && <p className="md:col-span-2 text-sm text-zinc-400 font-medium text-center py-10 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">등록된 Q&A가 없습니다.</p>}
                          </div>
                      </div>
                  )}

                  {/* Hobby Tab */}
                  {activeTab === 'hobby' && availableTabs.some(t => t.id === 'hobby') && (
                      <div className="bg-white rounded-[2rem] shadow-sm border border-zinc-100 overflow-hidden flex flex-col md:flex-row group">
                          <div className="h-64 md:h-auto md:w-1/2 relative bg-zinc-100 overflow-hidden">
                              <img src={safeUser.hobby?.image || 'https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?q=80&w=1000'} alt="Hobby" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80"></div>
                              <h3 className="absolute bottom-6 md:bottom-10 left-6 md:left-10 text-3xl md:text-4xl font-black text-white drop-shadow-lg">{safeUser.hobby?.title || '취미 생활'}</h3>
                          </div>
                          <div className="p-6 md:p-12 md:w-1/2 flex flex-col justify-center bg-gradient-to-br from-amber-50/20 to-orange-50/20">
                              <Quote size={40} className="text-amber-200 mb-4 md:mb-6 transform rotate-180" />
                              <p className="text-sm md:text-base text-zinc-700 leading-relaxed font-medium mb-6 md:mb-8">
                                  {safeUser.hobby?.description || '설명이 없습니다.'}
                              </p>
                              <div className="flex flex-wrap gap-2 mt-auto">
                                  {(safeUser.hobby?.keywords || []).map(kw => <span key={kw} className="px-3 md:px-4 py-1.5 md:py-2 bg-white text-amber-600 text-[10px] md:text-xs font-black rounded-xl border border-amber-100 shadow-sm">#{kw}</span>)}
                              </div>
                          </div>
                      </div>
                  )}

                  {/* Vision Tab */}
                  {activeTab === 'vision' && availableTabs.some(t => t.id === 'vision') && renderVisionPreview()}

                  {/* Quotes Tab */}
                  {activeTab === 'quotes' && availableTabs.some(t => t.id === 'quotes') && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                          {(safeUser.quotes || []).map((q, idx) => (
                              <div key={idx} className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-zinc-100 relative hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                                  <Quote size={28} className="text-slate-100 absolute top-5 md:top-6 right-6 md:right-8" />
                                  <p className="text-sm md:text-base font-bold text-slate-800 leading-relaxed pr-8 mb-4 md:mb-6">"{q.text}"</p>
                                  <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">- {q.author}</p>
                              </div>
                          ))}
                          {(!safeUser.quotes || safeUser.quotes.length === 0) && (
                            <div className="sm:col-span-2 md:col-span-3 bg-zinc-50 p-10 md:p-16 rounded-[2rem] border border-dashed border-zinc-200 text-center">
                              <p className="text-sm text-zinc-400 font-medium">등록된 명언이 없습니다.</p>
                            </div>
                          )}
                      </div>
                  )}

              </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProfileView;