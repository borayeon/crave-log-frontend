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
  const [viewMode, setViewMode] = useState('profile');
  const [toastMessage, setToastMessage] = useState('');
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [addRecordModalOpen, setAddRecordModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [records, setRecords] = useState([]);
  const [tagTree, setTagTree] = useState([]);

  // 초기에는 "손님 프로필"을 실제 데이터로 취급하지 않도록 한다.
  const [user, setUser] = useState(null);

  const [isAdmin, setIsAdmin] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [visitedHandle, setVisitedHandle] = useState(null);

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

      for (let i = 0; i < retries; i++) {
        try {
          const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
          });

          // 정상 응답 또는 인증 실패 응답은
          // 호출부에서 직접 처리할 수 있도록 그대로 반환
          if (
            response.ok ||
            response.status === 401 ||
            response.status === 403
          ) {
            return response;
          }

          if (i === retries - 1) {
            return response;
          }
        } catch (error) {
          console.error(
            `API 요청 실패 (${i + 1}/${retries}):`,
            endpoint,
            error
          );

          if (i === retries - 1) {
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
      // 3. 비로그인 사용자
      // --------------------------------------------
      else {
        targetUrlBase = `/users/${MAIN_HOST_HANDLE}`;
        requestMode = 'guest';

        setIsGuestMode(true);
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

        const [profileRes, treeRes, recordsRes] = await Promise.all([
          fetchSafe(`${targetUrlBase}/profile`),
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

          if (requestMode === 'me') {
            setIsAdmin(true);
            setIsGuestMode(false);
          } else {
            setIsAdmin(false);
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

          /*
           * 중요:
           *
           * 기존 코드:
           * setUser(INITIAL_USER_DATA);
           *
           * 이렇게 하면 API가 잠깐 실패했을 때
           * 정상 프로필이 "손님"으로 덮어써진다.
           *
           * 따라서 여기서는 기존 user 상태를 유지한다.
           */
        }

        // ==================================================
        // 카테고리
        // ==================================================
        if (treeRes?.ok) {
          setTagTree(await treeRes.json());
        }

        // 실패하더라도 기존 데이터 유지
        // 최초 접근 시에만 빈 배열로 유지
        if (recordsRes?.ok) {
          setRecords(await recordsRes.json());
        }

      } catch (error) {
        console.error('데이터 로드 중 에러:', error);

        /*
         * 절대 여기서
         *
         * setUser(INITIAL_USER_DATA)
         *
         * 하지 않는다.
         *
         * 네트워크 에러 때문에 정상 프로필을
         * "설정된 프로필 없음"으로 바꾸면 안 된다.
         */
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
      setVisitedHandle(targetHandle);
      setIsGuestMode(true);
      setViewMode('profile');

      const newUrl =
        `${window.location.pathname}?u=${targetHandle}`;

      window.history.pushState({}, '', newUrl);

      await fetchAllData(false, targetHandle);
    },
    [fetchAllData]
  );

  // -------------------------------------------------------
  // 내 프로필
  // -------------------------------------------------------
  const resetToMyProfile = useCallback(
    async () => {
      setVisitedHandle(null);
      setIsGuestMode(false);
      setViewMode('profile');

      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );

      await fetchAllData(false, '');
    },
    [fetchAllData]
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

          setSearchResults(data);
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
    setViewMode('profile');

    window.history.replaceState(
      {},
      document.title,
      window.location.pathname
    );

    // 로그아웃 후 반드시 공개 프로필 조회
    await fetchAllData(false, MAIN_HOST_HANDLE);
  }, [fetchAllData]);

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
          await fetchAllData(false, MAIN_HOST_HANDLE);
        }

        return;
      }

      // --------------------------------------------
      // 공유 프로필
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
      const savedToken =
        localStorage.getItem('accessToken');

      if (savedToken) {
        // 토큰이 있으면 우선 /me 시도
        setIsAdmin(true);
        setIsGuestMode(false);

        if (!cancelled) {
          await fetchAllData(false, '');
        }
      } else {
        // 토큰이 없다면 무조건 공개 프로필
        setIsAdmin(false);
        setIsGuestMode(true);

        if (!cancelled) {
          await fetchAllData(
            false,
            MAIN_HOST_HANDLE
          );
        }
      }
    };

    initializeApp();

    return () => {
      cancelled = true;
    };
  }, [fetchAllData, visitUserProfile, showToast]);

  return (
    <AppContext.Provider
      value={{
        viewMode,
        setViewMode,

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

        addRecordModalOpen,
        setAddRecordModalOpen,

        isSidebarOpen,
        setIsSidebarOpen,

        isLoading,
        setIsLoading,

        apiFetch,
        fetchAllData,
        handleLogout
      }}
    >
      {children}
    </AppContext.Provider>
  );
};