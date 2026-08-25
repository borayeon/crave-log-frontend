import React, { useState, useEffect } from 'react';
import { 
  Save, Eye, Lock, Image as ImageIcon, Upload, AtSign, Loader2,
  Code, Briefcase, Sparkles, GraduationCap, MapPin, Target, Heart, MessageSquare,
  Terminal, Quote, Palette, Compass, Link as LinkIcon, Edit2, Rocket, UserPlus, Grid, FileText, CreditCard
} from 'lucide-react';
import { useAppStore } from '../store/AppStore';

import EditHistoryModal from '../components/profile/EditHistoryModal';
import Mandalart from '../components/profile/tabs/Mandalart';

import { 
  DeveloperEditTab, CareerEditTab, AddProfileEditTab, BusinessCardEditTab, 
  QnaEditTab, HobbyEditTab, QuotesEditTab, MemoEditTab, ArtEditTab 
} from '../components/profile/tabs/EditTabs';

const EditProfileView = () => {
  const { setViewMode, user, showToast, fetchAllData, apiFetch } = useAppStore();
  
  const [formData, setFormData] = useState(() => {
    const safeUser = JSON.parse(JSON.stringify(user || {}));
    const qnaData = safeUser.qna?.length ? safeUser.qna : (safeUser.idol?.qna || safeUser.addProfile?.qna || []);
    
    let parsedPrivacy = { developer: false, career: false, addProfile: false, businessCard: false, qna: false, hobby: false, vision: false, quotes: false, memo: false, art: false };
    if (safeUser.privacy) {
        if (typeof safeUser.privacy === 'string') {
            try { parsedPrivacy = { ...parsedPrivacy, ...JSON.parse(safeUser.privacy) }; } catch(e) { }
        } else if (typeof safeUser.privacy === 'object') {
            parsedPrivacy = { ...parsedPrivacy, ...safeUser.privacy };
        }
    }

    const defaultOrder = ['developer', 'career', 'addProfile', 'businessCard', 'qna', 'hobby', 'vision', 'quotes', 'memo', 'art'];
    const savedOrder = safeUser.idol?.tabOrder || [];
    const mergedOrder = [...new Set([...savedOrder, ...defaultOrder])];

    let memoArea = safeUser.idol?.memoArea || safeUser.memoArea || { text: "", dots: [], gridSize: 15 };
    if (!memoArea.gridSize) memoArea.gridSize = 15;
    const totalDots = memoArea.gridSize * memoArea.gridSize;
    if (!memoArea.dots || memoArea.dots.length !== totalDots) {
        memoArea.dots = Array(totalDots).fill("");
    } else {
        memoArea.dots = memoArea.dots.map(d => d === true ? '#ec4899' : (d === false ? "" : d));
    }

    return {
      ...safeUser,
      profileImageUrl: safeUser.profileImageUrl || '',
      privacy: parsedPrivacy,
      developer: safeUser.developer || { techStack: {}, projects: [], learning: [], about: "" },
      career: safeUser.career || { targetJob: "", techStack: [], interests: [], strengths: [], careerGoals: {} },
      
      idol: { 
          ...(safeUser.idol || {}),
          tabOrder: mergedOrder,
          businessCard: safeUser.idol?.businessCard || safeUser.businessCard || { company: "", position: "", email: "", phone: "", website: "", address: "", template: "dark" },
          qna: qnaData,
          hobby: safeUser.idol?.hobby || safeUser.hobby || { title: "", image: "", description: "", keywords: [] },
          vision: safeUser.idol?.vision || safeUser.vision || { core: "", subs: Array(8).fill(""), details: Array.from({length: 8}, () => Array(8).fill("")) },
          quotes: safeUser.idol?.quotes || safeUser.quotes || [],
          memoArea: memoArea,
          updatedAt: safeUser.idol?.updatedAt || new Date().toISOString().split('T')[0],
          history: safeUser.idol?.history || [],
          extraImage: safeUser.idol?.extraImage || "", 
          mbti: safeUser.idol?.mbti || "", 
          bloodType: safeUser.idol?.bloodType || "", 
          height: safeUser.idol?.height || "", 
          religion: safeUser.idol?.religion || "", 
          relationship: safeUser.idol?.relationship || "", 
          languages: safeUser.idol?.languages || "",
          motto: safeUser.idol?.motto || "", 
          recentHobby: safeUser.idol?.recentHobby || "", 
          workingStyle: safeUser.idol?.workingStyle || "", 
          activeHours: safeUser.idol?.activeHours || "", 
          contact: safeUser.idol?.contact || "중간",
          tastes: safeUser.idol?.tastes || { hobbies: [], culture: [], foods: [], lifestyle: [] }, 
      },
      tags: safeUser.tags || [],
      goals: safeUser.goals || [],
      links: safeUser.links || []
    };
  });

  const [editTab, setEditTab] = useState('developer');
  const [isLoading, setIsLoading] = useState(false);
  
  const [isProfileImageUploading, setIsProfileImageUploading] = useState(false);
  const [isHobbyImageUploading, setIsHobbyImageUploading] = useState(false);
  const [isExtraImageUploading, setIsExtraImageUploading] = useState(false); 

  const [isCheckingHandle, setIsCheckingHandle] = useState(false);
  const [isHandleAvailable, setIsHandleAvailable] = useState(true);
  
  const [viewHistoryItem, setViewHistoryItem] = useState(null); 
  const [draggedTabIndex, setDraggedTabIndex] = useState(null);

  const TABS_CONFIG = {
    developer: { id: 'developer', label: 'Developer', icon: <Code size={16}/> },
    career: { id: 'career', label: 'Career', icon: <Briefcase size={16}/> },
    addProfile: { id: 'addProfile', label: 'Add Profile', icon: <UserPlus size={16}/> },
    businessCard: { id: 'businessCard', label: 'Business Card', icon: <CreditCard size={16}/> },
    qna: { id: 'qna', label: 'Q&A', icon: <MessageSquare size={16}/> },
    hobby: { id: 'hobby', label: 'Hobby', icon: <Palette size={16}/> },
    vision: { id: 'vision', label: 'Mandalart', icon: <Compass size={16}/> },
    quotes: { id: 'quotes', label: 'Quotes', icon: <Quote size={16}/> },
    memo: { id: 'memo', label: 'Memo', icon: <FileText size={16}/> },
    art: { id: 'art', label: 'Dot Art', icon: <Grid size={16}/> }
  };

  const isTabPrivate = (tabId) => {
      const val = formData.privacy?.[tabId];
      return String(val).toLowerCase() === 'false' || String(val) === '0';
  };

  const updateNested = (path, value) => {
    setFormData(prev => {
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) current[path[i]] = {};
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return newData;
    });
  };

  const handleCommitProfile = () => {
      const currentData = { ...formData.idol };
      delete currentData.history;
      
      const commit = {
          id: Date.now().toString(),
          date: formData.idol.updatedAt || new Date().toISOString().split('T')[0],
          snapshot: currentData
      };

      const currentHistory = formData.idol.history || [];
      const newHistory = [commit, ...currentHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
      
      updateNested(['idol', 'history'], newHistory);
      showToast(`${commit.date} 기준으로 현재 기록이 고정되었습니다! 📸`);
  };

  const uploadImageToServer = async (file, path, setUploadingState) => {
    const MAX_FILE_SIZE = 50 * 1024 * 1024; 
    if (file.size > MAX_FILE_SIZE) return showToast("파일 용량이 50MB를 초과할 수 없습니다.");

    if (setUploadingState) setUploadingState(true);
    else setIsLoading(true);
    
    const fileData = new FormData();
    fileData.append("file", file);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      const res = await fetch('https://api.cravelog.me/api/v1/files/upload', {
        method: 'POST',
        body: fileData,
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (res.status === 413) return showToast("서버 업로드 용량 제한을 초과했습니다.");

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          if (res.ok) {
            const fullImageUrl = data.imageUrl?.startsWith('http') ? data.imageUrl : `https://api.cravelog.me${data.imageUrl}`;
            updateNested(path, fullImageUrl); 
            showToast("이미지가 성공적으로 업로드되었습니다.");
          } else {
            showToast(data.message || "이미지 업로드에 실패했습니다.");
          }
      } else {
          if (!res.ok) showToast(`서버 에러가 발생했습니다. (상태 코드: ${res.status})`);
      }
    } catch (error) {
      console.error(error);
      showToast("서버와 연결할 수 없습니다.");
    } finally {
      if (setUploadingState) setUploadingState(false);
      else setIsLoading(false);
    }
  };

  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) uploadImageToServer(file, ["profileImageUrl"], setIsProfileImageUploading);
    e.target.value = null; 
  };

  const handleHobbyImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) uploadImageToServer(file, ["idol", "hobby", "image"], setIsHobbyImageUploading);
    e.target.value = null; 
  };

  const handleExtraImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) uploadImageToServer(file, ["idol", "extraImage"], setIsExtraImageUploading);
    e.target.value = null; 
  };

  const handleCheckDuplicateHandle = async () => {
    if (!formData.handle?.trim()) return showToast('아이디를 입력해주세요.');
    if (!/^[a-z0-9._-]+$/.test(formData.handle)) return showToast('아이디는 영문 소문자, 숫자, 마침표(.), 밑줄(_), 하이픈(-)만 가능합니다.');
    if (formData.handle === user.handle) {
        setIsHandleAvailable(true);
        return showToast('현재 사용 중인 내 아이디입니다. ✅');
    }

    setIsCheckingHandle(true);
    try {
      const res = await apiFetch(`/users/${formData.handle}/profile`);
      if (res.ok) {
        setIsHandleAvailable(false);
        showToast('이미 사용 중인 아이디입니다. ❌ 다른 아이디를 입력해주세요.');
      } else {
        setIsHandleAvailable(true);
        showToast('사용 가능한 아이디입니다! ✅');
      }
    } catch (error) {
      setIsHandleAvailable(false);
      showToast('중복 확인 중 오류가 발생했습니다.');
    } finally {
      setIsCheckingHandle(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) return showToast('이름은 필수 입력 항목입니다.');
    if (!formData.handle?.trim()) return showToast('고유 아이디는 필수 입력 항목입니다.');
    if (!/^[a-z0-9._-]+$/.test(formData.handle)) return showToast('아이디는 영문 소문자, 숫자, 마침표(.), 밑줄(_), 하이픈(-)만 가능합니다.');
    if (!isHandleAvailable && formData.handle !== user.handle) return showToast('아이디 중복 확인을 진행해주세요.');

    setIsLoading(true);

    try {
      const res = await apiFetch(`/me/profile`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        await fetchAllData();
        setViewMode('profile');
        showToast("성공적으로 저장되었습니다! 🎉");
      } else {
        const data = await res.json();
        showToast(data.message || "프로필 저장에 실패했습니다.");
      }
    } catch (e) {
      showToast("서버 연결에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStringArrayInput = (label, path, placeholder = "엔터(Enter)로 추가") => {
    const rawValue = path.reduce((o, i) => (o || {})[i] || '', formData);
    const str = Array.isArray(rawValue) ? rawValue.join(',') : (rawValue ? String(rawValue) : '');
    const arr = str ? str.split(',').map(s => s.trim()).filter(Boolean) : [];
    
    return (
      <div className="w-full">
        {label && <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">{label}</label>}
        <div className="flex flex-wrap items-center gap-2">
          {arr.map((v, idx) => (
            <span key={idx} onClick={(e) => {
                e.stopPropagation();
                const newArr = [...arr];
                newArr.splice(idx, 1);
                updateNested(path, newArr.join(', '));
              }} 
              className="group flex items-center gap-1 px-3 py-1.5 bg-[#21262D] border border-zinc-700 hover:border-rose-500 hover:bg-rose-900/30 text-zinc-200 text-[11px] font-bold rounded-full transition-colors cursor-pointer"
            >
              {v} <CloseIcon size={10} className="text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
          ))}
          <input
            type="text"
            placeholder={arr.length === 0 ? placeholder : "+"}
            className="w-10 focus:w-28 px-3 py-1.5 bg-transparent border border-dashed border-zinc-600 focus:border-solid focus:border-indigo-400 text-[11px] font-bold text-zinc-200 outline-none rounded-full transition-all text-center focus:text-left placeholder:text-zinc-500 focus:placeholder:text-transparent"
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const val = e.target.value.trim();
                if (val && !arr.includes(val)) updateNested(path, [...arr, val].join(', '));
                e.target.value = '';
              }
            }}
            onBlur={e => {
              const val = e.target.value.trim();
              if (val && !arr.includes(val)) updateNested(path, [...arr, val].join(', '));
              e.target.value = '';
            }}
          />
        </div>
      </div>
    );
  };

  const renderArrayInput = (label, path, placeholder = "엔터(Enter)로 추가") => {
    let arr = path.reduce((o, i) => (o || {})[i], formData);
    if (!Array.isArray(arr)) arr = [];
    
    return (
      <div className="w-full">
        {label && <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">{label}</label>}
        <div className="flex flex-wrap items-center gap-2">
          {arr.map((v, idx) => (
            <span key={idx} onClick={(e) => {
                e.stopPropagation();
                const newArr = [...arr];
                newArr.splice(idx, 1);
                updateNested(path, newArr);
              }} 
              className="group flex items-center gap-1 px-3 py-1.5 bg-zinc-100 border border-zinc-200 hover:border-rose-300 hover:bg-rose-50 text-zinc-700 text-xs font-bold rounded-full transition-colors cursor-pointer shadow-sm"
            >
              {v} <CloseIcon size={12} className="text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
          ))}
          <input
            type="text"
            placeholder={arr.length === 0 ? placeholder : "+"}
            className="flex-1 min-w-[70px] max-w-[130px] px-3 py-1.5 bg-white border border-dashed border-zinc-300 focus:border-solid focus:border-violet-400 text-xs font-bold text-zinc-700 outline-none rounded-full transition-all focus:text-left placeholder:text-zinc-400 focus:placeholder:text-transparent shadow-sm"
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const val = e.target.value.trim();
                if (val && !arr.includes(val)) updateNested(path, [...arr, val]);
                e.target.value = '';
              }
            }}
            onBlur={e => {
              const val = e.target.value.trim();
              if (val && !arr.includes(val)) updateNested(path, [...arr, val]);
              e.target.value = '';
            }}
          />
        </div>
      </div>
    );
  };

  const renderInput = (label, path, placeholder = "") => {
    const val = path.reduce((o, i) => (o || {})[i], formData) || '';
    return (
      <div className="w-full flex-1">
        {label && <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5">{label}</label>}
        <input
          type="text"
          value={val}
          onChange={e => updateNested(path, e.target.value)}
          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-800 outline-none focus:border-violet-400 focus:bg-white transition-colors"
          placeholder={placeholder}
        />
      </div>
    );
  };

  return (
    <React.Fragment>
      <EditHistoryModal 
          viewHistoryItem={viewHistoryItem} 
          setViewHistoryItem={setViewHistoryItem} 
          formData={formData} 
          updateNested={updateNested} 
          showToast={showToast} 
      />
      
      <div className="max-w-[1000px] mx-auto w-full p-4 md:px-10 animate-in fade-in duration-300 pb-28 md:pb-10 relative">
        <header className="sticky top-0 z-[100] mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#F8FAFC]/95 backdrop-blur-md py-4 -mx-4 px-4 md:-mx-10 md:px-10 border-b border-zinc-200/60 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)]">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
               <Edit2 size={24} className="text-violet-500"/> 프로필 편집
            </h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setViewMode('profile')} className="px-4 py-2 bg-white border border-zinc-200 text-zinc-600 rounded-xl text-xs font-bold hover:bg-zinc-50 transition shadow-sm">
              취소
            </button>
            <button 
              onClick={handleSave} 
              disabled={isLoading || isProfileImageUploading || isHobbyImageUploading || isExtraImageUploading}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5 ${(isLoading || isProfileImageUploading || isHobbyImageUploading || isExtraImageUploading) ? 'bg-violet-400 text-white/80 cursor-not-allowed' : 'bg-violet-600 text-white hover:bg-violet-700'}`}
            >
              {(isLoading || isProfileImageUploading || isHobbyImageUploading || isExtraImageUploading) ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
              {isLoading ? '저장 중...' : '저장 완료'}
            </button>
          </div>
        </header>

        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-100 mb-6 mt-2">
          {/* 상단 프로필 편집 영역 */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-10">
            <div className="shrink-0 flex flex-col items-center">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-zinc-50 border border-zinc-200 shadow-inner overflow-hidden relative group">
                    {isProfileImageUploading && (
                        <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-20 backdrop-blur-[1px]">
                            <Loader2 size={24} className="text-violet-500 animate-spin mb-1" />
                        </div>
                    )}
                    {formData.profileImageUrl ? (
                        <img src={formData.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl font-black text-zinc-300">
                            {formData.name ? formData.name.charAt(0) : '?'}
                        </div>
                    )}
                    <label className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex-col gap-1 backdrop-blur-[2px]">
                         <Upload size={20} />
                         <span className="text-[9px] font-bold">이미지 변경</span>
                         <input type="file" accept="image/*" onChange={handleProfileImageUpload} className="hidden" disabled={isProfileImageUploading} />
                    </label>
                </div>
                <div className="mt-4 w-full relative">
                    <Sparkles size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-yellow-500" />
                    <input 
                        type="text" 
                        value={formData.status || ''} 
                        onChange={e => updateNested(["status"], e.target.value)} 
                        placeholder="상태 메시지"
                        className="w-full bg-zinc-50 text-zinc-800 rounded-xl px-3 pl-7 py-2 text-[11px] font-bold tracking-wider text-center outline-none border border-zinc-200 focus:border-violet-400 focus:bg-white transition-colors"
                    />
                </div>
            </div>
            
            <div className="flex-1 w-full space-y-4">
                <div className="flex flex-col md:flex-row gap-3">
                     <input 
                        type="text" 
                        value={formData.name || ''} 
                        onChange={e => updateNested(["name"], e.target.value)} 
                        placeholder="이름"
                        className="text-2xl font-black text-zinc-900 bg-transparent border-b border-zinc-200 hover:border-zinc-300 focus:border-violet-500 outline-none pb-1 w-full md:w-1/3 transition-colors"
                    />
                    <div className="relative flex-1">
                        <AtSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400" />
                        <input 
                            type="text" 
                            value={formData.handle || ''} 
                            onChange={e => {
                                const val = e.target.value.toLowerCase();
                                updateNested(["handle"], val);
                                if (val !== user.handle) setIsHandleAvailable(false);
                                else setIsHandleAvailable(true);
                            }}
                            className={`w-full bg-violet-50/50 border rounded-xl py-2 pl-8 pr-[70px] text-sm font-bold text-violet-700 outline-none transition-colors ${!isHandleAvailable && formData.handle !== user.handle ? 'border-rose-400' : 'border-violet-100 focus:border-violet-400 focus:bg-white'}`} 
                            placeholder="고유 아이디"
                        />
                        <button 
                            type="button" 
                            onClick={handleCheckDuplicateHandle}
                            disabled={isCheckingHandle || !formData.handle || formData.handle === user.handle}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-violet-600 text-white text-[10px] font-bold rounded-lg hover:bg-violet-700 transition disabled:bg-zinc-300 flex items-center justify-center shrink-0"
                        >
                            {isCheckingHandle ? <Loader2 size={10} className="animate-spin" /> : '중복 확인'}
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-xl flex-1 min-w-[120px] focus-within:border-violet-400 focus-within:bg-white transition-colors">
                        <Briefcase size={14} className="text-zinc-400 shrink-0"/> 
                        <input type="text" value={formData.role || ''} onChange={e => updateNested(["role"], e.target.value)} placeholder="직무/역할" className="bg-transparent outline-none text-xs font-bold text-zinc-700 w-full"/>
                    </div>
                    <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-xl flex-1 min-w-[120px] focus-within:border-violet-400 focus-within:bg-white transition-colors">
                        <GraduationCap size={14} className="text-zinc-400 shrink-0"/> 
                        <input type="text" value={formData.major || ''} onChange={e => updateNested(["major"], e.target.value)} placeholder="전공/소속" className="bg-transparent outline-none text-xs font-bold text-zinc-700 w-full"/>
                    </div>
                    <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-xl flex-1 min-w-[120px] focus-within:border-violet-400 focus-within:bg-white transition-colors">
                        <MapPin size={14} className="text-zinc-400 shrink-0"/> 
                        <input type="text" value={formData.location || ''} onChange={e => updateNested(["location"], e.target.value)} placeholder="위치" className="bg-transparent outline-none text-xs font-bold text-zinc-700 w-full"/>
                    </div>
                </div>

                <textarea 
                    value={formData.bio || ''} 
                    onChange={e => updateNested(["bio"], e.target.value)} 
                    placeholder="나를 표현하는 한 줄 소개"
                    rows={2}
                    className="w-full text-sm text-zinc-700 font-bold bg-zinc-50 border border-zinc-200 focus:border-violet-400 focus:bg-white rounded-xl p-3 outline-none resize-none transition-colors"
                />
                
                <div>
                   {renderArrayInput("나의 키워드", ["tags"], "키워드 입력 후 Enter")}
                </div>

                <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200/60 mt-4">
                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><LinkIcon size={14}/> 소셜 링크 관리</h4>
                    <div className="space-y-2">
                        {(formData.links || []).map((link, idx) => (
                            <div key={idx} className="flex flex-col sm:flex-row gap-2 items-center bg-white p-2 rounded-xl border border-zinc-200 shadow-sm relative">
                                <select 
                                    value={link.platform} 
                                    onChange={e => { const arr=[...(formData.links||[])]; arr[idx].platform=e.target.value; updateNested(["links"], arr); }} 
                                    className="w-full sm:w-32 bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1.5 text-xs font-bold outline-none focus:border-violet-400"
                                >
                                    <option value="github">GitHub</option>
                                    <option value="youtube">YouTube</option>
                                    <option value="twitch">스트리밍 (Twitch)</option>
                                    <option value="instagram">Instagram</option>
                                    <option value="x">X (Twitter)</option>
                                    <option value="facebook">Facebook</option>
                                    <option value="kakao">카카오톡</option>
                                    <option value="blog">개인 블로그</option>
                                    <option value="web">개인 웹페이지</option>
                                    <option value="notion">Notion</option>
                                    <option value="other">기타</option>
                                </select>
                                <input 
                                    value={link.name} 
                                    onChange={e => { const arr=[...(formData.links||[])]; arr[idx].name=e.target.value; updateNested(["links"], arr); }} 
                                    className="w-full sm:w-1/4 bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1.5 text-xs font-medium outline-none focus:border-violet-400" 
                                    placeholder="이름 (예: 블로그)" 
                                />
                                <input 
                                    value={link.url} 
                                    onChange={e => { const arr=[...(formData.links||[])]; arr[idx].url=e.target.value; updateNested(["links"], arr); }} 
                                    className="w-full flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1.5 text-xs font-medium outline-none focus:border-violet-400" 
                                    placeholder="https://..." 
                                />
                                <button type="button" onClick={()=>{const arr=[...(formData.links||[])]; arr.splice(idx,1); updateNested(["links"], arr);}} className="p-1.5 text-rose-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg shrink-0 transition-colors">
                                    <Trash2 size={14}/>
                                </button>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={()=>{const arr=[...(formData.links||[]), {platform:"github", name:"", url:""}]; updateNested(["links"], arr);}} className="text-[11px] font-bold text-violet-600 bg-white border border-violet-200 px-3 py-1.5 rounded-lg hover:bg-violet-50 transition-colors w-full mt-2 shadow-sm">
                        + 링크 추가
                    </button>
                </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4 p-1">
          {(formData.idol?.tabOrder || []).map((tabId, index) => {
              const tab = TABS_CONFIG[tabId];
              if (!tab) return null;
              return (
                  <button 
                    key={tab.id} 
                    draggable={true}
                    onDragStart={(e) => { setDraggedTabIndex(index); e.dataTransfer.effectAllowed = 'move'; }}
                    onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                    onDragEnter={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        e.preventDefault();
                        if (draggedTabIndex === null || draggedTabIndex === index) return;
                        const newOrder = [...(formData.idol?.tabOrder || [])];
                        const [draggedItem] = newOrder.splice(draggedTabIndex, 1);
                        newOrder.splice(index, 0, draggedItem);
                        updateNested(['idol', 'tabOrder'], newOrder); 
                        setDraggedTabIndex(null);
                    }}
                    onDragEnd={() => setDraggedTabIndex(null)}
                    onClick={() => setEditTab(tab.id)} 
                    className={`shrink-0 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap border cursor-grab active:cursor-grabbing ${editTab === tab.id ? 'bg-zinc-900 text-white border-zinc-900 shadow-md' : 'bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50'} ${draggedTabIndex === index ? 'opacity-40 border-dashed border-indigo-400' : ''}`}
                  >
                    {React.cloneElement(tab.icon, { size: 14 })} {tab.label}
                  </button>
              );
          })}
        </div>

        <div className="mb-6 p-4 bg-white border border-zinc-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-in fade-in">
          <div>
            <h3 className="text-sm font-black text-zinc-800 flex items-center gap-2">
              {!isTabPrivate(editTab) ? <Eye size={16} className="text-violet-500"/> : <Lock size={16} className="text-rose-500"/>}
              이 탭을 방문자에게 공개하시겠습니까?
            </h3>
            <p className="text-[11px] font-medium text-zinc-500 mt-1">비공개 처리된 탭은 본인에게만 보이며 공유된 링크에서는 숨겨집니다.</p>
          </div>
          <button 
            onClick={() => {
                const currentlyPrivate = isTabPrivate(editTab);
                updateNested(['privacy', editTab], currentlyPrivate ? true : false);
            }}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${!isTabPrivate(editTab) ? 'bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100' : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'}`}
          >
            {!isTabPrivate(editTab) ? '공개 중 (클릭하여 숨기기)' : '비공개됨 (클릭하여 공개)'}
          </button>
        </div>

        {/* ⭐️ 리팩토링된 편집용 탭 컴포넌트들 렌더링 (코드 대폭 축소!) */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {editTab === 'developer' && <DeveloperEditTab formData={formData} updateNested={updateNested} renderStringArrayInput={renderStringArrayInput} />}
          {editTab === 'career' && <CareerEditTab formData={formData} updateNested={updateNested} renderArrayInput={renderArrayInput} />}
          {editTab === 'addProfile' && <AddProfileEditTab formData={formData} updateNested={updateNested} renderInput={renderInput} renderArrayInput={renderArrayInput} isExtraImageUploading={isExtraImageUploading} handleExtraImageUpload={handleExtraImageUpload} handleCommitProfile={handleCommitProfile} setViewHistoryItem={setViewHistoryItem} />}
          {editTab === 'businessCard' && <BusinessCardEditTab formData={formData} updateNested={updateNested} renderInput={renderInput} />}
          {editTab === 'qna' && <QnaEditTab formData={formData} updateNested={updateNested} />}
          {editTab === 'hobby' && <HobbyEditTab formData={formData} updateNested={updateNested} renderInput={renderInput} renderArrayInput={renderArrayInput} isHobbyImageUploading={isHobbyImageUploading} handleHobbyImageUpload={handleHobbyImageUpload} />}
          {editTab === 'vision' && <div className="animate-in fade-in"><Mandalart visionData={formData.idol?.vision} isEditMode={true} updateNested={updateNested} /></div>}
          {editTab === 'quotes' && <QuotesEditTab formData={formData} updateNested={updateNested} />}
          {editTab === 'memo' && <MemoEditTab formData={formData} updateNested={updateNested} />}
          {editTab === 'art' && <ArtEditTab formData={formData} updateNested={updateNested} />}
        </div>
      </div>
    </React.Fragment>
  );
};

export default EditProfileView;