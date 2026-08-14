import React, { useState, useEffect } from 'react';
import { 
  Save, Eye, Lock, Trash2, Image as ImageIcon, Upload, AtSign, ExternalLink, Loader2,
  Code, Briefcase, HeartHandshake, User, Sparkles, GraduationCap, MapPin, Target, ArrowRight, Heart, MessageSquare, X as CloseIcon,
  Terminal, Quote, Palette, Compass, Link as LinkIcon, Edit2, Plus
} from 'lucide-react';
import { useAppStore } from '../store/AppStore';

const EditProfileView = () => {
  const { setViewMode, user, showToast, fetchAllData, apiFetch } = useAppStore();
  
  const [formData, setFormData] = useState(() => {
    const safeUser = JSON.parse(JSON.stringify(user || {}));
    const qnaData = safeUser.qna?.length ? safeUser.qna : (safeUser.idol?.qna || []);
    
    let parsedPrivacy = { developer: false, career: false, idol: false, qna: false, hobby: false, vision: false, quotes: false };
    if (safeUser.privacy) {
        if (typeof safeUser.privacy === 'string') {
            try { parsedPrivacy = { ...parsedPrivacy, ...JSON.parse(safeUser.privacy) }; } catch(e) { }
        } else if (typeof safeUser.privacy === 'object') {
            parsedPrivacy = { ...parsedPrivacy, ...safeUser.privacy };
        }
    }

    return {
      ...safeUser,
      profileImageUrl: safeUser.profileImageUrl || '',
      privacy: parsedPrivacy,
      developer: safeUser.developer || { techStack: {}, projects: [], learning: [], about: "" },
      career: safeUser.career || { targetJob: "", techStack: [], interests: [], strengths: [], careerGoals: {} },
      idol: safeUser.idol || { nickname: "", birthday: "", age: "", specialty: "", hobbies: "", favorites: {}, qna: [] },
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

  const [isCheckingHandle, setIsCheckingHandle] = useState(false);
  const [isHandleAvailable, setIsHandleAvailable] = useState(true);

  const [showPreview, setShowPreview] = useState(false);
  const [previewTab, setPreviewTab] = useState('developer');

  const ALL_TABS = [
    { id: 'developer', label: 'Developer', icon: <Code size={16}/> },
    { id: 'career', label: 'Career', icon: <Briefcase size={16}/> },
    { id: 'idol', label: 'Idol', icon: <HeartHandshake size={16}/> },
    { id: 'qna', label: 'Q&A', icon: <MessageSquare size={16}/> },
    { id: 'hobby', label: 'Hobby', icon: <Palette size={16}/> },
    { id: 'vision', label: 'Mandalart', icon: <Compass size={16}/> },
    { id: 'quotes', label: 'Quotes', icon: <Quote size={16}/> }
  ];

  const isTabPrivate = (tabId) => {
      const val = formData.privacy?.[tabId];
      return String(val).toLowerCase() === 'false' || String(val) === '0';
  };
  
  const availablePreviewTabs = ALL_TABS.filter(tab => !isTabPrivate(tab.id));

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

  const uploadImageToServer = async (file, path) => {
    setIsLoading(true);
    const fileData = new FormData();
    fileData.append("file", file);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      
      const res = await fetch('https://api.cravelog.me/api/v1/files/upload', {
        method: 'POST',
        body: fileData,
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      const data = await res.json();
      
      if (res.ok) {
        const fullImageUrl = `https://api.cravelog.me${data.imageUrl}`;
        updateNested(path, fullImageUrl); 
        showToast("이미지가 성공적으로 업로드되었습니다.");
      } else {
        showToast("이미지 업로드에 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
      showToast("서버와 연결할 수 없습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) uploadImageToServer(file, ["profileImageUrl"]);
  };

  const handleHobbyImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) uploadImageToServer(file, ["hobby", "image"]);
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
    
    if (!/^[a-z0-9._-]+$/.test(formData.handle)) {
        return showToast('아이디는 영문 소문자, 숫자, 마침표(.), 밑줄(_), 하이픈(-)만 가능합니다.');
    }
    if (!isHandleAvailable && formData.handle !== user.handle) {
        return showToast('아이디 중복 확인을 진행해주세요.');
    }

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
    
    // ⭐️ 편집 화면에서도 에러를 완벽 방지하는 방어 코드
    const str = Array.isArray(rawValue) 
        ? rawValue.join(',') 
        : (rawValue ? String(rawValue) : '');
        
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
    const arr = path.reduce((o, i) => (o || {})[i] || [], formData);
    
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
            className="w-10 focus:w-28 px-3 py-1.5 bg-white border border-dashed border-zinc-300 focus:border-solid focus:border-violet-400 text-xs font-bold text-zinc-700 outline-none rounded-full transition-all text-center focus:text-left placeholder:text-zinc-400 focus:placeholder:text-transparent shadow-sm"
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
      <div className="w-full">
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
    // 미리보기에서도 만다라트는 동일한 컴포넌트 형태 유지 (입력만 불가하게)
    return (
        <div className="opacity-80 pointer-events-none">
            {renderMandalartEditor()}
        </div>
    );
  };

  return (
    <React.Fragment>
      <div className="max-w-[1000px] mx-auto w-full p-4 md:p-10 md:pt-6 animate-in fade-in duration-300 pb-28 md:pb-10 overflow-y-auto">
        <header className="mb-6 flex justify-between items-center">
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
              disabled={isLoading}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5 ${isLoading ? 'bg-violet-400 text-white/80 cursor-not-allowed' : 'bg-violet-600 text-white hover:bg-violet-700'}`}
            >
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
              {isLoading ? '저장 중...' : '저장 완료'}
            </button>
          </div>
        </header>

        {/* 1. 메인 프로필 설정 영역 */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-100 mb-6">
          <div className="flex flex-col md:flex-row gap-6 md:gap-10">
            
            {/* 프로필 이미지 변경 (스레드 스타일 원형) */}
            <div className="shrink-0 flex flex-col items-center">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-zinc-50 border border-zinc-200 shadow-inner overflow-hidden relative group">
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
                         <input type="file" accept="image/*" onChange={handleProfileImageUpload} className="hidden" />
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
            
            {/* 기본 정보 입력 */}
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
                
                {/* ⭐️ 스레드 스타일의 키워드 입력 공간 */}
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
                                    <option value="blog">Blog/Web</option>
                                    <option value="instagram">Instagram</option>
                                    <option value="facebook">Facebook</option>
                                    <option value="x">X</option>
                                    <option value="steam">Steam</option>
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

        {/* 2. 세부 탭 편집 제어 영역 */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4 p-1">
          {ALL_TABS.map(tab => (
              <button 
                key={tab.id} 
                onClick={() => setEditTab(tab.id)} 
                className={`shrink-0 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap border ${editTab === tab.id ? 'bg-zinc-900 text-white border-zinc-900 shadow-md' : 'bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50'}`}
              >
                {React.cloneElement(tab.icon, { size: 14 })} {tab.label}
              </button>
          ))}
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

        {/* 3. 탭별 편집 컨텐츠 */}
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

          {/* IDOL TAB */}
          {editTab === 'idol' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-zinc-100 space-y-4">
                      <h3 className="text-base font-black text-zinc-900 mb-4 flex items-center gap-2"><Sparkles size={16} className="text-rose-400"/> Profile Info</h3>
                      <div>
                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest pl-1 block mb-1">Nickname</label>
                        <input type="text" value={formData.idol?.nickname || ''} onChange={e => updateNested(["idol", "nickname"], e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold text-zinc-800 outline-none focus:border-rose-300 transition-colors" placeholder="별명" />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest pl-1 block mb-1">Birthday</label>
                        <input type="text" value={formData.idol?.birthday || ''} onChange={e => updateNested(["idol", "birthday"], e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold text-zinc-800 outline-none focus:border-rose-300 transition-colors" placeholder="생일" />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest pl-1 block mb-1">Age</label>
                        <input type="text" value={formData.idol?.age || ''} onChange={e => updateNested(["idol", "age"], e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold text-zinc-800 outline-none focus:border-rose-300 transition-colors" placeholder="나이" />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest pl-1 block mb-1">Specialty</label>
                        <input type="text" value={formData.idol?.specialty || ''} onChange={e => updateNested(["idol", "specialty"], e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold text-zinc-800 outline-none focus:border-rose-300 transition-colors" placeholder="특기" />
                      </div>
                  </div>

                  <div className="md:col-span-2 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-zinc-100">
                      <h3 className="text-base font-black text-zinc-900 mb-5 flex items-center gap-2"><Heart size={16} className="text-rose-500"/> Favorites</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">{renderArrayInput("Colors", ["idol", "favorites", "colors"])}</div>
                          <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100/50">{renderArrayInput("Foods", ["idol", "favorites", "foods"])}</div>
                          <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">{renderArrayInput("Games", ["idol", "favorites", "games"])}</div>
                          <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">{renderArrayInput("Music", ["idol", "favorites", "music"])}</div>
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
                          {formData.hobby?.image ? <img src={formData.hobby.image} alt="Hobby" className="w-full h-full object-cover"/> : <ImageIcon className="text-zinc-300" size={24}/>}
                          <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-[1px]">
                              <Upload size={16} className="mb-1" />
                              <span className="text-[8px] font-bold">업로드</span>
                              <input type="file" accept="image/*" onChange={handleHobbyImageUpload} className="hidden" />
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

        {/* 미리보기 모달 */}
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

              {/* ⭐️ 미리보기 화면 (새로운 프로필 뷰 디자인 반영) */}
              <div className="flex-1 overflow-y-auto pb-10">
                {/* 1. 상태 메시지 배지 */}
                {formData.status && (
                  <div className="mx-4 md:mx-10 mt-6 mb-2 flex relative z-10">
                      <div className="inline-flex items-center gap-1.5 bg-white border border-zinc-200 text-zinc-800 px-3 py-1.5 rounded-2xl shadow-sm">
                          <Sparkles size={14} className="text-yellow-500" />
                          <span className="text-[11px] font-bold tracking-wider">{formData.status}</span>
                      </div>
                  </div>
                )}

                {/* 2. 메인 프로필 명함 (미리보기) */}
                <div className={`mx-4 md:mx-10 bg-white rounded-3xl p-5 md:p-8 shadow-sm relative z-20 border border-zinc-100 ${!formData.status ? 'mt-6' : ''}`}>
                  <div className="flex flex-col md:flex-row gap-4 md:gap-10 items-stretch">
                    
                    {/* 좌측: 주요 정보 */}
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

                    {/* 우측: 자기소개 및 태그 */}
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
                      {previewTab === 'idol' && (
                          <div className="grid grid-cols-1 gap-4">
                              <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100">
                                <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Sparkles size={14}/> Profile Info</h4>
                                <p className="text-xs font-bold text-zinc-700">{formData.idol?.nickname || '-'}</p>
                              </div>
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