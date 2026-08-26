import React, { useState, useEffect, useMemo } from 'react';
import { 
  Code, Briefcase, Link, Edit2, Rocket, User, Sparkles, MapPin, 
  Target, Quote, Palette, Compass, Share2, ChevronRight, GraduationCap,
  MessageCircle, Globe, Tv, PlayCircle, Camera, Hash, Users, Loader2, 
  UserPlus, History, X as CloseIcon, CreditCard, Mail, Phone, FileText, Grid, MessageSquare, Terminal, Lock, Copy
} from 'lucide-react';
import { useAppStore } from '../store/AppStore';

import BusinessCard from '../components/profile/tabs/BusinessCard';
import Mandalart from '../components/profile/tabs/Mandalart';
import { DeveloperTab, CareerTab, AddProfileTab, QnaTab, HobbyTab, QuotesTab, MemoTab, ArtTab } from '../components/profile/ViewTabs';

// ⭐️ 멀티 페르소나 설정 (인덱스 스티커 색상 및 필터링 정보)
const PERSONAS = {
  all: { id: 'all', name: '✨ 전체', desc: '모든 프로필 보기', tabs: null, color: 'bg-zinc-100 text-zinc-600', activeColor: 'bg-zinc-800 text-white border-zinc-800' },
  portfolio: { id: 'portfolio', name: '💼 포트폴리오', desc: '기업/공적 프로필', tabs: ['developer', 'career', 'businessCard'], color: 'bg-blue-50 text-blue-600', activeColor: 'bg-blue-500 text-white border-blue-500' },
  social: { id: 'social', name: '🍻 친목', desc: '친구/네트워킹용', tabs: ['addProfile', 'qna', 'hobby', 'art', 'memo'], color: 'bg-amber-50 text-amber-600', activeColor: 'bg-amber-500 text-white border-amber-500' },
  dating: { id: 'dating', name: '💖 이성', desc: '이성 어필용 감성 프로필', tabs: ['addProfile', 'vision', 'qna', 'hobby'], color: 'bg-rose-50 text-rose-600', activeColor: 'bg-rose-500 text-white border-rose-500' },
  fan: { id: 'fan', name: '🎨 덕질', desc: '취미/크리에이터용', tabs: ['hobby', 'art', 'memo', 'quotes', 'qna'], color: 'bg-purple-50 text-purple-600', activeColor: 'bg-purple-500 text-white border-purple-500' }
};

