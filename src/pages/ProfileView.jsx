import React, { useState, useEffect, useMemo } from 'react';
import { 
  Code, Briefcase, Link, Edit2, Rocket, User, Sparkles, MapPin, 
  Target, Quote, Palette, Compass, Share2, ChevronRight, GraduationCap,
  MessageCircle, Globe, Tv, PlayCircle, Camera, Hash, Users, Loader2, 
  UserPlus, History, X as CloseIcon, CreditCard, Mail, Phone, FileText, Grid, MessageSquare, Terminal, Lock
} from 'lucide-react';
import { useAppStore } from '../store/AppStore';

import BusinessCard from '../components/profile/tabs/BusinessCard';
import Mandalart from '../components/profile/tabs/Mandalart';
import { DeveloperTab, CareerTab, AddProfileTab, QnaTab, HobbyTab, QuotesTab, MemoTab, ArtTab } from '../components/profile/ViewTabs';

const ProfileView = () => {
  const { setViewMode, user, showToast, isAdmin, setLoginModalOpen, isGuestMode, isLoading } = useAppStore();
  const [activeTab, setActiveTab] = useState('developer'); 
  const [showHistoryModal, setShowHistoryModal] = useState(false); 
  const [viewHistoryItem, setViewHistoryItem] = useState(null);

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
    
    const jsonFields = ['developer', 'career', 'addProfile', 'businessCard', 'hobby', 'vision', 'quotes', 'qna', 'tags', 'goals', 'links'];
    
    jsonFields.forEach(field => {
      if (typeof parsedUser[field] === 'string') {
        try { parsedUser[field] = JSON.parse(parsedUser[field]); } 
        catch (e) { parsedUser[field] = null; }
      }
    });

    if (parsedUser.idol && !parsedUser.addProfile) {
        parsedUser.addProfile = parsedUser.idol;
    }

    if (!parsedUser.qna || parsedUser.qna.length === 0) {
        if (parsedUser.addProfile?.qna?.length > 0) {
            parsedUser.qna = parsedUser.addProfile.qna;
        }
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

  const availableTabs = currentOrder
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

  return (
    <div className="max-w-[1000px] mx-auto w-full pb-10 relative animate-in fade-in duration-300 px-4 md:px-8 pt-6 md:pt-10 flex flex-col min-h-screen">
      
      {viewHistoryItem && (
          <div className="fixed inset-0 z-[300] bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-in fade-in" onClick={() => setViewHistoryItem(null)}>
              <div className="bg-[#F8FAFC] rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
                  <div className="p-5 bg-white border-b border-zinc-200 flex justify-between items-center shrink-0">
                      <div>
                          <h3 className="text-base font-black text-zinc-900 flex items-center gap-2"><History className="text-indigo-500" size={18}/> {viewHistoryItem.date} 과거 기록</h3>
                          <p className="text-[10px] text-zinc-500 font-bold mt-1">해당 날짜에 박제된 상세 프로필의 모든 내용입니다.</p>
                      </div>
                      <button onClick={() => setViewHistoryItem(null)} className="p-2 bg-zinc-50 hover:bg-zinc-100 rounded-full text-zinc-500 transition-colors"><CloseIcon size={18}/></button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                      <div>
                          <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><UserPlus size={12}/> Identity & Info</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                             <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm"><span className="block text-[9px] text-zinc-400 font-bold mb-1">MBTI</span><span className="text-xs font-black text-zinc-800">{viewHistoryItem.snapshot?.mbti || '-'}</span></div>
                             <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm"><span className="block text-[9px] text-zinc-400 font-bold mb-1">Blood Type</span><span className="text-xs font-black text-zinc-800">{viewHistoryItem.snapshot?.bloodType || '-'}</span></div>
                             <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm"><span className="block text-[9px] text-zinc-400 font-bold mb-1">Height</span><span className="text-xs font-black text-zinc-800">{viewHistoryItem.snapshot?.height || '-'}</span></div>
                             <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm"><span className="block text-[9px] text-zinc-400 font-bold mb-1">Religion</span><span className="text-xs font-black text-zinc-800">{viewHistoryItem.snapshot?.religion || '-'}</span></div>
                             <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm"><span className="block text-[9px] text-zinc-400 font-bold mb-1">Relationship</span><span className="text-xs font-black text-zinc-800">{viewHistoryItem.snapshot?.relationship || '-'}</span></div>
                             <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm"><span className="block text-[9px] text-zinc-400 font-bold mb-1">Languages</span><span className="text-xs font-black text-zinc-800">{viewHistoryItem.snapshot?.languages || '-'}</span></div>
                          </div>
                      </div>
                      <div>
                          <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Compass size={12}/> Lifestyle & Work</h4>
                          <div className="grid grid-cols-2 gap-3">
                             <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm col-span-2"><span className="block text-[9px] text-zinc-400 font-bold mb-1">Motto</span><span className="text-sm font-black text-indigo-600">{viewHistoryItem.snapshot?.motto || '-'}</span></div>
                             <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm"><span className="block text-[9px] text-zinc-400 font-bold mb-1">Recent Hobby</span><span className="text-xs font-black text-zinc-800">{viewHistoryItem.snapshot?.recentHobby || '-'}</span></div>
                             <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm"><span className="block text-[9px] text-zinc-400 font-bold mb-1">Working Style</span><span className="text-xs font-black text-zinc-800">{viewHistoryItem.snapshot?.workingStyle || '-'}</span></div>
                             <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm"><span className="block text-[9px] text-zinc-400 font-bold mb-1">Active Hours</span><span className="text-xs font-black text-zinc-800">{viewHistoryItem.snapshot?.activeHours || '-'}</span></div>
                             <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm"><span className="block text-[9px] text-zinc-400 font-bold mb-1">Contact</span><span className="text-xs font-black text-zinc-800">{viewHistoryItem.snapshot?.contact || '-'}</span></div>
                          </div>
                      </div>
                      <div>
                          <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Heart size={12}/> My Tastes</h4>
                          <div className="grid grid-cols-2 gap-3">
                             <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm"><span className="block text-[9px] text-zinc-400 font-bold mb-1">Hobbies</span><span className="text-xs font-bold text-zinc-700">{(viewHistoryItem.snapshot?.tastes?.hobbies || []).join(', ') || '-'}</span></div>
                             <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm"><span className="block text-[9px] text-orange-400 font-bold mb-1">Culture</span><span className="text-xs font-bold text-orange-700">{(viewHistoryItem.snapshot?.tastes?.culture || []).join(', ') || '-'}</span></div>
                             <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm"><span className="block text-[9px] text-indigo-400 font-bold mb-1">Food</span><span className="text-xs font-bold text-indigo-700">{(viewHistoryItem.snapshot?.tastes?.foods || []).join(', ') || '-'}</span></div>
                             <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm"><span className="block text-[9px] text-emerald-400 font-bold mb-1">Lifestyle</span><span className="text-xs font-bold text-emerald-700">{(viewHistoryItem.snapshot?.tastes?.lifestyle || []).join(', ') || '-'}</span></div>
                          </div>
                      </div>
                  </div>
                  <div className="p-5 border-t border-zinc-200 bg-white flex justify-end">
                      <button onClick={() => setViewHistoryItem(null)} className="px-5 py-2.5 bg-zinc-800 text-white font-bold text-sm rounded-xl hover:bg-zinc-900 transition shadow-sm">
                          닫기
                      </button>
                  </div>
              </div>
          </div>
      )}

      {showHistoryModal && (
          <div className="fixed inset-0 z-[300] bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-in fade-in" onClick={() => setShowHistoryModal(false)}>
              <div className="bg-[#F8FAFC] rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
                  <div className="p-6 bg-white border-b border-zinc-200 flex justify-between items-center shrink-0">
                      <div>
                        <h3 className="text-lg font-black text-zinc-900 flex items-center gap-2"><History className="text-indigo-500"/> Profile Commit History</h3>
                        <p className="text-[11px] text-zinc-500 font-bold mt-1">과거에 박제해 둔 나의 취향과 관심사 기록들입니다.</p>
                      </div>
                      <button onClick={() => setShowHistoryModal(false)} className="p-2 bg-zinc-50 hover:bg-zinc-100 rounded-full text-zinc-500 transition-colors"><CloseIcon size={20}/></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-hide">
                      <div className="relative border-l-2 border-indigo-100 ml-4 space-y-8 pb-10">
                          {(safeUser.addProfile?.history || []).map((h, i) => (
                              <div key={h.id || i} className="relative pl-8 group cursor-pointer" onClick={() => setViewHistoryItem(h)}>
                                  <div className="absolute w-4 h-4 bg-white border-[4px] border-indigo-500 rounded-full -left-[9px] top-1 shadow-sm group-hover:scale-125 transition-transform" />
                                  <div className="mb-3 flex items-center gap-2">
                                      <span className="text-[11px] font-black text-white bg-indigo-500 px-2.5 py-1 rounded-md shadow-sm tracking-widest">{h.date}</span>
                                      <span className="text-[10px] font-bold text-indigo-400 group-hover:underline">상세 보기</span>
                                  </div>
                                  <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm transition-shadow hover:shadow-md">
                                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                          {h.snapshot?.mbti && <div><span className="block text-[9px] text-zinc-400 font-bold mb-1">MBTI</span><span className="text-xs font-black text-zinc-800">{h.snapshot.mbti}</span></div>}
                                          {h.snapshot?.recentHobby && <div className="col-span-2 sm:col-span-1"><span className="block text-[9px] text-zinc-400 font-bold mb-1">Recent Hobby</span><span className="text-xs font-black text-zinc-800">{h.snapshot.recentHobby}</span></div>}
                                          {h.snapshot?.workingStyle && <div className="col-span-2 sm:col-span-1"><span className="block text-[9px] text-zinc-400 font-bold mb-1">Working Style</span><span className="text-xs font-black text-zinc-800">{h.snapshot.workingStyle}</span></div>}
                                          {h.snapshot?.motto && <div className="col-span-2 sm:col-span-3 pt-2 border-t border-zinc-100 mt-1"><span className="block text-[9px] text-zinc-400 font-bold mb-1">Motto</span><span className="text-xs font-black text-indigo-600 leading-relaxed">"{h.snapshot.motto}"</span></div>}
                                      </div>
                                  </div>
                              </div>
                          ))}
                          {(!safeUser.addProfile?.history || safeUser.addProfile?.history.length === 0) && (
                              <div className="text-center py-10 text-zinc-400 font-bold text-sm">
                                  아직 고정된 기록이 없습니다.
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      )}

      <div className="flex-1">
          <div className="bg-white rounded-3xl p-5 md:p-8 shadow-sm relative z-20 border border-zinc-200/80">
            {/* ⭐️ 수정됨: 버튼 공간 축소 및 여백 다이어트 */}
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
                  <button onClick={handleShare} className="w-7 h-7 md:w-8 md:h-8 bg-white hover:bg-zinc-50 text-zinc-600 rounded-full flex items-center justify-center transition shadow-sm border border-zinc-200" title="공유">
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
                  <div className="flex flex-row gap-4 sm:gap-5 items-center md:items-start">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 shrink-0 bg-zinc-50 rounded-2xl overflow-hidden border border-zinc-200 shadow-inner">
                      {safeUser.profileImageUrl ? (
                          <img src={safeUser.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl font-black text-zinc-300">
                            {safeUser.name ? safeUser.name.charAt(0) : '?'}
                          </div>
                      )}
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center min-w-0 md:pt-1">
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

              {availableTabs.length === 0 && isGuest ? (
                  <div className="mt-4 md:mt-6 p-10 flex flex-col items-center justify-center bg-white rounded-3xl shadow-sm border border-zinc-100">
                      <div className="w-16 h-16 bg-zinc-50 flex items-center justify-center rounded-full mb-4 shadow-inner"><Lock size={24} className="text-zinc-400" /></div>
                      <h3 className="text-base md:text-lg font-black text-zinc-800">비공개 프로필</h3>
                      <p className="text-xs md:text-sm font-medium text-zinc-500 mt-2">세부 정보가 비공개 설정되어 있습니다.</p>
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