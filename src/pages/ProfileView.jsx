import React, { useState, useEffect } from 'react';
import { 
    Code, Briefcase, HeartHandshake, Eye, EyeOff, Link, Edit2, 
    Rocket, User, Sparkles, GraduationCap, MapPin, Target, 
    ArrowRight, Heart, MessageSquare, Lock, X as CloseIcon, Info
} from 'lucide-react';
import { useAppStore } from '../store/AppStore';

const ProfileView = () => {
  const { setViewMode, user, showToast, isAdmin, setLoginModalOpen, isGuestMode } = useAppStore();
  const [activeTab, setActiveTab] = useState('developer'); 

  // ⭐️ 벤토 박스 팝업 상태 관리
  const [bentoPopup, setBentoPopup] = useState(null);

  const isGuest = !isAdmin || isGuestMode;

  const [tabOrder, setTabOrder] = useState(() => {
    const saved = localStorage.getItem('cravelog_tab_order');
    return saved ? JSON.parse(saved) : ['developer', 'career', 'idol'];
  });
  const [draggedTab, setDraggedTab] = useState(null);

  useEffect(() => {
    localStorage.setItem('cravelog_tab_order', JSON.stringify(tabOrder));
  }, [tabOrder]);

  const handleShare = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?u=${user.handle}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast("프로필 링크가 클립보드에 복사되었습니다! 🔗");
    }).catch(err => {
      console.error("클립보드 복사 실패:", err);
      showToast("링크 복사에 실패했습니다.");
    });
  };

  const isProfileEmpty = user.name === "손님" && (user.tags || []).length === 0;
  const shouldBlur = isProfileEmpty && !isAdmin;

  const allTabsMap = {
    developer: { id: 'developer', icon: <Code size={16}/>, label: 'Developer Profile' },
    career: { id: 'career', icon: <Briefcase size={16}/>, label: 'Career Info' },
    idol: { id: 'idol', icon: <HeartHandshake size={16}/>, label: 'Personal (Idol)' }
  };

  const availableTabs = tabOrder
    .map(id => allTabsMap[id])
    .filter(tab => !isGuest || user.privacy?.[tab.id] !== false);

  useEffect(() => {
    if (isGuest && activeTab && user.privacy?.[activeTab] === false) {
      const firstAvailable = availableTabs[0];
      setActiveTab(firstAvailable ? firstAvailable.id : null);
    } else if (!activeTab && availableTabs.length > 0) {
      setActiveTab(availableTabs[0].id);
    }
  }, [isGuest, activeTab, user.privacy, availableTabs]);

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

  return (
    <div className="max-w-5xl mx-auto w-full p-4 md:p-10 animate-in fade-in duration-300 pb-28 md:pb-10 overflow-y-auto">
      {}
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

      {}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 ${shouldBlur ? 'opacity-30 blur-[2px] pointer-events-none' : ''}`}>
        
        {/* Bento 1: 메인 프로필 (화이트 톤, 여백 강조) */}
        <div 
            onClick={() => setBentoPopup('profile')}
            className="md:col-span-2 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-200/80 cursor-pointer hover:bg-zinc-50/50 hover:border-zinc-300 transition-all duration-300 group flex flex-col justify-center relative"
        >
            <div className="absolute top-5 right-5 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity"><Info size={18}/></div>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="shrink-0">
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-zinc-100 border border-zinc-200 shadow-inner flex items-center justify-center overflow-hidden">
                        {user?.profileImageUrl ? (
                            <img src={user.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-3xl font-black text-zinc-300">{isProfileEmpty ? '?' : user?.name?.charAt(0)}</span>
                        )}
                    </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 text-zinc-500 text-[10px] font-black uppercase rounded-lg mb-2">
                        @{user?.handle}
                    </div>
                    <h2 className="text-2xl font-black text-zinc-900 mb-2">{user?.name}</h2>
                    <p className="text-sm text-zinc-500 font-medium leading-relaxed mb-4 line-clamp-2">
                        {user?.bio || "아직 작성된 한 줄 소개가 없습니다."}
                    </p>
                    {/* 너무 많은 태그 방지: 최대 3개만 표시 */}
                    <div className="flex flex-wrap justify-center sm:justify-start gap-1.5">
                        {(user?.tags || []).slice(0, 3).map(tag => (
                            <span key={tag} className="px-2.5 py-1 bg-zinc-50 border border-zinc-100 text-zinc-600 text-[11px] font-bold rounded-md">#{tag}</span>
                        ))}
                        {(user?.tags || []).length > 3 && (
                            <span className="px-2.5 py-1 bg-zinc-50 border border-zinc-100 text-zinc-400 text-[11px] font-bold rounded-md">
                                +{(user?.tags || []).length - 3}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* Bento 2: 퀵 인포 (미니멀 리스트 뷰) */}
        <div 
            onClick={() => setBentoPopup('info')}
            className="md:col-span-1 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-200/80 cursor-pointer hover:bg-zinc-50/50 hover:border-zinc-300 transition-all duration-300 group relative flex flex-col justify-center gap-5"
        >
            <div className="absolute top-5 right-5 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity"><Info size={18}/></div>
            
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 shrink-0"><Briefcase size={14}/></div>
                <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Role</p>
                    <p className="text-sm font-bold text-zinc-800 truncate">{user?.role || '-'}</p>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 shrink-0"><GraduationCap size={14}/></div>
                <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Major</p>
                    <p className="text-sm font-bold text-zinc-800 truncate">{user?.major || '-'}</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 shrink-0"><MapPin size={14}/></div>
                <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Location</p>
                    <p className="text-sm font-bold text-zinc-800 truncate">{user?.location || '-'}</p>
                </div>
            </div>
        </div>

        {/* Bento 3: 현재 목표 (시선 분산 방지를 위해 점선 테두리로 가볍게 처리) */}
        <div 
            onClick={() => setBentoPopup('goals')}
            className="md:col-span-3 bg-zinc-50/50 rounded-3xl p-6 md:px-8 border-2 border-dashed border-zinc-200 cursor-pointer hover:bg-zinc-100/50 hover:border-zinc-300 transition-all duration-300 group flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8"
        >
            <div className="shrink-0 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500"><Target size={16}/></div>
                <h4 className="text-sm font-black text-zinc-700">Current Goals</h4>
            </div>
            
            <div className="flex-1 flex flex-wrap gap-x-4 gap-y-2">
                {(user?.goals || []).map((goal, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 bg-white border border-zinc-200 px-3 py-1.5 rounded-lg shadow-sm">
                        {goal}
                    </div>
                ))}
                {(user?.goals || []).length === 0 && (
                    <p className="text-xs text-zinc-400 font-medium">설정된 목표가 없습니다.</p>
                )}
            </div>
            <div className="hidden md:block shrink-0 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity"><Info size={18}/></div>
        </div>
      </div>

      {}
      {isProfileEmpty && !isAdmin && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center mt-20">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-4 shadow-sm"><User size={32}/></div>
              <h3 className="text-xl font-black text-zinc-900 mb-2">아직 설정된 프로필이 없어요!</h3>
              <p className="text-sm font-medium text-zinc-500 mb-6 max-w-sm">로그인 후 나만의 직무, 목표, 취향 정보를 입력하고 나를 표현하는 멋진 인덱스를 완성해보세요.</p>
              <button onClick={() => setLoginModalOpen(true)} className="px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold shadow-md hover:bg-zinc-800 transition">
                  CraveLog 시작하기
              </button>
          </div>
      )}

      {}
      {bentoPopup && (
        <div className="fixed inset-0 z-[200] bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={() => setBentoPopup(null)}>
            <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <button onClick={() => setBentoPopup(null)} className="absolute top-6 right-6 p-2 text-zinc-400 hover:bg-zinc-100 rounded-full transition"><CloseIcon size={20}/></button>
                
                {bentoPopup === 'profile' && (
                    <div className="text-center">
                        <div className="w-28 h-28 mx-auto rounded-full bg-zinc-100 border border-zinc-200 shadow-inner overflow-hidden mb-5">
                            {user?.profileImageUrl ? <img src={user.profileImageUrl} alt="Profile" className="w-full h-full object-cover" /> : <span className="flex items-center justify-center w-full h-full text-3xl font-black text-zinc-300">{user?.name?.charAt(0)}</span>}
                        </div>
                        <h2 className="text-2xl font-black text-zinc-900 mb-1">{user?.name}</h2>
                        <p className="text-sm font-bold text-zinc-400 mb-4">@{user?.handle}</p>
                        
                        {user?.status && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-black rounded-full mb-6">
                                <Sparkles size={12} className="text-indigo-500"/> {user.status}
                            </div>
                        )}
                        
                        <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-100 text-left mb-6">
                            <p className="text-sm text-zinc-700 font-medium leading-relaxed">"{user?.bio}"</p>
                        </div>

                        <div className="text-left">
                            <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">All Tags</h4>
                            <div className="flex flex-wrap gap-2">
                                {(user?.tags || []).map(tag => <span key={tag} className="px-3 py-1.5 bg-zinc-100 text-zinc-600 text-xs font-bold rounded-lg">#{tag}</span>)}
                            </div>
                        </div>
                    </div>
                )}

                {bentoPopup === 'info' && (
                    <div>
                        <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-600 flex items-center justify-center mb-6"><Briefcase size={24}/></div>
                        <h2 className="text-xl font-black text-zinc-900 mb-6">Basic Information</h2>
                        <div className="space-y-6">
                            <div className="border-b border-zinc-100 pb-4"><p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Role / Job</p><p className="text-base font-bold text-zinc-800">{user?.role || '미설정'}</p></div>
                            <div className="border-b border-zinc-100 pb-4"><p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Major / Organization</p><p className="text-base font-bold text-zinc-800">{user?.major || '미설정'}</p></div>
                            <div><p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Location</p><p className="text-base font-bold text-zinc-800">{user?.location || '미설정'}</p></div>
                        </div>
                    </div>
                )}

                {bentoPopup === 'goals' && (
                    <div>
                        <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-600 flex items-center justify-center mb-6"><Target size={24}/></div>
                        <h2 className="text-xl font-black text-zinc-900 mb-6">Current Goals</h2>
                        <div className="space-y-3">
                            {(user?.goals || []).map((goal, idx) => (
                                <div key={idx} className="p-4 bg-white rounded-xl border border-zinc-200 shadow-sm flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-zinc-100 text-zinc-500 flex items-center justify-center shrink-0 font-black text-xs">{idx + 1}</div>
                                    <p className="text-sm font-bold text-zinc-800">{goal}</p>
                                </div>
                            ))}
                            {(user?.goals || []).length === 0 && <p className="text-sm font-medium text-zinc-500 text-center py-4 bg-zinc-50 rounded-xl">설정된 목표가 없습니다.</p>}
                        </div>
                    </div>
                )}
            </div>
        </div>
      )}

      {}
      {!isProfileEmpty && (
        <>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6 p-1 bg-zinc-100/50 rounded-2xl border border-zinc-200/50 mt-4">
            {availableTabs.map(tab => (
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
                    {tab.icon} {tab.label} {user.privacy?.[tab.id] === false && <Lock size={12} className="text-rose-400" />}
                </div>
            ))}
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Developer Tab */}
            {activeTab === 'developer' && availableTabs.some(t => t.id === 'developer') && (
                <div className="space-y-6">
                    <div className="bg-zinc-900 text-zinc-300 p-8 rounded-[2rem] shadow-xl border border-zinc-800">
                        <p className="font-mono text-sm leading-relaxed whitespace-pre-line text-emerald-400 mb-6">
                            <span className="text-zinc-500">{"// About Me"}</span><br/>{user.developer?.about}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-zinc-800/50 p-5 rounded-2xl border border-zinc-700/50">
                                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Tech Stack</h4>
                                <ul className="space-y-2 text-sm font-mono">
                                    <li><span className="text-indigo-400">Backend:</span> {user.developer?.techStack?.backend}</li>
                                    <li><span className="text-indigo-400">Database:</span> {user.developer?.techStack?.db}</li>
                                    <li><span className="text-rose-400">Frontend:</span> {user.developer?.techStack?.frontend}</li>
                                    <li><span className="text-yellow-400">Tools:</span> {user.developer?.techStack?.tools}</li>
                                </ul>
                            </div>
                            <div className="bg-zinc-800/50 p-5 rounded-2xl border border-zinc-700/50">
                                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Currently Learning</h4>
                                <div className="flex flex-wrap gap-2">
                                    {(user.developer?.learning || []).map(l => <span key={l} className="px-2.5 py-1 bg-zinc-950 border border-zinc-700 rounded-md text-xs font-bold font-mono">{l}</span>)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {(user.developer?.projects || []).map((proj, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-[2rem] border border-zinc-200/80 shadow-sm flex flex-col justify-center hover:shadow-md transition-shadow cursor-pointer">
                                <h4 className="text-lg font-black text-zinc-900 mb-2">{proj.name}</h4>
                                <p className="text-sm text-zinc-500 font-medium">{proj.desc}</p>
                            </div>
                        ))}
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
                                <p className="text-xl font-black text-indigo-600">{user.career?.targetJob}</p>
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Tech Stack</h4>
                                <div className="flex flex-wrap gap-2">
                                    {(user.career?.techStack || []).map(t => <span key={t} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-black rounded-lg border border-indigo-100">{t}</span>)}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Interests</h4>
                                <div className="flex flex-wrap gap-2">
                                    {(user.career?.interests || []).map(i => <span key={i} className="px-3 py-1.5 bg-zinc-50 text-zinc-600 text-xs font-black rounded-lg border border-zinc-200">{i}</span>)}
                                </div>
                            </div>
                        </div>
                        
                        <div className="w-full md:w-1/3 space-y-4">
                            <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
                                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Short Term Goal</h4>
                                <p className="text-sm font-bold text-indigo-900">{user.career?.careerGoals?.short}</p>
                            </div>
                            <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
                                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Mid Term Goal</h4>
                                <p className="text-sm font-bold text-indigo-900">{user.career?.careerGoals?.mid}</p>
                            </div>
                            <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
                                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Long Term Goal</h4>
                                <p className="text-sm font-bold text-indigo-900">{user.career?.careerGoals?.long}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {(user.career?.strengths || []).map((str, idx) => (
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
                        <div className="md:col-span-1 bg-gradient-to-br from-rose-50 to-pink-50 p-8 rounded-[2rem] shadow-sm border border-rose-100">
                            <h3 className="text-xl font-black text-rose-900 mb-6 flex items-center gap-2"><Sparkles size={20} className="text-rose-400"/> Profile</h3>
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between border-b border-rose-200/50 pb-2"><span className="font-bold text-rose-400">Nickname</span><span className="font-black text-rose-900">{user.idol?.nickname}</span></div>
                                <div className="flex justify-between border-b border-rose-200/50 pb-2"><span className="font-bold text-rose-400">Birthday</span><span className="font-black text-rose-900">{user.idol?.birthday}</span></div>
                                <div className="flex justify-between border-b border-rose-200/50 pb-2"><span className="font-bold text-rose-400">Age</span><span className="font-black text-rose-900">{user.idol?.age}</span></div>
                                <div className="flex justify-between border-b border-rose-200/50 pb-2"><span className="font-bold text-rose-400">Specialty</span><span className="font-black text-rose-900">{user.idol?.specialty}</span></div>
                                <div className="flex justify-between pb-2"><span className="font-bold text-rose-400">Hobbies</span><span className="font-black text-rose-900 text-right">{user.idol?.hobbies}</span></div>
                            </div>
                        </div>

                        <div className="md:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-200/60">
                            <h3 className="text-xl font-black text-zinc-900 mb-6 flex items-center gap-2"><Heart size={20} className="text-rose-500 fill-rose-500"/> Favorites</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div><h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Colors</h4><div className="flex flex-wrap gap-2">{(user.idol?.favorites?.colors || []).map(c=><span key={c} className="px-3 py-1 bg-zinc-50 rounded-lg text-xs font-bold text-zinc-700">{c}</span>)}</div></div>
                                <div><h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Foods</h4><div className="flex flex-wrap gap-2">{(user.idol?.favorites?.foods || []).map(c=><span key={c} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-bold">{c}</span>)}</div></div>
                                <div><h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Games</h4><div className="flex flex-wrap gap-2">{(user.idol?.favorites?.games || []).map(c=><span key={c} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold">{c}</span>)}</div></div>
                                <div><h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Music</h4><div className="flex flex-wrap gap-2">{(user.idol?.favorites?.music || []).map(c=><span key={c} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold">{c}</span>)}</div></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-200/60">
                        <h3 className="text-xl font-black text-zinc-900 mb-6 flex items-center gap-2"><MessageSquare size={20} className="text-indigo-500"/> Q & A</h3>
                        <div className="space-y-6">
                            {(user.idol?.qna || []).map((item, idx) => (
                                <div key={idx} className="flex flex-col gap-2">
                                    <span className="text-sm font-black text-indigo-600 flex items-center gap-2">Q. {item.q}</span>
                                    <span className="text-sm font-medium text-zinc-700 bg-zinc-50 p-3 rounded-xl border border-zinc-100">A. {item.a}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileView;