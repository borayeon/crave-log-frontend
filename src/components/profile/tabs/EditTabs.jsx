import React, { useState, useRef } from 'react';
import { 
  Code, Briefcase, Trash2, Terminal, ExternalLink, Plus, 
  Calendar, History, ChevronDown, X as CloseIcon, UserPlus, 
  Image as ImageIcon, Upload, Loader2, Compass, Heart, 
  CreditCard, MessageSquare, Target, Quote, FileText, Grid, Eraser, 
  Layers, Check, Rocket, Lock, GraduationCap, Mic, LayoutList,
  Globe, Users, KeyRound, EyeOff, Bell, Award,
  ArrowUp, ArrowDown, Copy, Eye, Sparkles,
  Server, Database, Monitor, Wrench
} from 'lucide-react';
import BusinessCard from './BusinessCard';
import { useAppStore } from '../../../store/AppStore';

export const DeveloperEditTab = ({ formData, updateNested }) => {
  const { currentLang, showToast } = useAppStore();
  const [activeMode, setActiveMode] = useState('edit'); // 'edit' | 'preview'
  const [customInputValues, setCustomInputValues] = useState({});

  const devData = formData.developer || {};
  const projects = devData.projects || [];

  const TECH_CATEGORIES = [
    { key: 'backend', label: 'Backend', icon: Server, color: 'text-sky-500', bg: 'bg-sky-50/70', border: 'border-sky-200', badgeColor: 'bg-sky-50 text-sky-700 border-sky-200' },
    { key: 'frontend', label: 'Frontend', icon: Monitor, color: 'text-violet-500', bg: 'bg-violet-50/70', border: 'border-violet-200', badgeColor: 'bg-violet-50 text-violet-700 border-violet-200' },
    { key: 'db', label: 'Database & Cache', icon: Database, color: 'text-emerald-500', bg: 'bg-emerald-50/70', border: 'border-emerald-200', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { key: 'tools', label: 'DevOps & Tools', icon: Wrench, color: 'text-amber-500', bg: 'bg-amber-50/70', border: 'border-amber-200', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200' },
  ];

  const TECH_PRESETS = {
    backend: ['Java', 'Spring Boot', 'Node.js', 'Python', 'FastAPI', 'NestJS', 'Go', 'Kotlin', 'Django', 'Express'],
    frontend: ['React', 'Next.js', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'Vue.js', 'Redux', 'Zustand', 'HTML/CSS'],
    db: ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Oracle', 'SQLite', 'DynamoDB', 'Prisma', 'JPA'],
    tools: ['Docker', 'Kubernetes', 'AWS', 'Git', 'GitHub Actions', 'Linux', 'Nginx', 'Vercel', 'Figma', 'Postman'],
    learning: ['AI / LLM', 'Rust', 'WebAssembly', 'GraphQL', 'Kafka', 'Microservices', 'Cybersecurity', 'Golang']
  };

  const BIO_TEMPLATES = [
    {
      id: 'problem_solver',
      label: currentLang === 'zh' ? '💡 解决问题导向' : currentLang === 'en' ? '💡 Problem Solver' : '💡 문제 해결 중심',
      text: currentLang === 'zh' 
        ? '专注于用技术解决真实的业务问题，重视用户体验与高可用扩展架构。追求编写高内聚、低耦合且整洁易读的代码。' 
        : currentLang === 'en' 
        ? 'Passionate about solving real-world business problems through technology. I prioritize user experience and scalable, resilient architectures.' 
        : '비즈니스 문제를 기술로 풀어내는 것에 열정을 가진 개발자입니다. 사용자 경험과 확장 가능한 아키텍처를 고민하며, 단단하고 읽기 쉬운 코드를 지향합니다.'
    },
    {
      id: 'growth_team',
      label: currentLang === 'zh' ? '🤝 团队协作与成长' : currentLang === 'en' ? '🤝 Growth & Teamwork' : '🤝 성장과 협업',
      text: currentLang === 'zh'
        ? '热爱学习前沿技术并乐于与团队分享。倡导积极的代码评审和开放透明的技术交流，共同打造高效协作的工程团队。'
        : currentLang === 'en'
        ? 'I enjoy learning emerging technologies and sharing knowledge with peers. I advocate for active code reviews, open communication, and team synergy.'
        : '새로운 기술을 학습하고 동료와 지식을 나누는 것을 즐깁니다. 적극적인 코드 리뷰와 투명한 소통을 통해 팀 전체의 시너지를 만듭니다.'
    },
    {
      id: 'performance_arch',
      label: currentLang === 'zh' ? '⚡ 架构与性能优化' : currentLang === 'en' ? '⚡ High Performance' : '⚡ 성능 및 아키텍처',
      text: currentLang === 'zh'
        ? '专注于高并发海量数据环境下的系统性能调优与分布式微服务架构。坚持用数据和监控驱动迭代与持续重构。'
        : currentLang === 'en'
        ? 'Focused on performance optimization, low latency, and distributed architectures for high-traffic environments. Driven by metrics and continuous improvement.'
        : '대규모 트래픽 환경에서의 성능 최적화와 안정적인 분산 시스템 설계에 관심이 많습니다. 데이터 기반의 빠른 실험과 모니터링을 통한 개선을 추구합니다.'
    }
  ];

  const getCategoryArray = (catKey) => {
    const val = (devData.techStack || {})[catKey];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string' && val.trim()) return val.split(',').map(s => s.trim()).filter(Boolean);
    return [];
  };

  const getLearningArray = () => {
    const val = devData.learning;
    if (Array.isArray(val)) return val;
    if (typeof val === 'string' && val.trim()) return val.split(',').map(s => s.trim()).filter(Boolean);
    return [];
  };

  const toggleSkill = (catKey, skillName) => {
    if (catKey === 'learning') {
      const arr = getLearningArray();
      const exists = arr.includes(skillName);
      const newArr = exists ? arr.filter(s => s !== skillName) : [...arr, skillName];
      updateNested(["developer", "learning"], newArr.join(', '));
    } else {
      const arr = getCategoryArray(catKey);
      const exists = arr.includes(skillName);
      const newArr = exists ? arr.filter(s => s !== skillName) : [...arr, skillName];
      updateNested(["developer", "techStack", catKey], newArr.join(', '));
    }
  };

  const handleCustomInputKeyDown = (catKey, e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = (customInputValues[catKey] || '').trim();
      if (val) {
        toggleSkill(catKey, val);
        setCustomInputValues(prev => ({ ...prev, [catKey]: '' }));
      }
    }
  };

  const handleCustomInputBlur = (catKey) => {
    const val = (customInputValues[catKey] || '').trim();
    if (val) {
      toggleSkill(catKey, val);
      setCustomInputValues(prev => ({ ...prev, [catKey]: '' }));
    }
  };

  const applyBioTemplate = (templateText) => {
    const current = devData.about || '';
    if (current.trim().length > 0 && !window.confirm(currentLang === 'zh' ? '当前已写有自我介绍，是否要覆盖为所选模板？' : currentLang === 'en' ? 'Overwrite your existing introduction with this template?' : '현재 작성된 자기소개가 있습니다. 선택한 템플릿으로 변경하시겠습니까?')) {
      return;
    }
    updateNested(["developer", "about"], templateText);
    showToast(currentLang === 'zh' ? '模板已应用！✨' : currentLang === 'en' ? 'Template applied! ✨' : '템플릿이 적용되었습니다! ✨');
  };

  const moveProject = (index, direction) => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= projects.length) return;
    const arr = [...projects];
    const [item] = arr.splice(index, 1);
    arr.splice(targetIdx, 0, item);
    updateNested(["developer", "projects"], arr);
  };

  const duplicateProject = (index) => {
    const item = projects[index];
    if (!item) return;
    const copy = { 
      ...item, 
      name: `${item.name || (currentLang === 'zh' ? '项目' : currentLang === 'en' ? 'Project' : '프로젝트')} (Copy)`
    };
    const arr = [...projects];
    arr.splice(index + 1, 0, copy);
    updateNested(["developer", "projects"], arr);
    showToast(currentLang === 'zh' ? '项目已复制。' : currentLang === 'en' ? 'Project duplicated.' : '프로젝트가 복사되었습니다.');
  };

  const deleteProject = (index) => {
    const arr = [...projects];
    arr.splice(index, 1);
    updateNested(["developer", "projects"], arr);
  };

  const addProject = () => {
    const newProj = {
      name: "",
      date: "",
      role: "",
      desc: "",
      githubUrl: "",
      liveUrl: ""
    };
    updateNested(["developer", "projects"], [...projects, newProj]);
  };

  const totalTechCount = TECH_CATEGORIES.reduce((acc, cat) => acc + getCategoryArray(cat.key).length, 0) + getLearningArray().length;

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* ⭐️ 상단 스튜디오 컨트롤 바 (요약 통계 & 모드 전환) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-zinc-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
            <Terminal size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-zinc-900 tracking-tight">
                {currentLang === 'zh' ? '开发者工作台 (Developer Studio)' : currentLang === 'en' ? 'Developer Studio' : '개발자 스튜디오 (Developer Studio)'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                v2.0
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-[11px] font-bold text-zinc-400">
              <span>{totalTechCount} {currentLang === 'zh' ? '项技术栈' : currentLang === 'en' ? 'Skills' : '개 기술 스택'}</span>
              <span>·</span>
              <span>{projects.length} {currentLang === 'zh' ? '个项目' : currentLang === 'en' ? 'Projects' : '개 프로젝트'}</span>
            </div>
          </div>
        </div>

        {/* 편집기 vs 실시간 미리보기 토글 버튼 */}
        <div className="flex bg-zinc-100 p-1 rounded-2xl shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveMode('edit')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
              activeMode === 'edit'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Code size={13} className={activeMode === 'edit' ? 'text-indigo-600' : ''} />
            <span>{currentLang === 'zh' ? '编辑器' : currentLang === 'en' ? 'Editor' : '에디터'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('preview')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
              activeMode === 'preview'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Eye size={13} className={activeMode === 'preview' ? 'text-indigo-600' : ''} />
            <span>{currentLang === 'zh' ? '实时预览' : currentLang === 'en' ? 'Live Preview' : '실시간 미리보기'}</span>
          </button>
        </div>
      </div>

      {/* ⭐️ 실시간 미리보기 모드 */}
      {activeMode === 'preview' ? (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-indigo-50 text-indigo-800 p-3.5 rounded-2xl border border-indigo-200/80 text-xs font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles size={15} className="text-indigo-600" />
              {currentLang === 'zh' ? '访客实际看到的开发者标签页实时效果。' : currentLang === 'en' ? 'This is how your Developer Tab appears to profile visitors.' : '방문자에게 실제로 노출되는 개발자 탭의 실시간 렌더링 화면입니다.'}
            </span>
            <button
              type="button"
              onClick={() => setActiveMode('edit')}
              className="text-[11px] underline font-black text-indigo-700 hover:text-indigo-900"
            >
              {currentLang === 'zh' ? '返回编辑' : currentLang === 'en' ? 'Back to Editor' : '수정하러 가기'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {/* 좌측 소개 & 기술 스택 */}
            <div className="md:col-span-1 flex flex-col gap-4">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100">
                <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <UserPlus size={14}/> About Me
                </h4>
                <p className="text-sm text-zinc-700 leading-relaxed font-medium whitespace-pre-line">
                  {devData.about || (currentLang === 'zh' ? '暂无自我介绍。' : currentLang === 'en' ? 'No about me entered.' : '입력된 자기소개가 없습니다.')}
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100">
                <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                  <Code size={14}/> Tech Stack
                </h4>
                <div className="space-y-4">
                  {TECH_CATEGORIES.map(cat => {
                    const list = getCategoryArray(cat.key);
                    if (list.length === 0) return null;
                    return (
                      <div key={cat.key}>
                        <span className="block text-[10px] font-black text-zinc-400 uppercase mb-2">{cat.label}</span>
                        <div className="flex flex-wrap gap-1.5">
                          {list.map((tech, i) => (
                            <span key={i} className="px-2.5 py-1 bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-xl text-[11px] font-bold shadow-2xs">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {getLearningArray().length > 0 && (
                    <div>
                      <span className="block text-[10px] font-black text-rose-400 uppercase mb-2">Currently Learning</span>
                      <div className="flex flex-wrap gap-1.5">
                        {getLearningArray().map((tech, i) => (
                          <span key={i} className="px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-[11px] font-bold shadow-2xs">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 우측 프로젝트 목록 */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-100 h-full">
                <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-5 flex items-center gap-1.5">
                  <Rocket size={14}/> Featured Projects
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  {projects.map((proj, idx) => (
                    <div key={idx} className="p-5 bg-zinc-50/70 rounded-2xl border border-zinc-200/70 hover:bg-white hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-base font-black text-zinc-900">{proj.name || 'Untitled Project'}</h5>
                            {proj.role && (
                              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-200">
                                {proj.role}
                              </span>
                            )}
                          </div>
                          {proj.date && <p className="text-[10px] font-bold text-zinc-400 mt-0.5">{proj.date}</p>}
                        </div>
                        <div className="flex gap-1.5 text-zinc-400 shrink-0">
                          {proj.githubUrl && (
                            <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="bg-white border border-zinc-200 p-1.5 rounded-lg hover:text-zinc-900 transition shadow-2xs">
                              <Terminal size={14} />
                            </a>
                          )}
                          {proj.liveUrl && (
                            <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer" className="bg-white border border-zinc-200 p-1.5 rounded-lg hover:text-violet-600 transition shadow-2xs">
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-zinc-600 font-medium leading-relaxed whitespace-pre-line mt-2">
                        {proj.desc || (currentLang === 'zh' ? '暂无项目简介。' : currentLang === 'en' ? 'No project description.' : '프로젝트 설명이 없습니다.')}
                      </p>
                    </div>
                  ))}
                  {projects.length === 0 && (
                    <p className="text-sm text-zinc-400 font-medium text-center py-12 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                      {currentLang === 'zh' ? '暂无登记的项目。' : currentLang === 'en' ? 'No projects registered.' : '등록된 프로젝트가 없습니다.'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ⭐️ 편집기 모드 (Editor Mode) */
        <div className="space-y-6">
          
          {/* 1. IDE 터미널 스타일 About Me 편집기 */}
          <div className="bg-[#0D1117] text-zinc-300 rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-800 relative overflow-hidden">
            {/* macOS 윈도우 컨트롤 헤더 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-zinc-800/80">
              <div className="flex items-center gap-2.5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]"></div>
                </div>
                <span className="text-[11px] font-mono font-bold text-zinc-400 ml-2 flex items-center gap-1.5 bg-[#161B22] px-2.5 py-1 rounded-md border border-zinc-800">
                  <Terminal size={12} className="text-emerald-400" /> developer_bio.ts
                </span>
                <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline">git:(main)</span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500 font-medium self-end sm:self-auto">
                {(devData.about || '').length} characters
              </span>
            </div>

            {/* 빠른 추천 템플릿 바 */}
            <div className="mb-4">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-2">
                <Sparkles size={12} className="text-amber-400" />
                {currentLang === 'zh' ? '快捷灵感模板 (点击应用)' : currentLang === 'en' ? 'Quick Bio Starters (Click to apply)' : '빠른 추천 템플릿 (클릭 시 자동 적용)'}
              </div>
              <div className="flex flex-wrap gap-2">
                {BIO_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => applyBioTemplate(tmpl.text)}
                    className="px-3 py-1.5 bg-[#161B22] hover:bg-[#21262D] border border-zinc-700/80 hover:border-emerald-500/50 text-zinc-300 text-[11px] font-bold rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <span>{tmpl.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 에디터 텍스트 영역 */}
            <div className="relative mt-2">
              <div className="text-zinc-500 font-mono text-[11px] font-bold mb-2">
                {"// Who I am & What drives my engineering:"}
              </div>
              <textarea 
                value={devData.about || ''} 
                onChange={e => updateNested(["developer", "about"], e.target.value)} 
                rows={4} 
                placeholder={currentLang === 'zh' ? '撰写作为开发者的自我介绍与工程哲学。' : currentLang === 'en' ? 'Write an introduction as a developer and your engineering philosophy.' : '개발자로서의 자기소개와 지향하는 엔지니어링 가치관을 작성해보세요.'}
                className="w-full bg-[#161B22] border border-zinc-700 focus:border-emerald-500/80 rounded-2xl px-4 py-3.5 text-sm font-mono text-emerald-400 outline-none resize-none placeholder:text-emerald-900/50 transition-colors shadow-inner leading-relaxed" 
              />
            </div>
          </div>

          {/* 2. 인터랙티브 기술 스택 매트릭스 (Tech Stack Matrix) */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-zinc-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-zinc-100">
              <div>
                <h3 className="text-base font-black text-zinc-900 flex items-center gap-2">
                  <Code size={18} className="text-indigo-600" />
                  {currentLang === 'zh' ? '技术栈矩阵 (Tech Stack Matrix)' : currentLang === 'en' ? 'Tech Stack Matrix' : '기술 스택 매트릭스 (Tech Stack Matrix)'}
                </h3>
                <p className="text-[11px] text-zinc-500 font-medium mt-0.5">
                  {currentLang === 'zh' ? '点击推荐技术栈快速添加，或在输入框中直接输入回车添加。' : currentLang === 'en' ? 'Click recommended stacks to add quickly, or type and press Enter.' : '자주 사용하는 기술 칩을 클릭해 빠르게 담거나, 직접 입력하여 엔터(Enter)를 누르세요.'}
                </p>
              </div>
              <div className="text-xs font-black px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 self-start sm:self-auto border border-indigo-200">
                {totalTechCount} {currentLang === 'zh' ? '项已选技术' : currentLang === 'en' ? 'Selected' : '개 등록됨'}
              </div>
            </div>

            {/* 4대 주요 기술 영역 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TECH_CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const selectedList = getCategoryArray(cat.key);
                const presets = TECH_PRESETS[cat.key] || [];
                const inputValue = customInputValues[cat.key] || '';

                return (
                  <div key={cat.key} className="bg-zinc-50/70 p-5 rounded-2xl border border-zinc-200/80 flex flex-col justify-between hover:border-zinc-300 transition-colors">
                    <div>
                      {/* 카테고리 헤더 */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-black text-zinc-800 flex items-center gap-1.5">
                          <Icon size={15} className={cat.color} /> {cat.label}
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white text-zinc-600 border border-zinc-200">
                          {selectedList.length}
                        </span>
                      </div>

                      {/* 등록된 기술 스택 칩 목록 */}
                      <div className="flex flex-wrap gap-1.5 mb-3 min-h-[32px] p-2 bg-white rounded-xl border border-zinc-200/80 shadow-2xs">
                        {selectedList.length === 0 ? (
                          <span className="text-[11px] text-zinc-400 font-medium py-0.5 px-1">
                            {currentLang === 'zh' ? '暂未添加技术' : currentLang === 'en' ? 'No tech added yet' : '등록된 기술이 없습니다'}
                          </span>
                        ) : (
                          selectedList.map((skill, idx) => (
                            <span 
                              key={idx}
                              onClick={() => toggleSkill(cat.key, skill)}
                              className="group flex items-center gap-1 px-2.5 py-1 bg-zinc-900 text-zinc-100 hover:bg-rose-500 hover:text-white rounded-lg text-[11px] font-bold cursor-pointer transition-all shadow-2xs"
                              title={currentLang === 'zh' ? '点击移除' : currentLang === 'en' ? 'Click to remove' : '클릭하여 삭제'}
                            >
                              <span>{skill}</span>
                              <CloseIcon size={11} className="text-zinc-400 group-hover:text-white" />
                            </span>
                          ))
                        )}
                      </div>

                      {/* 추천 칩 목록 (클릭 토글) */}
                      <div className="mb-3">
                        <span className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1.5">
                          {currentLang === 'zh' ? '💡 快捷推荐' : currentLang === 'en' ? '💡 Quick Presets' : '💡 원클릭 추천 스택'}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {presets.map(preset => {
                            const isSelected = selectedList.includes(preset);
                            return (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => toggleSkill(cat.key, preset)}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-zinc-800 text-white border-zinc-800'
                                    : 'bg-white text-zinc-600 border-zinc-200 hover:border-indigo-400 hover:text-indigo-600'
                                }`}
                              >
                                {isSelected ? `✓ ${preset}` : `+ ${preset}`}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* 직접 텍스트 입력창 */}
                    <div className="pt-2 border-t border-zinc-200/60 flex items-center gap-2">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={e => setCustomInputValues(prev => ({ ...prev, [cat.key]: e.target.value }))}
                        onKeyDown={e => handleCustomInputKeyDown(cat.key, e)}
                        onBlur={() => handleCustomInputBlur(cat.key)}
                        placeholder={currentLang === 'zh' ? `+ 自定义输入后按 Enter` : currentLang === 'en' ? `+ Type and press Enter` : `+ 직접 입력 후 Enter`}
                        className="flex-1 px-3 py-1.5 bg-white border border-dashed border-zinc-300 focus:border-solid focus:border-indigo-400 rounded-xl text-xs font-bold text-zinc-800 outline-none transition-all placeholder:text-zinc-400"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Currently Learning (현재 학습 중인 기술) 카드 */}
            <div className="mt-4 bg-rose-50/40 p-5 rounded-2xl border border-rose-200/80">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black text-rose-800 flex items-center gap-1.5">
                  <Rocket size={15} className="text-rose-500" />
                  Currently Learning (R&D)
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white text-rose-700 border border-rose-200">
                  {getLearningArray().length}
                </span>
              </div>

              {/* 선택된 러닝 칩 */}
              <div className="flex flex-wrap gap-1.5 mb-3 min-h-[32px] p-2 bg-white rounded-xl border border-rose-200/60 shadow-2xs">
                {getLearningArray().length === 0 ? (
                  <span className="text-[11px] text-zinc-400 font-medium py-0.5 px-1">
                    {currentLang === 'zh' ? '暂未添加正在学习的技术' : currentLang === 'en' ? 'No learning tech added yet' : '현재 집중 탐구 중인 새로운 기술을 추가해보세요'}
                  </span>
                ) : (
                  getLearningArray().map((skill, idx) => (
                    <span 
                      key={idx}
                      onClick={() => toggleSkill('learning', skill)}
                      className="group flex items-center gap-1 px-2.5 py-1 bg-rose-500 text-white hover:bg-rose-600 rounded-lg text-[11px] font-bold cursor-pointer transition-all shadow-2xs"
                    >
                      <span>{skill}</span>
                      <CloseIcon size={11} className="text-rose-200 group-hover:text-white" />
                    </span>
                  ))
                )}
              </div>

              {/* 추천 칩 & 커스텀 인풋 */}
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                {TECH_PRESETS.learning.map(preset => {
                  const isSelected = getLearningArray().includes(preset);
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => toggleSkill('learning', preset)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-rose-500 text-white border-rose-500'
                          : 'bg-white text-zinc-600 border-rose-200 hover:border-rose-400 hover:text-rose-600'
                      }`}
                    >
                      {isSelected ? `✓ ${preset}` : `+ ${preset}`}
                    </button>
                  );
                })}
              </div>

              <input
                type="text"
                value={customInputValues.learning || ''}
                onChange={e => setCustomInputValues(prev => ({ ...prev, learning: e.target.value }))}
                onKeyDown={e => handleCustomInputKeyDown('learning', e)}
                onBlur={() => handleCustomInputBlur('learning')}
                placeholder={currentLang === 'zh' ? '+ 学习中的新技术输入后按 Enter' : currentLang === 'en' ? '+ Enter learning tech and press Enter' : '+ 학습 중인 기술 직접 입력 후 Enter'}
                className="w-full mt-1 px-3 py-1.5 bg-white border border-dashed border-rose-300 focus:border-solid focus:border-rose-500 rounded-xl text-xs font-bold text-zinc-800 outline-none transition-all placeholder:text-zinc-400"
              />
            </div>
          </div>

          {/* 3. 대표 프로젝트 & 포트폴리오 (Featured Projects) */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-zinc-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-zinc-100">
              <div>
                <h3 className="text-base font-black text-zinc-900 flex items-center gap-2">
                  <Rocket size={18} className="text-violet-600" />
                  {currentLang === 'zh' ? '精选项目与作品集 (Featured Projects)' : currentLang === 'en' ? 'Featured Projects & Portfolio' : '대표 프로젝트 & 포트폴리오'}
                </h3>
                <p className="text-[11px] text-zinc-500 font-medium mt-0.5">
                  {currentLang === 'zh' ? '登记代表作并附上 GitHub 或体验链接，可上下调整展示顺序。' : currentLang === 'en' ? 'Showcase key projects with GitHub & live links. Reorder as needed.' : '핵심 프로젝트와 배포 링크를 등록하고, 화살표를 눌러 우선 노출 순서를 변경해보세요.'}
                </p>
              </div>
              <button
                type="button"
                onClick={addProject}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-black transition-all shadow-sm active:scale-95 self-start sm:self-auto cursor-pointer"
              >
                <Plus size={14} />
                <span>{currentLang === 'zh' ? '添加新项目' : currentLang === 'en' ? 'Add Project' : '새 프로젝트 등록'}</span>
              </button>
            </div>

            {/* 프로젝트 카드 목록 */}
            <div className="space-y-4">
              {projects.map((proj, idx) => (
                <div key={idx} className="bg-zinc-50/70 p-5 rounded-2xl border border-zinc-200/80 hover:border-violet-300 transition-all shadow-2xs group relative">
                  
                  {/* 상단 툴바: 번호 배지 & 정렬/복사/삭제 액션 */}
                  <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-zinc-200/60">
                    <span className="px-2.5 py-0.5 bg-zinc-200/80 text-zinc-800 text-[10px] font-black rounded-full uppercase tracking-wider">
                      Project #{idx + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveProject(idx, 'up')}
                        title={currentLang === 'zh' ? '上移' : currentLang === 'en' ? 'Move Up' : '위로 이동'}
                        className="p-1.5 bg-white border border-zinc-200 text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        disabled={idx === projects.length - 1}
                        onClick={() => moveProject(idx, 'down')}
                        title={currentLang === 'zh' ? '下移' : currentLang === 'en' ? 'Move Down' : '아래로 이동'}
                        className="p-1.5 bg-white border border-zinc-200 text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      >
                        <ArrowDown size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicateProject(idx)}
                        title={currentLang === 'zh' ? '复制项目' : currentLang === 'en' ? 'Duplicate' : '프로젝트 복사'}
                        className="p-1.5 bg-white border border-zinc-200 text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer ml-1"
                      >
                        <Copy size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteProject(idx)}
                        title={currentLang === 'zh' ? '删除项目' : currentLang === 'en' ? 'Delete' : '삭제'}
                        className="p-1.5 bg-white border border-zinc-200 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer ml-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* 1행: 프로젝트명, 진행 기간, 담당 역할 */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3">
                    <div className="sm:col-span-1">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 block">
                        {currentLang === 'zh' ? '项目名称' : currentLang === 'en' ? 'Project Name' : '프로젝트명'} <span className="text-rose-500">*</span>
                      </label>
                      <input 
                        value={proj.name || ''} 
                        onChange={e => { const arr=[...projects]; arr[idx].name=e.target.value; updateNested(["developer","projects"], arr); }} 
                        className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm font-black text-zinc-900 outline-none focus:border-violet-500 transition-colors shadow-2xs" 
                        placeholder={currentLang === 'zh' ? '例: CraveLog 社交平台' : currentLang === 'en' ? 'e.g. CraveLog Platform' : '예: CraveLog 소셜 플랫폼'} 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 block">
                        {currentLang === 'zh' ? '进行周期' : currentLang === 'en' ? 'Period' : '진행 기간'}
                      </label>
                      <input 
                        value={proj.date || ''} 
                        onChange={e => { const arr=[...projects]; arr[idx].date=e.target.value; updateNested(["developer","projects"], arr); }} 
                        className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold text-zinc-800 outline-none focus:border-violet-500 transition-colors shadow-2xs" 
                        placeholder={currentLang === 'zh' ? '例: 2025.01 ~ 2025.06' : currentLang === 'en' ? 'e.g. 2025.01 ~ 2025.06' : '예: 2025.01 ~ 2025.06'} 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 block">
                        {currentLang === 'zh' ? '担任角色' : currentLang === 'en' ? 'Role / Title' : '담당 역할'}
                      </label>
                      <input 
                        value={proj.role || ''} 
                        onChange={e => { const arr=[...projects]; arr[idx].role=e.target.value; updateNested(["developer","projects"], arr); }} 
                        className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold text-zinc-800 outline-none focus:border-violet-500 transition-colors shadow-2xs" 
                        placeholder={currentLang === 'zh' ? '例: 리드 백엔드 개발' : currentLang === 'en' ? 'e.g. Lead Backend' : '예: 풀스택 / 백엔드 리드'} 
                      />
                    </div>
                  </div>

                  {/* 2행: 프로젝트 설명 및 핵심 성과 */}
                  <div className="mb-3">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 block">
                      {currentLang === 'zh' ? '项目简介与核心成果' : currentLang === 'en' ? 'Description & Achievements' : '프로젝트 한 줄 설명 및 담당 역할 / 성과'}
                    </label>
                    <textarea 
                      value={proj.desc || ''} 
                      onChange={e => { const arr=[...projects]; arr[idx].desc=e.target.value; updateNested(["developer","projects"], arr); }} 
                      className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-zinc-700 outline-none resize-none focus:border-violet-500 transition-colors shadow-2xs leading-relaxed" 
                      placeholder={currentLang === 'zh' ? '请简述项目目标、采用技术以及您所负责的核心成果。' : currentLang === 'en' ? 'Summarize project goal, tech applied, and your key achievements.' : '프로젝트 목표, 적용 기술 및 담당하여 달성한 핵심 성과를 설명하세요.'} 
                      rows={2}
                    />
                  </div>

                  {/* 3행: GitHub 링크 & Live 배포 링크 (원클릭 테스트 버튼 포함) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="flex items-center gap-1.5 bg-white border border-zinc-200 rounded-xl px-2.5 py-1.5 focus-within:border-violet-500 shadow-2xs transition-colors">
                      <Terminal size={14} className="text-zinc-400 shrink-0"/>
                      <input 
                        value={proj.githubUrl || ''} 
                        onChange={e => { const arr=[...projects]; arr[idx].githubUrl=e.target.value; updateNested(["developer","projects"], arr); }} 
                        className="w-full bg-transparent text-[11px] font-bold text-zinc-700 outline-none" 
                        placeholder={currentLang === 'zh' ? 'GitHub URL (https://...)' : currentLang === 'en' ? 'GitHub URL (https://...)' : 'GitHub URL (https://...)'} 
                      />
                      {proj.githubUrl && (
                        <a 
                          href={proj.githubUrl.startsWith('http') ? proj.githubUrl : `https://${proj.githubUrl}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="p-1 text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100 rounded-md transition-colors shrink-0" 
                          title={currentLang === 'zh' ? '测试链接' : currentLang === 'en' ? 'Test link' : '링크 테스트'}
                        >
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 bg-white border border-zinc-200 rounded-xl px-2.5 py-1.5 focus-within:border-violet-500 shadow-2xs transition-colors">
                      <ExternalLink size={14} className="text-violet-500 shrink-0"/>
                      <input 
                        value={proj.liveUrl || ''} 
                        onChange={e => { const arr=[...projects]; arr[idx].liveUrl=e.target.value; updateNested(["developer","projects"], arr); }} 
                        className="w-full bg-transparent text-[11px] font-bold text-zinc-700 outline-none" 
                        placeholder={currentLang === 'zh' ? '线上演示 URL (https://...)' : currentLang === 'en' ? 'Live Demo URL (https://...)' : '배포(Live) URL (https://...)'} 
                      />
                      {proj.liveUrl && (
                        <a 
                          href={proj.liveUrl.startsWith('http') ? proj.liveUrl : `https://${proj.liveUrl}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="p-1 text-zinc-400 hover:text-violet-600 hover:bg-zinc-100 rounded-md transition-colors shrink-0" 
                          title={currentLang === 'zh' ? '测试链接' : currentLang === 'en' ? 'Test link' : '링크 테스트'}
                        >
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {projects.length === 0 && (
                <div className="py-12 border-2 border-dashed border-zinc-200 rounded-3xl flex flex-col items-center justify-center text-center p-6 bg-zinc-50/50">
                  <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-500 flex items-center justify-center mb-3">
                    <Rocket size={22} />
                  </div>
                  <h4 className="text-sm font-black text-zinc-800 mb-1">
                    {currentLang === 'zh' ? '尚未登记精选项目' : currentLang === 'en' ? 'No featured projects added yet' : '등록된 대표 프로젝트가 없습니다'}
                  </h4>
                  <p className="text-xs text-zinc-400 font-medium mb-4 max-w-sm">
                    {currentLang === 'zh' ? '添加个人代表作，展示您的工程技术能力与实际产出。' : currentLang === 'en' ? 'Add your top projects to demonstrate your technical prowess.' : '내가 직접 만들거나 참여한 대표 프로젝트를 추가하여 방문자에게 기술력을 증명하세요.'}
                  </p>
                  <button
                    type="button"
                    onClick={addProject}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-black transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    + {currentLang === 'zh' ? '添加第一个项目' : currentLang === 'en' ? 'Add First Project' : '첫 번째 프로젝트 등록'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const CareerEditTab = ({ formData, updateNested, renderArrayInput }) => {
  const { currentLang } = useAppStore();

  return (
  <div className="space-y-4 animate-in fade-in">
    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-zinc-200/60 flex flex-col md:flex-row gap-6 md:gap-8">
        <div className="flex-1 space-y-5">
            <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">Target Job</label>
                <input 
                  type="text" 
                  value={formData.career?.targetJob || ''} 
                  onChange={e => updateNested(["career", "targetJob"], e.target.value)}
                  className="w-full text-base font-black text-blue-600 bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-2.5 outline-none focus:border-blue-300 transition-colors"
                  placeholder={currentLang === 'zh' ? '例: 资深后端工程师' : currentLang === 'en' ? 'e.g., Lead Backend Engineer' : '예: 리드 백엔드 엔지니어'}
                />
            </div>
            <div>{renderArrayInput("Tech Stack", ["career", "techStack"], currentLang === 'zh' ? '输入所需技术后按 Enter' : currentLang === 'en' ? 'Enter required skill and press Enter' : '필요 기술 입력 후 Enter')}</div>
            <div>{renderArrayInput(currentLang === 'zh' ? 'Interests (关注领域)' : currentLang === 'en' ? 'Interests' : 'Interests (관심 분야)', ["career", "interests"], currentLang === 'zh' ? '输入关注领域后按 Enter' : currentLang === 'en' ? 'Enter interest area and press Enter' : '관심 분야 입력 후 Enter')}</div>
        </div>
        
        <div className="w-full md:w-1/3 space-y-3">
            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1.5 block">Short Term Goal</label>
                <textarea value={formData.career?.careerGoals?.short || ''} onChange={e => updateNested(["career", "careerGoals", "short"], e.target.value)} rows={2} className="w-full bg-white border border-blue-100 rounded-lg px-3 py-2 text-xs font-bold text-blue-900 outline-none focus:border-blue-300 resize-none transition-colors" placeholder={currentLang === 'zh' ? '短期目标' : currentLang === 'en' ? 'Short-term Goal' : '단기 목표'} />
            </div>
            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1.5 block">Mid Term Goal</label>
                <textarea value={formData.career?.careerGoals?.mid || ''} onChange={e => updateNested(["career", "careerGoals", "mid"], e.target.value)} rows={2} className="w-full bg-white border border-blue-100 rounded-lg px-3 py-2 text-xs font-bold text-blue-900 outline-none focus:border-blue-300 resize-none transition-colors" placeholder={currentLang === 'zh' ? '中期目标' : currentLang === 'en' ? 'Mid-term Goal' : '중기 목표'} />
            </div>
            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1.5 block">Long Term Goal</label>
                <textarea value={formData.career?.careerGoals?.long || ''} onChange={e => updateNested(["career", "careerGoals", "long"], e.target.value)} rows={2} className="w-full bg-white border border-blue-100 rounded-lg px-3 py-2 text-xs font-bold text-blue-900 outline-none focus:border-blue-300 resize-none transition-colors" placeholder={currentLang === 'zh' ? '长期目标' : currentLang === 'en' ? 'Long-term Goal' : '장기 목표'} />
            </div>
        </div>
    </div>

    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-zinc-200/60">
      <h3 className="text-base font-black text-zinc-900 mb-4 ml-1 flex items-center gap-2"><Briefcase size={16} className="text-blue-500" /> {currentLang === 'zh' ? 'Strengths (优势)' : currentLang === 'en' ? 'Strengths' : 'Strengths (강점)'}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(formData.career?.strengths || []).map((str, idx) => (
              <div key={idx} className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200/80 shadow-sm relative flex gap-3">
                  <button type="button" onClick={()=>{const arr=[...(formData.career?.strengths||[])]; arr.splice(idx,1); updateNested(["career","strengths"], arr);}} className="absolute top-4 right-4 text-zinc-400 hover:text-rose-500 bg-white border border-zinc-200 p-1 rounded-lg transition-colors"><Trash2 size={12}/></button>
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">{idx+1}</div>
                  <div className="flex-1 pr-6 flex flex-col gap-2">
                      <input value={str.title} onChange={e => { const arr=[...(formData.career?.strengths||[])]; arr[idx].title=e.target.value; updateNested(["career","strengths"], arr); }} className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm font-black text-zinc-900 outline-none focus:border-blue-300 transition-colors" placeholder={currentLang === 'zh' ? '核心能力' : currentLang === 'en' ? 'Core Competence' : '핵심 역량'} />
                      <textarea value={str.desc} onChange={e => { const arr=[...(formData.career?.strengths||[])]; arr[idx].desc=e.target.value; updateNested(["career","strengths"], arr); }} className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[11px] font-medium text-zinc-600 outline-none resize-none focus:border-blue-300 transition-colors" placeholder={currentLang === 'zh' ? '详细说明' : currentLang === 'en' ? 'Detailed Description' : '상세 설명'} rows={3} />
                  </div>
              </div>
          ))}
          <button type="button" onClick={()=>{const arr=[...(formData.career?.strengths||[]), {title:"", desc:""}]; updateNested(["career","strengths"], arr);}} className="min-h-[140px] flex flex-col items-center justify-center gap-2 border-2 border-dashed border-zinc-200 rounded-2xl text-zinc-400 hover:text-blue-500 hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <Plus size={24} />
              <span className="font-bold text-xs">{currentLang === 'zh' ? '添加优势' : currentLang === 'en' ? 'Add Strength' : '강점 추가'}</span>
          </button>
      </div>
    </div>
  </div>
  );
};

export const AddProfileEditTab = ({ formData, updateNested, renderInput, renderArrayInput, isExtraImageUploading, handleExtraImageUpload, handleCommitProfile, setViewHistoryItem }) => {
  const { currentLang } = useAppStore();
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

  return (
    <div className="space-y-4 animate-in fade-in">
      <div className="flex flex-col gap-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-indigo-50/50 p-5 rounded-3xl border border-indigo-100 shadow-sm">
             <div>
               <h4 className="text-sm font-black text-indigo-800 flex items-center gap-1.5"><History size={16}/> Profile Version History</h4>
               <p className="text-[10px] text-indigo-600/80 mt-1 font-bold">
                 {currentLang === 'zh' ? '可将下方输入的内容按特定日期固定存档。' : currentLang === 'en' ? 'You can freeze and pin the profile contents below based on a specific date.' : '하단에 입력한 내용들을 특정 날짜를 기준으로 고정할 수 있습니다.'}
               </p>
             </div>
             <div className="flex flex-col w-full sm:w-auto gap-2">
                 <div className="flex items-center bg-white border border-indigo-200 rounded-xl overflow-hidden shadow-sm">
                     <div className="px-3 bg-indigo-50 text-indigo-500 border-r border-indigo-200 h-full flex items-center">
                         <Calendar size={14}/>
                     </div>
                     <input 
                        type="date" 
                        value={formData.idol?.updatedAt || ''} 
                        onChange={e => updateNested(['idol', 'updatedAt'], e.target.value)}
                        className="px-3 py-2 text-xs font-bold text-zinc-800 outline-none w-full sm:w-32"
                     />
                 </div>
                 <button onClick={handleCommitProfile} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-indigo-700 transition flex items-center justify-center gap-1.5">
                    {currentLang === 'zh' ? '存档当前记录' : currentLang === 'en' ? 'Freeze Current Record' : '현재 기록 고정하기'}
                 </button>
             </div>
          </div>

          {(formData.idol?.history?.length > 0) && (
              <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                  <button 
                      type="button"
                      onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-zinc-50 hover:bg-zinc-100 transition-colors outline-none"
                  >
                      <span className="text-[11px] font-black text-zinc-600 tracking-widest flex items-center gap-1.5">
                          <History size={14}/> {currentLang === 'zh' ? `已存档的历史记录 (${formData.idol.history.length}个)` : currentLang === 'en' ? `Archived Records (${formData.idol.history.length})` : `고정된 이전 기록 (${formData.idol.history.length}개)`}
                      </span>
                      <ChevronDown size={14} className={`text-zinc-400 transition-transform ${isHistoryExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isHistoryExpanded && (
                      <div className="p-3 border-t border-zinc-200 flex flex-wrap gap-2 max-h-40 overflow-y-auto bg-white">
                          {formData.idol.history.map((h, i) => (
                              <div key={h.id || i} className="shrink-0 bg-white border border-zinc-200 rounded-lg py-1.5 pl-3 pr-2 flex items-center gap-2 shadow-sm group">
                                  <button type="button" onClick={() => setViewHistoryItem(h)} className="text-[10px] font-black text-indigo-500 hover:text-indigo-700 hover:underline">
                                    {currentLang === 'zh' ? `查看 ${h.date} 记录` : currentLang === 'en' ? `View ${h.date} record` : `${h.date} 기록 확인`}
                                  </button>
                                  <button type="button" onClick={() => {
                                      const arr = [...formData.idol.history];
                                      arr.splice(i, 1);
                                      updateNested(['idol', 'history'], arr);
                                  }} className="text-zinc-300 hover:text-rose-500 transition-colors ml-1"><CloseIcon size={12}/></button>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-zinc-100 space-y-4">
              <h3 className="text-base font-black text-zinc-900 mb-4 flex items-center gap-2"><UserPlus size={16} className="text-rose-400"/> Identity & Info</h3>
              
              <div className="flex flex-col items-center justify-center mb-6">
                  <div className="w-40 h-56 sm:w-48 sm:h-64 mx-auto rounded-3xl bg-zinc-50 border border-zinc-200 shadow-inner overflow-hidden mb-5 relative group flex items-center justify-center">
                      {isExtraImageUploading && (
                          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20 backdrop-blur-[1px]">
                              <Loader2 size={24} className="text-rose-500 animate-spin" />
                          </div>
                      )}
                      {formData.idol?.extraImage ? (
                          <img src={formData.idol?.extraImage} alt="Extra Profile" className="w-full h-full object-cover" />
                      ) : (
                          <ImageIcon size={32} className="text-zinc-200" />
                      )}
                      <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-[1px]">
                          <Upload size={20} className="mb-2" />
                          <span className="text-[8px] font-bold">{currentLang === 'zh' ? '添加/更换照片' : currentLang === 'en' ? 'Add/Change Photo' : '사진 추가/변경'}</span>
                          <input type="file" accept="image/*" onChange={handleExtraImageUpload} className="hidden" disabled={isExtraImageUploading} />
                      </label>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-400 mt-3">{currentLang === 'zh' ? '附加个人资料照片' : currentLang === 'en' ? 'Extra Profile Photo' : '추가 프로필 사진'}</span>
              </div>

              <div className="space-y-4">
                  {renderInput("MBTI / Personality", ["idol", "mbti"], currentLang === 'zh' ? '例: ESTP' : currentLang === 'en' ? 'e.g., ESTP' : '예: ESTP')}
                  <div className="grid grid-cols-2 gap-3">
                      {renderInput(currentLang === 'zh' ? '血型' : currentLang === 'en' ? 'Blood Type' : '혈액형', ["idol", "bloodType"], currentLang === 'zh' ? '例: O型' : currentLang === 'en' ? 'e.g., O' : '예: O형')}
                      {renderInput(currentLang === 'zh' ? '身高' : currentLang === 'en' ? 'Height' : '키', ["idol", "height"], currentLang === 'zh' ? '例: 175cm' : currentLang === 'en' ? 'e.g., 175cm' : '예: 175cm')}
                  </div>
                  {renderInput(currentLang === 'zh' ? '宗教' : currentLang === 'en' ? 'Religion' : '종교', ["idol", "religion"], currentLang === 'zh' ? '例: 无宗教' : currentLang === 'en' ? 'e.g., None' : '예: 무교')}
                  {renderInput(currentLang === 'zh' ? '感情状态' : currentLang === 'en' ? 'Relationship Status' : '연애 여부', ["idol", "relationship"], currentLang === 'zh' ? '例: 单身, 恋爱中' : currentLang === 'en' ? 'e.g., Single, In a relationship' : '예: 비혼, 연애 중')}
                  {renderInput(currentLang === 'zh' ? '掌握语言' : currentLang === 'en' ? 'Languages' : '사용하는 언어', ["idol", "languages"], currentLang === 'zh' ? '例: 韩语, 英语, 中文' : currentLang === 'en' ? 'e.g., Korean, English, Chinese' : '예: 한국어, 일본어')}
              </div>
          </div>

          <div className="md:col-span-2 space-y-4">
              <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-zinc-200/60">
                  <h3 className="text-sm font-black text-zinc-900 mb-4 flex items-center gap-2"><Compass size={14} className="text-blue-500"/> Lifestyle & Work</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 gap-1.5 sm:col-span-2">
                        {renderInput(currentLang === 'zh' ? '座右铭' : currentLang === 'en' ? 'Motto' : '좌우명', ["idol", "motto"], currentLang === 'zh' ? '例: 既然无法回避，不如享受其中' : currentLang === 'en' ? 'e.g., Make every day count' : '예: 피할 수 없으면 즐겨라')}
                      </div>
                      <div className="flex flex-col bg-zinc-50 p-4 rounded-xl border border-zinc-200/60 gap-1.5">
                        {renderInput(currentLang === 'zh' ? '最近的爱好' : currentLang === 'en' ? 'Recent Hobby' : '최근 취미', ["idol", "recentHobby"], currentLang === 'zh' ? '例: 攀岩, 烘焙' : currentLang === 'en' ? 'e.g., Bouldering, Baking' : '예: 클라이밍, 베이킹')}
                      </div>
                      <div className="flex flex-col bg-zinc-50 p-4 rounded-xl border border-zinc-200/60 gap-1.5">
                        {renderInput("Working Style", ["idol", "workingStyle"], currentLang === 'zh' ? '例: 夜猫子' : currentLang === 'en' ? 'e.g., Night Owl' : '예: 올빼미족')}
                      </div>
                      <div className="flex flex-col bg-zinc-50 p-4 rounded-xl border border-zinc-200/60 gap-1.5">
                        {renderInput(currentLang === 'zh' ? '活跃时间段' : currentLang === 'en' ? 'Active Hours' : '활동 시간대', ["idol", "activeHours"], currentLang === 'zh' ? '例: 晚上8点 ~ 凌晨2点' : currentLang === 'en' ? 'e.g., 8 PM ~ 2 AM' : '예: 저녁 8시 ~ 새벽 2시')}
                      </div>
                      <div className="flex flex-col bg-zinc-50 p-4 rounded-xl border border-zinc-200/60 gap-1.5">
                          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5">
                            {currentLang === 'zh' ? '联系意向' : currentLang === 'en' ? 'Contact Availability' : '연락 가능 여부'}
                          </label>
                          <div className="flex bg-zinc-50 border border-zinc-200 rounded-xl p-1 gap-1 max-w-sm">
                              {[
                                { key: '적극', label: currentLang === 'zh' ? '积极' : currentLang === 'en' ? 'Open' : '적극' },
                                { key: '중간', label: currentLang === 'zh' ? '一般' : currentLang === 'en' ? 'Moderate' : '중간' },
                                { key: '소극', label: currentLang === 'zh' ? '少' : currentLang === 'en' ? 'Selective' : '소극' }
                              ].map(({ key, label }) => (
                                  <button
                                      key={key}
                                      type="button"
                                      onClick={() => updateNested(["idol", "contact"], key)}
                                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.idol?.contact === key ? 'bg-white shadow-sm text-violet-600 border border-violet-200' : 'text-zinc-500 hover:bg-zinc-100'}`}
                                  >
                                      {label}
                                  </button>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>

              <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-zinc-200/60">
                  <h3 className="text-sm font-black text-zinc-900 mb-4 flex items-center gap-2"><Heart size={14} className="text-rose-500"/> My Tastes</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 bg-zinc-50/80 rounded-2xl border border-zinc-100">
                        {renderArrayInput("Hobbies & Interests", ["idol", "tastes", "hobbies"], currentLang === 'zh' ? '输入后按 Enter' : currentLang === 'en' ? 'Press Enter to add' : '입력 후 Enter')}
                      </div>
                      <div className="p-3 bg-orange-50/50 rounded-2xl border border-orange-100/50">
                        {renderArrayInput("Culture (Music/Movies)", ["idol", "tastes", "culture"], currentLang === 'zh' ? '输入后按 Enter' : currentLang === 'en' ? 'Press Enter to add' : '입력 후 Enter')}
                      </div>
                      <div className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                        {renderArrayInput("Food & Drink", ["idol", "tastes", "foods"], currentLang === 'zh' ? '输入后按 Enter' : currentLang === 'en' ? 'Press Enter to add' : '입력 후 Enter')}
                      </div>
                      <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                        {renderArrayInput("Lifestyle & Places", ["idol", "tastes", "lifestyle"], currentLang === 'zh' ? '输入后按 Enter' : currentLang === 'en' ? 'Press Enter to add' : '입력 후 Enter')}
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export const BusinessCardEditTab = ({ formData, updateNested, renderInput }) => {
  const { currentLang } = useAppStore();

  return (
  <div className="space-y-6 animate-in fade-in">
      <div className="bg-zinc-50 rounded-3xl p-6 md:p-10 border border-zinc-200/80 shadow-inner flex flex-col items-center justify-center">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6">Live Card Preview</p>
          <BusinessCard data={formData.idol?.businessCard} userName={formData.name} />
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-100">
          <h3 className="text-base font-black text-zinc-900 mb-5 flex items-center gap-2">
            <CreditCard size={16} className="text-emerald-500"/> {currentLang === 'zh' ? '名片信息编辑' : currentLang === 'en' ? 'Edit Business Card' : '명함 정보 편집'}
          </h3>
          
          <div className="mb-6">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">
                {currentLang === 'zh' ? '名片主题风格' : currentLang === 'en' ? 'Card Theme Style' : '명함 테마 스타일'}
              </label>
              <div className="flex gap-2">
                  {['dark', 'light', 'gradient', 'glass'].map(t => (
                      <button 
                          key={t}
                          type="button"
                          onClick={() => updateNested(["idol", "businessCard", "template"], t)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize border shadow-sm ${formData.idol?.businessCard?.template === t ? 'border-zinc-800 ring-2 ring-zinc-800 ring-offset-1 bg-zinc-800 text-white' : 'border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50'}`}
                      >
                          {t}
                      </button>
                  ))}
              </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderInput(currentLang === 'zh' ? '公司/团队 (Company / Team)' : currentLang === 'en' ? 'Company / Team' : '소속 (Company / Team)', ["idol", "businessCard", "company"], currentLang === 'zh' ? '公司或团队名' : currentLang === 'en' ? 'Company or team name' : '소속명')}
              {renderInput(currentLang === 'zh' ? '职位 (Position / Role)' : currentLang === 'en' ? 'Position / Role' : '직책 (Position / Role)', ["idol", "businessCard", "position"], currentLang === 'zh' ? '职位名称' : currentLang === 'en' ? 'Position title' : '직책')}
              {renderInput(currentLang === 'zh' ? '邮箱 (Email)' : currentLang === 'en' ? 'Email' : '이메일 (Email)', ["idol", "businessCard", "email"], currentLang === 'zh' ? '电子邮箱地址' : currentLang === 'en' ? 'Email address' : '이메일 주소')}
              {renderInput(currentLang === 'zh' ? '电话 (Phone)' : currentLang === 'en' ? 'Phone' : '연락처 (Phone)', ["idol", "businessCard", "phone"], currentLang === 'zh' ? '电话号码' : currentLang === 'en' ? 'Phone number' : '전화번호')}
              <div className="sm:col-span-2">
                  {renderInput(currentLang === 'zh' ? '个人网站 (Website / Link)' : currentLang === 'en' ? 'Website / Link' : '개인 웹사이트 (Website / Link)', ["idol", "businessCard", "website"], currentLang === 'zh' ? '网址链接' : currentLang === 'en' ? 'Website URL' : '웹사이트 링크')}
              </div>
              <div className="sm:col-span-2">
                  {renderInput(currentLang === 'zh' ? '地址 (Address / Location)' : currentLang === 'en' ? 'Address / Location' : '위치 (Address / Location)', ["idol", "businessCard", "address"], currentLang === 'zh' ? '办公室地址或活动区域' : currentLang === 'en' ? 'Office address or city' : '사무실 주소 또는 활동 지역')}
              </div>
          </div>
      </div>
  </div>
  );
};

export const QnaEditTab = ({ formData, updateNested }) => {
  const { currentLang } = useAppStore();

  return (
  <div className="animate-in fade-in p-6 md:p-8 bg-white rounded-3xl border border-zinc-100 shadow-sm">
      <h3 className="text-base font-black text-zinc-900 mb-1 flex items-center gap-2"><MessageSquare size={16} className="text-violet-500"/> {currentLang === 'zh' ? '填写 100 问 100 答' : currentLang === 'en' ? '100 Q&A Questions' : '100문 100답 작성'}</h3>
      <p className="text-[11px] text-zinc-500 font-medium mb-5">{currentLang === 'zh' ? '添加属于您自己的奇特有趣的问答。' : currentLang === 'en' ? 'Add your own fun and quirky questions and answers.' : '나만의 엉뚱하고 재미있는 질문과 답변을 추가해보세요.'}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(formData.idol?.qna || []).map((item, idx) => (
            <div key={idx} className="flex flex-col gap-2.5 bg-violet-50/30 p-5 rounded-2xl border border-violet-100/50 relative overflow-hidden hover:bg-violet-50 hover:shadow-sm transition-all duration-300">
                <button type="button" onClick={()=>{const arr=[...(formData.idol?.qna||[])]; arr.splice(idx,1); updateNested(["idol", "qna"], arr);}} className="absolute top-4 right-4 text-violet-300 hover:text-rose-500 bg-white border border-violet-100 p-1.5 rounded-lg transition-colors z-10"><Trash2 size={12}/></button>
                
                <div>
                  <label className="text-[9px] font-black text-violet-400 uppercase tracking-widest mb-1 block">Question</label>
                  <input value={item.q} onChange={e => { const arr=[...(formData.idol?.qna||[])]; arr[idx].q=e.target.value; updateNested(["idol", "qna"], arr); }} className="w-full bg-white border border-violet-200 rounded-xl px-3 py-2 text-xs font-bold text-violet-900 outline-none focus:border-violet-400 pr-10 transition-colors" placeholder={currentLang === 'zh' ? '例: 去无人岛要带的3样东西是？' : currentLang === 'en' ? 'e.g., 3 things you would bring to a deserted island?' : '예: 무인도에 가져갈 3가지는?'} />
                </div>
                <div>
                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1 block">Answer</label>
                  <textarea value={item.a} onChange={e => { const arr=[...(formData.idol?.qna||[])]; arr[idx].a=e.target.value; updateNested(["idol", "qna"], arr); }} className="w-full bg-white border border-violet-200 rounded-xl px-3 py-2 text-[11px] font-medium text-zinc-800 outline-none focus:border-violet-400 resize-none transition-colors" placeholder={currentLang === 'zh' ? '请输入回答' : currentLang === 'en' ? 'Write your answer' : '답변을 작성하세요'} rows={2} />
                </div>
            </div>
        ))}
        
        <button type="button" onClick={()=>{const arr=[...(formData.idol?.qna||[]), {q:"", a:""}]; updateNested(["idol", "qna"], arr);}} className="min-h-[140px] flex flex-col items-center justify-center gap-2 border-2 border-dashed border-violet-200 rounded-2xl text-violet-400 hover:text-violet-600 hover:border-violet-400 hover:bg-violet-50 transition-colors">
            <Plus size={24} />
            <span className="font-bold text-xs">{currentLang === 'zh' ? '添加新 Q&A' : currentLang === 'en' ? 'Add New Q&A' : '새로운 Q&A 추가'}</span>
        </button>
      </div>
  </div>
  );
};

export const HobbyEditTab = ({ formData, updateNested, renderInput, renderArrayInput, isHobbyImageUploading, handleHobbyImageUpload }) => {
  const { currentLang } = useAppStore();
  const [hobbyImageInputType, setHobbyImageInputType] = useState('file');

  return (
    <div className="animate-in fade-in p-6 md:p-8 bg-white rounded-3xl shadow-sm border border-zinc-100">
        <h3 className="text-base font-black text-zinc-900 mb-1 flex items-center gap-2"><Target size={16} className="text-amber-500"/> {currentLang === 'zh' ? '兴趣介绍模块' : currentLang === 'en' ? 'Hobby Introduction' : '취미 소개 섹션'}</h3>
        <p className="text-[11px] text-zinc-500 font-medium mb-5">{currentLang === 'zh' ? '深入介绍最能代表你的一个爱好。' : currentLang === 'en' ? 'Deeply introduce one hobby that best represents you.' : '나를 가장 잘 나타내는 취미 하나를 깊게 소개해보세요.'}</p>
        
        <div className="bg-amber-50/30 p-5 rounded-2xl border border-amber-100/50 space-y-5">
          {renderInput(currentLang === 'zh' ? '兴趣标题 (Headline)' : currentLang === 'en' ? 'Hobby Headline' : '취미 제목 (Headline)', ["idol", "hobby", "title"], currentLang === 'zh' ? '例: 胶片相机与小巷漫步' : currentLang === 'en' ? 'e.g., Film cameras & alley walks' : '예: 필름 카메라와 골목길 산책')}
          
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-amber-100">
              <div className="w-24 h-24 rounded-xl bg-zinc-100 overflow-hidden flex items-center justify-center shrink-0 border border-zinc-200 relative group shadow-inner">
                  {isHobbyImageUploading && (
                      <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-20 backdrop-blur-[1px]">
                          <Loader2 size={16} className="text-amber-500 animate-spin mb-1" />
                      </div>
                  )}
                  {formData.idol?.hobby?.image ? <img src={formData.idol.hobby.image} alt="Hobby" className="w-full h-full object-cover"/> : <ImageIcon className="text-zinc-300" size={24}/>}
                  
                  <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-[1px]">
                      <Upload size={16} className="mb-1" />
                      <span className="text-[8px] font-bold">{currentLang === 'zh' ? '上传' : currentLang === 'en' ? 'Upload' : '업로드'}</span>
                      <input type="file" accept="image/*" onChange={handleHobbyImageUpload} className="hidden" disabled={isHobbyImageUploading} />
                  </label>
              </div>
              <div className="flex-1 w-full space-y-2">
                  <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest block">{currentLang === 'zh' ? '背景图片来源' : currentLang === 'en' ? 'Background Image Source' : '배경 이미지 소스'}</label>
                  <div className="flex bg-amber-100/50 p-0.5 rounded-lg w-max mb-1">
                      <button type="button" onClick={() => setHobbyImageInputType('file')} className={`px-3 py-1 text-[10px] font-bold rounded-md transition ${hobbyImageInputType === 'file' ? 'bg-white shadow-sm text-amber-700' : 'text-amber-600 hover:bg-amber-200/50'}`}>{currentLang === 'zh' ? '上传文件' : currentLang === 'en' ? 'Upload File' : '파일 업로드'}</button>
                      <button type="button" onClick={() => setHobbyImageInputType('url')} className={`px-3 py-1 text-[10px] font-bold rounded-md transition ${hobbyImageInputType === 'url' ? 'bg-white shadow-sm text-amber-700' : 'text-amber-600 hover:bg-amber-200/50'}`}>{currentLang === 'zh' ? '网页 URL' : currentLang === 'en' ? 'Web URL' : '웹 URL'}</button>
                  </div>
                  {hobbyImageInputType === 'file' ? (
                      <p className="text-[10px] font-medium text-zinc-500 bg-zinc-50 p-2 rounded-lg border border-zinc-100">{currentLang === 'zh' ? '点击左侧图片上传本地文件。' : currentLang === 'en' ? 'Click on the left image to upload a file from your device.' : '좌측 이미지를 클릭하여 PC의 파일을 업로드하세요.'}</p>
                  ) : (
                      <input type="text" placeholder="https://..." value={formData.idol?.hobby?.image || ''} onChange={e => updateNested(["idol", "hobby", "image"], e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-400 transition-colors" />
                  )}
              </div>
          </div>
          
          <div>
              <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-1.5">{currentLang === 'zh' ? '详细说明 (Description)' : currentLang === 'en' ? 'Description' : '상세 설명 (Description)'}</label>
              <textarea value={formData.idol?.hobby?.description || ''} onChange={e => updateNested(["idol", "hobby", "description"], e.target.value)} rows={3} className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2.5 text-xs font-medium outline-none focus:border-amber-400 resize-none transition-colors" placeholder={currentLang === 'zh' ? '请写下为什么喜欢这个爱好，它有什么魅力。' : currentLang === 'en' ? 'Explain why you love this hobby and its unique charms.' : '이 취미를 왜 좋아하는지, 어떤 매력이 있는지 적어주세요.'} />
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-amber-100">
            {renderArrayInput(currentLang === 'zh' ? '相关关键词 (Tags)' : currentLang === 'en' ? 'Tags' : '관련 키워드 (Tags)', ["idol", "hobby", "keywords"], currentLang === 'zh' ? '输入关键词后按 Enter' : currentLang === 'en' ? 'Enter keyword and press Enter' : '키워드 입력 후 Enter')}
          </div>
        </div>
    </div>
  );
};

export const QuotesEditTab = ({ formData, updateNested }) => {
  const { currentLang } = useAppStore();

  return (
  <div className="animate-in fade-in p-6 md:p-8 bg-white rounded-3xl border border-zinc-100 shadow-sm">
      <h3 className="text-base font-black text-zinc-900 mb-1 flex items-center gap-2"><Quote size={16} className="text-slate-400"/> {currentLang === 'zh' ? '喜爱的名言收集' : currentLang === 'en' ? 'Favorite Quotes' : '좋아하는 명언 모음'}</h3>
      <p className="text-[11px] text-zinc-500 font-medium mb-5">{currentLang === 'zh' ? '记录给您带来灵感的句子或座右铭。' : currentLang === 'en' ? 'Record quotes and mottos that inspire you.' : '나에게 영감을 주는 문장이나 좌우명을 기록해두세요.'}</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {(formData.idol?.quotes || []).map((item, idx) => (
            <div key={idx} className="flex flex-col gap-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm relative group transition-colors hover:bg-white">
                <button type="button" onClick={()=>{const arr=[...(formData.idol?.quotes||[])]; arr.splice(idx,1); updateNested(["idol", "quotes"], arr);}} className="absolute top-3 right-3 text-slate-300 hover:text-rose-500 bg-white border border-slate-100 p-1 rounded-lg transition-colors z-10"><Trash2 size={12}/></button>
                
                <textarea 
                  value={item.text} 
                  onChange={e => { const arr=[...(formData.idol?.quotes||[])]; arr[idx].text=e.target.value; updateNested(["idol", "quotes"], arr); }} 
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none resize-none focus:border-slate-400 pr-8 transition-colors" 
                  placeholder={currentLang === 'zh' ? '名言内容' : currentLang === 'en' ? 'Quote content' : '명언 내용'} 
                  rows={3}
                />
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 focus-within:border-slate-400 transition-colors">
                  <span className="text-[10px] font-black text-slate-300">-</span>
                  <input 
                    value={item.author} 
                    onChange={e => { const arr=[...(formData.idol?.quotes||[])]; arr[idx].author=e.target.value; updateNested(["idol", "quotes"], arr); }} 
                    className="flex-1 bg-transparent text-[11px] font-bold text-slate-600 outline-none" 
                    placeholder={currentLang === 'zh' ? '作者或出处' : currentLang === 'en' ? 'Author or source' : '작성자 또는 출처'} 
                  />
                </div>
            </div>
        ))}
        
        <button type="button" onClick={()=>{const arr=[...(formData.idol?.quotes||[]), {text:"", author:""}]; updateNested(["idol", "quotes"], arr);}} className="min-h-[130px] flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:text-slate-600 hover:border-slate-400 hover:bg-slate-50 transition-colors">
            <Plus size={24} />
            <span className="font-bold text-xs">{currentLang === 'zh' ? '添加新名言' : currentLang === 'en' ? 'Add New Quote' : '새 명언 추가'}</span>
        </button>
      </div>
  </div>
  );
};

export const MemoEditTab = ({ formData, updateNested }) => {
  const { currentLang } = useAppStore();

  return (
  <div className="space-y-6 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-100">
          <h3 className="text-base font-black text-zinc-900 mb-2 flex items-center gap-2"><FileText size={16} className="text-amber-500"/> {currentLang === 'zh' ? '自由备忘录' : currentLang === 'en' ? 'Free Memo' : '자유 메모장'}</h3>
          <p className="text-[11px] text-zinc-500 font-medium mb-5">{currentLang === 'zh' ? '留下想对访客说的话，或任何形式的随笔文字。' : currentLang === 'en' ? 'Leave a note for visitors or write any freeform text.' : '방문자에게 전하고 싶은 말이나, 자유로운 형태의 텍스트를 남겨보세요.'}</p>
          <textarea 
              value={formData.idol?.memoArea?.text || ''} 
              onChange={e => updateNested(["idol", "memoArea", "text"], e.target.value)} 
              rows={8} 
              className="w-full bg-amber-50/30 border border-amber-100/50 rounded-xl px-5 py-4 text-sm font-medium text-zinc-800 outline-none focus:bg-white focus:border-amber-400 resize-none transition-colors shadow-sm" 
              placeholder={currentLang === 'zh' ? '随心书写...' : currentLang === 'en' ? 'Write freely...' : '자유롭게 글을 작성해보세요...'} 
          />
      </div>
  </div>
  );
};

const PALETTE = ['#ef4444', '#f97316', '#f59e0b', '#22c55e', '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#3f3f46'];

export const ArtEditTab = ({ formData, updateNested }) => {
  const { currentLang } = useAppStore();
  const [activeColor, setActiveColor] = useState(PALETTE[8]);
  const [isEraser, setIsEraser] = useState(false);
  const isDrawingRef = useRef(false);

  // 마우스 버튼을 캔버스 밖에서 뗐을 때 드로잉 상태가 고착되는 현상 방지
  React.useEffect(() => {
    const handleGlobalMouseUp = () => {
      isDrawingRef.current = false;
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const gridSize = formData.idol?.memoArea?.gridSize || 15;
  const dots = formData.idol?.memoArea?.dots || Array(gridSize * gridSize).fill("");

  const paintDot = (idx) => {
    const newDots = [...dots];
    newDots[idx] = isEraser ? "" : activeColor;
    updateNested(["idol", "memoArea", "dots"], newDots);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-100 flex flex-col items-center">
            <h3 className="text-base font-black text-zinc-900 mb-2 w-full flex items-center gap-2"><Grid size={16} className="text-pink-500"/> {currentLang === 'zh' ? '像素艺术画布 (Pixel Art)' : currentLang === 'en' ? 'Pixel Art Canvas' : '도트 캔버스 (Pixel Art)'}</h3>
            <p className="text-[11px] text-zinc-500 font-medium mb-6 w-full">{currentLang === 'zh' ? '选择颜色，点击或拖动画笔来进行绘画。' : currentLang === 'en' ? 'Pick a color, then click or drag to draw.' : '색상을 선택하고 클릭하거나 드래그하여 그림을 그려보세요.'}</p>
            
            <div className="w-full flex items-center justify-between bg-zinc-50 p-3 rounded-2xl border border-zinc-200 mb-6">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-2 hidden sm:block">{currentLang === 'zh' ? '网格大小 (Grid Size)' : currentLang === 'en' ? 'Grid Size' : '그리드 크기 (Grid Size)'}</span>
                <div className="flex gap-2 w-full sm:w-auto">
                    {[10, 15, 20].map(size => (
                        <button
                            key={size}
                            type="button"
                            onClick={() => {
                                const confirmMsg = currentLang === 'zh' ? '更改大小将重置现有画布。确定要更改吗？' : currentLang === 'en' ? 'Changing the grid size will clear the canvas. Do you want to continue?' : '크기를 변경하면 기존 캔버스가 초기화됩니다. 변경하시겠습니까?';
                                if (size !== gridSize && window.confirm(confirmMsg)) {
                                    updateNested(["idol", "memoArea", "gridSize"], size);
                                    updateNested(["idol", "memoArea", "dots"], Array(size * size).fill(""));
                                }
                            }}
                            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${gridSize === size ? 'bg-zinc-800 text-white' : 'bg-white text-zinc-500 border border-zinc-200 hover:bg-zinc-100'}`}
                        >
                            {size} x {size}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6 bg-white p-3 rounded-full border border-zinc-200 shadow-sm">
                {PALETTE.map(color => (
                    <button
                        key={color}
                        type="button"
                        onClick={() => { setActiveColor(color); setIsEraser(false); }}
                        style={{ backgroundColor: color }}
                        className={`w-6 h-6 rounded-full transition-all ring-offset-2 hover:scale-110 ${activeColor === color && !isEraser ? 'ring-2 ring-zinc-800 scale-110' : 'ring-1 ring-zinc-200/50'}`}
                        title={color}
                    />
                ))}
                <div className="w-px h-6 bg-zinc-200 mx-1"></div>
                <button
                    type="button"
                    onClick={() => setIsEraser(true)}
                    className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-full transition-colors ${isEraser ? 'bg-rose-500 text-white shadow-sm' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}
                >
                    <Eraser size={14} />
                    <span className="hidden sm:inline">{currentLang === 'zh' ? '橡皮擦' : currentLang === 'en' ? 'Eraser' : '지우개'}</span>
                </button>
            </div>
            
            <div className="flex flex-col items-center justify-center select-none overflow-x-auto w-full pb-4">
                <div 
                    style={{ display: 'grid', gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }} 
                    className="gap-0.5 sm:gap-1 bg-zinc-50 p-2 sm:p-3 rounded-2xl border border-zinc-200 shadow-inner w-max mx-auto"
                    onMouseLeave={() => { isDrawingRef.current = false; }}
                    onMouseUp={() => { isDrawingRef.current = false; }}
                >
                    {dots.map((dotColor, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => paintDot(idx)}
                            onMouseDown={() => {
                                isDrawingRef.current = true;
                                paintDot(idx);
                            }}
                            onMouseEnter={() => {
                                if (isDrawingRef.current) {
                                    paintDot(idx);
                                }
                            }}
                            style={{ backgroundColor: dotColor || 'transparent' }}
                            className={`transition-colors rounded-[2px] sm:rounded-sm border ${dotColor ? 'border-transparent shadow-sm' : 'border-zinc-200/60 bg-white hover:bg-zinc-100'} 
                                ${gridSize === 10 ? 'w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10' : gridSize === 15 ? 'w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7' : 'w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5'}
                            `}
                        />
                    ))}
                </div>
                <button 
                    type="button" 
                    onClick={() => {
                        const clearMsg = currentLang === 'zh' ? '确定要清空画布吗？' : currentLang === 'en' ? 'Clear the entire canvas?' : '캔버스를 모두 지우시겠습니까?';
                        if (window.confirm(clearMsg)) {
                            updateNested(["idol", "memoArea", "dots"], Array(gridSize * gridSize).fill(""));
                        }
                    }} 
                    className="mt-6 px-5 py-2.5 bg-zinc-100 text-zinc-500 text-xs font-bold rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-colors"
                >
                    {currentLang === 'zh' ? '清空画布' : currentLang === 'en' ? 'Clear Canvas' : '캔버스 초기화'}
                </button>
            </div>
        </div>
    </div>
  );
};

export const PersonaEditTab = ({ formData, updateNested, DEFAULT_PERSONAS, TABS_CONFIG }) => {
    const { currentLang } = useAppStore();
    const userPersonas = formData.idol?.personas || DEFAULT_PERSONAS;

    const SECURITY_LEVELS = [
      { level: 0, label: currentLang === 'zh' ? '全员公开' : currentLang === 'en' ? 'Public' : '전체 공개', desc: currentLang === 'zh' ? '任何人' : currentLang === 'en' ? 'Anyone' : '누구나', icon: Globe, activeBg: 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500' },
      { level: 1, label: currentLang === 'zh' ? '粉丝公开' : currentLang === 'en' ? 'Followers' : '팔로워 공개', desc: currentLang === 'zh' ? '仅粉丝' : currentLang === 'en' ? 'Followers only' : '팔로워만', icon: Users, activeBg: 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500' },
      { level: 2, label: currentLang === 'zh' ? '密码锁定' : currentLang === 'en' ? 'Passcode' : '비밀번호 잠금', desc: currentLang === 'zh' ? '设置PIN' : currentLang === 'en' ? 'PIN code' : 'PIN 설정', icon: KeyRound, activeBg: 'bg-amber-50 border-amber-500 text-amber-700 ring-1 ring-amber-500' },
      { level: 4, label: currentLang === 'zh' ? '仅自己' : currentLang === 'en' ? 'Private' : '나만 보기', desc: currentLang === 'zh' ? '私密' : currentLang === 'en' ? 'Only me' : '비공개', icon: Lock, activeBg: 'bg-rose-50 border-rose-500 text-rose-700 ring-1 ring-rose-500' },
    ];

    const personaKeys = Object.keys(DEFAULT_PERSONAS).filter(k => k !== 'all');
    
    // 활성화된 페르소나와 비활성화된 페르소나 구분
    const activePersonaKeys = personaKeys.filter(k => {
      const pData = userPersonas[k] || DEFAULT_PERSONAS[k];
      return pData.isActive !== false;
    });

    const inactivePersonaKeys = personaKeys.filter(k => {
      const pData = userPersonas[k] || DEFAULT_PERSONAS[k];
      return pData.isActive === false;
    });

    // 페르소나 비활성화 핸들러
    const handleDeactivate = (pKey) => {
      if (activePersonaKeys.length <= 1) {
        alert(currentLang === 'zh' ? '必须保持至少1个人格处于激活状态。' : currentLang === 'en' ? 'At least one persona must remain active.' : '최소 1개 이상의 페르소나는 활성화 상태로 유지되어야 합니다.');
        return;
      }
      const pData = userPersonas[pKey] || DEFAULT_PERSONAS[pKey];
      const deactMsg = currentLang === 'zh' 
        ? `'${pData.name}' 人格确定要停用吗？\n\n(将从个人资料顶部标签中完全隐藏，可随时在下方的'已停用的人格'列表中重新启用。)`
        : currentLang === 'en'
        ? `Are you sure you want to deactivate '${pData.name}'?\n\n(It will be hidden from profile tabs and can be re-enabled anytime below.)`
        : `'${pData.name}' 페르소나를 비활성화하시겠습니까?\n\n(프로필 상단 탭에서 완전히 숨겨지며, 언제든 하단의 '비활성화된 페르소나' 목록에서 다시 켤 수 있습니다.)`;
      if (window.confirm(deactMsg)) {
        updateNested(["idol", "personas", pKey, "isActive"], false);
      }
    };

    // 페르소나 다시 활성화 핸들러
    const handleActivate = (pKey) => {
      updateNested(["idol", "personas", pKey, "isActive"], true);
    };
 
    return (
      <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-100">
             <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                   <Layers size={16} className="text-indigo-500"/>
                   <h3 className="text-base font-black text-zinc-900">{currentLang === 'zh' ? '多重人格管理' : currentLang === 'en' ? 'Multi-Persona Settings' : '멀티 페르소나 편집'}</h3>
                   <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {currentLang === 'zh' ? `已激活 ${activePersonaKeys.length}个` : currentLang === 'en' ? `Active (${activePersonaKeys.length})` : `활성 ${activePersonaKeys.length}개`}
                   </span>
                </div>
                {inactivePersonaKeys.length > 0 && (
                   <span className="text-[11px] font-bold text-zinc-400">
                      {currentLang === 'zh' ? `已停用 ${inactivePersonaKeys.length}个` : currentLang === 'en' ? `Inactive (${inactivePersonaKeys.length})` : `비활성화 ${inactivePersonaKeys.length}개`}
                   </span>
                )}
             </div>
             <p className="text-[11px] md:text-xs text-zinc-500 font-medium mb-6">
                {currentLang === 'zh' ? (
                  <>设置每个人格的<strong>4级公开范围（全员 / 粉丝 / PIN / 仅自己）</strong>，不需要的人格可<strong>[停用]</strong>隐藏。</>
                ) : currentLang === 'en' ? (
                  <>Configure the <strong>4-level visibility (Public / Followers / PIN / Private)</strong> for each persona, and hide unused ones with <strong>[Deactivate]</strong>.</>
                ) : (
                  <>각 페르소나의 <strong>4단계 공개 범위(전체 / 팔로워 / PIN / 나만보기)</strong>를 설정하고, 사용하지 않는 페르소나는 <strong>[비활성화]</strong>하여 프로필에서 깔끔하게 숨길 수 있습니다.</>
                )}
             </p>
 
             {/* ⭐️ 활성화된 페르소나 카드 그리드 */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {activePersonaKeys.map(pKey => {
                    const pData = userPersonas[pKey] || DEFAULT_PERSONAS[pKey];
                    const currentLevel = pData.visibilityLevel !== undefined && pData.visibilityLevel !== null 
                        ? Number(pData.visibilityLevel) 
                        : (pData.isVisible === false ? 4 : 0);
                    
                    const handleLevelChange = (newLevel) => {
                        updateNested(["idol", "personas", pKey, "visibilityLevel"], newLevel);
                        updateNested(["idol", "personas", pKey, "isVisible"], newLevel !== 4);
                    };

                    return (
                        <div key={pKey} className={`border rounded-2xl p-5 shadow-sm transition-colors focus-within:bg-white focus-within:border-indigo-300 ${currentLevel === 4 ? 'bg-zinc-100/50 border-zinc-200 opacity-80' : 'bg-zinc-50 border-zinc-200'}`}>
                            {/* 상단: 페르소나 이름 & 보안 레벨 배지 & 비활성화 버튼 */}
                            <div className="flex justify-between items-start mb-1.5 gap-2">
                                <input 
                                    value={pData.name} 
                                    onChange={e => updateNested(["idol", "personas", pKey, "name"], e.target.value)} 
                                    className="flex-1 bg-transparent text-sm font-black text-zinc-800 outline-none border-b border-transparent focus:border-indigo-300"
                                    placeholder={currentLang === 'zh' ? '人格名称' : currentLang === 'en' ? 'Persona Name' : '페르소나 이름'}
                                />
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 shadow-2xs ${
                                        currentLevel === 0 ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                                        currentLevel === 1 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                        currentLevel === 2 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                        'bg-rose-50 text-rose-700 border border-rose-200'
                                    }`}>
                                        {currentLevel === 0 && <><Globe size={11} /> {currentLang === 'zh' ? '全员' : currentLang === 'en' ? 'Public' : '전체'}</>}
                                        {currentLevel === 1 && <><Users size={11} /> {currentLang === 'zh' ? '粉丝' : currentLang === 'en' ? 'Followers' : '팔로워'}</>}
                                        {currentLevel === 2 && <><KeyRound size={11} /> PIN</>}
                                        {currentLevel === 4 && <><Lock size={11} /> {currentLang === 'zh' ? '仅自己' : currentLang === 'en' ? 'Private' : '나만보기'}</>}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleDeactivate(pKey)}
                                        className="flex items-center gap-1 px-2 py-1 rounded-lg border border-zinc-200 bg-white text-zinc-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 text-[10px] font-bold transition-all active:scale-95 shadow-2xs cursor-pointer"
                                        title={currentLang === 'zh' ? '停用此人格并从资料中隐藏（可随时重新开启）' : currentLang === 'en' ? 'Deactivate this persona and hide it from profile (can be re-enabled anytime)' : '이 페르소나를 비활성화하고 프로필에서 숨깁니다 (언제든 다시 켤 수 있습니다)'}
                                    >
                                        <EyeOff size={11} />
                                        <span>{currentLang === 'zh' ? '停用' : currentLang === 'en' ? 'Deactivate' : '비활성화'}</span>
                                    </button>
                                </div>
                            </div>

                            {/* 간단한 설명 입력 */}
                            <input 
                                value={pData.desc} 
                                onChange={e => updateNested(["idol", "personas", pKey, "desc"], e.target.value)} 
                                className="w-full bg-transparent text-[11px] font-bold text-zinc-500 mb-3 outline-none border-b border-transparent focus:border-indigo-300"
                                placeholder={currentLang === 'zh' ? '简单说明' : currentLang === 'en' ? 'Short Description' : '간단한 설명'}
                            />

                            {/* ⭐️ 4단계 공개 범위 선택 버튼 그리드 */}
                            <div className="mb-3 bg-white/70 border border-zinc-200 rounded-xl p-2.5">
                                <span className="block text-[10px] font-black text-zinc-600 mb-1.5 uppercase tracking-wider">
                                    {currentLang === 'zh' ? '公开范围 (4级)' : currentLang === 'en' ? 'Visibility (4 Levels)' : '공개 범위 (4단계)'}
                                </span>
                                <div className="grid grid-cols-4 gap-1.5">
                                    {SECURITY_LEVELS.map(item => {
                                        const Icon = item.icon;
                                        const isSelected = currentLevel === item.level;
                                        return (
                                            <button
                                                key={item.level}
                                                type="button"
                                                onClick={() => handleLevelChange(item.level)}
                                                className={`py-1.5 px-1 rounded-lg border text-center transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95 ${
                                                    isSelected 
                                                        ? `${item.activeBg} font-black shadow-2xs` 
                                                        : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800'
                                                }`}
                                            >
                                                <Icon size={13} className={isSelected ? '' : 'text-zinc-400'} />
                                                <span className="text-[10px] font-black leading-tight">{item.label}</span>
                                                <span className="text-[8px] text-zinc-400 font-medium leading-none">{item.desc}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* 2단계 선택 시 PIN 비밀번호 설정 필드 */}
                                {currentLevel === 2 && (
                                    <div className="mt-2.5 p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl animate-in fade-in duration-200">
                                        <label className="text-[10px] font-black text-amber-900 flex items-center gap-1 mb-1">
                                            <KeyRound size={12} className="text-amber-600" />
                                            {currentLang === 'zh' ? '访问密码 (PIN)' : currentLang === 'en' ? 'Access Passcode (PIN)' : '열람 비밀번호 (PIN)'} <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={pData.passcode || ''}
                                            onChange={e => updateNested(["idol", "personas", pKey, "passcode"], e.target.value)}
                                            placeholder={currentLang === 'zh' ? '访问密码 (例: 1234)' : currentLang === 'en' ? 'Passcode (e.g. 1234)' : '접근용 비밀번호 (예: 1234)'}
                                            maxLength={20}
                                            className="w-full bg-white border border-amber-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-300 rounded-lg px-2.5 py-1 text-xs font-bold text-zinc-800 outline-none transition-all shadow-2xs"
                                        />
                                        <p className="text-[9px] text-amber-800 font-medium mt-1">
                                            {currentLang === 'zh' ? '💡 访客点击此人格时，需输入上述密码才能查看对应的标签页。' : currentLang === 'en' ? '💡 Visitors must enter this passcode when clicking this persona to reveal these tabs.' : '💡 방문자가 이 페르소나를 클릭하면 위 비밀번호를 입력해야 해당 탭들이 노출됩니다.'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* 활성화할 서브 탭 선택 */}
                            <div>
                                <span className="block text-[10px] font-black text-zinc-600 mb-1.5 uppercase tracking-wider">
                                    {currentLang === 'zh' ? '选择显示的子标签页' : currentLang === 'en' ? 'Select Visible Sub-tabs' : '노출할 서브 탭 선택'}
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                   {Object.keys(TABS_CONFIG).map(tabKey => {
                                       if (tabKey === 'persona') return null; 
                                       const isChecked = pData.tabs?.includes(tabKey);
                                       return (
                                           <button 
                                                key={tabKey} 
                                                type="button"
                                                onClick={() => {
                                                    let newTabs = [...(pData.tabs || [])];
                                                    if (isChecked) newTabs = newTabs.filter(t => t !== tabKey);
                                                    else newTabs.push(tabKey);
                                                    updateNested(["idol", "personas", pKey, "tabs"], newTabs);
                                                }}
                                                className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all shadow-2xs ${isChecked ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-zinc-400 border-zinc-200 hover:bg-zinc-100'}`}
                                            >
                                              {isChecked && <Check size={10} className="text-indigo-500"/>}
                                              {TABS_CONFIG[tabKey]?.name || TABS_CONFIG[tabKey]?.label}
                                           </button>
                                       )
                                   })}
                                </div>
                            </div>
                        </div>
                    );
                })}
             </div>

             {/* ⭐️ 비활성화된 페르소나 섹션 */}
             {inactivePersonaKeys.length > 0 && (
                <div className="mt-8 p-5 bg-zinc-50 border border-dashed border-zinc-300 rounded-3xl animate-in fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
                        <div className="flex items-center gap-2">
                            <EyeOff size={15} className="text-zinc-500" />
                            <h4 className="text-xs font-black text-zinc-800">
                                {currentLang === 'zh' ? `已停用的人格 (${inactivePersonaKeys.length}个)` : currentLang === 'en' ? `Inactive Personas (${inactivePersonaKeys.length})` : `비활성화된 페르소나 (${inactivePersonaKeys.length}개)`}
                            </h4>
                        </div>
                        <span className="text-[10px] font-medium text-zinc-400">
                            {currentLang === 'zh' ? '随时点击 [+ 激活] 即可恢复到个人主页顶部标签和编辑视图中' : currentLang === 'en' ? 'Click [+ Activate] anytime to restore to profile header and edit view' : '언제든 [+ 활성화]를 누르면 프로필 상단 스티커와 편집 뷰에 복원됩니다'}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {inactivePersonaKeys.map(pKey => {
                            const pData = userPersonas[pKey] || DEFAULT_PERSONAS[pKey];
                            return (
                                <div key={pKey} className="bg-white border border-zinc-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between gap-3 hover:border-zinc-300 transition-colors">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-black text-zinc-800 truncate mb-0.5">{pData.name}</p>
                                        <p className="text-[10px] font-medium text-zinc-400 truncate">
                                            {pData.desc || (currentLang === 'zh' ? '无说明' : currentLang === 'en' ? 'No description' : '간단한 설명 없음')} · {currentLang === 'zh' ? `${pData.tabs?.length || 0}个标签` : currentLang === 'en' ? `${pData.tabs?.length || 0} tabs` : `탭 ${pData.tabs?.length || 0}개`}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleActivate(pKey)}
                                        className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200/80 text-[10px] font-black transition-all shadow-2xs active:scale-95 cursor-pointer"
                                    >
                                        <Plus size={12} />
                                        <span>{currentLang === 'zh' ? '激活' : currentLang === 'en' ? 'Activate' : '활성화'}</span>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
             )}
          </div>
      </div>
    );
 };

export const ResumeEditTab = ({ formData, updateNested }) => {
  const { currentLang } = useAppStore();
  const devData = formData.developer || {};
  
  const addArrayItem = (arrayName, emptyItem) => {
    const arr = [...(devData[arrayName] || []), emptyItem];
    updateNested(["developer", arrayName], arr);
  };

  const removeArrayItem = (arrayName, idx) => {
    const arr = [...(devData[arrayName] || [])];
    arr.splice(idx, 1);
    updateNested(["developer", arrayName], arr);
  };

  const updateItemField = (arrayName, idx, field, value) => {
    const arr = [...(devData[arrayName] || [])];
    arr[idx] = { ...arr[idx], [field]: value };
    updateNested(["developer", arrayName], arr);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 mb-6">
         <p className="text-xs font-bold text-indigo-800">
           {currentLang === 'zh' ? (
             <>💡 <strong>Introduce, Project, Skill</strong> 项将自动同步 <span className="underline">Developer 标签页</span> 中输入的数据！</>
           ) : currentLang === 'en' ? (
             <>💡 <strong>Introduce, Project, Skill</strong> items automatically share data entered in the <span className="underline">Developer tab</span>!</>
           ) : (
             <>💡 <strong>Introduce, Project, Skill</strong> 항목은 <span className="underline">기존 Developer 탭</span>에서 입력한 데이터를 공유하여 자동으로 표시됩니다!</>
           )}
         </p>
      </div>

      {/* ⭐️ 0. 이력서 상단 헤더 문구 및 주요 지표 (Motto & Quick Stats) */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-zinc-200/60">
        <h3 className="text-base font-black text-zinc-900 mb-1 flex items-center gap-2">
          <Award className="text-indigo-500" size={16} /> {currentLang === 'zh' ? '简历代表语录与主要指标' : currentLang === 'en' ? 'Resume Headline & Key Stats' : '이력서 대표 문구 및 주요 지표'}
        </h3>
        <p className="text-[11px] text-zinc-500 font-medium mb-5">
          {currentLang === 'zh' ? '在简历顶部醒目展示您的工作哲学与核心成果指标。' : currentLang === 'en' ? 'Prominently display your motto and key achievement metrics at the top of your resume.' : '이력서 상단에 나만의 모토와 핵심 성과 수치를 눈에 띄게 강조할 수 있습니다.'}
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <Bell size={12} className="text-indigo-500"/> {currentLang === 'zh' ? '代表语录 / 状态信息 (Motto)' : currentLang === 'en' ? 'Headline Motto / Notice' : '대표 문구 / 알림 메시지 (Motto)'}
            </label>
            <input 
              type="text"
              value={devData.motto || ''}
              onChange={(e) => updateNested(["developer", "motto"], e.target.value)}
              placeholder={currentLang === 'zh' ? '例: 以敏捷迭代和稳定架构追求卓越价值' : currentLang === 'en' ? 'e.g. Pursuing excellence through agile iteration & robust architecture' : '예: 빠른 실험과 단단한 아키텍처로 비즈니스 가치를 만듭니다'}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-800 outline-none focus:border-indigo-400 focus:bg-white transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">
                {currentLang === 'zh' ? '工作年限 (Years of Exp)' : currentLang === 'en' ? 'Years of Exp' : '경력 연차 (Years of Exp)'}
              </label>
              <input 
                type="text"
                value={devData.stats?.years || ''}
                onChange={(e) => updateNested(["developer", "stats", "years"], e.target.value)}
                placeholder={currentLang === 'zh' ? '例: 5+ Years' : currentLang === 'en' ? 'e.g. 5+ Years' : '예: 5+ Years'}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold text-zinc-800 outline-none focus:border-indigo-400 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">
                {currentLang === 'zh' ? '技术文章 (Tech Posts)' : currentLang === 'en' ? 'Tech Posts' : '기술 글 수 (Tech Posts)'}
              </label>
              <input 
                type="text"
                value={devData.stats?.posts || ''}
                onChange={(e) => updateNested(["developer", "stats", "posts"], e.target.value)}
                placeholder={currentLang === 'zh' ? '例: 24' : currentLang === 'en' ? 'e.g. 24' : '예: 24'}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold text-zinc-800 outline-none focus:border-indigo-400 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">
                {currentLang === 'zh' ? 'Github Stars' : currentLang === 'en' ? 'Github Stars' : 'Github Stars'}
              </label>
              <input 
                type="text"
                value={devData.stats?.stars || ''}
                onChange={(e) => updateNested(["developer", "stats", "stars"], e.target.value)}
                placeholder={currentLang === 'zh' ? '例: 1.2k' : currentLang === 'en' ? 'e.g. 1.2k' : '예: 1.2k'}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold text-zinc-800 outline-none focus:border-indigo-400 focus:bg-white transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 1. 경력 (Experience) */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-zinc-200/60">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-base font-black text-zinc-900 flex items-center gap-2">
            <Briefcase className="text-indigo-500" size={16} /> {currentLang === 'zh' ? '工作经历 (Experience)' : currentLang === 'en' ? 'Experience' : '경력 (Experience)'}
          </h3>
          <button 
            type="button"
            onClick={() => addArrayItem('experiences', { period: '', company: '', role: '', bullets: '' })}
            className="text-[11px] md:text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition shadow-sm"
          >
            <Plus size={14} /> {currentLang === 'zh' ? '添加经历' : currentLang === 'en' ? 'Add Experience' : '경력 추가'}
          </button>
        </div>

        <div className="space-y-4">
          {(devData.experiences || []).map((exp, idx) => (
            <div key={idx} className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl relative group">
              <button type="button" onClick={() => removeArrayItem('experiences', idx)} className="absolute top-4 right-4 text-zinc-400 hover:text-rose-500 transition-colors bg-white p-1.5 rounded-lg border border-zinc-200 shadow-sm"><Trash2 size={14} /></button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mr-10">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1">{currentLang === 'zh' ? '工作时间' : currentLang === 'en' ? 'Period' : '근무 기간'}</label>
                  <input type="text" value={exp.period || ''} onChange={(e) => updateItemField('experiences', idx, 'period', e.target.value)} className="w-full text-sm p-2.5 rounded-xl border border-zinc-200 bg-white outline-none focus:border-indigo-400 transition-colors" placeholder={currentLang === 'zh' ? '例: 2021.02 ~ 至今' : currentLang === 'en' ? 'e.g. 2021.02 ~ Present' : '예: 2021.02 ~ 현재'} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1">{currentLang === 'zh' ? '公司名称' : currentLang === 'en' ? 'Company Name' : '회사명'}</label>
                  <input type="text" value={exp.company || ''} onChange={(e) => updateItemField('experiences', idx, 'company', e.target.value)} className="w-full text-sm p-2.5 rounded-xl border border-zinc-200 bg-white outline-none focus:border-indigo-400 transition-colors" placeholder={currentLang === 'zh' ? '例: NAVER' : currentLang === 'en' ? 'e.g. NAVER' : '예: 네이버 (NAVER)'} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1">{currentLang === 'zh' ? '职位与角色' : currentLang === 'en' ? 'Role & Title' : '직무 및 역할'}</label>
                  <input type="text" value={exp.role || ''} onChange={(e) => updateItemField('experiences', idx, 'role', e.target.value)} className="w-full text-sm p-2.5 rounded-xl border border-zinc-200 bg-white outline-none focus:border-indigo-400 transition-colors" placeholder={currentLang === 'zh' ? '例: 电商后端开发工程师' : currentLang === 'en' ? 'e.g. Backend Engineer' : '예: 쇼핑 서비스 백엔드 개발자'} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1">{currentLang === 'zh' ? '主要工作与成果 (换行分隔)' : currentLang === 'en' ? 'Key Responsibilities & Achievements (Enter to split)' : '주요 업무 및 성과 (엔터로 구분)'}</label>
                  <textarea value={exp.bullets || ''} onChange={(e) => updateItemField('experiences', idx, 'bullets', e.target.value)} rows={4} className="w-full text-[13px] p-3 rounded-xl border border-zinc-200 bg-white outline-none resize-none focus:border-indigo-400 transition-colors" placeholder={currentLang === 'zh' ? '电商核心 API 开发\n高并发性能调优' : currentLang === 'en' ? 'Developed core APIs\nHigh traffic optimization' : '쇼핑 앱 주요 API 개발\n대규모 트래픽 최적화'} />
                </div>
              </div>
            </div>
          ))}
          {(devData.experiences || []).length === 0 && <p className="text-xs text-zinc-400 font-medium text-center py-6">{currentLang === 'zh' ? '暂无登记的经历。' : currentLang === 'en' ? 'No experience listed yet.' : '등록된 경력이 없습니다.'}</p>}
        </div>
      </div>

      {/* 2. 오픈소스 (Open Source) */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-zinc-200/60">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-base font-black text-zinc-900 flex items-center gap-2">
            <Terminal className="text-orange-500" size={16} /> {currentLang === 'zh' ? '开源项目 (Open Source)' : currentLang === 'en' ? 'Open Source' : '오픈소스 (Open Source)'}
          </h3>
          <button type="button" onClick={() => addArrayItem('openSources', { name: '', bullets: '' })} className="text-[11px] md:text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition shadow-sm"><Plus size={14} /> {currentLang === 'zh' ? '添加开源项目' : currentLang === 'en' ? 'Add Open Source' : '오픈소스 추가'}</button>
        </div>
        <div className="space-y-4">
          {(devData.openSources || []).map((os, idx) => (
            <div key={idx} className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl relative">
              <button type="button" onClick={() => removeArrayItem('openSources', idx)} className="absolute top-4 right-4 text-zinc-400 hover:text-rose-500 bg-white p-1.5 rounded-lg border border-zinc-200 shadow-sm"><Trash2 size={14} /></button>
              <div className="grid grid-cols-1 gap-4 mr-10">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1">{currentLang === 'zh' ? '开源/项目名称' : currentLang === 'en' ? 'Project / Repo Name' : '오픈소스/프로젝트 명'}</label>
                  <input type="text" value={os.name || ''} onChange={(e) => updateItemField('openSources', idx, 'name', e.target.value)} className="w-full text-sm p-2.5 rounded-xl border border-zinc-200 bg-white outline-none focus:border-orange-400" placeholder={currentLang === 'zh' ? '例: yowu-devtools' : currentLang === 'en' ? 'e.g. yowu-devtools' : '예: yowu-devtools'} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1">{currentLang === 'zh' ? '详细内容 (换行分隔，支持 HTML 链接)' : currentLang === 'en' ? 'Details (Enter to split, HTML link supported)' : '상세 내용 (엔터로 구분, HTML 링크 허용)'}</label>
                  <textarea value={os.bullets || ''} onChange={(e) => updateItemField('openSources', idx, 'bullets', e.target.value)} rows={3} className="w-full text-[13px] p-3 rounded-xl border border-zinc-200 bg-white outline-none resize-none focus:border-orange-400" placeholder={currentLang === 'zh' ? '填写贡献内容与链接' : currentLang === 'en' ? 'Describe contributions and link' : '기여 내용 및 링크 작성'} />
                </div>
              </div>
            </div>
          ))}
          {(devData.openSources || []).length === 0 && <p className="text-xs text-zinc-400 font-medium text-center py-6">{currentLang === 'zh' ? '暂无登记的项目。' : currentLang === 'en' ? 'No items listed yet.' : '등록된 항목이 없습니다.'}</p>}
        </div>
      </div>

      {/* 3. 발표 (Presentation) */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-zinc-200/60">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-base font-black text-zinc-900 flex items-center gap-2">
            <Mic className="text-purple-500" size={16} /> {currentLang === 'zh' ? '演讲与分享 (Presentation)' : currentLang === 'en' ? 'Presentation' : '발표 (Presentation)'}
          </h3>
          <button type="button" onClick={() => addArrayItem('presentations', { period: '', title: '', subtitle: '', bullets: '' })} className="text-[11px] md:text-xs font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition shadow-sm"><Plus size={14} /> {currentLang === 'zh' ? '添加演讲' : currentLang === 'en' ? 'Add Presentation' : '발표 추가'}</button>
        </div>
        <div className="space-y-4">
          {(devData.presentations || []).map((pt, idx) => (
            <div key={idx} className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl relative">
              <button type="button" onClick={() => removeArrayItem('presentations', idx)} className="absolute top-4 right-4 text-zinc-400 hover:text-rose-500 bg-white p-1.5 rounded-lg border border-zinc-200 shadow-sm"><Trash2 size={14} /></button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mr-10">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1">{currentLang === 'zh' ? '演讲时间' : currentLang === 'en' ? 'Date / Period' : '발표 시기'}</label>
                  <input type="text" value={pt.period || ''} onChange={(e) => updateItemField('presentations', idx, 'period', e.target.value)} className="w-full text-sm p-2.5 rounded-xl border border-zinc-200 bg-white outline-none focus:border-purple-400" placeholder={currentLang === 'zh' ? '例: 2025. 10' : currentLang === 'en' ? 'e.g. 2025. 10' : '예: 2025. 10'} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1">{currentLang === 'zh' ? '演讲主题' : currentLang === 'en' ? 'Title' : '발표 제목'}</label>
                  <input type="text" value={pt.title || ''} onChange={(e) => updateItemField('presentations', idx, 'title', e.target.value)} className="w-full text-sm p-2.5 rounded-xl border border-zinc-200 bg-white outline-none focus:border-purple-400" placeholder={currentLang === 'zh' ? '例: AI 时代的开发者生存之道' : currentLang === 'en' ? 'e.g. Surviving as a developer in AI era' : '예: AI 시대 살아남는 개발자'} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1">{currentLang === 'zh' ? '活动名称或副标题' : currentLang === 'en' ? 'Event or Subtitle' : '행사명 또는 부제'}</label>
                  <input type="text" value={pt.subtitle || ''} onChange={(e) => updateItemField('presentations', idx, 'subtitle', e.target.value)} className="w-full text-sm p-2.5 rounded-xl border border-zinc-200 bg-white outline-none focus:border-purple-400" placeholder={currentLang === 'zh' ? '例: 下班后 Meetup' : currentLang === 'en' ? 'e.g. After-work Meetup' : '예: 퇴근 후 밋업'} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1">{currentLang === 'zh' ? '详细内容与链接 (换行分隔)' : currentLang === 'en' ? 'Details & Links (Enter to split)' : '발표 상세 내용 및 링크 (엔터로 구분)'}</label>
                  <textarea value={pt.bullets || ''} onChange={(e) => updateItemField('presentations', idx, 'bullets', e.target.value)} rows={3} className="w-full text-[13px] p-3 rounded-xl border border-zinc-200 bg-white outline-none resize-none focus:border-purple-400" placeholder={currentLang === 'zh' ? '填写详细内容' : currentLang === 'en' ? 'Enter details' : '상세 내용 작성'} />
                </div>
              </div>
            </div>
          ))}
          {(devData.presentations || []).length === 0 && <p className="text-xs text-zinc-400 font-medium text-center py-6">{currentLang === 'zh' ? '暂无登记的项目。' : currentLang === 'en' ? 'No items listed yet.' : '등록된 항목이 없습니다.'}</p>}
        </div>
      </div>

      {/* 4. 아티클 (Article) */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-zinc-200/60">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-base font-black text-zinc-900 flex items-center gap-2">
            <FileText className="text-blue-500" size={16} /> {currentLang === 'zh' ? '发表文章 (Article)' : currentLang === 'en' ? 'Articles' : '작성 글 (Article)'}
          </h3>
          <button type="button" onClick={() => addArrayItem('articles', { date: '', title: '', url: '' })} className="text-[11px] md:text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition shadow-sm"><Plus size={14} /> {currentLang === 'zh' ? '添加文章' : currentLang === 'en' ? 'Add Article' : '글 추가'}</button>
        </div>
        <div className="space-y-4">
          {(devData.articles || []).map((art, idx) => (
            <div key={idx} className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 relative pr-12">
              <input type="text" value={art.date || ''} onChange={(e) => updateItemField('articles', idx, 'date', e.target.value)} className="w-full sm:w-28 text-xs p-2 rounded-lg border border-zinc-200 bg-white outline-none focus:border-blue-400 text-center font-bold" placeholder="2026.03.17" />
              <input type="text" value={art.title || ''} onChange={(e) => updateItemField('articles', idx, 'title', e.target.value)} className="flex-1 text-sm p-2 rounded-lg border border-zinc-200 bg-white outline-none focus:border-blue-400 font-medium" placeholder={currentLang === 'zh' ? '文章标题 (例: 多语言国际化实战)' : currentLang === 'en' ? 'Article Title (e.g. Building i18n support)' : '글 제목 (예: 다국어 도메인 구축기)'} />
              <input type="text" value={art.url || ''} onChange={(e) => updateItemField('articles', idx, 'url', e.target.value)} className="w-full sm:w-48 text-xs p-2 rounded-lg border border-zinc-200 bg-white outline-none focus:border-blue-400 font-mono text-zinc-600" placeholder="https://..." />
              <button type="button" onClick={() => removeArrayItem('articles', idx)} className="absolute right-3 top-3 sm:top-1/2 sm:-translate-y-1/2 text-zinc-400 hover:text-rose-500 bg-white p-1.5 rounded-lg border border-zinc-200 shadow-sm"><Trash2 size={14} /></button>
            </div>
          ))}
          {(devData.articles || []).length === 0 && <p className="text-xs text-zinc-400 font-medium text-center py-6">{currentLang === 'zh' ? '暂无登记的项目。' : currentLang === 'en' ? 'No items listed yet.' : '등록된 항목이 없습니다.'}</p>}
        </div>
      </div>

      {/* 5. 학력 (Education) */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-zinc-200/60">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-base font-black text-zinc-900 flex items-center gap-2">
            <GraduationCap className="text-emerald-500" size={16} /> {currentLang === 'zh' ? '教育背景 (Education)' : currentLang === 'en' ? 'Education' : '학력 (Education)'}
          </h3>
          <button type="button" onClick={() => addArrayItem('educations', { period: '', school: '', major: '' })} className="text-[11px] md:text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition shadow-sm"><Plus size={14} /> {currentLang === 'zh' ? '添加学历' : currentLang === 'en' ? 'Add Education' : '학력 추가'}</button>
        </div>
        <div className="space-y-4">
          {(devData.educations || []).map((edu, idx) => (
            <div key={idx} className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl relative">
              <button type="button" onClick={() => removeArrayItem('educations', idx)} className="absolute top-4 right-4 text-zinc-400 hover:text-rose-500 bg-white p-1.5 rounded-lg border border-zinc-200 shadow-sm"><Trash2 size={14} /></button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mr-10">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1">{currentLang === 'zh' ? '在读期间' : currentLang === 'en' ? 'Period' : '재학 기간'}</label>
                  <input type="text" value={edu.period || ''} onChange={(e) => updateItemField('educations', idx, 'period', e.target.value)} className="w-full text-sm p-2.5 rounded-xl border border-zinc-200 bg-white outline-none focus:border-emerald-400 transition-colors" placeholder={currentLang === 'zh' ? '例: 2010. 03 ~ 2016. 08' : currentLang === 'en' ? 'e.g. 2010. 03 ~ 2016. 08' : '예: 2010. 03 ~ 2016. 08'} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1">{currentLang === 'zh' ? '学校名称' : currentLang === 'en' ? 'School Name' : '학교명'}</label>
                  <input type="text" value={edu.school || ''} onChange={(e) => updateItemField('educations', idx, 'school', e.target.value)} className="w-full text-sm p-2.5 rounded-xl border border-zinc-200 bg-white outline-none focus:border-emerald-400 transition-colors" placeholder={currentLang === 'zh' ? '例: 天主教大学' : currentLang === 'en' ? 'e.g. Catholic University' : '예: 가톨릭대학교'} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1">{currentLang === 'zh' ? '专业与学位' : currentLang === 'en' ? 'Major & Degree' : '전공 및 학위'}</label>
                  <input type="text" value={edu.major || ''} onChange={(e) => updateItemField('educations', idx, 'major', e.target.value)} className="w-full text-sm p-2.5 rounded-xl border border-zinc-200 bg-white outline-none focus:border-emerald-400 transition-colors" placeholder={currentLang === 'zh' ? '例: 计算机工学 学士毕业' : currentLang === 'en' ? 'e.g. B.S. in Computer Science' : '예: 컴퓨터공학 학사 졸업'} />
                </div>
              </div>
            </div>
          ))}
          {(devData.educations || []).length === 0 && <p className="text-xs text-zinc-400 font-medium text-center py-6">{currentLang === 'zh' ? '暂无登记的项目。' : currentLang === 'en' ? 'No items listed yet.' : '등록된 항목이 없습니다.'}</p>}
        </div>
      </div>

      {/* 6. 기타 (ETC) */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-zinc-200/60">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-base font-black text-zinc-900 flex items-center gap-2">
            <LayoutList className="text-zinc-600" size={16} /> {currentLang === 'zh' ? '其他经历 (ETC)' : currentLang === 'en' ? 'Other Experience (ETC)' : '기타 이력 (ETC)'}
          </h3>
          <button type="button" onClick={() => addArrayItem('etcs', { period: '', title: '', subtitle: '' })} className="text-[11px] md:text-xs font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-lg flex items-center gap-1 transition shadow-sm"><Plus size={14} /> {currentLang === 'zh' ? '添加其他' : currentLang === 'en' ? 'Add Other' : '기타 추가'}</button>
        </div>
        <div className="space-y-4">
          {(devData.etcs || []).map((etc, idx) => (
            <div key={idx} className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl relative">
              <button type="button" onClick={() => removeArrayItem('etcs', idx)} className="absolute top-4 right-4 text-zinc-400 hover:text-rose-500 bg-white p-1.5 rounded-lg border border-zinc-200 shadow-sm"><Trash2 size={14} /></button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mr-10">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1">{currentLang === 'zh' ? '活动时间' : currentLang === 'en' ? 'Period' : '활동 기간'}</label>
                  <input type="text" value={etc.period || ''} onChange={(e) => updateItemField('etcs', idx, 'period', e.target.value)} className="w-full text-sm p-2.5 rounded-xl border border-zinc-200 bg-white outline-none focus:border-zinc-400 transition-colors" placeholder={currentLang === 'zh' ? '例: 2025. 09 ~ 2025. 12' : currentLang === 'en' ? 'e.g. 2025. 09 ~ 2025. 12' : '예: 2025. 09 ~ 2025. 12'} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1">{currentLang === 'zh' ? '活动名称' : currentLang === 'en' ? 'Activity / Project' : '활동명'}</label>
                  <input type="text" value={etc.title || ''} onChange={(e) => updateItemField('etcs', idx, 'title', e.target.value)} className="w-full text-sm p-2.5 rounded-xl border border-zinc-200 bg-white outline-none focus:border-zinc-400 transition-colors" placeholder={currentLang === 'zh' ? '例: NAVER Boostcamp 代码评审员' : currentLang === 'en' ? 'e.g. NAVER Boostcamp Code Reviewer' : '예: NAVER Boostcamp 코드 리뷰어'} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1">{currentLang === 'zh' ? '详细角色' : currentLang === 'en' ? 'Detailed Role' : '상세 역할'}</label>
                  <input type="text" value={etc.subtitle || ''} onChange={(e) => updateItemField('etcs', idx, 'subtitle', e.target.value)} className="w-full text-sm p-2.5 rounded-xl border border-zinc-200 bg-white outline-none focus:border-zinc-400 transition-colors" placeholder={currentLang === 'zh' ? '例: Web (BE/FE) Code Reviewer' : currentLang === 'en' ? 'e.g. Web (BE/FE) Code Reviewer' : '예: Web (BE/FE) Code Reviewer'} />
                </div>
              </div>
            </div>
          ))}
          {(devData.etcs || []).length === 0 && <p className="text-xs text-zinc-400 font-medium text-center py-6">{currentLang === 'zh' ? '暂无登记的项目。' : currentLang === 'en' ? 'No items listed yet.' : '등록된 항목이 없습니다.'}</p>}
        </div>
      </div>

    </div>
  );
};