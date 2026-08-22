import React, { useState, useEffect, useMemo } from 'react';
import { 
  Code, Briefcase, HeartHandshake, Link, Edit2, 
  Rocket, User, Sparkles, MapPin, Target, 
  ArrowRight, Heart, MessageSquare, Lock, 
  ExternalLink, Terminal, Quote, Palette, Compass, Share2, ChevronRight, GraduationCap,
  MessageCircle, Globe, Tv, PlayCircle, Camera, Hash, Users, Loader2
} from 'lucide-react';
import { useAppStore } from '../store/AppStore';

const ProfileView = () => {
  const { setViewMode, user, showToast, isAdmin, setLoginModalOpen, isGuestMode, isLoading } = useAppStore();
  const [activeTab, setActiveTab] = useState('developer'); 

  // ⭐️ 데이터 로딩 중이면 텅 빈 화면 대신 로딩 스피너 표시
  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#F8FAFC]">
        <Loader2 size={40} className="text-indigo-500 animate-spin mb-4" />
        <h2 className="text-lg font-black text-zinc-800 tracking-tight">데이터를 불러오는 중입니다...</h2>
        <p className="text-sm text-zinc-500 font-medium mt-2">잠시만 기다려주세요</p>
      </div>
    );
  }

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

  const getPlatformIcon = (platform) => {
      switch(platform) {
          case 'github': return <Terminal size={16} />;
          case 'youtube': return <PlayCircle size={16} />;
          case 'instagram': return <Camera size={16} />;
          case 'x': return <Hash size={16} />;
          case 'facebook': return <Users size={16} />;
          case 'twitch': return <Tv size={16} />; 
          case 'kakao': return <MessageCircle size={16} />;
          case 'notion': return <div className="font-black text-[12px]">N</div>;
          case 'blog': 
          case 'web': return <Globe size={16} />;
          default: return <Link size={16} />;
      }
  };

  const allTabsMap = {
    developer: { id: 'developer', icon: <Code strokeWidth={2}/>, label: 'Developer', color: 'bg-indigo-50/80 text-indigo-500 border-indigo-100' },
    career: { id: 'career', icon: <Briefcase strokeWidth={2}/>, label: 'Career', color: 'bg-blue-50/80 text-blue-500 border-blue-100' },
    idol: { id: 'idol', icon: <HeartHandshake strokeWidth={2}/>, label: 'Idol', color: 'bg-rose-50/80 text-rose-500 border-rose-100' },
    qna: { id: 'qna', icon: <MessageSquare strokeWidth={2}/>, label: 'Q&A', color: 'bg-violet-50/80 text-violet-500 border-violet-100' },
    hobby: { id: 'hobby', icon: <Palette strokeWidth={2}/>, label: 'Hobby', color: 'bg-amber-50/80 text-amber-500 border-amber-100' },
    vision: { id: 'vision', icon: <Compass strokeWidth={2}/>, label: 'Vision', color: 'bg-violet-50/80 text-violet-500 border-violet-100' },
    quotes: { id: 'quotes', icon: <Quote strokeWidth={2}/>, label: 'Quotes', color: 'bg-slate-100/80 text-slate-500 border-slate-200' }
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
        <div className="bg-zinc-900 p-6 md:p-10 rounded-3xl shadow-sm text-white relative overflow-hidden border border-zinc-800">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-violet-500/10 md:bg-violet-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="text-center mb-8 relative z-10">
                <h3 className="text-2xl md:text-3xl font-black mb-2 flex items-center justify-center gap-2"><Compass className="text-violet-400"/> Mandalart</h3>
                <p className="text-violet-200/80 text-[11px] md:text-xs font-bold uppercase tracking-widest">나의 비전을 이루기 위한 81가지 세부 계획</p>
            </div>
            
            <div className="grid grid-cols-3 gap-1 md:gap-1.5 p-1.5 md:p-2 bg-white/10 backdrop-blur-md rounded-2xl w-full max-w-2xl mx-auto aspect-square relative z-10 shadow-2xl">
                {blocks.map((block, bIdx) => (
                    <div key={bIdx} className="grid grid-cols-3 gap-px bg-white/20 border border-white/10 rounded-xl overflow-hidden shadow-inner">
                        {block.map((cell, cIdx) => {
                            const isCore = bIdx === 4 && cIdx === 4;
                            const isMainSub = bIdx === 4 && cIdx !== 4;
                            const isCenterOfOuter = bIdx !== 4 && cIdx === 4;
                            let bg = "bg-white/95";
                            let text = "text-slate-800";
                            let font = "font-bold text-[7px] sm:text-[9px] md:text-xs";
                            if (isCore) { bg = "bg-violet-500 shadow-lg z-10"; text = "text-white"; font = "font-black text-[9px] sm:text-[11px] md:text-sm"; } 
                            else if (isMainSub || isCenterOfOuter) { bg = "bg-violet-50"; text = "text-violet-900"; font = "font-black text-[8px] sm:text-[10px] md:text-sm"; }
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
    <div className="max-w-[1000px] mx-auto w-full pb-24 relative animate-in fade-in duration-300 px-4 md:px-8 pt-6 md:pt-10">
      
      {/* 상태 메시지 배지 */}
      {!isProfileEmpty && safeUser.status && (
        <div className="mb-4 flex relative z-10">
            <div className="inline-flex items-center gap-1.5 bg-white border border-zinc-200 text-zinc-800 px-4 py-2 rounded-2xl shadow-sm">
                <Sparkles size={14} className="text-yellow-500" />
                <span className="text-xs font-bold tracking-wider">{safeUser.status}</span>
            </div>
        </div>
      )}

      {/* 1. 메인 프로필 명함 */}
      <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm relative z-20 border border-zinc-200/80">
        
        {/* 우측 상단 둥근 버튼 (공유/편집) */}
        <div className="absolute top-4 right-4 md:top-6 md:right-6 flex gap-2 z-10">
          {!isProfileEmpty && (
            <button onClick={handleShare} className="w-9 h-9 bg-white hover:bg-zinc-50 text-zinc-600 rounded-full flex items-center justify-center transition shadow-sm border border-zinc-200" title="공유">
                <Share2 size={15} />
            </button>
          )}
          {isAdmin && !isGuestMode ? (
            <button onClick={() => setViewMode('edit_profile')} className="w-9 h-9 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full flex items-center justify-center transition shadow-sm" title="프로필 설정">
              <Edit2 size={15} />
            </button>
          ) : !isAdmin ? (
             <button onClick={() => setLoginModalOpen(true)} className="px-4 h-9 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
              <Rocket size={14} /> 시작하기
            </button>
          ) : null}
        </div>

        {isProfileEmpty && !isAdmin ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-zinc-50 text-zinc-300 rounded-full flex items-center justify-center mb-4 shadow-inner"><User size={32}/></div>
            <h3 className="text-lg md:text-xl font-black text-zinc-900 mb-2">설정된 프로필이 없습니다</h3>
            <p className="text-xs md:text-sm font-medium text-zinc-500">가입하고 나만의 명함을 만들어보세요.</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-stretch mt-4 md:mt-0">
            
            {/* 좌측: 주요 정보 */}
            <div className="flex-1 flex flex-col min-w-0 md:pr-4"> 
              <div className="flex flex-row md:flex-row gap-5 items-center md:items-start">
                
                {/* 둥근 사각형 프로필 사진 */}
                <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 bg-zinc-50 rounded-2xl overflow-hidden border border-zinc-200 shadow-inner">
                  {safeUser.profileImageUrl ? (
                      <img src={safeUser.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-black text-zinc-300">
                        {safeUser.name ? safeUser.name.charAt(0) : '?'}
                      </div>
                  )}
                </div>
                
                {/* 텍스트 정보 */}
                <div className="flex-1 flex flex-col justify-center min-w-0 md:pt-1">
                  <h2 className="text-2xl md:text-3xl font-black text-zinc-900 mb-1 truncate">{safeUser.name || '이름 없음'}</h2>
                  {/* 연보라색 아이디 뱃지 */}
                  <p className="text-xs md:text-sm font-bold text-violet-600 bg-violet-50 border border-violet-100 px-2.5 py-0.5 rounded-lg inline-block w-max mb-3 shadow-sm truncate">@{safeUser.handle || 'handle'}</p>
                  
                  <div className="space-y-1.5 md:space-y-2">
                    <div className="flex items-center gap-2 text-[11px] md:text-[13px] font-medium text-zinc-600 truncate">
                      <Briefcase size={14} className="text-zinc-400 shrink-0"/> {safeUser.role || '소속/직무 미입력'}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] md:text-[13px] font-medium text-zinc-600 truncate">
                      <GraduationCap size={14} className="text-zinc-400 shrink-0"/> {safeUser.major || '전공 미입력'}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] md:text-[13px] font-medium text-zinc-600 truncate">
                      <MapPin size={14} className="text-zinc-400 shrink-0"/> {safeUser.location || '지역 미입력'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 좌측 하단: 태그 리스트 */}
              {(safeUser.tags || []).length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                    {safeUser.tags.map(tag => (
                      <span key={tag} className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 text-zinc-600 text-[10px] md:text-xs font-bold rounded-lg cursor-default shadow-sm hover:border-zinc-300 transition-colors">#{tag}</span>
                    ))}
                </div>
              )}

              {/* ⭐️ 소셜 및 개인 링크 버튼 영역 */}
              {(safeUser.links && safeUser.links.length > 0) && (
                  <div className="mt-4 flex flex-wrap gap-2.5">
                      {safeUser.links.map((link, idx) => (
                          <a 
                              key={idx} 
                              href={link.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="w-9 h-9 md:w-10 md:h-10 bg-white border border-zinc-200 rounded-full flex items-center justify-center text-zinc-600 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-md transition-all group relative"
                          >
                              {getPlatformIcon(link.platform)}
                              
                              {/* 마우스 오버 시 나타나는 이름(툴팁) */}
                              {link.name && (
                                  <span className="absolute -bottom-8 bg-zinc-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                                      {link.name}
                                  </span>
                              )}
                          </a>
                      ))}
                  </div>
              )}
            </div>

            {/* 중간 얇은 구분선 */}
            <div className="hidden md:block w-px bg-zinc-100 my-2 mx-4"></div>

            {/* 우측: 자기소개 인용구 */}
            <div className="flex-1 flex flex-col justify-center md:pl-6 mt-2 md:mt-0">
              <Quote size={24} className="text-violet-300 mb-3 md:mb-4"/>
              <p className="text-[13px] md:text-[15px] text-zinc-800 font-bold leading-relaxed mb-4 whitespace-pre-line">
                "{safeUser.bio || '나를 표현하는 한 줄 소개가 들어갑니다.'}"
              </p>
            </div>

          </div>
        )}
      </div>

      {!isProfileEmpty && (
        <>
          {/* 2. 데이터 탐색 탭 */}
          <div className="mt-8 md:mt-12">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base md:text-lg font-black text-zinc-900 tracking-tight">데이터 탐색</h3>
              <ChevronRight size={18} className="text-zinc-400 md:hidden"/>
            </div>
            <p className="text-[11px] md:text-xs text-zinc-500 font-medium mb-3">CraveLog가 수집한 상세 프로필 데이터를 확인해보세요.</p>
            
            <div className="flex md:flex-wrap md:justify-start gap-3 md:gap-4 overflow-x-auto md:overflow-visible scrollbar-hide pt-4 pb-6 -mx-4 px-4 md:mx-0 md:px-0">
              {availableTabs.map(tab => {
                  const isActive = activeTab === tab.id;
                  const isPrivate = isTabPrivate(tab.id);
                  
                  return (
                    <button 
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex flex-col items-center gap-1.5 md:gap-2 shrink-0 group outline-none`}
                    >
                      <div className={`w-16 h-16 md:w-[76px] md:h-[76px] rounded-2xl md:rounded-[1.5rem] flex items-center justify-center relative transition-all duration-300 border ${isActive ? `${tab.color} border-current shadow-md scale-105` : 'bg-white border-zinc-200 text-zinc-400 shadow-sm group-hover:scale-105 group-hover:border-zinc-300'}`}>
                        {React.cloneElement(tab.icon, { className: 'w-6 h-6 md:w-7 md:h-7 transition-colors' })}
                        {isPrivate && (
                          <div className="absolute -top-2 -right-2 bg-white border border-zinc-200 p-1 md:p-1.5 rounded-full shadow-sm z-10">
                            <Lock size={10} className="text-zinc-400"/>
                          </div>
                        )}
                      </div>
                      <span className={`text-[10px] md:text-[11px] font-black transition-colors ${isActive ? 'text-zinc-900' : 'text-zinc-400 group-hover:text-zinc-600'}`}>{tab.label}</span>
                    </button>
                  );
              })}
            </div>
          </div>

          {/* 3. 활성화된 탭 컨텐츠 영역 */}
          {availableTabs.length === 0 && isGuest ? (
              <div className="mt-4 md:mt-6 p-10 flex flex-col items-center justify-center bg-white rounded-3xl shadow-sm border border-zinc-100">
                  <div className="w-16 h-16 bg-zinc-50 flex items-center justify-center rounded-full mb-4 shadow-inner"><Lock size={24} className="text-zinc-400" /></div>
                  <h3 className="text-base md:text-lg font-black text-zinc-800">비공개 프로필</h3>
                  <p className="text-xs md:text-sm font-medium text-zinc-500 mt-2">세부 정보가 비공개 설정되어 있습니다.</p>
              </div>
          ) : (
              <div className="mt-4 md:mt-6 animate-in slide-in-from-bottom-4 duration-500 pb-10">
                  
                  {/* Developer Tab */}
                  {activeTab === 'developer' && availableTabs.some(t => t.id === 'developer') && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
                        <div className="md:col-span-1 flex flex-col gap-4 md:gap-5">
                          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-100">
                            <h4 className="text-[11px] md:text-xs font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-1.5"><User size={14}/> About Me</h4>
                            <p className="text-sm text-zinc-700 leading-relaxed font-medium whitespace-pre-line">
                              {safeUser.developer?.about || '입력된 자기소개가 없습니다.'}
                            </p>
                          </div>
                          
                          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-100 flex-1">
                            <h4 className="text-[11px] md:text-xs font-black text-zinc-400 uppercase tracking-widest mb-5 flex items-center gap-1.5"><Code size={14}/> Tech Stack</h4>
                            <div className="space-y-5">
                                {['backend', 'db', 'frontend', 'tools'].map(type => {
                                    const stackData = safeUser.developer?.techStack?.[type];
                                    if (!stackData) return null;
                                    
                                    const stackArray = Array.isArray(stackData) 
                                        ? stackData 
                                        : typeof stackData === 'string' 
                                            ? stackData.split(',').filter(Boolean) 
                                            : [];

                                    if (stackArray.length === 0) return null;

                                    return (
                                        <div key={type}>
                                            <span className="block text-[10px] font-black text-zinc-300 uppercase mb-2">{type}</span>
                                            <div className="flex flex-wrap gap-2">
                                                {stackArray.map((tech, i) => (
                                                    <span key={i} className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-xl text-[11px] font-bold cursor-default">
                                                        {typeof tech === 'string' ? tech.trim() : String(tech)}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-100 h-full">
                             <h4 className="text-[11px] md:text-xs font-black text-zinc-400 uppercase tracking-widest mb-5 flex items-center gap-1.5"><Rocket size={14}/> Post & Portfolio</h4>
                             <div className="grid grid-cols-1 gap-4">
                                {(safeUser.developer?.projects || []).map((proj, idx) => (
                                    <div key={idx} className="p-5 bg-zinc-50/50 rounded-2xl border border-zinc-100 hover:shadow-md hover:border-zinc-200 hover:-translate-y-0.5 transition-all duration-300">
                                        <div className="flex justify-between items-start mb-2">
                                            <h5 className="text-base md:text-lg font-black text-zinc-900">{proj.name}</h5>
                                            <div className="flex gap-1.5 text-zinc-400">
                                                {proj.githubUrl && <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="bg-white border border-zinc-200 shadow-sm p-1.5 rounded-lg hover:text-zinc-900 hover:bg-zinc-50 transition"><Terminal size={14} /></a>}
                                                {proj.liveUrl && <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer" className="bg-white border border-zinc-200 shadow-sm p-1.5 rounded-lg hover:text-indigo-600 hover:bg-indigo-50 transition"><ExternalLink size={14} /></a>}
                                            </div>
                                        </div>
                                        <p className="text-xs md:text-sm text-zinc-500 font-medium leading-relaxed">{proj.desc}</p>
                                    </div>
                                ))}
                                {(!safeUser.developer?.projects || safeUser.developer.projects.length === 0) && <p className="text-sm text-zinc-400 font-medium text-center py-12 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">등록된 프로젝트가 없습니다.</p>}
                             </div>
                          </div>
                        </div>
                      </div>
                  )}

                  {/* Career Tab */}
                  {activeTab === 'career' && availableTabs.some(t => t.id === 'career') && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
                        <div className="md:col-span-1 flex flex-col gap-4 md:gap-5">
                          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-100">
                            <h4 className="text-[11px] md:text-xs font-black text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Target size={14}/> Target Job</h4>
                            <p className="text-xl md:text-2xl font-black text-blue-600">{safeUser.career?.targetJob || '미입력'}</p>
                          </div>
                          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-100 flex-1">
                             <h4 className="text-[11px] md:text-xs font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-1.5"><MapPin size={14}/> Career Goals</h4>
                             <div className="flex flex-col gap-3">
                               <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                                  <h5 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1.5">단기 목표</h5>
                                  <p className="text-xs font-bold text-zinc-800 leading-relaxed">{safeUser.career?.careerGoals?.short || '-'}</p>
                               </div>
                               <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                                  <h5 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1.5">중장기 목표</h5>
                                  <p className="text-xs font-bold text-zinc-800 leading-relaxed">{safeUser.career?.careerGoals?.long || '-'}</p>
                               </div>
                             </div>
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-100 h-full">
                             <h4 className="text-[11px] md:text-xs font-black text-zinc-400 uppercase tracking-widest mb-5 flex items-center gap-1.5"><Briefcase size={14}/> 이력 및 강점</h4>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {(safeUser.career?.strengths || []).map((str, idx) => (
                                    <div key={idx} className="p-5 bg-zinc-50/80 rounded-2xl border border-zinc-100 hover:bg-white hover:shadow-md hover:border-blue-100 transition-all duration-300">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs mb-3 shadow-sm">{idx+1}</div>
                                        <h5 className="text-sm md:text-base font-black text-zinc-900 mb-2">{str.title}</h5>
                                        <p className="text-xs text-zinc-500 font-medium leading-relaxed">{str.desc}</p>
                                    </div>
                                ))}
                                {(!safeUser.career?.strengths || safeUser.career.strengths.length === 0) && (
                                    <div className="sm:col-span-2 text-center py-12 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
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
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
                        <div className="md:col-span-1 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-100 h-full">
                          <h4 className="text-[11px] md:text-xs font-black text-zinc-400 uppercase tracking-widest mb-5 flex items-center gap-1.5"><Sparkles size={14}/> Profile Info</h4>
                          <div className="space-y-3">
                              <div className="flex justify-between items-center bg-rose-50/50 p-3 rounded-xl border border-rose-100/50"><span className="text-[11px] font-bold text-rose-400">Nickname</span><span className="text-xs font-black text-zinc-800">{safeUser.idol?.nickname || '-'}</span></div>
                              <div className="flex justify-between items-center bg-rose-50/50 p-3 rounded-xl border border-rose-100/50"><span className="text-[11px] font-bold text-rose-400">Birthday</span><span className="text-xs font-black text-zinc-800">{safeUser.idol?.birthday || '-'}</span></div>
                              <div className="flex justify-between items-center bg-rose-50/50 p-3 rounded-xl border border-rose-100/50"><span className="text-[11px] font-bold text-rose-400">Age</span><span className="text-xs font-black text-zinc-800">{safeUser.idol?.age || '-'}</span></div>
                              <div className="flex justify-between items-center bg-rose-50/50 p-3 rounded-xl border border-rose-100/50"><span className="text-[11px] font-bold text-rose-400">Specialty</span><span className="text-xs font-black text-zinc-800">{safeUser.idol?.specialty || '-'}</span></div>
                          </div>
                        </div>

                        <div className="md:col-span-2 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-100 h-full">
                          <h4 className="text-[11px] md:text-xs font-black text-zinc-400 uppercase tracking-widest mb-5 flex items-center gap-1.5"><Heart size={14}/> Favorites</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="p-4 bg-zinc-50/80 rounded-2xl border border-zinc-100">
                                <span className="block text-[10px] font-black text-zinc-400 uppercase mb-2">Colors</span>
                                <div className="flex flex-wrap gap-2">{(safeUser.idol?.favorites?.colors || []).map(c=><span key={c} className="px-2.5 py-1 bg-white border border-zinc-200 rounded-lg text-[11px] font-bold text-zinc-700 shadow-sm">{c}</span>)}</div>
                              </div>
                              <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100/50">
                                <span className="block text-[10px] font-black text-orange-400 uppercase mb-2">Foods</span>
                                <div className="flex flex-wrap gap-2">{(safeUser.idol?.favorites?.foods || []).map(c=><span key={c} className="px-2.5 py-1 bg-white border border-orange-200 rounded-lg text-[11px] font-bold text-orange-700 shadow-sm">{c}</span>)}</div>
                              </div>
                              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                                <span className="block text-[10px] font-black text-indigo-400 uppercase mb-2">Games</span>
                                <div className="flex flex-wrap gap-2">{(safeUser.idol?.favorites?.games || []).map(c=><span key={c} className="px-2.5 py-1 bg-white border border-indigo-200 rounded-lg text-[11px] font-bold text-indigo-700 shadow-sm">{c}</span>)}</div>
                              </div>
                              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                                <span className="block text-[10px] font-black text-emerald-400 uppercase mb-2">Music</span>
                                <div className="flex flex-wrap gap-2">{(safeUser.idol?.favorites?.music || []).map(c=><span key={c} className="px-2.5 py-1 bg-white border border-emerald-200 rounded-lg text-[11px] font-bold text-emerald-700 shadow-sm">{c}</span>)}</div>
                              </div>
                          </div>
                        </div>
                      </div>
                  )}

                  {/* QnA Tab */}
                  {activeTab === 'qna' && availableTabs.some(t => t.id === 'qna') && (
                      <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-zinc-100">
                          <h4 className="text-[11px] md:text-xs font-black text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-1.5"><MessageSquare size={14}/> 100문 100답</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {((safeUser.qna) || []).map((item, idx) => (
                                  <div key={idx} className="p-5 bg-violet-50/50 rounded-2xl border border-violet-100/50 relative overflow-hidden hover:bg-violet-50 hover:shadow-sm transition-all duration-300">
                                      <div className="absolute top-2 right-3 md:right-4 text-4xl md:text-5xl font-black text-violet-200/50 pointer-events-none">Q</div>
                                      <p className="text-sm font-black text-violet-900 mb-2 relative z-10 pr-8">{item.q}</p>
                                      <p className="text-xs font-medium text-zinc-600 relative z-10 leading-relaxed">{item.a}</p>
                                  </div>
                              ))}
                              {(!safeUser.qna || safeUser.qna.length === 0) && <p className="md:col-span-2 text-sm text-zinc-400 font-medium text-center py-12 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">등록된 Q&A가 없습니다.</p>}
                          </div>
                      </div>
                  )}

                  {/* Hobby Tab */}
                  {activeTab === 'hobby' && availableTabs.some(t => t.id === 'hobby') && (
                      <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 overflow-hidden flex flex-col md:flex-row group">
                          <div className="h-56 md:h-auto md:w-1/2 relative bg-zinc-100 overflow-hidden">
                              <img src={safeUser.hobby?.image || 'https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?q=80&w=1000'} alt="Hobby" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-90"></div>
                              <h3 className="absolute bottom-6 left-6 md:left-8 text-2xl md:text-3xl font-black text-white drop-shadow-md">{safeUser.hobby?.title || '취미 생활'}</h3>
                          </div>
                          <div className="p-6 md:p-12 md:w-1/2 flex flex-col justify-center bg-gradient-to-br from-amber-50/30 to-orange-50/10">
                              <Quote size={32} className="text-amber-200 mb-4 transform rotate-180" />
                              <p className="text-sm text-zinc-700 leading-relaxed font-medium mb-6">
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {(safeUser.quotes || []).map((q, idx) => (
                              <div key={idx} className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-zinc-100 relative hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                                  <Quote size={24} className="text-slate-100 absolute top-5 right-6" />
                                  <p className="text-sm md:text-base font-bold text-slate-800 leading-relaxed pr-6 mb-4">"{q.text}"</p>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">- {q.author}</p>
                              </div>
                          ))}
                          {(!safeUser.quotes || safeUser.quotes.length === 0) && (
                            <div className="sm:col-span-2 md:col-span-3 bg-zinc-50 p-12 rounded-3xl border border-dashed border-zinc-200 text-center">
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