import React, { useState, useRef } from 'react';
import { 
  Code, Briefcase, Trash2, Terminal, ExternalLink, Plus, 
  Calendar, History, ChevronDown, X as CloseIcon, UserPlus, 
  Image as ImageIcon, Upload, Loader2, Compass, Heart, 
  CreditCard, MessageSquare, Target, Quote, FileText, Grid, Eraser,
  Layers, Check // ⭐️ Layers, Check 아이콘 추가
} from 'lucide-react';
import BusinessCard from './BusinessCard';

export const DeveloperEditTab = ({ formData, updateNested, renderStringArrayInput }) => (
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
);

export const CareerEditTab = ({ formData, updateNested, renderArrayInput }) => (
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
            <div>{renderArrayInput("Tech Stack", ["career", "techStack"], "필요 기술 입력 후 Enter")}</div>
            <div>{renderArrayInput("Interests (관심 분야)", ["career", "interests"], "관심 분야 입력 후 Enter")}</div>
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
);

export const AddProfileEditTab = ({ formData, updateNested, renderInput, renderArrayInput, isExtraImageUploading, handleExtraImageUpload, handleCommitProfile, setViewHistoryItem }) => {
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

  return (
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
          <div className="md:col-span-1 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-zinc-100 space-y-4">
              <h3 className="text-base font-black text-zinc-900 mb-4 flex items-center gap-2"><UserPlus size={16} className="text-rose-400"/> Identity & Info</h3>
              
              <div className="flex flex-col items-center justify-center mb-6">
                  <div className="w-40 h-56 sm:w-48 sm:h-64 mx-auto rounded-3xl bg-zinc-50 border border-zinc-200 shadow-inner overflow-hidden mb-5 relative group flex items-center justify-center">
                      {isExtraImageUploading && (
                          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20 backdrop-blur-[1px]">
                              <Loader2 size={24} className="text-rose-500 animate-spin" />
                          </div>
                      )}
                      {formData.idol?.extraImage ? (
                          <img src={formData.idol?.extraImage} alt="Extra Profile" className="w-full h-full object-cover" />
                      ) : (
                          <ImageIcon size={32} className="text-zinc-200" />
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

          <div className="md:col-span-2 space-y-4">
              <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-zinc-200/60">
                  <h3 className="text-sm font-black text-zinc-900 mb-4 flex items-center gap-2"><Compass size={14} className="text-blue-500"/> Lifestyle & Work</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 gap-1.5 sm:col-span-2">
                        {renderInput("좌우명", ["idol", "motto"], "예: 피할 수 없으면 즐겨라")}
                      </div>
                      <div className="flex flex-col bg-zinc-50 p-4 rounded-xl border border-zinc-200/60 gap-1.5">
                        {renderInput("최근 취미", ["idol", "recentHobby"], "예: 클라이밍, 베이킹")}
                      </div>
                      <div className="flex flex-col bg-zinc-50 p-4 rounded-xl border border-zinc-200/60 gap-1.5">
                        {renderInput("Working Style", ["idol", "workingStyle"], "예: 올빼미족")}
                      </div>
                      <div className="flex flex-col bg-zinc-50 p-4 rounded-xl border border-zinc-200/60 gap-1.5">
                        {renderInput("활동 시간대", ["idol", "activeHours"], "예: 저녁 8시 ~ 새벽 2시")}
                      </div>
                      <div className="flex flex-col bg-zinc-50 p-4 rounded-xl border border-zinc-200/60 gap-1.5">
                          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5">연락 가능 여부</label>
                          <div className="flex bg-zinc-50 border border-zinc-200 rounded-xl p-1 gap-1 max-w-sm">
                              {['적극', '중간', '소극'].map(status => (
                                  <button
                                      key={status}
                                      type="button"
                                      onClick={() => updateNested(["idol", "contact"], status)}
                                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.idol?.contact === status ? 'bg-white shadow-sm text-violet-600 border border-violet-200' : 'text-zinc-500 hover:bg-zinc-100'}`}
                                  >
                                      {status}
                                  </button>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>

              <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-zinc-200/60">
                  <h3 className="text-sm font-black text-zinc-900 mb-4 flex items-center gap-2"><Heart size={14} className="text-rose-500"/> My Tastes</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 bg-zinc-50/80 rounded-2xl border border-zinc-100">
                        {renderArrayInput("Hobbies & Interests", ["idol", "tastes", "hobbies"], "입력 후 Enter")}
                      </div>
                      <div className="p-3 bg-orange-50/50 rounded-2xl border border-orange-100/50">
                        {renderArrayInput("Culture (Music/Movies)", ["idol", "tastes", "culture"], "입력 후 Enter")}
                      </div>
                      <div className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                        {renderArrayInput("Food & Drink", ["idol", "tastes", "foods"], "입력 후 Enter")}
                      </div>
                      <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                        {renderArrayInput("Lifestyle & Places", ["idol", "tastes", "lifestyle"], "입력 후 Enter")}
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export const BusinessCardEditTab = ({ formData, updateNested, renderInput }) => (
  <div className="space-y-6 animate-in fade-in">
      <div className="bg-zinc-50 rounded-3xl p-6 md:p-10 border border-zinc-200/80 shadow-inner flex flex-col items-center justify-center">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6">Live Card Preview</p>
          <BusinessCard data={formData.idol?.businessCard} userName={formData.name} />
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
);

export const QnaEditTab = ({ formData, updateNested }) => (
  <div className="animate-in fade-in p-6 md:p-8 bg-white rounded-3xl border border-zinc-100 shadow-sm">
      <h3 className="text-base font-black text-zinc-900 mb-1 flex items-center gap-2"><MessageSquare size={16} className="text-violet-500"/> 100문 100답 작성</h3>
      <p className="text-[11px] text-zinc-500 font-medium mb-5">나만의 엉뚱하고 재미있는 질문과 답변을 추가해보세요.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(formData.idol?.qna || []).map((item, idx) => (
            <div key={idx} className="flex flex-col gap-2.5 bg-violet-50/30 p-5 rounded-2xl border border-violet-100/50 relative overflow-hidden hover:bg-violet-50 hover:shadow-sm transition-all duration-300">
                <button type="button" onClick={()=>{const arr=[...(formData.idol?.qna||[])]; arr.splice(idx,1); updateNested(["idol", "qna"], arr);}} className="absolute top-4 right-4 text-violet-300 hover:text-rose-500 bg-white border border-violet-100 p-1.5 rounded-lg transition-colors z-10"><Trash2 size={12}/></button>
                
                <div>
                  <label className="text-[9px] font-black text-violet-400 uppercase tracking-widest mb-1 block">Question</label>
                  <input value={item.q} onChange={e => { const arr=[...(formData.idol?.qna||[])]; arr[idx].q=e.target.value; updateNested(["idol", "qna"], arr); }} className="w-full bg-white border border-violet-200 rounded-xl px-3 py-2 text-xs font-bold text-violet-900 outline-none focus:border-violet-400 pr-10 transition-colors" placeholder="예: 무인도에 가져갈 3가지는?" />
                </div>
                <div>
                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1 block">Answer</label>
                  <textarea value={item.a} onChange={e => { const arr=[...(formData.idol?.qna||[])]; arr[idx].a=e.target.value; updateNested(["idol", "qna"], arr); }} className="w-full bg-white border border-violet-200 rounded-xl px-3 py-2 text-[11px] font-medium text-zinc-800 outline-none focus:border-violet-400 resize-none transition-colors" placeholder="답변을 작성하세요" rows={2} />
                </div>
            </div>
        ))}
        
        <button type="button" onClick={()=>{const arr=[...(formData.idol?.qna||[]), {q:"", a:""}]; updateNested(["idol", "qna"], arr);}} className="min-h-[140px] flex flex-col items-center justify-center gap-2 border-2 border-dashed border-violet-200 rounded-2xl text-violet-400 hover:text-violet-600 hover:border-violet-400 hover:bg-violet-50 transition-colors">
            <Plus size={24} />
            <span className="font-bold text-xs">새로운 Q&A 추가</span>
        </button>
      </div>
  </div>
);

export const HobbyEditTab = ({ formData, updateNested, renderInput, renderArrayInput, isHobbyImageUploading, handleHobbyImageUpload }) => {
  const [hobbyImageInputType, setHobbyImageInputType] = useState('file');

  return (
    <div className="animate-in fade-in p-6 md:p-8 bg-white rounded-3xl shadow-sm border border-zinc-100">
        <h3 className="text-base font-black text-zinc-900 mb-1 flex items-center gap-2"><Target size={16} className="text-amber-500"/> 취미 소개 섹션</h3>
        <p className="text-[11px] text-zinc-500 font-medium mb-5">나를 가장 잘 나타내는 취미 하나를 깊게 소개해보세요.</p>
        
        <div className="bg-amber-50/30 p-5 rounded-2xl border border-amber-100/50 space-y-5">
          {renderInput("취미 제목 (Headline)", ["idol", "hobby", "title"], "예: 필름 카메라와 골목길 산책")}
          
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-amber-100">
              <div className="w-24 h-24 rounded-xl bg-zinc-100 overflow-hidden flex items-center justify-center shrink-0 border border-zinc-200 relative group shadow-inner">
                  {isHobbyImageUploading && (
                      <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-20 backdrop-blur-[1px]">
                          <Loader2 size={16} className="text-amber-500 animate-spin mb-1" />
                      </div>
                  )}
                  {formData.idol?.hobby?.image ? <img src={formData.idol.hobby.image} alt="Hobby" className="w-full h-full object-cover"/> : <ImageIcon className="text-zinc-300" size={24}/>}
                  
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
                      <input type="text" placeholder="https://..." value={formData.idol?.hobby?.image || ''} onChange={e => updateNested(["idol", "hobby", "image"], e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-400 transition-colors" />
                  )}
              </div>
          </div>
          
          <div>
              <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-1.5">상세 설명 (Description)</label>
              <textarea value={formData.idol?.hobby?.description || ''} onChange={e => updateNested(["idol", "hobby", "description"], e.target.value)} rows={3} className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2.5 text-xs font-medium outline-none focus:border-amber-400 resize-none transition-colors" placeholder="이 취미를 왜 좋아하는지, 어떤 매력이 있는지 적어주세요." />
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-amber-100">
            {renderArrayInput("관련 키워드 (Tags)", ["idol", "hobby", "keywords"], "키워드 입력 후 Enter")}
          </div>
        </div>
    </div>
  );
}

export const QuotesEditTab = ({ formData, updateNested }) => (
  <div className="animate-in fade-in p-6 md:p-8 bg-white rounded-3xl border border-zinc-100 shadow-sm">
      <h3 className="text-base font-black text-zinc-900 mb-1 flex items-center gap-2"><Quote size={16} className="text-slate-400"/> 좋아하는 명언 모음</h3>
      <p className="text-[11px] text-zinc-500 font-medium mb-5">나에게 영감을 주는 문장이나 좌우명을 기록해두세요.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {(formData.idol?.quotes || []).map((item, idx) => (
            <div key={idx} className="flex flex-col gap-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm relative group transition-colors hover:bg-white">
                <button type="button" onClick={()=>{const arr=[...(formData.idol?.quotes||[])]; arr.splice(idx,1); updateNested(["idol", "quotes"], arr);}} className="absolute top-3 right-3 text-slate-300 hover:text-rose-500 bg-white border border-slate-100 p-1 rounded-lg transition-colors z-10"><Trash2 size={12}/></button>
                
                <textarea 
                  value={item.text} 
                  onChange={e => { const arr=[...(formData.idol?.quotes||[])]; arr[idx].text=e.target.value; updateNested(["idol", "quotes"], arr); }} 
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none resize-none focus:border-slate-400 pr-8 transition-colors" 
                  placeholder="명언 내용" 
                  rows={3}
                />
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 focus-within:border-slate-400 transition-colors">
                  <span className="text-[10px] font-black text-slate-300">-</span>
                  <input 
                    value={item.author} 
                    onChange={e => { const arr=[...(formData.idol?.quotes||[])]; arr[idx].author=e.target.value; updateNested(["idol", "quotes"], arr); }} 
                    className="flex-1 bg-transparent text-[11px] font-bold text-slate-600 outline-none" 
                    placeholder="작성자 또는 출처" 
                  />
                </div>
            </div>
        ))}
        
        <button type="button" onClick={()=>{const arr=[...(formData.idol?.quotes||[]), {text:"", author:""}]; updateNested(["idol", "quotes"], arr);}} className="min-h-[130px] flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:text-slate-600 hover:border-slate-400 hover:bg-slate-50 transition-colors">
            <Plus size={24} />
            <span className="font-bold text-xs">새 명언 추가</span>
        </button>
      </div>
  </div>
);

export const MemoEditTab = ({ formData, updateNested }) => (
  <div className="space-y-6 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-100">
          <h3 className="text-base font-black text-zinc-900 mb-2 flex items-center gap-2"><FileText size={16} className="text-amber-500"/> 자유 메모장</h3>
          <p className="text-[11px] text-zinc-500 font-medium mb-5">방문자에게 전하고 싶은 말이나, 자유로운 형태의 텍스트를 남겨보세요.</p>
          <textarea 
              value={formData.idol?.memoArea?.text || ''} 
              onChange={e => updateNested(["idol", "memoArea", "text"], e.target.value)} 
              rows={8} 
              className="w-full bg-amber-50/30 border border-amber-100/50 rounded-xl px-5 py-4 text-sm font-medium text-zinc-800 outline-none focus:bg-white focus:border-amber-400 resize-none transition-colors shadow-sm" 
              placeholder="자유롭게 글을 작성해보세요..." 
          />
      </div>
  </div>
);

const PALETTE = ['#ef4444', '#f97316', '#f59e0b', '#22c55e', '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#3f3f46'];

export const ArtEditTab = ({ formData, updateNested }) => {
  const [activeColor, setActiveColor] = useState(PALETTE[8]);
  const [isEraser, setIsEraser] = useState(false);
  const isDrawingRef = useRef(false);

  const gridSize = formData.idol?.memoArea?.gridSize || 15;
  const dots = formData.idol?.memoArea?.dots || Array(gridSize * gridSize).fill("");

  return (
    <div className="space-y-6 animate-in fade-in">
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-100 flex flex-col items-center">
            <h3 className="text-base font-black text-zinc-900 mb-2 w-full flex items-center gap-2"><Grid size={16} className="text-pink-500"/> 도트 캔버스 (Pixel Art)</h3>
            <p className="text-[11px] text-zinc-500 font-medium mb-6 w-full">색상을 선택하고 클릭하거나 드래그하여 그림을 그려보세요.</p>
            
            <div className="w-full flex items-center justify-between bg-zinc-50 p-3 rounded-2xl border border-zinc-200 mb-6">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-2 hidden sm:block">그리드 크기 (Grid Size)</span>
                <div className="flex gap-2 w-full sm:w-auto">
                    {[10, 15, 20].map(size => (
                        <button
                            key={size}
                            type="button"
                            onClick={() => {
                                if (size !== gridSize && window.confirm("크기를 변경하면 기존 캔버스가 초기화됩니다. 변경하시겠습니까?")) {
                                    updateNested(["idol", "memoArea", "gridSize"], size);
                                    updateNested(["idol", "memoArea", "dots"], Array(size * size).fill(""));
                                }
                            }}
                            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${gridSize === size ? 'bg-zinc-800 text-white' : 'bg-white text-zinc-500 border border-zinc-200 hover:bg-zinc-100'}`}
                        >
                            {size} x {size}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6 bg-white p-3 rounded-full border border-zinc-200 shadow-sm">
                {PALETTE.map(color => (
                    <button
                        key={color}
                        type="button"
                        onClick={() => { setActiveColor(color); setIsEraser(false); }}
                        style={{ backgroundColor: color }}
                        className={`w-6 h-6 rounded-full transition-all ring-offset-2 hover:scale-110 ${activeColor === color && !isEraser ? 'ring-2 ring-zinc-800 scale-110' : 'ring-1 ring-zinc-200/50'}`}
                        title={color}
                    />
                ))}
                <div className="w-px h-6 bg-zinc-200 mx-1"></div>
                <button
                    type="button"
                    onClick={() => setIsEraser(true)}
                    className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-full transition-colors ${isEraser ? 'bg-rose-500 text-white shadow-sm' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}
                >
                    <Eraser size={14} />
                    <span className="hidden sm:inline">지우개</span>
                </button>
            </div>
            
            <div className="flex flex-col items-center justify-center select-none overflow-x-auto w-full pb-4">
                <div 
                    style={{ display: 'grid', gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }} 
                    className="gap-0.5 sm:gap-1 bg-zinc-50 p-2 sm:p-3 rounded-2xl border border-zinc-200 shadow-inner w-max mx-auto"
                    onMouseLeave={() => { isDrawingRef.current = false; }}
                    onMouseUp={() => { isDrawingRef.current = false; }}
                >
                    {dots.map((dotColor, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onMouseDown={() => {
                                isDrawingRef.current = true;
                                const newDots = [...dots];
                                newDots[idx] = isEraser ? "" : activeColor;
                                updateNested(["idol", "memoArea", "dots"], newDots);
                            }}
                            onMouseEnter={() => {
                                if (isDrawingRef.current) {
                                    const newDots = [...dots];
                                    newDots[idx] = isEraser ? "" : activeColor;
                                    updateNested(["idol", "memoArea", "dots"], newDots);
                                }
                            }}
                            style={{ backgroundColor: dotColor || 'transparent' }}
                            className={`transition-colors rounded-[2px] sm:rounded-sm border ${dotColor ? 'border-transparent shadow-sm' : 'border-zinc-200/60 bg-white hover:bg-zinc-100'} 
                                ${gridSize === 10 ? 'w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10' : gridSize === 15 ? 'w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7' : 'w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5'}
                            `}
                        />
                    ))}
                </div>
                <button 
                    type="button" 
                    onClick={() => {
                        if (window.confirm("캔버스를 모두 지우시겠습니까?")) {
                            updateNested(["idol", "memoArea", "dots"], Array(gridSize * gridSize).fill(""));
                        }
                    }} 
                    className="mt-6 px-5 py-2.5 bg-zinc-100 text-zinc-500 text-xs font-bold rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-colors"
                >
                    캔버스 초기화
                </button>
            </div>
        </div>
    </div>
  );
};

// ⭐️ 추가됨: 페르소나 설정용 컴포넌트 
export const PersonaEditTab = ({ formData, updateNested, DEFAULT_PERSONAS, TABS_CONFIG }) => {
    const userPersonas = formData.idol?.personas || DEFAULT_PERSONAS;
 
    return (
      <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-100">
             <h3 className="text-base font-black text-zinc-900 mb-2 flex items-center gap-2"><Layers size={16} className="text-indigo-500"/> 멀티 페르소나 편집</h3>
             <p className="text-[11px] md:text-xs text-zinc-500 font-medium mb-6">각각의 페르소나 모드에서 방문자에게 보여줄 탭을 자유롭게 켜고 끄세요. (공유 링크 및 다이어리 인덱스 스티커에 반영됩니다)</p>
 
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(DEFAULT_PERSONAS).map(pKey => {
                    if(pKey === 'all') return null; // 'all'은 편집 제외 (무조건 전체 표시)
                    const pData = userPersonas[pKey] || DEFAULT_PERSONAS[pKey];
                    return (
                        <div key={pKey} className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 shadow-sm transition-colors focus-within:bg-white focus-within:border-indigo-300">
                            <input 
                                value={pData.name} 
                                onChange={e => updateNested(["idol", "personas", pKey, "name"], e.target.value)} 
                                className="w-full bg-transparent text-sm font-black text-zinc-800 mb-1.5 outline-none border-b border-transparent focus:border-indigo-300"
                                placeholder="페르소나 이름"
                            />
                            <input 
                                value={pData.desc} 
                                onChange={e => updateNested(["idol", "personas", pKey, "desc"], e.target.value)} 
                                className="w-full bg-transparent text-[11px] font-bold text-zinc-500 mb-4 outline-none border-b border-transparent focus:border-indigo-300"
                                placeholder="간단한 설명"
                            />
                            <div className="flex flex-wrap gap-2">
                               {Object.keys(TABS_CONFIG).map(tabKey => {
                                   if (tabKey === 'persona') return null; 
                                   const isChecked = pData.tabs.includes(tabKey);
                                   return (
                                       <button 
                                            key={tabKey} 
                                            type="button"
                                            onClick={() => {
                                                let newTabs = [...pData.tabs];
                                                if (isChecked) newTabs = newTabs.filter(t => t !== tabKey);
                                                else newTabs.push(tabKey);
                                                updateNested(["idol", "personas", pKey, "tabs"], newTabs);
                                            }}
                                            className={`flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold rounded-lg border transition-all shadow-sm ${isChecked ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-zinc-400 border-zinc-200 hover:bg-zinc-100'}`}
                                        >
                                          {isChecked && <Check size={10} className="text-indigo-500"/>}
                                          {TABS_CONFIG[tabKey].label}
                                       </button>
                                   )
                               })}
                            </div>
                        </div>
                    )
                })}
             </div>
          </div>
      </div>
    )
 }