const ProfileView = () => {
  const { setViewMode, user, showToast, isAdmin, setLoginModalOpen, isGuestMode, isLoading } = useAppStore();
  const [activeTab, setActiveTab] = useState('developer'); 
  const [viewHistoryItem, setViewHistoryItem] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  
  // ⭐️ 현재 선택된 인덱스 탭 상태 (URL의 파라미터를 읽어와 초기값 설정)
  const [currentPersona, setCurrentPersona] = useState('all');

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('p');
    if (p && PERSONAS[p]) setCurrentPersona(p);
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-[70vh] flex flex-col items-center justify-center bg-[#F8FAFC]">
        <Loader2 size={40} className="text-indigo-500 animate-spin mb-4" />
        <h2 className="text-lg font-black text-zinc-800 tracking-tight">데이터를 불러오는 중입니다...</h2>
        <p className="text-sm text-zinc-500 font-medium mt-2">잠시만 기다려주세요</p>
      </div>
    );
  }

  const isGuest = !isAdmin || isGuestMode;

  const handleCopyLink = (personaId) => {
    const baseUrl = `${window.location.origin}${window.location.pathname}?u=${user?.handle || ''}`;
    const finalUrl = personaId && personaId !== 'all' ? `${baseUrl}&p=${personaId}` : baseUrl;
    
    navigator.clipboard.writeText(finalUrl).then(() => {
      showToast(`${PERSONAS[personaId || 'all'].name} 링크가 복사되었습니다! 🔗`);
      setShowShareModal(false);
    }).catch(err => {
      showToast("링크 복사에 실패했습니다.");
    });
  };

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
    if (!parsedUser.qna || parsedUser.qna.length === 0) {
        if (parsedUser.addProfile?.qna?.length > 0) parsedUser.qna = parsedUser.addProfile.qna;
    }
    if (parsedUser.addProfile?.memoArea?.dots) {
        parsedUser.addProfile.memoArea.dots = parsedUser.addProfile.memoArea.dots.map(d => d === true ? '#ec4899' : (d === false ? "" : d));
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

  // ⭐️ 선택된 스티커 탭(currentPersona)에 맞춰 렌더링될 데이터 탭 필터링
  const activePersonaObj = PERSONAS[currentPersona];
  const availableTabs = currentOrder
    .map(id => allTabsMap[id])
    .filter(tab => {
        if (!tab) return false;
        if (isGuest && isTabPrivate(tab.id)) return false; 
        
        // 'all(전체)' 모드가 아니고, 현재 페르소나에 포함되지 않은 탭이면 숨김
        if (currentPersona !== 'all' && activePersonaObj.tabs && !activePersonaObj.tabs.includes(tab.id)) {
            return false;
        }
        return true; 
    });

  useEffect(() => {
    // 탭이 바뀌었을 때 현재 보고 있는 탭이 사라지면 첫 번째 탭으로 이동
    if (!availableTabs.some(t => t.id === activeTab)) {
      setActiveTab(availableTabs.length > 0 ? availableTabs[0].id : null);
    }
  }, [currentPersona, availableTabs, activeTab]);

  return (
    <div className="max-w-[1000px] mx-auto w-full pb-10 relative animate-in fade-in duration-300 px-4 md:px-8 pt-6 md:pt-10 flex flex-col min-h-screen">
      
      {/* 공유 모달 */}
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
                <div className="p-4 space-y-2">
                    {Object.values(PERSONAS).map(persona => (
                        <button key={persona.id} onClick={() => handleCopyLink(persona.id)} className="w-full flex items-center justify-between p-4 rounded-2xl border border-zinc-100 hover:border-violet-300 hover:bg-violet-50/50 transition-all text-left group">
                            <div>
                                <p className="text-sm font-black text-zinc-900 mb-0.5">{persona.name}</p>
                                <p className="text-[10px] font-bold text-zinc-500">{persona.desc}</p>
                            </div>
                            <Copy size={16} className="text-zinc-300 group-hover:text-violet-500 transition-colors" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* 과거 기록 열람 모달 (유지) */}
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
                      {/* 모달 내용 축약 (기존과 동일) */}
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

      {showHistoryModal && (
          <div className="fixed inset-0 z-[300] bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-in fade-in" onClick={() => setShowHistoryModal(false)}>
              <div className="bg-[#F8FAFC] rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
                  <div className="p-6 bg-white border-b border-zinc-200 flex justify-between items-center shrink-0">
                      <div><h3 className="text-lg font-black text-zinc-900 flex items-center gap-2"><History className="text-indigo-500"/> Profile Commit History</h3></div>
                      <button onClick={() => setShowHistoryModal(false)} className="p-2 bg-zinc-50 hover:bg-zinc-100 rounded-full text-zinc-500 transition-colors"><CloseIcon size={20}/></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-hide">
                      <div className="relative border-l-2 border-indigo-100 ml-4 space-y-8 pb-10">
                          {(safeUser.addProfile?.history || []).map((h, i) => (
                              <div key={h.id || i} className="relative pl-8 group cursor-pointer" onClick={() => setViewHistoryItem(h)}>
                                  <div className="absolute w-4 h-4 bg-white border-[4px] border-indigo-500 rounded-full -left-[9px] top-1 shadow-sm group-hover:scale-125 transition-transform" />
                                  <div className="mb-3 flex items-center gap-2"><span className="text-[11px] font-black text-white bg-indigo-500 px-2.5 py-1 rounded-md shadow-sm tracking-widest">{h.date}</span></div>
                                  <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm"><p className="text-xs font-black text-zinc-800">기록 확인하기</p></div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* ⭐️ 추가됨: 다이어리 인덱스 스티커 탭 영역 */}
      {!isProfileEmpty && (
        <div className="flex px-4 md:px-8 gap-1.5 md:gap-2 mb-[-12px] relative z-10 overflow-x-auto scrollbar-hide pt-2 items-end">
          {Object.values(PERSONAS).map(p => {
            const isActive = currentPersona === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setCurrentPersona(p.id)}
                className={`shrink-0 px-4 md:px-6 py-2.5 rounded-t-2xl text-[11px] md:text-[13px] font-black transition-all duration-300 border border-b-0 
                  ${isActive 
                    ? `${p.activeColor} pb-6 pt-3.5 -mt-2 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-20` // 활성화 시 위로 길게 튀어나오고 덮음
                    : `${p.color} border-zinc-200/80 pb-4 opacity-70 hover:opacity-100 hover:bg-white z-10 hover:pb-5 hover:-mt-1`}
                `}
              >
                {p.name}
              </button>
            )
          })}
        </div>
      )}

      <div className="flex-1">
          {/* 메인 프로필 카드 (z-index를 30으로 주어 인덱스 탭 아랫부분을 덮음) */}
          <div className="bg-white rounded-3xl p-5 md:p-10 shadow-sm relative z-30 border border-zinc-200/80">
            <div className="flex justify-between items-start mb-3 md:mb-4 w-full">
              <div className="flex-1 pr-4">
                {!isProfileEmpty && safeUser.status && (
                  <div className="inline-flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 text-zinc-800 px-3 py-1 md:py-1.5 rounded-2xl shadow-sm">
                      <Sparkles size={13} className="text-yellow-500" />
                      <span className="text-[10px] md:text-[11px] font-bold tracking-wider">{safeUser.status}</span>
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
              <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-stretch mt-1 md:mt-0">
                <div className="flex-1 flex flex-col min-w-0 md:pr-4"> 
                  <div className="flex flex-row gap-5 md:gap-8 items-center md:items-start">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 shrink-0 bg-zinc-50 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border border-zinc-200 shadow-inner">
                      {safeUser.profileImageUrl ? (
                          <img src={safeUser.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl md:text-5xl font-black text-zinc-300">
                            {safeUser.name ? safeUser.name.charAt(0) : '?'}
                          </div>
                      )}
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center min-w-0 md:pt-2">
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
                    <div className="mt-5 flex flex-wrap gap-2">
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

                <div className="hidden md:block w-px bg-zinc-100 my-2 mx-4"></div>

                <div className="flex-1 flex flex-col justify-center md:pl-6 mt-3 md:mt-0">
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
              <div className="mt-8 md:mt-12">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-base md:text-lg font-black text-zinc-900 tracking-tight">데이터 탐색</h3>
                  <ChevronRight size={18} className="text-zinc-400 md:hidden"/>
                </div>
                <p className="text-[11px] md:text-xs text-zinc-500 font-medium mb-3">
                  선택한 페르소나 <strong className="text-indigo-500">({PERSONAS[currentPersona].name})</strong> 에 맞는 데이터만 필터링되어 보입니다.
                </p>
                
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

              {availableTabs.length === 0 && isGuest ? (
                  <div className="mt-4 md:mt-6 p-10 flex flex-col items-center justify-center bg-white rounded-3xl shadow-sm border border-zinc-100">
                      <div className="w-16 h-16 bg-zinc-50 flex items-center justify-center rounded-full mb-4 shadow-inner"><Lock size={24} className="text-zinc-400" /></div>
                      <h3 className="text-base md:text-lg font-black text-zinc-800">비공개 프로필</h3>
                      <p className="text-xs md:text-sm font-medium text-zinc-500 mt-2">이 링크에서는 세부 정보가 숨겨져 있습니다.</p>
                  </div>
              ) : (
                  <div className="mt-4 md:mt-6 pb-10">
                      {activeTab === 'developer' && availableTabs.some(t => t.id === 'developer') && <DeveloperTab data={safeUser.developer} />}
                      {activeTab === 'career' && availableTabs.some(t => t.id === 'career') && <CareerTab data={safeUser.career} />}
                      {activeTab === 'addProfile' && availableTabs.some(t => t.id === 'addProfile') && <AddProfileTab data={safeUser.addProfile} setShowHistoryModal={setShowHistoryModal} />}
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