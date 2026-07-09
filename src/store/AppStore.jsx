import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// 백엔드 API 기본 주소 (나중에 환경 변수로 빼는 것을 권장)
export const API_BASE_URL = 'http://localhost:8080/api/v1';

// 초기 비어있는 데이터 상태 (에러 방지용)
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
  const [visitedHandle, setVisitedHandle] = useState(null); // 다른 사람 프로필 방문 시 아이디 저장

  // 토스트 메시지 띄우기
  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  }, []);

  // ⭐️ 공통 API 통신 함수 (토큰이 있으면 자동으로 Authorization 헤더에 넣어줌)
  const apiFetch = useCallback(async (endpoint, options = {}) => {
    const token = localStorage.getItem('accessToken');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
  }, []);

  // ⭐️ 데이터 통합 로드 (isSilent: 로딩창 숨기기, handleOverride: 특정 유저 강제 지정)
  const fetchAllData = useCallback(async (isSilent = false, handleOverride = null) => {
    const token = localStorage.getItem('accessToken');
    let targetUrlBase = '';
    const defaultHandle = 'taekyeong.dev'; // 비로그인 접속 시 기본으로 보여줄 전시용 계정
    
    // 1순위: 지정된 핸들, 2순위: 현재 방문 중인 핸들
    const currentHandle = handleOverride !== null ? handleOverride : visitedHandle;

    if (currentHandle && currentHandle !== "") {
      targetUrlBase = `/users/${currentHandle}`; // 특정 유저 조회
    } else if (token) {
      targetUrlBase = `/me`; // 내 정보 조회
    } else {
      targetUrlBase = `/users/${defaultHandle}`; // 기본 계정 조회
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
      console.error("데이터 로드 중 에러:", error);
      setUser(INITIAL_USER_DATA); setTagTree([]); setRecords([]);
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  }, [apiFetch, visitedHandle]); 

  // ⭐️ 특정 유저 프로필 방문
  const visitUserProfile = useCallback(async (targetHandle) => {
    setVisitedHandle(targetHandle); 
    setIsGuestMode(true); 
    setViewMode('profile');
    
    // 주소창 업데이트 (뒤로가기, 새로고침 대비)
    const newUrl = `${window.location.pathname}?u=${targetHandle}`;
    window.history.pushState({}, '', newUrl);
    
    await fetchAllData(false, targetHandle);
  }, [fetchAllData]);

  // ⭐️ 내 프로필로 복귀
  const resetToMyProfile = useCallback(async () => {
    setVisitedHandle(null);
    setIsGuestMode(false);
    setViewMode('profile');
    
    // 주소창에서 파라미터 지우기
    window.history.replaceState({}, document.title, window.location.pathname);
    
    await fetchAllData(false, "");
  }, [fetchAllData]);

  // ⭐️ 검색 수행
  const searchUsers = useCallback(async (keyword) => {
    if (!keyword.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await apiFetch(`/users/search?keyword=${encodeURIComponent(keyword)}`);
      if (res.ok) setSearchResults(await res.json());
      else setSearchResults([]);
    } catch(e) {
      console.error("검색 에러:", e);
      setSearchResults([]);
    }
  }, [apiFetch]);

  // ⭐️ 로그아웃 처리
  const handleLogout = useCallback(() => {
    localStorage.removeItem('accessToken');
    setIsAdmin(false);
    setVisitedHandle(null);
    setIsGuestMode(false);
    setViewMode('profile');
    window.history.replaceState({}, document.title, window.location.pathname);
    fetchAllData(); // 로그아웃 후 기본 데이터(전시용 또는 빈 화면) 갱신
  }, [fetchAllData]);

  // ⭐️ 앱 초기 진입 시 로직 (URL 파라미터 기반 라우팅)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token'); // 카카오 로그인 직후 토큰
    const error = params.get('error');
    const sharedHandle = params.get('u'); // 공유 링크로 접속 시 아이디

    if (token) {
      // 1. 소셜 로그인 성공 시
      localStorage.setItem('accessToken', token);
      setIsAdmin(true);
      window.history.replaceState({}, document.title, window.location.pathname); // 토큰 파라미터 숨기기
      showToast("로그인 성공! 환영합니다. 🎉");
      fetchAllData();
    } else if (error) {
      // 2. 소셜 로그인 실패 시
      window.history.replaceState({}, document.title, window.location.pathname);
      showToast("로그인 실패: " + decodeURIComponent(error));
      fetchAllData();
    } else {
      // 3. 일반 접속 시
      const savedToken = localStorage.getItem('accessToken');
      if (savedToken) setIsAdmin(true);
      
      if (sharedHandle) {
        // 공유 링크로 남의 프로필에 들어왔을 때
        visitUserProfile(sharedHandle);
      } else {
        // 내 프로필(또는 기본 화면) 로드
        fetchAllData();
      }
    }
  }, [fetchAllData, visitUserProfile, showToast]);

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