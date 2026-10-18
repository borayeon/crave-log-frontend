import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  User, History, Network, Sparkles, MapPin, Briefcase, 
  Lock, LogOut, ChevronRight, Search, Heart, Share2, 
  Calendar, Tag, ArrowRight, Bell, Folder, FolderOpen, 
  Hash, Plus, Trash2, Edit2, ChevronDown, X as CloseIcon,
  Menu, GraduationCap, Target, Code, HeartHandshake,
  MessageSquare, Eye, EyeOff, Link, Save, X, AlertTriangle,
  Rocket
} from 'lucide-react';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

import { translate, detectInitialLang, SUPPORTED_LANGS } from '../utils/i18n';

const MAIN_HOST_HANDLE = 'taeya00';

const INITIAL_USER_DATA = {
  name: "손님",
  handle: "guest",
  role: "역할을 입력해주세요",
  major: "전공을 입력해주세요",
  location: "위치를 설정해주세요",
  bio: "나를 표현하는 짧은 소개를 작성해보세요 🚀",
  status: "환영합니다!",
  tags: [],
  goals: [],
  idol: {
    nickname: "",
    birthday: "",
    age: "",
    specialty: "",
    hobbies: "",
    favorites: {
      colors: [],
      foods: [],
      games: [],
      music: []
    },
    qna: []
  },
  career: {
    targetJob: "",
    techStack: [],
    strengths: [],
    interests: [],
    careerGoals: {
      short: "",
      mid: "",
      long: ""
    }
  },
  developer: {
    about: "",
    techStack: {
      backend: "",
      db: "",
      frontend: "",
      tools: ""
    },
    projects: [],
    learning: [],
    motto: ""
  },
  privacy: {
    developer: true,
    career: true,
    idol: true
  }
};

