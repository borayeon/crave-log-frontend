import React, { useState, useEffect, useMemo } from 'react';
import { 
  Edit2, Share2, Rocket, User, Sparkles, MapPin, GraduationCap, 
  ChevronRight, Loader2, History, X as CloseIcon, Lock, Copy, Heart,
  Link, Terminal, PlayCircle, Camera, Hash, Users, Tv, MessageCircle, Globe,
  Code, Briefcase, UserPlus, UserCheck, CreditCard, MessageSquare, Palette, Compass, Quote, FileText, Grid,
  KeyRound, ShieldCheck
} from 'lucide-react';

import { useAppStore } from '../store/AppStore';

import BusinessCard from '../components/profile/tabs/BusinessCard';
import Mandalart from '../components/profile/tabs/Mandalart';
import VisitStatsModal from '../components/features/VisitStatsModal';
import { 
  DeveloperTab, CareerTab, AddProfileTab, QnaTab, HobbyTab, 
  QuotesTab, MemoTab, ArtTab, Developer2Tab
} from '../components/profile/ViewTabs';

const LOADING_TIPS = {
  ko: [
    "CraveLog에서는 목적에 따라 나만의 멀티 페르소나를 구성할 수 있어요.",
    "비공개로 설정한 페르소나도 '시크릿 링크'를 통해 특정인에게만 공유할 수 있어요.",
    "서버 원천 차단(Level 3) 기술이 적용되어, 허락되지 않은 방문자는 민감한 데이터를 절대 볼 수 없습니다. 🛡️"
  ],
  en: [
    "In CraveLog, you can configure multi-personas tailored for each purpose.",
    "Private personas can be shared exclusively with specific people via 'Secret Links'.",
    "With Level 3 server-side protection, unauthorized visitors cannot see sensitive data. 🛡️"
  ],
  zh: [
    "在 CraveLog 中，您可以根据不同目的配置专属的多重角色。",
    "设置为私密的角色也可以通过“私密链接”分享给指定对象。",
    "采用服务器级拦截技术（Level 3），未授权访客绝不会看到敏感数据。🛡️"
  ]
};

const getPersonaDefaults = (currentLang) => ({
  portfolio: { id: 'portfolio', name: currentLang === 'zh' ? '💼 作品集' : currentLang === 'en' ? '💼 Portfolio' : '💼 포트폴리오', desc: currentLang === 'zh' ? '企业/正式履历' : currentLang === 'en' ? 'Enterprise/Formal Profile' : '기업/공적 프로필', tabs: ['developer', 'developer2', 'career', 'businessCard'], color: 'bg-blue-50 text-blue-600', activeColor: 'bg-blue-500 text-white border-blue-500', isVisible: true, visibilityLevel: 0, passcode: '', isActive: true },
  social: { id: 'social', name: currentLang === 'zh' ? '🍻 社交' : currentLang === 'en' ? '🍻 Social' : '🍻 친목', desc: currentLang === 'zh' ? '朋友/社交拓展' : currentLang === 'en' ? 'Friends/Networking' : '친구/네트워킹용', tabs: ['addProfile', 'qna', 'hobby', 'art', 'memo'], color: 'bg-amber-50 text-amber-600', activeColor: 'bg-amber-500 text-white border-amber-500', isVisible: true, visibilityLevel: 0, passcode: '', isActive: true },
  dating: { id: 'dating', name: currentLang === 'zh' ? '💖 恋爱' : currentLang === 'en' ? '💖 Dating' : '💖 이성', desc: currentLang === 'zh' ? '恋爱感性资料' : currentLang === 'en' ? 'Emotional Dating Profile' : '이성 어필용 감성 프로필', tabs: ['addProfile', 'vision', 'qna', 'hobby'], color: 'bg-rose-50 text-rose-600', activeColor: 'bg-rose-500 text-white border-rose-500', isVisible: true, visibilityLevel: 0, passcode: '', isActive: true },
  fan: { id: 'fan', name: currentLang === 'zh' ? '🎨 兴趣爱好' : currentLang === 'en' ? '🎨 Hobbies & Fan' : '🎨 덕질', desc: currentLang === 'zh' ? '爱好/创作者' : currentLang === 'en' ? 'Hobbies/Creator' : '취미/크리에이터용', tabs: ['hobby', 'art', 'memo', 'quotes', 'qna'], color: 'bg-purple-50 text-purple-600', activeColor: 'bg-purple-500 text-white border-purple-500', isVisible: true, visibilityLevel: 0, passcode: '', isActive: true },
  custom: { id: 'custom', name: currentLang === 'zh' ? '🛠️ 自定义角色' : currentLang === 'en' ? '🛠️ Custom Persona' : '🛠️ 커스텀 페르소나', desc: currentLang === 'zh' ? '自由选择标签' : currentLang === 'en' ? 'Custom view with chosen tabs' : '원하는 탭만 골라 만드는 커스텀 뷰', tabs: [], color: 'bg-teal-50 text-teal-600', activeColor: 'bg-teal-500 text-white border-teal-500', isVisible: true, visibilityLevel: 0, passcode: '', isActive: true }
});

const DEFAULT_PERSONAS = getPersonaDefaults('ko');

