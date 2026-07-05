import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Sparkles } from 'lucide-react';

// 환경변수에 등록된 백엔드 주소를 가져옵니다.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const INITIAL_USER_DATA = {
  name: "손님", handle: "guest", profileImageUrl: "", role: "역할을 입력해주세요", major: "전공을 입력해주세요", // ⭐️ profileImageUrl 추가
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
  const [isGuestMode, setIsGuestMode] = useState(false); // ⭐️ 게스트 모드 상태 추가
  
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [addRecordModalOpen, setAddRecordModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
const [searchResults, setSearchResults] = useState([]); // ⭐️ 검색 결과 상태

  // ⭐️ 검색 실행 함수
  const searchUsers = async (keyword) => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/search?keyword=${encodeURIComponent(keyword)}`);
      if (res.ok) {
        setSearchResults(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ⭐️ 백엔드에 요청을 보낼 때, 자동으로 로그인 토큰(JWT)을 껴서 보내주는 만능 함수
  const apiFetch = useCallback(async (endpoint, options = {}) => {
    const token = localStorage.getItem('accessToken');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    // 토큰이 있으면 Authorization 헤더에 Bearer 타입으로 넣기
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  }, []);

  const fetchAllData = useCallback(async (isSilent = false) => {
    const token = localStorage.getItem('accessToken');
    const HANDLE = 'taekyeong.dev'; // 비로그인 시 기본 열람할 유저 핸들
    
    // 토큰이 있으면 "내 정보(/me/...)"를, 없으면 "퍼블릭 정보(/users/...)"를 불러옵니다.
    const profileUrl = token ? `/me/profile` : `/users/${HANDLE}/profile`;
    const categoriesUrl = token ? `/me/categories` : `/users/${HANDLE}/categories`;
    const recordsUrl = token ? `/me/records` : `/users/${HANDLE}/records`;

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
  }, [apiFetch]);
  // ⭐️ [추가] 다른 사람의 프로필 방문하기 함수
  const visitUserProfile = async (handle) => {
    try {
        setIsLoading(true);
        setIsGuestMode(true); // 남의 프로필이므로 강제로 '게스트(보기 전용) 모드' 켜기
        
        // 해당 유저의 퍼블릭 데이터 3종 세트 불러오기 (토큰 필요 없음)
        const [profileRes, treeRes, recordsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/users/${handle}/profile`),
            fetch(`${API_BASE_URL}/users/${handle}/categories`),
            fetch(`${API_BASE_URL}/users/${handle}/records`)
        ]);

        if (profileRes.ok) setUser(await profileRes.json());
        if (treeRes.ok) setTagTree(await treeRes.json());
        if (recordsRes.ok) setRecords(await recordsRes.json());
        
        setViewMode('profile'); // 프로필 탭으로 화면 이동
    } catch(e) {
        console.error("유저 프로필 조회 실패:", e);
    } finally {
        setIsLoading(false);
    }
  };
  useEffect(() => {
    // ⭐️ 1. URL 파라미터를 뒤져서 카카오 로그인이 돌려준 토큰을 낚아챕니다.
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (token) {
      // 성공: 토큰을 브라우저에 저장하고 어드민 권한 부여
      localStorage.setItem('accessToken', token);
      setIsAdmin(true);
      
      // 주소창에 지저분하게 남아있는 ?token=XXXX 부분을 깔끔하게 지워줍니다.
      window.history.replaceState({}, document.title, window.location.pathname);
      showToast("로그인 성공! 환영합니다. 🎉");
    } else if (error) {
      // 에러 발생 시 처리
      window.history.replaceState({}, document.title, window.location.pathname);
      showToast("로그인 실패: " + decodeURIComponent(error));
    } else {
      // URL엔 없지만, 예전에 로그인해서 브라우저(로컬 스토리지)에 토큰이 남아있는 경우
      const savedToken = localStorage.getItem('accessToken');
      if (savedToken) {
        setIsAdmin(true);
      }
    }

    // ⭐️ 2. 세팅이 끝난 뒤 데이터를 불러옵니다.
    fetchAllData();
  }, [fetchAllData]);

  // 로그아웃 처리 함수
  const handleLogout = useCallback(() => {
    localStorage.removeItem('accessToken');
    setIsAdmin(false);
    setViewMode('profile');
    fetchAllData(); // 로그아웃 후 다시 비로그인 상태의 데이터를 불러옵니다.
  }, [fetchAllData]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  if (isLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4 animate-pulse">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-500 shadow-sm border border-indigo-200">
                <Sparkles size={24} />
            </div>
            <p className="text-sm font-black text-zinc-500 tracking-widest uppercase">CraveLog Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ 
      viewMode, setViewMode, toastMessage, showToast, 
      searchQuery, setSearchQuery, searchResults, setSearchResults, searchUsers,
      records, setRecords, isAdmin, setIsAdmin, 
      loginModalOpen, setLoginModalOpen,
      addRecordModalOpen, setAddRecordModalOpen,
      tagTree, setTagTree, user, setUser,
      isSidebarOpen, setIsSidebarOpen,
      isGuestMode, setIsGuestMode,
      fetchAllData, apiFetch, handleLogout,
      visitUserProfile // ⭐️ 이 부분을 Provider value 맨 마지막에 꼭 추가해 주세요!
    }}>
      {children}
    </AppContext.Provider>
  );
};