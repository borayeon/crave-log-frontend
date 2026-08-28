import React, { useState, useEffect, useMemo } from 'react';
import { 
  Edit2, Share2, Rocket, User, Sparkles, MapPin, GraduationCap, 
  ChevronRight, Loader2, History, X as CloseIcon, Lock, Copy, Heart,
  Link, Terminal, PlayCircle, Camera, Hash, Users, Tv, MessageCircle, Globe,
  Code, Briefcase, UserPlus, CreditCard, MessageSquare, Palette, Compass, Quote, FileText, Grid
} from 'lucide-react';

import { useAppStore } from '../store/AppStore';

import BusinessCard from '../components/profile/tabs/BusinessCard';
import Mandalart from '../components/profile/tabs/Mandalart';
import { 
  DeveloperTab, CareerTab, AddProfileTab, QnaTab, HobbyTab, 
  QuotesTab, MemoTab, ArtTab 
} from '../components/profile/ViewTabs';

const LOADING_TIPS = [
  "CraveLog에서는 목적에 따라 나만의 멀티 페르소나를 구성할 수 있어요.",
  "비공개로 설정한 페르소나도 '시크릿 링크'를 통해 특정인에게만 공유할 수 있어요.",
  "서버 원천 차단(Level 3) 기술이 적용되어, 허락되지 않은 방문자는 민감한 데이터를 절대 볼 수 없습니다. 🛡️"
];

const DEFAULT_PERSONAS = {
  portfolio: { id: 'portfolio', name: '💼 포트폴리오', desc: '기업/공적 프로필', tabs: ['developer', 'career', 'businessCard'], color: 'bg-blue-50 text-blue-600', activeColor: 'bg-blue-500 text-white border-blue-500', isVisible: true },
  social: { id: 'social', name: '🍻 친목', desc: '친구/네트워킹용', tabs: ['addProfile', 'qna', 'hobby', 'art', 'memo'], color: 'bg-amber-50 text-amber-600', activeColor: 'bg-amber-500 text-white border-amber-500', isVisible: true },
  dating: { id: 'dating', name: '💖 이성', desc: '이성 어필용 감성 프로필', tabs: ['addProfile', 'vision', 'qna', 'hobby'], color: 'bg-rose-50 text-rose-600', activeColor: 'bg-rose-500 text-white border-rose-500', isVisible: true },
  fan: { id: 'fan', name: '🎨 덕질', desc: '취미/크리에이터용', tabs: ['hobby', 'art', 'memo', 'quotes', 'qna'], color: 'bg-purple-50 text-purple-600', activeColor: 'bg-purple-500 text-white border-purple-500', isVisible: true },
  custom: { id: 'custom', name: '🛠️ 커스텀 페르소나', desc: '원하는 탭만 골라 만드는 커스텀 뷰', tabs: [], color: 'bg-teal-50 text-teal-600', activeColor: 'bg-teal-500 text-white border-teal-500', isVisible: true }
};

