import React, { useState, useEffect } from 'react';
import { 
  Edit2, Save, Eye, Lock, Upload, AtSign, Loader2, Sparkles, 
  GraduationCap, MapPin, X as CloseIcon, Link as LinkIcon, Trash2,
  Code, Briefcase, UserPlus, CreditCard, MessageSquare, Palette, Compass, Quote, FileText, Grid,
  Layers, Terminal, Globe, Users, KeyRound, ShieldCheck, Plus, EyeOff 
} from 'lucide-react';
import { useAppStore } from '../store/AppStore';

import EditHistoryModal from '../components/profile/EditHistoryModal';
import Mandalart from '../components/profile/tabs/Mandalart';

import { 
  DeveloperEditTab, CareerEditTab, AddProfileEditTab, BusinessCardEditTab, 
  QnaEditTab, HobbyEditTab, QuotesEditTab, MemoEditTab, ArtEditTab,
  PersonaEditTab, ResumeEditTab
} from '../components/profile/tabs/EditTabs';

export const getDefaultPersonas = (currentLang = 'ko') => ({
  portfolio: { id: 'portfolio', name: currentLang === 'zh' ? '💼 作品集' : currentLang === 'en' ? '💼 Portfolio' : '💼 포트폴리오', desc: currentLang === 'zh' ? '企业/正式履历' : currentLang === 'en' ? 'Enterprise/Formal Profile' : '기업/공적 프로필', tabs: ['developer', 'developer2', 'career', 'businessCard'], color: 'bg-blue-50 text-blue-600', activeColor: 'bg-blue-500 text-white border-blue-500', isVisible: true, visibilityLevel: 0, passcode: '', isActive: true },
  social: { id: 'social', name: currentLang === 'zh' ? '🍻 社交' : currentLang === 'en' ? '🍻 Social' : '🍻 친목', desc: currentLang === 'zh' ? '朋友/社交拓展' : currentLang === 'en' ? 'Friends/Networking' : '친구/네트워킹용', tabs: ['addProfile', 'qna', 'hobby', 'art', 'memo'], color: 'bg-amber-50 text-amber-600', activeColor: 'bg-amber-500 text-white border-amber-500', isVisible: true, visibilityLevel: 0, passcode: '', isActive: true },
  dating: { id: 'dating', name: currentLang === 'zh' ? '💖 恋爱' : currentLang === 'en' ? '💖 Dating' : '💖 이성', desc: currentLang === 'zh' ? '恋爱感性资料' : currentLang === 'en' ? 'Emotional Dating Profile' : '이성 어필용 감성 프로필', tabs: ['addProfile', 'vision', 'qna', 'hobby'], color: 'bg-rose-50 text-rose-600', activeColor: 'bg-rose-500 text-white border-rose-500', isVisible: true, visibilityLevel: 0, passcode: '', isActive: true },
  fan: { id: 'fan', name: currentLang === 'zh' ? '🎨 兴趣爱好' : currentLang === 'en' ? '🎨 Hobbies & Fan' : '🎨 덕질', desc: currentLang === 'zh' ? '爱好/创作者' : currentLang === 'en' ? 'Hobbies/Creator' : '취미/크리에이터용', tabs: ['hobby', 'art', 'memo', 'quotes', 'qna'], color: 'bg-purple-50 text-purple-600', activeColor: 'bg-purple-500 text-white border-purple-500', isVisible: true, visibilityLevel: 0, passcode: '', isActive: true },
  custom: { id: 'custom', name: currentLang === 'zh' ? '🛠️ 自定义角色' : currentLang === 'en' ? '🛠️ Custom Persona' : '🛠️ 커스텀 페르소나', desc: currentLang === 'zh' ? '自由选择标签' : currentLang === 'en' ? 'Custom view with chosen tabs' : '원하는 탭만 골라 만드는 커스텀 뷰', tabs: [], color: 'bg-teal-50 text-teal-600', activeColor: 'bg-teal-500 text-white border-teal-500', isVisible: true, visibilityLevel: 0, passcode: '', isActive: true }
});

export const DEFAULT_PERSONAS = getDefaultPersonas('ko');

