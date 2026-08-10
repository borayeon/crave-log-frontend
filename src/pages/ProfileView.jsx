import React, { useState, useEffect, useMemo } from 'react';
import { 
  Code, Briefcase, HeartHandshake, Eye, EyeOff, Link, Edit2, 
  Rocket, User, Sparkles, GraduationCap, MapPin, Target, 
  ArrowRight, Heart, MessageSquare, Lock, 
  ExternalLink, Terminal, Quote, Palette, Compass
} from 'lucide-react';
import { useAppStore } from '../store/AppStore';

const ProfileView = () => {
  const { setViewMode, user, showToast, isAdmin, setLoginModalOpen, isGuestMode } = useAppStore();
  const [activeTab, setActiveTab] = useState('developer'); 

  const isGuest = !isAdmin || isGuestMode;

  // ⭐️ 수정: 누락되었던 4개의 탭(qna, hobby, vision, quotes)을 기본 순서에 모두 추가!
  const [tabOrder, setTabOrder] = useState(() => {
    const saved = localStorage.getItem('cravelog_tab_order');
    const defaultOrder = ['developer', 'career', 'idol', 'qna', 'hobby', 'vision', 'quotes'];
    if (saved) {
        const parsed = JSON.parse(saved);
        // 기존에 저장된 순서가 있더라도 새로 추가된 탭이 있으면 뒤에 이어붙임
        const missing = defaultOrder.filter(id => !parsed.includes(id));
        return [...parsed, ...missing];
    }
    return defaultOrder;
  });
  const [draggedTab, setDraggedTab] = useState(null);

  useEffect(() => {
    localStorage.setItem('cravelog_tab_order', JSON.stringify(tabOrder));
  }, [tabOrder]);
  
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

    // 호환성 처리: qna가 idol 안에만 있다면 최상위 qna로 끌어올림
    if (!parsedUser.qna || parsedUser.qna.length === 0) {
        if (parsedUser.idol?.qna?.length > 0) {
            parsedUser.qna = parsedUser.idol.qna;
        }
    }

    return parsedUser;
  }, [user]);

  const isProfileEmpty = (!safeUser.name || safeUser.name === "손님") && (safeUser.tags || []).length === 0;
  const shouldBlur = isProfileEmpty && !isAdmin;

  // ⭐️ 수정: 전체 7개 탭의 아이콘과 이름 매핑
  const allTabsMap = {
    developer: { id: 'developer', icon: <Code size={16}/>, label: 'Developer Profile' },
    career: { id: 'career', icon: <Briefcase size={16}/>, label: 'Career Info' },
    idol: { id: 'idol', icon: <HeartHandshake size={16}/>, label: 'Personal (Idol)' },
    qna: { id: 'qna', icon: <MessageSquare size={16}/>, label: 'Q&A' },
    hobby: { id: 'hobby', icon: <Palette size={16}/>, label: 'Hobby' },
    vision: { id: 'vision', icon: <Compass size={16}/>, label: 'Mandalart' },
    quotes: { id: 'quotes', icon: <Quote size={16}/>, label: 'Quotes' }
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

  const availableTabs = tabOrder
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

  const handleDragStart = (e, id) => {
    setDraggedTab(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id); 
  };
  const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
  const handleDragEnter = (e) => { e.preventDefault(); };
  const handleDrop = (e, dropId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedTab || draggedTab === dropId) return;

    const newOrder = [...tabOrder];
    const dragIdx = newOrder.indexOf(draggedTab);
    const dropIdx = newOrder.indexOf(dropId);
    
    newOrder.splice(dragIdx, 1);
    newOrder.splice(dropIdx, 0, draggedTab);
    
    setTabOrder(newOrder);
    setDraggedTab(null);
  };

  // 만다라트 렌더링 함수
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
        <div className="bg-gradient-to-br from-teal-900 to-slate-900 p-8 md:p-12 rounded-[2.5rem] shadow-xl text-white">
            <div className="text-center mb-10">
                <h3 className="text-3xl md:text-4xl font-black mb-3 flex items-center justify-center gap-3"><Compass className="text-teal-400"/> Mandalart</h3>
                <p className="text-teal-200/80 text-sm font-medium">나의 비전을 이루기 위한 81가지 세부 계획</p>
            </div>
            <div className="grid grid-cols-3 gap-1 md:gap-2 p-2 bg-white/10 backdrop-blur-md rounded-2xl w-full max-w-3xl mx-auto aspect-square border border-white/20 shadow-2xl">
                {blocks.map((block, bIdx) => (
                    <div key={bIdx} className="grid grid-cols-3 gap-px bg-white/20 border border-white/10 rounded overflow-hidden shadow-inner">
                        {block.map((cell, cIdx) => {
                            const isCore = bIdx === 4 && cIdx === 4;
                            const isMainSub = bIdx === 4 && cIdx !== 4;
                            const isCenterOfOuter = bIdx !== 4 && cIdx === 4;
                            let bg = "bg-white/90";
                            let text = "text-slate-800";
                            let font = "font-bold text-[8px] sm:text-[10px] md:text-xs";
                            if (isCore) { bg = "bg-teal-500 shadow-lg z-10"; text = "text-white"; font = "font-black text-[10px] sm:text-xs md:text-sm"; } 
                            else if (isMainSub || isCenterOfOuter) { bg = "bg-teal-100"; text = "text-teal-900"; font = "font-black text-[9px] sm:text-[11px] md:text-sm"; }
                            return (
                                <div key={cIdx} className={`${bg} ${text} ${font} flex items-center justify-center text-center p-0.5 sm:p-1 overflow-hidden break-words leading-tight transition-colors hover:brightness-95 cursor-default`}>
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
    <div className="max-w-5xl mx-auto w-full p-4 md:p-10 animate-in fade-in duration-300 pb-28 md:pb-10 overflow-y-auto">
      <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight">Index</h1>
          <p className="text-sm font-bold text-zinc-400 mt-1 uppercase tracking-widest">Personal Catalog</p>
        </div>
        <div className="flex flex-wrap gap-2">
           {!isProfileEmpty && (
             <button onClick={handleShare} className="px-4 py-2 bg-white border border-zinc-200 text-zinc-600 rounded-xl text-sm font-bold hover:bg-zinc-50 transition shadow-sm flex items-center gap-2">
                 <Link size={16} /> <span className="hidden md:inline">공유</span>
             </button>
           )}
          {isAdmin && !isGuestMode ? (
            <button onClick={() => setViewMode('edit_profile')} className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition shadow-sm flex items-center gap-2">
              <Edit2 size={16} /> <span className="hidden md:inline">프로필 설정</span>
            </button>
          ) : !isAdmin ? (
             <button onClick={() => setLoginModalOpen(true)} className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition shadow-sm flex items-center gap-2">
              <Rocket size={16} /> <span className="hidden md:inline">내 프로필 만들기</span>
            </button>
          ) : null}
        </div>
      </header>

      {/* Top SNS Profile Area */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-200/60 flex flex-col md:flex-row gap-8 items-center md:items-start mb-6 relative overflow-hidden">
        {isProfileEmpty && !isAdmin && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-4 shadow-sm"><User size={32}/></div>
                <h3 className="text-xl font-black text-zinc-900 mb-2">아직 설정된 프로필이 없어요!</h3>
                <p className="text-sm font-medium text-zinc-500 mb-6 max-w-sm">로그인 후 나만의 직무, 목표, 취향 정보를 입력하고 나를 표현하는 멋진 인덱스를 완성해보세요.</p>
                <button onClick={() => setLoginModalOpen(true)} className="px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold shadow-md hover:bg-zinc-800 transition">
                    CraveLog 시작하기
                </button>
            </div>
        )}

        <div className={`shrink-0 text-center ${shouldBlur ? 'opacity-30 blur-[2px]' : ''}`}>
            <div className="w-32 h-32 bg-gradient-to-tr from-indigo-500 to-rose-400 p-[3px] rounded-[2rem] shadow-md mx-auto relative">
                <div className="w-full h-full border-[5px] border-white bg-zinc-100 flex items-center justify-center rounded-[1.8rem] overflow-hidden">
                    {safeUser.profileImageUrl ? (
                        <img src={safeUser.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-5xl font-black text-zinc-300">{isProfileEmpty ? '?' : (safeUser.name ? safeUser.name.charAt(0) : '?')}</span>
                    )}
                </div>
                {!isProfileEmpty && safeUser.status && (
                    <div className="absolute -bottom-3 -right-2 bg-zinc-900 text-white px-3 py-1.5 shadow-xl flex items-center gap-1.5 rounded-xl border border-zinc-800">
                        <Sparkles size={12} className="text-yellow-400" /><span className="text-[10px] font-bold tracking-wider">{safeUser.status}</span>
                    </div>
                )}
            </div>
        </div>
        
        <div className={`flex-1 text-center md:text-left ${shouldBlur ? 'opacity-30 blur-[2px]' : ''}`}>
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                <h2 className="text-2xl font-black text-zinc-900">{safeUser.name || '손님'}</h2>
                <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold text-zinc-500">
                    <span className="flex items-center gap-1"><Briefcase size={14}/> {safeUser.role || ''}</span>
                    <span className="flex items-center gap-1"><GraduationCap size={14}/> {safeUser.major || ''}</span>
                    <span className="flex items-center gap-1"><MapPin size={14}/> {safeUser.location || ''}</span>
                </div>
            </div>
            <p className="text-sm text-zinc-500 font-medium mb-4">@{safeUser.handle || 'handle'}</p>
            <p className="text-base text-zinc-700 font-bold mb-4">"{safeUser.bio || ''}"</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                {(safeUser.tags || []).map(tag => <span key={tag} className="px-3 py-1 bg-zinc-100 text-zinc-600 text-xs font-black rounded-lg">#{tag}</span>)}
            </div>

            <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 text-left">
                <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Target size={14}/> 현재 목표</h4>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {(safeUser.goals || []).map((goal, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md"><ArrowRight size={12}/> {goal}</div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {!isProfileEmpty && (
        <>
          {/* Detail Tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6 p-1 bg-zinc-100/50 rounded-2xl border border-zinc-200/50">
            {availableTabs.map(tab => {
                const isPrivate = isTabPrivate(tab.id); 
                return (
                  <div 
                      key={tab.id} 
                      draggable={!isGuest}
                      onDragStart={(e) => handleDragStart(e, tab.id)}
                      onDragOver={handleDragOver}
                      onDragEnter={handleDragEnter}
                      onDrop={(e) => handleDrop(e, tab.id)}
                      onDragEnd={() => setDraggedTab(null)}
                      onClick={() => setActiveTab(tab.id)} 
                      className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all whitespace-nowrap select-none ${
                          !isGuest ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
                      } ${
                          activeTab === tab.id ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/60' : 'text-zinc-400 hover:text-zinc-600 hover:bg-white/50'
                      } ${draggedTab === tab.id ? 'opacity-40 scale-95 border-dashed border-2 border-indigo-400' : 'opacity-100'}`}
                  >
                      {tab.icon} {tab.label} {isPrivate && <Lock size={12} className="text-rose-400" />}
                  </div>
                );
            })}
          </div>

          {/* Tab Contents */}
          {availableTabs.length === 0 && isGuest ? (
              <div className="py-20 flex flex-col items-center justify-center bg-white rounded-[2rem] border border-zinc-200/60 shadow-sm animate-in fade-in duration-500">
                  <div className="w-16 h-16 bg-zinc-50 flex items-center justify-center rounded-full mb-4 border border-zinc-100 shadow-inner">
                      <Lock size={28} className="text-zinc-300" />
                  </div>
                  <h3 className="text-lg font-black text-zinc-800">비공개 프로필</h3>
                  <p className="text-sm font-medium text-zinc-500 mt-2">사용자가 모든 세부 프로필을 비공개로 설정했습니다.</p>
              </div>
          ) : (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  
                  {/* Developer Tab */}
                  {activeTab === 'developer' && availableTabs.some(t => t.id === 'developer') && (
                      <div className="space-y-6">
                          <div className="bg-[#0D1117] text-zinc-300 p-8 rounded-[2rem] shadow-xl border border-zinc-800 relative overflow-hidden">
                              <div className="absolute top-4 left-4 flex gap-1.5">
                                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                              </div>
                              
                              <p className="font-mono text-sm leading-relaxed whitespace-pre-line text-emerald-400 mb-8 mt-4">
                                  <span className="text-zinc-500">{"// About Me"}</span><br/>{safeUser.developer?.about || ''}
                              </p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="bg-[#161B22] p-5 rounded-2xl border border-zinc-800">
                                      <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                          <Code size={14}/> Tech Stack
                                      </h4>
                                      <div className="space-y-4 text-sm font-mono">
                                          {['backend', 'db', 'frontend', 'tools'].map(type => {
                                              const stackString = safeUser.developer?.techStack?.[type];
                                              if (!stackString) return null;
                                              return (
                                                  <div key={type}>
                                                      <span className={`text-[10px] uppercase font-bold mr-2 ${type === 'backend' ? 'text-indigo-400' : type === 'db' ? 'text-emerald-400' : type === 'frontend' ? 'text-rose-400' : 'text-yellow-400'}`}>
                                                          {type}:
                                                      </span>
                                                      <div className="inline-flex flex-wrap gap-1.5 align-middle mt-1">
                                                          {stackString.split(',').map((tech, i) => (
                                                              <span key={i} className="px-2 py-0.5 bg-[#21262D] border border-zinc-700 rounded text-xs font-medium text-zinc-200 hover:border-zinc-500 transition-colors cursor-default">
                                                                  {tech.trim()}
                                                              </span>
                                                          ))}
                                                      </div>
                                                  </div>
                                              )
                                          })}
                                      </div>
                                  </div>
                                  
                                  <div className="bg-[#161B22] p-5 rounded-2xl border border-zinc-800">
                                      <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                          <Code size={14}/> Currently Learning
                                      </h4>
                                      <div className="flex flex-wrap gap-2">
                                          {(safeUser.developer?.learning || []).map(l => (
                                              <span key={l} className="px-2.5 py-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 rounded-lg text-xs font-bold font-mono">
                                                  {l}
                                              </span>
                                          ))}
                                      </div>
                                  </div>
                              </div>
                          </div>

                          <div>
                              <h3 className="text-lg font-black text-zinc-900 mb-4 ml-2 flex items-center gap-2">
                                  <Code size={20} className="text-indigo-500" /> Featured Projects
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {(safeUser.developer?.projects || []).map((proj, idx) => (
                                      <div key={idx} className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col group">
                                          <div className="flex justify-between items-start mb-3">
                                              <h4 className="text-xl font-black text-zinc-900 group-hover:text-indigo-600 transition-colors">
                                                  {proj.name}
                                              </h4>
                                              <div className="flex gap-2 text-zinc-400">
                                                  {proj.githubUrl && (
                                                      <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 transition-colors" title="Repository">
                                                          <Terminal size={18} />
                                                      </a>
                                                  )}
                                                  {proj.liveUrl && (
                                                      <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors" title="Live Preview">
                                                          <ExternalLink size={18} />
                                                      </a>
                                                  )}
                                              </div>
                                          </div>
                                          <p className="text-sm text-zinc-500 font-medium leading-relaxed flex-1">
                                              {proj.desc}
                                          </p>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>
                  )}

                  {/* Career Tab */}
                  {activeTab === 'career' && availableTabs.some(t => t.id === 'career') && (
                      <div className="space-y-6">
                          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-200/60 flex flex-col md:flex-row gap-8">
                              <div className="flex-1 space-y-6">
                                  <div>
                                      <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Target Job</h4>
                                      <p className="text-xl font-black text-indigo-600">{safeUser.career?.targetJob || ''}</p>
                                  </div>
                                  <div>
                                      <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Tech Stack</h4>
                                      <div className="flex flex-wrap gap-2">
                                          {(safeUser.career?.techStack || []).map(t => <span key={t} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-black rounded-lg border border-indigo-100">{t}</span>)}
                                      </div>
                                  </div>
                                  <div>
                                      <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Interests</h4>
                                      <div className="flex flex-wrap gap-2">
                                          {(safeUser.career?.interests || []).map(i => <span key={i} className="px-3 py-1.5 bg-zinc-50 text-zinc-600 text-xs font-black rounded-lg border border-zinc-200">{i}</span>)}
                                      </div>
                                  </div>
                              </div>
                              
                              <div className="w-full md:w-1/3 space-y-4">
                                  <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
                                      <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Short Term Goal</h4>
                                      <p className="text-sm font-bold text-indigo-900">{safeUser.career?.careerGoals?.short || ''}</p>
                                  </div>
                                  <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
                                      <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Mid Term Goal</h4>
                                      <p className="text-sm font-bold text-indigo-900">{safeUser.career?.careerGoals?.mid || ''}</p>
                                  </div>
                                  <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
                                      <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Long Term Goal</h4>
                                      <p className="text-sm font-bold text-indigo-900">{safeUser.career?.careerGoals?.long || ''}</p>
                                  </div>
                              </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {(safeUser.career?.strengths || []).map((str, idx) => (
                                  <div key={idx} className="bg-white p-6 rounded-[2rem] border border-zinc-200/80 shadow-sm">
                                      <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center font-black mb-4">{idx+1}</div>
                                      <h4 className="text-base font-black text-zinc-900 mb-2">{str.title}</h4>
                                      <p className="text-xs text-zinc-500 leading-relaxed font-medium">{str.desc}</p>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

                  {/* Idol Tab */}
                  {activeTab === 'idol' && availableTabs.some(t => t.id === 'idol') && (
                      <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="md:col-span-1 bg-gradient-to-br from-rose-50 to-pink-50 p-8 rounded-[2rem] shadow-sm border border-rose-100 space-y-5">
                                  <h3 className="text-xl font-black text-rose-900 mb-6 flex items-center gap-2"><Sparkles size={20} className="text-rose-400"/> Profile</h3>
                                  <div className="space-y-4 text-sm">
                                      <div className="flex justify-between border-b border-rose-200/50 pb-2"><span className="font-bold text-rose-400">Nickname</span><span className="font-black text-rose-900">{safeUser.idol?.nickname || ''}</span></div>
                                      <div className="flex justify-between border-b border-rose-200/50 pb-2"><span className="font-bold text-rose-400">Birthday</span><span className="font-black text-rose-900">{safeUser.idol?.birthday || ''}</span></div>
                                      <div className="flex justify-between border-b border-rose-200/50 pb-2"><span className="font-bold text-rose-400">Age</span><span className="font-black text-rose-900">{safeUser.idol?.age || ''}</span></div>
                                      <div className="flex justify-between border-b border-rose-200/50 pb-2"><span className="font-bold text-rose-400">Specialty</span><span className="font-black text-rose-900">{safeUser.idol?.specialty || ''}</span></div>
                                      <div className="flex justify-between pb-2"><span className="font-bold text-rose-400">Hobbies</span><span className="font-black text-rose-900 text-right">{safeUser.idol?.hobbies || ''}</span></div>
                                  </div>
                              </div>

                              <div className="md:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-200/60">
                                  <h3 className="text-xl font-black text-zinc-900 mb-6 flex items-center gap-2"><Heart size={20} className="text-rose-500 fill-rose-500"/> Favorites</h3>
                                  <div className="grid grid-cols-2 gap-6">
                                      <div><h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Colors</h4><div className="flex flex-wrap gap-2">{(safeUser.idol?.favorites?.colors || []).map(c=><span key={c} className="px-3 py-1 bg-zinc-50 rounded-lg text-xs font-bold text-zinc-700">{c}</span>)}</div></div>
                                      <div><h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Foods</h4><div className="flex flex-wrap gap-2">{(safeUser.idol?.favorites?.foods || []).map(c=><span key={c} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-bold">{c}</span>)}</div></div>
                                      <div><h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Games</h4><div className="flex flex-wrap gap-2">{(safeUser.idol?.favorites?.games || []).map(c=><span key={c} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold">{c}</span>)}</div></div>
                                      <div><h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Music</h4><div className="flex flex-wrap gap-2">{(safeUser.idol?.favorites?.music || []).map(c=><span key={c} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold">{c}</span>)}</div></div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  )}

                  {/* ⭐️ 새로 추가된 탭들: QnA, Hobby, Vision, Quotes */}
                  
                  {/* QnA Tab */}
                  {activeTab === 'qna' && availableTabs.some(t => t.id === 'qna') && (
                      <div className="space-y-6">
                          <h3 className="text-2xl font-black text-violet-900 flex items-center gap-2"><MessageSquare size={24} className="text-violet-500"/> 100문 100답</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {(safeUser.qna || []).map((item, idx) => (
                                  <div key={idx} className="p-6 bg-violet-50/50 rounded-3xl relative overflow-hidden group border border-violet-100">
                                      <div className="absolute -right-4 -top-6 text-9xl font-black text-white/50 select-none group-hover:scale-110 transition-transform duration-500">Q</div>
                                      <h4 className="text-base md:text-lg font-black text-violet-700 relative z-10 mb-3 leading-snug">{item.q}</h4>
                                      <p className="text-sm font-medium text-zinc-700 relative z-10 leading-relaxed bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-white">{item.a}</p>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

                  {/* Hobby Tab */}
                  {activeTab === 'hobby' && availableTabs.some(t => t.id === 'hobby') && (
                      <div className="bg-white rounded-[2.5rem] shadow-sm border border-amber-100/60 overflow-hidden flex flex-col md:flex-row group">
                          <div className="md:w-1/2 h-72 md:h-auto relative overflow-hidden">
                              <img src={safeUser.hobby?.image || 'https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?q=80&w=1000'} alt="Hobby" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                              <h3 className="absolute bottom-8 left-8 text-3xl font-black text-white drop-shadow-md leading-tight">{safeUser.hobby?.title || '취미'}</h3>
                          </div>
                          <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-gradient-to-br from-amber-50/30 to-orange-50/30">
                              <Quote size={48} className="text-amber-300 mb-6 transform rotate-180" />
                              <p className="text-base text-zinc-700 leading-relaxed font-medium mb-8">
                                  {safeUser.hobby?.description || '취미 설명이 없습니다.'}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                  {(safeUser.hobby?.keywords || []).map(kw => <span key={kw} className="px-4 py-2 bg-white text-amber-700 text-xs font-black rounded-xl border border-amber-200 shadow-sm">#{kw}</span>)}
                              </div>
                          </div>
                      </div>
                  )}

                  {/* Vision Tab */}
                  {activeTab === 'vision' && availableTabs.some(t => t.id === 'vision') && renderVisionPreview()}

                  {/* Quotes Tab */}
                  {activeTab === 'quotes' && availableTabs.some(t => t.id === 'quotes') && (
                      <div className="space-y-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                              {(safeUser.quotes || []).map((q, idx) => (
                                  <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-between hover:-translate-y-1 hover:shadow-md transition-all">
                                      <Quote size={20} className="text-slate-300 mb-3" />
                                      <p className="text-sm font-bold text-slate-700 leading-relaxed mb-4">"{q.text}"</p>
                                      <p className="text-[10px] font-black text-slate-400 text-right uppercase tracking-widest">- {q.author}</p>
                                  </div>
                              ))}
                          </div>
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