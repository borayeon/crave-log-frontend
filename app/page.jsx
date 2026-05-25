"use client";
import React, { useState, useRef, useEffect, useMemo, createContext, useContext } from 'react';
import { 
  Instagram, Github, Mail, MapPin, Briefcase, 
  Sparkles, ArrowUpRight, Share2, Settings, CheckCircle, 
  Music, Plus, Trash2, Compass, User, History, Network, 
  List, ChevronUp, ChevronDown, Check, Share // 여기에 Share 추가!
} from 'lucide-react';

// ==========================================
// 🗂️ lib/constants.js (상수 데이터 분리)
// ==========================================
const USER_DATA = {
  name: "태경", handle: "taekyeong.dev", role: "Backend Developer",
  location: "Seoul, South Korea", bio: "기록의 힘을 믿습니다. 일상의 소소한 파편들을 모아 나만의 깊고 고유한 우주를 만듭니다 🚀",
  status: "CraveLog 엔진 고도화 중", tags: ["Spring Boot", "Next.js", "MySQL", "Docker", "Running", "Specialty Coffee"]
};

const SOCIAL_LINKS = [
  { id: 'insta', name: 'Instagram', icon: Instagram, url: '#', color: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600' },
  { id: 'github', name: 'GitHub', icon: Github, url: '#', color: 'bg-[#18181b]' },
];

const INITIAL_TIMELINE = [
  { id: 't1', date: "2026.05.20", title: "CraveLog UI 개편 작업", content: "옵시디언 스타일 물리 엔진 그래프 뷰 탑재.", tag: "개발" },
  { id: 't2', date: "2026.04.15", title: "마포 한강변 야간 러닝 시작", desc: "퇴근 후 바람 부는 마포 대교 아래를 달리니 막혔던 코딩 아이디어가 솟아난다.", tag: "일상" },
];

const INITIAL_NODES = [
  { id: 'me', label: '나 (태경)', category: 'root', color: 'from-indigo-500 to-rose-400', size: 'lg', desc: 'CraveLog의 시작점', extra: '나의 Identity' },
  { id: 'info', label: '내 정보', parentId: 'me', category: '내 정보', color: 'from-blue-400 to-indigo-500', size: 'md', desc: '태경에 대한 기본 프로필 데이터' },
  { id: 'hobbies', label: '취미', parentId: 'me', category: '취미', color: 'from-amber-400 to-orange-500', size: 'md', desc: '좋아하고 열정을 불태우는 행동들' },
  { id: 'daily', label: '일상', parentId: 'me', category: '일상', color: 'from-emerald-400 to-teal-500', size: 'md', desc: '하루하루의 소소한 가치 기록' },
  { id: 'info-school', label: '학교', parentId: 'info', category: '내 정보', color: 'from-slate-400 to-slate-500', size: 'sm', desc: '컴퓨터공학 전공' },
  { id: 'hobby-movie', label: '영화', parentId: 'hobbies', category: '취미', color: 'from-slate-400 to-slate-500', size: 'sm', desc: '인터스텔라, 인셉션' },
];

// ==========================================
// 🗂️ store/useStore.js (Zustand 대체 Context)
// ==========================================
const AppContext = createContext();

export const useAppStore = () => useContext(AppContext);

const AppProvider = ({ children }) => {
  // UI State
  const [viewMode, setViewMode] = useState('profile'); 
  const [graphSubMode, setGraphSubMode] = useState('graph');
  const [sheetHeight, setSheetHeight] = useState(190);
  const [toastMessage, setToastMessage] = useState('');
  
  // Data State
  const [timeline, setTimeline] = useState(INITIAL_TIMELINE);
  const [nodes, setNodes] = useState(INITIAL_NODES);
  
  // Interaction State
  const [selectedNodeId, setSelectedNodeId] = useState('me');
  const [hoveredNodeId, setHoveredNodeId] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Node Highlight Logic (Selector)
  const activeNodeIds = useMemo(() => {
    const active = new Set();
    if (!selectedNodeId) return active;
    
    active.add(selectedNodeId);
    let current = nodes.find(n => n.id === selectedNodeId);

    if (current && current.parentId === 'me') {
      nodes.filter(n => n.parentId === 'me').forEach(s => active.add(s.id));
    }

    while (current && current.parentId) {
      active.add(current.parentId);
      current = nodes.find(n => n.id === current.parentId);
    }
    
    const queue = [selectedNodeId];
    while (queue.length > 0) {
      const currId = queue.shift();
      nodes.filter(n => n.parentId === currId).forEach(c => {
        active.add(c.id);
        queue.push(c.id);
      });
    }
    return active;
  }, [selectedNodeId, nodes]);

  const value = {
    viewMode, setViewMode,
    graphSubMode, setGraphSubMode,
    sheetHeight, setSheetHeight,
    toastMessage, showToast,
    timeline, setTimeline,
    nodes, setNodes,
    selectedNodeId, setSelectedNodeId,
    hoveredNodeId, setHoveredNodeId,
    activeNodeIds
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};


// ==========================================
// 🗂️ components/common/Toast.jsx
// ==========================================
const Toast = () => {
  const { toastMessage } = useAppStore();
  if (!toastMessage) return null;
  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-[11px] tracking-tight py-2.5 px-4 shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-300 rounded-xl">
      <Sparkles size={13} className="text-yellow-400" />
      <span>{toastMessage}</span>
    </div>
  );
};


// ==========================================
// 🗂️ components/layout/BottomNavigation.jsx
// ==========================================
const BottomNavigation = () => {
  const { viewMode, setViewMode } = useAppStore();
  return (
    <nav className="absolute bottom-0 left-0 right-0 h-16 bg-white/85 backdrop-blur-md border-t border-slate-100 flex items-center justify-around px-8 z-50 shrink-0 select-none">
      <button onClick={() => setViewMode('home')} className={`flex flex-col items-center gap-1 transition-all w-16 h-full ${viewMode === 'home' ? 'text-indigo-600 font-extrabold scale-105' : 'text-slate-400 hover:text-slate-600'}`}><Compass size={18} /><span className="text-[9px]">홈</span></button>
      <button onClick={() => setViewMode('profile')} className={`flex flex-col items-center gap-1 transition-all w-16 h-full ${viewMode === 'profile' ? 'text-indigo-600 font-extrabold scale-105' : 'text-slate-400 hover:text-slate-600'}`}><User size={18} /><span className="text-[9px]">프로필</span></button>
      <button onClick={() => setViewMode('archive')} className={`flex flex-col items-center gap-1 transition-all w-16 h-full ${viewMode === 'archive' ? 'text-indigo-600 font-extrabold scale-105' : 'text-slate-400 hover:text-slate-600'}`}><Network size={18} /><span className="text-[9px] font-medium">스페이스</span></button>
    </nav>
  );
};


// ==========================================
// 🗂️ components/timeline/TimelineForm.jsx
// ==========================================
const TimelineForm = () => {
  const { setTimeline, showToast } = useAppStore();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [tag, setTag] = useState('일상');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return showToast("제목을 입력해 주세요.");
    
    const newPost = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('ko-KR').replace(/. /g, '.').slice(0, -1),
      title: title.trim(), desc: desc.trim(), tag
    };
    
    setTimeline(prev => [newPost, ...prev]);
    setTitle(''); setDesc('');
    showToast("새로운 소식이 기록되었습니다! 📅");
  };

  return (
    <section className="bg-slate-50/50 p-4 border border-slate-100 rounded-2xl">
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Plus size={13} className="text-indigo-600" />새로운 순간 흘려보내기</h3>
      <form onSubmit={handleSubmit} className="space-y-2.5">
        <div className="flex gap-2">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="오늘 무슨 기록을 남길까요?" className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 transition" />
          <select value={tag} onChange={(e) => setTag(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-2 text-xs font-bold text-slate-600 outline-none">
            <option value="개발">개발</option><option value="일상">일상</option><option value="문화">문화</option>
          </select>
        </div>
        <div className="flex gap-2">
          <input type="text" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="간단한 소감 코멘트 (선택)" className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-600 outline-none focus:border-indigo-500 transition" />
          <button type="submit" className="px-4 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition">기록</button>
        </div>
      </form>
    </section>
  );
};


// ==========================================
// 🗂️ components/timeline/TimelineView.jsx
// ==========================================
const TimelineView = () => {
  const { timeline, setTimeline, showToast } = useAppStore();

  const handleClear = (id) => {
    setTimeline(prev => prev.filter(item => item.id !== id));
    showToast("피드가 지워졌습니다.");
  };

  return (
    <div className="flex flex-col flex-1 bg-white overflow-hidden pb-16 animate-in fade-in duration-300">
      <header className="px-6 pt-6 pb-4 flex justify-between items-center z-10 border-b border-slate-50 shrink-0">
        <div className="flex items-center gap-2">
          <History size={16} className="text-indigo-600 animate-pulse" />
          <h1 className="text-sm font-bold text-slate-800 tracking-tight">CraveLog Feed</h1>
        </div>
      </header>

      <main className="flex-1 px-6 py-6 overflow-y-auto scrollbar-hide space-y-6">
        <TimelineForm />
        
        <section className="relative pl-4 border-l-2 border-slate-100 space-y-6 pb-6 mt-4">
          {timeline.map((post) => (
            <div key={post.id} className="relative group animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-4 ring-white" />
              <div className="bg-white p-4 border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition duration-300 flex justify-between items-start gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-indigo-500">{post.date}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[8px] font-black text-slate-500">{post.tag}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{post.title}</h4>
                  {post.desc && <p className="text-[11px] text-slate-500 leading-relaxed">{post.desc}</p>}
                </div>
                <button onClick={() => handleClear(post.id)} className="p-1 rounded-md text-slate-300 hover:text-rose-500 transition opacity-0 group-hover:opacity-100 shrink-0">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};


// ==========================================
// 🗂️ components/profile/ProfileView.jsx
// ==========================================
const ProfileView = () => {
  const { setViewMode, nodes } = useAppStore();

  return (
    <div className="flex flex-col flex-1 bg-white overflow-hidden pb-16 animate-in fade-in duration-300">
      <header className="px-6 pt-6 pb-4 flex justify-between items-center z-10 border-b border-slate-50 shrink-0">
        <button className="w-9 h-9 bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-xl"><Settings size={15} /></button>
        <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:bg-slate-800 transition"><Share size={13} /> 공유</button>
      </header>

      <main className="flex-1 px-6 py-6 overflow-y-auto scrollbar-hide space-y-6">
        {/* Profile Intro */}
        <section className="flex flex-col items-center text-center mt-2">
          <div className="relative mb-5">
            <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-rose-400 p-[3px] rounded-2xl shadow-sm">
              <div className="w-full h-full border-2 border-white bg-slate-100 flex items-center justify-center rounded-[1.2rem] overflow-hidden"><span className="text-3xl font-black text-slate-300">태</span></div>
            </div>
            <div className="absolute -bottom-1 -right-2 bg-slate-900 text-white px-2.5 py-1 shadow-sm flex items-center gap-1 rounded-lg"><Sparkles size={10} className="text-yellow-400 animate-pulse" /><span className="text-[9px] font-bold tracking-wider">{USER_DATA.status}</span></div>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1">{USER_DATA.name}</h1>
          <p className="text-xs font-bold text-slate-400 mt-0.5">@{USER_DATA.handle}</p>
          <p className="text-xs font-medium text-slate-600 mt-4 max-w-[280px] leading-relaxed border-t border-b border-slate-50 py-3">{USER_DATA.bio}</p>
        </section>

        {/* Bento Grid */}
        <section className="grid grid-cols-2 gap-3 pb-8">
          <div className="col-span-2 bg-slate-50 p-4 border border-slate-100 flex flex-col gap-2.5 hover:bg-slate-100/50 transition duration-300 rounded-2xl">
            <div className="flex items-center gap-3 text-slate-700"><div className="w-7 h-7 bg-white border border-slate-200/60 flex items-center justify-center text-slate-600 rounded-lg"><Briefcase size={13} /></div><span className="text-xs font-semibold">{USER_DATA.role}</span></div>
            <div className="flex items-center gap-3 text-slate-700"><div className="w-7 h-7 bg-white border border-slate-200/60 flex items-center justify-center text-slate-600 rounded-lg"><MapPin size={13} /></div><span className="text-xs font-semibold">{USER_DATA.location}</span></div>
          </div>

          {SOCIAL_LINKS.map(link => (
            <a key={link.id} href={link.url} className={`group relative p-4 text-white flex flex-col justify-between aspect-square overflow-hidden hover:translate-y-[-2px] transition-all duration-300 rounded-2xl ${link.color}`}>
              <div className="flex justify-between items-start"><div className="p-1.5 bg-white/20 backdrop-blur-md border border-white/10 rounded-xl">{link.icon}</div><ArrowUpRight size={16} className="opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" /></div>
              <span className="font-bold text-xs tracking-tight">{link.name}</span>
            </a>
          ))}

          <div className="col-span-2 bg-[#09090b] p-5 text-white relative overflow-hidden group cursor-pointer hover:bg-black transition-all duration-300 border border-slate-800 rounded-2xl shadow-sm" onClick={() => setViewMode('archive')}>
            <div className="absolute -right-4 -top-4 opacity-20"><Compass size={110} strokeWidth={1} className="text-indigo-400 transition-transform duration-700 group-hover:rotate-45" /></div>
            <div className="relative z-10">
              <div className="w-8 h-8 bg-white/10 backdrop-blur-md flex items-center justify-center mb-3 border border-white/10 rounded-lg"><Music size={15} className="text-white" /></div>
              <h3 className="text-sm font-bold mb-1 tracking-tight flex items-center gap-1.5">My Personal Space<Sparkles size={12} className="text-indigo-400" /></h3>
              <p className="text-[11px] font-medium text-slate-400 leading-relaxed">거주지, 취미, 여행, 영화 기록 보관함 ({nodes.length - 1}개)</p>
            </div>
            <ArrowUpRight size={16} className="absolute right-5 bottom-5 text-indigo-400 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>
        </section>
      </main>
    </div>
  );
};


// ==========================================
// 🗂️ components/space/GraphCanvas.jsx
// ==========================================
const GraphCanvas = () => {
  const { nodes, selectedNodeId, setSelectedNodeId, hoveredNodeId, setHoveredNodeId, activeNodeIds, sheetHeight, graphSubMode } = useAppStore();
  const simNodes = useRef([]);
  const canvasRef = useRef(null);
  const [tick, setTick] = useState(0); 
  
  const isPanning = useRef(false);
  const draggedNodeIdRef = useRef(null);
  const lastMouse = useRef({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // 호버 트래킹 (로컬)
  const activeHighlightIds = useMemo(() => {
    if (!hoveredNodeId) return null;
    const set = new Set();
    set.add(hoveredNodeId);
    simNodes.current.forEach(n => {
      if (n.id === hoveredNodeId && n.parentId) set.add(n.parentId);
      if (n.parentId === hoveredNodeId) set.add(n.id);
    });
    return set;
  }, [hoveredNodeId, tick]);

  // 물리 엔진 동기화 및 루프 (Phase 1: Worker 분리 전)
  useEffect(() => {
    const currentSims = simNodes.current || [];
    simNodes.current = nodes.map(n => {
      const existing = currentSims.find(sn => sn.id === n.id);
      if (existing) return { ...n, x: existing.x, y: existing.y, vx: existing.vx, vy: existing.vy };
      const parent = currentSims.find(sn => sn.id === n.parentId);
      const startX = parent ? parent.x + (Math.random() - 0.5) * 40 : 200 + (Math.random() - 0.5) * 80;
      const startY = parent ? parent.y + (Math.random() - 0.5) * 40 : 200 + (Math.random() - 0.5) * 80;
      return { ...n, x: startX, y: startY, vx: 0, vy: 0 };
    });
  }, [nodes]);

  useEffect(() => {
    if (graphSubMode !== 'graph') return;
    let animationId;
    const step = () => {
      const ns = simNodes.current;
      const edges = [];
      ns.forEach(n => { if (n.parentId) edges.push({ source: n.id, target: n.parentId }); });

      const damping = 0.85; const repulsion = 1200; const springK = 0.05; const springDist = 60; const centerGravity = 0.015; 

      for (let i = 0; i < ns.length; i++) {
        for (let j = i + 1; j < ns.length; j++) {
          const dx = ns[i].x - ns[j].x; const dy = ns[i].y - ns[j].y;
          let distSq = dx * dx + dy * dy || 1; const dist = Math.sqrt(distSq);
          const force = repulsion / distSq; const fx = (dx / dist) * force; const fy = (dy / dist) * force;
          ns[i].vx += fx; ns[i].vy += fy; ns[j].vx -= fx; ns[j].vy -= fy;
        }
      }

      edges.forEach(edge => {
        const n1 = ns.find(n => n.id === edge.source); const n2 = ns.find(n => n.id === edge.target);
        if(!n1 || !n2) return;
        const dx = n2.x - n1.x; const dy = n2.y - n1.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (dist - springDist) * springK;
        const fx = (dx / dist) * force; const fy = (dy / dist) * force;
        n1.vx += fx; n1.vy += fy; n2.vx -= fx; n2.vy -= fy;
      });

      ns.forEach(n => {
        n.vx += (200 - n.x) * centerGravity; n.vy += (200 - n.y) * centerGravity;
        if (draggedNodeIdRef.current !== n.id) { n.x += n.vx; n.y += n.vy; } else { n.vx = 0; n.vy = 0; }
        n.vx *= damping; n.vy *= damping;
      });

      setTick(t => t + 1); 
      animationId = requestAnimationFrame(step);
    };
    animationId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationId);
  }, [graphSubMode]);

  // 포인터 이벤트 관리
  const handleCanvasPointerDown = (e) => {
    const clientX = e.clientX || (e.touches && e.touches?.clientX);
    const clientY = e.clientY || (e.touches && e.touches?.clientY);
    lastMouse.current = { x: clientX, y: clientY };
    isPanning.current = true;
  };

  const handleNodePointerDown = (id, e) => {
    e.stopPropagation();
    isPanning.current = false;
    draggedNodeIdRef.current = id;
    setSelectedNodeId(id);
  };

  useEffect(() => {
    const handleMove = (e) => {
      const cx = e.clientX || (e.touches && e.touches?.clientX);
      const cy = e.clientY || (e.touches && e.touches?.clientY);
      if (cx === undefined || cy === undefined) return;
      const dx = cx - lastMouse.current.x; const dy = cy - lastMouse.current.y;

      if (isPanning.current) setPanOffset(p => ({ x: p.x + dx, y: p.y + dy }));
      if (draggedNodeIdRef.current) {
        const node = simNodes.current.find(n => n.id === draggedNodeIdRef.current);
        if (node) {
          const scale = 1.0 - (((Math.max(190, Math.min(440, sheetHeight)) - 190) / 250) * 0.18);
          node.x += dx / scale; node.y += dy / scale; node.vx = 0; node.vy = 0;
        }
      }
      lastMouse.current = { x: cx, y: cy };
    };
    const handleUp = () => { isPanning.current = false; draggedNodeIdRef.current = null; };

    window.addEventListener('mousemove', handleMove); window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove, { passive: false }); window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove); window.removeEventListener('touchend', handleUp);
    };
  }, [sheetHeight]);

  const transformStyle = () => {
    const ratio = (Math.max(190, Math.min(440, sheetHeight)) - 190) / 250;
    const scale = 1.0 - (ratio * 0.18);
    const translateY = -(ratio * 55) + panOffset.y;
    return {
      transform: `scale(${scale}) translate(${panOffset.x}px, ${translateY}px)`,
      transformOrigin: '200px 220px',
      transition: isPanning.current || draggedNodeIdRef.current ? 'none' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
    };
  };

  return (
    <div ref={canvasRef} onMouseDown={handleCanvasPointerDown} onTouchStart={handleCanvasPointerDown} className="flex-1 relative bg-[#FAF9F6] overflow-hidden select-none cursor-grab active:cursor-grabbing">
      <div className="absolute inset-0 bg-[radial-gradient(#E2E8F0_1px,transparent_1px)] bg-[size:20px_20px] opacity-60 pointer-events-none" />
      <div style={transformStyle()} className="w-full h-full relative">
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
          {simNodes.current.map(node => {
            if (!node.parentId) return null;
            const parent = simNodes.current.find(n => n.id === node.parentId);
            if (!parent) return null;
            const isHighlighted = activeHighlightIds ? (activeHighlightIds.has(node.id) && activeHighlightIds.has(parent.id)) : (activeNodeIds.has(node.id) && activeNodeIds.has(parent.id));
            return (
              <line key={`link-${node.id}`} x1={parent.x} y1={parent.y} x2={node.x} y2={node.y}
                stroke={isHighlighted ? "#CBD5E1" : "#F1F5F9"} strokeWidth={isHighlighted ? "1.5" : "0.5"}
                className="transition-all duration-300" style={{ opacity: isHighlighted ? 1 : 0.1 }} />
            );
          })}
        </svg>

        {simNodes.current.map(node => {
          const isSelected = selectedNodeId === node.id;
          const isHovered = hoveredNodeId === node.id;
          const isHighlighted = activeHighlightIds ? activeHighlightIds.has(node.id) : activeNodeIds.has(node.id);
          const dotSize = node.size === 'lg' ? 'w-4 h-4' : node.size === 'md' ? 'w-3 h-3' : 'w-2 h-2';

          return (
            <div key={node.id} onMouseDown={(e) => handleNodePointerDown(node.id, e)} onTouchStart={(e) => handleNodePointerDown(node.id, e)}
              onMouseEnter={() => setHoveredNodeId(node.id)} onMouseLeave={() => setHoveredNodeId(null)}
              style={{ position: 'absolute', left: `${node.x}px`, top: `${node.y}px`, transform: 'translate(-50%, -50%)', zIndex: isSelected || isHovered ? 40 : isHighlighted ? 20 : 10, opacity: isHighlighted ? 1 : 0.15 }}
              className="absolute cursor-pointer select-none transition-opacity duration-300 group"
            >
              <div className={`rounded-full bg-gradient-to-br ${node.color} shadow-sm transition-transform duration-200 ${dotSize} ${isSelected ? 'ring-4 ring-indigo-200 scale-125' : 'group-hover:scale-125'}`} />
              <span className={`absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap font-bold pointer-events-none transition-colors duration-200 drop-shadow-sm ${isSelected ? 'text-indigo-600 text-xs' : 'text-slate-600 text-[10px] group-hover:text-slate-900'}`}>
                {node.label}
              </span>
            </div>
          );
        })}
      </div>
      <button onClick={(e) => { e.stopPropagation(); setPanOffset({x:0, y:0}); }} className="absolute bottom-4 right-4 p-2 bg-white/80 backdrop-blur border border-slate-200 text-slate-500 rounded-full shadow-sm hover:text-slate-800 z-50 text-[10px] font-bold">
        중앙 정렬
      </button>
    </div>
  );
};


// ==========================================
// 🗂️ components/space/SpaceBottomSheet.jsx
// ==========================================
const SpaceBottomSheet = () => {
  const { sheetHeight, setSheetHeight, selectedNodeId, nodes, setNodes, showToast } = useAppStore();
  const [isDraggingSheet, setIsDraggingSheet] = useState(false);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);
  const currentHeightRef = useRef(sheetHeight);

  // 로컬 에디트 폼 상태
  const [showAddForm, setShowAddForm] = useState(false);
  const [newChildLabel, setNewChildLabel] = useState('');
  const [editLabel, setEditLabel] = useState('');
  
  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const subItems = selectedNode ? (selectedNode.id === 'me' ? nodes.filter(n => n.id !== 'me') : [...nodes.filter(n => n.parentId === selectedNode.id), ...nodes.filter(n => nodes.filter(c => c.parentId === selectedNode.id).map(c => c.id).includes(n.parentId))]) : [];

  useEffect(() => {
    if (selectedNode) setEditLabel(selectedNode.label);
    setShowAddForm(false);
  }, [selectedNodeId]);

  const handleSheetDragStart = (e) => {
    e.preventDefault(); setIsDraggingSheet(true);
    dragStartY.current = e.clientY || (e.touches && e.touches?.clientY); dragStartHeight.current = sheetHeight;
  };

  useEffect(() => {
    const handleMove = (e) => {
      if (!isDraggingSheet) return;
      const cy = e.clientY || (e.touches && e.touches?.clientY);
      if (cy === undefined) return;
      const h = Math.max(190, Math.min(440, dragStartHeight.current + (dragStartY.current - cy)));
      setSheetHeight(h); currentHeightRef.current = h;
    };
    const handleUp = () => {
      if (!isDraggingSheet) return;
      setIsDraggingSheet(false);
      const h = currentHeightRef.current >= 315 ? 440 : 190;
      setSheetHeight(h); currentHeightRef.current = h;
    };
    if (isDraggingSheet) {
      window.addEventListener('mousemove', handleMove); window.addEventListener('mouseup', handleUp);
      window.addEventListener('touchmove', handleMove, { passive: false }); window.addEventListener('touchend', handleUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove); window.removeEventListener('touchend', handleUp);
    };
  }, [isDraggingSheet]);

  const handleAddChild = (e) => {
    e.preventDefault();
    if (!newChildLabel.trim()) return showToast("이름을 적어주세요.");
    const newId = `node-${Date.now()}`;
    setNodes(prev => [...prev, { id: newId, label: newChildLabel.trim(), parentId: selectedNodeId, category: selectedNode.category === 'root' ? '일상' : selectedNode.category, color: 'from-slate-400 to-slate-500', size: 'sm', desc: '새 노드' }]);
    setNewChildLabel(''); setShowAddForm(false); showToast(`추가되었습니다!`);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!editLabel.trim()) return showToast("노드 이름은 필수입니다.");
    setNodes(prev => prev.map(n => n.id === selectedNodeId ? { ...n, label: editLabel.trim() } : n));
    showToast("저장되었습니다.");
  };

  const handleDelete = (id) => {
    if (id === 'me') return showToast("중심 노드는 지울 수 없습니다.");
    setNodes(prev => prev.filter(n => n.id !== id && n.parentId !== id));
    showToast("제거되었습니다.");
  };

  return (
    <div style={{ height: `${sheetHeight}px`, transition: isDraggingSheet ? 'none' : 'height 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }} className="bg-white border-t border-slate-100/95 flex flex-col shrink-0 shadow-[0_-10px_35px_rgba(0,0,0,0.03)] relative z-50">
      <div onMouseDown={handleSheetDragStart} onTouchStart={handleSheetDragStart} onClick={() => setSheetHeight(sheetHeight < 300 ? 440 : 190)} className="w-full py-2.5 cursor-ns-resize hover:bg-slate-50/80 shrink-0 flex flex-col items-center gap-1 border-b border-slate-50">
        <div className="w-10 h-1.5 bg-slate-200 rounded-full" />
        <span className="text-[8px] font-black text-slate-400 uppercase flex items-center gap-0.5">{sheetHeight < 300 ? <><ChevronUp size={10} className="animate-bounce" /> 올려보기</> : <><ChevronDown size={10} /> 닫기</>}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 scrollbar-hide bg-white">
        {selectedNode ? (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[8px] font-extrabold uppercase text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">{selectedNode.category}</span>
                <h3 className="text-xs font-black text-slate-900 mt-1">{selectedNode.label}</h3>
              </div>
              <button onClick={() => setShowAddForm(!showAddForm)} className="px-2.5 py-1 rounded-lg bg-slate-50 text-[10px] font-bold text-slate-600 border border-slate-200/50 hover:bg-slate-100">+ 노드 추가</button>
            </div>

            {showAddForm && (
              <form onSubmit={handleAddChild} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex gap-2">
                <input type="text" value={newChildLabel} onChange={(e) => setNewChildLabel(e.target.value)} placeholder="하위 노드명..." className="flex-1 px-3 py-1.5 text-xs font-bold rounded-lg border outline-none focus:border-indigo-500" autoFocus />
                <button type="submit" className="px-3 bg-slate-900 text-white rounded-lg text-xs font-bold">생성</button>
              </form>
            )}

            <form onSubmit={handleUpdate} className="flex gap-2 pt-1 border-t border-slate-50">
              <input type="text" value={editLabel} onChange={(e) => setEditLabel(e.target.value)} placeholder="이름 변경" className="flex-1 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-500" />
              <button type="submit" className="px-3 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-black transition flex items-center gap-1 shrink-0"><Check size={12} /> 저장</button>
            </form>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between pb-1"><span className="text-[10px] font-black text-slate-400">📋 하위 피드</span><span className="text-[9px] font-extrabold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">{subItems.length}개</span></div>
              {subItems.length === 0 ? <div className="py-6 text-center text-slate-350 text-[11px] font-semibold bg-slate-50 rounded-xl border border-slate-100">하위 노드가 없습니다.</div> : (
                <div className="space-y-2 pb-6">
                  {subItems.map(item => (
                    <div key={item.id} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-start justify-between gap-3 group">
                      <div className="space-y-1 min-w-0 flex-1"><h4 className="text-[11px] font-bold text-slate-900 truncate">{item.label}</h4><p className="text-[10px] text-slate-500 leading-relaxed font-semibold">{item.desc}</p></div>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-md text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition shrink-0"><Trash2 size={11} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (<div className="py-12 text-center text-xs text-slate-300 font-bold">노드를 선택하세요.</div>)}
      </div>
    </div>
  );
};


// ==========================================
// 🗂️ components/space/SpaceView.jsx
// ==========================================
const SpaceView = () => {
  const { graphSubMode, setGraphSubMode } = useAppStore();

  return (
    <div className="flex flex-col flex-1 bg-slate-50 h-full overflow-hidden animate-in slide-in-from-right duration-500 pb-16">
      <header className="px-6 pt-5 pb-3 bg-white border-b border-slate-100 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-2">
          <Network size={16} className="text-indigo-600" />
          <div><h2 className="text-sm font-bold text-slate-950">아이덴티티 맵</h2><p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">드래그와 패닝으로 탐색하세요</p></div>
        </div>
        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50 shrink-0">
          <button onClick={() => setGraphSubMode('graph')} className={`px-2.5 py-1 rounded-md text-[10px] font-black transition-all flex items-center gap-1 ${graphSubMode === 'graph' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}><Network size={11} />지도</button>
          <button onClick={() => setGraphSubMode('list')} className={`px-2.5 py-1 rounded-md text-[10px] font-black transition-all flex items-center gap-1 ${graphSubMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}><List size={11} />목록</button>
        </div>
      </header>

      {graphSubMode === 'graph' ? (
        <>
          <GraphCanvas />
          <SpaceBottomSheet />
        </>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 animate-in fade-in duration-300 items-center justify-center text-slate-400 text-sm font-bold">
          {/* List View Placeholder for brevity */}
          리스트 뷰 컴포넌트가 위치합니다.
        </div>
      )}
    </div>
  );
};


// ==========================================
// 🗂️ app/page.jsx (최상단 메인 엔트리)
// ==========================================
const AppContent = () => {
  const { viewMode } = useAppStore();

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex justify-center items-center font-sans p-0 sm:p-4">
      <div className="w-full max-w-md bg-white h-screen sm:h-[82vh] sm:max-h-[800px] sm:min-h-[680px] flex flex-col relative shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden sm:rounded-[2rem] transition-all duration-300">
        <Toast />
        {viewMode === 'home' && <TimelineView />}
        {viewMode === 'profile' && <ProfileView />}
        {viewMode === 'archive' && <SpaceView />}
        <BottomNavigation />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}