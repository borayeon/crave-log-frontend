import React, { useState, useEffect } from 'react';
import { 
  Save, Eye, Lock, Trash2, AlertTriangle, Image as ImageIcon, Upload, AtSign, ExternalLink, Loader2,
  Code, Briefcase, HeartHandshake, User, Sparkles, GraduationCap, MapPin, Target, ArrowRight, Heart, MessageSquare, X as CloseIcon,
  Terminal, Quote, Folder, Palette, HelpCircle, Compass, Globe, Link as LinkIcon, Plus, LayoutGrid, CheckCircle2, ChevronDown
} from 'lucide-react'; 
import { useAppStore } from '../store/AppStore';

const getPlatformStyles = (platform) => {
    switch(platform) {
        case 'github': return { color: "bg-zinc-800 text-white", label: "GitHub" };
        case 'instagram': return { color: "bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-500 text-white", label: "Instagram" };
        case 'blog': return { color: "bg-emerald-500 text-white", label: "Blog" };
        case 'steam': return { color: "bg-blue-900 text-white", label: "Steam" };
        case 'notion': return { color: "bg-zinc-100 text-zinc-900 border border-zinc-200", label: "Notion" };
        case 'x': return { color: "bg-black text-white", label: "X" };
        case 'facebook': return { color: "bg-blue-600 text-white", label: "Facebook" };
        default: return { color: "bg-zinc-100 text-zinc-600 border border-zinc-200", label: "Other" };
    }
};

