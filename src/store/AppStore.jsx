import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const INITIAL_USER_DATA = {
  name: "손님", handle: "guest", role: "역할을 입력해주세요", major: "전공을 입력해주세요",
  location: "위치를 설정해주세요", bio: "나를 표현하는 짧은 소개를 작성해보세요 🚀",
  status: "환영합니다!", tags: [], goals: [],
  idol: { nickname: "", birthday: "", age: "", specialty: "", hobbies: "", favorites: { colors: [], foods: [], games: [], music: [] }, qna: [] },
  career: { targetJob: "", techStack: [], strengths: [], interests: [], careerGoals: { short: "", mid: "", long: "" } },
  developer: { about: "", techStack: { backend: "", db: "", frontend: "", tools: "" }, projects: [], learning: [], motto: "" },
  privacy: { developer: true, career: true, idol: true }
};

const AppContext = createContext();
export const useAppStore = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  // 화면 및 UI 관련 상태
  const [viewMode, setViewMode] = useState('profile');
  const [toastMessage, setToastMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [addRecordModalOpen, setAddRecordModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 데이터 관련 상태
  const [records, setRecords] = useState([]);
  const [tagTree, setTagTree] = useState([]);
  const [user, setUser] = useState(INITIAL_USER_DATA);
  const [searchResults, setSearchResults] = useState([]);

  // 권한 및 멀티 유저 방문 관련 상태
  const [isAdmin, setIsAdmin] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [visitedHandle, setVisitedHandle] = useState(null); 

  // 알림 토스트 메시지 함수
  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  }, []);
  
  // 공통 인증 Fetch 함수 (API 요청 시 토큰 자동 주입)
  const apiFetch = useCallback(async (endpoint, options = {}) => {
    const token = localStorage.getItem('accessToken');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
  }, []);

  // 통합 데이터 조회 로직 (상태에 따라 호출 대상 분기)
  const fetchAllData = useCallback(async (isSilent = false) => {
    const token = localStorage.getItem('accessToken');
    let targetUrlBase = '';
    
    if (visitedHandle) {
      // 1. 타인 프로필을 방문 중일 때
      targetUrlBase = `/users/${visitedHandle}`;
    } else if (token && !isGuestMode) {
      // 2. 로그인되어 있고, 내 프로필(호스트 모드)을 볼 때
      targetUrlBase = `/me`;
    } else {
      // 3. 비로그인이거나, 내 프로필을 게스트 뷰로 볼 때 (기본 포트폴리오 전시 계정 지정)
      const defaultHandle = 'taekyeong.dev'; 
      targetUrlBase = `/users/${defaultHandle}`;
    }

    try {
      if (!isSilent) setIsLoading(true);
      const [profileRes, treeRes, recordsRes] = await Promise.all([
        apiFetch(`${targetUrlBase}/profile`).catch(() => ({ ok: false })),
        apiFetch(`${targetUrlBase}/categories`).catch(() => ({ ok: false })),
        apiFetch(`${targetUrlBase}/records`).catch(() => ({ ok: false }))
      ]);

      if (profileRes.ok) setUser(await profileRes.json());
      else setUser(INITIAL_USER_DATA);
      
      if (treeRes.ok) setTagTree(await treeRes.json());
      else setTagTree([]);
      
      if (recordsRes.ok) setRecords(await recordsRes.json());
      else setRecords([]);
      
    } catch (error) {
      console.error(error);
      setUser(INITIAL_USER_DATA); setTagTree([]); setRecords([]);
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  }, [apiFetch, visitedHandle, isGuestMode]);

  // 다른 유저 프로필 방문 함수
  const visitUserProfile = useCallback((targetHandle) => {
    setVisitedHandle(targetHandle); 
    setIsGuestMode(true); 
    setViewMode('profile');
    showToast(`${targetHandle}님의 공간으로 이동합니다 🚀`);
  }, [showToast]);

  // 내 본래 프로필로 복귀하는 함수
  const resetToMyProfile = useCallback(() => {
    setVisitedHandle(null);
    setIsGuestMode(false);
    setViewMode('profile');
    showToast("내 프로필로 돌아왔습니다 🏠");
  }, [showToast]);

  // 유저 검색 함수
  const searchUsers = useCallback(async (keyword) => {
    try {
      const res = await apiFetch(`/users/search?keyword=${encodeURIComponent(keyword)}`);
      if (res.ok) setSearchResults(await res.json());
      else setSearchResults([]);
    } catch (error) {
      console.error(error);
      setSearchResults([]);
    }
  }, [apiFetch]);

  // 초기 로드 및 OAuth 인증 처리
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (token) {
      localStorage.setItem('accessToken', token);
      setIsAdmin(true);
      window.history.replaceState({}, document.title, window.location.pathname);
      showToast("로그인 성공! 환영합니다. 🎉");
    } else if (error) {
      window.history.replaceState({}, document.title, window.location.pathname);
      showToast("로그인 실패: " + decodeURIComponent(error));
    } else {
      const savedToken = localStorage.getItem('accessToken');
      if (savedToken) setIsAdmin(true);
    }
    fetchAllData();
  }, [fetchAllData, showToast]);

  // 로그아웃 처리 함수
  const handleLogout = useCallback(() => {
    localStorage.removeItem('accessToken');
    setIsAdmin(false);
    setVisitedHandle(null); 
    setIsGuestMode(false);
    setViewMode('profile');
    fetchAllData();
  }, [fetchAllData]);

  return (
    <AppContext.Provider value={{ 
      viewMode, setViewMode, toastMessage, showToast, 
      searchQuery, setSearchQuery, searchResults, setSearchResults, searchUsers,
      records, setRecords, isAdmin, setIsAdmin, isGuestMode, setIsGuestMode,
      loginModalOpen, setLoginModalOpen, addRecordModalOpen, setAddRecordModalOpen,
      tagTree, setTagTree, user, setUser,
      isSidebarOpen, setIsSidebarOpen, 
      apiFetch, fetchAllData, handleLogout, 
      visitUserProfile, resetToMyProfile, visitedHandle 
    }}>
      {children}
    </AppContext.Provider>
  );
};