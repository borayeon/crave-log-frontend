import React, { useState, useEffect } from 'react';
import { 
  Save, Eye, Lock, Trash2, Image as ImageIcon, Upload, AtSign, ExternalLink, Loader2,
  Code, Briefcase, HeartHandshake, User, Sparkles, GraduationCap, MapPin, Target, ArrowRight, Heart, MessageSquare, X as CloseIcon,
  Terminal, Quote, Palette, Compass, Link as LinkIcon, Edit2, Plus, Rocket, UserPlus, History, Calendar, ChevronDown,
  CreditCard, Mail, Phone, Globe
} from 'lucide-react';
import { useAppStore } from '../store/AppStore';

const EditProfileView = () => {
  const { setViewMode, user, showToast, fetchAllData, apiFetch } = useAppStore();
  
  const [formData, setFormData] = useState(() => {
    const safeUser = JSON.parse(JSON.stringify(user || {}));
    const qnaData = safeUser.qna?.length ? safeUser.qna : (safeUser.idol?.qna || []);
    
    let parsedPrivacy = { developer: false, career: false, addProfile: false, businessCard: false, qna: false, hobby: false, vision: false, quotes: false };
    if (safeUser.privacy) {
        if (typeof safeUser.privacy === 'string') {
            try { parsedPrivacy = { ...parsedPrivacy, ...JSON.parse(safeUser.privacy) }; } catch(e) { }
        } else if (typeof safeUser.privacy === 'object') {
            parsedPrivacy = { ...parsedPrivacy, ...safeUser.privacy };
        }
    }

    const defaultOrder = ['developer', 'career', 'addProfile', 'businessCard', 'qna', 'hobby', 'vision', 'quotes'];
    const savedOrder = safeUser.idol?.tabOrder || [];
    const mergedOrder = [...new Set([...savedOrder, ...defaultOrder])];

    return {
      ...safeUser,
      profileImageUrl: safeUser.profileImageUrl || '',
      privacy: parsedPrivacy,
      developer: safeUser.developer || { techStack: {}, projects: [], learning: [], about: "" },
      career: safeUser.career || { targetJob: "", techStack: [], interests: [], strengths: [], careerGoals: {} },
      idol: { 
          ...(safeUser.idol || {}),
          tabOrder: mergedOrder,
          businessCard: safeUser.idol?.businessCard || { company: "", position: "", email: "", phone: "", website: "", address: "", template: "dark" },
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
      qna: qnaData,
      hobby: safeUser.hobby || { title: "", image: "", description: "", keywords: [] },
      vision: safeUser.vision || { core: "", subs: Array(8).fill(""), details: Array.from({length: 8}, () => Array(8).fill("")) },
      quotes: safeUser.quotes || [],
      tags: safeUser.tags || [],
      goals: safeUser.goals || [],
      links: safeUser.links || []
    };
  });

  const [editTab, setEditTab] = useState('developer');
  const [hobbyImageInputType, setHobbyImageInputType] = useState('file');
  const [isLoading, setIsLoading] = useState(false);
  
  const [isProfileImageUploading, setIsProfileImageUploading] = useState(false);
  const [isHobbyImageUploading, setIsHobbyImageUploading] = useState(false);
  const [isExtraImageUploading, setIsExtraImageUploading] = useState(false); 

  const [isCheckingHandle, setIsCheckingHandle] = useState(false);
  const [isHandleAvailable, setIsHandleAvailable] = useState(true);

  const [showPreview, setShowPreview] = useState(false);
  const [previewTab, setPreviewTab] = useState('developer');
  
  const [viewHistoryItem, setViewHistoryItem] = useState(null); 
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false); 
  const [draggedTabIndex, setDraggedTabIndex] = useState(null);

  const TABS_CONFIG = {
    developer: { id: 'developer', label: 'Developer', icon: <Code size={16}/> },
    career: { id: 'career', label: 'Career', icon: <Briefcase size={16}/> },
    addProfile: { id: 'addProfile', label: 'Add Profile', icon: <UserPlus size={16}/> },
    businessCard: { id: 'businessCard', label: 'Business Card', icon: <CreditCard size={16}/> },
    qna: { id: 'qna', label: 'Q&A', icon: <MessageSquare size={16}/> },
    hobby: { id: 'hobby', label: 'Hobby', icon: <Palette size={16}/> },
    vision: { id: 'vision', label: 'Mandalart', icon: <Compass size={16}/> },
    quotes: { id: 'quotes', label: 'Quotes', icon: <Quote size={16}/> }
  };

  const isTabPrivate = (tabId) => {
      const val = formData.privacy?.[tabId];
      return String(val).toLowerCase() === 'false' || String(val) === '0';
  };
  
  const availablePreviewTabs = (formData.idol?.tabOrder || [])
    .map(id => TABS_CONFIG[id])
    .filter(tab => tab && !isTabPrivate(tab.id));

  useEffect(() => {
    if (showPreview) {
      const firstTab = availablePreviewTabs.length > 0 ? availablePreviewTabs[0].id : null;
      setPreviewTab(firstTab);
    }
  }, [showPreview]); // eslint-disable-line react-hooks/exhaustive-deps

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
    if (file.size > MAX_FILE_SIZE) {
        return showToast("파일 용량이 50MB를 초과할 수 없습니다.");
    }

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
      
      if (res.status === 413) {
          showToast("서버 업로드 용량 제한을 초과했습니다.");
          return;
      }

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
    if (file) uploadImageToServer(file, ["hobby", "image"], setIsHobbyImageUploading);
    e.target.value = null; 
  };

  const handleExtraImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) uploadImageToServer(file, ["idol", "extraImage"], setIsExtraImageUploading);
    e.target.value = null; 
  };

  const handleCheckDuplicateHandle = async () => {
    if (!formData.handle?.trim()) return showToast('아이디를 입력해주세요.');
    if (!/^[a-z0-9._-]+$/.test(formData.handle)) {
        return showToast('아이디는 영문 소문자, 숫자, 마침표(.), 밑줄(_), 하이픈(-)만 가능합니다.');
    }

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

  const renderBusinessCardUI = (data, userName) => {
    const t = data?.template || 'dark';
    let tClass = "bg-zinc-900 text-white";
    if(t === 'light') tClass = "bg-white text-zinc-900 border border-zinc-200 shadow-sm";
    if(t === 'gradient') tClass = "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md";
    if(t === 'glass') tClass = "bg-zinc-50/80 backdrop-blur-md border border-zinc-200 text-zinc-800 shadow-sm";

    return (
        <div className={`w-full max-w-md mx-auto aspect-[1.58/1] rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${tClass}`}>
            {t === 'dark' && <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>}
            {t === 'gradient' && <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>}

            <div className="flex justify-between items-start relative z-10">
                <span className="font-black text-lg sm:text-xl tracking-tight opacity-90">{data?.company || 'Company Name'}</span>
                <CreditCard size={20} className="opacity-50"/>
            </div>

            <div className="relative z-10 mt-4">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{userName || 'Your Name'}</h2>
                <p className="text-xs sm:text-sm font-bold opacity-80 mt-1">{data?.position || 'Position / Role'}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-[10px] sm:text-xs font-medium opacity-90 mt-6 relative z-10">
                <div className="flex items-center gap-1.5 truncate"><Mail size={12} className="shrink-0"/> <span className="truncate">{data?.email || 'email@example.com'}</span></div>
                <div className="flex items-center gap-1.5 truncate"><Phone size={12} className="shrink-0"/> <span className="truncate">{data?.phone || '+82 10-0000-0000'}</span></div>
                <div className="flex items-center gap-1.5 truncate"><MapPin size={12} className="shrink-0"/> <span className="truncate">{data?.address || 'Seoul, Republic of Korea'}</span></div>
                <div className="flex items-center gap-1.5 truncate"><Globe size={12} className="shrink-0"/> <span className="truncate">{data?.website || 'www.example.com'}</span></div>
            </div>
        </div>
    );
  };

  const renderMandalartEditor = () => {
    const defaultVision = { core: "", subs: Array(8).fill(""), details: Array.from({length: 8}, () => Array(8).fill("")) };
    const v = {
        core: formData.vision?.core || defaultVision.core,
        subs: formData.vision?.subs?.length === 8 ? formData.vision.subs : defaultVision.subs,
        details: formData.vision?.details?.length === 8 ? formData.vision.details : defaultVision.details
    };
    
    const handleCoreChange = (val) => updateNested(['vision', 'core'], val);
    const handleSubChange = (subIdx, val) => {
      const newSubs = [...v.subs];
      newSubs[subIdx] = val;
      updateNested(['vision', 'subs'], newSubs);
    };
    const handleDetailChange = (subIdx, detailIdx, val) => {
      const newDetails = [...v.details];
      if (!newDetails[subIdx]) newDetails[subIdx] = Array(8).fill("");
      else newDetails[subIdx] = [...newDetails[subIdx]]; 
      newDetails[subIdx][detailIdx] = val;
      updateNested(['vision', 'details'], newDetails);
    };

    const blocks = [];
    for (let i = 0; i < 9; i++) {
        if (i === 4) {
            blocks.push([
                { t: 'sub', idx: 0, val: v.subs[0] }, { t: 'sub', idx: 1, val: v.subs[1] }, { t: 'sub', idx: 2, val: v.subs[2] },
                { t: 'sub', idx: 3, val: v.subs[3] }, { t: 'core', idx: 0, val: v.core }, { t: 'sub', idx: 4, val: v.subs[4] },
                { t: 'sub', idx: 5, val: v.subs[5] }, { t: 'sub', idx: 6, val: v.subs[6] }, { t: 'sub', idx: 7, val: v.subs[7] }
            ]);
        } else {
            const subIdx = i < 4 ? i : i - 1;
            const d = v.details[subIdx] || Array(8).fill("");
            blocks.push([
                { t: 'detail', subIdx, idx: 0, val: d[0] }, { t: 'detail', subIdx, idx: 1, val: d[1] }, { t: 'detail', subIdx, idx: 2, val: d[2] },
                { t: 'detail', subIdx, idx: 3, val: d[3] }, { t: 'sub-readonly', subIdx, idx: 0, val: v.subs[subIdx] }, { t: 'detail', subIdx, idx: 4, val: d[4] },
                { t: 'detail', subIdx, idx: 5, val: d[5] }, { t: 'detail', subIdx, idx: 6, val: d[6] }, { t: 'detail', subIdx, idx: 7, val: d[7] }
            ]);
        }
    }

    return (
        <div className="bg-zinc-900 p-6 md:p-10 rounded-3xl shadow-sm overflow-x-auto scrollbar-hide text-white relative">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="text-center mb-8 relative z-10">
                <h3 className="text-2xl md:text-3xl font-black mb-2 flex items-center justify-center gap-2"><Compass className="text-violet-400"/> Mandalart Editor</h3>
                <p className="text-violet-200/80 text-[11px] font-medium uppercase tracking-widest">나의 비전을 이루기 위한 81가지 세부 계획을 수정하세요.</p>
            </div>
            <div className="min-w-[650px] max-w-2xl mx-auto aspect-square grid grid-cols-3 gap-1 md:gap-1.5 p-1.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 relative z-10">
                {blocks.map((block, bIdx) => (
                    <div key={bIdx} className="grid grid-cols-3 gap-px bg-white/30 border border-white/20 rounded-xl overflow-hidden shadow-inner p-px">
                        {block.map((cell, cIdx) => {
                            let bg = "bg-white/95 hover:bg-white focus:bg-white";
                            let textClass = "text-slate-800 font-bold";
                            let placeholder = "세부 계획";
                            let onChange = null;
                            let disabled = false;

                            if (cell.t === 'core') {
                                bg = "bg-violet-500 hover:bg-violet-400 focus:bg-violet-400 z-10 shadow-md";
                                textClass = "text-white font-black";
                                placeholder = "최종 목표";
                                onChange = (e) => handleCoreChange(e.target.value);
                            } else if (cell.t === 'sub') {
                                bg = "bg-violet-100 hover:bg-violet-50 focus:bg-violet-50";
                                textClass = "text-violet-900 font-black";
                                placeholder = "핵심 요건";
                                onChange = (e) => handleSubChange(cell.idx, e.target.value);
                            } else if (cell.t === 'sub-readonly') {
                                bg = "bg-violet-200/80 cursor-not-allowed";
                                textClass = "text-violet-900 font-black";
                                disabled = true;
                            } else if (cell.t === 'detail') {
                                onChange = (e) => handleDetailChange(cell.subIdx, cell.idx, e.target.value);
                            }

                            return (
                                <textarea
                                    key={cIdx}
                                    disabled={disabled}
                                    value={cell.val || ''}
                                    onChange={onChange}
                                    placeholder={placeholder}
                                    className={`w-full h-full min-h-[50px] p-1 text-center text-[9px] sm:text-[10px] md:text-xs resize-none outline-none transition-colors placeholder:text-black/20 flex items-center justify-center ${bg} ${textClass}`}
                                    style={{ lineHeight: '1.2' }}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
  };

  const renderVisionPreview = () => {
    return (
        <div className="opacity-80 pointer-events-none">
            {renderMandalartEditor()}
        </div>
    );
  };

  return (
    <React.Fragment>
      {/* 과거 기록 확인 모달창 */}
      {viewHistoryItem && (
          <div className="fixed inset-0 z-[300] bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-in fade-in" onClick={() => setViewHistoryItem(null)}>
              <div className="bg-[#F8FAFC] rounded-3xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
                  <div className="p-5 bg-white border-b border-zinc-200 flex justify-between items-center shrink-0">
                      <h3 className="text-base font-black text-zinc-900 flex items-center gap-2"><History className="text-indigo-500" size={18}/> {viewHistoryItem.date} 과거 기록</h3>
                      <button onClick={() => setViewHistoryItem(null)} className="p-2 bg-zinc-50 hover:bg-zinc-100 rounded-full text-zinc-500 transition-colors"><CloseIcon size={18}/></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                      <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm col-span-2">
                             <span className="block text-[10px] text-zinc-400 font-bold mb-1">Motto</span>
                             <span className="text-sm font-black text-indigo-600">{viewHistoryItem.snapshot?.motto || '-'}</span>
                          </div>
                          <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
                             <span className="block text-[10px] text-zinc-400 font-bold mb-1">MBTI</span>
                             <span className="text-xs font-black text-zinc-800">{viewHistoryItem.snapshot?.mbti || '-'}</span>
                          </div>
                          <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
                             <span className="block text-[10px] text-zinc-400 font-bold mb-1">Recent Hobby</span>
                             <span className="text-xs font-black text-zinc-800">{viewHistoryItem.snapshot?.recentHobby || '-'}</span>
                          </div>
                          <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
                             <span className="block text-[10px] text-zinc-400 font-bold mb-1">Working Style</span>
                             <span className="text-xs font-black text-zinc-800">{viewHistoryItem.snapshot?.workingStyle || '-'}</span>
                          </div>
                          <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
                             <span className="block text-[10px] text-zinc-400 font-bold mb-1">Active Hours</span>
                             <span className="text-xs font-black text-zinc-800">{viewHistoryItem.snapshot?.activeHours || '-'}</span>
                          </div>
                      </div>
                  </div>
                  <div className="p-5 border-t border-zinc-200 bg-white flex justify-end">
                      <button onClick={() => {
                          updateNested(['idol'], { ...formData.idol, ...viewHistoryItem.snapshot, history: formData.idol.history, updatedAt: viewHistoryItem.date });
                          showToast(`${viewHistoryItem.date} 기록으로 폼이 복원되었습니다!`);
                          setViewHistoryItem(null);
                      }} className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition shadow-sm">
                          이 기록 폼에 불러오기
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* ⭐️ 레이아웃 조정: 부모 컨테이너에서 overflow를 제거하고 relative만 남깁니다 */}
      <div className="max-w-[1000px] mx-auto w-full p-4 md:px-10 animate-in fade-in duration-300 pb-28 md:pb-10 relative">
        
        {/* ⭐️ 헤더를 Sticky하게 고정 */}
        <header className="sticky top-0 z-[100] mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#F8FAFC]/95 backdrop-blur-md py-4 -mx-4 px-4 md:-mx-10 md:px-10 border-b border-zinc-200/60 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)]">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
               <Edit2 size={24} className="text-violet-500"/> 프로필 편집
            </h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setViewMode('profile')} className="px-3 py-2 bg-white border border-zinc-200 text-zinc-600 rounded-xl text-xs font-bold hover:bg-zinc-50 transition shadow-sm">
              취소
            </button>
            <button onClick={() => setShowPreview(true)} className="px-3 py-2 bg-zinc-100 text-zinc-700 rounded-xl text-xs font-bold hover:bg-zinc-200 transition shadow-sm flex items-center gap-1.5 border border-zinc-200">
              <Eye size={14} /> <span className="hidden sm:inline">미리보기</span>
            </button>
            <button 
              onClick={handleSave} 
              disabled={isLoading || isProfileImageUploading || isHobbyImageUploading || isExtraImageUploading}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5 ${(isLoading || isProfileImageUploading || isHobbyImageUploading || isExtraImageUploading) ? 'bg-violet-400 text-white/80 cursor-not-allowed' : 'bg-violet-600 text-white hover:bg-violet-700'}`}
            >
              {(isLoading || isProfileImageUploading || isHobbyImageUploading || isExtraImageUploading) ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
              {isLoading ? '저장 중...' : '저장 완료'}
            </button>
          </div>
        </header>

        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-100 mb-6 mt-2">
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

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {/* DEVELOPER TAB */}
          {editTab === 'developer' && (
            <div className="space-y-4">
                <div className="bg-[#0D1117] text-zinc-300 p-6 md:p-8 rounded-3xl shadow-sm border border-zinc-800 relative overflow-hidden">
                    <div className="absolute top-4 left-4 flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                    </div>
                    <div className="mt-4 mb-6">
                       <span className="text-zinc-500 font-mono text-[11px] font-bold">{"// About Me"}</span>
                       <textarea 
                          value={formData.developer?.about || ''} 
                          onChange={e => updateNested(["developer", "about"], e.target.value)} 
                          rows={3} 
                          placeholder="개발자로서의 자기소개를 작성해보세요."
                          className="w-full mt-2 bg-[#161B22] border border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-emerald-400 focus:border-emerald-500 outline-none resize-none placeholder:text-emerald-900/50 transition-colors" 
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-[#161B22] p-5 rounded-2xl border border-zinc-800">
                            <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-1.5"><Code size={14}/> Tech Stack</h4>
                            <div className="space-y-4">
                                {renderStringArrayInput("Backend", ["developer", "techStack", "backend"], "추가")}
                                {renderStringArrayInput("Database", ["developer", "techStack", "db"], "추가")}
                                {renderStringArrayInput("Frontend", ["developer", "techStack", "frontend"], "추가")}
                                {renderStringArrayInput("Tools", ["developer", "techStack", "tools"], "추가")}
                            </div>
                        </div>
                        <div className="bg-[#161B22] p-5 rounded-2xl border border-zinc-800 flex flex-col">
                            <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-1.5"><Code size={14}/> Currently Learning</h4>
                            <div className="flex-1">
                               {renderStringArrayInput(null, ["developer", "learning"], "학습 중인 기술 입력 후 Enter")}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-zinc-200/60">
                    <h3 className="text-base font-black text-zinc-900 mb-1 ml-1 flex items-center gap-2"><Rocket size={16} className="text-violet-500" /> Featured Projects</h3>
                    <p className="text-[11px] text-zinc-500 font-medium ml-1 mb-5">대표 프로젝트를 등록하고 링크를 연결해 포트폴리오를 완성하세요.</p>
                    
                    <div className="grid grid-cols-1 gap-4">
                        {(formData.developer?.projects || []).map((proj, idx) => (
                            <div key={idx} className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200 shadow-sm flex flex-col md:flex-row gap-4 group relative">
                                <button 
                                    onClick={()=>{const arr=[...(formData.developer?.projects||[])]; arr.splice(idx,1); updateNested(["developer","projects"], arr);}} 
                                    className="absolute top-4 right-4 text-zinc-400 hover:text-rose-500 bg-white hover:bg-rose-50 border border-zinc-200 p-1.5 rounded-lg transition-colors z-10"
                                >
                                    <Trash2 size={14}/>
                                </button>
                                
                                <div className="flex-1 flex flex-col gap-2">
                                  <input 
                                      value={proj.name} 
                                      onChange={e => { const arr=[...(formData.developer?.projects||[])]; arr[idx].name=e.target.value; updateNested(["developer","projects"], arr); }} 
                                      className="w-full md:w-2/3 bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm font-black outline-none focus:border-violet-400 pr-10 transition-colors" 
                                      placeholder="프로젝트명" 
                                  />
                                  <textarea 
                                      value={proj.desc} 
                                      onChange={e => { const arr=[...(formData.developer?.projects||[])]; arr[idx].desc=e.target.value; updateNested(["developer","projects"], arr); }} 
                                      className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-medium outline-none resize-none focus:border-violet-400 transition-colors" 
                                      placeholder="프로젝트 한 줄 설명 및 담당 역할" 
                                      rows={2}
                                  />
                                </div>
                                <div className="md:w-1/3 flex flex-col justify-end gap-2">
                                  <div className="flex items-center gap-2">
                                      <Terminal size={14} className="text-zinc-400 shrink-0"/>
                                      <input 
                                          value={proj.githubUrl || ''} 
                                          onChange={e => { const arr=[...(formData.developer?.projects||[])]; arr[idx].githubUrl=e.target.value; updateNested(["developer","projects"], arr); }} 
                                          className="w-full bg-white border border-zinc-200 rounded-md px-2.5 py-1.5 text-[11px] outline-none focus:border-violet-400 transition-colors" 
                                          placeholder="GitHub URL (선택)" 
                                      />
                                  </div>
                                  <div className="flex items-center gap-2">
                                      <ExternalLink size={14} className="text-violet-400 shrink-0"/>
                                      <input 
                                          value={proj.liveUrl || ''} 
                                          onChange={e => { const arr=[...(formData.developer?.projects||[])]; arr[idx].liveUrl=e.target.value; updateNested(["developer","projects"], arr); }} 
                                          className="w-full bg-white border border-zinc-200 rounded-md px-2.5 py-1.5 text-[11px] outline-none focus:border-violet-400 transition-colors" 
                                          placeholder="배포(Live) URL (선택)" 
                                      />
                                  </div>
                                </div>
                            </div>
                        ))}
                        
                        <button 
                            type="button"
                            onClick={()=>{const arr=[...(formData.developer?.projects||[]), {name:"", desc:"", githubUrl:"", liveUrl:""}]; updateNested(["developer","projects"], arr);}} 
                            className="py-6 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-zinc-200 rounded-2xl text-zinc-400 hover:text-violet-600 hover:border-violet-300 hover:bg-violet-50 transition-colors"
                        >
                            <Plus size={24} />
                            <span className="font-bold text-xs">새 프로젝트 추가</span>
                        </button>
                    </div>
                </div>
            </div>
          )}

          {/* CAREER TAB */}
          {editTab === 'career' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-zinc-200/60 flex flex-col md:flex-row gap-6 md:gap-8">
                  <div className="flex-1 space-y-5">
                      <div>
                          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">Target Job</label>
                          <input 
                            type="text" 
                            value={formData.career?.targetJob || ''} 
                            onChange={e => updateNested(["career", "targetJob"], e.target.value)}
                            className="w-full text-base font-black text-blue-600 bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-2.5 outline-none focus:border-blue-300 transition-colors"
                            placeholder="예: 리드 백엔드 엔지니어"
                          />
                      </div>
                      <div>
                          {renderArrayInput("Tech Stack", ["career", "techStack"], "필요 기술 입력 후 Enter")}
                      </div>
                      <div>
                          {renderArrayInput("Interests (관심 분야)", ["career", "interests"], "관심 분야 입력 후 Enter")}
                      </div>
                  </div>
                  
                  <div className="w-full md:w-1/3 space-y-3">
                      <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                          <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1.5 block">Short Term Goal</label>
                          <textarea value={formData.career?.careerGoals?.short || ''} onChange={e => updateNested(["career", "careerGoals", "short"], e.target.value)} rows={2} className="w-full bg-white border border-blue-100 rounded-lg px-3 py-2 text-xs font-bold text-blue-900 outline-none focus:border-blue-300 resize-none transition-colors" placeholder="단기 목표" />
                      </div>
                      <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                          <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1.5 block">Mid Term Goal</label>
                          <textarea value={formData.career?.careerGoals?.mid || ''} onChange={e => updateNested(["career", "careerGoals", "mid"], e.target.value)} rows={2} className="w-full bg-white border border-blue-100 rounded-lg px-3 py-2 text-xs font-bold text-blue-900 outline-none focus:border-blue-300 resize-none transition-colors" placeholder="중기 목표" />
                      </div>
                      <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                          <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1.5 block">Long Term Goal</label>
                          <textarea value={formData.career?.careerGoals?.long || ''} onChange={e => updateNested(["career", "careerGoals", "long"], e.target.value)} rows={2} className="w-full bg-white border border-blue-100 rounded-lg px-3 py-2 text-xs font-bold text-blue-900 outline-none focus:border-blue-300 resize-none transition-colors" placeholder="장기 목표" />
                      </div>
                  </div>
              </div>

              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-zinc-200/60">
                <h3 className="text-base font-black text-zinc-900 mb-4 ml-1 flex items-center gap-2"><Briefcase size={16} className="text-blue-500" /> Strengths (강점)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(formData.career?.strengths || []).map((str, idx) => (
                        <div key={idx} className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200/80 shadow-sm relative flex gap-3">
                            <button type="button" onClick={()=>{const arr=[...(formData.career?.strengths||[])]; arr.splice(idx,1); updateNested(["career","strengths"], arr);}} className="absolute top-4 right-4 text-zinc-400 hover:text-rose-500 bg-white border border-zinc-200 p-1 rounded-lg transition-colors"><Trash2 size={12}/></button>
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">{idx+1}</div>
                            <div className="flex-1 pr-6 flex flex-col gap-2">
                                <input value={str.title} onChange={e => { const arr=[...(formData.career?.strengths||[])]; arr[idx].title=e.target.value; updateNested(["career","strengths"], arr); }} className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm font-black text-zinc-900 outline-none focus:border-blue-300 transition-colors" placeholder="핵심 역량" />
                                <textarea value={str.desc} onChange={e => { const arr=[...(formData.career?.strengths||[])]; arr[idx].desc=e.target.value; updateNested(["career","strengths"], arr); }} className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[11px] font-medium text-zinc-600 outline-none resize-none focus:border-blue-300 transition-colors" placeholder="상세 설명" rows={3} />
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={()=>{const arr=[...(formData.career?.strengths||[]), {title:"", desc:""}]; updateNested(["career","strengths"], arr);}} className="min-h-[140px] flex flex-col items-center justify-center gap-2 border-2 border-dashed border-zinc-200 rounded-2xl text-zinc-400 hover:text-blue-500 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                        <Plus size={24} />
                        <span className="font-bold text-xs">강점 추가</span>
                    </button>
                </div>
              </div>
            </div>
          )}

          {/* ⭐️ ADD PROFILE TAB */}
          {editTab === 'addProfile' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-indigo-50/50 p-5 rounded-3xl border border-indigo-100 shadow-sm">
                     <div>
                       <h4 className="text-sm font-black text-indigo-800 flex items-center gap-1.5"><History size={16}/> Profile Version History</h4>
                       <p className="text-[10px] text-indigo-600/80 mt-1 font-bold">하단에 입력한 내용들을 특정 날짜를 기준으로 고정할 수 있습니다.</p>
                     </div>
                     <div className="flex flex-col w-full sm:w-auto gap-2">
                         <div className="flex items-center bg-white border border-indigo-200 rounded-xl overflow-hidden shadow-sm">
                             <div className="px-3 bg-indigo-50 text-indigo-500 border-r border-indigo-200 h-full flex items-center">
                                 <Calendar size={14}/>
                             </div>
                             <input 
                                type="date" 
                                value={formData.idol?.updatedAt || ''} 
                                onChange={e => updateNested(['idol', 'updatedAt'], e.target.value)}
                                className="px-3 py-2 text-xs font-bold text-zinc-800 outline-none w-full sm:w-32"
                             />
                         </div>
                         <button onClick={handleCommitProfile} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-indigo-700 transition flex items-center justify-center gap-1.5">
                            현재 기록 고정하기
                         </button>
                     </div>
                  </div>

                  {(formData.idol?.history?.length > 0) && (
                      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                          <button 
                              type="button"
                              onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                              className="w-full flex items-center justify-between px-4 py-3 bg-zinc-50 hover:bg-zinc-100 transition-colors outline-none"
                          >
                              <span className="text-[11px] font-black text-zinc-600 tracking-widest flex items-center gap-1.5">
                                  <History size={14}/> 고정된 이전 기록 ({formData.idol.history.length}개)
                              </span>
                              <ChevronDown size={14} className={`text-zinc-400 transition-transform ${isHistoryExpanded ? 'rotate-180' : ''}`} />
                          </button>
                          
                          {isHistoryExpanded && (
                              <div className="p-3 border-t border-zinc-200 flex flex-wrap gap-2 max-h-40 overflow-y-auto bg-white">
                                  {formData.idol.history.map((h, i) => (
                                      <div key={h.id || i} className="shrink-0 bg-white border border-zinc-200 rounded-lg py-1.5 pl-3 pr-2 flex items-center gap-2 shadow-sm group">
                                          <button type="button" onClick={() => setViewHistoryItem(h)} className="text-[10px] font-black text-indigo-500 hover:text-indigo-700 hover:underline">
                                            {h.date} 기록 확인
                                          </button>
                                          <button type="button" onClick={() => {
                                              const arr = [...formData.idol.history];
                                              arr.splice(i, 1);
                                              updateNested(['idol', 'history'], arr);
                                          }} className="text-zinc-300 hover:text-rose-500 transition-colors ml-1"><CloseIcon size={12}/></button>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>
                  )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 1. Identity & Info */}
                  <div className="md:col-span-1 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-zinc-100 space-y-4">
                      <h3 className="text-base font-black text-zinc-900 mb-4 flex items-center gap-2"><UserPlus size={16} className="text-rose-400"/> Identity & Info</h3>
                      
                      <div className="flex flex-col items-center justify-center mb-6">
                          <div className="w-40 h-56 sm:w-48 sm:h-64 rounded-3xl bg-zinc-50 border border-zinc-200 overflow-hidden relative group shadow-inner">
                              {isExtraImageUploading && (
                                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20 backdrop-blur-[1px]">
                                      <Loader2 size={24} className="text-rose-500 animate-spin" />
                                  </div>
                              )}
                              {formData.idol?.extraImage ? (
                                  <img src={formData.idol?.extraImage} alt="Extra Profile" className="w-full h-full object-cover" />
                              ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300 bg-zinc-100">
                                      <ImageIcon size={32} />
                                  </div>
                              )}
                              <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-[1px]">
                                  <Upload size={20} className="mb-2" />
                                  <span className="text-[8px] font-bold">사진 추가/변경</span>
                                  <input type="file" accept="image/*" onChange={handleExtraImageUpload} className="hidden" disabled={isExtraImageUploading} />
                              </label>
                          </div>
                          <span className="text-[10px] font-bold text-zinc-400 mt-3">추가 프로필 사진</span>
                      </div>

                      <div className="space-y-4">
                          {renderInput("MBTI / Personality", ["idol", "mbti"], "예: ESTP")}
                          <div className="grid grid-cols-2 gap-3">
                              {renderInput("혈액형", ["idol", "bloodType"], "예: O형")}
                              {renderInput("키", ["idol", "height"], "예: 175cm")}
                          </div>
                          {renderInput("종교", ["idol", "religion"], "예: 무교")}
                          {renderInput("연애 여부", ["idol", "relationship"], "예: 비혼, 연애 중")}
                          {renderInput("사용하는 언어", ["idol", "languages"], "예: 한국어, 일본어")}
                      </div>
                  </div>

                  {/* 2. Lifestyle & Tastes */}
                  <div className="md:col-span-2 space-y-4">
                      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-zinc-200/60">
                          <h3 className="text-base font-black text-zinc-900 mb-5 flex items-center gap-2"><Compass size={16} className="text-blue-500"/> Lifestyle & Work</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {renderInput("좌우명", ["idol", "motto"], "예: 피할 수 없으면 즐겨라")}
                              {renderInput("최근 취미", ["idol", "recentHobby"], "예: 클라이밍, 베이킹")}
                              {renderInput("Working Style", ["idol", "workingStyle"], "예: 올빼미족")}
                              {renderInput("활동 시간대", ["idol", "activeHours"], "예: 저녁 8시 ~ 새벽 2시")}
                              
                              <div className="sm:col-span-2">
                                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5">연락 가능 여부</label>
                                  <div className="flex bg-zinc-50 border border-zinc-200 rounded-xl p-1 gap-1 max-w-sm">
                                      {['적극', '중간', '소극'].map(status => (
                                          <button
                                              key={status}
                                              type="button"
                                              onClick={() => updateNested(["idol", "contact"], status)}
                                              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.idol?.contact === status ? 'bg-white shadow-sm text-violet-600 border border-zinc-200/50' : 'text-zinc-500 hover:bg-zinc-100'}`}
                                          >
                                              {status}
                                          </button>
                                      ))}
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-zinc-200/60 h-full">
                          <h3 className="text-base font-black text-zinc-900 mb-5 flex items-center gap-2"><Heart size={16} className="text-rose-500"/> My Tastes</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="p-4 bg-zinc-50/80 rounded-2xl border border-zinc-100">
                                {renderArrayInput("Hobbies & Interests", ["idol", "tastes", "hobbies"], "입력 후 Enter")}
                              </div>
                              <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100/50">
                                {renderArrayInput("Culture (Music/Movies)", ["idol", "tastes", "culture"], "입력 후 Enter")}
                              </div>
                              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                                {renderArrayInput("Food & Drink", ["idol", "tastes", "foods"], "입력 후 Enter")}
                              </div>
                              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                                {renderArrayInput("Lifestyle & Places", ["idol", "tastes", "lifestyle"], "입력 후 Enter")}
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
            </div>
          )}

          {/* ⭐️ BUSINESS CARD TAB */}
          {editTab === 'businessCard' && (
            <div className="space-y-6 animate-in fade-in">
                <div className="bg-zinc-50 rounded-3xl p-6 md:p-10 border border-zinc-200/80 shadow-inner flex flex-col items-center justify-center">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6">Live Card Preview</p>
                    {renderBusinessCardUI(formData.idol?.businessCard, formData.name)}
                </div>

                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-100">
                    <h3 className="text-base font-black text-zinc-900 mb-5 flex items-center gap-2"><CreditCard size={16} className="text-emerald-500"/> 명함 정보 편집</h3>
                    
                    <div className="mb-6">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">명함 테마 스타일</label>
                        <div className="flex gap-2">
                            {['dark', 'light', 'gradient', 'glass'].map(t => (
                                <button 
                                    key={t}
                                    type="button"
                                    onClick={() => updateNested(["idol", "businessCard", "template"], t)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize border shadow-sm ${formData.idol?.businessCard?.template === t ? 'border-zinc-800 ring-2 ring-zinc-800 ring-offset-1 bg-zinc-800 text-white' : 'border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {renderInput("소속 (Company / Team)", ["idol", "businessCard", "company"], "소속명")}
                        {renderInput("직책 (Position / Role)", ["idol", "businessCard", "position"], "직책")}
                        {renderInput("이메일 (Email)", ["idol", "businessCard", "email"], "이메일 주소")}
                        {renderInput("연락처 (Phone)", ["idol", "businessCard", "phone"], "전화번호")}
                        <div className="sm:col-span-2">
                            {renderInput("개인 웹사이트 (Website / Link)", ["idol", "businessCard", "website"], "웹사이트 링크")}
                        </div>
                        <div className="sm:col-span-2">
                            {renderInput("위치 (Address / Location)", ["idol", "businessCard", "address"], "사무실 주소 또는 활동 지역")}
                        </div>
                    </div>
                </div>
            </div>
          )}

          {/* Q&A TAB */}
          {editTab === 'qna' && (
            <div className="animate-in fade-in p-6 md:p-8 bg-white rounded-3xl border border-zinc-100 shadow-sm">
                <h3 className="text-base font-black text-zinc-900 mb-1 flex items-center gap-2"><MessageSquare size={16} className="text-violet-500"/> 100문 100답 작성</h3>
                <p className="text-[11px] text-zinc-500 font-medium mb-5">나만의 엉뚱하고 재미있는 질문과 답변을 추가해보세요.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(formData.qna || []).map((item, idx) => (
                      <div key={idx} className="flex flex-col gap-2.5 bg-violet-50/30 p-5 rounded-2xl border border-violet-100/50 relative group transition-colors hover:bg-violet-50">
                          <button type="button" onClick={()=>{const arr=[...(formData.qna||[])]; arr.splice(idx,1); updateNested(["qna"], arr);}} className="absolute top-4 right-4 text-violet-300 hover:text-rose-500 bg-white border border-violet-100 p-1.5 rounded-lg transition-colors z-10"><Trash2 size={12}/></button>
                          
                          <div>
                            <label className="text-[9px] font-black text-violet-400 uppercase tracking-widest mb-1 block">Question</label>
                            <input value={item.q} onChange={e => { const arr=[...(formData.qna||[])]; arr[idx].q=e.target.value; updateNested(["qna"], arr); }} className="w-full bg-white border border-violet-200 rounded-xl px-3 py-2 text-xs font-bold text-violet-900 outline-none focus:border-violet-400 pr-10 transition-colors" placeholder="예: 무인도에 가져갈 3가지는?" />
                          </div>
                          <div>
                            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1 block">Answer</label>
                            <textarea value={item.a} onChange={e => { const arr=[...(formData.qna||[])]; arr[idx].a=e.target.value; updateNested(["qna"], arr); }} className="w-full bg-white border border-violet-200 rounded-xl px-3 py-2 text-[11px] font-medium text-zinc-800 outline-none focus:border-violet-400 resize-none transition-colors" placeholder="답변을 작성하세요" rows={2} />
                          </div>
                      </div>
                  ))}
                  
                  <button type="button" onClick={()=>{const arr=[...(formData.qna||[]), {q:"", a:""}]; updateNested(["qna"], arr);}} className="min-h-[140px] flex flex-col items-center justify-center gap-2 border-2 border-dashed border-violet-200 rounded-2xl text-violet-400 hover:text-violet-600 hover:border-violet-400 hover:bg-violet-50 transition-colors">
                      <Plus size={24} />
                      <span className="font-bold text-xs">새로운 Q&A 추가</span>
                  </button>
                </div>
            </div>
          )}

          {/* HOBBY TAB */}
          {editTab === 'hobby' && (
            <div className="animate-in fade-in p-6 md:p-8 bg-white rounded-3xl shadow-sm border border-zinc-100">
                <h3 className="text-base font-black text-zinc-900 mb-1 flex items-center gap-2"><Target size={16} className="text-amber-500"/> 취미 소개 섹션</h3>
                <p className="text-[11px] text-zinc-500 font-medium mb-5">나를 가장 잘 나타내는 취미 하나를 깊게 소개해보세요.</p>
                
                <div className="bg-amber-50/30 p-5 rounded-2xl border border-amber-100/50 space-y-5">
                  {renderInput("취미 제목 (Headline)", ["hobby", "title"], "예: 필름 카메라와 골목길 산책")}
                  
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-amber-100">
                      <div className="w-24 h-24 rounded-xl bg-zinc-100 overflow-hidden flex items-center justify-center shrink-0 border border-zinc-200 relative group shadow-inner">
                          {isHobbyImageUploading && (
                              <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-20 backdrop-blur-[1px]">
                                  <Loader2 size={16} className="text-amber-500 animate-spin mb-1" />
                              </div>
                          )}
                          {formData.hobby?.image ? <img src={formData.hobby.image} alt="Hobby" className="w-full h-full object-cover"/> : <ImageIcon className="text-zinc-300" size={24}/>}
                          
                          <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-[1px]">
                              <Upload size={16} className="mb-1" />
                              <span className="text-[8px] font-bold">업로드</span>
                              <input type="file" accept="image/*" onChange={handleHobbyImageUpload} className="hidden" disabled={isHobbyImageUploading} />
                          </label>
                      </div>
                      <div className="flex-1 w-full space-y-2">
                          <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest block">배경 이미지 소스</label>
                          <div className="flex bg-amber-100/50 p-0.5 rounded-lg w-max mb-1">
                              <button type="button" onClick={() => setHobbyImageInputType('file')} className={`px-3 py-1 text-[10px] font-bold rounded-md transition ${hobbyImageInputType === 'file' ? 'bg-white shadow-sm text-amber-700' : 'text-amber-600 hover:bg-amber-200/50'}`}>파일 업로드</button>
                              <button type="button" onClick={() => setHobbyImageInputType('url')} className={`px-3 py-1 text-[10px] font-bold rounded-md transition ${hobbyImageInputType === 'url' ? 'bg-white shadow-sm text-amber-700' : 'text-amber-600 hover:bg-amber-200/50'}`}>웹 URL</button>
                          </div>
                          {hobbyImageInputType === 'file' ? (
                              <p className="text-[10px] font-medium text-zinc-500 bg-zinc-50 p-2 rounded-lg border border-zinc-100">좌측 이미지를 클릭하여 PC의 파일을 업로드하세요.</p>
                          ) : (
                              <input type="text" placeholder="https://..." value={formData.hobby?.image || ''} onChange={e => updateNested(["hobby", "image"], e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-400 transition-colors" />
                          )}
                      </div>
                  </div>
                  
                  <div>
                      <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-1.5">상세 설명 (Description)</label>
                      <textarea value={formData.hobby?.description || ''} onChange={e => updateNested(["hobby", "description"], e.target.value)} rows={3} className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2.5 text-xs font-medium outline-none focus:border-amber-400 resize-none transition-colors" placeholder="이 취미를 왜 좋아하는지, 어떤 매력이 있는지 적어주세요." />
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl border border-amber-100">
                    {renderArrayInput("관련 키워드 (Tags)", ["hobby", "keywords"], "키워드 입력 후 Enter")}
                  </div>
                </div>
            </div>
          )}

          {/* VISION TAB (Mandalart) */}
          {editTab === 'vision' && (
             <div className="animate-in fade-in">
                 {renderMandalartEditor()}
             </div>
          )}

          {/* QUOTES TAB */}
          {editTab === 'quotes' && (
            <div className="animate-in fade-in p-6 md:p-8 bg-white rounded-3xl border border-zinc-100 shadow-sm">
                <h3 className="text-base font-black text-zinc-900 mb-1 flex items-center gap-2"><Quote size={16} className="text-slate-400"/> 좋아하는 명언 모음</h3>
                <p className="text-[11px] text-zinc-500 font-medium mb-5">나에게 영감을 주는 문장이나 좌우명을 기록해두세요.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {(formData.quotes || []).map((item, idx) => (
                      <div key={idx} className="flex flex-col gap-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm relative group transition-colors hover:bg-white">
                          <button type="button" onClick={()=>{const arr=[...(formData.quotes||[])]; arr.splice(idx,1); updateNested(["quotes"], arr);}} className="absolute top-3 right-3 text-slate-300 hover:text-rose-500 bg-white border border-slate-100 p-1 rounded-lg transition-colors z-10"><Trash2 size={12}/></button>
                          
                          <textarea 
                            value={item.text} 
                            onChange={e => { const arr=[...(formData.quotes||[])]; arr[idx].text=e.target.value; updateNested(["quotes"], arr); }} 
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none resize-none focus:border-slate-400 pr-8 transition-colors" 
                            placeholder="명언 내용" 
                            rows={3}
                          />
                          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 focus-within:border-slate-400 transition-colors">
                            <span className="text-[10px] font-black text-slate-300">-</span>
                            <input 
                              value={item.author} 
                              onChange={e => { const arr=[...(formData.quotes||[])]; arr[idx].author=e.target.value; updateNested(["quotes"], arr); }} 
                              className="flex-1 bg-transparent text-[11px] font-bold text-slate-600 outline-none" 
                              placeholder="작성자 또는 출처" 
                            />
                          </div>
                      </div>
                  ))}
                  
                  <button type="button" onClick={()=>{const arr=[...(formData.quotes||[]), {text:"", author:""}]; updateNested(["quotes"], arr);}} className="min-h-[130px] flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:text-slate-600 hover:border-slate-400 hover:bg-slate-50 transition-colors">
                      <Plus size={24} />
                      <span className="font-bold text-xs">새 명언 추가</span>
                  </button>
                </div>
            </div>
          )}
        </div>

        {/* ⭐️ 미리보기 모달 부분 시작 */}
        {showPreview && (
          <div className="fixed inset-0 bg-zinc-950/80 z-[200] overflow-y-auto p-4 md:p-8 flex flex-col items-center animate-in fade-in backdrop-blur-sm">
            <div className="w-full max-w-[1000px] bg-[#F0F2F5] rounded-3xl shadow-2xl relative overflow-hidden flex flex-col min-h-[80vh]">
              
              <div className="bg-white px-6 py-4 flex justify-between items-center border-b border-zinc-200 sticky top-0 z-50">
                <h3 className="font-black text-sm md:text-base text-zinc-800 flex items-center gap-2">
                  <Eye size={16} className="text-violet-500" />
                  저장 전 미리보기
                </h3>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowPreview(false)} className="px-3 py-2 bg-zinc-100 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-200 transition shadow-sm">돌아가기</button>
                  <button 
                    type="button"
                    onClick={() => { setShowPreview(false); handleSave(); }} 
                    className="px-3 py-2 bg-violet-600 rounded-xl text-xs font-bold text-white hover:bg-violet-700 shadow-sm flex items-center gap-1.5 transition"
                  >
                    <Save size={14} /> 이대로 저장
                  </button>
                </div>
              </div>

              {/* 미리보기 화면 */}
              <div className="flex-1 overflow-y-auto pb-10">
                {formData.status && (
                  <div className="mx-4 md:mx-10 mt-6 mb-2 flex relative z-10">
                      <div className="inline-flex items-center gap-1.5 bg-white border border-zinc-200 text-zinc-800 px-3 py-1.5 rounded-2xl shadow-sm">
                          <Sparkles size={14} className="text-yellow-500" />
                          <span className="text-[11px] font-bold tracking-wider">{formData.status}</span>
                      </div>
                  </div>
                )}

                <div className={`mx-4 md:mx-10 bg-white rounded-3xl p-5 md:p-8 shadow-sm relative z-20 border border-zinc-100 ${!formData.status ? 'mt-6' : ''}`}>
                  <div className="flex flex-col md:flex-row gap-4 md:gap-10 items-stretch">
                    
                    <div className="flex-1 flex flex-col min-w-0 pr-4 md:pr-0">
                      <div className="flex flex-row md:flex-row gap-4 items-center md:items-start">
                        <div className="w-20 h-20 md:w-32 md:h-32 shrink-0 bg-zinc-50 rounded-2xl overflow-hidden border border-zinc-200 shadow-inner">
                          {formData.profileImageUrl ? (
                              <img src={formData.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                              <div className="w-full h-full flex items-center justify-center text-3xl font-black text-zinc-300">
                                {formData.name ? formData.name.charAt(0) : '?'}
                              </div>
                          )}
                        </div>
                        
                        <div className="flex-1 flex flex-col justify-center min-w-0">
                          <h2 className="text-xl md:text-3xl font-black text-zinc-900 mb-0.5 truncate">{formData.name || '이름 없음'}</h2>
                          <p className="text-[10px] md:text-sm font-bold text-violet-600 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-md inline-block w-max mb-2 shadow-sm">@{formData.handle || 'handle'}</p>
                          
                          <div className="space-y-1 md:space-y-2">
                            <div className="flex items-center gap-1.5 text-[11px] md:text-sm font-medium text-zinc-600 truncate">
                              <Briefcase size={12} className="text-zinc-400 shrink-0"/> {formData.role || '소속 미입력'}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] md:text-sm font-medium text-zinc-600 truncate">
                              <GraduationCap size={12} className="text-zinc-400 shrink-0"/> {formData.major || '전공 미입력'}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] md:text-sm font-medium text-zinc-600 truncate">
                              <MapPin size={12} className="text-zinc-400 shrink-0"/> {formData.location || '지역 미입력'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="hidden md:block w-px bg-zinc-100 my-2"></div>

                    <div className="flex-1 flex flex-col justify-center md:pl-2 mt-2 md:mt-0">
                      <Quote size={16} className="text-violet-300 mb-1.5 md:mb-3"/>
                      <p className="text-xs md:text-base text-zinc-800 font-bold leading-relaxed mb-3 md:mb-6">
                        "{formData.bio || '한 줄 소개'}"
                      </p>
                      <div className="flex flex-wrap gap-1.5 md:gap-2">
                          {(formData.tags || []).map(tag => (
                            <span key={tag} className="px-2.5 py-1 bg-zinc-50 border border-zinc-200 text-zinc-600 text-[9px] md:text-xs font-bold rounded-lg cursor-default shadow-sm">#{tag}</span>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>

                {availablePreviewTabs.length > 0 && (
                  <React.Fragment>
                    <div className="mt-6 md:mt-8 px-4 md:px-10">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3 className="text-sm md:text-lg font-black text-zinc-900 tracking-tight">데이터 탐색</h3>
                      </div>
                      <p className="text-[10px] md:text-xs text-zinc-500 font-medium mb-2">미리보기에서는 선택된 탭 하나만 렌더링됩니다.</p>
                      
                      <div className="flex gap-2.5 md:gap-4 overflow-x-auto scrollbar-hide pt-2 pb-4">
                        {availablePreviewTabs.map(tab => (
                            <button 
                              key={tab.id} onClick={() => setPreviewTab(tab.id)} 
                              className={`flex flex-col items-center gap-1.5 shrink-0 group outline-none`}
                            >
                              <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center relative transition-all duration-300 border ${previewTab === tab.id ? 'bg-violet-50 text-violet-500 border-violet-200 shadow-md scale-105' : 'bg-white border-zinc-200 text-zinc-400 shadow-sm group-hover:scale-105 group-hover:border-zinc-300'}`}>
                                {React.cloneElement(tab.icon, { className: 'w-5 h-5' })}
                              </div>
                              <span className={`text-[9px] md:text-[10px] font-black ${previewTab === tab.id ? 'text-zinc-900' : 'text-zinc-400'}`}>{tab.label}</span>
                            </button>
                        ))}
                      </div>
                    </div>

                    <div className="mx-4 md:mx-10 mt-2 animate-in fade-in duration-300">
                      {previewTab === 'developer' && (
                          <div className="grid grid-cols-1 gap-4">
                              <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100">
                                <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><User size={14}/> About Me</h4>
                                <p className="text-xs text-zinc-700 leading-relaxed font-medium whitespace-pre-line">{formData.developer?.about || '-'}</p>
                              </div>
                          </div>
                      )}
                      {previewTab === 'career' && (
                          <div className="grid grid-cols-1 gap-4">
                              <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100">
                                <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Target size={14}/> Target Job</h4>
                                <p className="text-lg font-black text-blue-600">{formData.career?.targetJob || '-'}</p>
                              </div>
                          </div>
                      )}
                      {/* ⭐️ Add Profile Preview */}
                      {previewTab === 'addProfile' && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
                              <div className="md:col-span-1 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-100 h-full flex flex-col">
                                  <div className="w-40 h-56 sm:w-48 sm:h-64 mx-auto rounded-3xl overflow-hidden mb-5 border border-zinc-100 shadow-sm relative group bg-zinc-50 flex flex-col items-center justify-center">
                                      {formData.idol?.extraImage ? (
                                          <img src={formData.idol.extraImage} alt="Extra Profile" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                      ) : (
                                          <ImageIcon size={32} className="text-zinc-200" />
                                      )}
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                          <span className="text-white font-black tracking-widest text-sm drop-shadow-md">IDENTITY</span>
                                      </div>
                                  </div>
                                  <div className="space-y-2">
                                      <div className="flex justify-between items-center bg-rose-50/50 p-3 rounded-xl border border-rose-100/50"><span className="text-[10px] font-bold text-rose-400">MBTI</span><span className="text-xs font-black text-zinc-800">{formData.idol?.mbti || '-'}</span></div>
                                      <div className="flex justify-between items-center bg-rose-50/50 p-3 rounded-xl border border-rose-100/50"><span className="text-[10px] font-bold text-rose-400">Blood Type</span><span className="text-xs font-black text-zinc-800">{formData.idol?.bloodType || '-'}</span></div>
                                      <div className="flex justify-between items-center bg-rose-50/50 p-3 rounded-xl border border-rose-100/50"><span className="text-[10px] font-bold text-rose-400">Height</span><span className="text-xs font-black text-zinc-800">{formData.idol?.height || '-'}</span></div>
                                  </div>
                              </div>
                              <div className="md:col-span-2 flex flex-col gap-4 md:gap-5">
                                  <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-100">
                                      <h4 className="text-[11px] md:text-xs font-black text-zinc-400 uppercase tracking-widest mb-5 flex items-center gap-1.5"><Compass size={14}/> Lifestyle & Work</h4>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                          <div className="flex flex-col bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 gap-1.5 sm:col-span-2">
                                            <span className="text-[10px] font-bold text-blue-400">Motto (좌우명)</span>
                                            <span className="text-sm font-black text-zinc-800">{formData.idol?.motto || '-'}</span>
                                          </div>
                                          <div className="flex flex-col bg-zinc-50 p-4 rounded-xl border border-zinc-200/60 gap-1.5">
                                            <span className="text-[10px] font-bold text-zinc-400">Recent Hobby</span>
                                            <span className="text-xs font-black text-zinc-800">{formData.idol?.recentHobby || '-'}</span>
                                          </div>
                                          <div className="flex flex-col bg-zinc-50 p-4 rounded-xl border border-zinc-200/60 gap-1.5">
                                            <span className="text-[10px] font-bold text-zinc-400">Working Style</span>
                                            <span className="text-xs font-black text-zinc-800">{formData.idol?.workingStyle || '-'}</span>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      )}
                      
                      {/* ⭐️ Business Card Preview */}
                      {previewTab === 'businessCard' && (
                          <div className="py-10">
                              {renderBusinessCardUI(formData.idol?.businessCard, formData.name)}
                          </div>
                      )}

                      {previewTab === 'qna' && (
                          <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100">
                              <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-1.5"><MessageSquare size={14}/> Q&A ({formData.qna?.length || 0}개)</h4>
                          </div>
                      )}
                      {previewTab === 'hobby' && (
                          <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 overflow-hidden">
                              <div className="h-32 bg-zinc-100 relative"><img src={formData.hobby?.image} className="w-full h-full object-cover" alt="hobby"/></div>
                          </div>
                      )}
                      {previewTab === 'vision' && renderVisionPreview()}
                      {previewTab === 'quotes' && (
                          <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100">
                              <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5"><Quote size={14}/> Quotes ({formData.quotes?.length || 0}개)</h4>
                          </div>
                      )}
                    </div>
                  </React.Fragment>
                )}

                {availablePreviewTabs.length === 0 && (
                   <div className="mx-4 md:mx-10 py-16 flex flex-col items-center justify-center bg-white rounded-3xl border border-zinc-100 shadow-sm mt-6">
                       <div className="w-12 h-12 bg-zinc-50 flex items-center justify-center rounded-full mb-3 shadow-inner"><Lock size={20} className="text-zinc-300" /></div>
                       <h3 className="text-sm font-black text-zinc-800">모든 탭 비공개</h3>
                   </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

export default EditProfileView;