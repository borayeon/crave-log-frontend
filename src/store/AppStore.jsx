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

  // ⭐️ 공통 API 통신 함수
  const apiFetch = useCallback(async (endpoint, options = {}) => {
    const token = localStorage.getItem('accessToken');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
  }, []);

  // ⭐️ 데이터 통합 로드
  const fetchAllData = useCallback(async (isSilent = false, handleOverride = null) => {
    const token = localStorage.getItem('accessToken');
    let targetUrlBase = '';
    const defaultHandle = 'taekyeong.dev'; 
    
    // 1순위: 지정된 핸들, 2순위: 현재 방문 중인 핸들
    const currentHandle = handleOverride !== null ? handleOverride : visitedHandle;

    if (currentHandle && currentHandle !== "") {
      targetUrlBase = `/users/${currentHandle}`; // 특정 유저 조회
    } else if (token) {
      targetUrlBase = `/me`; // 토큰이 있으면 무조건 내 정보 조회
    } else {
      targetUrlBase = `/users/${defaultHandle}`; // 기본 계정 조회
    }

    try {
      if (!isSilent) setIsLoading(true);
      
      // 네트워크 에러 시 앱이 터지지 않고 상태값을 반환하도록 안전 장치 추가
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
          // ⭐️ 데이터 로드 성공 시 확실하게 관리자 모드 켜기
          if (token && targetUrlBase === `/me`) {
              setIsAdmin(true);
          }
      } else {
          // ⭐️ 무조건 로그아웃 시키지 않고, '인증 에러(401, 403)'일 때만 로그아웃!
          if (token && targetUrlBase === `/me`) {
              if (profileRes.status === 401 || profileRes.status === 403) {
                  console.warn("인증이 만료되었습니다. 로그아웃 처리합니다.");
                  localStorage.removeItem('accessToken');
                  setIsAdmin(false);
              } else {
                  console.warn("서버 에러로 프로필 데이터를 불러오지 못했습니다. (로그인 유지)");
                  // 백엔드 에러가 나더라도 로그인 UI(로그아웃 버튼, 프로필 설정 등)는 유지
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

  // ⭐️ 특정 유저 프로필 방문
  const visitUserProfile = useCallback(async (targetHandle) => {
    setVisitedHandle(targetHandle); 
    setIsGuestMode(true); 
    setViewMode('profile');
    
    const newUrl = `${window.location.pathname}?u=${targetHandle}`;
    window.history.pushState({}, '', newUrl);
    
    await fetchAllData(false, targetHandle);
  }, [fetchAllData]);

  // ⭐️ 내 프로필로 복귀
  const resetToMyProfile = useCallback(async () => {
    setVisitedHandle(null);
    setIsGuestMode(false);
    setViewMode('profile');
    
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
    fetchAllData(false, null); // 로그아웃 후 기본 데이터 갱신
  }, [fetchAllData]);

  // ⭐️ 앱 초기 진입 시 로직
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token'); 
    const error = params.get('error');
    const sharedHandle = params.get('u'); 

    if (token) {
      // 1. 소셜 로그인 성공 시
      localStorage.setItem('accessToken', token);
      setIsAdmin(true);
      window.history.replaceState({}, document.title, window.location.pathname); 
      showToast("로그인 성공! 환영합니다. 🎉");
      fetchAllData(false, ""); 
    } else if (error) {
      // 2. 소셜 로그인 실패 시
      window.history.replaceState({}, document.title, window.location.pathname);
      showToast("로그인 실패: " + decodeURIComponent(error));
      fetchAllData();
    } else {
      // 3. 일반 접속 시 (새로고침 시)
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
    // ⭐️ 중요: 무한 루프를 막기 위해 의존성 배열을 완전히 비웠습니다.
    // 이 useEffect는 브라우저를 처음 켰을 때, 새로고침 했을 때 딱 1번만 실행됩니다!
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