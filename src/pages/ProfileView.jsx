import React, { useState, useEffect } from 'react';
import { 
    Code, Briefcase, HeartHandshake, Eye, EyeOff, Link, Edit2, 
    Rocket, User, Sparkles, GraduationCap, MapPin, Target, 
    ArrowRight, Heart, MessageSquare, Lock,
    ExternalLink
} from 'lucide-react';
import { useAppStore } from '../store/AppStore';

const ProfileView = () => {
  const { setViewMode, user, showToast, isAdmin, setLoginModalOpen, isGuestMode } = useAppStore();
  const [activeTab, setActiveTab] = useState('developer'); 

  // 게스트 판단 로직: 비로그인 상태이거나, 호스트가 '게스트 뷰' 버튼을 켰을 때
  const isGuest = !isAdmin || isGuestMode;

  // 탭 순서를 로컬 스토리지에 저장하고 드래그 앤 드롭 상태를 관리합니다.
  const [tabOrder, setTabOrder] = useState(() => {
    const saved = localStorage.getItem('cravelog_tab_order');
    return saved ? JSON.parse(saved) : ['developer', 'career', 'idol'];
  });
  const [draggedTab, setDraggedTab] = useState(null);

  useEffect(() => {
    localStorage.setItem('cravelog_tab_order', JSON.stringify(tabOrder));
  }, [tabOrder]);
  
// ⭐️ 공유하기 버튼 클릭 시 클립보드 복사 로직
  const handleShare = () => {
    // window.location.origin은 현재 사이트 주소(예: https://cravelog.me 또는 localhost:5173)를 자동으로 가져옵니다.
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

  // 전역 isGuest 상태를 사용하여 비공개 탭을 필터링합니다.
  const availableTabs = tabOrder
    .map(id => allTabsMap[id])
    .filter(tab => !isGuest || user.privacy?.[tab.id] !== false);

  useEffect(() => {
    // 모든 정보가 비공개일 때 activeTab을 비우도록 설정
    if (isGuest && activeTab && user.privacy?.[activeTab] === false) {
      const firstAvailable = availableTabs[0];
      setActiveTab(firstAvailable ? firstAvailable.id : null);
    } else if (!activeTab && availableTabs.length > 0) {
      setActiveTab(availableTabs[0].id);
    }
  }, [isGuest, activeTab, user.privacy, availableTabs]);

  // ⭐️ 드래그 앤 드롭 핸들러들
  const handleDragStart = (e, id) => {
    setDraggedTab(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id); // HTML5 드래그 필수 코드
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // 드롭 허용 필수
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e) => {
    e.preventDefault(); // 진입 시에도 이벤트 전파 방지
  };

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
                    {/* ⭐️ 프로필 사진 렌더링 로직 반영 */}
                    {user.profileImageUrl ? (
                        <img src={user.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-5xl font-black text-zinc-300">{isProfileEmpty ? '?' : user.name.charAt(0)}</span>
                    )}
                </div>
                {!isProfileEmpty && (
                    <div className="absolute -bottom-3 -right-2 bg-zinc-900 text-white px-3 py-1.5 shadow-xl flex items-center gap-1.5 rounded-xl border border-zinc-800">
                        <Sparkles size={12} className="text-yellow-400" /><span className="text-[10px] font-bold tracking-wider">{user.status}</span>
                    </div>
                )}
            </div>
        </div>
        
        <div className={`flex-1 text-center md:text-left ${shouldBlur ? 'opacity-30 blur-[2px]' : ''}`}>
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                <h2 className="text-2xl font-black text-zinc-900">{user.name}</h2>
                <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold text-zinc-500">
                    <span className="flex items-center gap-1"><Briefcase size={14}/> {user.role}</span>
                    <span className="flex items-center gap-1"><GraduationCap size={14}/> {user.major}</span>
                    <span className="flex items-center gap-1"><MapPin size={14}/> {user.location}</span>
                </div>
            </div>
            <p className="text-sm text-zinc-500 font-medium mb-4">@{user.handle}</p>
            <p className="text-base text-zinc-700 font-bold mb-4">"{user.bio}"</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                {(user.tags || []).map(tag => <span key={tag} className="px-3 py-1 bg-zinc-100 text-zinc-600 text-xs font-black rounded-lg">#{tag}</span>)}
            </div>

            <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 text-left">
                <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Target size={14}/> 현재 목표</h4>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {(user.goals || []).map((goal, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md"><ArrowRight size={12}/> {goal}</div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {}
      {!isProfileEmpty && (
        <>
          {/* Detail Tabs (⭐️ div 태그와 커서 설정 변경) */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6 p-1 bg-zinc-100/50 rounded-2xl border border-zinc-200/50">
            {availableTabs.map(tab => (
                <div 
                    key={tab.id} 
                    draggable={!isGuest} // 게스트가 아닐 때만 드래그 허용
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

          {}
          {/* Tab Contents */}
          {availableTabs.length === 0 && isGuest ? (
              // 모든 정보가 비공개일 때 빈 화면 렌더링
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
            {activeTab === 'developer' && (
                <div className="space-y-6">
                    {/* 상단 About Me & Tech Stack */}
                    <div className="bg-[#0D1117] text-zinc-300 p-8 rounded-[2rem] shadow-xl border border-zinc-800 relative overflow-hidden">
                        {/* 장식용 터미널 버튼 */}
                        <div className="absolute top-4 left-4 flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                        </div>
                        
                        <p className="font-mono text-sm leading-relaxed whitespace-pre-line text-emerald-400 mb-8 mt-4">
                            <span className="text-zinc-500">{"// About Me"}</span><br/>{user.developer?.about}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* ⭐️ 기술 스택 뱃지형 렌더링 */}
                            <div className="bg-[#161B22] p-5 rounded-2xl border border-zinc-800">
                                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Code size={14}/> Tech Stack
                                </h4>
                                <div className="space-y-4 text-sm font-mono">
                                    {['backend', 'db', 'frontend', 'tools'].map(type => {
                                        const stackString = user.developer?.techStack?.[type];
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
                                    <Rocket size={14}/> Currently Learning
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {(user.developer?.learning || []).map(l => (
                                        <span key={l} className="px-2.5 py-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 rounded-lg text-xs font-bold font-mono">
                                            {l}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ⭐️ 프로젝트 카드 업데이트 */}
                    <div>
                        <h3 className="text-lg font-black text-zinc-900 mb-4 ml-2 flex items-center gap-2">
                            <Folder size={20} className="text-indigo-500" /> Featured Projects
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(user.developer?.projects || []).map((proj, idx) => (
                                <div key={idx} className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col group">
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="text-xl font-black text-zinc-900 group-hover:text-indigo-600 transition-colors">
                                            {proj.name}
                                        </h4>
                                        {/* 프로젝트 링크 아이콘 */}
                                        <div className="flex gap-2 text-zinc-400">
                                            {proj.githubUrl && (
                                                <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 transition-colors" title="GitHub Repository">
                                                    <Link size={18} />
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
                                    {/* (옵션) 사용 스택을 프로젝트별로 달았다면 여기에 렌더링 가능 */}
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
          )}
        </>
      )}
    </div>
  );
};

export default ProfileView;