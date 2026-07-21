import React, { useState, useEffect } from 'react';
import { 
  Save, Eye, Lock, Trash2, AlertTriangle, Image as ImageIcon, Upload, AtSign, ExternalLink, Loader2,
  Code, Briefcase, HeartHandshake, User, Sparkles, GraduationCap, MapPin, Target, ArrowRight, Heart, MessageSquare, X as CloseIcon,
  Terminal // ⭐️ Github 대신 Terminal 아이콘을 사용합니다!
} from 'lucide-react'; 
import { useAppStore } from '../store/AppStore';

const EditProfileView = () => {
  const { setViewMode, user, showToast, setIsAdmin, fetchAllData, apiFetch } = useAppStore();
  
  const [formData, setFormData] = useState(() => {
    const safeUser = JSON.parse(JSON.stringify(user || {}));
    return {
      ...safeUser,
      profileImageUrl: safeUser.profileImageUrl || '',
      privacy: safeUser.privacy || { developer: true, career: true, idol: true },
      developer: safeUser.developer || { techStack: {}, projects: [], learning: [], about: "" },
      career: safeUser.career || { targetJob: "", techStack: [], interests: [], strengths: [], careerGoals: {} },
      idol: safeUser.idol || { nickname: "", birthday: "", age: "", specialty: "", hobbies: "", favorites: {}, qna: [] },
      tags: safeUser.tags || [],
      goals: safeUser.goals || []
    };
  });

  const [editTab, setEditTab] = useState('basic');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imageInputType, setImageInputType] = useState('file');
  const [isLoading, setIsLoading] = useState(false);

  // 미리보기 모달 상태
  const [showPreview, setShowPreview] = useState(false);
  const [previewTab, setPreviewTab] = useState('developer');

  // 미리보기 탭 목록 (비공개 처리된 탭은 미리보기에서도 숨김)
  const availablePreviewTabs = [
    { id: 'developer', icon: <Code size={16}/>, label: 'Developer Profile' },
    { id: 'career', icon: <Briefcase size={16}/>, label: 'Career Info' },
    { id: 'idol', icon: <HeartHandshake size={16}/>, label: 'Personal (Idol)' }
  ].filter(tab => formData.privacy[tab.id]);

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

  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateNested(["profileImageUrl"], reader.result); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) return showToast('이름은 필수 입력 항목입니다.');
    if (!formData.handle?.trim()) return showToast('고유 아이디는 필수 입력 항목입니다.');
    
    if (!/^[a-z0-9.]+$/.test(formData.handle)) {
        return showToast('아이디는 영문 소문자, 숫자, 마침표(.)만 가능합니다.');
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
      console.error(e);
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

  const renderArrayTextarea = (label, path) => {
    const arr = path.reduce((o, i) => (o || {})[i] || [], formData);
    return (
      <div>
        <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">{label}</label>
        <textarea
          value={arr.join(', ')}
          onChange={e => updateNested(path, e.target.value.split(',').map(s => s.trim()))}
          rows={2}
          className="w-full mt-2 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none"
        />
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
          {[
            { id: 'basic', label: '기본 정보' },
            { id: 'developer', label: 'Developer' },
            { id: 'career', label: 'Career' },
            { id: 'idol', label: 'Idol' }
          ].map(tab => (
              <button key={tab.id} onClick={() => setEditTab(tab.id)} className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all whitespace-nowrap ${editTab === tab.id ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/60' : 'text-zinc-400 hover:text-zinc-600 hover:bg-white/50'}`}>
                  {tab.label}
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
              
              {/* 고유 아이디 입력 칸 */}
              <div>
                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">고유 아이디 (URL 및 검색용)</label>
                <div className="relative mt-2">
                  <AtSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input 
                      type="text" 
                      value={formData.handle || ''} 
                      onChange={e => updateNested(["handle"], e.target.value.toLowerCase())}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none" 
                      placeholder="예: taekyeong.dev"
                  />
                </div>
                <p className="text-[10px] text-zinc-400 font-medium pl-1 mt-1.5">영문 소문자, 숫자, 마침표(.)만 사용할 수 있습니다.</p>
              </div>
              
              {/* 프로필 이미지 입력 영역 */}
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
                      {/* 미리보기 아바타 */}
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
                                  <span className="text-[11px] font-bold text-zinc-400 ml-1">
                                      {formData.profileImageUrl && formData.profileImageUrl.startsWith('data:image') 
                                        ? '✅ 업로드된 파일 적용됨' 
                                        : '선택된 파일 없음'}
                                  </span>
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
                          <p className="text-[10px] font-medium text-zinc-400 mt-2 ml-1">
                              정사각형 이미지를 권장합니다. (JPG, PNG)
                          </p>
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
              {renderArrayTextarea("Tags (키워드)", ["tags"])}
              {renderArrayTextarea("Current Goals (현재 목표)", ["goals"])}
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
                  {renderInput("Backend", ["developer", "techStack", "backend"])}
                  {renderInput("Database", ["developer", "techStack", "db"])}
                  {renderInput("Frontend", ["developer", "techStack", "frontend"])}
                  {renderInput("Tools", ["developer", "techStack", "tools"])}
              </div>
              {renderArrayTextarea("Currently Learning (학습 중인 기술)", ["developer", "learning"])}
              
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
                                      {/* ⭐️ Github 대신 Terminal 사용 */}
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
                  {renderArrayTextarea("Tech Stack", ["career", "techStack"])}
                  {renderArrayTextarea("Interests (관심 분야)", ["career", "interests"])}
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-pink-50/50 rounded-2xl border border-pink-100">
                  {renderArrayTextarea("Colors", ["idol", "favorites", "colors"])}
                  {renderArrayTextarea("Foods", ["idol", "favorites", "foods"])}
                  {renderArrayTextarea("Games", ["idol", "favorites", "games"])}
                  {renderArrayTextarea("Music", ["idol", "favorites", "music"])}
              </div>
              <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-4">
                  <h3 className="font-black text-zinc-800">Q & A</h3>
                  {(formData.idol?.qna || []).map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                          <input value={item.q} onChange={e => { const arr=[...(formData.idol?.qna||[])]; arr[idx].q=e.target.value; updateNested(["idol","qna"], arr); }} className="w-1/2 bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm font-bold text-indigo-600 outline-none" placeholder="질문" />
                          <input value={item.a} onChange={e => { const arr=[...(formData.idol?.qna||[])]; arr[idx].a=e.target.value; updateNested(["idol","qna"], arr); }} className="w-1/2 bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm font-medium outline-none" placeholder="답변" />
                          <button onClick={()=>{const arr=[...(formData.idol?.qna||[])]; arr.splice(idx,1); updateNested(["idol","qna"], arr);}} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl"><Trash2 size={18}/></button>
                      </div>
                  ))}
                  <button onClick={()=>{const arr=[...(formData.idol?.qna||[]), {q:"", a:""}]; updateNested(["idol","qna"], arr);}} className="text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl">+ 문답 추가</button>
              </div>
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

                            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-200/60">
                                <h3 className="text-xl font-black text-zinc-900 mb-6 flex items-center gap-2"><MessageSquare size={20} className="text-indigo-500"/> Q & A</h3>
                                <div className="space-y-6">
                                    {(formData.idol?.qna || []).map((item, idx) => (
                                        <div key={idx} className="flex flex-col gap-2">
                                            <span className="text-sm font-black text-indigo-600 flex items-center gap-2">Q. {item.q}</span>
                                            <span className="text-sm font-medium text-zinc-700 bg-zinc-50 p-3 rounded-xl border border-zinc-100">A. {item.a}</span>
                                        </div>
                                    ))}
                                </div>
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