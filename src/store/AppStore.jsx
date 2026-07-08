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

  // ⭐️ 통합 데이터 조회 로직 (자동 로그아웃 및 우회 처리 추가)
  const fetchAllData = useCallback(async (isSilent = false, handleOverride = null) => {
    const token = localStorage.getItem('accessToken');
    let targetUrlBase = '';
    let isFetchingMe = false; // 내 정보를 가져오는 중인지 확인하는 플래그
    const defaultHandle = 'taekyeong.dev'; 
    
    // ⭐️ 파라미터로 명시적 핸들이 넘어오면 그것을 최우선으로 사용합니다.
    const currentHandle = handleOverride !== null ? handleOverride : visitedHandle;

    if (currentHandle && currentHandle !== "") {
      targetUrlBase = `/users/${currentHandle}`;
    } else if (token) {
      isFetchingMe = true;
      targetUrlBase = `/me`;
    } else {
      targetUrlBase = `/users/${defaultHandle}`;
    }

    try {
      if (!isSilent) setIsLoading(true);
      
      // Promise.all 대신 개별 통신하여 상태 코드를 유연하게 체크합니다.
      let profileRes = await apiFetch(`${targetUrlBase}/profile`).catch(() => ({ ok: false }));
      let treeRes = await apiFetch(`${targetUrlBase}/categories`).catch(() => ({ ok: false }));
      let recordsRes = await apiFetch(`${targetUrlBase}/records`).catch(() => ({ ok: false }));

      // 🚨 핵심 로직: 내 정보('/me')를 요청했는데 실패했다면? (토큰 만료 등)
      if (isFetchingMe && !profileRes.ok) {
        console.warn("유효하지 않은 토큰입니다. 자동 로그아웃 후 전시용 계정으로 전환합니다.");
        localStorage.removeItem('accessToken'); // 썩은 토큰 폐기
        setIsAdmin(false); // 권한 즉시 박탈 (로그아웃 버튼 -> 로그인 버튼으로 변경됨)

        // 전시용 계정으로 다시 데이터를 재요청!
        targetUrlBase = `/users/${defaultHandle}`;
        profileRes = await apiFetch(`${targetUrlBase}/profile`).catch(() => ({ ok: false }));
        treeRes = await apiFetch(`${targetUrlBase}/categories`).catch(() => ({ ok: false }));
        recordsRes = await apiFetch(`${targetUrlBase}/records`).catch(() => ({ ok: false }));
      }

      // 최종적으로 가져온 데이터 적용
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
  }, [apiFetch, visitedHandle]);

  // 다른 유저 프로필 방문 함수
  const visitUserProfile = useCallback(async (targetHandle) => {
    setVisitedHandle(targetHandle); 
    setIsGuestMode(true); 
    setViewMode('profile');
    
    // URL 주소창에 파라미터 추가 (뒤로가기/공유 최적화)
    const newUrl = `${window.location.pathname}?u=${targetHandle}`;
    window.history.pushState({}, '', newUrl);
    
    showToast(`${targetHandle}님의 공간으로 이동합니다 🚀`);
    await fetchAllData(false, targetHandle); // 즉시 새 데이터 로드
  }, [showToast, fetchAllData]);

  // ⭐️ 내 본래 프로필로 복귀하는 함수
  const resetToMyProfile = useCallback(async () => {
    setVisitedHandle(null);
    setIsGuestMode(false);
    setViewMode('profile');
    
    // URL 파라미터 초기화
    window.history.replaceState({}, document.title, window.location.pathname);
    
    showToast("내 프로필로 돌아왔습니다 🏠");
    await fetchAllData(false, ""); // 즉시 내 데이터 로드 (오버라이드 무시)
  }, [showToast, fetchAllData]);

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
      visitUserProfile, resetToMyProfile, visitedHandle,
      isLoading
    }}>
      {children}
    </AppContext.Provider>
  );
};