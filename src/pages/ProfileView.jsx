import React, { useState, useEffect } from 'react';
import { 
    Code, Briefcase, HeartHandshake, Eye, EyeOff, Link as LinkIcon, Edit2, 
    Rocket, User, Sparkles, GraduationCap, MapPin, Target, 
    ArrowRight, Heart, MessageSquare, Lock, X as CloseIcon, Info,
    LayoutGrid, List, HelpCircle, Palette, Compass, Quote, PenTool,
    Globe, Monitor
} from 'lucide-react';
import { useAppStore } from '../store/AppStore';

// ⭐️ Lucide에서 삭제된 브랜드 아이콘들을 SVG로 직접 만들어줍니다.
const GithubIcon = ({ size = 20 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a5.4 5.4 0 0 0-1.5-3.8 5.3 5.3 0 0 0-.1-3.8s-1.2-.4-3.9 1.4a13.3 13.3 0 0 0-7 0C6.2 1.5 5 1.9 5 1.9a5.3 5.3 0 0 0-.1 3.8A5.4 5.4 0 0 0 3 12.5c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4"></path></svg>);
const InstagramIcon = ({ size = 20 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>);

const ProfileView = () => {
  const { setViewMode, user, showToast, isAdmin, setLoginModalOpen, isGuestMode, isSidebarOpen } = useAppStore();
  
  const [activeTab, setActiveTab] = useState('developer'); 
  const [detailViewMode, setDetailViewMode] = useState('grid'); // 기본값을 grid로 변경
  const [detailPopup, setDetailPopup] = useState(null); 
  const [bentoPopup, setBentoPopup] = useState(null);

  const isGuest = !isAdmin || isGuestMode;

  // ⭐️ 탭 확장: 새로운 탭들을 추가했습니다.
  const allTabsMap = {
    developer: { id: 'developer', icon: <Code size={18}/>, label: 'Developer', color: 'blue', hoverClass: 'hover:border-blue-200 group-hover:bg-blue-50/50', iconClass: 'bg-blue-50 text-blue-500 border-blue-100 group-hover:bg-blue-100' },
    career: { id: 'career', icon: <Briefcase size={18}/>, label: 'Career', color: 'emerald', hoverClass: 'hover:border-emerald-200 group-hover:bg-emerald-50/50', iconClass: 'bg-emerald-50 text-emerald-500 border-emerald-100 group-hover:bg-emerald-100' },
    idol: { id: 'idol', icon: <HeartHandshake size={18}/>, label: 'Idol (TMI)', color: 'rose', hoverClass: 'hover:border-rose-200 group-hover:bg-rose-50/50', iconClass: 'bg-rose-50 text-rose-500 border-rose-100 group-hover:bg-rose-100' },
    qna: { id: 'qna', icon: <HelpCircle size={18}/>, label: 'Q&A', color: 'violet', hoverClass: 'hover:border-violet-200 group-hover:bg-violet-50/50', iconClass: 'bg-violet-50 text-violet-500 border-violet-100 group-hover:bg-violet-100' },
    hobby: { id: 'hobby', icon: <Palette size={18}/>, label: 'My Hobby', color: 'amber', hoverClass: 'hover:border-amber-200 group-hover:bg-amber-50/50', iconClass: 'bg-amber-50 text-amber-500 border-amber-100 group-hover:bg-amber-100' },
    vision: { id: 'vision', icon: <Compass size={18}/>, label: 'Vision Board', color: 'teal', hoverClass: 'hover:border-teal-200 group-hover:bg-teal-50/50', iconClass: 'bg-teal-50 text-teal-500 border-teal-100 group-hover:bg-teal-100' },
    quotes: { id: 'quotes', icon: <Quote size={18}/>, label: 'Quotes', color: 'slate', hoverClass: 'hover:border-slate-200 group-hover:bg-slate-50/50', iconClass: 'bg-slate-50 text-slate-500 border-slate-100 group-hover:bg-slate-100' },
    guestbook: { id: 'guestbook', icon: <PenTool size={18}/>, label: 'Guestbook', color: 'pink', hoverClass: 'hover:border-pink-200 group-hover:bg-pink-50/50', iconClass: 'bg-pink-50 text-pink-500 border-pink-100 group-hover:bg-pink-100' },
  };

  const defaultOrder = Object.keys(allTabsMap);
  const [tabOrder, setTabOrder] = useState(() => {
    const saved = localStorage.getItem('cravelog_tab_order');
    if (saved) {
      const parsed = JSON.parse(saved);
      // 저장된 배열에 없는 새로운 탭들을 뒤에 추가해줍니다.
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
    const shareUrl = `${window.location.origin}${window.location.pathname}?u=${user.handle}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast("프로필 링크가 클립보드에 복사되었습니다! 🔗");
    }).catch(err => {
      showToast("링크 복사에 실패했습니다.");
    });
  };

  const isProfileEmpty = user.name === "손님" && (user.tags || []).length === 0;
  const shouldBlur = isProfileEmpty && !isAdmin;

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

  // ==========================================
  // 🌟 Dummy Data for New Tabs (UI 확인용)
  // ==========================================
  const dummyLinks = [
    { icon: <GithubIcon size={20}/>, name: "GitHub", url: "https://github.com", color: "bg-zinc-800 text-white" },
    { icon: <Globe size={20}/>, name: "Blog", url: "https://velog.io", color: "bg-emerald-500 text-white" },
    { icon: <InstagramIcon size={20}/>, name: "Instagram", url: "https://instagram.com", color: "bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-500 text-white" },
    { icon: <Monitor size={20}/>, name: "Steam", url: "https://steam.com", color: "bg-blue-900 text-white" }
  ];

  const dummyQna = [
    { q: "개발을 시작하게 된 계기는?", a: "내가 만든 무언가가 실제로 동작하고 사람들에게 도움을 주는 과정이 너무 짜릿했습니다." },
    { q: "쉬는 날엔 주로 뭘 하나요?", a: "밀린 넷플릭스를 보거나, 근처 조용한 카페에서 책을 읽습니다." },
    { q: "죽기 전에 꼭 해보고 싶은 것은?", a: "오로라를 보며 맥주 마시기!" },
    { q: "요즘 가장 꽂혀있는 관심사는?", a: "AI를 활용해서 내 업무를 자동화하는 방법에 푹 빠져있어요." }
  ];

  const dummyHobby = {
    title: "여행과 사진 📸",
    image: "https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?q=80&w=1000&auto=format&fit=crop",
    description: "새로운 낯선 환경에 나를 던져두는 것을 좋아합니다. 골목길을 걸으며 카메라 셔터를 누르는 순간이 저에겐 최고의 힐링입니다. 필름 카메라 특유의 거친 노이즈와 따뜻한 색감을 사랑해요.",
    keywords: ["필름카메라", "나홀로여행", "골목길", "야경"]
  };

  const dummyVision = {
    coreGoal: "선한 영향력을 주는 개발자",
    subGoals: ["오픈소스 기여", "기술 블로그 운영", "멘토링 활동", "사이드 프로젝트", "알고리즘 꾸준히", "건강한 멘탈", "재테크 공부", "어학 능력 향상"]
  };

  const dummyQuotes = [
    { text: "실수는 성공을 위한 데이터일 뿐이다.", author: "Thomas Edison" },
    { text: "아무것도 하지 않으면 아무 일도 일어나지 않는다.", author: "Anonymous" },
    { text: "코드는 거짓말을 하지 않는다, 내가 할 뿐.", author: "A Developer" }
  ];

  const dummyGuestbook = [
    { author: "김철수", date: "2026.07.28", text: "프로필 너무 멋지네요! 영감 얻고 갑니다 😊" },
    { author: "Dev_Lee", date: "2026.07.27", text: "같은 백엔드 지망생으로서 화이팅입니다!" },
    { author: "지나가던 행인", date: "2026.07.25", text: "포트폴리오가 깔끔해서 보기 좋아요 👍" }
  ];


  // ==========================================
  // 🌟 Render Functions
  // ==========================================
  
  const renderDeveloperContent = () => (
    <div className="space-y-6">
        <div className="bg-zinc-900 text-zinc-300 p-8 rounded-[2rem] shadow-xl border border-zinc-800">
            <p className="font-mono text-sm leading-relaxed whitespace-pre-line text-emerald-400 mb-6">
                <span className="text-zinc-500">{"// About Me"}</span><br/>{user.developer?.about}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-800/50 p-5 rounded-2xl border border-zinc-700/50">
                    <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Tech Stack</h4>
                    <ul className="space-y-2 text-sm font-mono">
                        <li><span className="text-blue-400">Backend:</span> {user.developer?.techStack?.backend}</li>
                        <li><span className="text-emerald-400">Database:</span> {user.developer?.techStack?.db}</li>
                        <li><span className="text-rose-400">Frontend:</span> {user.developer?.techStack?.frontend}</li>
                        <li><span className="text-yellow-400">Tools:</span> {user.developer?.techStack?.tools}</li>
                    </ul>
                </div>
                <div className="bg-zinc-800/50 p-5 rounded-2xl border border-zinc-700/50">
                    <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Currently Learning</h4>
                    <div className="flex flex-wrap gap-2">
                        {(user.developer?.learning || []).map(l => <span key={l} className="px-2.5 py-1 bg-zinc-950 border border-zinc-700 rounded-md text-xs font-bold font-mono text-blue-300">{l}</span>)}
                    </div>
                </div>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(user.developer?.projects || []).map((proj, idx) => (
                <div key={idx} className="bg-white p-6 rounded-[2rem] border border-blue-100/80 shadow-sm flex flex-col justify-center hover:shadow-md hover:border-blue-200 transition-all cursor-pointer">
                    <h4 className="text-lg font-black text-zinc-900 mb-2">{proj.name}</h4>
                    <p className="text-sm text-zinc-500 font-medium">{proj.desc}</p>
                </div>
            ))}
        </div>
    </div>
  );

  const renderCareerContent = () => (
    <div className="space-y-6">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-emerald-100/60 flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-6">
                <div><h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Target Job</h4><p className="text-xl font-black text-emerald-600">{user.career?.targetJob}</p></div>
                <div><h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Tech Stack</h4><div className="flex flex-wrap gap-2">{(user.career?.techStack || []).map(t => <span key={t} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-black rounded-lg border border-emerald-100">{t}</span>)}</div></div>
                <div><h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Interests</h4><div className="flex flex-wrap gap-2">{(user.career?.interests || []).map(i => <span key={i} className="px-3 py-1.5 bg-zinc-50 text-zinc-600 text-xs font-black rounded-lg border border-zinc-200">{i}</span>)}</div></div>
            </div>
            
            <div className="w-full md:w-1/3 space-y-4">
                <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100"><h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Short Term Goal</h4><p className="text-sm font-bold text-emerald-900">{user.career?.careerGoals?.short}</p></div>
                <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100"><h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Mid Term Goal</h4><p className="text-sm font-bold text-emerald-900">{user.career?.careerGoals?.mid}</p></div>
                <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100"><h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Long Term Goal</h4><p className="text-sm font-bold text-emerald-900">{user.career?.careerGoals?.long}</p></div>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(user.career?.strengths || []).map((str, idx) => (
                <div key={idx} className="bg-white p-6 rounded-[2rem] border border-emerald-100/60 shadow-sm"><div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center font-black mb-4">{idx+1}</div><h4 className="text-base font-black text-zinc-900 mb-2">{str.title}</h4><p className="text-xs text-zinc-500 leading-relaxed font-medium">{str.desc}</p></div>
            ))}
        </div>
    </div>
  );

  const renderIdolContent = () => (
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

            <div className="md:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-rose-100/60">
                <h3 className="text-xl font-black text-zinc-900 mb-6 flex items-center gap-2"><Heart size={20} className="text-rose-500 fill-rose-500"/> Favorites</h3>
                <div className="grid grid-cols-2 gap-6">
                    <div><h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Colors</h4><div className="flex flex-wrap gap-2">{(user.idol?.favorites?.colors || []).map(c=><span key={c} className="px-3 py-1 bg-zinc-50 rounded-lg text-xs font-bold text-zinc-700">{c}</span>)}</div></div>
                    <div><h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Foods</h4><div className="flex flex-wrap gap-2">{(user.idol?.favorites?.foods || []).map(c=><span key={c} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-bold">{c}</span>)}</div></div>
                    <div><h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Games</h4><div className="flex flex-wrap gap-2">{(user.idol?.favorites?.games || []).map(c=><span key={c} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold">{c}</span>)}</div></div>
                    <div><h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Music</h4><div className="flex flex-wrap gap-2">{(user.idol?.favorites?.music || []).map(c=><span key={c} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold">{c}</span>)}</div></div>
                </div>
            </div>
        </div>
    </div>
  );

  const renderQnaContent = () => (
    <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-violet-100/60">
        <h3 className="text-2xl font-black text-violet-900 mb-8 flex items-center gap-2"><HelpCircle size={24} className="text-violet-500"/> 100문 100답</h3>
        <div className="space-y-6">
            {(user.qna || dummyQna).map((item, idx) => (
                <div key={idx} className="flex flex-col gap-3 group">
                    <span className="text-base font-black text-violet-600 flex items-start gap-2"><span className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded text-xs mt-0.5">Q</span> {item.q}</span>
                    <span className="text-sm font-medium text-zinc-700 bg-violet-50/30 p-4 rounded-2xl border border-violet-100 group-hover:bg-violet-50 transition-colors leading-relaxed ml-2">{item.a}</span>
                </div>
            ))}
        </div>
    </div>
  );

  const renderHobbyContent = () => (
    <div className="bg-white rounded-[2rem] shadow-sm border border-amber-100/60 overflow-hidden flex flex-col md:flex-row group">
        <div className="md:w-1/2 h-64 md:h-auto relative overflow-hidden">
            <img src={dummyHobby.image} alt="Hobby" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <h3 className="absolute bottom-6 left-6 text-3xl font-black text-white drop-shadow-md">{dummyHobby.title}</h3>
        </div>
        <div className="md:w-1/2 p-8 md:p-10 flex flex-col justify-center bg-amber-50/10">
            <Quote size={40} className="text-amber-200 mb-6 transform rotate-180" />
            <p className="text-base text-zinc-700 leading-relaxed font-medium mb-8">
                {dummyHobby.description}
            </p>
            <div className="flex flex-wrap gap-2">
                {dummyHobby.keywords.map(kw => <span key={kw} className="px-3 py-1.5 bg-amber-100/50 text-amber-700 text-xs font-bold rounded-lg border border-amber-200/50">#{kw}</span>)}
            </div>
        </div>
    </div>
  );

  const renderVisionContent = () => (
    <div className="bg-gradient-to-br from-teal-900 to-slate-900 p-8 md:p-12 rounded-[2rem] shadow-xl text-white">
        <div className="text-center mb-10">
            <h3 className="text-3xl font-black mb-3 flex items-center justify-center gap-3"><Compass className="text-teal-400"/> Mandalart Plan</h3>
            <p className="text-teal-200/80 text-sm font-medium">나의 목표를 이루기 위한 8가지 세부 계획</p>
        </div>
        
        <div className="grid grid-cols-3 gap-3 md:gap-4 max-w-2xl mx-auto aspect-square">
            {/* 상단 3개 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center p-2 text-center text-xs md:text-sm font-bold border border-white/20 hover:bg-white/20 transition-colors">{dummyVision.subGoals[0]}</div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center p-2 text-center text-xs md:text-sm font-bold border border-white/20 hover:bg-white/20 transition-colors">{dummyVision.subGoals[1]}</div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center p-2 text-center text-xs md:text-sm font-bold border border-white/20 hover:bg-white/20 transition-colors">{dummyVision.subGoals[2]}</div>
            
            {/* 중단 3개 (가운데는 핵심 목표) */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center p-2 text-center text-xs md:text-sm font-bold border border-white/20 hover:bg-white/20 transition-colors">{dummyVision.subGoals[3]}</div>
            <div className="bg-teal-500 rounded-2xl flex items-center justify-center p-3 text-center text-sm md:text-lg font-black shadow-lg border-2 border-teal-300 z-10 animate-pulse-slow shadow-teal-500/50">{dummyVision.coreGoal}</div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center p-2 text-center text-xs md:text-sm font-bold border border-white/20 hover:bg-white/20 transition-colors">{dummyVision.subGoals[4]}</div>
            
            {/* 하단 3개 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center p-2 text-center text-xs md:text-sm font-bold border border-white/20 hover:bg-white/20 transition-colors">{dummyVision.subGoals[5]}</div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center p-2 text-center text-xs md:text-sm font-bold border border-white/20 hover:bg-white/20 transition-colors">{dummyVision.subGoals[6]}</div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center p-2 text-center text-xs md:text-sm font-bold border border-white/20 hover:bg-white/20 transition-colors">{dummyVision.subGoals[7]}</div>
        </div>
    </div>
  );

  const renderQuotesContent = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dummyQuotes.map((q, idx) => (
            <div key={idx} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col justify-between hover:-translate-y-1 hover:shadow-md transition-all">
                <Quote size={32} className="text-slate-200 mb-4" />
                <p className="text-lg md:text-xl font-black text-slate-800 leading-snug mb-6">"{q.text}"</p>
                <p className="text-xs font-bold text-slate-400 text-right uppercase tracking-widest">- {q.author}</p>
            </div>
        ))}
    </div>
  );

  const renderGuestbookContent = () => (
    <div className="bg-pink-50/30 p-8 md:p-10 rounded-[2rem] shadow-sm border border-pink-100">
        <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black text-pink-900 flex items-center gap-2"><PenTool size={24} className="text-pink-500"/> 방명록</h3>
            <button className="px-4 py-2 bg-pink-500 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-pink-600 transition">기록 남기기</button>
        </div>
        
        <div className="space-y-4">
            {dummyGuestbook.map((gb, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-pink-100/50 shadow-sm flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-black text-zinc-800">{gb.author}</span>
                        <span className="text-[10px] font-bold text-zinc-400">{gb.date}</span>
                    </div>
                    <p className="text-sm text-zinc-600 font-medium">{gb.text}</p>
                </div>
            ))}
        </div>
    </div>
  );


  // ==========================================
  // 🌟 Main Return
  // ==========================================
  return (
    <div className="max-w-5xl mx-auto w-full p-4 md:p-10 animate-in fade-in duration-300 pb-28 md:pb-10 overflow-y-auto">
      {/* --- HEADER --- */}
      <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight">Index</h1>
          <p className="text-sm font-bold text-zinc-400 mt-1 uppercase tracking-widest">Personal Catalog</p>
        </div>
        <div className="flex flex-wrap gap-2">
           {!isProfileEmpty && (
             <button onClick={handleShare} className="px-4 py-2 bg-white border border-zinc-200 text-zinc-600 rounded-xl text-sm font-bold hover:bg-zinc-50 transition shadow-sm flex items-center gap-2">
                 <LinkIcon size={16} /> <span className="hidden md:inline">공유</span>
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

      {/* --- BENTO BOX (Basic Info & Social Links) --- */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 ${shouldBlur ? 'opacity-30 blur-[2px] pointer-events-none' : ''}`}>
        
        {/* Bento 1: 메인 프로필 */}
        <div 
            onClick={() => setBentoPopup('profile')}
            className="md:col-span-2 bg-gradient-to-br from-white to-blue-50/40 rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-200/80 cursor-pointer hover:border-blue-200 hover:shadow-md transition-all duration-300 group flex flex-col justify-center relative"
        >
            <div className="absolute top-5 right-5 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity"><Info size={18}/></div>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="shrink-0">
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white border border-zinc-200 shadow-sm flex items-center justify-center overflow-hidden p-1">
                        <div className="w-full h-full rounded-full overflow-hidden bg-zinc-100 flex items-center justify-center">
                            {user?.profileImageUrl ? (
                                <img src={user.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-3xl font-black text-zinc-300">{isProfileEmpty ? '?' : user?.name?.charAt(0)}</span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-500 border border-indigo-100 text-[10px] font-black uppercase rounded-lg mb-2 shadow-sm">
                        @{user?.handle}
                    </div>
                    <h2 className="text-2xl font-black text-zinc-900 mb-2">{user?.name}</h2>
                    <p className="text-sm text-zinc-500 font-medium leading-relaxed mb-4 line-clamp-2">
                        {user?.bio || "아직 작성된 한 줄 소개가 없습니다."}
                    </p>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-1.5">
                        {(user?.tags || []).slice(0, 3).map(tag => (
                            <span key={tag} className="px-2.5 py-1 bg-blue-50 border border-blue-100 text-blue-600 text-[11px] font-bold rounded-md">#{tag}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Bento 2: 퀵 인포 */}
        <div 
            onClick={() => setBentoPopup('info')}
            className="md:col-span-1 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-200/80 cursor-pointer hover:border-zinc-300 hover:shadow-md transition-all duration-300 group relative flex flex-col justify-center gap-5"
        >
            <div className="absolute top-5 right-5 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity"><Info size={18}/></div>
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0 shadow-sm"><Briefcase size={14}/></div>
                <div className="min-w-0 flex-1"><p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Role</p><p className="text-sm font-bold text-zinc-800 truncate">{user?.role || '-'}</p></div>
            </div>
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shrink-0 shadow-sm"><GraduationCap size={14}/></div>
                <div className="min-w-0 flex-1"><p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Major</p><p className="text-sm font-bold text-zinc-800 truncate">{user?.major || '-'}</p></div>
            </div>
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0 shadow-sm"><MapPin size={14}/></div>
                <div className="min-w-0 flex-1"><p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Location</p><p className="text-sm font-bold text-zinc-800 truncate">{user?.location || '-'}</p></div>
            </div>
        </div>

        {/* Bento 3: 현재 목표 */}
        <div 
            onClick={() => setBentoPopup('goals')}
            className="md:col-span-2 bg-gradient-to-r from-orange-50/30 to-amber-50/30 rounded-3xl p-6 md:px-8 border border-zinc-200 cursor-pointer hover:border-amber-200 hover:shadow-sm transition-all duration-300 group flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8"
        >
            <div className="shrink-0 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shadow-sm border border-amber-200"><Target size={16}/></div>
                <h4 className="text-sm font-black text-zinc-700">Current Goals</h4>
            </div>
            <div className="flex-1 flex flex-wrap gap-x-4 gap-y-2">
                {(user?.goals || []).map((goal, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 bg-white border border-zinc-200 px-3 py-1.5 rounded-lg shadow-sm group-hover:border-amber-200 transition-colors">{goal}</div>
                ))}
            </div>
        </div>

        {/* 🌟 NEW: Bento 4 - Social Links */}
        <div className="md:col-span-1 bg-zinc-900 rounded-3xl p-6 shadow-sm border border-zinc-800 flex items-center justify-center gap-3 flex-wrap">
            {dummyLinks.map((link, idx) => (
                <a 
                    key={idx} href={link.url} target="_blank" rel="noopener noreferrer" 
                    className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:scale-110 hover:-translate-y-1 transition-all ${link.color}`}
                    title={link.name}
                >
                    {link.icon}
                </a>
            ))}
        </div>
      </div>

      {/* --- EMPTY STATE BLUR --- */}
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

      {/* --- DETAIL PROFILES AREA --- */}
      {!isProfileEmpty && (
        <div className="mt-8 relative z-0">
          
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-zinc-900">Detail Profiles</h3>
            <div className="flex bg-zinc-100 p-1 rounded-xl border border-zinc-200/50">
              <button onClick={() => setDetailViewMode('tabs')} className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${detailViewMode === 'tabs' ? 'bg-white text-zinc-900 shadow-sm font-bold' : 'text-zinc-400 hover:text-zinc-600 font-medium'}`}>
                <List size={14}/> <span className="text-[11px] uppercase tracking-wider">Tabs</span>
              </button>
              <button onClick={() => setDetailViewMode('grid')} className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${detailViewMode === 'grid' ? 'bg-white text-zinc-900 shadow-sm font-bold' : 'text-zinc-400 hover:text-zinc-600 font-medium'}`}>
                <LayoutGrid size={14}/> <span className="text-[11px] uppercase tracking-wider">Grid</span>
              </button>
            </div>
          </div>

          {detailViewMode === 'tabs' && (
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
                  {activeTab === 'developer' && availableTabs.some(t => t.id === 'developer') && renderDeveloperContent()}
                  {activeTab === 'career' && availableTabs.some(t => t.id === 'career') && renderCareerContent()}
                  {activeTab === 'idol' && availableTabs.some(t => t.id === 'idol') && renderIdolContent()}
                  {/* 🌟 New Tab Contents */}
                  {activeTab === 'qna' && availableTabs.some(t => t.id === 'qna') && renderQnaContent()}
                  {activeTab === 'hobby' && availableTabs.some(t => t.id === 'hobby') && renderHobbyContent()}
                  {activeTab === 'vision' && availableTabs.some(t => t.id === 'vision') && renderVisionContent()}
                  {activeTab === 'quotes' && availableTabs.some(t => t.id === 'quotes') && renderQuotesContent()}
                  {activeTab === 'guestbook' && availableTabs.some(t => t.id === 'guestbook') && renderGuestbookContent()}
                </div>
            </>
          )}

          {detailViewMode === 'grid' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-in fade-in duration-300">
               {availableTabs.map(tab => (
                 <div 
                    key={tab.id}
                    onClick={() => setDetailPopup(tab.id)}
                    className={`group relative aspect-square bg-white rounded-[2rem] border border-zinc-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center p-4 text-center overflow-hidden ${tab.hoverClass}`}
                 >
                    <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-sm mb-4 transition-all duration-500 group-hover:scale-110 z-10 relative">
                        <div className={`w-full h-full rounded-full flex items-center justify-center ${tab.iconClass}`}>
                            {React.cloneElement(tab.icon, { size: 24 })}
                        </div>
                    </div>
                    <h4 className="text-sm font-black text-zinc-800 mb-1 relative z-10">{tab.label}</h4>
                    
                    <div className={`absolute bottom-4 flex items-center gap-1.5 text-[10px] font-bold opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-75 z-10 text-${tab.color}-600`}>
                        보기 <ArrowRight size={12}/>
                    </div>
                 </div>
               ))}
            </div>
          )}

          {/* ⭐️ Detail Popup Modal */}
          {detailPopup && (
            <div 
                className={`fixed inset-0 z-[200] bg-zinc-950/60 flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300 transition-all ${isSidebarOpen ? 'md:pl-72' : 'md:pl-20'}`} 
                onClick={() => setDetailPopup(null)}
            >
                <div className="bg-[#F8FAFC] w-[95%] max-w-4xl max-h-[85vh] overflow-hidden rounded-[2rem] shadow-2xl flex flex-col relative animate-in fade-in zoom-in-90 slide-in-from-bottom-8 duration-500 ease-out" onClick={e => e.stopPropagation()}>
                    
                    <div className={`flex items-center justify-between px-8 py-5 border-b border-zinc-200 bg-${allTabsMap[detailPopup]?.color}-50/30 shrink-0 z-10`}>
                        <h3 className={`text-lg font-black text-zinc-900 flex items-center gap-2 text-${allTabsMap[detailPopup]?.color}-700`}>
                           {allTabsMap[detailPopup]?.icon} {allTabsMap[detailPopup]?.label}
                        </h3>
                        <button onClick={() => setDetailPopup(null)} className="p-2 text-zinc-400 hover:bg-zinc-200 rounded-full transition"><CloseIcon size={20}/></button>
                    </div>

                    <div className="p-8 overflow-y-auto flex-1 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
                        {detailPopup === 'developer' && renderDeveloperContent()}
                        {detailPopup === 'career' && renderCareerContent()}
                        {detailPopup === 'idol' && renderIdolContent()}
                        {detailPopup === 'qna' && renderQnaContent()}
                        {detailPopup === 'hobby' && renderHobbyContent()}
                        {detailPopup === 'vision' && renderVisionContent()}
                        {detailPopup === 'quotes' && renderQuotesContent()}
                        {detailPopup === 'guestbook' && renderGuestbookContent()}
                    </div>
                </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileView;