import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Sparkles } from 'lucide-react';

// 환경변수에 등록된 백엔드 주소를 가져옵니다.
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
  const [searchResults, setSearchResults] = useState([]);

  const [records, setRecords] = useState([]);
  const [tagTree, setTagTree] = useState([]);
  const [user, setUser] = useState(INITIAL_USER_DATA);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [addRecordModalOpen, setAddRecordModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 백엔드 통신용 함수 (자동으로 토큰 탑재)
  const apiFetch = useCallback(async (endpoint, options = {}) => {
    const token = localStorage.getItem('accessToken');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
  }, []);

  // 기본 데이터 불러오기
  const fetchAllData = useCallback(async (isSilent = false) => {
    const token = localStorage.getItem('accessToken');
    const HANDLE = 'taekyeong.dev'; // 비로그인 시 기본 열람할 유저 핸들
    
    const isHostView = token && !isGuestMode;

    const profileUrl = isHostView ? `/me/profile` : `/users/${HANDLE}/profile`;
    const categoriesUrl = isHostView ? `/me/categories` : `/users/${HANDLE}/categories`;
    const recordsUrl = isHostView ? `/me/records` : `/users/${HANDLE}/records`;

    try {
      if (!isSilent) setIsLoading(true);
      const [profileRes, treeRes, recordsRes] = await Promise.all([
          apiFetch(profileUrl).catch(() => ({ ok: false })),
          apiFetch(categoriesUrl).catch(() => ({ ok: false })),
          apiFetch(recordsUrl).catch(() => ({ ok: false }))
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
  }, [apiFetch, isGuestMode]);

  // ⭐️ 검색 결과에서 다른 사람의 프로필을 불러오는 기능 추가!
  const visitUserProfile = useCallback(async (targetHandle) => {
    try {
      setIsLoading(true);
      const [profileRes, treeRes, recordsRes] = await Promise.all([
          apiFetch(`/users/${targetHandle}/profile`).catch(() => ({ ok: false })),
          apiFetch(`/users/${targetHandle}/categories`).catch(() => ({ ok: false })),
          apiFetch(`/users/${targetHandle}/records`).catch(() => ({ ok: false }))
      ]);

      if (profileRes.ok) setUser(await profileRes.json());
      else setUser(INITIAL_USER_DATA);
      
      if (treeRes.ok) setTagTree(await treeRes.json());
      else setTagTree([]);
      
      if (recordsRes.ok) setRecords(await recordsRes.json());
      else setRecords([]);

      setIsGuestMode(true); // 타인의 프로필이므로 수정 방지를 위해 게스트 모드 ON
      setViewMode('profile'); // 프로필 화면으로 이동
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [apiFetch]);

  // 유저 검색
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

  // 마운트 시 토큰 체크 및 데이터 불러오기
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

  // 로그아웃
  const handleLogout = useCallback(() => {
    localStorage.removeItem('accessToken');
    setIsAdmin(false);
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
      apiFetch, fetchAllData, handleLogout, visitUserProfile // ⭐️ export 추가
    }}>
      {children}
    </AppContext.Provider>
  );
};