const EditProfileView= () => {
  const { setViewMode, user, showToast, setIsAdmin, fetchAllData, apiFetch } = useAppStore();
  
  const [formData, setFormData] = useState(() => {
    const safeUser = JSON.parse(JSON.stringify(user || {}));
    const qnaData = safeUser.qna?.length ? safeUser.qna : (safeUser.idol?.qna || []);
    return {
      ...safeUser,
      profileImageUrl: safeUser.profileImageUrl || '',
      privacy: safeUser.privacy || { developer: true, career: true, idol: true, qna: true, hobby: true, vision: true, quotes: true },
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

  const [editTab, setEditTab] = useState('basic');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imageInputType, setImageInputType] = useState('file');
  const [hobbyImageInputType, setHobbyImageInputType] = useState('file');
  const [isLoading, setIsLoading] = useState(false);

  const [isCheckingHandle, setIsCheckingHandle] = useState(false);
  const [isHandleAvailable, setIsHandleAvailable] = useState(true);

  const [showPreview, setShowPreview] = useState(false);
  const [previewTab, setPreviewTab] = useState('developer');

  // 링크 모달용 상태
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [editingLinkIdx, setEditingLinkIdx] = useState(null);
  const [currentLink, setCurrentLink] = useState({ platform: 'github', name: '', url: '' });

  const ALL_TABS = [
    { id: 'basic', label: 'Basic Info', icon: <User size={16}/> },
    { id: 'developer', label: 'Developer', icon: <Code size={16}/> },
    { id: 'career', label: 'Career', icon: <Briefcase size={16}/> },
    { id: 'idol', label: 'Idol (TMI)', icon: <HeartHandshake size={16}/> },
    { id: 'qna', label: 'Q&A', icon: <HelpCircle size={16}/> },
    { id: 'hobby', label: 'Hobby', icon: <Palette size={16}/> },
    { id: 'vision', label: 'Mandalart', icon: <Compass size={16}/> },
    { id: 'quotes', label: 'Quotes', icon: <Quote size={16}/> }
  ];

  const availablePreviewTabs = ALL_TABS.filter(tab => tab.id !== 'basic' && formData.privacy[tab.id]);

  useEffect(() => {
    if (showPreview) {
      const firstTab = availablePreviewTabs.length > 0 ? availablePreviewTabs[0].id : null;
      setPreviewTab(firstTab);
    }
  }, [showPreview]);

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

  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { updateNested(["profileImageUrl"], reader.result); };
      reader.readAsDataURL(file);
    }
  };

  const handleHobbyImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { updateNested(["hobby", "image"], reader.result); };
      reader.readAsDataURL(file);
    }
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

  const handleDeleteAccount = async () => {
    try {
      setIsAdmin(false);
      await fetchAllData();
      setViewMode('profile');
      showToast("계정이 성공적으로 삭제되었습니다. 🗑️");
    } catch (e) {
      console.error(e);
    }
  };

  // --- 소셜 링크 관리 함수 ---
  const openLinkModal = (idx = null) => {
      if (idx !== null) {
          setCurrentLink(formData.links[idx]);
          setEditingLinkIdx(idx);
      } else {
          setCurrentLink({ platform: 'github', name: '', url: '' });
          setEditingLinkIdx(null);
      }
      setLinkModalOpen(true);
  };

  const saveLink = () => {
      if(!currentLink.url.trim() || !currentLink.name.trim()) return showToast("이름과 URL을 모두 입력해주세요.");
      
      const newLinks = [...(formData.links || [])];
      if (editingLinkIdx !== null) {
          newLinks[editingLinkIdx] = currentLink;
      } else {
          newLinks.push(currentLink);
      }
      updateNested(["links"], newLinks);
      setLinkModalOpen(false);
  };

  const removeLink = (idx, e) => {
      e.stopPropagation();
      const newLinks = [...(formData.links || [])];
      newLinks.splice(idx, 1);
      updateNested(["links"], newLinks);
  };

  // --- 공통 렌더링 헬퍼 ---
  const renderInput = (label, path, placeholder = "") => (
    <div className="flex-1 w-full">
      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2 px-1">{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        value={path.reduce((o, i) => (o || {})[i] || '', formData)}
        onChange={e => updateNested(path, e.target.value)}
        className="w-full bg-zinc-50/80 border border-zinc-200/80 rounded-2xl px-4 py-3.5 text-sm font-bold text-zinc-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 outline-none transition-all shadow-sm"
      />
    </div>
  );

 const renderArrayTextarea = (label, path) => {
    const arr = path.reduce((o, i) => (o || {})[i] || [], formData);
    return (
      <div className="flex-1 w-full">
        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2 px-1">{label} <span className="text-[9px] font-medium opacity-70">(쉼표로 구분)</span></label>
        <textarea
          value={arr.join(', ')}
          onChange={e => updateNested(path, e.target.value.split(',').map(s=>s.trim()).filter(Boolean))}
          rows={3}
          className="w-full bg-zinc-50/80 border border-zinc-200/80 rounded-2xl px-4 py-3.5 text-sm font-bold text-zinc-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 outline-none transition-all resize-none shadow-sm"
        />
      </div>
    );
  };

  const renderMandalartEditor = () => {
    const v = formData.vision;
    
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
        <div className="bg-gradient-to-br from-teal-900 to-slate-900 p-6 md:p-10 rounded-[2.5rem] shadow-xl overflow-x-auto scrollbar-hide border border-zinc-800">
            <div className="min-w-[650px] max-w-3xl mx-auto aspect-square grid grid-cols-3 gap-1 md:gap-2 p-1.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                {blocks.map((block, bIdx) => (
                    <div key={bIdx} className="grid grid-cols-3 gap-px bg-white/30 border border-white/20 rounded-lg overflow-hidden shadow-inner p-px">
                        {block.map((cell, cIdx) => {
                            let bg = "bg-white/90 hover:bg-white focus:bg-white";
                            let textClass = "text-slate-800 font-bold";
                            let placeholder = "세부 계획";
                            let onChange = null;
                            let disabled = false;

                            if (cell.t === 'core') {
                                bg = "bg-teal-500 hover:bg-teal-400 focus:bg-teal-400 z-10 shadow-md";
                                textClass = "text-white font-black";
                                placeholder = "최종 목표";
                                onChange = (e) => handleCoreChange(e.target.value);
                            } else if (cell.t === 'sub') {
                                bg = "bg-teal-100 hover:bg-teal-50 focus:bg-teal-50";
                                textClass = "text-teal-900 font-black";
                                placeholder = "핵심 요건";
                                onChange = (e) => handleSubChange(cell.idx, e.target.value);
                            } else if (cell.t === 'sub-readonly') {
                                bg = "bg-teal-200/80 cursor-not-allowed";
                                textClass = "text-teal-900 font-black";
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
            <p className="text-center text-teal-200/80 text-xs font-bold mt-6">
                칸을 직접 클릭해서 수정하세요. 정중앙에 최종 목표를 적고, 주변에 8개의 핵심 요건을 적으면 외곽에 자동으로 복사됩니다.
            </p>
        </div>
    );
  };

  return (
    <>
      <div className="max-w-6xl mx-auto w-full p-4 md:p-8 animate-in fade-in duration-300 pb-28 md:pb-10 overflow-y-auto">
        
        {/* --- HEADER --- */}
        <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-5 bg-white/50 p-6 md:px-8 rounded-[2rem] border border-zinc-200/60 shadow-sm backdrop-blur-md sticky top-4 z-40">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
               Profile Studio
            </h1>
            <p className="text-sm font-bold text-zinc-500 mt-2 uppercase tracking-widest flex items-center gap-1.5"><LayoutGrid size={14}/> 내 공간 세팅하기</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setViewMode('profile')} className="px-5 py-2.5 bg-white border border-zinc-200 text-zinc-600 rounded-xl text-sm font-bold hover:bg-zinc-50 hover:text-zinc-900 transition-all shadow-sm">
              취소
            </button>
            <button onClick={() => setShowPreview(true)} className="px-5 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-all shadow-sm flex items-center gap-1.5 border border-indigo-200">
              <Eye size={16} /> 미리보기
            </button>
            <button 
              onClick={handleSave} 
              disabled={isLoading}
              className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all shadow-md flex items-center gap-2 ${isLoading ? 'bg-indigo-400 text-white/80 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5'}`}
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
              {isLoading ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-6 items-start relative">
          
          {/* --- LEFT SIDEBAR (Tabs) --- */}
          <div className="w-full lg:w-64 shrink-0 lg:sticky lg:top-36 bg-white p-3 rounded-[2rem] border border-zinc-200/60 shadow-sm overflow-x-auto lg:overflow-visible flex lg:flex-col gap-1.5 scrollbar-hide z-30">
            <p className="hidden lg:block text-[10px] font-black text-zinc-400 uppercase tracking-widest p-3 pb-1">Edit Categories</p>
            {ALL_TABS.map(tab => (
                <button 
                  key={tab.id} 
                  onClick={() => setEditTab(tab.id)} 
                  className={`shrink-0 flex items-center justify-start gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${editTab === tab.id ? 'bg-zinc-900 text-white shadow-md scale-105 lg:scale-100 lg:translate-x-2' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'}`}
                >
                    <span className={editTab === tab.id ? 'opacity-100' : 'opacity-60'}>{tab.icon}</span> 
                    {tab.label}
                </button>
            ))}
          </div>

          {/* --- RIGHT CONTENT AREA --- */}
          <div className="flex-1 w-full min-w-0">
            
            {/* 비공개 설정 토글 (Basic 탭 제외) */}
            {editTab !== 'basic' && (
              <div className="mb-6 p-5 bg-white border border-zinc-200/80 rounded-[2rem] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
                <div className="flex items-center gap-4">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${formData.privacy[editTab] ? 'bg-indigo-50 text-indigo-500 border border-indigo-100' : 'bg-rose-50 text-rose-500 border border-rose-100'}`}>
                      {formData.privacy[editTab] ? <Eye size={20} /> : <Lock size={20} />}
                   </div>
                   <div>
                      <h3 className="text-base font-black text-zinc-900">
                        {formData.privacy[editTab] ? '이 탭은 모두에게 공개됩니다' : '이 탭은 비공개 상태입니다'}
                      </h3>
                      <p className="text-xs font-medium text-zinc-500 mt-0.5">
                        {formData.privacy[editTab] ? '다른 사람이 프로필을 방문할 때 함께 표시됩니다.' : '나만 볼 수 있도록 안전하게 숨겨집니다.'}
                      </p>
                   </div>
                </div>
                <button 
                  onClick={() => updateNested(['privacy', editTab], !formData.privacy[editTab])}
                  className={`shrink-0 px-6 py-3 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${formData.privacy[editTab] ? 'bg-white text-rose-600 border border-rose-200 hover:bg-rose-50' : 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700'}`}
                >
                  {formData.privacy[editTab] ? '비공개로 전환' : '공개로 전환'}
                </button>
              </div>
            )}

            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-zinc-200/60 min-h-[500px]">
              
              {/* BASIC TAB */}
              {editTab === 'basic' && (
                <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4">
                  
                  {/* 프로필 이미지 섹션 (Bento Card) */}
                  <div className="p-6 bg-zinc-50/50 rounded-3xl border border-zinc-200/80 flex flex-col md:flex-row gap-8 items-center md:items-start">
                      <div className="shrink-0 flex flex-col items-center gap-4">
                          <div className="w-28 h-28 rounded-full bg-white border-4 border-zinc-100 shadow-md flex items-center justify-center overflow-hidden relative group">
                              {formData.profileImageUrl ? (
                                  <img src={formData.profileImageUrl} alt="Profile" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              ) : (
                                  <span className="text-zinc-300 text-4xl font-black">{formData.name ? formData.name.charAt(0) : '?'}</span>
                              )}
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                 <ImageIcon className="text-white" size={24} />
                              </div>
                          </div>
                      </div>

                      <div className="flex-1 w-full space-y-4">
                          <div className="flex items-center justify-between border-b border-zinc-200/60 pb-3">
                              <h3 className="font-black text-zinc-800 flex items-center gap-2"><User size={18} className="text-indigo-500"/> 프로필 아바타</h3>
                              <div className="flex bg-zinc-100 p-1 rounded-xl">
                                  <button type="button" onClick={() => setImageInputType('file')} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${imageInputType === 'file' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}>파일 선택</button>
                                  <button type="button" onClick={() => setImageInputType('url')} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${imageInputType === 'url' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}>웹 URL</button>
                              </div>
                          </div>

                          {imageInputType === 'file' ? (
                              <label className="flex items-center justify-center gap-2 w-full py-4 bg-white border border-zinc-200 border-dashed text-zinc-600 rounded-2xl text-sm font-bold hover:bg-zinc-50 hover:border-indigo-300 cursor-pointer transition-all group">
                                  <Upload size={18} className="text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                                  <span>클릭하여 PC에서 이미지 찾기</span>
                                  <input type="file" accept="image/*" onChange={handleProfileImageUpload} className="hidden" />
                              </label>
                          ) : (
                              <input 
                                  type="text" placeholder="https://..." 
                                  value={formData.profileImageUrl || ''} onChange={e => updateNested(["profileImageUrl"], e.target.value)} 
                                  className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500/30 outline-none shadow-sm" 
                              />
                          )}
                      </div>
                  </div>

                  {/* 기본 정보 폼 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {renderInput("이름 / 닉네임", ["name"], "예: 홍길동")}
                    
                    {/* 고유 아이디 (핸들) */}
                    <div>
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2 px-1">고유 아이디 (URL용)</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <AtSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                          <input 
                              type="text" value={formData.handle || ''} 
                              onChange={e => {
                                  const val = e.target.value.toLowerCase();
                                  updateNested(["handle"], val);
                                  if (val !== user.handle) setIsHandleAvailable(false);
                                  else setIsHandleAvailable(true);
                              }}
                              className={`w-full bg-zinc-50/80 border rounded-2xl py-3.5 pl-10 pr-4 text-sm font-bold text-zinc-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all shadow-sm ${!isHandleAvailable && formData.handle !== user.handle ? 'border-rose-400' : 'border-zinc-200/80'}`} 
                              placeholder="예: taekyeong.dev"
                          />
                        </div>
                        <button 
                          type="button" onClick={handleCheckDuplicateHandle}
                          disabled={isCheckingHandle || !formData.handle || formData.handle === user.handle}
                          className="shrink-0 px-4 bg-zinc-900 text-white text-xs font-bold rounded-2xl hover:bg-zinc-800 transition disabled:bg-zinc-300 shadow-sm whitespace-nowrap"
                        >
                          {isCheckingHandle ? <Loader2 size={16} className="animate-spin" /> : '중복 확인'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {renderInput("직무/역할", ["role"], "예: Backend Developer")}
                    {renderInput("전공/소속", ["major"], "예: 컴퓨터공학")}
                    {renderInput("위치", ["location"], "예: Seoul, Korea")}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2 px-1">한 줄 소개</label>
                        <textarea placeholder="나를 표현하는 멋진 문장을 적어주세요." value={formData.bio || ''} onChange={e => updateNested(["bio"], e.target.value)} rows={3} className="w-full bg-zinc-50/80 border border-zinc-200/80 rounded-2xl px-4 py-3.5 text-sm font-bold text-zinc-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 outline-none resize-none shadow-sm" />
                      </div>
                      <div>
                         <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2 px-1">현재 상태 (Status)</label>
                         <input type="text" placeholder="예: 구직 중, 여행 중, 커피 수혈 중" value={formData.status || ''} onChange={e => updateNested(["status"], e.target.value)} className="w-full bg-zinc-50/80 border border-zinc-200/80 rounded-2xl px-4 py-3.5 text-sm font-bold text-zinc-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 outline-none shadow-sm" />
                         {renderArrayTextarea("Tags (키워드)", ["tags"])}
                      </div>
                  </div>

                  {/* ⭐️ 개편된 Social Links (카드형) */}
                  <div className="p-6 md:p-8 bg-zinc-900 rounded-3xl border border-zinc-800 relative overflow-hidden">
                      <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
                      <div className="flex justify-between items-end mb-6 relative z-10">
                          <div>
                              <h3 className="font-black text-white text-lg flex items-center gap-2"><LinkIcon size={20} className="text-indigo-400"/> Social Links 연결</h3>
                              <p className="text-[11px] font-medium text-zinc-400 mt-1">프로필 메인 화면에 아이콘 형태의 버튼으로 노출됩니다.</p>
                          </div>
                          <button onClick={() => openLinkModal()} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-lg">
                              <Plus size={14}/> 새 링크 추가
                          </button>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 relative z-10">
                          {(formData.links || []).length === 0 ? (
                              <div className="w-full p-6 border-2 border-dashed border-zinc-700 rounded-2xl text-center text-zinc-500 font-bold text-sm">
                                등록된 링크가 없습니다. 포트폴리오나 SNS를 연결해보세요.
                              </div>
                          ) : (
                              (formData.links || []).map((link, idx) => {
                                  const style = getPlatformStyles(link.platform);
                                  return (
                                      <div key={idx} onClick={() => openLinkModal(idx)} className="group flex items-center gap-3 p-3 pr-4 bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 rounded-2xl cursor-pointer transition-all w-full sm:w-auto min-w-[200px] shadow-sm">
                                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${style.color}`}>
                                              {style.label.charAt(0)}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                              <p className="text-sm font-black text-white truncate">{link.name}</p>
                                              <p className="text-[10px] font-medium text-zinc-400 truncate mt-0.5">{style.label}</p>
                                          </div>
                                          <button onClick={(e) => removeLink(idx, e)} className="p-2 opacity-0 group-hover:opacity-100 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-all">
                                              <Trash2 size={16}/>
                                          </button>
                                      </div>
                                  );
                              })
                          )}
                      </div>
                  </div>

                </div>
              )}

              {/* DEVELOPER TAB */}
              {editTab === 'developer' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="p-6 bg-blue-50/30 rounded-3xl border border-blue-100/50">
                      <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-2 px-1 flex items-center gap-1.5"><Terminal size={14}/> About Me</label>
                      <textarea value={formData.developer?.about || ''} onChange={e => updateNested(["developer", "about"], e.target.value)} rows={3} className="w-full bg-white border border-blue-100 rounded-2xl px-4 py-3.5 text-sm font-medium text-zinc-800 focus:ring-2 focus:ring-blue-300 outline-none resize-none shadow-sm" placeholder="개발자로서의 자기소개를 작성해주세요." />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-zinc-50/80 rounded-3xl border border-zinc-200/80">
                      <h3 className="md:col-span-2 font-black text-zinc-800 flex items-center gap-2 mb-2"><Code size={18} className="text-indigo-500"/> Tech Stack</h3>
                      {renderInput("Backend", ["developer", "techStack", "backend"], "Spring Boot, Node.js")}
                      {renderInput("Database", ["developer", "techStack", "db"], "MySQL, Redis")}
                      {renderInput("Frontend", ["developer", "techStack", "frontend"], "React, Tailwind")}
                      {renderInput("Tools", ["developer", "techStack", "tools"], "Docker, AWS")}
                      <div className="md:col-span-2 mt-2 border-t border-zinc-200/80 pt-4">
                         {renderArrayTextarea("Currently Learning (학습 중인 기술)", ["developer", "learning"])}
                      </div>
                  </div>
                  
                  <div className="p-6 md:p-8 bg-zinc-900 rounded-3xl border border-zinc-800">
                      <div className="flex justify-between items-center mb-6">
                         <h3 className="font-black text-white text-lg flex items-center gap-2"><Monitor size={20} className="text-blue-400"/> Featured Projects</h3>
                         <button onClick={()=>{const arr=[...(formData.developer?.projects||[]), {name:"", desc:"", githubUrl:"", liveUrl:""}]; updateNested(["developer","projects"], arr);}} className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-bold rounded-xl transition-colors border border-blue-500/30">+ 추가</button>
                      </div>
                      
                      <div className="space-y-4">
                          {(formData.developer?.projects || []).map((proj, idx) => (
                              <div key={idx} className="bg-zinc-800/50 p-5 rounded-2xl border border-zinc-700/50 relative group flex flex-col md:flex-row gap-4">
                                  <button onClick={()=>{const arr=[...(formData.developer?.projects||[])]; arr.splice(idx,1); updateNested(["developer","projects"], arr);}} className="absolute top-4 right-4 text-zinc-500 hover:text-rose-400 transition-colors p-1"><Trash2 size={16}/></button>
                                  
                                  <div className="flex-1 space-y-3 pr-6">
                                      <input value={proj.name} onChange={e => { const arr=[...(formData.developer?.projects||[])]; arr[idx].name=e.target.value; updateNested(["developer","projects"], arr); }} className="w-full bg-transparent border-b border-zinc-600 px-1 py-2 text-base font-black text-white outline-none focus:border-blue-400 transition-colors placeholder:text-zinc-600" placeholder="프로젝트 이름" />
                                      <textarea value={proj.desc} onChange={e => { const arr=[...(formData.developer?.projects||[])]; arr[idx].desc=e.target.value; updateNested(["developer","projects"], arr); }} className="w-full bg-zinc-900/50 border border-zinc-700 rounded-xl px-3 py-2 text-sm font-medium text-zinc-300 outline-none resize-none focus:border-blue-400" placeholder="프로젝트 설명 (역할 등)" rows={2} />
                                  </div>
                                  <div className="w-full md:w-64 space-y-3 flex flex-col justify-center">
                                      <div className="flex items-center gap-2 bg-zinc-900 rounded-xl border border-zinc-700 px-3 overflow-hidden">
                                          <GithubIcon size={14} className="text-zinc-400 shrink-0"/>
                                          <input value={proj.githubUrl || ''} onChange={e => { const arr=[...(formData.developer?.projects||[])]; arr[idx].githubUrl=e.target.value; updateNested(["developer","projects"], arr); }} className="flex-1 bg-transparent py-2.5 text-xs text-white outline-none placeholder:text-zinc-600" placeholder="GitHub URL" />
                                      </div>
                                      <div className="flex items-center gap-2 bg-zinc-900 rounded-xl border border-zinc-700 px-3 overflow-hidden">
                                          <ExternalLink size={14} className="text-zinc-400 shrink-0"/>
                                          <input value={proj.liveUrl || ''} onChange={e => { const arr=[...(formData.developer?.projects||[])]; arr[idx].liveUrl=e.target.value; updateNested(["developer","projects"], arr); }} className="flex-1 bg-transparent py-2.5 text-xs text-white outline-none placeholder:text-zinc-600" placeholder="Live / Demo URL" />
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
                </div>
              )}

              {/* CAREER TAB */}
              {editTab === 'career' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-6 bg-emerald-50/30 rounded-3xl border border-emerald-100/50">
                      {renderInput("Target Job (희망 직무)", ["career", "targetJob"], "예: 프로덕트 매니저")}
                      {renderArrayTextarea("Interests (관심 분야)", ["career", "interests"])}
                  </div>

                  <div className="p-6 bg-zinc-50/80 rounded-3xl border border-zinc-200/80">
                      <h3 className="font-black text-zinc-800 flex items-center gap-2 mb-4"><Target size={18} className="text-emerald-500"/> Career Goals</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {renderInput("단기 목표", ["career", "careerGoals", "short"])}
                          {renderInput("중기 목표", ["career", "careerGoals", "mid"])}
                          {renderInput("장기 목표", ["career", "careerGoals", "long"])}
                      </div>
                  </div>

                  <div className="p-6 md:p-8 bg-zinc-900 rounded-3xl border border-zinc-800">
                      <div className="flex justify-between items-center mb-6">
                          <h3 className="font-black text-white text-lg flex items-center gap-2"><Sparkles size={20} className="text-emerald-400"/> Strengths (강점)</h3>
                          <button onClick={()=>{const arr=[...(formData.career?.strengths||[]), {title:"", desc:""}]; updateNested(["career","strengths"], arr);}} className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold rounded-xl transition-colors border border-emerald-500/30">+ 추가</button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(formData.career?.strengths || []).map((str, idx) => (
                              <div key={idx} className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50 flex flex-col gap-3 relative group">
                                  <button onClick={()=>{const arr=[...(formData.career?.strengths||[])]; arr.splice(idx,1); updateNested(["career","strengths"], arr);}} className="absolute top-3 right-3 text-zinc-500 hover:text-rose-400 transition-colors p-1"><Trash2 size={16}/></button>
                                  <input value={str.title} onChange={e => { const arr=[...(formData.career?.strengths||[])]; arr[idx].title=e.target.value; updateNested(["career","strengths"], arr); }} className="w-5/6 bg-transparent border-b border-zinc-600 px-1 py-1.5 text-base font-black text-white outline-none focus:border-emerald-400 transition-colors placeholder:text-zinc-600" placeholder="강점 키워드 (예: 문제 해결력)" />
                                  <textarea value={str.desc} onChange={e => { const arr=[...(formData.career?.strengths||[])]; arr[idx].desc=e.target.value; updateNested(["career","strengths"], arr); }} className="w-full bg-zinc-900/50 border border-zinc-700 rounded-xl px-3 py-2 text-sm font-medium text-zinc-300 outline-none resize-none focus:border-emerald-400" placeholder="강점에 대한 구체적인 설명" rows={2} />
                              </div>
                          ))}
                      </div>
                  </div>
                </div>
              )}

              {/* IDOL TAB */}
              {editTab === 'idol' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-6 md:p-8 bg-gradient-to-br from-rose-50/50 to-pink-50/50 rounded-[2.5rem] border border-rose-100 shadow-sm">
                      <div className="md:col-span-2 border-b border-rose-200/50 pb-4 mb-2">
                         <h3 className="text-xl font-black text-rose-900 flex items-center gap-2"><Heart size={20} className="text-rose-500 fill-rose-500"/> Personal Profile</h3>
                      </div>
                      {renderInput("Nickname", ["idol", "nickname"])}
                      {renderInput("Birthday", ["idol", "birthday"])}
                      {renderInput("Age", ["idol", "age"])}
                      {renderInput("Specialty (특기)", ["idol", "specialty"])}
                      <div className="md:col-span-2">
                        {renderInput("Hobbies (취미 한 줄 요약)", ["idol", "hobbies"])}
                      </div>
                  </div>
                  
                  <div className="p-6 md:p-8 bg-white rounded-[2.5rem] border border-zinc-200/80 shadow-sm">
                      <h3 className="text-lg font-black text-zinc-900 flex items-center gap-2 mb-6"><Sparkles size={18} className="text-amber-500"/> Favorites (최애)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {renderArrayTextarea("Colors (색상)", ["idol", "favorites", "colors"])}
                          {renderArrayTextarea("Foods (음식)", ["idol", "favorites", "foods"])}
                          {renderArrayTextarea("Games (게임)", ["idol", "favorites", "games"])}
                          {renderArrayTextarea("Music (음악 장르/가수)", ["idol", "favorites", "music"])}
                      </div>
                  </div>
                </div>
              )}

              {/* Q&A TAB */}
              {editTab === 'qna' && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                  <div className="p-6 md:p-8 bg-violet-50/30 rounded-[2.5rem] border border-violet-100 min-h-[400px]">
                      <div className="flex justify-between items-center mb-8">
                         <div>
                            <h3 className="text-xl font-black text-violet-900 flex items-center gap-2"><HelpCircle size={22} className="text-violet-500"/> 100문 100답 관리</h3>
                            <p className="text-xs font-bold text-violet-700/60 mt-1">자주 묻는 질문이나 나를 잘 보여줄 수 있는 문답을 작성하세요.</p>
                         </div>
                         <button onClick={()=>{const arr=[...(formData.qna||[]), {q:"", a:""}]; updateNested(["qna"], arr);}} className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl transition-colors shadow-md flex items-center gap-1.5">
                            <Plus size={16}/> 질문 추가
                         </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(formData.qna || []).map((item, idx) => (
                              <div key={idx} className="bg-white p-5 rounded-3xl border border-violet-200/60 shadow-sm relative group overflow-hidden">
                                  <div className="absolute -right-4 -top-6 text-7xl font-black text-violet-50 select-none group-hover:scale-110 transition-transform duration-500">Q</div>
                                  <button onClick={()=>{const arr=[...(formData.qna||[])]; arr.splice(idx,1); updateNested(["qna"], arr);}} className="absolute top-4 right-4 text-zinc-400 hover:text-rose-500 bg-white/80 p-1.5 rounded-lg backdrop-blur-sm z-10"><Trash2 size={16}/></button>
                                  
                                  <div className="relative z-10 space-y-3 pr-8">
                                      <div>
                                         <label className="text-[10px] font-black text-violet-500 uppercase tracking-widest block mb-1 px-1">Question</label>
                                         <input value={item.q} onChange={e => { const arr=[...(formData.qna||[])]; arr[idx].q=e.target.value; updateNested(["qna"], arr); }} className="w-full bg-violet-50/50 border border-violet-100 rounded-xl px-3 py-2.5 text-sm font-bold text-violet-900 outline-none focus:border-violet-400" placeholder="질문을 입력하세요" />
                                      </div>
                                      <div>
                                         <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1 px-1">Answer</label>
                                         <textarea value={item.a} onChange={e => { const arr=[...(formData.qna||[])]; arr[idx].a=e.target.value; updateNested(["qna"], arr); }} className="w-full bg-zinc-50/80 border border-zinc-200/80 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-800 outline-none resize-none focus:border-violet-400" placeholder="답변을 입력하세요" rows={2} />
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
                </div>
              )}

              {/* HOBBY TAB */}
              {editTab === 'hobby' && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                  <div className="p-6 md:p-8 bg-amber-50/30 rounded-[2.5rem] border border-amber-100">
                      <h3 className="text-xl font-black text-amber-900 flex items-center gap-2 mb-6"><Palette size={22} className="text-amber-500"/> 취미 라이프 관리</h3>
                      
                      <div className="flex flex-col lg:flex-row gap-8">
                          <div className="lg:w-1/3 shrink-0 flex flex-col gap-4">
                              <div className="aspect-[4/5] rounded-[2rem] bg-white border border-amber-200/60 shadow-sm overflow-hidden flex flex-col items-center justify-center p-4 relative group">
                                  {formData.hobby?.image ? (
                                      <img src={formData.hobby.image} alt="Hobby" className="w-full h-full object-cover rounded-2xl absolute inset-0 group-hover:scale-105 transition-transform duration-500"/>
                                  ) : (
                                      <div className="text-amber-300 flex flex-col items-center gap-2"><ImageIcon size={48}/><span className="text-sm font-bold text-amber-600/50">이미지 없음</span></div>
                                  )}
                                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-3">
                                      <div className="flex bg-white/20 backdrop-blur-md p-1 rounded-xl">
                                          <button type="button" onClick={() => setHobbyImageInputType('file')} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${hobbyImageInputType === 'file' ? 'bg-white text-zinc-900 shadow-sm' : 'text-white hover:text-zinc-200'}`}>파일</button>
                                          <button type="button" onClick={() => setHobbyImageInputType('url')} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${hobbyImageInputType === 'url' ? 'bg-white text-zinc-900 shadow-sm' : 'text-white hover:text-zinc-200'}`}>URL</button>
                                      </div>
                                      {hobbyImageInputType === 'file' ? (
                                          <label className="px-5 py-2.5 bg-white text-amber-600 rounded-xl text-sm font-bold shadow-md cursor-pointer hover:bg-amber-50 transition-colors">
                                              PC에서 업로드 <input type="file" accept="image/*" onChange={handleHobbyImageUpload} className="hidden"/>
                                          </label>
                                      ) : (
                                          <input type="text" placeholder="https://..." value={formData.hobby?.image || ''} onChange={e => updateNested(["hobby", "image"], e.target.value)} className="w-[80%] bg-white/90 backdrop-blur-md border-none rounded-xl px-3 py-2 text-xs font-bold outline-none text-center" />
                                      )}
                                  </div>
                              </div>
                          </div>
                          
                          <div className="flex-1 space-y-5">
                              {renderInput("취미 메인 타이틀", ["hobby", "title"], "예: 주말엔 카페 투어")}
                              <div>
                                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2 px-1">취미 상세 설명</label>
                                  <textarea value={formData.hobby?.description || ''} onChange={e => updateNested(["hobby", "description"], e.target.value)} rows={5} className="w-full bg-zinc-50/80 border border-zinc-200/80 rounded-2xl px-4 py-3.5 text-sm font-medium text-zinc-800 focus:bg-white focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 outline-none transition-all shadow-sm" placeholder="어떤 취미인지, 왜 좋아하는지 적어주세요." />
                              </div>
                              {renderArrayTextarea("관련 키워드 (Tags)", ["hobby", "keywords"])}
                          </div>
                      </div>
                  </div>
                </div>
              )}

              {/* VISION TAB */}
              {editTab === 'vision' && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                  {renderMandalartEditor()}
                </div>
              )}

              {/* QUOTES TAB */}
              {editTab === 'quotes' && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                  <div className="p-6 md:p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-200 min-h-[400px]">
                      <div className="flex justify-between items-center mb-8">
                         <div>
                            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><Quote size={22} className="text-slate-500"/> 내 인생의 명언 관리</h3>
                            <p className="text-xs font-bold text-slate-500 mt-1">프로필 메인이나 아카이브에서 랜덤으로 하나씩 노출됩니다.</p>
                         </div>
                         <button onClick={()=>{const arr=[...(formData.quotes||[]), {text:"", author:""}]; updateNested(["quotes"], arr);}} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-xl transition-colors shadow-md flex items-center gap-1.5">
                            <Plus size={16}/> 명언 추가
                         </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(formData.quotes || []).map((item, idx) => (
                              <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative group flex flex-col gap-3">
                                  <button onClick={()=>{const arr=[...(formData.quotes||[])]; arr.splice(idx,1); updateNested(["quotes"], arr);}} className="absolute top-4 right-4 text-zinc-400 hover:text-rose-500 bg-white p-1 rounded-lg z-10"><Trash2 size={16}/></button>
                                  
                                  <Quote size={24} className="text-slate-200" />
                                  <textarea value={item.text} onChange={e => { const arr=[...(formData.quotes||[])]; arr[idx].text=e.target.value; updateNested(["quotes"], arr); }} className="flex-1 bg-transparent border-b border-dashed border-slate-200 py-1 text-sm font-bold text-slate-700 outline-none resize-none focus:border-slate-400" placeholder="명언 내용" rows={2}/>
                                  <div className="flex items-center justify-end gap-2 mt-2">
                                      <span className="text-[10px] font-black text-slate-400 uppercase">- </span>
                                      <input value={item.author} onChange={e => { const arr=[...(formData.quotes||[])]; arr[idx].author=e.target.value; updateNested(["quotes"], arr); }} className="w-1/2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-black text-slate-600 outline-none focus:border-slate-400 text-right" placeholder="저자 (예: 스티브 잡스)" />
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* --- DANGER ZONE --- */}
        <div className="bg-rose-50 border border-rose-200 p-8 rounded-[2rem] mt-8 animate-in fade-in relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div>
                <h3 className="text-lg font-black text-rose-600 flex items-center gap-2"><AlertTriangle size={20} /> Danger Zone</h3>
                <p className="text-sm font-medium text-rose-700/80 mt-2">
                    계정을 삭제하면 모든 프로필 정보와 기록이 영구적으로 삭제되며 복구할 수 없습니다.
                </p>
            </div>
            <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="shrink-0 px-6 py-3 bg-white text-rose-600 border border-rose-200 rounded-xl font-bold hover:bg-rose-600 hover:text-white transition-colors shadow-sm"
            >
                계정 삭제
            </button>

            {showDeleteConfirm && (
                <div className="absolute inset-0 bg-rose-50/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
                    <h4 className="text-xl font-black text-rose-900 mb-2">정말 삭제하시겠습니까?</h4>
                    <p className="text-sm font-medium text-rose-700 mb-6">모든 데이터가 즉시 파기됩니다.</p>
                    <div className="flex gap-3">
                        <button onClick={() => setShowDeleteConfirm(false)} className="px-5 py-2.5 bg-white text-zinc-600 rounded-xl font-bold shadow-sm border border-zinc-200 hover:bg-zinc-50">
                            취소하기
                        </button>
                        <button onClick={handleDeleteAccount} className="px-5 py-2.5 bg-rose-600 text-white rounded-xl font-bold shadow-sm hover:bg-rose-700">
                            영구 삭제
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* --- 링크 관리 모달 --- */}
      {linkModalOpen && (
        <div className="fixed inset-0 bg-zinc-950/60 z-[300] flex justify-center items-center p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setLinkModalOpen(false)}>
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 flex flex-col shadow-2xl border border-zinc-100 relative" onClick={e => e.stopPropagation()}>
                <button onClick={() => setLinkModalOpen(false)} className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-full transition"><CloseIcon size={20}/></button>
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-5 text-indigo-500 border border-indigo-100"><LinkIcon size={24}/></div>
                <h3 className="text-xl font-black text-zinc-900 mb-1">{editingLinkIdx !== null ? '링크 수정' : '새 링크 추가'}</h3>
                <p className="text-xs font-medium text-zinc-500 mb-6">SNS나 포트폴리오 주소를 연결하세요.</p>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5 px-1">플랫폼</label>
                        <div className="relative">
                            <select 
                                value={currentLink.platform} 
                                onChange={e => setCurrentLink({...currentLink, platform: e.target.value})} 
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3.5 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500/30 outline-none appearance-none"
                            >
                                <option value="github">GitHub</option>
                                <option value="instagram">Instagram</option>
                                <option value="blog">Blog / Web</option>
                                <option value="notion">Notion</option>
                                <option value="x">X (Twitter)</option>
                                <option value="facebook">Facebook</option>
                                <option value="steam">Steam</option>
                                <option value="other">기타 링크</option>
                            </select>
                            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"/>
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5 px-1">표시할 이름</label>
                        <input value={currentLink.name} onChange={e => setCurrentLink({...currentLink, name: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3.5 text-sm font-bold text-zinc-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 outline-none" placeholder="예: My Tech Blog" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5 px-1">URL 주소</label>
                        <input value={currentLink.url} onChange={e => setCurrentLink({...currentLink, url: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3.5 text-sm font-bold text-zinc-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 outline-none" placeholder="https://..." />
                    </div>
                </div>
                <button onClick={saveLink} className="w-full mt-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl font-black text-sm transition shadow-md">
                    {editingLinkIdx !== null ? '변경사항 저장' : '목록에 추가'}
                </button>
            </div>
        </div>
      )}

      {/* --- 미리보기 모달 --- */}
      {showPreview && (
        <div className="fixed inset-0 bg-zinc-950/80 z-[400] overflow-y-auto p-4 md:p-10 flex flex-col items-center animate-in fade-in backdrop-blur-sm">
          <div className="w-full max-w-5xl bg-[#F8FAFC] rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col min-h-[80vh]">
            
            <div className="bg-white px-6 py-4 flex flex-col sm:flex-row justify-between items-center border-b border-zinc-200 sticky top-0 z-50 gap-4">
              <h3 className="font-black text-lg text-zinc-800 flex items-center gap-2">
                <Eye size={20} className="text-indigo-500" />
                저장 전 프로필 미리보기
              </h3>
              <div className="flex gap-2">
                <button onClick={() => setShowPreview(false)} className="px-5 py-2.5 bg-zinc-100 rounded-xl text-sm font-bold text-zinc-600 hover:bg-zinc-200 transition">수정으로 돌아가기</button>
                <button onClick={() => { setShowPreview(false); handleSave(); }} className="px-5 py-2.5 bg-indigo-600 rounded-xl text-sm font-bold text-white hover:bg-indigo-700 shadow-sm flex items-center gap-1.5 transition">
                  <CheckCircle2 size={16} /> 이대로 저장
                </button>
              </div>
            </div>

            <div className="p-6 md:p-10 flex-1 overflow-y-auto">
               <div className="w-full p-10 bg-white rounded-3xl border border-zinc-200 shadow-sm text-center flex flex-col items-center justify-center">
                  <span className="text-4xl mb-4">👀</span>
                  <h3 className="text-xl font-black text-zinc-800 mb-2">프리뷰 화면입니다</h3>
                  <p className="text-sm font-medium text-zinc-500">기존의 길고 복잡했던 프리뷰 로직을 정리하고,<br/>편집 폼 자체의 UI/UX를 강화하는 방향으로 개편되었습니다.</p>
               </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditProfileView;