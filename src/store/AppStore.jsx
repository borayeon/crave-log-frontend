import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Sparkles } from 'lucide-react';

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
  const [viewMode, setViewMode] = useState('profile');
  const [toastMessage, setToastMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [records, setRecords] = useState([]);
  const [tagTree, setTagTree] = useState([]);
  const [user, setUser] = useState(INITIAL_USER_DATA);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [addRecordModalOpen, setAddRecordModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [isGuestMode, setIsGuestMode] = useState(false);
  // ⭐️ 추가: 남의 프로필을 보고 있는지 추적하는 상태
  const [visitedHandle, setVisitedHandle] = useState(null); 

  // ⭐️ 누락되었던 showToast 함수 복구!
  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  }, []);
  
  const apiFetch = useCallback(async (endpoint, options = {}) => {
    const token = localStorage.getItem('accessToken');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
  }, []);

  // ⭐️ 핵심 수정: 어떤 데이터를 불러올지 똑똑하게 판단합니다.
  const fetchAllData = useCallback(async (isSilent = false) => {
    const token = localStorage.getItem('accessToken');
    let targetUrlBase = '';
    
    if (visitedHandle) {
        // 1. 남의 프로필을 방문 중일 때
        targetUrlBase = `/users/${visitedHandle}`;
    } else if (token && !isGuestMode) {
        // 2. 로그인되어 있고, 내 프로필(호스트)을 볼 때
        targetUrlBase = `/me`;
    } else {
        // 3. 비로그인이거나, 내 프로필을 게스트 뷰로 볼 때
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
  }, [apiFetch, visitedHandle, isGuestMode]); // 의존성 추가

  // ⭐️ 다른 사람 프로필 열람 함수 (데이터를 덮어쓰지 않고 상태만 바꿈)
  const visitUserProfile = useCallback((targetHandle) => {
      setVisitedHandle(targetHandle); // 타겟 지정 -> useEffect가 알아서 데이터를 가져옴
      setIsGuestMode(true); // 버튼 숨김 처리용
      setViewMode('profile');
      showToast(`${targetHandle}님의 공간으로 이동합니다 🚀`);
  }, []);

  // ⭐️ 내 프로필로 복귀하는 함수
  const resetToMyProfile = useCallback(() => {
      setVisitedHandle(null);
      setIsGuestMode(false);
      setViewMode('profile');
      showToast("내 프로필로 돌아왔습니다 🏠");
  }, []);

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
  const [searchResults, setSearchResults] = useState([]);

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
  }, [fetchAllData]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('accessToken');
    setIsAdmin(false);
    setVisitedHandle(null); // 로그아웃 시 타겟 초기화
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
      visitUserProfile, resetToMyProfile, visitedHandle // ⭐️ 새로운 함수들 내보내기
    }}>
      {children}
    </AppContext.Provider>
  );
};