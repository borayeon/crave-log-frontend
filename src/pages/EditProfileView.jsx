import React, { useState } from 'react';
import { Save, Eye, Lock, Trash2, AlertTriangle } from 'lucide-react';
import { useAppStore, API_BASE_URL } from '../store/AppStore';

const EditProfileView = () => {
  const { setViewMode, user, showToast, setIsAdmin, fetchAllData, apiFetch } = useAppStore();
  
  const [formData, setFormData] = useState(() => {
    const safeUser = JSON.parse(JSON.stringify(user || {}));
    return {
      ...safeUser,
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

  const handleSave = async () => {
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
        showToast("프로필 저장에 실패했습니다.");
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

  // ⭐️ isReadOnly 속성을 추가하여 ID 필드를 읽기 전용으로 만듭니다.
  const renderInput = (label, path, placeholder = "", isReadOnly = false) => (
    <div>
      <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        value={path.reduce((o, i) => (o || {})[i] || '', formData)}
        onChange={e => {
          if (!isReadOnly) updateNested(path, e.target.value);
        }}
        readOnly={isReadOnly}
        className={`w-full mt-2 rounded-xl px-4 py-3 text-sm font-bold outline-none transition-colors ${
          isReadOnly 
            ? 'bg-zinc-100 text-zinc-500 border border-transparent cursor-not-allowed' 
            : 'bg-zinc-50 border border-zinc-200 text-zinc-800 focus:ring-2 focus:ring-indigo-500'
        }`}
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

        {}
        {/* BASIC TAB */}
        {editTab === 'basic' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
            {renderInput("이름", ["name"], "예: 홍길동")}
            {/* ⭐️ ID 필드를 읽기 전용으로 설정합니다. */}
            {renderInput("고유 ID (변경 불가)", ["handle"], "예: gildong.dev", true)}
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

      {}
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
  );
};

export default EditProfileView;