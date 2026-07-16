import React, { useState } from 'react';
import { Save, Eye, Lock, Trash2, AlertTriangle, Image as ImageIcon, Upload, AtSign } from 'lucide-react'; // ⭐️ AtSign 아이콘 추가
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
  
  // 이미지 입력 방식 상태 ('file' or 'url')
  const [imageInputType, setImageInputType] = useState('file');

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

  // 파일 업로드 처리 핸들러 (PC 파일 -> Base64 변환)
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
    // ⭐️ 필수 값 및 고유 아이디 유효성 검사 추가
    if (!formData.name?.trim()) return showToast('이름은 필수 입력 항목입니다.');
    if (!formData.handle?.trim()) return showToast('고유 아이디는 필수 입력 항목입니다.');
    
    if (!/^[a-z0-9.]+$/.test(formData.handle)) {
        return showToast('아이디는 영문 소문자, 숫자, 마침표(.)만 가능합니다.');
    }

    try {
      // ⭐️ 엔드포인트 확인: 만약 이전처럼 /me 였다면 /me 로 변경해주세요.
      const res = await apiFetch(`/me/profile`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        await fetchAllData();
        setViewMode('profile');
        showToast("성공적으로 저장되었습니다! 🎉 이제 갤러리도 채워보세요.");
      } else {
        // ⭐️ 백엔드에서 던진 에러 메시지(중복 아이디 등) 띄우기
        const data = await res.json();
        showToast(data.message || "프로필 저장에 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
      showToast("서버 연결에 실패했습니다.");
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
    <div className="max-w-5xl mx-auto w-full p-4 md:p-10 animate-in fade-in duration-300 pb-28 md:pb-10 overflow-y-auto">
      <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight">Setup Profile</h1>
          <p className="text-sm font-bold text-zinc-400 mt-1 uppercase tracking-widest">내 공간 만들기</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setViewMode('profile')} className="px-4 py-2 bg-white border border-zinc-200 text-zinc-600 rounded-xl text-sm font-bold hover:bg-zinc-50 transition shadow-sm">
             취소
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition shadow-sm flex items-center gap-2">
            <Save size={16} /> 저장하기
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
            
            {/* ⭐️ 고유 아이디 입력 칸 (아이콘 적용을 위해 별도 구성) */}
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
                            // 기존 URL 입력 방식
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
                <h3 className="font-black text-zinc-800">Projects</h3>
                {(formData.developer?.projects || []).map((proj, idx) => (
                    <div key={idx} className="flex gap-2">
                        <input value={proj.name} onChange={e => { const arr=[...(formData.developer?.projects||[])]; arr[idx].name=e.target.value; updateNested(["developer","projects"], arr); }} className="w-1/3 bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm font-bold outline-none" placeholder="프로젝트명" />
                        <input value={proj.desc} onChange={e => { const arr=[...(formData.developer?.projects||[])]; arr[idx].desc=e.target.value; updateNested(["developer","projects"], arr); }} className="flex-1 bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm font-medium outline-none" placeholder="설명" />
                        <button onClick={()=>{const arr=[...(formData.developer?.projects||[])]; arr.splice(idx,1); updateNested(["developer","projects"], arr);}} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl"><Trash2 size={18}/></button>
                    </div>
                ))}
                <button onClick={()=>{const arr=[...(formData.developer?.projects||[]), {name:"", desc:""}]; updateNested(["developer","projects"], arr);}} className="text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl">+ 프로젝트 추가</button>
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
    </div>
  );
};

export default EditProfileView;