const ProfileView = () => {
  const { setViewMode, user, showToast, isAdmin, setLoginModalOpen, isGuestMode, isLoading } = useAppStore();
  const [activeTab, setActiveTab] = useState(null); 
  const [viewHistoryItem, setViewHistoryItem] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  
  const [currentPersona, setCurrentPersona] = useState('all');

  const randomTip = useMemo(() => LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)], []);

  const safeUser = useMemo(() => {
    if (!user) return {};
    const parsedUser = JSON.parse(JSON.stringify(user));
    
    const jsonFields = ['developer', 'career', 'addProfile', 'businessCard', 'hobby', 'vision', 'quotes', 'qna', 'tags', 'goals', 'links'];
    
    jsonFields.forEach(field => {
      if (typeof parsedUser[field] === 'string') {
        try { parsedUser[field] = JSON.parse(parsedUser[field]); } 
        catch (e) { parsedUser[field] = null; }
      }
    });

    if (parsedUser.idol && !parsedUser.addProfile) parsedUser.addProfile = parsedUser.idol;
    if (parsedUser.addProfile?.qna?.length > 0 && (!parsedUser.qna || parsedUser.qna.length === 0)) {
        parsedUser.qna = parsedUser.addProfile.qna;
    }
    if (parsedUser.addProfile?.memoArea?.dots) {
        parsedUser.addProfile.memoArea.dots = parsedUser.addProfile.memoArea.dots.map(d => d === true ? '#ec4899' : (d === false ? "" : d));
    }
    return parsedUser;
  }, [user]);

  const CUSTOM_PERSONAS = useMemo(() => {
    const p = safeUser.addProfile?.personas || DEFAULT_PERSONAS;
    return {
      all: { id: 'all', name: '✨ 전체', desc: '모든 프로필 보기', tabs: null, color: 'bg-zinc-100 text-zinc-600', activeColor: 'bg-zinc-800 text-white border-zinc-800', isVisible: true },
      ...p
    };
  }, [safeUser.addProfile?.personas]);

  const visiblePersonas = Object.values(CUSTOM_PERSONAS).filter(p => p.id === 'all' || p.isVisible !== false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get('p') || params.get('token'); 
    if (p && CUSTOM_PERSONAS[p]) {
        setCurrentPersona(p);
    }
  }, [CUSTOM_PERSONAS]);

  // ⭐️ 페르소나 순서(personaOrder)를 적용하여 정렬
  const personaOrder = safeUser.addProfile?.personaOrder || ['all', ...Object.keys(DEFAULT_PERSONAS)];
  const displayPersonas = useMemo(() => {
    const list = [...visiblePersonas];
    if (currentPersona !== 'all' && CUSTOM_PERSONAS[currentPersona]?.isVisible === false) {
        if (!list.find(p => p.id === currentPersona)) {
            list.push(CUSTOM_PERSONAS[currentPersona]);
        }
    }
    // 사용자가 설정한 순서대로 정렬
    list.sort((a, b) => {
        const idxA = personaOrder.indexOf(a.id);
        const idxB = personaOrder.indexOf(b.id);
        return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
    });
    return list;
  }, [visiblePersonas, currentPersona, CUSTOM_PERSONAS, personaOrder]);

  if (isLoading) {
    return (
      <div className="w-full h-[80vh] flex flex-col items-center justify-center bg-[#F8FAFC] px-6 animate-in fade-in duration-500">
        <div className="relative flex items-center justify-center mb-8">
           <div className="absolute inset-0 bg-indigo-200/50 rounded-full blur-2xl animate-pulse"></div>
           <Loader2 size={40} className="text-indigo-500 animate-spin relative z-10" />
        </div>
        <h2 className="text-xl md:text-2xl font-black text-zinc-800 tracking-tight mb-8">데이터를 불러오는 중입니다</h2>
        <div className="bg-white/80 backdrop-blur-sm px-6 py-5 rounded-2xl border border-zinc-200/80 shadow-sm max-w-md w-full text-center relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80"></div>
           <div className="flex justify-center mb-2">
              <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg">CraveLog Tips</span>
           </div>
           <p className="text-[13px] text-zinc-600 font-bold leading-relaxed">{randomTip}</p>
        </div>
      </div>
    );
  }

  const isGuest = !isAdmin || isGuestMode;

  const handleCopyLink = (personaId) => {
    const baseUrl = `${window.location.origin}${window.location.pathname}?u=${user?.handle || ''}`;
    
    if (!personaId || personaId === 'all') {
        navigator.clipboard.writeText(baseUrl).then(() => {
          showToast("기본 프로필 링크가 복사되었습니다! 🔗");
          setShowShareModal(false);
        });
        return;
    }

    const persona = CUSTOM_PERSONAS[personaId];
    if (!persona) return;

    let token = persona.token;
    if (!token) {
        token = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
        persona.token = token; 
    }

    const finalUrl = `${baseUrl}&p=${personaId}`; 
    
    navigator.clipboard.writeText(finalUrl).then(() => {
      showToast(`${persona.name} 시크릿 링크가 복사되었습니다! 🔒`);
      setShowShareModal(false);
    }).catch(err => {
      showToast("링크 복사에 실패했습니다.");
    });
  };

  const shareablePersonas = !isGuest ? Object.values(CUSTOM_PERSONAS) : visiblePersonas;
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
    addProfile: { id: 'addProfile', icon: <UserPlus strokeWidth={2}/>, label: 'Add Profile', color: 'bg-rose-50/80 text-rose-500 border-rose-100' },
    businessCard: { id: 'businessCard', icon: <CreditCard strokeWidth={2}/>, label: 'Business Card', color: 'bg-emerald-50/80 text-emerald-500 border-emerald-100' },
    qna: { id: 'qna', icon: <MessageSquare strokeWidth={2}/>, label: 'Q&A', color: 'bg-violet-50/80 text-violet-500 border-violet-100' },
    hobby: { id: 'hobby', icon: <Palette strokeWidth={2}/>, label: 'Hobby', color: 'bg-amber-50/80 text-amber-500 border-amber-100' },
    vision: { id: 'vision', icon: <Compass strokeWidth={2}/>, label: 'Vision', color: 'bg-violet-50/80 text-violet-500 border-violet-100' },
    quotes: { id: 'quotes', icon: <Quote strokeWidth={2}/>, label: 'Quotes', color: 'bg-slate-100/80 text-slate-500 border-slate-200' },
    memo: { id: 'memo', icon: <FileText strokeWidth={2}/>, label: 'Memo', color: 'bg-amber-50/80 text-amber-500 border-amber-100' },
    art: { id: 'art', icon: <Grid strokeWidth={2}/>, label: 'Dot Art', color: 'bg-pink-50/80 text-pink-500 border-pink-100' }
  };

  const privacyObj = useMemo(() => {
      let p = { developer: false, career: false, addProfile: false, businessCard: false, qna: false, hobby: false, vision: false, quotes: false, memo: false, art: false };
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

  const defaultOrder = ['developer', 'career', 'addProfile', 'businessCard', 'qna', 'hobby', 'vision', 'quotes', 'memo', 'art'];
  const savedOrder = safeUser.addProfile?.tabOrder || [];
  const currentOrder = [...new Set([...savedOrder, ...defaultOrder])].filter(id => allTabsMap[id]);

  const activePersonaObj = CUSTOM_PERSONAS[currentPersona] || CUSTOM_PERSONAS['all'];

  const isDataActuallyEmpty = (tabId) => {
    switch(tabId) {
      case 'developer': return !safeUser.developer || (!safeUser.developer.about && (!safeUser.developer.projects || safeUser.developer.projects.length === 0));
      case 'career': return !safeUser.career || (!safeUser.career.targetJob && (!safeUser.career.strengths || safeUser.career.strengths.length === 0));
      case 'businessCard': return !safeUser.addProfile?.businessCard || !safeUser.addProfile.businessCard.email;
      case 'qna': return !safeUser.addProfile?.qna || safeUser.addProfile.qna.length === 0;
      case 'hobby': return !safeUser.addProfile?.hobby || !safeUser.addProfile.hobby.title;
      case 'vision': return !safeUser.addProfile?.vision || !safeUser.addProfile.vision.core;
      case 'quotes': return !safeUser.addProfile?.quotes || safeUser.addProfile.quotes.length === 0;
      case 'memo': return !safeUser.addProfile?.memoArea || !safeUser.addProfile.memoArea.text;
      case 'art': return !safeUser.addProfile?.memoArea?.dots || safeUser.addProfile.memoArea.dots.every(d => d === "");
      case 'addProfile': return !safeUser.addProfile || (!safeUser.addProfile.mbti && !safeUser.addProfile.motto);
      default: return false;
    }
  };
  
  const availableTabs = currentOrder
    .map(id => allTabsMap[id])
    .filter(tab => {
        if (!tab) return false;
        if (currentPersona !== 'all' && activePersonaObj.tabs && !activePersonaObj.tabs.includes(tab.id)) return false;
        if (isGuest && currentPersona === 'all' && isTabPrivate(tab.id)) return false;
        if (isDataActuallyEmpty(tab.id)) return false; 
        return true; 
    });

  useEffect(() => {
    if (!availableTabs.some(t => t.id === activeTab)) {
      setActiveTab(availableTabs.length > 0 ? availableTabs[0].id : null);
    }
  }, [availableTabs, activeTab]);

  return (
    <div className="max-w-[1000px] mx-auto w-full pb-10 relative animate-in fade-in duration-300 px-4 md:px-8 pt-6 md:pt-10 flex flex-col min-h-screen">
      
      {showShareModal && (
        <div className="fixed inset-0 z-[400] bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowShareModal(false)}>
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-black text-zinc-900 flex items-center gap-2"><Share2 className="text-violet-500" size={18}/> 프로필 공유하기</h3>
                        <p className="text-xs text-zinc-500 font-bold mt-1">상황에 맞게 보여줄 탭을 필터링하여 공유하세요.</p>
                    </div>
                    <button onClick={() => setShowShareModal(false)} className="p-2 bg-zinc-50 hover:bg-zinc-100 rounded-full text-zinc-500 transition-colors"><CloseIcon size={18}/></button>
                </div>
                
                <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
                    <button onClick={() => handleCopyLink(null)} className="w-full flex items-center justify-between p-4 rounded-2xl border border-zinc-200 hover:border-zinc-400 hover:shadow-sm bg-white transition-all text-left group">
                        <div>
                            <p className="text-sm font-black text-zinc-900 mb-0.5">🌐 기본 프로필 (전체 탭)</p>
                            <p className="text-[10px] font-bold text-zinc-500">비공개 처리된 탭을 제외한 모든 탭을 공유합니다.</p>
                        </div>
                        <Copy size={16} className="text-zinc-300 group-hover:text-zinc-600 transition-colors" />
                    </button>
                    <div className="h-px bg-zinc-100 my-2 mx-2"></div>
                    {shareablePersonas.map(persona => {
                        if (persona.id === 'all') return null;
                        const isSecret = persona.isVisible === false;
                        return (
                          <button key={persona.id} onClick={() => handleCopyLink(persona.id)} className="w-full flex items-center justify-between p-4 rounded-2xl border border-zinc-100 hover:border-violet-300 hover:bg-violet-50/50 transition-all text-left group">
                              <div>
                                  <p className="text-sm font-black text-zinc-900 mb-0.5 flex items-center gap-1.5">
                                      {isSecret && <Lock size={12} className="text-rose-500" title="비공개 시크릿 링크" />}
                                      {persona.name}
                                  </p>
                                  <p className="text-[10px] font-bold text-zinc-500">
                                      {isSecret ? <span className="text-rose-500 font-black">[시크릿 링크]</span> : ''} {persona.desc}
                                  </p>
                              </div>
                              <Copy size={16} className="text-zinc-300 group-hover:text-violet-500 transition-colors" />
                          </button>
                        );
                    })}
                </div>
            </div>
        </div>
      )}

      {viewHistoryItem && (
          <div className="fixed inset-0 z-[300] bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-in fade-in" onClick={() => setViewHistoryItem(null)}>
              <div className="bg-[#F8FAFC] rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
                  <div className="p-5 bg-white border-b border-zinc-200 flex justify-between items-center shrink-0">
                      <div>
                          <h3 className="text-base font-black text-zinc-900 flex items-center gap-2"><History className="text-indigo-500" size={18}/> {viewHistoryItem.date} 과거 기록</h3>
                      </div>
                      <button onClick={() => setViewHistoryItem(null)} className="p-2 bg-zinc-50 hover:bg-zinc-100 rounded-full text-zinc-500 transition-colors"><CloseIcon size={18}/></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                      <div><h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><UserPlus size={12}/> Identity & Info</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                             <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm"><span className="block text-[9px] text-zinc-400 font-bold mb-1">MBTI</span><span className="text-xs font-black text-zinc-800">{viewHistoryItem.snapshot?.mbti || '-'}</span></div>
                             <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm"><span className="block text-[9px] text-zinc-400 font-bold mb-1">Blood Type</span><span className="text-xs font-black text-zinc-800">{viewHistoryItem.snapshot?.bloodType || '-'}</span></div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {!isProfileEmpty && (
        <div className="flex px-4 md:px-8 gap-1.5 md:gap-2 mb-[-12px] relative z-10 overflow-x-auto scrollbar-hide pt-2 items-end">
          {displayPersonas.map(p => {
            const isActive = currentPersona === p.id;
            const isSecret = p.isVisible === false;

            return (
              <button
                key={p.id}
                onClick={() => setCurrentPersona(p.id)}
                className={`shrink-0 px-4 md:px-6 py-2.5 rounded-t-2xl text-[11px] md:text-[13px] font-black transition-all duration-300 border border-b-0 flex items-center gap-1.5
                  ${isActive 
                    ? `${p.activeColor || 'bg-indigo-500 text-white border-indigo-500'} pb-6 pt-3.5 -mt-2 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-20`
                    : `${p.color || 'bg-zinc-50 text-zinc-500'} border-zinc-200/80 pb-4 opacity-70 hover:opacity-100 hover:bg-white z-10 hover:pb-5 hover:-mt-1`}
                `}
              >
                {isSecret && <Lock size={12} className={isActive ? "text-white/80" : "text-rose-400"} />}
                {p.name}
              </button>
            )
          })}
        </div>
      )}

      <div className="flex-1">
          {/* ⭐️ 프로필 카드 패딩 및 여백 축소 (p-5 md:p-10 -> p-5 md:p-7) */}
          <div className="bg-white rounded-3xl p-5 md:p-7 shadow-sm relative z-30 border border-zinc-200/80">
            <div className="flex justify-between items-start mb-3 md:mb-4 w-full">
              <div className="flex-1 pr-4 flex gap-2 items-center flex-wrap">
                {!isProfileEmpty && safeUser.status && (
                  <div className="inline-flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 text-zinc-800 px-3 py-1 md:py-1.5 rounded-2xl shadow-sm">
                      <Sparkles size={13} className="text-yellow-500" />
                      <span className="text-[10px] md:text-[11px] font-bold tracking-wider">{safeUser.status}</span>
                  </div>
                )}
                
                {isGuest && currentPersona !== 'all' && (
                  <div className="inline-flex items-center gap-1.5 bg-violet-50 text-violet-700 border border-violet-200 px-3 py-1 md:py-1.5 rounded-2xl shadow-sm">
                      <span className="text-[10px] md:text-[11px] font-black tracking-widest uppercase">
                          {CUSTOM_PERSONAS[currentPersona]?.isVisible === false && <Lock size={10} className="inline mr-1 -mt-0.5" />}
                          {CUSTOM_PERSONAS[currentPersona]?.name} 뷰 접속중
                      </span>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-1.5 shrink-0">
                {!isProfileEmpty && (
                  <button onClick={() => setShowShareModal(true)} className="w-7 h-7 md:w-8 md:h-8 bg-white hover:bg-zinc-50 text-zinc-600 rounded-full flex items-center justify-center transition shadow-sm border border-zinc-200" title="공유">
                      <Share2 size={13} />
                  </button>
                )}
                {isAdmin && !isGuestMode ? (
                  <button onClick={() => setViewMode('edit_profile')} className="w-7 h-7 md:w-8 md:h-8 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full flex items-center justify-center transition shadow-sm" title="프로필 설정">
                    <Edit2 size={13} />
                  </button>
                ) : !isAdmin ? (
                   <button onClick={() => setLoginModalOpen(true)} className="px-3 h-7 md:h-8 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full text-[10px] md:text-[11px] font-bold transition flex items-center gap-1.5 shadow-sm">
                    <Rocket size={11} /> 시작하기
                  </button>
                ) : null}
              </div>
            </div>

            {isProfileEmpty && !isAdmin ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-zinc-50 text-zinc-300 rounded-full flex items-center justify-center mb-4 shadow-inner"><User size={32}/></div>
                <h3 className="text-lg md:text-xl font-black text-zinc-900 mb-2">설정된 프로필이 없습니다</h3>
                <p className="text-xs md:text-sm font-medium text-zinc-500">가입하고 나만의 명함을 만들어보세요.</p>
              </div>
            ) : (
              // ⭐️ 좌우 영역 사이의 gap 축소
              <div className="flex flex-col md:flex-row gap-5 md:gap-7 items-stretch mt-1 md:mt-0">
                <div className="flex-1 flex flex-col min-w-0 md:pr-2"> 
                  <div className="flex flex-row gap-4 md:gap-6 items-center md:items-start">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 shrink-0 bg-zinc-50 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border border-zinc-200 shadow-inner">
                      {safeUser.profileImageUrl ? (
                          <img src={safeUser.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl md:text-5xl font-black text-zinc-300">
                            {safeUser.name ? safeUser.name.charAt(0) : '?'}
                          </div>
                      )}
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center min-w-0 md:pt-1.5">
                      <h2 className="text-2xl md:text-3xl font-black text-zinc-900 mb-1 truncate">{safeUser.name || '이름 없음'}</h2>
                      <p className="text-[11px] md:text-sm font-bold text-violet-600 bg-violet-50 border border-violet-100 px-2 py-0.5 md:px-2.5 rounded-lg inline-block w-max mb-3 shadow-sm truncate">@{safeUser.handle || 'handle'}</p>
                      
                      <div className="space-y-1 md:space-y-1.5">
                        <div className="flex items-center gap-2 text-[11px] md:text-[13px] font-medium text-zinc-600 truncate">
                          <Briefcase size={12} className="text-zinc-400 shrink-0 md:w-3.5 md:h-3.5"/> {safeUser.role || '소속/직무 미입력'}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] md:text-[13px] font-medium text-zinc-600 truncate">
                          <GraduationCap size={12} className="text-zinc-400 shrink-0 md:w-3.5 md:h-3.5"/> {safeUser.major || '전공 미입력'}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] md:text-[13px] font-medium text-zinc-600 truncate">
                          <MapPin size={12} className="text-zinc-400 shrink-0 md:w-3.5 md:h-3.5"/> {safeUser.location || '지역 미입력'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {(safeUser.tags || []).length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {safeUser.tags.map(tag => (
                          <span key={tag} className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 text-zinc-600 text-[10px] md:text-xs font-bold rounded-lg cursor-default shadow-sm hover:border-zinc-300 transition-colors">#{tag}</span>
                        ))}
                    </div>
                  )}

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

                <div className="hidden md:block w-px bg-zinc-100 my-2 mx-2"></div>

                <div className="flex-1 flex flex-col justify-center md:pl-4 mt-3 md:mt-0">
                  <Quote size={24} className="text-violet-300 mb-2 md:mb-3"/>
                  <p className="text-[13px] md:text-[15px] text-zinc-800 font-bold leading-relaxed mb-2 whitespace-pre-line">
                    "{safeUser.bio || '나를 표현하는 한 줄 소개가 들어갑니다.'}"
                  </p>
                </div>
              </div>
            )}
          </div>

          {!isProfileEmpty && (
            <>
              <div className="mt-8 md:mt-10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base md:text-lg font-black text-zinc-900 tracking-tight">데이터 탐색</h3>
                  <ChevronRight size={18} className="text-zinc-400 md:hidden"/>
                </div>
                
                {/* ⭐️ 설명란 제거 (요청 3번 반영) */}
                
                <div className="flex md:flex-wrap md:justify-start gap-3 md:gap-4 overflow-x-auto md:overflow-visible scrollbar-hide pt-2 pb-6 -mx-4 px-4 md:mx-0 md:px-0">
                  {availableTabs.map(tab => {
                      const isActive = activeTab === tab.id;
                      
                      return (
                        <button 
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex flex-col items-center gap-1.5 md:gap-2 shrink-0 group outline-none`}
                        >
                          <div className={`w-16 h-16 md:w-[76px] md:h-[76px] rounded-2xl md:rounded-[1.5rem] flex items-center justify-center relative transition-all duration-300 border ${isActive ? `${tab.color} border-current shadow-md scale-105` : 'bg-white border-zinc-200 text-zinc-400 shadow-sm group-hover:scale-105 group-hover:border-zinc-300'}`}>
                            {React.cloneElement(tab.icon, { className: 'w-6 h-6 md:w-7 md:h-7 transition-colors' })}
                          </div>
                          <span className={`text-[10px] md:text-[11px] font-black transition-colors ${isActive ? 'text-zinc-900' : 'text-zinc-400 group-hover:text-zinc-600'}`}>{tab.label}</span>
                        </button>
                      );
                  })}
                </div>
              </div>

              {availableTabs.length === 0 ? (
                  <div className="mt-4 md:mt-6 p-10 flex flex-col items-center justify-center bg-white rounded-3xl shadow-sm border border-zinc-100">
                      <div className="w-16 h-16 bg-zinc-50 flex items-center justify-center rounded-full mb-4 shadow-inner"><Lock size={24} className="text-zinc-400" /></div>
                      <h3 className="text-base md:text-lg font-black text-zinc-800">접근할 수 있는 데이터가 없습니다</h3>
                      <p className="text-xs md:text-sm font-medium text-zinc-500 mt-2">비공개 처리되었거나 페르소나 설정에 의해 숨겨진 항목입니다.</p>
                  </div>
              ) : (
                  <div className="mt-2 pb-10">
                      {activeTab === 'developer' && availableTabs.some(t => t.id === 'developer') && <DeveloperTab data={safeUser.developer} />}
                      {activeTab === 'career' && availableTabs.some(t => t.id === 'career') && <CareerTab data={safeUser.career} />}
                      {activeTab === 'addProfile' && availableTabs.some(t => t.id === 'addProfile') && <AddProfileTab data={safeUser.addProfile} setShowHistoryModal={() => {}} />}
                      {activeTab === 'businessCard' && availableTabs.some(t => t.id === 'businessCard') && (
                          <div className="py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                              <BusinessCard data={safeUser.addProfile?.businessCard} userName={safeUser.name} />
                          </div>
                      )}
                      {activeTab === 'qna' && availableTabs.some(t => t.id === 'qna') && <QnaTab data={safeUser.addProfile?.qna} />}
                      {activeTab === 'hobby' && availableTabs.some(t => t.id === 'hobby') && <HobbyTab data={safeUser.addProfile?.hobby} />}
                      {activeTab === 'vision' && availableTabs.some(t => t.id === 'vision') && (
                          <div className="animate-in fade-in">
                              <Mandalart visionData={safeUser.addProfile?.vision} isEditMode={false} />
                          </div>
                      )}
                      {activeTab === 'quotes' && availableTabs.some(t => t.id === 'quotes') && <QuotesTab data={safeUser.addProfile?.quotes} />}
                      {activeTab === 'memo' && availableTabs.some(t => t.id === 'memo') && <MemoTab data={safeUser.addProfile?.memoArea} />}
                      {activeTab === 'art' && availableTabs.some(t => t.id === 'art') && <ArtTab data={safeUser.addProfile?.memoArea} />}
                  </div>
              )}
            </>
          )}
      </div>
    </div>
  );
};

export default ProfileView;