const ProfileView = () => {
  const { setViewMode, user, showToast, isAdmin, setLoginModalOpen, isGuestMode, isLoading, apiFetch, visitedHandle, setOnboardingModalOpen, t, currentLang } = useAppStore();

  const [activeTab, setActiveTab] = useState(null); 
  const [viewHistoryItem, setViewHistoryItem] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showVisitStatsModal, setShowVisitStatsModal] = useState(false);
  
  const [currentPersona, setCurrentPersona] = useState('all');
  
  // 팔로우 상태 관리
  const [followStatus, setFollowStatus] = useState({ isFollowing: false, followerCount: 0, followingCount: 0 });
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  
  // 자기소개 더보기/접기 상태 관리
  const [isBioExpanded, setIsBioExpanded] = useState(false);

  // ⭐️ 2단계 비밀번호 서브 탭 잠금 해제 상태 관리
  const [unlockedTabs, setUnlockedTabs] = useState({});
  const [pinInputs, setPinInputs] = useState({});

  // ⭐️ 페르소나 4단계 보안 레벨 및 PIN 잠금 해제 상태 관리
  const [unlockedPersonas, setUnlockedPersonas] = useState({});
  const [personaPinInputs, setPersonaPinInputs] = useState({});

  const randomTip = useMemo(() => {
    const tips = LOADING_TIPS[currentLang] || LOADING_TIPS.ko;
    return tips[Math.floor(Math.random() * tips.length)];
  }, [currentLang]);

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
    const defaults = getPersonaDefaults(currentLang);
    const p = safeUser.addProfile?.personas || defaults;
    const allName = currentLang === 'zh' ? '✨ 全部' : currentLang === 'en' ? '✨ All' : '✨ 전체';
    const allDesc = currentLang === 'zh' ? '查看所有角色' : currentLang === 'en' ? 'View all profiles' : '모든 프로필 보기';
    return {
      all: { id: 'all', name: allName, desc: allDesc, tabs: null, color: 'bg-zinc-100 text-zinc-600', activeColor: 'bg-zinc-800 text-white border-zinc-800', isVisible: true, visibilityLevel: 0, isActive: true },
      ...p
    };
  }, [safeUser.addProfile?.personas, currentLang]);

  // ⭐️ 페르소나 4단계 공개 범위 레벨 조회 헬퍼 (0: 전체공개, 1: 팔로워공개, 2: 비밀번호잠금, 4: 비공개)
  const getPersonaLevel = (persona) => {
    if (!persona || persona.id === 'all') return 0;
    if (persona.visibilityLevel !== undefined && persona.visibilityLevel !== null) {
      return Number(persona.visibilityLevel);
    }
    if (persona.isVisible === false) return 4;
    return 0;
  };

  const isGuest = !isAdmin || isGuestMode;

  // ⭐️ 2단계 페르소나 비밀번호(PIN) 검증 및 잠금 해제 핸들러
  const handleUnlockPersona = (personaId) => {
    const persona = CUSTOM_PERSONAS[personaId];
    const expectedPin = persona?.passcode;
    const inputPin = (personaPinInputs[personaId] || '').trim();
    if (!expectedPin || inputPin === String(expectedPin).trim()) {
      setUnlockedPersonas(prev => ({ ...prev, [personaId]: true }));
      showToast(`[${persona?.name || '페르소나'}] ${currentLang === 'zh' ? '已成功解锁！🔓' : currentLang === 'en' ? 'unlocked successfully! 🔓' : '잠금이 해제되었습니다! 🔓'}`);
    } else {
      showToast(currentLang === 'zh' ? '密码不正确，请重新输入。' : currentLang === 'en' ? 'Incorrect passcode. Please check again.' : '비밀번호가 일치하지 않습니다. 다시 확인해주세요.');
    }
  };

  // ⭐️ 비활성화된 페르소나는 프로필에서 완전히 제외 (소유자 본인 및 게스트 모두에게 숨김)
  // 4단계(나만 보기) 비공개 페르소나는 게스트에게 기본적으로 숨김
  const visiblePersonas = Object.values(CUSTOM_PERSONAS).filter(p => {
    if (p.id === 'all') return true;
    if (p.isActive === false) return false;
    const level = getPersonaLevel(p);
    if (isGuest && level === 4) return false;
    return true;
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get('p') || params.get('token'); 
    if (p && CUSTOM_PERSONAS[p] && CUSTOM_PERSONAS[p].isActive !== false) {
        setCurrentPersona(p);
    }
  }, [CUSTOM_PERSONAS]);

  const personaOrder = safeUser.addProfile?.personaOrder || ['all', ...Object.keys(DEFAULT_PERSONAS)];
  const displayPersonas = useMemo(() => {
    const list = [...visiblePersonas];
    if (currentPersona !== 'all') {
        const pObj = CUSTOM_PERSONAS[currentPersona];
        if (pObj && pObj.isActive !== false && getPersonaLevel(pObj) === 4) {
            if (!list.find(p => p.id === currentPersona)) {
                list.push(pObj);
            }
        }
    }
    list.sort((a, b) => {
        const idxA = personaOrder.indexOf(a.id);
        const idxB = personaOrder.indexOf(b.id);
        return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
    });
    return list;
  }, [visiblePersonas, currentPersona, CUSTOM_PERSONAS, personaOrder]);

  // 자기소개 길이 제한 처리 로직 (최대 150자 또는 최대 5줄)
  const { isLongBio, displayBio } = useMemo(() => {
    const bioText = safeUser.bio || (currentLang === 'zh' ? '展示个人风采的一句话自我介绍。' : currentLang === 'en' ? 'A short bio expressing yourself.' : '나를 표현하는 한 줄 소개가 들어갑니다.');
    const BIO_MAX_LENGTH = 150;
    const BIO_MAX_LINES = 5;
    
    const lines = bioText.split('\n');
    const isLong = bioText.length > BIO_MAX_LENGTH || lines.length > BIO_MAX_LINES;

    let truncated = bioText;
    if (isLong && !isBioExpanded) {
      if (lines.length > BIO_MAX_LINES) {
        truncated = lines.slice(0, BIO_MAX_LINES).join('\n');
      }
      if (truncated.length > BIO_MAX_LENGTH) {
        truncated = truncated.slice(0, BIO_MAX_LENGTH);
      }
      truncated += '...';
    }

    return { isLongBio: isLong, displayBio: truncated };
  }, [safeUser.bio, isBioExpanded, currentLang]);

  useEffect(() => {
    if (!safeUser.handle) return;
    apiFetch(`/users/${safeUser.handle}/follow-status`)
      .then(res => res?.ok && res.json())
      .then(data => data && setFollowStatus(data))
      .catch(() => {});
  }, [safeUser.handle, apiFetch]);

  const handleToggleFollow = async () => {
    if (!isAdmin) {
      setLoginModalOpen(true);
      return;
    }
    if (!safeUser.handle) return;

    try {
      setIsFollowLoading(true);
      if (followStatus.isFollowing) {
        const res = await apiFetch(`/users/${safeUser.handle}/follow`, { method: 'DELETE' });
        if (res?.ok) {
          setFollowStatus(prev => ({
            ...prev,
            isFollowing: false,
            followerCount: Math.max(0, prev.followerCount - 1),
          }));
          showToast(`@${safeUser.handle} ${currentLang === 'zh' ? '已取消关注。' : currentLang === 'en' ? 'unfollowed.' : '팔로우를 취소했습니다.'}`);
        }
      } else {
        const res = await apiFetch(`/users/${safeUser.handle}/follow`, { method: 'POST' });
        if (res?.ok) {
          setFollowStatus(prev => ({
            ...prev,
            isFollowing: true,
            followerCount: prev.followerCount + 1,
          }));
          showToast(`@${safeUser.handle} ${currentLang === 'zh' ? '已关注！🎉' : currentLang === 'en' ? 'followed! 🎉' : '님을 팔로우했습니다! 🎉'}`);
        }
      }
    } catch (err) {
      console.error('Follow toggle error:', err);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleCopyLink = (personaId) => {
    const baseUrl = `${window.location.origin}${window.location.pathname}?u=${user?.handle || ''}`;
    
    if (!personaId || personaId === 'all') {
        navigator.clipboard.writeText(baseUrl).then(() => {
          showToast(currentLang === 'zh' ? '默认个人资料链接已复制！🔗' : currentLang === 'en' ? 'Default profile link copied! 🔗' : '기본 프로필 링크가 복사되었습니다! 🔗');
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
    const level = getPersonaLevel(persona);
    let copyMsg = `${persona.name} ${currentLang === 'zh' ? '链接已复制！🔗' : currentLang === 'en' ? 'link copied! 🔗' : '링크가 복사되었습니다! 🔗'}`;
    if (level === 1) copyMsg = `${persona.name} ${currentLang === 'zh' ? '关注者专属链接已复制！👥' : currentLang === 'en' ? 'followers-only link copied! 👥' : '팔로워 전용 링크가 복사되었습니다! 👥'}`;
    if (level === 2) copyMsg = `${persona.name} ${currentLang === 'zh' ? 'PIN保护链接已复制！🔐' : currentLang === 'en' ? 'PIN-protected link copied! 🔐' : 'PIN 잠금 링크가 복사되었습니다! 🔐'}`;
    if (level === 4) copyMsg = `${persona.name} ${currentLang === 'zh' ? '私密链接已复制！🔒' : currentLang === 'en' ? 'secret link copied! 🔒' : '시크릿 링크가 복사되었습니다! 🔒'}`;
    
    navigator.clipboard.writeText(finalUrl).then(() => {
      showToast(copyMsg);
      setShowShareModal(false);
    }).catch(_err => {
      showToast(currentLang === 'zh' ? '复制链接失败。' : currentLang === 'en' ? 'Failed to copy link.' : '링크 복사에 실패했습니다.');
    });
  };

  const shareablePersonas = (!isGuest ? Object.values(CUSTOM_PERSONAS) : visiblePersonas)
    .filter(p => p.id === 'all' || p.isActive !== false);
  const isProfileEmpty = (!safeUser.name || safeUser.name === "손님" || safeUser.name === "Guest" || safeUser.name === "访客") && (safeUser.tags || []).length === 0;

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
    developer2: { id: 'developer2', icon: <Terminal strokeWidth={2}/>, label: 'Resume', color: 'bg-zinc-800 text-zinc-100 border-zinc-700' },
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
      let p = { developer: 0, developer2: 0, career: 0, addProfile: 0, businessCard: 0, qna: 0, hobby: 0, vision: 0, quotes: 0, memo: 0, art: 0 };
      if (safeUser.privacy) {
          if (typeof safeUser.privacy === 'string') {
              try { p = { ...p, ...JSON.parse(safeUser.privacy) }; } catch {}
          } else if (typeof safeUser.privacy === 'object') {
              p = { ...p, ...safeUser.privacy };
          }
      }
      return p;
  }, [safeUser.privacy]);

  // ⭐️ 4단계 공개 범위 레벨 조회 헬퍼 (0: 전체공개, 1: 팔로워공개, 2: 비밀번호 잠금, 4: 비공개)
  const getTabLevel = (tabId) => {
      const val = privacyObj[tabId];
      if (val === undefined || val === null) return 0;
      if (val === true || val === 'true') return 0;
      if (val === false || val === 'false') return 4;
      return Number(val);
  };

  const isTabPrivate = (tabId) => {
      return getTabLevel(tabId) === 4;
  };

  // ⭐️ 2단계 서브 탭 비밀번호(PIN) 검증 및 잠금 해제 핸들러
  const handleUnlockTab = (tabId) => {
      const expectedPin = safeUser.addProfile?.tabPasscodes?.[tabId] || safeUser.tabPasscodes?.[tabId] || safeUser.idol?.tabPasscodes?.[tabId];
      const inputPin = (pinInputs[tabId] || '').trim();
      if (!expectedPin || inputPin === String(expectedPin).trim()) {
          setUnlockedTabs(prev => ({ ...prev, [tabId]: true }));
          showToast(currentLang === 'zh' ? '密码验证成功，已解锁！🔓' : currentLang === 'en' ? 'Unlocked successfully! 🔓' : '비밀번호가 일치하여 잠금이 해제되었습니다! 🔓');
      } else {
          showToast(currentLang === 'zh' ? '密码不正确，请重新输入。' : currentLang === 'en' ? 'Incorrect passcode. Please check again.' : '비밀번호가 일치하지 않습니다. 다시 확인해주세요.');
      }
  };

  const defaultOrder = ['developer', 'developer2', 'career', 'addProfile', 'businessCard', 'qna', 'hobby', 'vision', 'quotes', 'memo', 'art'];
  const savedOrder = safeUser.idol?.tabOrder || safeUser.addProfile?.tabOrder;
  const currentOrder = (Array.isArray(savedOrder) && savedOrder.length > 0 ? savedOrder : defaultOrder).filter(id => allTabsMap[id]);

  const activePersonaObj = CUSTOM_PERSONAS[currentPersona] || CUSTOM_PERSONAS['all'];

  const isDataActuallyEmpty = (tabId) => {
    switch(tabId) {
      case 'developer':
      case 'developer2': 
        return !safeUser.developer || (!safeUser.developer.about && (!safeUser.developer.projects || safeUser.developer.projects.length === 0));
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
        // 4단계 비공개(4) 탭은 게스트에게 숨김
        if (isGuest && currentPersona === 'all' && isTabPrivate(tab.id)) return false;
        // 1단계, 2단계 탭은 잠금 카드를 보여주기 위해 유지
        if (isGuest && (getTabLevel(tab.id) === 1 || getTabLevel(tab.id) === 2)) return true;
        if (isDataActuallyEmpty(tab.id)) return false; 
        return true; 
    });

  useEffect(() => {
    if (!availableTabs.some(t => t.id === activeTab)) {
      setActiveTab(availableTabs.length > 0 ? availableTabs[0].id : null);
    }
  }, [availableTabs, activeTab]);

  if (isLoading) {
    return (
      <div className="w-full h-[80vh] flex flex-col items-center justify-center bg-[#F8FAFC] px-6 animate-in fade-in duration-500">
        <div className="relative flex items-center justify-center mb-8">
           <div className="absolute inset-0 bg-indigo-200/50 rounded-full blur-2xl animate-pulse"></div>
           <Loader2 size={40} className="text-indigo-500 animate-spin relative z-10" />
        </div>
        <h2 className="text-xl md:text-2xl font-black text-zinc-800 tracking-tight mb-8">
          {currentLang === 'zh' ? '正在加载数据...' : currentLang === 'en' ? 'Loading data...' : '데이터를 불러오는 중입니다'}
        </h2>
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

  // ⭐️ 비로그인 상태이면서 특정 사용자의 프로필을 방문 중이지 않은 경우: 로그인 요구 화면 렌더링
  if (!isAdmin && !visitedHandle) {
    return (
      <div className="max-w-md mx-auto w-full min-h-[70vh] flex flex-col items-center justify-center text-center px-4 animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-5 shadow-inner">
          <Lock size={30} />
        </div>
        <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg mb-2">
          {currentLang === 'zh' ? '需要登录' : currentLang === 'en' ? 'Login Required' : '로그인 필요'}
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight mb-2">
          {currentLang === 'zh' ? '该页面需要登录访问' : currentLang === 'en' ? 'This page requires login' : '로그인이 필요한 페이지입니다'}
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 font-medium leading-relaxed mb-6 max-w-sm">
          {currentLang === 'zh' ? '要管理您个人的档案和时间线，请先登录 CraveLog。' : currentLang === 'en' ? 'Please log in to CraveLog first to manage your personal archives and timeline.' : '나만의 프로필과 기록을 관리하시려면 먼저 CraveLog에 로그인해주세요.'}
        </p>
        <div className="flex items-center gap-3 w-full justify-center">
          <button
            onClick={() => setLoginModalOpen(true)}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition shadow-md hover:shadow-lg active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <Lock size={14} />
            <span>{currentLang === 'zh' ? '立即登录' : currentLang === 'en' ? 'Log in' : '로그인하기'}</span>
          </button>
          <button
            onClick={() => setViewMode('landing')}
            className="px-5 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer"
          >
            {currentLang === 'zh' ? '前往首页(介绍)' : currentLang === 'en' ? 'Go to Home / About' : '홈(소개)으로 이동'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto w-full pb-10 relative animate-in fade-in duration-300 px-4 md:px-8 pt-6 md:pt-10 flex flex-col min-h-screen">
      
      {showVisitStatsModal && (
        <VisitStatsModal 
          handle={safeUser.handle}
          onClose={() => setShowVisitStatsModal(false)}
        />
      )}

      {showShareModal && (
        <div className="fixed inset-0 z-[400] bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowShareModal(false)}>
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-black text-zinc-900 flex items-center gap-2"><Share2 className="text-violet-500" size={18}/> {currentLang === 'zh' ? '分享个人资料' : currentLang === 'en' ? 'Share Profile' : '프로필 공유하기'}</h3>
                        <p className="text-xs text-zinc-500 font-bold mt-1">{currentLang === 'zh' ? '根据需要筛选要展示的标签并进行分享。' : currentLang === 'en' ? 'Filter and share tabs suitable for different occasions.' : '상황에 맞게 보여줄 탭을 필터링하여 공유하세요.'}</p>
                    </div>
                    <button onClick={() => setShowShareModal(false)} className="p-2 bg-zinc-50 hover:bg-zinc-100 rounded-full text-zinc-500 transition-colors"><CloseIcon size={18}/></button>
                </div>
                
                <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
                    <button onClick={() => handleCopyLink(null)} className="w-full flex items-center justify-between p-4 rounded-2xl border border-zinc-200 hover:border-zinc-400 hover:shadow-sm bg-white transition-all text-left group">
                        <div>
                            <p className="text-sm font-black text-zinc-900 mb-0.5">🌐 {currentLang === 'zh' ? '默认资料 (全部标签)' : currentLang === 'en' ? 'Default Profile (All Tabs)' : '기본 프로필 (전체 탭)'}</p>
                            <p className="text-[10px] font-bold text-zinc-500">{currentLang === 'zh' ? '分享除私密标签外的所有标签。' : currentLang === 'en' ? 'Share all tabs except private ones.' : '비공개 처리된 탭을 제외한 모든 탭을 공유합니다.'}</p>
                        </div>
                        <Copy size={16} className="text-zinc-300 group-hover:text-zinc-600 transition-colors" />
                    </button>
                    <div className="h-px bg-zinc-100 my-2 mx-2"></div>
                    {shareablePersonas.map(persona => {
                        if (persona.id === 'all') return null;
                        const level = getPersonaLevel(persona);
                        return (
                          <button key={persona.id} onClick={() => handleCopyLink(persona.id)} className="w-full flex items-center justify-between p-4 rounded-2xl border border-zinc-100 hover:border-violet-300 hover:bg-violet-50/50 transition-all text-left group">
                              <div>
                                  <p className="text-sm font-black text-zinc-900 mb-0.5 flex items-center gap-1.5">
                                      {level === 0 && <Globe size={13} className="text-indigo-500" />}
                                      {level === 1 && <Users size={13} className="text-emerald-500" />}
                                      {level === 2 && <KeyRound size={13} className="text-amber-500" />}
                                      {level === 4 && <Lock size={13} className="text-rose-500" />}
                                      <span>{persona.name}</span>
                                  </p>
                                  <p className="text-[10px] font-bold text-zinc-500 flex items-center gap-1 flex-wrap">
                                      {level === 0 && <span className="text-indigo-600 font-black">[{currentLang === 'zh' ? '公开' : currentLang === 'en' ? 'Public' : '전체 공개'}]</span>}
                                      {level === 1 && <span className="text-emerald-600 font-black">[{currentLang === 'zh' ? '仅关注者' : currentLang === 'en' ? 'Followers' : '팔로워 공개'}]</span>}
                                      {level === 2 && <span className="text-amber-600 font-black">[{currentLang === 'zh' ? 'PIN解锁' : currentLang === 'en' ? 'PIN Protected' : 'PIN 잠금'}]</span>}
                                      {level === 4 && <span className="text-rose-500 font-black">[{currentLang === 'zh' ? '私密链接' : currentLang === 'en' ? 'Secret Link' : '시크릿 링크'}]</span>}
                                      <span>{persona.desc}</span>
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
                          <h3 className="text-base font-black text-zinc-900 flex items-center gap-2"><History className="text-indigo-500" size={18}/> {viewHistoryItem.date} {currentLang === 'zh' ? '历史记录' : currentLang === 'en' ? 'Past Record' : '과거 기록'}</h3>
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
        <div className="flex px-6 md:px-10 gap-1 md:gap-1.5 mb-[-8px] relative z-10 overflow-x-auto scrollbar-hide pt-2 items-end">
          {displayPersonas.map(p => {
            const isActive = currentPersona === p.id;
            const level = getPersonaLevel(p);
            const isUnlocked = unlockedPersonas[p.id];

            return (
              <button
                key={p.id}
                onClick={() => setCurrentPersona(p.id)}
                className={`shrink-0 px-3.5 md:px-4.5 rounded-t-[14px] text-[11px] md:text-xs font-bold transition-all duration-200 border border-b-0 flex items-center gap-1.5
                  ${isActive 
                    ? `${p.activeColor || 'bg-indigo-500 text-white border-indigo-500'} pt-2.5 pb-4 -mt-1 shadow-sm z-20 font-black`
                    : `${p.color || 'bg-zinc-50 text-zinc-500'} border-zinc-200/80 pt-2 pb-3 opacity-70 hover:opacity-100 hover:bg-white z-10 hover:pb-3.5 hover:-mt-0.5`}
                `}
              >
                {/* ⭐️ 페르소나 4단계 보안 레벨 아이콘/배지 */}
                {level === 1 && (
                  <span title={followStatus.isFollowing ? (currentLang === 'zh' ? "第1级: 已关注" : currentLang === 'en' ? "Level 1: Following" : "1단계: 팔로워 확인됨") : (currentLang === 'zh' ? "第1级: 仅限关注者" : currentLang === 'en' ? "Level 1: Followers Only" : "1단계: 팔로워 전용")}>
                    <Users size={12} className={isActive ? "text-white" : (followStatus.isFollowing ? "text-emerald-600" : "text-emerald-500")} />
                  </span>
                )}
                {level === 2 && (
                  <span title={isUnlocked ? (currentLang === 'zh' ? "第2级: 密码已解锁" : currentLang === 'en' ? "Level 2: Unlocked" : "2단계: 비밀번호 해제됨") : (currentLang === 'zh' ? "第2级: 密码保护" : currentLang === 'en' ? "Level 2: PIN Locked" : "2단계: 비밀번호 잠금")}>
                    {isUnlocked ? (
                      <ShieldCheck size={12} className={isActive ? "text-white" : "text-amber-600"} />
                    ) : (
                      <KeyRound size={12} className={isActive ? "text-white" : "text-amber-500"} />
                    )}
                  </span>
                )}
                {level === 4 && (
                  <span title={currentLang === 'zh' ? "第4级: 私密 (仅自己可见)" : currentLang === 'en' ? "Level 4: Private (Only Me)" : "4단계: 비공개 (나만 보기)"}>
                    <Lock size={12} className={isActive ? "text-white/80" : "text-rose-500"} />
                  </span>
                )}
                <span>{p.name}</span>
              </button>
            )
          })}
        </div>
      )}

      <div className="flex-1">
          <div className="bg-white rounded-3xl p-5 md:p-7 shadow-sm relative z-30 border border-zinc-200/80">
            <div className="flex justify-between items-start mb-3 md:mb-5 w-full">
              <div className="flex-1 pr-4 flex gap-2 items-center flex-wrap">
                {!isProfileEmpty && safeUser.status && (
                  <div className="inline-flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 text-zinc-800 px-3 py-1 md:py-1.5 rounded-2xl shadow-sm">
                      <Sparkles size={13} className="text-yellow-500" />
                      <span className="text-[10px] md:text-[11px] font-bold tracking-wider">{safeUser.status}</span>
                  </div>
                )}

                {/* ⭐️ 방문자 수 (Today / Total) 카운터 배지 */}
                {!isProfileEmpty && (
                  <button 
                    onClick={() => setShowVisitStatsModal(true)}
                    className="inline-flex items-center gap-1.5 bg-zinc-50 hover:bg-indigo-50/60 border border-zinc-200 hover:border-indigo-200 text-zinc-700 px-3 py-1 md:py-1.5 rounded-2xl shadow-sm transition-all cursor-pointer group"
                    title={currentLang === 'zh' ? '点击查看7天访客统计分析' : currentLang === 'en' ? 'Click to view 7-day visitor statistics' : '클릭하여 7일간 방문자 통계 분석 보기'}
                  >
                    <span className="flex items-center gap-1 text-[10px] md:text-[11px] font-black text-indigo-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      TODAY
                    </span>
                    <span className="text-[10px] md:text-[11px] font-black text-zinc-900 group-hover:text-indigo-600 transition-colors">
                      {(safeUser.todayVisits || 0).toLocaleString()}
                    </span>
                    <span className="text-zinc-300 text-[10px]">•</span>
                    <span className="text-[10px] md:text-[11px] font-bold text-zinc-400">
                      TOTAL
                    </span>
                    <span className="text-[10px] md:text-[11px] font-black text-zinc-700">
                      {(safeUser.totalVisits || 0).toLocaleString()}
                    </span>
                  </button>
                )}
                
                {isGuest && currentPersona !== 'all' && (
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 md:py-1.5 rounded-2xl shadow-sm border ${
                    getPersonaLevel(CUSTOM_PERSONAS[currentPersona]) === 1 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    getPersonaLevel(CUSTOM_PERSONAS[currentPersona]) === 2 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    getPersonaLevel(CUSTOM_PERSONAS[currentPersona]) === 4 ? 'bg-rose-50 text-rose-700 border-rose-200' :
                    'bg-violet-50 text-violet-700 border-violet-200'
                  }`}>
                      <span className="text-[10px] md:text-[11px] font-black tracking-widest uppercase flex items-center gap-1">
                          {getPersonaLevel(CUSTOM_PERSONAS[currentPersona]) === 1 && <Users size={11} />}
                          {getPersonaLevel(CUSTOM_PERSONAS[currentPersona]) === 2 && <KeyRound size={11} />}
                          {getPersonaLevel(CUSTOM_PERSONAS[currentPersona]) === 4 && <Lock size={11} />}
                          {CUSTOM_PERSONAS[currentPersona]?.name} {currentLang === 'zh' ? '视图浏览中' : currentLang === 'en' ? 'View active' : '뷰 접속중'}
                      </span>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end items-center gap-1.5 shrink-0">
                {/* ⭐️ 타 사용자 프로필 열람 시 팔로우/팔로잉 버튼 */}
                {isGuest && safeUser.handle && (
                  <button 
                    onClick={handleToggleFollow} 
                    disabled={isFollowLoading}
                    className={`h-7 md:h-8 px-3 rounded-full text-[10px] md:text-[11px] font-black transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
                      followStatus.isFollowing 
                        ? 'bg-zinc-100 text-zinc-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border border-zinc-200' 
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {followStatus.isFollowing ? <UserCheck size={13} /> : <UserPlus size={13} />}
                    {currentLang === 'zh' ? (followStatus.isFollowing ? '已关注' : '关注') : currentLang === 'en' ? (followStatus.isFollowing ? 'Following' : 'Follow') : (followStatus.isFollowing ? '팔로잉' : '팔로우')}
                  </button>
                )}

                {!isProfileEmpty && (
                  <button onClick={() => setShowShareModal(true)} className="w-7 h-7 md:w-8 md:h-8 bg-white hover:bg-zinc-50 text-zinc-600 rounded-full flex items-center justify-center transition shadow-sm border border-zinc-200" title={t('common.share', '공유')}>
                      <Share2 size={13} />
                  </button>
                )}
                {isAdmin && !isGuestMode ? (
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => setOnboardingModalOpen(true)} 
                      className="h-7 md:h-8 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-full text-[10px] md:text-[11px] font-black transition flex items-center gap-1 border border-indigo-200/80 shadow-2xs active:scale-95" 
                      title={currentLang === 'zh' ? '选择初始预设与标签配置' : currentLang === 'en' ? 'Choose persona starter preset' : '시작 페르소나 선택 및 서브 탭 프리셋 구성'}
                    >
                      <Sparkles size={11} className="text-indigo-500" />
                      <span>{currentLang === 'zh' ? '预设' : currentLang === 'en' ? 'Preset' : '프리셋'}</span>
                    </button>
                    <button onClick={() => setViewMode('edit_profile')} className="w-7 h-7 md:w-8 md:h-8 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full flex items-center justify-center transition shadow-sm" title={t('nav.edit_profile', '프로필 설정')}>
                      <Edit2 size={13} />
                    </button>
                  </div>
                ) : !isAdmin ? (
                   <button onClick={() => setLoginModalOpen(true)} className="px-3 h-7 md:h-8 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full text-[10px] md:text-[11px] font-bold transition flex items-center gap-1.5 shadow-sm">
                    <Rocket size={11} /> {currentLang === 'zh' ? '立即开始' : currentLang === 'en' ? 'Get Started' : '시작하기'}
                  </button>
                ) : null}
              </div>
            </div>

            {isProfileEmpty && !isAdmin ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-zinc-50 text-zinc-300 rounded-full flex items-center justify-center mb-4 shadow-inner"><User size={32}/></div>
                <h3 className="text-lg md:text-xl font-black text-zinc-900 mb-2">{currentLang === 'zh' ? '暂未设置个人资料' : currentLang === 'en' ? 'Profile not configured' : '설정된 프로필이 없습니다'}</h3>
                <p className="text-xs md:text-sm font-medium text-zinc-500">{t('profile.guest_banner_title', '가입하고 나만의 명함을 만들어보세요.')}</p>
              </div>
            ) : (
              <div className="flex flex-col w-full">
                
                <div className="flex flex-col md:flex-row gap-5 md:gap-8 items-stretch w-full">
                  
                  {/* 왼쪽: 아바타 및 기본 정보 */}
                  <div className="flex-1 md:flex-none md:w-[45%] flex flex-row gap-4 md:gap-5 items-center md:items-start">
                    <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-48 md:h-48 shrink-0 bg-zinc-50 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border border-zinc-200 shadow-inner">
                      {safeUser.profileImageUrl ? (
                          <img src={safeUser.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                          <div className="w-full h-full flex items-center justify-center text-5xl md:text-6xl font-black text-zinc-300">
                            {safeUser.name ? safeUser.name.charAt(0) : '?'}
                          </div>
                      )}
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center min-w-0 md:pt-1">
                      <h2 className="text-2xl md:text-3xl font-black text-zinc-900 mb-1 truncate">{safeUser.name || t('profile.no_name', '이름 없음')}</h2>
                      <p className="text-[11px] md:text-sm font-bold text-violet-600 bg-violet-50 border border-violet-100 px-2 py-0.5 md:px-2.5 rounded-lg inline-block w-max mb-3 shadow-sm truncate">@{safeUser.handle || 'handle'}</p>
                      
                      <div className="space-y-1 md:space-y-1.5">
                        <div className="flex items-center gap-2 text-[11px] md:text-[13px] font-medium text-zinc-600 truncate">
                          <Briefcase size={12} className="text-zinc-400 shrink-0 md:w-3.5 md:h-3.5"/> {safeUser.role || t('profile.no_role', '소속/직무 미입력')}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] md:text-[13px] font-medium text-zinc-600 truncate">
                          <GraduationCap size={12} className="text-zinc-400 shrink-0 md:w-3.5 md:h-3.5"/> {safeUser.major || t('profile.no_major', '전공 미입력')}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] md:text-[13px] font-medium text-zinc-600 truncate">
                          <MapPin size={12} className="text-zinc-400 shrink-0 md:w-3.5 md:h-3.5"/> {safeUser.location || t('profile.no_location', '지역 미입력')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="hidden md:block w-px bg-zinc-100 my-1 mx-2"></div>

                  {/* ⭐️ 오른쪽: 자기소개 (더보기 기능 적용) */}
                  <div className="flex-1 flex flex-col justify-center md:pl-2 relative">
                    <Quote size={24} className="text-violet-300 mb-2 md:mb-3 shrink-0"/>
                    <div className="relative">
                      <p className="text-[13px] md:text-[14px] text-zinc-800 font-bold leading-relaxed whitespace-pre-line break-keep">
                        {displayBio || t('profile.default_bio', '나를 표현하는 한 줄 소개가 들어갑니다.')}
                      </p>
                      {isLongBio && (
                        <button
                          onClick={() => setIsBioExpanded(!isBioExpanded)}
                          className="mt-3 text-[11px] font-black text-indigo-500 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-center w-max shadow-sm border border-indigo-100"
                        >
                          {isBioExpanded ? t('profile.collapse_bio', '접기 ▲') : t('profile.expand_bio', '더보기 ▼')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {((safeUser.tags && safeUser.tags.length > 0) || (safeUser.links && safeUser.links.length > 0)) && (
                  <>
                    <div className="w-full h-px bg-zinc-100 my-5 md:my-6"></div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      <div className="flex flex-wrap gap-2">
                          {(safeUser.tags || []).map(tag => (
                            <span key={tag} className="px-3 py-1.5 bg-white border border-zinc-200 text-zinc-600 text-[10px] md:text-xs font-bold rounded-lg cursor-default shadow-sm hover:border-zinc-300 transition-colors">#{tag}</span>
                          ))}
                      </div>

                      <div className="flex flex-wrap gap-2.5">
                          {(safeUser.links || []).map((link, idx) => (
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
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {!isProfileEmpty && (
            <>
              {/* ⭐️ 만약 현재 선택된 페르소나가 팔로워 전용인데 팔로우하지 않은 경우 */}
              {isGuest && currentPersona !== 'all' && getPersonaLevel(activePersonaObj) === 1 && !followStatus.isFollowing ? (
                <div className="mt-8 p-8 sm:p-12 bg-white border border-emerald-100 rounded-3xl text-center shadow-xs flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4 shadow-inner">
                    <Users size={32} />
                  </div>
                  <span className="text-[11px] font-black tracking-wider uppercase px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg mb-2">
                    {t('profile.level1_title', 'Level 1 · 팔로워 전용 페르소나')}
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-zinc-900 mb-1.5">
                    [{activePersonaObj.name}] {currentLang === 'zh' ? '角色仅限关注者查看' : currentLang === 'en' ? 'Persona is for followers only' : '페르소나는 팔로워에게만 공개되어 있습니다'}
                  </h3>
                  <p className="text-xs sm:text-sm font-medium text-zinc-500 max-w-md mb-6 leading-relaxed">
                    {t('profile.level1_desc', '이 페르소나는 호스트를 팔로우한 사용자에게만 공개됩니다.')}
                  </p>
                  <button
                    onClick={handleToggleFollow}
                    disabled={isFollowLoading}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <Users size={16} />
                    <span>{t('profile.follow_btn', '✦ 팔로우하고 바로 확인하기')}</span>
                  </button>
                </div>
              ) : isGuest && currentPersona !== 'all' && getPersonaLevel(activePersonaObj) === 2 && !unlockedPersonas[currentPersona] ? (
                /* ⭐️ 만약 현재 선택된 페르소나가 비밀번호 잠금인데 아직 해제되지 않은 경우 */
                <div className="mt-8 p-8 sm:p-12 bg-white border border-amber-100 rounded-3xl text-center shadow-xs flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-4 shadow-inner">
                    <KeyRound size={32} />
                  </div>
                  <span className="text-[11px] font-black tracking-wider uppercase px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg mb-2">
                    {t('profile.level2_title', 'Level 2 · 비밀번호 보호 페르소나')}
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-zinc-900 mb-1.5">
                    [{activePersonaObj.name}] {currentLang === 'zh' ? '角色需要访问密码' : currentLang === 'en' ? 'Persona requires PIN passcode' : '페르소나는 열람 비밀번호가 필요합니다'}
                  </h3>
                  <p className="text-xs sm:text-sm font-medium text-zinc-500 max-w-md mb-6 leading-relaxed">
                    {t('profile.level2_desc', '공유받은 PIN 또는 비밀번호를 입력하시면 이 페르소나의 구성 탭과 상세 정보를 즉시 확인하실 수 있습니다.')}
                  </p>
                  <div className="flex items-center gap-2 max-w-xs w-full">
                    <input
                      type="password"
                      value={personaPinInputs[currentPersona] || ''}
                      onChange={(e) => setPersonaPinInputs(prev => ({ ...prev, [currentPersona]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleUnlockPersona(currentPersona); }}
                      placeholder={t('profile.pin_placeholder', '비밀번호(PIN) 입력')}
                      className="flex-1 bg-zinc-50 border border-zinc-200 focus:border-amber-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-800 outline-none transition-all shadow-inner"
                      autoFocus
                    />
                    <button
                      onClick={() => handleUnlockPersona(currentPersona)}
                      className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all active:scale-95 shrink-0 cursor-pointer"
                    >
                      {t('profile.unlock_btn', '잠금 해제')}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mt-8 md:mt-10">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-base md:text-lg font-black text-zinc-900 tracking-tight">{t('profile.data_explorer', '데이터 탐색')}</h3>
                      <ChevronRight size={18} className="text-zinc-400 md:hidden"/>
                    </div>
                    
                    <div className="flex md:flex-wrap md:justify-start gap-3 md:gap-4 overflow-x-auto md:overflow-visible scrollbar-hide pt-2 pb-6 -mx-4 px-4 md:mx-0 md:px-0">
                      {availableTabs.map(tab => {
                          const isActive = activeTab === tab.id;
                          const level = getTabLevel(tab.id);
                          const isUnlocked = unlockedTabs[tab.id];
                          
                          return (
                            <button 
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id)}
                              className={`flex flex-col items-center gap-1.5 md:gap-2 shrink-0 group outline-none relative`}
                            >
                              <div className={`w-16 h-16 md:w-[76px] md:h-[76px] rounded-2xl md:rounded-[1.5rem] flex items-center justify-center relative transition-all duration-300 border ${isActive ? `${tab.color} border-current shadow-md scale-105` : 'bg-white border-zinc-200 text-zinc-400 shadow-sm group-hover:scale-105 group-hover:border-zinc-300'}`}>
                                {React.cloneElement(tab.icon, { className: 'w-6 h-6 md:w-7 md:h-7 transition-colors' })}

                                {/* ⭐️ 서브 탭 4단계 보안 레벨 뱃지 */}
                                {level === 1 && (
                                  <span 
                                    className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-xs border ${
                                      followStatus.isFollowing ? 'bg-emerald-500 text-white border-white' : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                    }`} 
                                    title={followStatus.isFollowing ? (currentLang === 'zh' ? "第1级: 已关注" : currentLang === 'en' ? "Level 1: Following" : "1단계: 팔로워 확인됨") : (currentLang === 'zh' ? "第1级: 仅限关注者" : currentLang === 'en' ? "Level 1: Followers Only" : "1단계: 팔로워 전용")}
                                  >
                                    <Users size={11} />
                                  </span>
                                )}
                                {level === 2 && (
                                  <span 
                                    className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-xs border ${
                                      isUnlocked ? 'bg-indigo-600 text-white border-white' : 'bg-amber-100 text-amber-700 border-amber-200'
                                    }`} 
                                    title={isUnlocked ? (currentLang === 'zh' ? "第2级: 密码已解锁" : currentLang === 'en' ? "Level 2: Unlocked" : "2단계: 비밀번호 해제됨") : (currentLang === 'zh' ? "第2级: 密码保护" : currentLang === 'en' ? "Level 2: PIN Locked" : "2단계: 비밀번호 잠금")}
                                  >
                                    {isUnlocked ? <ShieldCheck size={11} /> : <KeyRound size={11} />}
                                  </span>
                                )}
                                {level === 4 && (
                                  <span 
                                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center text-[10px] shadow-xs" 
                                    title={currentLang === 'zh' ? "第4级: 私密 (仅自己可见)" : currentLang === 'en' ? "Level 4: Private (Only Me)" : "4단계: 비공개 (나만 보기)"}
                                  >
                                    <Lock size={11} />
                                  </span>
                                )}
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
                          <h3 className="text-base md:text-lg font-black text-zinc-800">
                            {currentLang === 'zh' ? '暂无可访问的数据' : currentLang === 'en' ? 'No accessible data' : '접근할 수 있는 데이터가 없습니다'}
                          </h3>
                          <p className="text-xs md:text-sm font-medium text-zinc-500 mt-2">
                            {currentLang === 'zh' ? '此项目已被设置为私密或由角色设置隐藏。' : currentLang === 'en' ? 'This item is either private or hidden by persona settings.' : '비공개 처리되었거나 페르소나 설정에 의해 숨겨진 항목입니다.'}
                          </p>
                      </div>
                  ) : (
                      <div className="mt-2 pb-10">
                          {/* ⭐️ 1단계: 팔로워 전용 서브 탭 잠금 화면 (게스트이면서 미팔로우 상태) */}
                          {isGuest && getTabLevel(activeTab) === 1 && !followStatus.isFollowing ? (
                            <div className="p-8 sm:p-12 bg-white border border-emerald-100 rounded-3xl text-center shadow-xs flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
                              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4 shadow-inner">
                                <Users size={32} />
                              </div>
                              <span className="text-[11px] font-black tracking-wider uppercase px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg mb-2">
                                {currentLang === 'zh' ? 'Level 1 · 关注者专属子标签' : currentLang === 'en' ? 'Level 1 · Followers Only Sub-tab' : 'Level 1 · 팔로워 전용 서브 탭'}
                              </span>
                              <h3 className="text-lg sm:text-xl font-black text-zinc-900 mb-1.5">
                                [{allTabsMap[activeTab]?.label || activeTab}] {currentLang === 'zh' ? '标签仅限关注者查看' : currentLang === 'en' ? 'Tab is for followers only' : '탭은 팔로워에게만 공개되어 있습니다'}
                              </h3>
                              <p className="text-xs sm:text-sm font-medium text-zinc-500 max-w-md mb-6 leading-relaxed">
                                {currentLang === 'zh' ? `关注 ${safeUser.name || '作者'} 即可自由浏览此标签中的所有内容。` : currentLang === 'en' ? `Follow ${safeUser.name || 'the host'} to view all data and records in this sub-tab.` : `${safeUser.name || '작성자'} 님을 팔로우하시면 이 서브 탭에 담긴 소중한 데이터와 기록을 자유롭게 열람하실 수 있습니다.`}
                              </p>
                              <button
                                onClick={handleToggleFollow}
                                disabled={isFollowLoading}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                              >
                                <Users size={16} />
                                <span>{t('profile.follow_btn', '✦ 팔로우하고 바로 확인하기')}</span>
                              </button>
                            </div>
                          ) : isGuest && getTabLevel(activeTab) === 2 && !unlockedTabs[activeTab] ? (
                            /* ⭐️ 2단계: 비밀번호 잠금 서브 탭 잠금 화면 (게스트이면서 미잠금해제 상태) */
                            <div className="p-8 sm:p-12 bg-white border border-amber-100 rounded-3xl text-center shadow-xs flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
                              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-4 shadow-inner">
                                <KeyRound size={32} />
                              </div>
                              <span className="text-[11px] font-black tracking-wider uppercase px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg mb-2">
                                {t('profile.level2_tab_title', 'Level 2 · 비밀번호 보호 서브 탭')}
                              </span>
                              <h3 className="text-lg sm:text-xl font-black text-zinc-900 mb-1.5">
                                [{allTabsMap[activeTab]?.label || activeTab}] {currentLang === 'zh' ? '标签需要访问密码' : currentLang === 'en' ? 'Tab requires PIN passcode' : '탭은 열람 비밀번호가 필요합니다'}
                              </h3>
                              <p className="text-xs sm:text-sm font-medium text-zinc-500 max-w-md mb-6 leading-relaxed">
                                {t('profile.level2_tab_desc', '공유받은 PIN 또는 비밀번호를 입력하시면 이 서브 탭의 상세 내용을 즉시 확인하실 수 있습니다.')}
                              </p>
                              <div className="flex items-center gap-2 max-w-xs w-full">
                                <input
                                  type="password"
                                  value={pinInputs[activeTab] || ''}
                                  onChange={(e) => setPinInputs(prev => ({ ...prev, [activeTab]: e.target.value }))}
                                  onKeyDown={(e) => { if (e.key === 'Enter') handleUnlockTab(activeTab); }}
                                  placeholder={t('profile.pin_placeholder', '비밀번호(PIN) 입력')}
                                  className="flex-1 bg-zinc-50 border border-zinc-200 focus:border-amber-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-800 outline-none transition-all shadow-inner"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleUnlockTab(activeTab)}
                                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all active:scale-95 shrink-0 cursor-pointer"
                                >
                                  {t('profile.unlock_btn', '잠금 해제')}
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* ⭐️ 정상 렌더링 */
                            <>
                              {activeTab === 'developer' && availableTabs.some(t => t.id === 'developer') && <DeveloperTab data={safeUser.developer} />}
                              {activeTab === 'developer2' && availableTabs.some(t => t.id === 'developer2') && <Developer2Tab user={safeUser} />}
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
                            </>
                          )}
                      </div>
                  )}
                </>
              )}
            </>
          )}
      </div>
    </div>
  );
};

export default ProfileView;