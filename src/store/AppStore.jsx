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

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const MAIN_HOST_HANDLE = 'taeya00'; 

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
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [addRecordModalOpen, setAddRecordModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [records, setRecords] = useState([]);
  const [tagTree, setTagTree] = useState([]);
  const [user, setUser] = useState(INITIAL_USER_DATA);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [visitedHandle, setVisitedHandle] = useState(null);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  }, []);

  // ⭐️ 백엔드 콜드 스타트 방어: 응답 실패 시 1.5초 간격 최대 3번 재시도
  const apiFetch = useCallback(async (endpoint, options = {}, retries = 3, delay = 1500) => {
    const token = localStorage.getItem('accessToken');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
        if (response.ok || response.status === 401 || response.status === 403) {
            return response; 
        }
        if (i === retries - 1) return response; 
      } catch (error) {
        if (i === retries - 1) throw error; 
      }
      await new Promise(res => setTimeout(res, delay));
    }
  }, []);

  const fetchAllData = useCallback(async (isSilent = false, handleOverride = null) => {
    const token = localStorage.getItem('accessToken');
    let targetUrlBase = '';
    
    const currentHandle = handleOverride !== null ? handleOverride : visitedHandle;

    if (currentHandle && currentHandle !== "") {
      targetUrlBase = `/users/${currentHandle}`;
    } else if (token) {
      targetUrlBase = `/me`;
    } else {
      targetUrlBase = `/users/${MAIN_HOST_HANDLE}`; 
      setIsGuestMode(true);
    }

    try {
      if (!isSilent) setIsLoading(true);
      
      const fetchSafe = (url) => apiFetch(url).catch(err => {
          console.error("Network Fetch Error:", err);
          return { ok: false, status: 0 }; 
      });

      const [profileRes, treeRes, recordsRes] = await Promise.all([
          fetchSafe(`${targetUrlBase}/profile`),
          fetchSafe(`${targetUrlBase}/categories`),
          fetchSafe(`${targetUrlBase}/records`)
      ]);

      if (profileRes.ok) {
          setUser(await profileRes.json());
          if (token && targetUrlBase === `/me`) {
              setIsAdmin(true);
          }
      } else {
          if (token && targetUrlBase === `/me`) {
              if (profileRes.status === 401 || profileRes.status === 403) {
                  localStorage.removeItem('accessToken');
                  setIsAdmin(false);
              } else {
                  setIsAdmin(true); 
              }
          }
          setUser(INITIAL_USER_DATA);
      }
      
      if (treeRes.ok) setTagTree(await treeRes.json());
      else setTagTree([]);
      
      if (recordsRes.ok) setRecords(await recordsRes.json());
      else setRecords([]);
      
    } catch (error) {
      console.error("데이터 로드 중 에러:", error);
      setUser(INITIAL_USER_DATA); setTagTree([]); setRecords([]);
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  }, [apiFetch, visitedHandle]); 

  const visitUserProfile = useCallback(async (targetHandle) => {
    setVisitedHandle(targetHandle); 
    setIsGuestMode(true); 
    setViewMode('profile');
    
    const newUrl = `${window.location.pathname}?u=${targetHandle}`;
    window.history.pushState({}, '', newUrl);
    
    await fetchAllData(false, targetHandle);
  }, [fetchAllData]);

  const resetToMyProfile = useCallback(async () => {
    setVisitedHandle(null);
    setIsGuestMode(false);
    setViewMode('profile');
    
    window.history.replaceState({}, document.title, window.location.pathname);
    await fetchAllData(false, "");
  }, [fetchAllData]);

  const searchUsers = useCallback(async (keyword) => {
    try {
      setIsLoading(true);
      const res = await apiFetch(`/users/search?keyword=${encodeURIComponent(keyword.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
        setSearchQuery(keyword.trim());
        setViewMode('search'); 
      } else {
        setSearchResults([]);
        showToast("검색에 실패했습니다.");
      }
    } catch(e) {
      console.error("검색 에러:", e);
      setSearchResults([]);
      showToast("서버 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [apiFetch, showToast]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('accessToken');
    setIsAdmin(false);
    setVisitedHandle(null);
    setIsGuestMode(false);
    setViewMode('profile');
    window.history.replaceState({}, document.title, window.location.pathname);
    fetchAllData(false, null); 
  }, [fetchAllData]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token'); 
    const error = params.get('error');
    const sharedHandle = params.get('u'); 

    if (token) {
      localStorage.setItem('accessToken', token);
      setIsAdmin(true);
      window.history.replaceState({}, document.title, window.location.pathname); 
      showToast("로그인 성공! 환영합니다. 🎉");
      fetchAllData(false, ""); 
    } else if (error) {
      window.history.replaceState({}, document.title, window.location.pathname);
      showToast("로그인 실패: " + decodeURIComponent(error));
      fetchAllData();
    } else {
      const savedToken = localStorage.getItem('accessToken');
      if (savedToken) {
          setIsAdmin(true); 
      }
      if (sharedHandle) {
        visitUserProfile(sharedHandle);
      } else {
        fetchAllData(false, savedToken ? "" : null); 
      }
    }
  }, []); 

  return (
    <AppContext.Provider value={{ 
      viewMode, setViewMode, toastMessage, showToast, 
      searchQuery, setSearchQuery, searchResults, setSearchResults, searchUsers,
      records, setRecords, tagTree, setTagTree, user, setUser,
      isAdmin, setIsAdmin, isGuestMode, setIsGuestMode, 
      visitedHandle, setVisitedHandle, visitUserProfile, resetToMyProfile,
      loginModalOpen, setLoginModalOpen, addRecordModalOpen, setAddRecordModalOpen,
      isSidebarOpen, setIsSidebarOpen, isLoading, setIsLoading,
      apiFetch, fetchAllData, handleLogout
    }}>
      {children}
    </AppContext.Provider>
  );
};