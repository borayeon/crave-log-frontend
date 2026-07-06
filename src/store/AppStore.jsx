import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Sparkles } from 'lucide-react';

// 환경에 따라 백엔드 주소가 자동으로 바뀌도록 설정
export const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8080/api/v1' 
    : 'https://crave-log-backend.onrender.com/api/v1'; 

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
  // 1. 기본 UI 상태
  const [viewMode, setViewMode] = useState('profile');
  const [toastMessage, setToastMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  // 2. 모달 상태
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [addRecordModalOpen, setAddRecordModalOpen] = useState(false);

  // 3. 권한 및 게스트 모드 상태
  const [isAdmin, setIsAdmin] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false); 

  // 4. 검색 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // 5. 핵심 데이터 상태
  const [records, setRecords] = useState([]);
  const [tagTree, setTagTree] = useState([]);
  const [user, setUser] = useState(INITIAL_USER_DATA);

  // 토큰을 자동으로 담아서 API를 호출하는 마법의 함수
  const apiFetch = useCallback(async (url, options = {}) => {
    const token = localStorage.getItem('accessToken');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return fetch(`${API_BASE_URL}${url}`, { ...options, headers });
  }, []);

  // 데이터를 서버에서 불러오는 함수
  const fetchAllData = useCallback(async (isSilent = false) => {
    const token = localStorage.getItem('accessToken');
    const HANDLE = 'taekyeong.dev'; 
    
    // 호스트(로그인)이고, '게스트 뷰 체험 모드'가 아닐 때만 내 정보(/me)를 가져옴
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
  }, [apiFetch, isGuestMode]); // isGuestMode 값에 따라 불러오는 주소가 바뀜

  // 유저 검색 기능
  const searchUsers = useCallback(async (keyword) => {
    try {
        const res = await apiFetch(`/users/search?keyword=${encodeURIComponent(keyword)}`);
        if (res.ok) {
            setSearchResults(await res.json());
        } else {
            setSearchResults([]);
        }
    } catch (error) {
        console.error(error);
        setSearchResults([]);
    }
  }, [apiFetch]);

  // 최초 접속 및 isGuestMode 변경 시 데이터 갱신
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        setIsAdmin(true); 
    }
    fetchAllData();
  }, [fetchAllData]);

  // 로그아웃 핸들러
  const handleLogout = useCallback(() => {
    localStorage.removeItem('accessToken'); 
    setIsAdmin(false);
    setIsGuestMode(false); // 로그아웃 시 게스트 모드도 해제
    setViewMode('profile');
    fetchAllData(); // 다시 게스트(퍼블릭) 정보로 갱신
  }, [fetchAllData]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  if (isLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4 animate-pulse">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-500 shadow-sm border border-indigo-200"><Sparkles size={24} /></div>
            <p className="text-sm font-black text-zinc-500 tracking-widest uppercase">CraveLog Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ 
      viewMode, setViewMode, toastMessage, showToast, 
      records, setRecords, isAdmin, setIsAdmin, 
      loginModalOpen, setLoginModalOpen,
      addRecordModalOpen, setAddRecordModalOpen,
      tagTree, setTagTree, user, setUser,
      isSidebarOpen, setIsSidebarOpen, 
      fetchAllData, apiFetch, handleLogout,
      isGuestMode, setIsGuestMode,
      searchQuery, setSearchQuery,
      searchResults, setSearchResults,
      searchUsers
    }}>
      {children}
    </AppContext.Provider>
  );
};