const AppContext = createContext();
export const useAppStore = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  // ⭐️ URL 파라미터(?view=...) 및 게스트/로그인 상태에 따른 초기 뷰 결정
  const getInitialViewMode = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const v = params.get('view');
      if (v && ['landing', 'profile', 'archive', 'timeline', 'access_control', 'search', 'account_settings'].includes(v)) {
        return v;
      }
      // 공유 핸들 파라미터(?u=...)가 명시된 경우 프로필 뷰로 직행
      const sharedHandle = params.get('u');
      if (sharedHandle) {
        return 'profile';
      }
      // 로그인된 회원일 경우 본인 프로필 뷰로 직행
      const token = localStorage.getItem('accessToken');
      if (token) {
        return 'profile';
      }
      // 비로그인 일반 방문자는 랜딩 페이지를 기본 제공
      return 'landing';
    }
    return 'landing';
  };

  const [viewMode, _setViewMode] = useState(getInitialViewMode);
  const [visitedHandle, setVisitedHandle] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);

  const [toastMessage, setToastMessage] = useState('');
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [onboardingModalOpen, setOnboardingModalOpen] = useState(false);
  const [addRecordModalOpen, setAddRecordModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [records, setRecords] = useState([]);
  const [tagTree, setTagTree] = useState([]);

  // 🌐 i18n 다국어 지원 상태 (ko: 한국어, en: English, zh: 简体中文)
  const [currentLang, setCurrentLang] = useState(detectInitialLang);

  const setLanguage = useCallback((lang) => {
    setCurrentLang(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cravelog_lang', lang);
      document.documentElement.lang = lang;
    }
  }, []);

  const t = useCallback((key, fallback) => {
    return translate(key, currentLang, fallback);
  }, [currentLang]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = currentLang;
    }
  }, [currentLang]);

  // 초기에는 "손님 프로필"을 실제 데이터로 취급하지 않도록 한다.
  const [user, setUser] = useState(null);
  
  // ⭐️ 1. 진짜 내 계정 데이터를 고정하기 위한 새로운 상태 추가
  const [currentUser, setCurrentUser] = useState(null); 

  // ⭐️ 통합 네비게이션 함수 (화면 전환 시 URL 찌꺼기 완벽 청소 및 상태 동기화)
  const setViewMode = useCallback((newMode, options = {}) => {
    _setViewMode(newMode);

    if (newMode === 'landing') {
      // ⭐️ 홈으로 갈 때는 방문 중이던 사용자 상태와 주소창의 ?u=, ?p= 파라미터를 완전히 제거
      setVisitedHandle(null);
      const token = localStorage.getItem('accessToken');
      setIsGuestMode(!token);
      if (!token) {
        setUser(null);
        setRecords([]);
        setTagTree([]);
      }
      window.history.pushState({}, '', window.location.pathname);
    } else if (newMode === 'profile') {
      if (!options.keepHandle && !options.handle && !visitedHandle) {
        window.history.pushState({}, '', window.location.pathname);
      }
    } else {
      if (!visitedHandle && window.location.search.includes('u=')) {
        window.history.pushState({}, '', window.location.pathname);
      }
    }
  }, [visitedHandle]);

  const goToLanding = useCallback(() => {
    setViewMode('landing');
  }, [setViewMode]);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  }, []);

  // -------------------------------------------------------
  // API FETCH
  // -------------------------------------------------------
  const apiFetch = useCallback(
    async (endpoint, options = {}, retries = 3, delay = 1500) => {
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      const token = localStorage.getItem('accessToken');

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // ⭐️ POST, PUT, DELETE, PATCH 등 데이터 변경 요청은 재시도하지 않고 1회만 실행 (중복 실행 방지)
      const method = (options.method || 'GET').toUpperCase();
      const actualRetries = options.retries !== undefined 
        ? options.retries 
        : (method === 'GET' ? retries : 1);

      for (let i = 0; i < actualRetries; i++) {
        try {
          const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
          });

          // 정상 응답이거나 클라이언트 에러(4xx)인 경우 즉시 반환 (재시도 불필요)
          if (
            response.ok ||
            response.status < 500 ||
            actualRetries === 1 ||
            i === actualRetries - 1
          ) {
            return response;
          }
        } catch (error) {
          console.error(
            `API 요청 실패 (${i + 1}/${actualRetries}):`,
            endpoint,
            error
          );

          if (i === actualRetries - 1) {
            throw error;
          }
        }

        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      return null;
    },
    []
  );

  // -------------------------------------------------------
  // PROFILE DATA LOAD
  // -------------------------------------------------------
  const fetchAllData = useCallback(
    async (isSilent = false, handleOverride = null) => {
      const token = localStorage.getItem('accessToken');

      const currentHandle =
        handleOverride !== null ? handleOverride : visitedHandle;

      let targetUrlBase;
      let requestMode;

      // --------------------------------------------
      // 1. 다른 사람 프로필
      // --------------------------------------------
      if (currentHandle && currentHandle !== '') {
        targetUrlBase = `/users/${currentHandle}`;
        requestMode = 'guest';

        setIsGuestMode(true);
      }

      // --------------------------------------------
      // 2. 로그인 사용자
      // --------------------------------------------
      else if (token) {
        targetUrlBase = '/me';
        requestMode = 'me';
      }

      // --------------------------------------------
      // 3. 비로그인 사용자 (방문 대상 없음)
      // --------------------------------------------
      else {
        setUser(null);
        setRecords([]);
        setTagTree([]);
        setIsGuestMode(true);
        setIsLoading(false);
        return;
      }

      try {
        if (!isSilent) {
          setIsLoading(true);
        }

        const fetchSafe = async (url) => {
          try {
            return await apiFetch(url);
          } catch (error) {
            console.error('Network Fetch Error:', url, error);
            return null;
          }
        };

        // ⭐️ 주소창에서 페르소나 파라미터(?p=) 추출 
        const searchParams = new URLSearchParams(window.location.search);
        const personaId = searchParams.get('p');

        // ⭐️ 백엔드로 프로필을 요청할 때 페르소나 값이 있으면 붙여서 보냄
        const profileEndpoint = personaId 
            ? `${targetUrlBase}/profile?p=${personaId}`
            : `${targetUrlBase}/profile`;

        const [profileRes, treeRes, recordsRes] = await Promise.all([
          fetchSafe(profileEndpoint), // ⭐️ 수정된 프로필 엔드포인트 적용
          fetchSafe(`${targetUrlBase}/categories`),
          fetchSafe(`${targetUrlBase}/records`)
        ]);

        // ==================================================
        // 로그인 상태에서 인증 만료
        // ==================================================
        if (
          requestMode === 'me' &&
          profileRes &&
          (profileRes.status === 401 || profileRes.status === 403)
        ) {
          console.warn('accessToken이 만료되었습니다.');

          // 토큰 제거
          localStorage.removeItem('accessToken');

          setIsAdmin(false);
          setIsGuestMode(true);
          setVisitedHandle(null);
          setCurrentUser(null); // ⭐️ 2. 인증 만료 시 내 정보도 비움

          // 중요:
          // 손님 데이터로 바꾸지 않고 공개 프로필을 다시 가져온다.
          await fetchAllData(false, MAIN_HOST_HANDLE);

          return;
        }

        // ==================================================
        // 프로필 정상 조회
        // ==================================================
        if (profileRes?.ok) {
          const profileData = await profileRes.json();
          console.log('프로필 조회 성공:', profileData);
          setUser(profileData);

          const hasToken = !!localStorage.getItem('accessToken');
          setIsAdmin(hasToken); 

          // ⭐️ 3. 현재 조회 모드가 '내 프로필'일 때만 currentUser 상태를 업데이트
          if (requestMode === 'me') {
            setIsGuestMode(false); 
            setCurrentUser(profileData); 
          } else {
            setIsGuestMode(true);  
          }
        }

        // ==================================================
        // 프로필 조회 실패
        // ==================================================
        else {
          console.error(
            '프로필 조회 실패:',
            profileRes?.status
          );
        }

        // ==================================================
        // 카테고리
        // ==================================================
        if (treeRes?.ok) {
          setTagTree(await treeRes.json());
        }

        if (recordsRes?.ok) {
          setRecords(await recordsRes.json());
        }

      } catch (error) {
        console.error('데이터 로드 중 에러:', error);
      } finally {
        if (!isSilent) {
          setIsLoading(false);
        }
      }
    },
    [apiFetch, visitedHandle]
  );

  // -------------------------------------------------------
  // 다른 사용자 프로필 방문
  // -------------------------------------------------------
  const visitUserProfile = useCallback(
    async (targetHandle) => {
      // ⭐️ 관리자(Admin) 계정 프로필 접근 원천 방어
      if (targetHandle === 'admin_craver' || targetHandle?.toLowerCase().includes('admin')) {
        showToast('존재하지 않는 사용자입니다.');
        return;
      }

      setVisitedHandle(targetHandle);
      setIsGuestMode(true);
      _setViewMode('profile');

      // ⭐️ URL에 ?u= 파라미터 안전하게 반영
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set('u', targetHandle);
      const newUrl = `${window.location.pathname}?${searchParams.toString()}`;

      window.history.pushState({}, '', newUrl);

      await fetchAllData(false, targetHandle);
    },
    [fetchAllData, showToast]
  );

  // -------------------------------------------------------
  // 내 프로필
  // -------------------------------------------------------
  const resetToMyProfile = useCallback(
    async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoginModalOpen(true);
        showToast('로그인이 필요한 서비스입니다. 🔒');
        return;
      }

      setVisitedHandle(null);
      setIsGuestMode(false);
      _setViewMode('profile');

      // ⭐️ URL에서 ?u= 및 ?p= 등 쿼리스트링 깨끗이 제거
      window.history.pushState(
        {},
        document.title,
        window.location.pathname
      );

      await fetchAllData(false, '');
    },
    [fetchAllData, showToast]
  );

  // -------------------------------------------------------
  // 검색
  // -------------------------------------------------------
  const searchUsers = useCallback(
    async (keyword) => {
      try {
        setIsLoading(true);

        const res = await apiFetch(
          `/users/search?keyword=${encodeURIComponent(
            keyword.trim()
          )}`
        );

        if (res?.ok) {
          const data = await res.json();

          // ⭐️ 관리자 계정 프론트엔드 방어 필터링 (ROLE_ADMIN 및 admin_craver 원천 제외)
          const filteredResults = Array.isArray(data)
            ? data.filter(u => u.handle !== 'admin_craver' && !u.handle?.toLowerCase().includes('admin'))
            : [];

          setSearchResults(filteredResults);
          setSearchQuery(keyword.trim());
          setViewMode('search');
        } else {
          setSearchResults([]);
          showToast('검색에 실패했습니다.');
        }
      } catch (error) {
        console.error('검색 에러:', error);

        setSearchResults([]);
        showToast('서버 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    },
    [apiFetch, showToast]
  );

  // -------------------------------------------------------
  // 로그아웃
  // -------------------------------------------------------
  const handleLogout = useCallback(async () => {
    localStorage.removeItem('accessToken');

    setIsAdmin(false);
    setVisitedHandle(null);
    setIsGuestMode(true);
    _setViewMode('landing');
    
    // ⭐️ 로그아웃 시 내 고정 정보 및 프로필 상태 비움
    setCurrentUser(null);
    setUser(null);
    setRecords([]);
    setTagTree([]);

    window.history.pushState(
      {},
      document.title,
      window.location.pathname
    );

    showToast("로그아웃 되었습니다. 👋");
  }, [showToast]);

  // -------------------------------------------------------
  // 최초 진입
  // -------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    const initializeApp = async () => {
      const params = new URLSearchParams(
        window.location.search
      );

      const token = params.get('token');
      const error = params.get('error');
      const sharedHandle = params.get('u');

      // --------------------------------------------
      // OAuth 로그인 성공
      // --------------------------------------------
      if (token) {
        localStorage.setItem('accessToken', token);

        setIsAdmin(true);
        setIsGuestMode(false);
        setVisitedHandle(null);

        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );

        showToast('로그인 성공! 환영합니다. 🎉');

        if (!cancelled) {
          await fetchAllData(false, '');
        }

        return;
      }

      // --------------------------------------------
      // OAuth 로그인 실패
      // --------------------------------------------
      if (error) {
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );

        showToast(
          '로그인 실패: ' +
            decodeURIComponent(error)
        );

        if (!cancelled) {
          setIsAdmin(false);
          setIsGuestMode(true);
          setUser(null);
          setRecords([]);
          setTagTree([]);
          setIsLoading(false);
        }

        return;
      }

      // --------------------------------------------
      // 공유 프로필 접속 (파라미터 증발 버그 원인이었던 부분)
      // --------------------------------------------
      if (sharedHandle) {
        if (!cancelled) {
          await visitUserProfile(sharedHandle);
        }
        return;
      }

      // --------------------------------------------
      // 일반 접근
      // --------------------------------------------
      const savedToken = localStorage.getItem('accessToken');

      if (savedToken) {
        setIsAdmin(true);
        setIsGuestMode(false);

        if (!cancelled) {
          await fetchAllData(false, '');
        }
      } else {
        setIsAdmin(false);
        setIsGuestMode(true);
        setUser(null);
        setRecords([]);
        setTagTree([]);
        setIsLoading(false);
      }
    };

    initializeApp();

    return () => {
      cancelled = true;
    };
  }, [fetchAllData, visitUserProfile, showToast]);

  // ⭐️ 브라우저 뒤로가기 / 앞으로가기(popstate) 실시간 URL 및 뷰 상태 동기화
  useEffect(() => {
    const handlePopState = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const u = searchParams.get('u');
      const v = searchParams.get('view');
      const token = localStorage.getItem('accessToken');

      if (u) {
        setVisitedHandle(u);
        setIsGuestMode(true);
        _setViewMode(v || 'profile');
        await fetchAllData(true, u);
      } else {
        setVisitedHandle(null);
        if (token) {
          setIsAdmin(true);
          setIsGuestMode(false);
          _setViewMode(v || 'profile');
          await fetchAllData(true, '');
        } else {
          setIsAdmin(false);
          setIsGuestMode(true);
          setUser(null);
          setRecords([]);
          setTagTree([]);
          _setViewMode(v && v !== 'profile' ? v : 'landing');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [fetchAllData]);

  return (
    <AppContext.Provider
      value={{
        viewMode,
        setViewMode,
        goToLanding,

        toastMessage,
        showToast,

        searchQuery,
        setSearchQuery,

        searchResults,
        setSearchResults,
        searchUsers,

        records,
        setRecords,

        tagTree,
        setTagTree,

        user,
        setUser,
        
        // ⭐️ 5. Provider Value로 하위 컴포넌트에 공급
        currentUser,
        setCurrentUser,

        isAdmin,
        setIsAdmin,

        isGuestMode,
        setIsGuestMode,

        visitedHandle,
        setVisitedHandle,

        visitUserProfile,
        resetToMyProfile,

        loginModalOpen,
        setLoginModalOpen,

        onboardingModalOpen,
        setOnboardingModalOpen,

        addRecordModalOpen,
        setAddRecordModalOpen,

        isSidebarOpen,
        setIsSidebarOpen,

        isLoading,
        setIsLoading,

        // 🌐 다국어 지원 (i18n)
        currentLang,
        setLanguage,
        t,
        SUPPORTED_LANGS,

        apiFetch,
        fetchAllData,
        handleLogout
      }}
    >
      {children}
    </AppContext.Provider>
  );
};