import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Sparkles } from 'lucide-react';

export const API_BASE_URL = 'http://localhost:8080/api/v1';

const INITIAL_USER_DATA = { /* 기존과 동일하게 유지 */
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
  const [records, setRecords] = useState([]);
  const [tagTree, setTagTree] = useState([]);
  const [user, setUser] = useState(INITIAL_USER_DATA);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [addRecordModalOpen, setAddRecordModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // ⭐️ 1. 초기 로그인 상태를 localStorage의 토큰 유무로 판단합니다.
  const [isAdmin, setIsAdmin] = useState(!!localStorage.getItem('accessToken'));

  // ⭐️ 2. 앱 실행 시 URL에 토큰이 있다면 가로채서 저장합니다.
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      localStorage.setItem('accessToken', token);
      setIsAdmin(true);
      // 지저분한 토큰 URL을 깔끔하게 지워줍니다.
      window.history.replaceState({}, document.title, '/');
    }
  }, []);

  // ⭐️ 3. JWT 토큰을 자동으로 헤더에 넣어주는 커스텀 fetch 함수입니다.
  const apiFetch = useCallback(async (endpoint, options = {}) => {
    const token = localStorage.getItem('accessToken');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`; // 토큰 탑재!
    }
    return fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
  }, []);

  // ⭐️ 4. 로그아웃 처리 함수
  const handleLogout = useCallback(() => {
    localStorage.removeItem('accessToken');
    setIsAdmin(false);
    setViewMode('profile');
  }, []);

  // 5. 데이터 불러오기 (fetch 대신 apiFetch 사용)
  const fetchAllData = useCallback(async () => {
    const HANDLE = 'taekyeong.dev';
    try {
      setIsLoading(true);
      const [profileRes, treeRes, recordsRes] = await Promise.all([
          apiFetch(`/users/${HANDLE}/profile`).catch(() => ({ ok: false })),
          apiFetch(`/users/${HANDLE}/categories`).catch(() => ({ ok: false })),
          apiFetch(`/users/${HANDLE}/records`).catch(() => ({ ok: false }))
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
      setIsLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    fetchAllData();
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
      records, setRecords, isAdmin, setIsAdmin, 
      loginModalOpen, setLoginModalOpen,
      addRecordModalOpen, setAddRecordModalOpen,
      tagTree, setTagTree, user, setUser,
      isSidebarOpen, setIsSidebarOpen, fetchAllData,
      apiFetch, handleLogout // ⭐️ 새로 만든 유틸리티 함수들을 내보냅니다.
    }}>
      {children}
    </AppContext.Provider>
  );
};