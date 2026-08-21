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

// =========================================================================
// ⭐️ [필수 설정] 주소창에 아무것도 없을 때 메인 화면으로 띄울 유저 아이디
// =========================================================================
const MAIN_HOST_HANDLE = 'taeya00'; // ⬅️ 본인이 가입할 때 만든 아이디로 반드시 수정하세요!

// --- 초기 비어있는 데이터 상태 (Empty State) ---
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
  // UI 상태
  const [viewMode, setViewMode] = useState('profile');
  const [toastMessage, setToastMessage] = useState('');
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [addRecordModalOpen, setAddRecordModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // ⭐️ 데이터 로딩 상태 (이 값이 true일 때는 섣불리 빈 화면을 띄우지 않음)
  const [isLoading, setIsLoading] = useState(true);

  // 데이터 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [records, setRecords] = useState([]);
  const [tagTree, setTagTree] = useState([]);
  const [user, setUser] = useState(INITIAL_USER_DATA);
  
  // 권한 및 뷰 모드 상태
  const [isAdmin, setIsAdmin] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [visitedHandle, setVisitedHandle] = useState(null);

  // 토스트 메시지 띄우기
  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  }, []);

  // ⭐️ 공통 API 통신 함수 (콜드 스타트 방어: 최대 3회, 2초 간격 재시도)
  const apiFetch = useCallback(async (endpoint, options = {}, retries = 3) => {
    const token = localStorage.getItem('accessToken');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
      
      // 백엔드가 아직 켜지는 중일 때 발생하는 에러(502, 503 등) 대응
      if (!res.ok && [502, 503, 504].includes(res.status) && retries > 0) {
         console.warn(`서버 깨우는 중... 잠시 후 재시도 합니다. (${retries}번 남음)`);
         await new Promise(resolve => setTimeout(resolve, 2000)); // 2초 대기
         return apiFetch(endpoint, options, retries - 1); // 재귀 호출
      }
      return res;
    } catch (error) {
      // fetch 자체가 실패하는 경우 (네트워크 에러, 서버 완전 다운 등)
      if (retries > 0) {
         console.warn(`네트워크 연결 지연, 서버 깨우는 중... (${retries}번 남음)`);
         await new Promise(resolve => setTimeout(resolve, 2000));
         return apiFetch(endpoint, options, retries - 1);
      }
      throw error;
    }
  }, []);

  // ⭐️ 데이터 통합 로드
  const fetchAllData = useCallback(async (isSilent = false, handleOverride = null) => {
    const token = localStorage.getItem('accessToken');
    let targetUrlBase = '';
    
    // 1순위: 지정된 핸들, 2순위: 현재 방문 중인 핸들
    const currentHandle = handleOverride !== null ? handleOverride : visitedHandle;

    if (currentHandle && currentHandle !== "") {
      targetUrlBase = `/users/${currentHandle}`; // 특정 유저 조회
    } else if (token) {
      targetUrlBase = `/me`; // 토큰이 있으면 무조건 내 정보 조회
    } else {
      // ⭐️ 토큰도 없고 지정된 유저도 없으면 기본 호스트의 퍼블릭 프로필을 보여줌
      targetUrlBase = `/users/${MAIN_HOST_HANDLE}`; 
      setIsGuestMode(true); 
    }

    try {
      if (!isSilent) setIsLoading(true); // 로딩 시작
      
      // 네트워크 에러 시 앱이 터지지 않도록 방어
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
          // 인증 에러(401, 403)일 때만 로그아웃
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
      if (!isSilent) setIsLoading(false); // 로딩 완전 종료
    }
  }, [apiFetch, visitedHandle]); 

  // 특정 유저 프로필 방문
  const visitUserProfile = useCallback(async (targetHandle) => {
    setVisitedHandle(targetHandle); 
    setIsGuestMode(true); 
    setViewMode('profile');
    
    const newUrl = `${window.location.pathname}?u=${targetHandle}`;
    window.history.pushState({}, '', newUrl);
    
    await fetchAllData(false, targetHandle);
  }, [fetchAllData]);

  // 내 프로필로 복귀
  const resetToMyProfile = useCallback(async () => {
    setVisitedHandle(null);
    setIsGuestMode(false);
    setViewMode('profile');
    
    window.history.replaceState({}, document.title, window.location.pathname);
    await fetchAllData(false, "");
  }, [fetchAllData]);

  // 검색 수행
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

  // 로그아웃 처리
  const handleLogout = useCallback(() => {
    localStorage.removeItem('accessToken');
    setIsAdmin(false);
    setVisitedHandle(null);
    setIsGuestMode(false);
    setViewMode('profile');
    window.history.replaceState({}, document.title, window.location.pathname);
    fetchAllData(false, null);
  }, [fetchAllData]);

  // 앱 초기 진입 시 로직
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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