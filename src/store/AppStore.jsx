import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Sparkles } from 'lucide-react';

export const API_BASE_URL = 'http://localhost:8080/api/v1';

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
  const [records, setRecords] = useState([]);
  const [tagTree, setTagTree] = useState([]);
  const [user, setUser] = useState(INITIAL_USER_DATA);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [addRecordModalOpen, setAddRecordModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllData = useCallback(async () => {
    const HANDLE = 'taekyeong.dev';
    try {
      setIsLoading(true);
      const [profileRes, treeRes, recordsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/users/${HANDLE}/profile`).catch(() => ({ ok: false })),
          fetch(`${API_BASE_URL}/users/${HANDLE}/categories`).catch(() => ({ ok: false })),
          fetch(`${API_BASE_URL}/users/${HANDLE}/records`).catch(() => ({ ok: false }))
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
  }, []);

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
      isSidebarOpen, setIsSidebarOpen, fetchAllData
    }}>
      {children}
    </AppContext.Provider>
  );
};