const EditProfileView = () => {
  const { setViewMode, user, showToast, fetchAllData, apiFetch, setOnboardingModalOpen, t, currentLang } = useAppStore();
  
  const [formData, setFormData] = useState(() => {
    const safeUser = JSON.parse(JSON.stringify(user || {}));
    const qnaData = safeUser.qna?.length ? safeUser.qna : (safeUser.idol?.qna || safeUser.addProfile?.qna || []);
    
    let parsedPrivacy = { developer: false, developer2: false, career: false, addProfile: false, businessCard: false, qna: false, hobby: false, vision: false, quotes: false, memo: false, art: false };
    if (safeUser.privacy) {
        if (typeof safeUser.privacy === 'string') {
            try { parsedPrivacy = { ...parsedPrivacy, ...JSON.parse(safeUser.privacy) }; } catch(e) { }
        } else if (typeof safeUser.privacy === 'object') {
            parsedPrivacy = { ...parsedPrivacy, ...safeUser.privacy };
        }
    }

    // 기본 탭 순서 목록
    const defaultOrder = ['developer', 'developer2', 'career', 'addProfile', 'businessCard', 'qna', 'hobby', 'vision', 'quotes', 'memo', 'art'];
    const savedOrder = safeUser.idol?.tabOrder || safeUser.addProfile?.tabOrder;
    
    let initialTabOrder;
    if (Array.isArray(savedOrder) && savedOrder.length > 0) {
      // 기존에 저장된 순서가 있는 경우 해당 탭들만 활성화 (미사용 탭 강제 병합 제거)
      initialTabOrder = savedOrder.filter(id => defaultOrder.includes(id));
      if (initialTabOrder.length === 0) {
        initialTabOrder = ['developer', 'addProfile'];
      }
    } else {
      // 저장된 tabOrder가 없는 경우 (구버전 유저 데이터 보존 or 신규 회원 기본값)
      const activeTabsWithData = [];
      if (safeUser.developer && (safeUser.developer.about || (safeUser.developer.projects && safeUser.developer.projects.length > 0))) activeTabsWithData.push('developer');
      if (safeUser.career && (safeUser.career.targetJob || (safeUser.career.strengths && safeUser.career.strengths.length > 0))) activeTabsWithData.push('career');
      if (safeUser.addProfile && (safeUser.addProfile.mbti || safeUser.addProfile.motto)) activeTabsWithData.push('addProfile');
      if (safeUser.addProfile?.businessCard?.email || safeUser.idol?.businessCard?.email) activeTabsWithData.push('businessCard');
      if (safeUser.addProfile?.qna?.length || safeUser.idol?.qna?.length || safeUser.qna?.length) activeTabsWithData.push('qna');
      if (safeUser.addProfile?.hobby?.title || safeUser.idol?.hobby?.title) activeTabsWithData.push('hobby');
      if (safeUser.addProfile?.vision?.core || safeUser.idol?.vision?.core) activeTabsWithData.push('vision');
      if (safeUser.addProfile?.quotes?.length || safeUser.idol?.quotes?.length) activeTabsWithData.push('quotes');
      if (safeUser.addProfile?.memoArea?.text || safeUser.idol?.memoArea?.text) activeTabsWithData.push('memo');
      if (safeUser.addProfile?.memoArea?.dots?.some(d => d !== "") || safeUser.idol?.memoArea?.dots?.some(d => d !== "")) activeTabsWithData.push('art');

      if (activeTabsWithData.length > 0) {
        initialTabOrder = [...new Set(['developer', ...activeTabsWithData])];
      } else {
        // 신규 회원의 경우 사용하지 않는 탭에 부담을 느끼지 않도록 핵심 2개 탭만 기본 활성화!
        initialTabOrder = ['developer', 'addProfile'];
      }
    }
    
    const savedPersonaOrder = safeUser.idol?.personaOrder || ['all', ...Object.keys(safeUser.idol?.personas || DEFAULT_PERSONAS)];

    let memoArea = safeUser.idol?.memoArea || safeUser.memoArea || { text: "", dots: [], gridSize: 15 };
    if (!memoArea.gridSize) memoArea.gridSize = 15;
    const totalDots = memoArea.gridSize * memoArea.gridSize;
    if (!memoArea.dots || memoArea.dots.length !== totalDots) {
        memoArea.dots = Array(totalDots).fill("");
    } else {
        memoArea.dots = memoArea.dots.map(d => d === true ? '#ec4899' : (d === false ? "" : d));
    }

    return {
      ...safeUser,
      profileImageUrl: safeUser.profileImageUrl || '',
      privacy: parsedPrivacy,
      developer: safeUser.developer || { techStack: {}, projects: [], learning: [], about: "", experiences: [], educations: [], openSources: [], presentations: [], articles: [] },
      career: safeUser.career || { targetJob: "", techStack: [], interests: [], strengths: [], careerGoals: {} },
      
      idol: { 
          ...(safeUser.idol || {}),
          tabOrder: initialTabOrder,
          personaOrder: [...new Set(savedPersonaOrder)], 
          personas: safeUser.idol?.personas || JSON.parse(JSON.stringify(DEFAULT_PERSONAS)),
          businessCard: safeUser.idol?.businessCard || safeUser.businessCard || { company: "", position: "", email: "", phone: "", website: "", address: "", template: "dark" },
          qna: qnaData,
          hobby: safeUser.idol?.hobby || safeUser.hobby || { title: "", image: "", description: "", keywords: [] },
          vision: safeUser.idol?.vision || safeUser.vision || { core: "", subs: Array(8).fill(""), details: Array.from({length: 8}, () => Array(8).fill("")) },
          quotes: safeUser.idol?.quotes || safeUser.quotes || [],
          memoArea: memoArea,
          updatedAt: safeUser.idol?.updatedAt || new Date().toISOString().split('T')[0],
          history: safeUser.idol?.history || [],
          extraImage: safeUser.idol?.extraImage || "", 
          mbti: safeUser.idol?.mbti || "", 
          bloodType: safeUser.idol?.bloodType || "", 
          height: safeUser.idol?.height || "", 
          religion: safeUser.idol?.religion || "", 
          relationship: safeUser.idol?.relationship || "", 
          languages: safeUser.idol?.languages || "",
          motto: safeUser.idol?.motto || "", 
          recentHobby: safeUser.idol?.recentHobby || "", 
          workingStyle: safeUser.idol?.workingStyle || "", 
          activeHours: safeUser.idol?.activeHours || "", 
          contact: safeUser.idol?.contact || "중간",
          tastes: safeUser.idol?.tastes || { hobbies: [], culture: [], foods: [], lifestyle: [] }, 
      },
      tags: safeUser.tags || [],
      goals: safeUser.goals || [],
      links: safeUser.links || []
    };
  });

  const [editTab, setEditTab] = useState(() => (formData.idol?.tabOrder?.[0] || 'developer'));
  const [isLoading, setIsLoading] = useState(false);
  
  const [isProfileImageUploading, setIsProfileImageUploading] = useState(false);
  const [isHobbyImageUploading, setIsHobbyImageUploading] = useState(false);
  const [isExtraImageUploading, setIsExtraImageUploading] = useState(false); 

  const [isCheckingHandle, setIsCheckingHandle] = useState(false);
  const [isHandleAvailable, setIsHandleAvailable] = useState(true);
  
  const [viewHistoryItem, setViewHistoryItem] = useState(null); 
  const [draggedTabIndex, setDraggedTabIndex] = useState(null);
  const [draggedPersonaIndex, setDraggedPersonaIndex] = useState(null);
  const [showAddTabModal, setShowAddTabModal] = useState(false);

  // 11개 프로필 서브 탭 메타데이터 (아이콘, 영문/한글 이름, 설명, 배지 색상)
  const ALL_SUBTABS_INFO = {
    developer: { 
      id: 'developer', 
      label: 'Developer', 
      name: currentLang === 'zh' ? '开发者资料' : currentLang === 'en' ? 'Developer Profile' : '개발자 프로필', 
      desc: currentLang === 'zh' ? '系统整理技术栈、项目与学习记录。' : currentLang === 'en' ? 'Organize tech stacks, projects, and learning logs.' : '기술 스택, 프로젝트, 학습 기록 등을 체계적으로 정리합니다.', 
      icon: <Code size={16}/>, 
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200' 
    },
    developer2: { 
      id: 'developer2', 
      label: 'Resume', 
      name: currentLang === 'zh' ? '详细简历' : currentLang === 'en' ? 'Detailed Resume' : '상세 이력서', 
      desc: currentLang === 'zh' ? '记录学历、工作经历、开源项目、技术文章及演讲。' : currentLang === 'en' ? 'Record education, experience, open source, articles, and talks.' : '학력, 경력, 오픈소스, 아티클 및 발표 이력을 기록합니다.', 
      icon: <Terminal size={16}/>, 
      badgeColor: 'bg-zinc-100 text-zinc-800 border-zinc-300' 
    },
    career: { 
      id: 'career', 
      label: 'Career', 
      name: currentLang === 'zh' ? '职业发展' : currentLang === 'en' ? 'Career Path' : '커리어 패스', 
      desc: currentLang === 'zh' ? '设定目标岗位、核心能力及中长期职业规划。' : currentLang === 'en' ? 'Set target roles, core competencies, and career goals.' : '목표 직무, 핵심 역량 및 중장기 커리어 비전을 설정합니다.', 
      icon: <Briefcase size={16}/>, 
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200' 
    },
    addProfile: { 
      id: 'addProfile', 
      label: 'Add Profile', 
      name: currentLang === 'zh' ? '个人详情' : currentLang === 'en' ? 'Detailed Profile' : '프로필 상세', 
      desc: currentLang === 'zh' ? '关联MBTI、座右铭与社交媒体(SNS)链接。' : currentLang === 'en' ? 'Connect MBTI, motto, and social media links.' : 'MBTI, 인생 좌우명, 소셜 미디어(SNS) 링크를 연결합니다.', 
      icon: <UserPlus size={16}/>, 
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200' 
    },
    businessCard: { 
      id: 'businessCard', 
      label: 'Business Card', 
      name: currentLang === 'zh' ? '数字名片' : currentLang === 'en' ? 'Digital Card' : '디지털 명함', 
      desc: currentLang === 'zh' ? '分享邮箱、职位、机构及联系方式。' : currentLang === 'en' ? 'Share email, title, organization, and contact info.' : '이메일, 직함, 소속 및 연락처 정보를 공유합니다.', 
      icon: <CreditCard size={16}/>, 
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' 
    },
    qna: { 
      id: 'qna', 
      label: 'Q&A', 
      name: currentLang === 'zh' ? '100问100答' : currentLang === 'en' ? 'Q&A 100' : '100문 100답', 
      desc: currentLang === 'zh' ? '深入了解个人价值观与品味的深度问答。' : currentLang === 'en' ? 'In-depth interview exploring values and tastes.' : '가치관과 취향을 깊이 있게 묻고 답하는 인터뷰입니다.', 
      icon: <MessageSquare size={16}/>, 
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200' 
    },
    hobby: { 
      id: 'hobby', 
      label: 'Hobby', 
      name: currentLang === 'zh' ? '兴趣爱好' : currentLang === 'en' ? 'Hobbies' : '취미 / 관심사', 
      desc: currentLang === 'zh' ? '登记喜爱的兴趣照片与精彩故事。' : currentLang === 'en' ? 'Add photos and stories about your favorite hobbies.' : '좋아하는 취미 사진과 상세 이야기를 등록합니다.', 
      icon: <Palette size={16}/>, 
      badgeColor: 'bg-violet-50 text-violet-700 border-violet-200' 
    },
    vision: { 
      id: 'vision', 
      label: 'Mandalart', 
      name: currentLang === 'zh' ? '曼陀罗目标' : currentLang === 'en' ? 'Mandalart' : '만다라트 목표', 
      desc: currentLang === 'zh' ? '通过9x9网格管理核心目标与8项细分计划。' : currentLang === 'en' ? 'Manage core goals and 8 sub-plans on a 9x9 grid.' : '핵심 목표와 8개 세부 계획을 9x9 격자로 관리합니다.', 
      icon: <Compass size={16}/>, 
      badgeColor: 'bg-pink-50 text-pink-700 border-pink-200' 
    },
    quotes: { 
      id: 'quotes', 
      label: 'Quotes', 
      name: currentLang === 'zh' ? '人生语录' : currentLang === 'en' ? 'Quotes' : '인생 명언집', 
      desc: currentLang === 'zh' ? '收集启发人心的名言、书摘与座右铭。' : currentLang === 'en' ? 'Collect inspiring quotes, book passages, and mindsets.' : '영감을 주는 책 구절, 명언 및 마인드셋을 모아둡니다.', 
      icon: <Quote size={16}/>, 
      badgeColor: 'bg-yellow-50 text-yellow-800 border-yellow-200' 
    },
    memo: { 
      id: 'memo', 
      label: 'Memo', 
      name: currentLang === 'zh' ? '随手便签' : currentLang === 'en' ? 'Free Memo' : '프리 메모장', 
      desc: currentLang === 'zh' ? '随心记录想法与灵感的自由便签空间。' : currentLang === 'en' ? 'Free space to write notes and ideas.' : '자유로운 생각과 아이디어를 편하게 메모하는 공간입니다.', 
      icon: <FileText size={16}/>, 
      badgeColor: 'bg-orange-50 text-orange-700 border-orange-200' 
    },
    art: { 
      id: 'art', 
      label: 'Dot Art', 
      name: currentLang === 'zh' ? '像素画布' : currentLang === 'en' ? 'Dot Art Canvas' : '도트 아트 캔버스', 
      desc: currentLang === 'zh' ? '在15x15像素网格上创作专属像素艺术。' : currentLang === 'en' ? 'Create pixel art on a 15x15 grid.' : '15x15 픽셀 그리드 위에 나만의 도트 그래픽을 그립니다.', 
      icon: <Grid size={16}/>, 
      badgeColor: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200' 
    },
  };

  const TABS_CONFIG = {
    ...ALL_SUBTABS_INFO,
    persona: { 
      id: 'persona', 
      label: 'Persona Set', 
      name: currentLang === 'zh' ? '人格设定' : currentLang === 'en' ? 'Persona Set' : '페르소나 설정', 
      desc: currentLang === 'zh' ? '按场景分组的标签页组合' : currentLang === 'en' ? 'Profile sub-tabs grouped by context' : '상황별 탭 묶음 프로필', 
      icon: <Layers size={16}/>, 
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200' 
    }
  };

  const activeTabIds = formData.idol?.tabOrder || [];
  const inactiveTabIds = Object.keys(ALL_SUBTABS_INFO).filter(id => !activeTabIds.includes(id));

  // 탭 추가 핸들러
  const handleAddTab = (tabId) => {
    if (activeTabIds.includes(tabId)) return;
    const newOrder = [...activeTabIds, tabId];
    updateNested(['idol', 'tabOrder'], newOrder);
    setEditTab(tabId);
    setShowAddTabModal(false);
    showToast(currentLang === 'zh' ? `'${ALL_SUBTABS_INFO[tabId]?.name || tabId}' 标签已激活！ ✨` : currentLang === 'en' ? `'${ALL_SUBTABS_INFO[tabId]?.name || tabId}' tab activated! ✨` : `'${ALL_SUBTABS_INFO[tabId]?.name || tabId}' 탭이 활성화되었습니다! ✨`);
  };

  // 탭 비활성화(숨김) 핸들러
  const handleRemoveTab = (tabId) => {
    if (activeTabIds.length <= 1) {
      showToast(currentLang === 'zh' ? '必须保留至少1个子标签页。' : currentLang === 'en' ? 'At least 1 sub-tab must be maintained.' : '최소 1개 이상의 서브 탭은 유지되어야 합니다.');
      return;
    }
    const tabName = ALL_SUBTABS_INFO[tabId]?.name || tabId;
    if (window.confirm(currentLang === 'zh' ? `确定要隐藏 '${tabName}' 标签吗？\n\n（已编写的数据将被安全保存，随时可通过[+ 添加标签]重新开启。）` : currentLang === 'en' ? `Hide the '${tabName}' tab?\n\n(Your data will be safely kept and you can turn it back on anytime via [+ Add Tab].)` : `'${tabName}' 탭을 비활성화(숨김)하시겠습니까?\n\n(작성하신 데이터는 안전하게 보존되며 언제든 [+ 탭 추가] 버튼으로 다시 켤 수 있습니다.)`)) {
      const newOrder = activeTabIds.filter(id => id !== tabId);
      updateNested(['idol', 'tabOrder'], newOrder);
      if (editTab === tabId) {
        setEditTab(newOrder[0] || 'persona');
      }
      showToast(currentLang === 'zh' ? `'${tabName}' 标签已隐藏。` : currentLang === 'en' ? `'${tabName}' tab is now hidden.` : `'${tabName}' 탭이 비활성화되었습니다.`);
    }
  };

  // ⭐️ 4단계 공개 범위 레벨 조회 헬퍼 (0: 전체공개, 1: 팔로워공개, 2: 비밀번호 잠금, 4: 비공개)
  const getTabLevel = (tabId) => {
    const val = formData.privacy?.[tabId];
    if (val === undefined || val === null) return 0;
    if (val === true || val === 'true') return 0;
    if (val === false || val === 'false') return 4;
    return Number(val);
  };

  const isTabPrivate = (tabId) => {
    return getTabLevel(tabId) === 4;
  };

  const updateNested = (path, value) => {
    setFormData(prev => {
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) current[path[i]] = {};
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return newData;
    });
  };

  useEffect(() => {
    if (!formData.idol?.personas) return;
    const currentPersonaKeys = Object.keys(formData.idol.personas);
    const currentOrder = formData.idol.personaOrder || [];
    
    const missingKeys = currentPersonaKeys.filter(k => !currentOrder.includes(k));
    if (missingKeys.length > 0) {
        updateNested(['idol', 'personaOrder'], [...currentOrder, ...missingKeys]);
    }
  }, [formData.idol?.personas]);

  const handleCommitProfile = () => {
      const currentData = { ...formData.idol };
      delete currentData.history;
      
      const commit = {
          id: Date.now().toString(),
          date: formData.idol.updatedAt || new Date().toISOString().split('T')[0],
          snapshot: currentData
      };

      const currentHistory = formData.idol.history || [];
      const newHistory = [commit, ...currentHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
      
      updateNested(['idol', 'history'], newHistory);
      showToast(currentLang === 'zh' ? `已固定当前记录（基准日期：${commit.date}）！📸` : currentLang === 'en' ? `Current record pinned as of ${commit.date}! 📸` : `${commit.date} 기준으로 현재 기록이 고정되었습니다! 📸`);
  };

  const uploadImageToServer = async (file, path, setUploadingState) => {
    const MAX_FILE_SIZE = 50 * 1024 * 1024; 
    if (file.size > MAX_FILE_SIZE) return showToast(currentLang === 'zh' ? '文件大小不能超过 50MB。' : currentLang === 'en' ? 'File size cannot exceed 50MB.' : '파일 용량이 50MB를 초과할 수 없습니다.');

    if (setUploadingState) setUploadingState(true);
    else setIsLoading(true);
    
    const fileData = new FormData();
    fileData.append("file", file);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      const res = await fetch('https://api.cravelog.me/api/v1/files/upload', {
        method: 'POST',
        body: fileData,
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (res.status === 413) return showToast(currentLang === 'zh' ? '超出服务器上传大小限制。' : currentLang === 'en' ? 'Exceeded server upload limit.' : '서버 업로드 용량 제한을 초과했습니다.');

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          if (res.ok) {
            const fullImageUrl = data.imageUrl?.startsWith('http') ? data.imageUrl : `https://api.cravelog.me${data.imageUrl}`;
            updateNested(path, fullImageUrl); 
            showToast(currentLang === 'zh' ? '图片上传成功。' : currentLang === 'en' ? 'Image uploaded successfully.' : '이미지가 성공적으로 업로드되었습니다.');
          } else {
            showToast(data.message || (currentLang === 'zh' ? '图片上传失败。' : currentLang === 'en' ? 'Image upload failed.' : '이미지 업로드에 실패했습니다.'));
          }
      } else {
          if (!res.ok) showToast(currentLang === 'zh' ? `服务器错误（状态码: ${res.status}）` : currentLang === 'en' ? `Server error (Status code: ${res.status})` : `서버 에러가 발생했습니다. (상태 코드: ${res.status})`);
      }
    } catch (error) {
      console.error(error);
      showToast(currentLang === 'zh' ? '无法连接到服务器。' : currentLang === 'en' ? 'Cannot connect to server.' : '서버와 연결할 수 없습니다.');
    } finally {
      if (setUploadingState) setUploadingState(false);
      else setIsLoading(false);
    }
  };

  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) uploadImageToServer(file, ["profileImageUrl"], setIsProfileImageUploading);
    e.target.value = null; 
  };

  const handleHobbyImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) uploadImageToServer(file, ["idol", "hobby", "image"], setIsHobbyImageUploading);
    e.target.value = null; 
  };

  const handleExtraImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) uploadImageToServer(file, ["idol", "extraImage"], setIsExtraImageUploading);
    e.target.value = null; 
  };

  const handleCheckDuplicateHandle = async () => {
    if (!formData.handle?.trim()) return showToast(currentLang === 'zh' ? '请输入用户ID。' : currentLang === 'en' ? 'Please enter a handle.' : '아이디를 입력해주세요.');
    if (!/^[a-z0-9._-]+$/.test(formData.handle)) return showToast(currentLang === 'zh' ? '用户ID仅支持小写英文字母、数字、句点(.)、下划线(_)和连字符(-)。' : currentLang === 'en' ? 'Handle can only contain lowercase letters, numbers, dot (.), underscore (_), and hyphen (-).' : '아이디는 영문 소문자, 숫자, 마침표(.), 밑줄(_), 하이픈(-)만 가능합니다.');
    if (formData.handle === user.handle) {
        setIsHandleAvailable(true);
        return showToast(currentLang === 'zh' ? '这是您当前正在使用的ID。✅' : currentLang === 'en' ? 'This is your current handle. ✅' : '현재 사용 중인 내 아이디입니다. ✅');
    }

    setIsCheckingHandle(true);
    try {
      const res = await apiFetch(`/users/${formData.handle}/profile`);
      if (res.ok) {
        setIsHandleAvailable(false);
        showToast(currentLang === 'zh' ? '该ID已被占用。❌ 请输入其他ID。' : currentLang === 'en' ? 'This handle is already taken. ❌ Please try another.' : '이미 사용 중인 아이디입니다. ❌ 다른 아이디를 입력해주세요.');
      } else {
        setIsHandleAvailable(true);
        showToast(currentLang === 'zh' ? '该ID可以使用！✅' : currentLang === 'en' ? 'Handle is available! ✅' : '사용 가능한 아이디입니다! ✅');
      }
    } catch (error) {
      setIsHandleAvailable(false);
      showToast(currentLang === 'zh' ? '检查重复时发生错误。' : currentLang === 'en' ? 'Error occurred while checking duplicate handle.' : '중복 확인 중 오류가 발생했습니다.');
    } finally {
      setIsCheckingHandle(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) return showToast(currentLang === 'zh' ? '姓名是必填项。' : currentLang === 'en' ? 'Name is required.' : '이름은 필수 입력 항목입니다.');
    if (!formData.handle?.trim()) return showToast(currentLang === 'zh' ? '用户ID是必填项。' : currentLang === 'en' ? 'Handle is required.' : '고유 아이디는 필수 입력 항목입니다.');
    if (!/^[a-z0-9._-]+$/.test(formData.handle)) return showToast(currentLang === 'zh' ? '用户ID仅支持小写英文字母、数字、句点(.)、下划线(_)和连字符(-)。' : currentLang === 'en' ? 'Handle can only contain lowercase letters, numbers, dot (.), underscore (_), and hyphen (-).' : '아이디는 영문 소문자, 숫자, 마침표(.), 밑줄(_), 하이픈(-)만 가능합니다.');
    if (!isHandleAvailable && formData.handle !== user.handle) return showToast(currentLang === 'zh' ? '请先完成ID重复检查。' : currentLang === 'en' ? 'Please check if the handle is available.' : '아이디 중복 확인을 진행해주세요.');

    setIsLoading(true);

    try {
      const res = await apiFetch(`/me/profile`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        await fetchAllData();
        setViewMode('profile');
        showToast(currentLang === 'zh' ? '保存成功！🎉' : currentLang === 'en' ? 'Saved successfully! 🎉' : '성공적으로 저장되었습니다! 🎉');
      } else {
        const data = await res.json();
        showToast(data.message || (currentLang === 'zh' ? '保存个人资料失败。' : currentLang === 'en' ? 'Failed to save profile.' : '프로필 저장에 실패했습니다.'));
      }
    } catch (e) {
      showToast(currentLang === 'zh' ? '服务器连接失败。' : currentLang === 'en' ? 'Failed to connect to server.' : '서버 연결에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStringArrayInput = (label, path, placeholder = (currentLang === 'zh' ? '按回车添加' : currentLang === 'en' ? 'Press Enter to add' : '엔터(Enter)로 추가')) => {
    const rawValue = path.reduce((o, i) => (o || {})[i] || '', formData);
    const str = Array.isArray(rawValue) ? rawValue.join(',') : (rawValue ? String(rawValue) : '');
    const arr = str ? str.split(',').map(s => s.trim()).filter(Boolean) : [];
    
    return (
      <div className="w-full">
        {label && <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">{label}</label>}
        <div className="flex flex-wrap items-center gap-2">
          {arr.map((v, idx) => (
            <span key={idx} onClick={(e) => {
                e.stopPropagation();
                const newArr = [...arr];
                newArr.splice(idx, 1);
                updateNested(path, newArr.join(', '));
              }} 
              className="group flex items-center gap-1 px-3 py-1.5 bg-[#21262D] border border-zinc-700 hover:border-rose-500 hover:bg-rose-900/30 text-zinc-200 text-[11px] font-bold rounded-full transition-colors cursor-pointer"
            >
              {v} <CloseIcon size={10} className="text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
          ))}
          <input
            type="text"
            placeholder={arr.length === 0 ? placeholder : "+"}
            className="w-10 focus:w-28 px-3 py-1.5 bg-transparent border border-dashed border-zinc-600 focus:border-solid focus:border-indigo-400 text-[11px] font-bold text-zinc-200 outline-none rounded-full transition-all text-center focus:text-left placeholder:text-zinc-500 focus:placeholder:text-transparent"
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const val = e.target.value.trim();
                if (val && !arr.includes(val)) updateNested(path, [...arr, val].join(', '));
                e.target.value = '';
              }
            }}
            onBlur={e => {
              const val = e.target.value.trim();
              if (val && !arr.includes(val)) updateNested(path, [...arr, val].join(', '));
              e.target.value = '';
            }}
          />
        </div>
      </div>
    );
  };

  const renderArrayInput = (label, path, placeholder = (currentLang === 'zh' ? '按回车添加' : currentLang === 'en' ? 'Press Enter to add' : '엔터(Enter)로 추가')) => {
    let arr = path.reduce((o, i) => (o || {})[i], formData);
    if (!Array.isArray(arr)) arr = [];
    
    return (
      <div className="w-full">
        {label && <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">{label}</label>}
        <div className="flex flex-wrap items-center gap-2">
          {arr.map((v, idx) => (
            <span key={idx} onClick={(e) => {
                e.stopPropagation();
                const newArr = [...arr];
                newArr.splice(idx, 1);
                updateNested(path, newArr);
              }} 
              className="group flex items-center gap-1 px-3 py-1.5 bg-zinc-100 border border-zinc-200 hover:border-rose-300 hover:bg-rose-50 text-zinc-700 text-xs font-bold rounded-full transition-colors cursor-pointer shadow-sm"
            >
              {v} <CloseIcon size={12} className="text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
          ))}
          <input
            type="text"
            placeholder={arr.length === 0 ? placeholder : "+"}
            className="flex-1 min-w-[70px] max-w-[130px] px-3 py-1.5 bg-white border border-dashed border-zinc-300 focus:border-solid focus:border-violet-400 text-xs font-bold text-zinc-700 outline-none rounded-full transition-all focus:text-left placeholder:text-zinc-400 focus:placeholder:text-transparent shadow-sm"
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const val = e.target.value.trim();
                if (val && !arr.includes(val)) updateNested(path, [...arr, val]);
                e.target.value = '';
              }
            }}
            onBlur={e => {
              const val = e.target.value.trim();
              if (val && !arr.includes(val)) updateNested(path, [...arr, val]);
              e.target.value = '';
            }}
          />
        </div>
      </div>
    );
  };

  const renderInput = (label, path, placeholder = "") => {
    const val = path.reduce((o, i) => (o || {})[i], formData) || '';
    return (
      <div className="w-full flex-1">
        {label && <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5">{label}</label>}
        <input
          type="text"
          value={val}
          onChange={e => updateNested(path, e.target.value)}
          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-800 outline-none focus:border-violet-400 focus:bg-white transition-colors"
          placeholder={placeholder}
        />
      </div>
    );
  };

  return (
    <React.Fragment>
      <EditHistoryModal 
          viewHistoryItem={viewHistoryItem} 
          setViewHistoryItem={setViewHistoryItem} 
          formData={formData} 
          updateNested={updateNested} 
          showToast={showToast} 
      />
      
      <div className="max-w-[1000px] mx-auto w-full p-4 md:px-10 animate-in fade-in duration-300 pb-28 md:pb-10 relative">
        <header className="sticky top-0 z-[100] mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#F8FAFC]/95 backdrop-blur-md py-4 -mx-4 px-4 md:-mx-10 md:px-10 border-b border-zinc-200/60 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)]">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
               <Edit2 size={24} className="text-violet-500"/> {currentLang === 'zh' ? '编辑个人资料' : currentLang === 'en' ? 'Edit Profile' : '프로필 편집'}
            </h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setViewMode('profile')} className="px-4 py-2 bg-white border border-zinc-200 text-zinc-600 rounded-xl text-xs font-bold hover:bg-zinc-50 transition shadow-sm">
              {currentLang === 'zh' ? '取消' : currentLang === 'en' ? 'Cancel' : '취소'}
            </button>
            <button 
              onClick={handleSave} 
              disabled={isLoading || isProfileImageUploading || isHobbyImageUploading || isExtraImageUploading}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5 ${(isLoading || isProfileImageUploading || isHobbyImageUploading || isExtraImageUploading) ? 'bg-violet-400 text-white/80 cursor-not-allowed' : 'bg-violet-600 text-white hover:bg-violet-700'}`}
            >
              {(isLoading || isProfileImageUploading || isHobbyImageUploading || isExtraImageUploading) ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
              {isLoading ? (currentLang === 'zh' ? '保存中...' : currentLang === 'en' ? 'Saving...' : '저장 중...') : (currentLang === 'zh' ? '保存完成' : currentLang === 'en' ? 'Saved' : '저장 완료')}
            </button>
          </div>
        </header>

        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-100 mb-6 mt-2">
          <div className="flex flex-col md:flex-row gap-6 md:gap-10">
            <div className="shrink-0 flex flex-col items-center">
                <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-[1.5rem] md:rounded-[2rem] bg-zinc-50 border border-zinc-200 shadow-inner overflow-hidden relative group flex items-center justify-center">
                    {isProfileImageUploading && (
                        <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-20 backdrop-blur-[1px]">
                            <Loader2 size={24} className="text-violet-500 animate-spin mb-1" />
                        </div>
                    )}
                    {formData.profileImageUrl ? (
                        <img src={formData.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl font-black text-zinc-300">
                            {formData.name ? formData.name.charAt(0) : '?'}
                        </div>
                    )}
                    <label className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex-col gap-1 backdrop-blur-[2px]">
                         <Upload size={20} />
                         <span className="text-[9px] font-bold">{currentLang === 'zh' ? '更换图片' : currentLang === 'en' ? 'Change Photo' : '이미지 변경'}</span>
                         <input type="file" accept="image/*" onChange={handleProfileImageUpload} className="hidden" disabled={isProfileImageUploading} />
                    </label>
                </div>
                <div className="mt-4 w-full relative">
                    <Sparkles size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-yellow-500" />
                    <input 
                        type="text" 
                        value={formData.status || ''} 
                        onChange={e => updateNested(["status"], e.target.value)} 
                        placeholder={currentLang === 'zh' ? '状态签名' : currentLang === 'en' ? 'Status message' : '상태 메시지'}
                        className="w-full bg-zinc-50 text-zinc-800 rounded-xl px-3 pl-7 py-2 text-[11px] font-bold tracking-wider text-center outline-none border border-zinc-200 focus:border-violet-400 focus:bg-white transition-colors"
                    />
                </div>
            </div>
            
            <div className="flex-1 w-full space-y-4">
                <div className="flex flex-col md:flex-row gap-3">
                     <input 
                        type="text" 
                        value={formData.name || ''} 
                        onChange={e => updateNested(["name"], e.target.value)} 
                        placeholder={currentLang === 'zh' ? '姓名' : currentLang === 'en' ? 'Name' : '이름'}
                        className="text-2xl font-black text-zinc-900 bg-transparent border-b border-zinc-200 hover:border-zinc-300 focus:border-violet-500 outline-none pb-1 w-full md:w-1/3 transition-colors"
                    />
                    <div className="relative flex-1">
                        <AtSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400" />
                        <input 
                            type="text" 
                            value={formData.handle || ''} 
                            onChange={e => {
                                const val = e.target.value.toLowerCase();
                                updateNested(["handle"], val);
                                if (val !== user.handle) setIsHandleAvailable(false);
                                else setIsHandleAvailable(true);
                            }}
                            className={`w-full bg-violet-50/50 border rounded-xl py-2 pl-8 pr-[70px] text-sm font-bold text-violet-700 outline-none transition-colors ${!isHandleAvailable && formData.handle !== user.handle ? 'border-rose-400' : 'border-violet-100 focus:border-violet-400 focus:bg-white'}`} 
                            placeholder={currentLang === 'zh' ? '专属ID' : currentLang === 'en' ? 'Unique Handle' : '고유 아이디'}
                        />
                        <button 
                            type="button" 
                            onClick={handleCheckDuplicateHandle}
                            disabled={isCheckingHandle || !formData.handle || formData.handle === user.handle}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-violet-600 text-white text-[10px] font-bold rounded-lg hover:bg-violet-700 transition disabled:bg-zinc-300 flex items-center justify-center shrink-0"
                        >
                            {isCheckingHandle ? <Loader2 size={10} className="animate-spin" /> : (currentLang === 'zh' ? '查重' : currentLang === 'en' ? 'Check' : '중복 확인')}
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-xl flex-1 min-w-[120px] focus-within:border-violet-400 focus-within:bg-white transition-colors">
                        <Briefcase size={14} className="text-zinc-400 shrink-0"/> 
                        <input type="text" value={formData.role || ''} onChange={e => updateNested(["role"], e.target.value)} placeholder={currentLang === 'zh' ? '职位/角色' : currentLang === 'en' ? 'Role / Title' : '직무/역할'} className="bg-transparent outline-none text-xs font-bold text-zinc-700 w-full"/>
                    </div>
                    <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-xl flex-1 min-w-[120px] focus-within:border-violet-400 focus-within:bg-white transition-colors">
                        <GraduationCap size={14} className="text-zinc-400 shrink-0"/> 
                        <input type="text" value={formData.major || ''} onChange={e => updateNested(["major"], e.target.value)} placeholder={currentLang === 'zh' ? '专业/所属' : currentLang === 'en' ? 'Major / Org' : '전공/소속'} className="bg-transparent outline-none text-xs font-bold text-zinc-700 w-full"/>
                    </div>
                    <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-xl flex-1 min-w-[120px] focus-within:border-violet-400 focus-within:bg-white transition-colors">
                        <MapPin size={14} className="text-zinc-400 shrink-0"/> 
                        <input type="text" value={formData.location || ''} onChange={e => updateNested(["location"], e.target.value)} placeholder={currentLang === 'zh' ? '地区' : currentLang === 'en' ? 'Location' : '위치'} className="bg-transparent outline-none text-xs font-bold text-zinc-700 w-full"/>
                    </div>
                </div>

                <textarea 
                    value={formData.bio || ''} 
                    onChange={e => updateNested(["bio"], e.target.value)} 
                    placeholder={currentLang === 'zh' ? '一句话介绍自己' : currentLang === 'en' ? 'One line bio about yourself' : '나를 표현하는 한 줄 소개'}
                    rows={4}
                    className="w-full text-sm text-zinc-700 font-bold bg-zinc-50 border border-zinc-200 focus:border-violet-400 focus:bg-white rounded-xl p-4 outline-none resize-none transition-colors"
                />
                
                <div>
                   {renderArrayInput(currentLang === 'zh' ? '我的关键词' : currentLang === 'en' ? 'My Keywords' : '나의 키워드', ["tags"], currentLang === 'zh' ? '输入关键词后按回车' : currentLang === 'en' ? 'Enter keyword and press Enter' : '키워드 입력 후 Enter')}
                </div>

                <div className="bg-zinc-50 rounded-2xl p-3 border border-zinc-200/60 mt-4">
                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><LinkIcon size={12}/> {currentLang === 'zh' ? '社交链接管理' : currentLang === 'en' ? 'Social Links' : '소셜 링크 관리'}</h4>
                    <div className="space-y-1.5">
                        {(formData.links || []).map((link, idx) => (
                            <div key={idx} className="flex flex-col sm:flex-row gap-1.5 items-center bg-white p-1.5 rounded-lg border border-zinc-200 shadow-sm relative">
                                <select 
                                    value={link.platform} 
                                    onChange={e => { const arr=[...(formData.links||[])]; arr[idx].platform=e.target.value; updateNested(["links"], arr); }} 
                                    className="w-full sm:w-28 bg-zinc-50 border border-zinc-200 rounded-md px-2 py-1 text-[11px] font-bold outline-none focus:border-violet-400"
                                >
                                    <option value="github">GitHub</option>
                                    <option value="youtube">YouTube</option>
                                    <option value="twitch">{currentLang === 'zh' ? '直播' : currentLang === 'en' ? 'Streaming' : '스트리밍'}</option>
                                    <option value="instagram">Instagram</option>
                                    <option value="x">X(Twitter)</option>
                                    <option value="facebook">Facebook</option>
                                    <option value="kakao">{currentLang === 'zh' ? 'KakaoTalk' : currentLang === 'en' ? 'KakaoTalk' : '카카오톡'}</option>
                                    <option value="blog">{currentLang === 'zh' ? '个人博客' : currentLang === 'en' ? 'Blog' : '개인 블로그'}</option>
                                    <option value="web">{currentLang === 'zh' ? '个人网页' : currentLang === 'en' ? 'Website' : '웹페이지'}</option>
                                    <option value="notion">Notion</option>
                                    <option value="other">{currentLang === 'zh' ? '其他' : currentLang === 'en' ? 'Other' : '기타'}</option>
                                </select>
                                <input 
                                    value={link.name} 
                                    onChange={e => { const arr=[...(formData.links||[])]; arr[idx].name=e.target.value; updateNested(["links"], arr); }} 
                                    className="w-full sm:w-1/4 bg-zinc-50 border border-zinc-200 rounded-md px-2 py-1 text-[11px] font-medium outline-none focus:border-violet-400" 
                                    placeholder={currentLang === 'zh' ? '名称(可选)' : currentLang === 'en' ? 'Name (optional)' : '이름(선택)'} 
                                />
                                <input 
                                    value={link.url} 
                                    onChange={e => { const arr=[...(formData.links||[])]; arr[idx].url=e.target.value; updateNested(["links"], arr); }} 
                                    className="w-full flex-1 bg-zinc-50 border border-zinc-200 rounded-md px-2 py-1 text-[11px] font-medium outline-none focus:border-violet-400" 
                                    placeholder="https://..." 
                                />
                                <button type="button" onClick={()=>{const arr=[...(formData.links||[])]; arr.splice(idx,1); updateNested(["links"], arr);}} className="p-1 text-rose-400 hover:bg-rose-50 hover:text-rose-600 rounded-md shrink-0 transition-colors">
                                    <Trash2 size={14}/>
                                </button>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={()=>{const arr=[...(formData.links||[]), {platform:"github", name:"", url:""}]; updateNested(["links"], arr);}} className="text-[10px] font-bold text-violet-600 bg-white border border-violet-200 px-3 py-1 rounded-md hover:bg-violet-50 transition-colors w-full mt-2 shadow-sm">
                        + {currentLang === 'zh' ? '添加' : currentLang === 'en' ? 'Add' : '추가'}
                    </button>
                </div>
            </div>
          </div>
        </div>

        {editTab === 'persona' && (
            <div className="mb-4 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 animate-in fade-in">
                <h4 className="text-xs font-black text-indigo-800 mb-3 flex items-center gap-1.5">
                    <Layers size={14}/> {currentLang === 'zh' ? '顶部人格显示顺序 (可拖拽更改)' : currentLang === 'en' ? 'Top Persona Display Order (Drag to reorder)' : '상단 페르소나 표시 순서 (드래그로 변경)'}
                </h4>
                <div className="flex flex-wrap gap-2">
                    {(formData.idol.personaOrder || []).filter(pId => {
                        if (pId === 'all') return true;
                        const pObj = formData.idol?.personas?.[pId] || DEFAULT_PERSONAS[pId];
                        return pObj?.isActive !== false;
                    }).map((pId, idx, activeList) => {
                        const pObj = pId === 'all' ? { id: 'all', name: currentLang === 'zh' ? '✨ 全部' : currentLang === 'en' ? '✨ All' : '✨ 전체' } : (formData.idol?.personas?.[pId] || DEFAULT_PERSONAS[pId]);
                        if (!pObj) return null;
                        return (
                            <button
                                key={pId}
                                draggable
                                onDragStart={(e) => { setDraggedPersonaIndex(idx); e.dataTransfer.effectAllowed = 'move'; }}
                                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    if (draggedPersonaIndex === null || draggedPersonaIndex === idx) return;
                                    const newActiveList = [...activeList];
                                    const [draggedItem] = newActiveList.splice(draggedPersonaIndex, 1);
                                    newActiveList.splice(idx, 0, draggedItem);
                                    
                                    const inactiveItems = (formData.idol.personaOrder || []).filter(id => !newActiveList.includes(id));
                                    updateNested(['idol', 'personaOrder'], [...newActiveList, ...inactiveItems]);
                                    setDraggedPersonaIndex(null);
                                }}
                                onDragEnd={() => setDraggedPersonaIndex(null)}
                                className={`px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 text-[11px] font-bold rounded-xl shadow-sm cursor-grab active:cursor-grabbing transition-all hover:bg-indigo-50 ${draggedPersonaIndex === idx ? 'opacity-40 border-dashed border-indigo-400 scale-95' : ''}`}
                            >
                                {pObj.name}
                            </button>
                        );
                    })}
                </div>
            </div>
        )}

        <div className="flex flex-wrap items-center gap-2 mb-4 p-1">
          {['persona', ...(formData.idol?.tabOrder || [])].map((tabId, index) => {
              const tab = TABS_CONFIG[tabId];
              if (!tab) return null;
              
              const isPersonaTab = tabId === 'persona';
              const level = !isPersonaTab ? getTabLevel(tab.id) : 0;
              const isPrivate = level === 4;
              
              return (
                  <button 
                    key={tab.id} 
                    draggable={!isPersonaTab} 
                    onDragStart={(e) => { if(!isPersonaTab) { setDraggedTabIndex(index-1); e.dataTransfer.effectAllowed = 'move'; } }}
                    onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                    onDragEnter={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        e.preventDefault();
                        if (isPersonaTab || draggedTabIndex === null || draggedTabIndex === index-1) return;
                        const newOrder = [...(formData.idol?.tabOrder || [])];
                        const [draggedItem] = newOrder.splice(draggedTabIndex, 1);
                        newOrder.splice(index-1, 0, draggedItem);
                        updateNested(['idol', 'tabOrder'], newOrder); 
                        setDraggedTabIndex(null);
                    }}
                    onDragEnd={() => setDraggedTabIndex(null)}
                    onClick={() => setEditTab(tab.id)} 
                    className={`shrink-0 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap border cursor-grab active:cursor-grabbing 
                      ${editTab === tab.id ? 'bg-zinc-900 text-white border-zinc-900 shadow-md' : 'bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50'} 
                      ${draggedTabIndex === index-1 ? 'opacity-40 border-dashed border-indigo-400' : ''}
                      ${isPersonaTab ? 'mr-4 bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100 cursor-pointer shadow-sm' : ''}
                      ${isPrivate && editTab !== tab.id ? 'border-rose-200 bg-rose-50/40 text-rose-600' : ''}
                      ${level === 1 && editTab !== tab.id ? 'border-emerald-200 bg-emerald-50/40 text-emerald-700' : ''}
                      ${level === 2 && editTab !== tab.id ? 'border-amber-200 bg-amber-50/40 text-amber-700' : ''}
                    `}
                  >
                    {React.cloneElement(tab.icon, { size: 14 })} 
                    <span>{tab.label}</span>
                    {!isPersonaTab && (
                      <>
                        {level === 1 && <Users size={12} className={editTab === tab.id ? "text-emerald-300" : "text-emerald-500"} title={currentLang === 'zh' ? '1级：仅关注者可见' : currentLang === 'en' ? 'Level 1: Followers only' : '1단계: 팔로워 공개'} />}
                        {level === 2 && <KeyRound size={12} className={editTab === tab.id ? "text-amber-300" : "text-amber-500"} title={currentLang === 'zh' ? '2级：密码锁锁定' : currentLang === 'en' ? 'Level 2: Passcode locked' : '2단계: 비밀번호 잠금'} />}
                        {level === 4 && <Lock size={12} className={editTab === tab.id ? "text-rose-300" : "text-rose-500"} title={currentLang === 'zh' ? '4级：仅自己可见(私密)' : currentLang === 'en' ? 'Level 4: Private' : '4단계: 비공개'} />}
                      </>
                    )}
                  </button>
              );
          })}

          {/* ⭐️ + 탭 추가 버튼 (미활성화된 서브 탭이 남아있는 경우) */}
          {inactiveTabIds.length > 0 && (
            <button
              type="button"
              onClick={() => setShowAddTabModal(true)}
              className="shrink-0 flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap border border-dashed border-indigo-300 bg-indigo-50/60 text-indigo-600 hover:bg-indigo-100 hover:border-indigo-500 shadow-2xs group active:scale-95"
            >
              <Plus size={14} className="group-hover:rotate-90 transition-transform duration-200" />
              <span>{currentLang === 'zh' ? '添加标签' : currentLang === 'en' ? 'Add Tab' : '탭 추가'}</span>
              <span className="px-1.5 py-0.5 text-[10px] bg-indigo-200/80 text-indigo-800 rounded-full font-black">
                {inactiveTabIds.length}
              </span>
            </button>
          )}

          {/* ⭐️ 시작 프리셋 / 온보딩 페르소나 선택 버튼 */}
          <button
            type="button"
            onClick={() => setOnboardingModalOpen(true)}
            className="shrink-0 flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap border border-zinc-200 bg-white text-zinc-600 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/50 shadow-2xs group active:scale-95"
            title={currentLang === 'zh' ? '根据目标快速批量配置各人格所需的子标签集' : currentLang === 'en' ? 'Quickly configure sub-tab presets tailored to your goal' : '시작 목적에 맞는 페르소나별 서브 탭 세트를 일괄 구성합니다'}
          >
            <Sparkles size={13} className="text-amber-500 group-hover:rotate-12 transition-transform" />
            <span>{currentLang === 'zh' ? '预设集' : currentLang === 'en' ? 'Presets' : '시작 프리셋'}</span>
          </button>
        </div>

        {/* ⭐️ 서브 탭 4단계 공개 범위 제어 패널 & 탭 비활성화 버튼 */}
        {editTab !== 'persona' && (
          <div className="mb-6 p-4 sm:p-5 bg-white border border-zinc-200 rounded-2xl shadow-sm animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-zinc-100">
              <div>
                <h3 className="text-sm font-black text-zinc-900 flex items-center gap-2">
                  <ShieldCheck size={17} className="text-indigo-600" />
                  [{ALL_SUBTABS_INFO[editTab]?.name || TABS_CONFIG[editTab]?.label}] {currentLang === 'zh' ? '标签设置' : currentLang === 'en' ? 'Tab Settings' : '탭 설정'}
                </h3>
                <p className="text-[11px] font-medium text-zinc-500 mt-0.5">
                  {currentLang === 'zh' ? '设置此子标签页的公开访问级别，或在不需要时停用隐藏。' : currentLang === 'en' ? 'Set access security level for this sub-tab, or disable and hide it when not in use.' : '이 서브 탭의 보안 공개 레벨을 설정하거나, 사용하지 않을 때 비활성화하여 숨길 수 있습니다.'}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-black px-2.5 py-1.5 rounded-xl bg-zinc-100 text-zinc-700">
                  {getTabLevel(editTab) === 0 && (currentLang === 'zh' ? '🌐 0级 完全公开 (任何人)' : currentLang === 'en' ? '🌐 Level 0: Public (Anyone)' : '🌐 0단계 전체 공개 (누구나)')}
                  {getTabLevel(editTab) === 1 && (currentLang === 'zh' ? '👥 1级 关注者公开 (仅粉丝)' : currentLang === 'en' ? '👥 Level 1: Followers Only' : '👥 1단계 팔로워 공개 (팔로워만)')}
                  {getTabLevel(editTab) === 2 && (currentLang === 'zh' ? '🔐 2级 密码锁定 (PIN)' : currentLang === 'en' ? '🔐 Level 2: Passcode Lock (PIN)' : '🔐 2단계 비밀번호 잠금 (PIN)')}
                  {getTabLevel(editTab) === 4 && (currentLang === 'zh' ? '🔒 4级 仅自己可见 (私密)' : currentLang === 'en' ? '🔒 Level 4: Only Me (Private)' : '🔒 4단계 나만 보기 (비공개)')}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveTab(editTab)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 text-zinc-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 text-xs font-bold transition-all active:scale-95 shadow-2xs"
                  title={currentLang === 'zh' ? '停用并隐藏此标签（数据会保留，随时可重新添加）' : currentLang === 'en' ? 'Disable and hide this tab (data is kept and can be re-added anytime)' : '이 탭을 비활성화하고 숨깁니다 (작성 데이터는 보존되며 언제든 다시 추가 가능)'}
                >
                  <EyeOff size={13} />
                  <span>{currentLang === 'zh' ? '隐藏标签' : currentLang === 'en' ? 'Hide Tab' : '탭 숨기기'}</span>
                </button>
              </div>
            </div>

            {/* 4단계 선택 탭 버튼 그리드 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { level: 0, label: currentLang === 'zh' ? '完全公开' : currentLang === 'en' ? 'Public' : '전체 공개', desc: currentLang === 'zh' ? '所有人自由访问' : currentLang === 'en' ? 'Free for anyone' : '누구나 자유롭게', icon: Globe, activeBg: 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500' },
                { level: 1, label: currentLang === 'zh' ? '关注者公开' : currentLang === 'en' ? 'Followers' : '팔로워 공개', desc: currentLang === 'zh' ? '仅粉丝可浏览' : currentLang === 'en' ? 'Followers only' : '팔로워만 열람', icon: Users, activeBg: 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500' },
                { level: 2, label: currentLang === 'zh' ? '密码锁定' : currentLang === 'en' ? 'Passcode Lock' : '비밀번호 잠금', desc: currentLang === 'zh' ? '设置PIN码' : currentLang === 'en' ? 'Set PIN code' : 'PIN 번호 설정', icon: KeyRound, activeBg: 'bg-amber-50 border-amber-500 text-amber-700 ring-1 ring-amber-500' },
                { level: 4, label: currentLang === 'zh' ? '仅自己可见' : currentLang === 'en' ? 'Only Me' : '나만 보기', desc: currentLang === 'zh' ? '完全私密隐藏' : currentLang === 'en' ? 'Private (hidden)' : '비공개 (완전 숨김)', icon: Lock, activeBg: 'bg-rose-50 border-rose-500 text-rose-700 ring-1 ring-rose-500' },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = getTabLevel(editTab) === item.level;
                return (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => updateNested(['privacy', editTab], item.level)}
                    className={`p-2.5 sm:p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 ${
                      isSelected 
                        ? `${item.activeBg} font-black shadow-xs` 
                        : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                    }`}
                  >
                    <Icon size={16} className={isSelected ? '' : 'text-zinc-400'} />
                    <span className="text-[11px] font-black">{item.label}</span>
                    <span className="text-[9px] text-zinc-400 font-medium">{item.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* 2단계 선택 시 비밀번호(PIN) 설정 인풋 */}
            {getTabLevel(editTab) === 2 && (
              <div className="mt-3 p-3 bg-amber-50/80 border border-amber-200 rounded-xl animate-in fade-in duration-200">
                <label className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5 mb-1.5">
                  <KeyRound size={13} className="text-amber-600" />
                  [{TABS_CONFIG[editTab]?.label}] {currentLang === 'zh' ? '标签访问密码 (Passcode) 设置' : currentLang === 'en' ? 'Tab Passcode Setting' : '탭 열람 비밀번호 (Passcode) 설정'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.idol?.tabPasscodes?.[editTab] || ''}
                  onChange={(e) => updateNested(['idol', 'tabPasscodes', editTab], e.target.value)}
                  placeholder={currentLang === 'zh' ? '4位以上数字或字母 (如: 1234)' : currentLang === 'en' ? '4+ digits or letters (e.g. 1234)' : '숫자나 영문 4자리 이상 (예: 1234)'}
                  maxLength={20}
                  className="w-full bg-white border border-amber-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-300 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 outline-none transition-all shadow-2xs"
                />
                <p className="text-[10px] text-amber-800 font-medium mt-1">
                  {currentLang === 'zh' ? '💡 未授权访客点击此标签时，需输入上述密码才能解锁查看内容。' : currentLang === 'en' ? '💡 Unauthorized visitors must enter this passcode to unlock and view the tab content.' : '💡 비인가 방문자가 이 탭을 클릭하면 위 비밀번호를 입력해야 내용이 잠금 해제됩니다.'}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {editTab === 'persona' && <PersonaEditTab formData={formData} updateNested={updateNested} DEFAULT_PERSONAS={getDefaultPersonas(currentLang)} TABS_CONFIG={TABS_CONFIG} />}
          
          {editTab === 'developer' && <DeveloperEditTab formData={formData} updateNested={updateNested} renderStringArrayInput={renderStringArrayInput} />}
          
          {/* 이력서 탭 편집 폼 렌더링 연결 */}
          {editTab === 'developer2' && <ResumeEditTab formData={formData} updateNested={updateNested} />}
          
          {editTab === 'career' && <CareerEditTab formData={formData} updateNested={updateNested} renderArrayInput={renderArrayInput} />}
          {editTab === 'addProfile' && <AddProfileEditTab formData={formData} updateNested={updateNested} renderInput={renderInput} renderArrayInput={renderArrayInput} isExtraImageUploading={isExtraImageUploading} handleExtraImageUpload={handleExtraImageUpload} handleCommitProfile={handleCommitProfile} setViewHistoryItem={setViewHistoryItem} />}
          {editTab === 'businessCard' && <BusinessCardEditTab formData={formData} updateNested={updateNested} renderInput={renderInput} />}
          {editTab === 'qna' && <QnaEditTab formData={formData} updateNested={updateNested} />}
          {editTab === 'hobby' && <HobbyEditTab formData={formData} updateNested={updateNested} renderInput={renderInput} renderArrayInput={renderArrayInput} isHobbyImageUploading={isHobbyImageUploading} handleHobbyImageUpload={handleHobbyImageUpload} />}
          {editTab === 'vision' && <div className="animate-in fade-in"><Mandalart visionData={formData.idol?.vision} isEditMode={true} updateNested={updateNested} /></div>}
          {editTab === 'quotes' && <QuotesEditTab formData={formData} updateNested={updateNested} />}
          {editTab === 'memo' && <MemoEditTab formData={formData} updateNested={updateNested} />}
          {editTab === 'art' && <ArtEditTab formData={formData} updateNested={updateNested} />}
        </div>

        {/* ⭐️ 서브 탭 동적 활성화 모달 */}
        {showAddTabModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-zinc-100 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150">
              {/* 모달 헤더 */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-zinc-900">{currentLang === 'zh' ? '添加个人资料子标签' : currentLang === 'en' ? 'Add Profile Sub-Tab' : '프로필 서브 탭 추가하기'}</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">{currentLang === 'zh' ? '自由选择并激活适合您个人资料的标签。' : currentLang === 'en' ? 'Select and activate only the tabs you need for your profile.' : '내 프로필에 필요한 탭만 쏙쏙 골라 활성화해보세요.'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddTabModal(false)}
                  className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors"
                >
                  <CloseIcon size={18} />
                </button>
              </div>

              {/* 탭 목록 */}
              <div className="overflow-y-auto py-4 pr-1 space-y-2.5 flex-1">
                {inactiveTabIds.length === 0 ? (
                  <div className="py-12 text-center text-zinc-400 text-sm font-medium">
                    {currentLang === 'zh' ? '所有子标签页均已激活！ ✨' : currentLang === 'en' ? 'All sub-tabs are already active! ✨' : '모든 서브 탭이 이미 활성화되어 있습니다! ✨'}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {inactiveTabIds.map(tabId => {
                      const tabInfo = ALL_SUBTABS_INFO[tabId];
                      if (!tabInfo) return null;
                      return (
                        <div
                          key={tabId}
                          className="flex flex-col justify-between p-3.5 rounded-2xl border border-zinc-200/80 bg-zinc-50/50 hover:bg-indigo-50/30 hover:border-indigo-300 transition-all group"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className={`p-1.5 rounded-xl border ${tabInfo.badgeColor}`}>
                                  {tabInfo.icon}
                                </span>
                                <div>
                                  <div className="text-xs font-black text-zinc-900 group-hover:text-indigo-600 transition-colors">
                                    {tabInfo.name}
                                  </div>
                                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                                    {tabInfo.label}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <p className="text-[11px] text-zinc-500 font-medium leading-relaxed mt-1 line-clamp-2">
                              {tabInfo.desc}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddTab(tabId)}
                            className="mt-3 w-full py-1.5 px-3 bg-white group-hover:bg-indigo-600 group-hover:text-white border border-zinc-200 group-hover:border-indigo-600 rounded-xl text-xs font-black text-zinc-700 flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-95"
                          >
                            <Plus size={13} />
                            <span>{currentLang === 'zh' ? '添加' : currentLang === 'en' ? 'Add' : '추가하기'}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 모달 풋터 안내 */}
              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400 font-medium">
                <span>{currentLang === 'zh' ? '💡 已激活的标签可以在标签栏上拖拽调整顺序。' : currentLang === 'en' ? '💡 You can drag active tabs in the tab bar to reorder them.' : '💡 활성화된 탭은 탭 바에서 드래그하여 순서를 바꿀 수 있습니다.'}</span>
                <button
                  type="button"
                  onClick={() => setShowAddTabModal(false)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl text-xs transition-colors"
                >
                  {currentLang === 'zh' ? '关闭' : currentLang === 'en' ? 'Close' : '닫기'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

export default EditProfileView;