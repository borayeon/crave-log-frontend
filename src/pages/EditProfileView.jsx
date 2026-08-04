import React, { useState, useEffect } from 'react';
import { 
  Save, Eye, Lock, Trash2, AlertTriangle, Image as ImageIcon, Upload, AtSign, ExternalLink, Loader2,
  Code, Briefcase, HeartHandshake, User, Sparkles, GraduationCap, MapPin, Target, ArrowRight, Heart, MessageSquare, X as CloseIcon,
  Terminal, Quote, Folder, Palette, HelpCircle, Compass, Globe, Link as LinkIcon
} from 'lucide-react'; 
import { useAppStore } from '../store/AppStore';

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
  const [activeVisionTab, setActiveVisionTab] = useState(0);

  // 아이디 중복 확인 상태
  const [isCheckingHandle, setIsCheckingHandle] = useState(false);
  const [isHandleAvailable, setIsHandleAvailable] = useState(true);

  // 미리보기 모달 상태
  const [showPreview, setShowPreview] = useState(false);
  const [previewTab, setPreviewTab] = useState('developer');

  // 모든 탭 통합 관리
  const ALL_TABS = [
    { id: 'basic', label: '기본 정보', icon: null },
    { id: 'developer', label: 'Developer', icon: <Code size={14}/> },
    { id: 'career', label: 'Career', icon: <Briefcase size={14}/> },
    { id: 'idol', label: 'Idol (TMI)', icon: <HeartHandshake size={14}/> },
    { id: 'qna', label: 'Q&A', icon: <HelpCircle size={14}/> },
    { id: 'hobby', label: 'Hobby', icon: <Palette size={14}/> },
    { id: 'vision', label: 'Mandalart', icon: <Compass size={14}/> },
    { id: 'quotes', label: 'Quotes', icon: <Quote size={14}/> }
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
        showToast("성공적으로 저장되었습니다! 🎉 이제 갤러리도 채워보세요.");
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

  const renderInput = (label, path, placeholder = "") => (
    <div>
      <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        value={path.reduce((o, i) => (o || {})[i] || '', formData)}
        onChange={e => updateNested(path, e.target.value)}
        className="w-full mt-2 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none"
      />
    </div>
  );

  // ⭐️ 새롭게 도입된 세련된 태그(Chip) 입력 에디터
  const renderArrayInput = (label, path, placeholder = "엔터(Enter)로 추가") => {
    const arr = path.reduce((o, i) => (o || {})[i] || [], formData);
    
    return (
      <div>
        <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">{label}</label>
        <div className="w-full mt-2 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-indigo-500 transition-all min-h-[46px] items-center cursor-text" onClick={(e) => e.currentTarget.querySelector('input').focus()}>
          {arr.map((v, idx) => (
            <span key={idx} className="flex items-center gap-1 bg-white border border-zinc-200 text-zinc-700 text-[11px] font-bold px-2.5 py-1 rounded-md shadow-sm select-none">
              {v}
              <button type="button" onClick={(e) => {
                e.stopPropagation();
                const newArr = [...arr];
                newArr.splice(idx, 1);
                updateNested(path, newArr);
              }} className="text-zinc-400 hover:text-rose-500 ml-0.5">
                <CloseIcon size={12}/>
              </button>
            </span>
          ))}
          <input
            type="text"
            placeholder={arr.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[120px] bg-transparent outline-none text-sm font-bold text-zinc-800"
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const val = e.target.value.trim();
                if (val && !arr.includes(val)) {
                  updateNested(path, [...arr, val]);
                }
                e.target.value = '';
              } else if (e.key === 'Backspace' && e.target.value === '' && arr.length > 0) {
                // 백스페이스로 태그 지우기 기능
                const newArr = [...arr];
                newArr.pop();
                updateNested(path, newArr);
              }
            }}
            onBlur={e => {
              const val = e.target.value.trim();
              if (val && !arr.includes(val)) {
                updateNested(path, [...arr, val]);
              }
              e.target.value = '';
            }}
          />
        </div>
      </div>
    );
  };

  // ⭐️ 백엔드/프론트엔드 기술스택(콤마로 이어져있는 문자열) 전용 태그 에디터
  const renderStringArrayInput = (label, path, placeholder = "엔터(Enter)로 추가") => {
    const str = path.reduce((o, i) => (o || {})[i] || '', formData);
    const arr = str ? str.split(',').map(s => s.trim()).filter(Boolean) : [];
    
    return (
      <div>
        <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">{label}</label>
        <div className="w-full mt-2 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-indigo-500 transition-all min-h-[46px] items-center cursor-text" onClick={(e) => e.currentTarget.querySelector('input').focus()}>
          {arr.map((v, idx) => (
            <span key={idx} className="flex items-center gap-1 bg-white border border-zinc-200 text-zinc-700 text-[11px] font-bold px-2.5 py-1 rounded-md shadow-sm select-none">
              {v}
              <button type="button" onClick={(e) => {
                e.stopPropagation();
                const newArr = [...arr];
                newArr.splice(idx, 1);
                updateNested(path, newArr.join(', '));
              }} className="text-zinc-400 hover:text-rose-500 ml-0.5">
                <CloseIcon size={12}/>
              </button>
            </span>
          ))}
          <input
            type="text"
            placeholder={arr.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[120px] bg-transparent outline-none text-sm font-bold text-zinc-800"
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const val = e.target.value.trim();
                if (val && !arr.includes(val)) {
                  updateNested(path, [...arr, val].join(', '));
                }
                e.target.value = '';
              } else if (e.key === 'Backspace' && e.target.value === '' && arr.length > 0) {
                const newArr = [...arr];
                newArr.pop();
                updateNested(path, newArr.join(', '));
              }
            }}
            onBlur={e => {
              const val = e.target.value.trim();
              if (val && !arr.includes(val)) {
                updateNested(path, [...arr, val].join(', '));
              }
              e.target.value = '';
            }}
          />
        </div>
      </div>
    );
  };

  // 만다라트 9x9 그리드 에디터 
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
        <div className="bg-gradient-to-br from-teal-900 to-slate-900 p-6 md:p-10 rounded-[2.5rem] shadow-xl overflow-x-auto scrollbar-hide">
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
      <div className="max-w-5xl mx-auto w-full p-4 md:p-10 animate-in fade-in duration-300 pb-28 md:pb-10 overflow-y-auto">
        <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight">Setup Profile</h1>
            <p className="text-sm font-bold text-zinc-400 mt-1 uppercase tracking-widest">내 공간 만들기</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setViewMode('profile')} className="px-4 py-2 bg-white border border-zinc-200 text-zinc-600 rounded-xl text-sm font-bold hover:bg-zinc-50 transition shadow-sm">
              취소
            </button>
            <button onClick={() => setShowPreview(true)} className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded-xl text-sm font-bold hover:bg-zinc-200 transition shadow-sm flex items-center gap-1.5 border border-zinc-200">
              <Eye size={16} /> 미리보기
            </button>
            <button 
              onClick={handleSave} 
              disabled={isLoading}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition shadow-sm flex items-center gap-2 ${isLoading ? 'bg-indigo-400 text-white/80 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
              {isLoading ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </header>

        {/* 탭 메뉴 */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6 p-1 bg-zinc-100/50 rounded-2xl border border-zinc-200/50">
          {ALL_TABS.map(tab => (
              <button key={tab.id} onClick={() => setEditTab(tab.id)} className={`shrink-0 flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl text-sm font-black transition-all whitespace-nowrap ${editTab === tab.id ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/60' : 'text-zinc-400 hover:text-zinc-600 hover:bg-white/50'}`}>
                  {tab.icon} {tab.label}
              </button>
          ))}
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-200/60 mb-8">
          
          {/* 비공개 설정 (기본 탭 제외) */}
          {editTab !== 'basic' && (
            <div className="mb-8 p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in">
              <div>
                <h3 className="text-sm font-black text-indigo-900 flex items-center gap-2">
                  {formData.privacy[editTab] ? <Eye size={16} className="text-indigo-600"/> : <Lock size={16} className="text-rose-500"/>}
                  이 탭을 다른 사람에게 공개하시겠습니까?
                </h3>
                <p className="text-xs font-medium text-indigo-700/70 mt-1">
                  비공개로 설정하면 공유된 프로필 링크에서 해당 탭이 완전히 숨겨집니다.
                </p>
              </div>
              <button 
                onClick={() => updateNested(['privacy', editTab], !formData.privacy[editTab])}
                className={`shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${formData.privacy[editTab] ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700' : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'}`}
              >
                {formData.privacy[editTab] ? '공개 중 (클릭하여 숨기기)' : '비공개 됨 (클릭하여 공개)'}
              </button>
            </div>
          )}

          {/* BASIC TAB */}
          {editTab === 'basic' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
              {renderInput("이름", ["name"], "예: 홍길동")}
              
              {/* 고유 아이디 및 중복 확인 */}
              <div>
                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">고유 아이디 (URL 및 검색용)</label>
                <div className="flex gap-2 mt-2">
                  <div className="relative flex-1">
                    <AtSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input 
                        type="text" 
                        value={formData.handle || ''} 
                        onChange={e => {
                            const val = e.target.value.toLowerCase();
                            updateNested(["handle"], val);
                            if (val !== user.handle) setIsHandleAvailable(false);
                            else setIsHandleAvailable(true);
                        }}
                        className={`w-full bg-zinc-50 border rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-colors ${!isHandleAvailable && formData.handle !== user.handle ? 'border-rose-400' : 'border-zinc-200'}`} 
                        placeholder="예: taekyeong.dev"
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={handleCheckDuplicateHandle}
                    disabled={isCheckingHandle || !formData.handle || formData.handle === user.handle}
                    className="shrink-0 px-4 py-3 bg-zinc-900 text-white text-sm font-bold rounded-xl hover:bg-zinc-800 transition disabled:bg-zinc-400 flex items-center justify-center min-w-[90px] shadow-sm whitespace-nowrap"
                  >
                    {isCheckingHandle ? <Loader2 size={16} className="animate-spin" /> : '중복 확인'}
                  </button>
                </div>
                <p className={`text-[10px] font-medium pl-1 mt-1.5 ${!isHandleAvailable && formData.handle !== user.handle ? 'text-rose-500' : 'text-zinc-400'}`}>
                    {!isHandleAvailable && formData.handle !== user.handle 
                        ? '아이디 중복 확인이 필요합니다.' 
                        : '영문 소문자, 숫자, 마침표(.), 밑줄(_), 하이픈(-) 허용'}
                </p>
              </div>
              
              {/* 프로필 이미지 */}
              <div className="md:col-span-2 p-5 bg-zinc-50/50 rounded-2xl border border-zinc-100">
                  <div className="flex items-center justify-between mb-4">
                      <label className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                          <ImageIcon size={14} className="text-zinc-400" /> 프로필 이미지
                      </label>
                      <div className="flex bg-zinc-100 p-0.5 rounded-lg">
                          <button type="button" onClick={() => setImageInputType('file')} className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition ${imageInputType === 'file' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}>파일 업로드</button>
                          <button type="button" onClick={() => setImageInputType('url')} className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition ${imageInputType === 'url' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}>웹 URL</button>
                      </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-5">
                      <div className="w-20 h-20 rounded-2xl bg-white border border-zinc-200 overflow-hidden shrink-0 flex items-center justify-center shadow-sm">
                          {formData.profileImageUrl ? (
                              <img src={formData.profileImageUrl} alt="Profile preview" className="w-full h-full object-cover" />
                          ) : (
                              <span className="text-zinc-400 text-xs font-black">{formData.name ? formData.name.charAt(0) : '?'}</span>
                          )}
                      </div>

                      <div className="flex-1 w-full">
                          {imageInputType === 'file' ? (
                              <div className="flex flex-col gap-2">
                                  <label className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-white border border-zinc-200 text-zinc-700 rounded-xl text-sm font-bold hover:bg-zinc-50 cursor-pointer shadow-sm transition-all group">
                                      <Upload size={16} className="text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                                      <span>PC에서 파일 찾기</span>
                                      <input 
                                          type="file" 
                                          accept="image/*" 
                                          onChange={handleProfileImageUpload} 
                                          className="hidden" 
                                      />
                                  </label>
                              </div>
                          ) : (
                              <input 
                                  type="text" 
                                  placeholder="https://..." 
                                  value={formData.profileImageUrl || ''} 
                                  onChange={e => updateNested(["profileImageUrl"], e.target.value)} 
                                  className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm" 
                              />
                          )}
                      </div>
                  </div>
              </div>

              {renderInput("직무/역할", ["role"], "예: Backend Developer")}
              {renderInput("전공/소속", ["major"], "예: 컴퓨터공학")}
              {renderInput("위치", ["location"], "예: Seoul, Korea")}
              {renderInput("현재 상태", ["status"], "예: 구직 중, 여행 중")}
              
              <div className="md:col-span-2">
                  <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">한 줄 소개</label>
                  <textarea placeholder="나를 표현하는 멋진 문장을 적어주세요." value={formData.bio || ''} onChange={e => updateNested(["bio"], e.target.value)} rows={2} className="w-full mt-2 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>

              {/* 소셜 링크 입력 폼 */}
              <div className="md:col-span-2 p-6 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-4">
                  <div>
                      <h3 className="font-black text-zinc-800 flex items-center gap-2"><LinkIcon size={16} className="text-indigo-500"/> Social Links</h3>
                      <p className="text-[10px] font-bold text-zinc-500 mt-1">프로필 메인 화면에 아이콘 형태의 버튼으로 노출됩니다.</p>
                  </div>
                  
                  <div className="space-y-3">
                      {(formData.links || []).map((link, idx) => (
                          <div key={idx} className="flex flex-col sm:flex-row gap-2 items-center bg-white p-3 rounded-xl border border-zinc-200 shadow-sm relative">
                              <select 
                                  value={link.platform} 
                                  onChange={e => { const arr=[...(formData.links||[])]; arr[idx].platform=e.target.value; updateNested(["links"], arr); }} 
                                  className="w-full sm:w-32 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm font-bold outline-none"
                              >
                                  <option value="github">GitHub</option>
                                  <option value="blog">Blog/Web</option>
                                  <option value="instagram">Instagram</option>
                                  <option value="facebook">Facebook</option>
                                  <option value="x">X (Twitter)</option>
                                  <option value="steam">Steam</option>
                                  <option value="notion">Notion</option>
                                  <option value="other">기타</option>
                              </select>
                              <input 
                                  value={link.name} 
                                  onChange={e => { const arr=[...(formData.links||[])]; arr[idx].name=e.target.value; updateNested(["links"], arr); }} 
                                  className="w-full sm:w-1/3 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm font-medium outline-none" 
                                  placeholder="표시할 이름" 
                              />
                              <input 
                                  value={link.url} 
                                  onChange={e => { const arr=[...(formData.links||[])]; arr[idx].url=e.target.value; updateNested(["links"], arr); }} 
                                  className="w-full flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm font-medium outline-none" 
                                  placeholder="https://..." 
                              />
                              <button onClick={()=>{const arr=[...(formData.links||[])]; arr.splice(idx,1); updateNested(["links"], arr);}} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg shrink-0">
                                  <Trash2 size={16}/>
                              </button>
                          </div>
                      ))}
                  </div>
                  <button onClick={()=>{const arr=[...(formData.links||[]), {platform:"github", name:"", url:""}]; updateNested(["links"], arr);}} className="text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2.5 rounded-xl hover:bg-indigo-100 transition-colors w-full md:w-auto mt-2">
                      + 링크 추가
                  </button>
              </div>

              {/* ⭐️ 새로운 Chip 형태의 태그 에디터 적용 영역 */}
              <div className="md:col-span-2">{renderArrayInput("Tags (나를 표현하는 키워드)", ["tags"], "키워드 입력 후 Enter")}</div>
              <div className="md:col-span-2">{renderArrayInput("Current Goals (현재 목표)", ["goals"], "목표 입력 후 Enter")}</div>
            </div>
          )}

          {/* DEVELOPER TAB */}
          {editTab === 'developer' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                  <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">About Me (소개)</label>
                  <textarea value={formData.developer?.about || ''} onChange={e => updateNested(["developer", "about"], e.target.value)} rows={3} className="w-full mt-2 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <h3 className="md:col-span-2 font-black text-zinc-800">Tech Stack</h3>
                  {/* ⭐️ 기술 스택에 String 배열 형태의 Chip 에디터 적용 */}
                  {renderStringArrayInput("Backend", ["developer", "techStack", "backend"], "기술 입력 후 Enter")}
                  {renderStringArrayInput("Database", ["developer", "techStack", "db"], "기술 입력 후 Enter")}
                  {renderStringArrayInput("Frontend", ["developer", "techStack", "frontend"], "기술 입력 후 Enter")}
                  {renderStringArrayInput("Tools", ["developer", "techStack", "tools"], "기술 입력 후 Enter")}
              </div>
              
              {renderArrayInput("Currently Learning (학습 중인 기술)", ["developer", "learning"], "기술 입력 후 Enter")}
              
              <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-4">
                  <h3 className="font-black text-zinc-800">Featured Projects</h3>
                  <p className="text-[10px] text-zinc-500 font-medium -mt-3 mb-4">대표 프로젝트를 등록하고 링크를 연결해 포트폴리오를 완성하세요.</p>
                  
                  <div className="space-y-4">
                      {(formData.developer?.projects || []).map((proj, idx) => (
                          <div key={idx} className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm relative">
                              <button 
                                  onClick={()=>{const arr=[...(formData.developer?.projects||[])]; arr.splice(idx,1); updateNested(["developer","projects"], arr);}} 
                                  className="absolute top-4 right-4 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                              >
                                  <Trash2 size={16}/>
                              </button>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mr-8">
                                  <div className="md:col-span-2 space-y-3">
                                      <input 
                                          value={proj.name} 
                                          onChange={e => { const arr=[...(formData.developer?.projects||[])]; arr[idx].name=e.target.value; updateNested(["developer","projects"], arr); }} 
                                          className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm font-black outline-none focus:border-indigo-400" 
                                          placeholder="프로젝트 이름 (예: CraveLog 아카이빙 플랫폼)" 
                                      />
                                      <textarea 
                                          value={proj.desc} 
                                          onChange={e => { const arr=[...(formData.developer?.projects||[])]; arr[idx].desc=e.target.value; updateNested(["developer","projects"], arr); }} 
                                          className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm font-medium outline-none resize-none focus:border-indigo-400" 
                                          placeholder="프로젝트 한 줄 설명 및 담당 역할" 
                                          rows={2}
                                      />
                                  </div>
                                  <div className="flex items-center gap-2">
                                      <Terminal size={16} className="text-zinc-400 shrink-0"/>
                                      <input 
                                          value={proj.githubUrl || ''} 
                                          onChange={e => { const arr=[...(formData.developer?.projects||[])]; arr[idx].githubUrl=e.target.value; updateNested(["developer","projects"], arr); }} 
                                          className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-indigo-400" 
                                          placeholder="저장소 URL (선택)" 
                                      />
                                  </div>
                                  <div className="flex items-center gap-2">
                                      <ExternalLink size={16} className="text-indigo-400 shrink-0"/>
                                      <input 
                                          value={proj.liveUrl || ''} 
                                          onChange={e => { const arr=[...(formData.developer?.projects||[])]; arr[idx].liveUrl=e.target.value; updateNested(["developer","projects"], arr); }} 
                                          className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-indigo-400" 
                                          placeholder="배포된 라이브 링크 (선택)" 
                                      />
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
                  <button 
                      onClick={()=>{const arr=[...(formData.developer?.projects||[]), {name:"", desc:"", githubUrl:"", liveUrl:""}]; updateNested(["developer","projects"], arr);}} 
                      className="text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2.5 rounded-xl hover:bg-indigo-100 transition-colors flex items-center justify-center w-full md:w-auto mt-2"
                  >
                      + 새 프로젝트 추가
                  </button>
              </div>
            </div>
          )}

          {/* CAREER TAB */}
          {editTab === 'career' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderInput("Target Job (희망 직무)", ["career", "targetJob"])}
                  <div className="md:col-span-1">{renderArrayInput("Tech Stack", ["career", "techStack"])}</div>
                  <div className="md:col-span-2">{renderArrayInput("Interests (관심 분야)", ["career", "interests"])}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                  {renderInput("Short Term Goal", ["career", "careerGoals", "short"])}
                  {renderInput("Mid Term Goal", ["career", "careerGoals", "mid"])}
                  {renderInput("Long Term Goal", ["career", "careerGoals", "long"])}
              </div>
              <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-4">
                  <h3 className="font-black text-zinc-800">Strengths (강점)</h3>
                  {(formData.career?.strengths || []).map((str, idx) => (
                      <div key={idx} className="flex gap-2">
                          <input value={str.title} onChange={e => { const arr=[...(formData.career?.strengths||[])]; arr[idx].title=e.target.value; updateNested(["career","strengths"], arr); }} className="w-1/3 bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm font-bold outline-none" placeholder="강점 키워드" />
                          <input value={str.desc} onChange={e => { const arr=[...(formData.career?.strengths||[])]; arr[idx].desc=e.target.value; updateNested(["career","strengths"], arr); }} className="flex-1 bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm font-medium outline-none" placeholder="설명" />
                          <button onClick={()=>{const arr=[...(formData.career?.strengths||[])]; arr.splice(idx,1); updateNested(["career","strengths"], arr);}} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl"><Trash2 size={18}/></button>
                      </div>
                  ))}
                  <button onClick={()=>{const arr=[...(formData.career?.strengths||[]), {title:"", desc:""}]; updateNested(["career","strengths"], arr);}} className="text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl">+ 강점 추가</button>
              </div>
            </div>
          )}

          {/* IDOL TAB */}
          {editTab === 'idol' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderInput("Nickname", ["idol", "nickname"])}
                  {renderInput("Birthday", ["idol", "birthday"])}
                  {renderInput("Age", ["idol", "age"])}
                  {renderInput("Specialty", ["idol", "specialty"])}
                  {renderInput("Hobbies", ["idol", "hobbies"])}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-pink-50/50 rounded-2xl border border-pink-100">
                  {renderArrayInput("Colors", ["idol", "favorites", "colors"])}
                  {renderArrayInput("Foods", ["idol", "favorites", "foods"])}
                  {renderArrayInput("Games", ["idol", "favorites", "games"])}
                  {renderArrayInput("Music", ["idol", "favorites", "music"])}
              </div>
            </div>
          )}

          {/* Q&A TAB */}
          {editTab === 'qna' && (
            <div className="space-y-4 animate-in fade-in p-6 bg-violet-50/30 rounded-3xl border border-violet-100">
                <h3 className="font-black text-violet-900 mb-4 flex items-center gap-2"><MessageSquare size={20}/> 100문 100답 관리</h3>
                {(formData.qna || []).map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                        <input value={item.q} onChange={e => { const arr=[...(formData.qna||[])]; arr[idx].q=e.target.value; updateNested(["qna"], arr); }} className="w-1/3 bg-white border border-violet-200 rounded-xl px-3 py-2 text-sm font-bold text-violet-700 outline-none" placeholder="질문" />
                        <input value={item.a} onChange={e => { const arr=[...(formData.qna||[])]; arr[idx].a=e.target.value; updateNested(["qna"], arr); }} className="flex-1 bg-white border border-violet-200 rounded-xl px-3 py-2 text-sm font-medium outline-none" placeholder="답변" />
                        <button onClick={()=>{const arr=[...(formData.qna||[])]; arr.splice(idx,1); updateNested(["qna"], arr);}} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl"><Trash2 size={18}/></button>
                    </div>
                ))}
                <button onClick={()=>{const arr=[...(formData.qna||[]), {q:"", a:""}]; updateNested(["qna"], arr);}} className="text-sm font-bold text-violet-700 bg-violet-100 px-4 py-2 rounded-xl mt-2">+ 질문 추가하기</button>
            </div>
          )}

          {/* HOBBY TAB */}
          {editTab === 'hobby' && (
            <div className="space-y-6 animate-in fade-in p-6 bg-amber-50/30 rounded-3xl border border-amber-100">
                <h3 className="font-black text-amber-900 mb-2 flex items-center gap-2"><Target size={20}/> 취미 소개 관리</h3>
                {renderInput("취미 제목", ["hobby", "title"], "예: 여행과 사진")}
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-amber-200/50">
                    <div className="w-24 h-24 rounded-xl bg-zinc-100 overflow-hidden flex items-center justify-center shrink-0 border border-zinc-200">
                        {formData.hobby?.image ? <img src={formData.hobby.image} alt="Hobby" className="w-full h-full object-cover"/> : <ImageIcon className="text-zinc-300"/>}
                    </div>
                    <div className="flex-1 w-full space-y-2">
                        <div className="flex bg-zinc-100 p-0.5 rounded-lg w-max">
                            <button type="button" onClick={() => setHobbyImageInputType('file')} className={`px-3 py-1 text-xs font-bold rounded-md transition ${hobbyImageInputType === 'file' ? 'bg-white shadow-sm' : 'text-zinc-500'}`}>파일 업로드</button>
                            <button type="button" onClick={() => setHobbyImageInputType('url')} className={`px-3 py-1 text-xs font-bold rounded-md transition ${hobbyImageInputType === 'url' ? 'bg-white shadow-sm' : 'text-zinc-500'}`}>웹 URL</button>
                        </div>
                        {hobbyImageInputType === 'file' ? (
                            <input type="file" accept="image/*" onChange={handleHobbyImageUpload} className="w-full text-xs font-bold file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-amber-100 file:text-amber-700 cursor-pointer"/>
                        ) : (
                            <input type="text" placeholder="이미지 URL" value={formData.hobby?.image || ''} onChange={e => updateNested(["hobby", "image"], e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs" />
                        )}
                    </div>
                </div>
                <div>
                    <label className="text-xs font-black text-amber-700 uppercase tracking-widest">상세 설명</label>
                    <textarea value={formData.hobby?.description || ''} onChange={e => updateNested(["hobby", "description"], e.target.value)} rows={4} className="w-full mt-2 bg-white border border-amber-200 rounded-xl px-4 py-3 text-sm font-medium outline-none" />
                </div>
                {renderArrayInput("관련 키워드 (Tags)", ["hobby", "keywords"])}
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
            <div className="space-y-4 animate-in fade-in p-6 bg-slate-50/30 rounded-3xl border border-slate-200">
                <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2"><Quote size={20}/> 좋아하는 명언 관리</h3>
                {(formData.quotes || []).map((item, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row gap-2 bg-white p-3 rounded-xl border border-slate-200 shadow-sm relative pr-10">
                        <textarea value={item.text} onChange={e => { const arr=[...(formData.quotes||[])]; arr[idx].text=e.target.value; updateNested(["quotes"], arr); }} className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 outline-none resize-none" placeholder="명언 내용" rows={2}/>
                        <input value={item.author} onChange={e => { const arr=[...(formData.quotes||[])]; arr[idx].author=e.target.value; updateNested(["quotes"], arr); }} className="w-full md:w-1/4 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm font-medium outline-none" placeholder="말한 사람" />
                        <button onClick={()=>{const arr=[...(formData.quotes||[])]; arr.splice(idx,1); updateNested(["quotes"], arr);}} className="absolute top-1/2 -translate-y-1/2 right-2 p-2 text-rose-500 hover:bg-rose-50 rounded-xl"><Trash2 size={16}/></button>
                    </div>
                ))}
                <button onClick={()=>{const arr=[...(formData.quotes||[]), {text:"", author:""}]; updateNested(["quotes"], arr);}} className="text-sm font-bold text-slate-700 bg-slate-200 px-4 py-2.5 rounded-xl mt-2 w-full">+ 명언 추가하기</button>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="bg-rose-50 border border-rose-200 p-8 rounded-[2rem] mt-8 animate-in fade-in relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                  <h3 className="text-lg font-black text-rose-600 flex items-center gap-2"><AlertTriangle size={20} /> Danger Zone</h3>
                  <p className="text-sm font-medium text-rose-700/80 mt-2">
                      계정을 삭제하면 모든 프로필 정보와 기록이 영구적으로 삭제되며 복구할 수 없습니다.
                  </p>
              </div>
              <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="shrink-0 px-6 py-3 bg-white text-rose-600 border border-rose-200 rounded-xl font-bold hover:bg-rose-600 hover:text-white transition-colors"
              >
                  계정 삭제
              </button>
          </div>

          {showDeleteConfirm && (
              <div className="absolute inset-0 bg-rose-50/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center border border-rose-300 rounded-[2rem]">
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

      {/* 미리보기 모달 */}
      {showPreview && (
        <div className="fixed inset-0 bg-zinc-950/80 z-[200] overflow-y-auto p-4 md:p-10 flex flex-col items-center animate-in fade-in backdrop-blur-sm">
          <div className="w-full max-w-5xl bg-[#F8FAFC] rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col min-h-[80vh]">
            
            <div className="bg-white px-6 py-4 flex justify-between items-center border-b border-zinc-200 sticky top-0 z-50">
              <h3 className="font-black text-lg text-zinc-800 flex items-center gap-2">
                <Eye size={20} className="text-indigo-500" />
                저장 전 프로필 미리보기
              </h3>
              <div className="flex gap-2">
                <button onClick={() => setShowPreview(false)} className="px-4 py-2 bg-zinc-100 rounded-xl text-sm font-bold text-zinc-600 hover:bg-zinc-200 transition">수정 돌아가기</button>
                <button 
                  onClick={() => { setShowPreview(false); handleSave(); }} 
                  className="px-4 py-2 bg-indigo-600 rounded-xl text-sm font-bold text-white hover:bg-indigo-700 shadow-sm flex items-center gap-1.5 transition"
                >
                  <Save size={16} /> 이대로 저장
                </button>
              </div>
            </div>

            <div className="p-6 md:p-10 flex-1 overflow-y-auto">
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-200/60 flex flex-col md:flex-row gap-8 items-center md:items-start mb-6 relative overflow-hidden">
                  <div className={`shrink-0 text-center`}>
                      <div className="w-32 h-32 bg-gradient-to-tr from-indigo-500 to-rose-400 p-[3px] rounded-[2rem] shadow-md mx-auto relative">
                          <div className="w-full h-full border-[5px] border-white bg-zinc-100 flex items-center justify-center rounded-[1.8rem] overflow-hidden">
                              {formData.profileImageUrl ? (
                                  <img src={formData.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                              ) : (
                                  <span className="text-5xl font-black text-zinc-300">{formData.name ? formData.name.charAt(0) : '?'}</span>
                              )}
                          </div>
                          {formData.status && (
                              <div className="absolute -bottom-3 -right-2 bg-zinc-900 text-white px-3 py-1.5 shadow-xl flex items-center gap-1.5 rounded-xl border border-zinc-800">
                                  <Sparkles size={12} className="text-yellow-400" /><span className="text-[10px] font-bold tracking-wider">{formData.status}</span>
                              </div>
                          )}
                      </div>
                  </div>
                  
                  <div className={`flex-1 text-center md:text-left`}>
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                          <h2 className="text-2xl font-black text-zinc-900">{formData.name || '이름 없음'}</h2>
                          <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold text-zinc-500">
                              <span className="flex items-center gap-1"><Briefcase size={14}/> {formData.role}</span>
                              <span className="flex items-center gap-1"><GraduationCap size={14}/> {formData.major}</span>
                              <span className="flex items-center gap-1"><MapPin size={14}/> {formData.location}</span>
                          </div>
                      </div>
                      <p className="text-sm text-zinc-500 font-medium mb-4">@{formData.handle || 'handle'}</p>
                      <p className="text-base text-zinc-700 font-bold mb-4">"{formData.bio}"</p>
                      
                      <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                          {(formData.tags || []).map(tag => <span key={tag} className="px-3 py-1 bg-zinc-100 text-zinc-600 text-xs font-black rounded-lg">#{tag}</span>)}
                      </div>

                      <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 text-left">
                          <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Target size={14}/> 현재 목표</h4>
                          <div className="flex flex-wrap gap-x-4 gap-y-2">
                              {(formData.goals || []).map((goal, idx) => (
                                  <div key={idx} className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md"><ArrowRight size={12}/> {goal}</div>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>

              {availablePreviewTabs.length > 0 && (
                <>
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6 p-1 bg-zinc-100/50 rounded-2xl border border-zinc-200/50">
                    {availablePreviewTabs.map(tab => (
                        <button key={tab.id} onClick={() => setPreviewTab(tab.id)} className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all whitespace-nowrap ${previewTab === tab.id ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/60' : 'text-zinc-400 hover:text-zinc-600 hover:bg-white/50'}`}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                  </div>

                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Preview Developer Tab */}
                    {previewTab === 'developer' && (
                        <div className="space-y-6">
                            <div className="bg-[#0D1117] text-zinc-300 p-8 rounded-[2rem] shadow-xl border border-zinc-800 relative overflow-hidden">
                                <div className="absolute top-4 left-4 flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                                </div>
                                <p className="font-mono text-sm leading-relaxed whitespace-pre-line text-emerald-400 mb-8 mt-4">
                                    <span className="text-zinc-500">{"// About Me"}</span><br/>{formData.developer?.about}
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-[#161B22] p-5 rounded-2xl border border-zinc-800">
                                        <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Code size={14}/> Tech Stack</h4>
                                        <div className="space-y-4 text-sm font-mono">
                                            {['backend', 'db', 'frontend', 'tools'].map(type => {
                                                const stackString = formData.developer?.techStack?.[type];
                                                if (!stackString) return null;
                                                return (
                                                    <div key={type}>
                                                        <span className={`text-[10px] uppercase font-bold mr-2 ${type === 'backend' ? 'text-indigo-400' : type === 'db' ? 'text-emerald-400' : type === 'frontend' ? 'text-rose-400' : 'text-yellow-400'}`}>
                                                            {type}:
                                                        </span>
                                                        <div className="inline-flex flex-wrap gap-1.5 align-middle mt-1">
                                                            {stackString.split(',').map((tech, i) => (
                                                                <span key={i} className="px-2 py-0.5 bg-[#21262D] border border-zinc-700 rounded text-xs font-medium text-zinc-200 hover:border-zinc-500 transition-colors cursor-default">{tech.trim()}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                    <div className="bg-[#161B22] p-5 rounded-2xl border border-zinc-800">
                                        <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Code size={14}/> Currently Learning</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {(formData.developer?.learning || []).map(l => (
                                                <span key={l} className="px-2.5 py-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 rounded-lg text-xs font-bold font-mono">{l}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-zinc-900 mb-4 ml-2 flex items-center gap-2"><Code size={20} className="text-indigo-500" /> Featured Projects</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(formData.developer?.projects || []).map((proj, idx) => (
                                        <div key={idx} className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm flex flex-col group">
                                            <div className="flex justify-between items-start mb-3">
                                                <h4 className="text-xl font-black text-zinc-900">{proj.name}</h4>
                                                <div className="flex gap-2 text-zinc-400">
                                                    {proj.githubUrl && <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 transition-colors"><Terminal size={18} /></a>}
                                                    {proj.liveUrl && <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors"><ExternalLink size={18} /></a>}
                                                </div>
                                            </div>
                                            <p className="text-sm text-zinc-500 font-medium leading-relaxed flex-1">{proj.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Preview Career Tab */}
                    {previewTab === 'career' && (
                        <div className="space-y-6">
                            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-200/60 flex flex-col md:flex-row gap-8">
                                <div className="flex-1 space-y-6">
                                    <div>
                                        <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Target Job</h4>
                                        <p className="text-xl font-black text-indigo-600">{formData.career?.targetJob}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Tech Stack</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {(formData.career?.techStack || []).map(t => <span key={t} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-black rounded-lg border border-indigo-100">{t}</span>)}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Interests</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {(formData.career?.interests || []).map(i => <span key={i} className="px-3 py-1.5 bg-zinc-50 text-zinc-600 text-xs font-black rounded-lg border border-zinc-200">{i}</span>)}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="w-full md:w-1/3 space-y-4">
                                    <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
                                        <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Short Term Goal</h4>
                                        <p className="text-sm font-bold text-indigo-900">{formData.career?.careerGoals?.short}</p>
                                    </div>
                                    <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
                                        <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Mid Term Goal</h4>
                                        <p className="text-sm font-bold text-indigo-900">{formData.career?.careerGoals?.mid}</p>
                                    </div>
                                    <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
                                        <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Long Term Goal</h4>
                                        <p className="text-sm font-bold text-indigo-900">{formData.career?.careerGoals?.long}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {(formData.career?.strengths || []).map((str, idx) => (
                                    <div key={idx} className="bg-white p-6 rounded-[2rem] border border-zinc-200/80 shadow-sm">
                                        <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center font-black mb-4">{idx+1}</div>
                                        <h4 className="text-base font-black text-zinc-900 mb-2">{str.title}</h4>
                                        <p className="text-xs text-zinc-500 leading-relaxed font-medium">{str.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Preview Idol Tab */}
                    {previewTab === 'idol' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-1 bg-gradient-to-br from-rose-50 to-pink-50 p-8 rounded-[2rem] shadow-sm border border-rose-100">
                                    <h3 className="text-xl font-black text-rose-900 mb-6 flex items-center gap-2"><Sparkles size={20} className="text-rose-400"/> Profile</h3>
                                    <div className="space-y-4 text-sm">
                                        <div className="flex justify-between border-b border-rose-200/50 pb-2"><span className="font-bold text-rose-400">Nickname</span><span className="font-black text-rose-900">{formData.idol?.nickname}</span></div>
                                        <div className="flex justify-between border-b border-rose-200/50 pb-2"><span className="font-bold text-rose-400">Birthday</span><span className="font-black text-rose-900">{formData.idol?.birthday}</span></div>
                                        <div className="flex justify-between border-b border-rose-200/50 pb-2"><span className="font-bold text-rose-400">Age</span><span className="font-black text-rose-900">{formData.idol?.age}</span></div>
                                        <div className="flex justify-between border-b border-rose-200/50 pb-2"><span className="font-bold text-rose-400">Specialty</span><span className="font-black text-rose-900">{formData.idol?.specialty}</span></div>
                                        <div className="flex justify-between pb-2"><span className="font-bold text-rose-400">Hobbies</span><span className="font-black text-rose-900 text-right">{formData.idol?.hobbies}</span></div>
                                    </div>
                                </div>

                                <div className="md:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-200/60">
                                    <h3 className="text-xl font-black text-zinc-900 mb-6 flex items-center gap-2"><Heart size={20} className="text-rose-500 fill-rose-500"/> Favorites</h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div><h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Colors</h4><div className="flex flex-wrap gap-2">{(formData.idol?.favorites?.colors || []).map(c=><span key={c} className="px-3 py-1 bg-zinc-50 rounded-lg text-xs font-bold text-zinc-700">{c}</span>)}</div></div>
                                        <div><h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Foods</h4><div className="flex flex-wrap gap-2">{(formData.idol?.favorites?.foods || []).map(c=><span key={c} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-bold">{c}</span>)}</div></div>
                                        <div><h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Games</h4><div className="flex flex-wrap gap-2">{(formData.idol?.favorites?.games || []).map(c=><span key={c} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold">{c}</span>)}</div></div>
                                        <div><h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Music</h4><div className="flex flex-wrap gap-2">{(formData.idol?.favorites?.music || []).map(c=><span key={c} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold">{c}</span>)}</div></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Preview Q&A Tab */}
                    {previewTab === 'qna' && (
                        <div className="space-y-6">
                            <h3 className="text-2xl font-black text-violet-900 flex items-center gap-2"><MessageSquare size={24} className="text-violet-500"/> 100문 100답</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(formData.qna || []).map((item, idx) => (
                                    <div key={idx} className="p-6 bg-violet-50/50 rounded-3xl relative overflow-hidden group border border-violet-100">
                                        <div className="absolute -right-4 -top-6 text-9xl font-black text-white/50 select-none group-hover:scale-110 transition-transform duration-500">Q</div>
                                        <h4 className="text-base md:text-lg font-black text-violet-700 relative z-10 mb-3 leading-snug">{item.q}</h4>
                                        <p className="text-sm font-medium text-zinc-700 relative z-10 leading-relaxed bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-white">{item.a}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Preview Hobby Tab */}
                    {previewTab === 'hobby' && (
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-amber-100/60 overflow-hidden flex flex-col md:flex-row group">
                            <div className="md:w-1/2 h-72 md:h-auto relative overflow-hidden">
                                <img src={formData.hobby?.image || 'https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?q=80&w=1000'} alt="Hobby" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                <h3 className="absolute bottom-8 left-8 text-3xl font-black text-white drop-shadow-md leading-tight">{formData.hobby?.title || '취미 제목'}</h3>
                            </div>
                            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-gradient-to-br from-amber-50/30 to-orange-50/30">
                                <Quote size={48} className="text-amber-300 mb-6 transform rotate-180" />
                                <p className="text-base text-zinc-700 leading-relaxed font-medium mb-8">
                                    {formData.hobby?.description || '취미 설명이 없습니다.'}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {(formData.hobby?.keywords || []).map(kw => <span key={kw} className="px-4 py-2 bg-white text-amber-700 text-xs font-black rounded-xl border border-amber-200 shadow-sm">#{kw}</span>)}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Preview Vision Tab */}
                    {previewTab === 'vision' && (() => {
                        const v = formData.vision || { core: "", subs: Array(8).fill(""), details: Array.from({length: 8}, () => Array(8).fill("")) };
                        const blocks = [];
                        for (let i = 0; i < 9; i++) {
                            if (i === 4) {
                                blocks.push([v.subs[0], v.subs[1], v.subs[2], v.subs[3], v.core, v.subs[4], v.subs[5], v.subs[6], v.subs[7]]);
                            } else {
                                const subIdx = i < 4 ? i : i - 1;
                                const d = v.details[subIdx] || Array(8).fill("");
                                blocks.push([d[0], d[1], d[2], d[3], v.subs[subIdx], d[4], d[5], d[6], d[7]]);
                            }
                        }
                        return (
                            <div className="bg-gradient-to-br from-teal-900 to-slate-900 p-8 md:p-12 rounded-[2.5rem] shadow-xl text-white">
                                <div className="text-center mb-10">
                                    <h3 className="text-3xl md:text-4xl font-black mb-3 flex items-center justify-center gap-3"><Compass className="text-teal-400"/> Mandalart</h3>
                                    <p className="text-teal-200/80 text-sm font-medium">나의 비전을 이루기 위한 81가지 세부 계획</p>
                                </div>
                                <div className="grid grid-cols-3 gap-1 md:gap-2 p-2 bg-white/10 backdrop-blur-md rounded-2xl w-full max-w-3xl mx-auto aspect-square border border-white/20 shadow-2xl">
                                    {blocks.map((block, bIdx) => (
                                        <div key={bIdx} className="grid grid-cols-3 gap-px bg-white/20 border border-white/10 rounded overflow-hidden shadow-inner">
                                            {block.map((cell, cIdx) => {
                                                const isCore = bIdx === 4 && cIdx === 4;
                                                const isMainSub = bIdx === 4 && cIdx !== 4;
                                                const isCenterOfOuter = bIdx !== 4 && cIdx === 4;
                                                let bg = "bg-white/90";
                                                let text = "text-slate-800";
                                                let font = "font-bold text-[8px] sm:text-[10px] md:text-xs";
                                                if (isCore) { bg = "bg-teal-500 shadow-lg z-10"; text = "text-white"; font = "font-black text-[10px] sm:text-xs md:text-sm"; } 
                                                else if (isMainSub || isCenterOfOuter) { bg = "bg-teal-100"; text = "text-teal-900"; font = "font-black text-[9px] sm:text-[11px] md:text-sm"; }
                                                return (
                                                    <div key={cIdx} className={`${bg} ${text} ${font} flex items-center justify-center text-center p-0.5 sm:p-1 overflow-hidden break-words leading-tight transition-colors hover:brightness-95 cursor-default`}>
                                                        {cell || '-'}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}

                    {/* Preview Quotes Tab */}
                    {previewTab === 'quotes' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {(formData.quotes || []).map((q, idx) => (
                                    <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-between hover:-translate-y-1 hover:shadow-md transition-all">
                                        <Quote size={20} className="text-slate-300 mb-3" />
                                        <p className="text-sm font-bold text-slate-700 leading-relaxed mb-4">"{q.text}"</p>
                                        <p className="text-[10px] font-black text-slate-400 text-right uppercase tracking-widest">- {q.author}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                  </div>
                </>
              )}

              {availablePreviewTabs.length === 0 && (
                 <div className="py-20 flex flex-col items-center justify-center bg-white rounded-[2rem] border border-zinc-200/60 shadow-sm animate-in fade-in duration-500 mt-6">
                     <div className="w-16 h-16 bg-zinc-50 flex items-center justify-center rounded-full mb-4 border border-zinc-100 shadow-inner">
                         <Lock size={28} className="text-zinc-300" />
                     </div>
                     <h3 className="text-lg font-black text-zinc-800">모든 탭 비공개 상태</h3>
                     <p className="text-sm font-medium text-zinc-500 mt-2">현재 모든 프로필 탭이 남들에게 보이지 않도록 설정되어 있습니다.</p>
                 </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditProfileView;