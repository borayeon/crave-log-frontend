import React, { useState, useRef } from 'react';
import { 
  Code, Briefcase, Trash2, Terminal, ExternalLink, Plus, 
  Calendar, History, ChevronDown, X as CloseIcon, UserPlus, 
  Image as ImageIcon, Upload, Loader2, Compass, Heart, 
  CreditCard, MessageSquare, Target, Quote, FileText, Grid, Eraser, 
  Layers, Check, Rocket, Eye, Lock, GraduationCap, Mic, LayoutList,
  Globe, Users, KeyRound, ShieldCheck, EyeOff
} from 'lucide-react';
import BusinessCard from './BusinessCard';
import { useAppStore } from '../../../store/AppStore';

export const DeveloperEditTab = ({ formData, updateNested, renderStringArrayInput }) => {
  const { currentLang } = useAppStore();

  return (
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
                placeholder={currentLang === 'zh' ? '撰写作为开发者的自我介绍。' : currentLang === 'en' ? 'Write an introduction as a developer.' : '개발자로서의 자기소개를 작성해보세요.'}
                className="w-full mt-2 bg-[#161B22] border border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-emerald-400 focus:border-emerald-500 outline-none resize-none placeholder:text-emerald-900/50 transition-colors" 
              />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#161B22] p-5 rounded-2xl border border-zinc-800">
                  <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-1.5"><Code size={14}/> Tech Stack</h4>
                  <div className="space-y-4">
                      {renderStringArrayInput("Backend", ["developer", "techStack", "backend"], currentLang === 'zh' ? '添加' : currentLang === 'en' ? 'Add' : '추가')}
                      {renderStringArrayInput("Database", ["developer", "techStack", "db"], currentLang === 'zh' ? '添加' : currentLang === 'en' ? 'Add' : '추가')}
                      {renderStringArrayInput("Frontend", ["developer", "techStack", "frontend"], currentLang === 'zh' ? '添加' : currentLang === 'en' ? 'Add' : '추가')}
                      {renderStringArrayInput("Tools", ["developer", "techStack", "tools"], currentLang === 'zh' ? '添加' : currentLang === 'en' ? 'Add' : '추가')}
                  </div>
              </div>
              <div className="bg-[#161B22] p-5 rounded-2xl border border-zinc-800 flex flex-col">
                  <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-1.5"><Code size={14}/> Currently Learning</h4>
                  <div className="flex-1">
                     {renderStringArrayInput(null, ["developer", "learning"], currentLang === 'zh' ? '输入正在学习的技术后按 Enter' : currentLang === 'en' ? 'Enter learning tech and press Enter' : '학습 중인 기술 입력 후 Enter')}
                  </div>
              </div>
          </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-zinc-200/60">
          <h3 className="text-base font-black text-zinc-900 mb-1 ml-1 flex items-center gap-2"><Rocket size={16} className="text-violet-500" /> Featured Projects</h3>
          <p className="text-[11px] text-zinc-500 font-medium ml-1 mb-5">
            {currentLang === 'zh' ? '注册代表性项目并连接链接以完善作品集。' : currentLang === 'en' ? 'Register key projects and add links to complete your portfolio.' : '대표 프로젝트를 등록하고 링크를 연결해 포트폴리오를 완성하세요.'}
          </p>
          
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
                            placeholder={currentLang === 'zh' ? '项目名称' : currentLang === 'en' ? 'Project Name' : '프로젝트명'} 
                        />
                        <textarea 
                            value={proj.desc} 
                            onChange={e => { const arr=[...(formData.developer?.projects||[])]; arr[idx].desc=e.target.value; updateNested(["developer","projects"], arr); }} 
                            className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-medium outline-none resize-none focus:border-violet-400 transition-colors" 
                            placeholder={currentLang === 'zh' ? '项目一句话简介及担任角色' : currentLang === 'en' ? 'One-line project description and your role' : '프로젝트 한 줄 설명 및 담당 역할'} 
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
                                placeholder={currentLang === 'zh' ? 'GitHub URL (可选)' : currentLang === 'en' ? 'GitHub URL (Optional)' : 'GitHub URL (선택)'} 
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <ExternalLink size={14} className="text-violet-400 shrink-0"/>
                            <input 
                                value={proj.liveUrl || ''} 
                                onChange={e => { const arr=[...(formData.developer?.projects||[])]; arr[idx].liveUrl=e.target.value; updateNested(["developer","projects"], arr); }} 
                                className="w-full bg-white border border-zinc-200 rounded-md px-2.5 py-1.5 text-[11px] outline-none focus:border-violet-400 transition-colors" 
                                placeholder={currentLang === 'zh' ? '线上(Live) URL (可选)' : currentLang === 'en' ? 'Live URL (Optional)' : '배포(Live) URL (선택)'} 
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
                  <span className="font-bold text-xs">{currentLang === 'zh' ? '添加新项目' : currentLang === 'en' ? 'Add New Project' : '새 프로젝트 추가'}</span>
              </button>
          </div>
      </div>
  </div>
  );
};

export const CareerEditTab = ({ formData, updateNested, renderArrayInput }) => {
  const { currentLang } = useAppStore();

  return (
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
                  placeholder={currentLang === 'zh' ? '例: 资深后端工程师' : currentLang === 'en' ? 'e.g., Lead Backend Engineer' : '예: 리드 백엔드 엔지니어'}
                />
            </div>
            <div>{renderArrayInput("Tech Stack", ["career", "techStack"], currentLang === 'zh' ? '输入所需技术后按 Enter' : currentLang === 'en' ? 'Enter required skill and press Enter' : '필요 기술 입력 후 Enter')}</div>
            <div>{renderArrayInput(currentLang === 'zh' ? 'Interests (关注领域)' : currentLang === 'en' ? 'Interests' : 'Interests (관심 분야)', ["career", "interests"], currentLang === 'zh' ? '输入关注领域后按 Enter' : currentLang === 'en' ? 'Enter interest area and press Enter' : '관심 분야 입력 후 Enter')}</div>
        </div>
        
        <div className="w-full md:w-1/3 space-y-3">
            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1.5 block">Short Term Goal</label>
                <textarea value={formData.career?.careerGoals?.short || ''} onChange={e => updateNested(["career", "careerGoals", "short"], e.target.value)} rows={2} className="w-full bg-white border border-blue-100 rounded-lg px-3 py-2 text-xs font-bold text-blue-900 outline-none focus:border-blue-300 resize-none transition-colors" placeholder={currentLang === 'zh' ? '短期目标' : currentLang === 'en' ? 'Short-term Goal' : '단기 목표'} />
            </div>
            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1.5 block">Mid Term Goal</label>
                <textarea value={formData.career?.careerGoals?.mid || ''} onChange={e => updateNested(["career", "careerGoals", "mid"], e.target.value)} rows={2} className="w-full bg-white border border-blue-100 rounded-lg px-3 py-2 text-xs font-bold text-blue-900 outline-none focus:border-blue-300 resize-none transition-colors" placeholder={currentLang === 'zh' ? '中期目标' : currentLang === 'en' ? 'Mid-term Goal' : '중기 목표'} />
            </div>
            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1.5 block">Long Term Goal</label>
                <textarea value={formData.career?.careerGoals?.long || ''} onChange={e => updateNested(["career", "careerGoals", "long"], e.target.value)} rows={2} className="w-full bg-white border border-blue-100 rounded-lg px-3 py-2 text-xs font-bold text-blue-900 outline-none focus:border-blue-300 resize-none transition-colors" placeholder={currentLang === 'zh' ? '长期目标' : currentLang === 'en' ? 'Long-term Goal' : '장기 목표'} />
            </div>
        </div>
    </div>

    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-zinc-200/60">
      <h3 className="text-base font-black text-zinc-900 mb-4 ml-1 flex items-center gap-2"><Briefcase size={16} className="text-blue-500" /> {currentLang === 'zh' ? 'Strengths (优势)' : currentLang === 'en' ? 'Strengths' : 'Strengths (강점)'}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(formData.career?.strengths || []).map((str, idx) => (
              <div key={idx} className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200/80 shadow-sm relative flex gap-3">
                  <button type="button" onClick={()=>{const arr=[...(formData.career?.strengths||[])]; arr.splice(idx,1); updateNested(["career","strengths"], arr);}} className="absolute top-4 right-4 text-zinc-400 hover:text-rose-500 bg-white border border-zinc-200 p-1 rounded-lg transition-colors"><Trash2 size={12}/></button>
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">{idx+1}</div>
                  <div className="flex-1 pr-6 flex flex-col gap-2">
                      <input value={str.title} onChange={e => { const arr=[...(formData.career?.strengths||[])]; arr[idx].title=e.target.value; updateNested(["career","strengths"], arr); }} className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm font-black text-zinc-900 outline-none focus:border-blue-300 transition-colors" placeholder={currentLang === 'zh' ? '核心能力' : currentLang === 'en' ? 'Core Competence' : '핵심 역량'} />
                      <textarea value={str.desc} onChange={e => { const arr=[...(formData.career?.strengths||[])]; arr[idx].desc=e.target.value; updateNested(["career","strengths"], arr); }} className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[11px] font-medium text-zinc-600 outline-none resize-none focus:border-blue-300 transition-colors" placeholder={currentLang === 'zh' ? '详细说明' : currentLang === 'en' ? 'Detailed Description' : '상세 설명'} rows={3} />
                  </div>
              </div>
          ))}
          <button type="button" onClick={()=>{const arr=[...(formData.career?.strengths||[]), {title:"", desc:""}]; updateNested(["career","strengths"], arr);}} className="min-h-[140px] flex flex-col items-center justify-center gap-2 border-2 border-dashed border-zinc-200 rounded-2xl text-zinc-400 hover:text-blue-500 hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <Plus size={24} />
              <span className="font-bold text-xs">{currentLang === 'zh' ? '添加优势' : currentLang === 'en' ? 'Add Strength' : '강점 추가'}</span>
          </button>
      </div>
    </div>
  </div>
  );
};

export const AddProfileEditTab = ({ formData, updateNested, renderInput, renderArrayInput, isExtraImageUploading, handleExtraImageUpload, handleCommitProfile, setViewHistoryItem }) => {
  const { currentLang } = useAppStore();
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

  return (
    <div className="space-y-4 animate-in fade-in">
      <div className="flex flex-col gap-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-indigo-50/50 p-5 rounded-3xl border border-indigo-100 shadow-sm">
             <div>
               <h4 className="text-sm font-black text-indigo-800 flex items-center gap-1.5"><History size={16}/> Profile Version History</h4>
               <p className="text-[10px] text-indigo-600/80 mt-1 font-bold">
                 {currentLang === 'zh' ? '可将下方输入的内容按特定日期固定存档。' : currentLang === 'en' ? 'You can freeze and pin the profile contents below based on a specific date.' : '하단에 입력한 내용들을 특정 날짜를 기준으로 고정할 수 있습니다.'}
               </p>
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
                    {currentLang === 'zh' ? '存档当前记录' : currentLang === 'en' ? 'Freeze Current Record' : '현재 기록 고정하기'}
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
                          <History size={14}/> {currentLang === 'zh' ? `已存档的历史记录 (${formData.idol.history.length}个)` : currentLang === 'en' ? `Archived Records (${formData.idol.history.length})` : `고정된 이전 기록 (${formData.idol.history.length}개)`}
                      </span>
                      <ChevronDown size={14} className={`text-zinc-400 transition-transform ${isHistoryExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isHistoryExpanded && (
                      <div className="p-3 border-t border-zinc-200 flex flex-wrap gap-2 max-h-40 overflow-y-auto bg-white">
                          {formData.idol.history.map((h, i) => (
                              <div key={h.id || i} className="shrink-0 bg-white border border-zinc-200 rounded-lg py-1.5 pl-3 pr-2 flex items-center gap-2 shadow-sm group">
                                  <button type="button" onClick={() => setViewHistoryItem(h)} className="text-[10px] font-black text-indigo-500 hover:text-indigo-700 hover:underline">
                                    {currentLang === 'zh' ? `查看 ${h.date} 记录` : currentLang === 'en' ? `View ${h.date} record` : `${h.date} 기록 확인`}
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
                          <span className="text-[8px] font-bold">{currentLang === 'zh' ? '添加/更换照片' : currentLang === 'en' ? 'Add/Change Photo' : '사진 추가/변경'}</span>
                          <input type="file" accept="image/*" onChange={handleExtraImageUpload} className="hidden" disabled={isExtraImageUploading} />
                      </label>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-400 mt-3">{currentLang === 'zh' ? '附加个人资料照片' : currentLang === 'en' ? 'Extra Profile Photo' : '추가 프로필 사진'}</span>
              </div>

              <div className="space-y-4">
                  {renderInput("MBTI / Personality", ["idol", "mbti"], currentLang === 'zh' ? '例: ESTP' : currentLang === 'en' ? 'e.g., ESTP' : '예: ESTP')}
                  <div className="grid grid-cols-2 gap-3">
                      {renderInput(currentLang === 'zh' ? '血型' : currentLang === 'en' ? 'Blood Type' : '혈액형', ["idol", "bloodType"], currentLang === 'zh' ? '例: O型' : currentLang === 'en' ? 'e.g., O' : '예: O형')}
                      {renderInput(currentLang === 'zh' ? '身高' : currentLang === 'en' ? 'Height' : '키', ["idol", "height"], currentLang === 'zh' ? '例: 175cm' : currentLang === 'en' ? 'e.g., 175cm' : '예: 175cm')}
                  </div>
                  {renderInput(currentLang === 'zh' ? '宗教' : currentLang === 'en' ? 'Religion' : '종교', ["idol", "religion"], currentLang === 'zh' ? '例: 无宗教' : currentLang === 'en' ? 'e.g., None' : '예: 무교')}
                  {renderInput(currentLang === 'zh' ? '感情状态' : currentLang === 'en' ? 'Relationship Status' : '연애 여부', ["idol", "relationship"], currentLang === 'zh' ? '例: 单身, 恋爱中' : currentLang === 'en' ? 'e.g., Single, In a relationship' : '예: 비혼, 연애 중')}
                  {renderInput(currentLang === 'zh' ? '掌握语言' : currentLang === 'en' ? 'Languages' : '사용하는 언어', ["idol", "languages"], currentLang === 'zh' ? '例: 韩语, 英语, 中文' : currentLang === 'en' ? 'e.g., Korean, English, Chinese' : '예: 한국어, 일본어')}
              </div>
          </div>

          <div className="md:col-span-2 space-y-4">
              <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-zinc-200/60">
                  <h3 className="text-sm font-black text-zinc-900 mb-4 flex items-center gap-2"><Compass size={14} className="text-blue-500"/> Lifestyle & Work</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 gap-1.5 sm:col-span-2">
                        {renderInput(currentLang === 'zh' ? '座右铭' : currentLang === 'en' ? 'Motto' : '좌우명', ["idol", "motto"], currentLang === 'zh' ? '例: 既然无法回避，不如享受其中' : currentLang === 'en' ? 'e.g., Make every day count' : '예: 피할 수 없으면 즐겨라')}
                      </div>
                      <div className="flex flex-col bg-zinc-50 p-4 rounded-xl border border-zinc-200/60 gap-1.5">
                        {renderInput(currentLang === 'zh' ? '最近的爱好' : currentLang === 'en' ? 'Recent Hobby' : '최근 취미', ["idol", "recentHobby"], currentLang === 'zh' ? '例: 攀岩, 烘焙' : currentLang === 'en' ? 'e.g., Bouldering, Baking' : '예: 클라이밍, 베이킹')}
                      </div>
                      <div className="flex flex-col bg-zinc-50 p-4 rounded-xl border border-zinc-200/60 gap-1.5">
                        {renderInput("Working Style", ["idol", "workingStyle"], currentLang === 'zh' ? '例: 夜猫子' : currentLang === 'en' ? 'e.g., Night Owl' : '예: 올빼미족')}
                      </div>
                      <div className="flex flex-col bg-zinc-50 p-4 rounded-xl border border-zinc-200/60 gap-1.5">
                        {renderInput(currentLang === 'zh' ? '活跃时间段' : currentLang === 'en' ? 'Active Hours' : '활동 시간대', ["idol", "activeHours"], currentLang === 'zh' ? '例: 晚上8点 ~ 凌晨2点' : currentLang === 'en' ? 'e.g., 8 PM ~ 2 AM' : '예: 저녁 8시 ~ 새벽 2시')}
                      </div>
                      <div className="flex flex-col bg-zinc-50 p-4 rounded-xl border border-zinc-200/60 gap-1.5">
                          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5">
                            {currentLang === 'zh' ? '联系意向' : currentLang === 'en' ? 'Contact Availability' : '연락 가능 여부'}
                          </label>
                          <div className="flex bg-zinc-50 border border-zinc-200 rounded-xl p-1 gap-1 max-w-sm">
                              {[
                                { key: '적극', label: currentLang === 'zh' ? '积极' : currentLang === 'en' ? 'Open' : '적극' },
                                { key: '중간', label: currentLang === 'zh' ? '一般' : currentLang === 'en' ? 'Moderate' : '중간' },
                                { key: '소극', label: currentLang === 'zh' ? '少' : currentLang === 'en' ? 'Selective' : '소극' }
                              ].map(({ key, label }) => (
                                  <button
                                      key={key}
                                      type="button"
                                      onClick={() => updateNested(["idol", "contact"], key)}
                                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.idol?.contact === key ? 'bg-white shadow-sm text-violet-600 border border-violet-200' : 'text-zinc-500 hover:bg-zinc-100'}`}
                                  >
                                      {label}
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
                        {renderArrayInput("Hobbies & Interests", ["idol", "tastes", "hobbies"], currentLang === 'zh' ? '输入后按 Enter' : currentLang === 'en' ? 'Press Enter to add' : '입력 후 Enter')}
                      </div>
                      <div className="p-3 bg-orange-50/50 rounded-2xl border border-orange-100/50">
                        {renderArrayInput("Culture (Music/Movies)", ["idol", "tastes", "culture"], currentLang === 'zh' ? '输入后按 Enter' : currentLang === 'en' ? 'Press Enter to add' : '입력 후 Enter')}
                      </div>
                      <div className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                        {renderArrayInput("Food & Drink", ["idol", "tastes", "foods"], currentLang === 'zh' ? '输入后按 Enter' : currentLang === 'en' ? 'Press Enter to add' : '입력 후 Enter')}
                      </div>
                      <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                        {renderArrayInput("Lifestyle & Places", ["idol", "tastes", "lifestyle"], currentLang === 'zh' ? '输入后按 Enter' : currentLang === 'en' ? 'Press Enter to add' : '입력 후 Enter')}
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export const BusinessCardEditTab = ({ formData, updateNested, renderInput }) => {
  const { currentLang } = useAppStore();

  return (
  <div className="space-y-6 animate-in fade-in">
      <div className="bg-zinc-50 rounded-3xl p-6 md:p-10 border border-zinc-200/80 shadow-inner flex flex-col items-center justify-center">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6">Live Card Preview</p>
          <BusinessCard data={formData.idol?.businessCard} userName={formData.name} />
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-100">
          <h3 className="text-base font-black text-zinc-900 mb-5 flex items-center gap-2">
            <CreditCard size={16} className="text-emerald-500"/> {currentLang === 'zh' ? '名片信息编辑' : currentLang === 'en' ? 'Edit Business Card' : '명함 정보 편집'}
          </h3>
          
          <div className="mb-6">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">
                {currentLang === 'zh' ? '名片主题风格' : currentLang === 'en' ? 'Card Theme Style' : '명함 테마 스타일'}
              </label>
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
              {renderInput(currentLang === 'zh' ? '公司/团队 (Company / Team)' : currentLang === 'en' ? 'Company / Team' : '소속 (Company / Team)', ["idol", "businessCard", "company"], currentLang === 'zh' ? '公司或团队名' : currentLang === 'en' ? 'Company or team name' : '소속명')}
              {renderInput(currentLang === 'zh' ? '职位 (Position / Role)' : currentLang === 'en' ? 'Position / Role' : '직책 (Position / Role)', ["idol", "businessCard", "position"], currentLang === 'zh' ? '职位名称' : currentLang === 'en' ? 'Position title' : '직책')}
              {renderInput(currentLang === 'zh' ? '邮箱 (Email)' : currentLang === 'en' ? 'Email' : '이메일 (Email)', ["idol", "businessCard", "email"], currentLang === 'zh' ? '电子邮箱地址' : currentLang === 'en' ? 'Email address' : '이메일 주소')}
              {renderInput(currentLang === 'zh' ? '电话 (Phone)' : currentLang === 'en' ? 'Phone' : '연락처 (Phone)', ["idol", "businessCard", "phone"], currentLang === 'zh' ? '电话号码' : currentLang === 'en' ? 'Phone number' : '전화번호')}
              <div className="sm:col-span-2">
                  {renderInput(currentLang === 'zh' ? '个人网站 (Website / Link)' : currentLang === 'en' ? 'Website / Link' : '개인 웹사이트 (Website / Link)', ["idol", "businessCard", "website"], currentLang === 'zh' ? '网址链接' : currentLang === 'en' ? 'Website URL' : '웹사이트 링크')}
              </div>
              <div className="sm:col-span-2">
                  {renderInput(currentLang === 'zh' ? '地址 (Address / Location)' : currentLang === 'en' ? 'Address / Location' : '위치 (Address / Location)', ["idol", "businessCard", "address"], currentLang === 'zh' ? '办公室地址或活动区域' : currentLang === 'en' ? 'Office address or city' : '사무실 주소 또는 활동 지역')}
              </div>
          </div>
      </div>
  </div>
  );
};

export const QnaEditTab = ({ formData, updateNested }) => {
  const { currentLang } = useAppStore();

  return (
  <div className="animate-in fade-in p-6 md:p-8 bg-white rounded-3xl border border-zinc-100 shadow-sm">
      <h3 className="text-base font-black text-zinc-900 mb-1 flex items-center gap-2"><MessageSquare size={16} className="text-violet-500"/> {currentLang === 'zh' ? '填写 100 问 100 答' : currentLang === 'en' ? '100 Q&A Questions' : '100문 100답 작성'}</h3>
      <p className="text-[11px] text-zinc-500 font-medium mb-5">{currentLang === 'zh' ? '添加属于您自己的奇特有趣的问答。' : currentLang === 'en' ? 'Add your own fun and quirky questions and answers.' : '나만의 엉뚱하고 재미있는 질문과 답변을 추가해보세요.'}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(formData.idol?.qna || []).map((item, idx) => (
            <div key={idx} className="flex flex-col gap-2.5 bg-violet-50/30 p-5 rounded-2xl border border-violet-100/50 relative overflow-hidden hover:bg-violet-50 hover:shadow-sm transition-all duration-300">
                <button type="button" onClick={()=>{const arr=[...(formData.idol?.qna||[])]; arr.splice(idx,1); updateNested(["idol", "qna"], arr);}} className="absolute top-4 right-4 text-violet-300 hover:text-rose-500 bg-white border border-violet-100 p-1.5 rounded-lg transition-colors z-10"><Trash2 size={12}/></button>
                
                <div>
                  <label className="text-[9px] font-black text-violet-400 uppercase tracking-widest mb-1 block">Question</label>
                  <input value={item.q} onChange={e => { const arr=[...(formData.idol?.qna||[])]; arr[idx].q=e.target.value; updateNested(["idol", "qna"], arr); }} className="w-full bg-white border border-violet-200 rounded-xl px-3 py-2 text-xs font-bold text-violet-900 outline-none focus:border-violet-400 pr-10 transition-colors" placeholder={currentLang === 'zh' ? '例: 去无人岛要带的3样东西是？' : currentLang === 'en' ? 'e.g., 3 things you would bring to a deserted island?' : '예: 무인도에 가져갈 3가지는?'} />
                </div>
                <div>
                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1 block">Answer</label>
                  <textarea value={item.a} onChange={e => { const arr=[...(formData.idol?.qna||[])]; arr[idx].a=e.target.value; updateNested(["idol", "qna"], arr); }} className="w-full bg-white border border-violet-200 rounded-xl px-3 py-2 text-[11px] font-medium text-zinc-800 outline-none focus:border-violet-400 resize-none transition-colors" placeholder={currentLang === 'zh' ? '请输入回答' : currentLang === 'en' ? 'Write your answer' : '답변을 작성하세요'} rows={2} />
                </div>
            </div>
        ))}
        
        <button type="button" onClick={()=>{const arr=[...(formData.idol?.qna||[]), {q:"", a:""}]; updateNested(["idol", "qna"], arr);}} className="min-h-[140px] flex flex-col items-center justify-center gap-2 border-2 border-dashed border-violet-200 rounded-2xl text-violet-400 hover:text-violet-600 hover:border-violet-400 hover:bg-violet-50 transition-colors">
            <Plus size={24} />
            <span className="font-bold text-xs">{currentLang === 'zh' ? '添加新 Q&A' : currentLang === 'en' ? 'Add New Q&A' : '새로운 Q&A 추가'}</span>
        </button>
      </div>
  </div>
  );
};

export const HobbyEditTab = ({ formData, updateNested, renderInput, renderArrayInput, isHobbyImageUploading, handleHobbyImageUpload }) => {
  const { currentLang } = useAppStore();
  const [hobbyImageInputType, setHobbyImageInputType] = useState('file');

  return (
    <div className="animate-in fade-in p-6 md:p-8 bg-white rounded-3xl shadow-sm border border-zinc-100">
        <h3 className="text-base font-black text-zinc-900 mb-1 flex items-center gap-2"><Target size={16} className="text-amber-500"/> {currentLang === 'zh' ? '兴趣介绍模块' : currentLang === 'en' ? 'Hobby Introduction' : '취미 소개 섹션'}</h3>
        <p className="text-[11px] text-zinc-500 font-medium mb-5">{currentLang === 'zh' ? '深入介绍最能代表你的一个爱好。' : currentLang === 'en' ? 'Deeply introduce one hobby that best represents you.' : '나를 가장 잘 나타내는 취미 하나를 깊게 소개해보세요.'}</p>
        
        <div className="bg-amber-50/30 p-5 rounded-2xl border border-amber-100/50 space-y-5">
          {renderInput(currentLang === 'zh' ? '兴趣标题 (Headline)' : currentLang === 'en' ? 'Hobby Headline' : '취미 제목 (Headline)', ["idol", "hobby", "title"], currentLang === 'zh' ? '例: 胶片相机与小巷漫步' : currentLang === 'en' ? 'e.g., Film cameras & alley walks' : '예: 필름 카메라와 골목길 산책')}
          
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
                      <span className="text-[8px] font-bold">{currentLang === 'zh' ? '上传' : currentLang === 'en' ? 'Upload' : '업로드'}</span>
                      <input type="file" accept="image/*" onChange={handleHobbyImageUpload} className="hidden" disabled={isHobbyImageUploading} />
                  </label>
              </div>
              <div className="flex-1 w-full space-y-2">
                  <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest block">{currentLang === 'zh' ? '背景图片来源' : currentLang === 'en' ? 'Background Image Source' : '배경 이미지 소스'}</label>
                  <div className="flex bg-amber-100/50 p-0.5 rounded-lg w-max mb-1">
                      <button type="button" onClick={() => setHobbyImageInputType('file')} className={`px-3 py-1 text-[10px] font-bold rounded-md transition ${hobbyImageInputType === 'file' ? 'bg-white shadow-sm text-amber-700' : 'text-amber-600 hover:bg-amber-200/50'}`}>{currentLang === 'zh' ? '上传文件' : currentLang === 'en' ? 'Upload File' : '파일 업로드'}</button>
                      <button type="button" onClick={() => setHobbyImageInputType('url')} className={`px-3 py-1 text-[10px] font-bold rounded-md transition ${hobbyImageInputType === 'url' ? 'bg-white shadow-sm text-amber-700' : 'text-amber-600 hover:bg-amber-200/50'}`}>{currentLang === 'zh' ? '网页 URL' : currentLang === 'en' ? 'Web URL' : '웹 URL'}</button>
                  </div>
                  {hobbyImageInputType === 'file' ? (
                      <p className="text-[10px] font-medium text-zinc-500 bg-zinc-50 p-2 rounded-lg border border-zinc-100">{currentLang === 'zh' ? '点击左侧图片上传本地文件。' : currentLang === 'en' ? 'Click on the left image to upload a file from your device.' : '좌측 이미지를 클릭하여 PC의 파일을 업로드하세요.'}</p>
                  ) : (
                      <input type="text" placeholder="https://..." value={formData.idol?.hobby?.image || ''} onChange={e => updateNested(["idol", "hobby", "image"], e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-400 transition-colors" />
                  )}
              </div>
          </div>
          
          <div>
              <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-1.5">{currentLang === 'zh' ? '详细说明 (Description)' : currentLang === 'en' ? 'Description' : '상세 설명 (Description)'}</label>
              <textarea value={formData.idol?.hobby?.description || ''} onChange={e => updateNested(["idol", "hobby", "description"], e.target.value)} rows={3} className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2.5 text-xs font-medium outline-none focus:border-amber-400 resize-none transition-colors" placeholder={currentLang === 'zh' ? '请写下为什么喜欢这个爱好，它有什么魅力。' : currentLang === 'en' ? 'Explain why you love this hobby and its unique charms.' : '이 취미를 왜 좋아하는지, 어떤 매력이 있는지 적어주세요.'} />
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-amber-100">
            {renderArrayInput(currentLang === 'zh' ? '相关关键词 (Tags)' : currentLang === 'en' ? 'Tags' : '관련 키워드 (Tags)', ["idol", "hobby", "keywords"], currentLang === 'zh' ? '输入关键词后按 Enter' : currentLang === 'en' ? 'Enter keyword and press Enter' : '키워드 입력 후 Enter')}
          </div>
        </div>
    </div>
  );
};

export const QuotesEditTab = ({ formData, updateNested }) => {
  const { currentLang } = useAppStore();

  return (
  <div className="animate-in fade-in p-6 md:p-8 bg-white rounded-3xl border border-zinc-100 shadow-sm">
      <h3 className="text-base font-black text-zinc-900 mb-1 flex items-center gap-2"><Quote size={16} className="text-slate-400"/> {currentLang === 'zh' ? '喜爱的名言收集' : currentLang === 'en' ? 'Favorite Quotes' : '좋아하는 명언 모음'}</h3>
      <p className="text-[11px] text-zinc-500 font-medium mb-5">{currentLang === 'zh' ? '记录给您带来灵感的句子或座右铭。' : currentLang === 'en' ? 'Record quotes and mottos that inspire you.' : '나에게 영감을 주는 문장이나 좌우명을 기록해두세요.'}</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {(formData.idol?.quotes || []).map((item, idx) => (
            <div key={idx} className="flex flex-col gap-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm relative group transition-colors hover:bg-white">
                <button type="button" onClick={()=>{const arr=[...(formData.idol?.quotes||[])]; arr.splice(idx,1); updateNested(["idol", "quotes"], arr);}} className="absolute top-3 right-3 text-slate-300 hover:text-rose-500 bg-white border border-slate-100 p-1 rounded-lg transition-colors z-10"><Trash2 size={12}/></button>
                
                <textarea 
                  value={item.text} 
                  onChange={e => { const arr=[...(formData.idol?.quotes||[])]; arr[idx].text=e.target.value; updateNested(["idol", "quotes"], arr); }} 
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none resize-none focus:border-slate-400 pr-8 transition-colors" 
                  placeholder={currentLang === 'zh' ? '名言内容' : currentLang === 'en' ? 'Quote content' : '명언 내용'} 
                  rows={3}
                />
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 focus-within:border-slate-400 transition-colors">
                  <span className="text-[10px] font-black text-slate-300">-</span>
                  <input 
                    value={item.author} 
                    onChange={e => { const arr=[...(formData.idol?.quotes||[])]; arr[idx].author=e.target.value; updateNested(["idol", "quotes"], arr); }} 
                    className="flex-1 bg-transparent text-[11px] font-bold text-slate-600 outline-none" 
                    placeholder={currentLang === 'zh' ? '作者或出处' : currentLang === 'en' ? 'Author or source' : '작성자 또는 출처'} 
                  />
                </div>
            </div>
        ))}
        
        <button type="button" onClick={()=>{const arr=[...(formData.idol?.quotes||[]), {text:"", author:""}]; updateNested(["idol", "quotes"], arr);}} className="min-h-[130px] flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:text-slate-600 hover:border-slate-400 hover:bg-slate-50 transition-colors">
            <Plus size={24} />
            <span className="font-bold text-xs">{currentLang === 'zh' ? '添加新名言' : currentLang === 'en' ? 'Add New Quote' : '새 명언 추가'}</span>
        </button>
      </div>
  </div>
  );
};

export const MemoEditTab = ({ formData, updateNested }) => {
  const { currentLang } = useAppStore();

  return (
  <div className="space-y-6 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-100">
          <h3 className="text-base font-black text-zinc-900 mb-2 flex items-center gap-2"><FileText size={16} className="text-amber-500"/> {currentLang === 'zh' ? '自由备忘录' : currentLang === 'en' ? 'Free Memo' : '자유 메모장'}</h3>
          <p className="text-[11px] text-zinc-500 font-medium mb-5">{currentLang === 'zh' ? '留下想对访客说的话，或任何形式的随笔文字。' : currentLang === 'en' ? 'Leave a note for visitors or write any freeform text.' : '방문자에게 전하고 싶은 말이나, 자유로운 형태의 텍스트를 남겨보세요.'}</p>
          <textarea 
              value={formData.idol?.memoArea?.text || ''} 
              onChange={e => updateNested(["idol", "memoArea", "text"], e.target.value)} 
              rows={8} 
              className="w-full bg-amber-50/30 border border-amber-100/50 rounded-xl px-5 py-4 text-sm font-medium text-zinc-800 outline-none focus:bg-white focus:border-amber-400 resize-none transition-colors shadow-sm" 
              placeholder={currentLang === 'zh' ? '随心书写...' : currentLang === 'en' ? 'Write freely...' : '자유롭게 글을 작성해보세요...'} 
          />
      </div>
  </div>
  );
};

const PALETTE = ['#ef4444', '#f97316', '#f59e0b', '#22c55e', '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#3f3f46'];

export const ArtEditTab = ({ formData, updateNested }) => {
  const { currentLang } = useAppStore();
  const [activeColor, setActiveColor] = useState(PALETTE[8]);
  const [isEraser, setIsEraser] = useState(false);
  const isDrawingRef = useRef(false);

  const gridSize = formData.idol?.memoArea?.gridSize || 15;
  const dots = formData.idol?.memoArea?.dots || Array(gridSize * gridSize).fill("");

  return (
    <div className="space-y-6 animate-in fade-in">
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-100 flex flex-col items-center">
            <h3 className="text-base font-black text-zinc-900 mb-2 w-full flex items-center gap-2"><Grid size={16} className="text-pink-500"/> {currentLang === 'zh' ? '像素艺术画布 (Pixel Art)' : currentLang === 'en' ? 'Pixel Art Canvas' : '도트 캔버스 (Pixel Art)'}</h3>
            <p className="text-[11px] text-zinc-500 font-medium mb-6 w-full">{currentLang === 'zh' ? '选择颜色，点击或拖动画笔来进行绘画。' : currentLang === 'en' ? 'Pick a color, then click or drag to draw.' : '색상을 선택하고 클릭하거나 드래그하여 그림을 그려보세요.'}</p>
            
            <div className="w-full flex items-center justify-between bg-zinc-50 p-3 rounded-2xl border border-zinc-200 mb-6">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-2 hidden sm:block">{currentLang === 'zh' ? '网格大小 (Grid Size)' : currentLang === 'en' ? 'Grid Size' : '그리드 크기 (Grid Size)'}</span>
                <div className="flex gap-2 w-full sm:w-auto">
                    {[10, 15, 20].map(size => (
                        <button
                            key={size}
                            type="button"
                            onClick={() => {
                                const confirmMsg = currentLang === 'zh' ? '更改大小将重置现有画布。确定要更改吗？' : currentLang === 'en' ? 'Changing the grid size will clear the canvas. Do you want to continue?' : '크기를 변경하면 기존 캔버스가 초기화됩니다. 변경하시겠습니까?';
                                if (size !== gridSize && window.confirm(confirmMsg)) {
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
                    <span className="hidden sm:inline">{currentLang === 'zh' ? '橡皮擦' : currentLang === 'en' ? 'Eraser' : '지우개'}</span>
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
                        const clearMsg = currentLang === 'zh' ? '确定要清空画布吗？' : currentLang === 'en' ? 'Clear the entire canvas?' : '캔버스를 모두 지우시겠습니까?';
                        if (window.confirm(clearMsg)) {
                            updateNested(["idol", "memoArea", "dots"], Array(gridSize * gridSize).fill(""));
                        }
                    }} 
                    className="mt-6 px-5 py-2.5 bg-zinc-100 text-zinc-500 text-xs font-bold rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-colors"
                >
                    {currentLang === 'zh' ? '清空画布' : currentLang === 'en' ? 'Clear Canvas' : '캔버스 초기화'}
                </button>
            </div>
        </div>
    </div>
  );
};

export const PersonaEditTab = ({ formData, updateNested, DEFAULT_PERSONAS, TABS_CONFIG }) => {
    const { currentLang } = useAppStore();
    const userPersonas = formData.idol?.personas || DEFAULT_PERSONAS;

    const SECURITY_LEVELS = [
      { level: 0, label: currentLang === 'zh' ? '全员公开' : currentLang === 'en' ? 'Public' : '전체 공개', desc: currentLang === 'zh' ? '任何人' : currentLang === 'en' ? 'Anyone' : '누구나', icon: Globe, activeBg: 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500' },
      { level: 1, label: currentLang === 'zh' ? '粉丝公开' : currentLang === 'en' ? 'Followers' : '팔로워 공개', desc: currentLang === 'zh' ? '仅粉丝' : currentLang === 'en' ? 'Followers only' : '팔로워만', icon: Users, activeBg: 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500' },
      { level: 2, label: currentLang === 'zh' ? '密码锁定' : currentLang === 'en' ? 'Passcode' : '비밀번호 잠금', desc: currentLang === 'zh' ? '设置PIN' : currentLang === 'en' ? 'PIN code' : 'PIN 설정', icon: KeyRound, activeBg: 'bg-amber-50 border-amber-500 text-amber-700 ring-1 ring-amber-500' },
      { level: 4, label: currentLang === 'zh' ? '仅自己' : currentLang === 'en' ? 'Private' : '나만 보기', desc: currentLang === 'zh' ? '私密' : currentLang === 'en' ? 'Only me' : '비공개', icon: Lock, activeBg: 'bg-rose-50 border-rose-500 text-rose-700 ring-1 ring-rose-500' },
    ];

    const personaKeys = Object.keys(DEFAULT_PERSONAS).filter(k => k !== 'all');
    
    // 활성화된 페르소나와 비활성화된 페르소나 구분
    const activePersonaKeys = personaKeys.filter(k => {
      const pData = userPersonas[k] || DEFAULT_PERSONAS[k];
      return pData.isActive !== false;
    });

    const inactivePersonaKeys = personaKeys.filter(k => {
      const pData = userPersonas[k] || DEFAULT_PERSONAS[k];
      return pData.isActive === false;
    });

    // 페르소나 비활성화 핸들러
    const handleDeactivate = (pKey) => {
      if (activePersonaKeys.length <= 1) {
        alert(currentLang === 'zh' ? '必须保持至少1个人格处于激活状态。' : currentLang === 'en' ? 'At least one persona must remain active.' : '최소 1개 이상의 페르소나는 활성화 상태로 유지되어야 합니다.');
        return;
      }
      const pData = userPersonas[pKey] || DEFAULT_PERSONAS[pKey];
      const deactMsg = currentLang === 'zh' 
        ? `'${pData.name}' 人格确定要停用吗？\n\n(将从个人资料顶部标签中完全隐藏，可随时在下方的'已停用的人格'列表中重新启用。)`
        : currentLang === 'en'
        ? `Are you sure you want to deactivate '${pData.name}'?\n\n(It will be hidden from profile tabs and can be re-enabled anytime below.)`
        : `'${pData.name}' 페르소나를 비활성화하시겠습니까?\n\n(프로필 상단 탭에서 완전히 숨겨지며, 언제든 하단의 '비활성화된 페르소나' 목록에서 다시 켤 수 있습니다.)`;
      if (window.confirm(deactMsg)) {
        updateNested(["idol", "personas", pKey, "isActive"], false);
      }
    };

    // 페르소나 다시 활성화 핸들러
    const handleActivate = (pKey) => {
      updateNested(["idol", "personas", pKey, "isActive"], true);
    };
 
    return (
      <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-100">
             <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                   <Layers size={16} className="text-indigo-500"/>
                   <h3 className="text-base font-black text-zinc-900">{currentLang === 'zh' ? '多重人格管理' : currentLang === 'en' ? 'Multi-Persona Settings' : '멀티 페르소나 편집'}</h3>
                   <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {currentLang === 'zh' ? `已激活 ${activePersonaKeys.length}个` : currentLang === 'en' ? `Active (${activePersonaKeys.length})` : `활성 ${activePersonaKeys.length}개`}
                   </span>
                </div>
                {inactivePersonaKeys.length > 0 && (
                   <span className="text-[11px] font-bold text-zinc-400">
                      {currentLang === 'zh' ? `已停用 ${inactivePersonaKeys.length}个` : currentLang === 'en' ? `Inactive (${inactivePersonaKeys.length})` : `비활성화 ${inactivePersonaKeys.length}개`}
                   </span>
                )}
             </div>
             <p className="text-[11px] md:text-xs text-zinc-500 font-medium mb-6">
                {currentLang === 'zh' ? (
                  <>设置每个人格的<strong>4级公开范围（全员 / 粉丝 / PIN / 仅自己）</strong>，不需要的人格可<strong>[停用]</strong>隐藏。</>
                ) : currentLang === 'en' ? (
                  <>Configure the <strong>4-level visibility (Public / Followers / PIN / Private)</strong> for each persona, and hide unused ones with <strong>[Deactivate]</strong>.</>
                ) : (
                  <>각 페르소나의 <strong>4단계 공개 범위(전체 / 팔로워 / PIN / 나만보기)</strong>를 설정하고, 사용하지 않는 페르소나는 <strong>[비활성화]</strong>하여 프로필에서 깔끔하게 숨길 수 있습니다.</>
                )}
             </p>
 
             {/* ⭐️ 활성화된 페르소나 카드 그리드 */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {activePersonaKeys.map(pKey => {
                    const pData = userPersonas[pKey] || DEFAULT_PERSONAS[pKey];
                    const currentLevel = pData.visibilityLevel !== undefined && pData.visibilityLevel !== null 
                        ? Number(pData.visibilityLevel) 
                        : (pData.isVisible === false ? 4 : 0);
                    
                    const handleLevelChange = (newLevel) => {
                        updateNested(["idol", "personas", pKey, "visibilityLevel"], newLevel);
                        updateNested(["idol", "personas", pKey, "isVisible"], newLevel !== 4);
                    };

                    return (
                        <div key={pKey} className={`border rounded-2xl p-5 shadow-sm transition-colors focus-within:bg-white focus-within:border-indigo-300 ${currentLevel === 4 ? 'bg-zinc-100/50 border-zinc-200 opacity-80' : 'bg-zinc-50 border-zinc-200'}`}>
                            {/* 상단: 페르소나 이름 & 보안 레벨 배지 & 비활성화 버튼 */}
                            <div className="flex justify-between items-start mb-1.5 gap-2">
                                <input 
                                    value={pData.name} 
                                    onChange={e => updateNested(["idol", "personas", pKey, "name"], e.target.value)} 
                                    className="flex-1 bg-transparent text-sm font-black text-zinc-800 outline-none border-b border-transparent focus:border-indigo-300"
                                    placeholder={currentLang === 'zh' ? '人格名称' : currentLang === 'en' ? 'Persona Name' : '페르소나 이름'}
                                />
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 shadow-2xs ${
                                        currentLevel === 0 ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                                        currentLevel === 1 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                        currentLevel === 2 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                        'bg-rose-50 text-rose-700 border border-rose-200'
                                    }`}>
                                        {currentLevel === 0 && <><Globe size={11} /> {currentLang === 'zh' ? '全员' : currentLang === 'en' ? 'Public' : '전체'}</>}
                                        {currentLevel === 1 && <><Users size={11} /> {currentLang === 'zh' ? '粉丝' : currentLang === 'en' ? 'Followers' : '팔로워'}</>}
                                        {currentLevel === 2 && <><KeyRound size={11} /> PIN</>}
                                        {currentLevel === 4 && <><Lock size={11} /> {currentLang === 'zh' ? '仅自己' : currentLang === 'en' ? 'Private' : '나만보기'}</>}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleDeactivate(pKey)}
                                        className="flex items-center gap-1 px-2 py-1 rounded-lg border border-zinc-200 bg-white text-zinc-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 text-[10px] font-bold transition-all active:scale-95 shadow-2xs cursor-pointer"
                                        title={currentLang === 'zh' ? '停用此人格并从资料中隐藏（可随时重新开启）' : currentLang === 'en' ? 'Deactivate this persona and hide it from profile (can be re-enabled anytime)' : '이 페르소나를 비활성화하고 프로필에서 숨깁니다 (언제든 다시 켤 수 있습니다)'}
                                    >
                                        <EyeOff size={11} />
                                        <span>{currentLang === 'zh' ? '停用' : currentLang === 'en' ? 'Deactivate' : '비활성화'}</span>
                                    </button>
                                </div>
                            </div>

                            {/* 간단한 설명 입력 */}
                            <input 
                                value={pData.desc} 
                                onChange={e => updateNested(["idol", "personas", pKey, "desc"], e.target.value)} 
                                className="w-full bg-transparent text-[11px] font-bold text-zinc-500 mb-3 outline-none border-b border-transparent focus:border-indigo-300"
                                placeholder={currentLang === 'zh' ? '简单说明' : currentLang === 'en' ? 'Short Description' : '간단한 설명'}
                            />

                            {/* ⭐️ 4단계 공개 범위 선택 버튼 그리드 */}
                            <div className="mb-3 bg-white/70 border border-zinc-200 rounded-xl p-2.5">
                                <span className="block text-[10px] font-black text-zinc-600 mb-1.5 uppercase tracking-wider">
                                    {currentLang === 'zh' ? '公开范围 (4级)' : currentLang === 'en' ? 'Visibility (4 Levels)' : '공개 범위 (4단계)'}
                                </span>
                                <div className="grid grid-cols-4 gap-1.5">
                                    {SECURITY_LEVELS.map(item => {
                                        const Icon = item.icon;
                                        const isSelected = currentLevel === item.level;
                                        return (
                                            <button
                                                key={item.level}
                                                type="button"
                                                onClick={() => handleLevelChange(item.level)}
                                                className={`py-1.5 px-1 rounded-lg border text-center transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95 ${
                                                    isSelected 
                                                        ? `${item.activeBg} font-black shadow-2xs` 
                                                        : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800'
                                                }`}
                                            >
                                                <Icon size={13} className={isSelected ? '' : 'text-zinc-400'} />
                                                <span className="text-[10px] font-black leading-tight">{item.label}</span>
                                                <span className="text-[8px] text-zinc-400 font-medium leading-none">{item.desc}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* 2단계 선택 시 PIN 비밀번호 설정 필드 */}
                                {currentLevel === 2 && (
                                    <div className="mt-2.5 p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl animate-in fade-in duration-200">
                                        <label className="text-[10px] font-black text-amber-900 flex items-center gap-1 mb-1">
                                            <KeyRound size={12} className="text-amber-600" />
                                            {currentLang === 'zh' ? '访问密码 (PIN)' : currentLang === 'en' ? 'Access Passcode (PIN)' : '열람 비밀번호 (PIN)'} <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={pData.passcode || ''}
                                            onChange={e => updateNested(["idol", "personas", pKey, "passcode"], e.target.value)}
                                            placeholder={currentLang === 'zh' ? '访问密码 (例: 1234)' : currentLang === 'en' ? 'Passcode (e.g. 1234)' : '접근용 비밀번호 (예: 1234)'}
                                            maxLength={20}
                                            className="w-full bg-white border border-amber-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-300 rounded-lg px-2.5 py-1 text-xs font-bold text-zinc-800 outline-none transition-all shadow-2xs"
                                        />
                                        <p className="text-[9px] text-amber-800 font-medium mt-1">
                                            {currentLang === 'zh' ? '💡 访客点击此人格时，需输入上述密码才能查看对应的标签页。' : currentLang === 'en' ? '💡 Visitors must enter this passcode when clicking this persona to reveal these tabs.' : '💡 방문자가 이 페르소나를 클릭하면 위 비밀번호를 입력해야 해당 탭들이 노출됩니다.'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* 활성화할 서브 탭 선택 */}
                            <div>
                                <span className="block text-[10px] font-black text-zinc-600 mb-1.5 uppercase tracking-wider">
                                    {currentLang === 'zh' ? '选择显示的子标签页' : currentLang === 'en' ? 'Select Visible Sub-tabs' : '노출할 서브 탭 선택'}
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                   {Object.keys(TABS_CONFIG).map(tabKey => {
                                       if (tabKey === 'persona') return null; 
                                       const isChecked = pData.tabs?.includes(tabKey);
                                       return (
                                           <button 
                                                key={tabKey} 
                                                type="button"
                                                onClick={() => {
                                                    let newTabs = [...(pData.tabs || [])];
                                                    if (isChecked) newTabs = newTabs.filter(t => t !== tabKey);
                                                    else newTabs.push(tabKey);
                                                    updateNested(["idol", "personas", pKey, "tabs"], newTabs);
                                                }}
                                                className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all shadow-2xs ${isChecked ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-zinc-400 border-zinc-200 hover:bg-zinc-100'}`}
                                            >
                                              {isChecked && <Check size={10} className="text-indigo-500"/>}
                                              {TABS_CONFIG[tabKey]?.name || TABS_CONFIG[tabKey]?.label}
                                           </button>
                                       )
                                   })}
                                </div>
                            </div>
                        </div>
                    );
                })}
             </div>

             {/* ⭐️ 비활성화된 페르소나 섹션 */}
             {inactivePersonaKeys.length > 0 && (
                <div className="mt-8 p-5 bg-zinc-50 border border-dashed border-zinc-300 rounded-3xl animate-in fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
                        <div className="flex items-center gap-2">
                            <EyeOff size={15} className="text-zinc-500" />
                            <h4 className="text-xs font-black text-zinc-800">
                                {currentLang === 'zh' ? `已停用的人格 (${inactivePersonaKeys.length}个)` : currentLang === 'en' ? `Inactive Personas (${inactivePersonaKeys.length})` : `비활성화된 페르소나 (${inactivePersonaKeys.length}개)`}
                            </h4>
                        </div>
                        <span className="text-[10px] font-medium text-zinc-400">
                            {currentLang === 'zh' ? '随时点击 [+ 激活] 即可恢复到个人主页顶部标签和编辑视图中' : currentLang === 'en' ? 'Click [+ Activate] anytime to restore to profile header and edit view' : '언제든 [+ 활성화]를 누르면 프로필 상단 스티커와 편집 뷰에 복원됩니다'}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {inactivePersonaKeys.map(pKey => {
                            const pData = userPersonas[pKey] || DEFAULT_PERSONAS[pKey];
                            return (
                                <div key={pKey} className="bg-white border border-zinc-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between gap-3 hover:border-zinc-300 transition-colors">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-black text-zinc-800 truncate mb-0.5">{pData.name}</p>
                                        <p className="text-[10px] font-medium text-zinc-400 truncate">
                                            {pData.desc || (currentLang === 'zh' ? '无说明' : currentLang === 'en' ? 'No description' : '간단한 설명 없음')} · {currentLang === 'zh' ? `${pData.tabs?.length || 0}个标签` : currentLang === 'en' ? `${pData.tabs?.length || 0} tabs` : `탭 ${pData.tabs?.length || 0}개`}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleActivate(pKey)}
                                        className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200/80 text-[10px] font-black transition-all shadow-2xs active:scale-95 cursor-pointer"
                                    >
                                        <Plus size={12} />
                                        <span>{currentLang === 'zh' ? '激活' : currentLang === 'en' ? 'Activate' : '활성화'}</span>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
             )}
          </div>
      </div>
    );
 };

export const ResumeEditTab = ({ formData, updateNested }) => {
  const { currentLang } = useAppStore();
  const devData = formData.developer || {};
  
  const addArrayItem = (arrayName, emptyItem) => {
    const arr = [...(devData[arrayName] || []), emptyItem];
    updateNested(["developer", arrayName], arr);
  };

  const removeArrayItem = (arrayName, idx) => {
    const arr = [...(devData[arrayName] || [])];
    arr.splice(idx, 1);
    updateNested(["developer", arrayName], arr);
  };

  const updateItemField = (arrayName, idx, field, value) => {
    const arr = [...(devData[arrayName] || [])];
    arr[idx] = { ...arr[idx], [field]: value };
    updateNested(["developer", arrayName], arr);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 mb-6">
         <p className="text-xs font-bold text-indigo-800">
           {currentLang === 'zh' ? (
             <>💡 <strong>Introduce, Project, Skill</strong> 项将自动同步 <span className="underline">Developer 标签页</span> 中输入的数据！</>
           ) : currentLang === 'en' ? (
             <>💡 <strong>Introduce, Project, Skill</strong> items automatically share data entered in the <span className="underline">Developer tab</span>!</>
           ) : (
             <>💡 <strong>Introduce, Project, Skill</strong> 항목은 <span className="underline">기존 Developer 탭</span>에서 입력한 데이터를 공유하여 자동으로 표시됩니다!</>
           )}
         </p>
      </div>

      {/* 1. 경력 (Experience) */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-zinc-200/60">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-base font-black text-zinc-900 flex items-center gap-2">
            <Briefcase className="text-indigo-500" size={16} /> {currentLang === 'zh' ? '工作经历 (Experience)' : currentLang === 'en' ? 'Experience' : '경력 (Experience)'}
          </h3>
          <button 
            type="button"
            onClick={() => addArrayItem('experiences', { period: '', company: '', role: '', bullets: '' })}
            className="text-[11px] md:text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition shadow-sm"
          >
            <Plus size={14} /> {currentLang === 'zh' ? '添加经历' : currentLang === 'en' ? 'Add Experience' : '경력 추가'}
          </button>
        </div>

        <div className="space-y-4">
          {(devData.experiences || []).map((exp, idx) => (
            <div key={idx} className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl relative group">
              <button type="button" onClick={() => removeArrayItem('experiences', idx)} className="absolute top-4 right-4 text-zinc-400 hover:text-rose-500 transition-colors bg-white p-1.5 rounded-lg border border-zinc-200 shadow-sm"><Trash2 size={14} /></button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mr-10">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1">{currentLang === 'zh' ? '工作时间' : currentLang === 'en' ? 'Period' : '근무 기간'}</label>
                  <input type="text" value={exp.period || ''} onChange={(e) => updateItemField('experiences', idx, 'period', e.target.value)} className="w-full text-sm p-2.5 rounded-xl border border-zinc-200 bg-white outline-none focus:border-indigo-400 transition-colors" placeholder={currentLang === 'zh' ? '例: 2021.02 ~ 至今' : currentLang === 'en' ? 'e.g. 2021.02 ~ Present' : '예: 2021.02 ~ 현재'} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1">{currentLang === 'zh' ? '公司名称' : currentLang === 'en' ? 'Company Name' : '회사명'}</label>
                  <input type="text" value={exp.company || ''} onChange={(e) => updateItemField('experiences', idx, 'company', e.target.value)} className="w-full text-sm p-2.5 rounded-xl border border-zinc-200 bg-white outline-none focus:border-indigo-400 transition-colors" placeholder={currentLang === 'zh' ? '例: NAVER' : currentLang === 'en' ? 'e.g. NAVER' : '예: 네이버 (NAVER)'} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1">{currentLang === 'zh' ? '职位与角色' : currentLang === 'en' ? 'Role & Title' : '직무 및 역할'}</label>
                  <input type="text" value={exp.role || ''} onChange={(e) => updateItemField('experiences', idx, 'role', e.target.value)} className="w-full text-sm p-2.5 rounded-xl border border-zinc-200 bg-white outline-none focus:border-indigo-400 transition-colors" placeholder={currentLang === 'zh' ? '例: 电商后端开发工程师' : currentLang === 'en' ? 'e.g. Backend Engineer' : '예: 쇼핑 서비스 백엔드 개발자'} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1">{currentLang === 'zh' ? '主要工作与成果 (换行分隔)' : currentLang === 'en' ? 'Key Responsibilities & Achievements (Enter to split)' : '주요 업무 및 성과 (엔터로 구분)'}</label>
                  <textarea value={exp.bullets || ''} onChange={(e) => updateItemField('experiences', idx, 'bullets', e.target.value)} rows={4} className="w-full text-[13px] p-3 rounded-xl border border-zinc-200 bg-white outline-none resize-none focus:border-indigo-400 transition-colors" placeholder={currentLang === 'zh' ? '电商核心 API 开发\n高并发性能调优' : currentLang === 'en' ? 'Developed core APIs\nHigh traffic optimization' : '쇼핑 앱 주요 API 개발\n대규모 트래픽 최적화'} />
                </div>
              </div>
            </div>
          ))}
          {(devData.experiences || []).length === 0 && <p className="text-xs text-zinc-400 font-medium text-center py-6">{currentLang === 'zh' ? '暂无登记的经历。' : currentLang === 'en' ? 'No experience listed yet.' : '등록된 경력이 없습니다.'}</p>}
        </div>
      </div>

      {/* 2. 오픈소스 (Open Source) */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-zinc-200/60">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-base font-black text-zinc-900 flex items-center gap-2">
            <Terminal className="text-orange-500" size={16} /> {currentLang === 'zh' ? '开源项目 (Open Source)' : currentLang === 'en' ? 'Open Source' : '오픈소스 (Open Source)'}
          </h3>
          <button type="button" onClick={() => addArrayItem('openSources', { name: '', bullets: '' })} className="text-[11px] md:text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition shadow-sm"><Plus size={14} /> {currentLang === 'zh' ? '添加开源项目' : currentLang === 'en' ? 'Add Open Source' : '오픈소스 추가'}</button>
        </div>
        <div className="space-y-4">
          {(devData.openSources || []).map((os, idx) => (
            <div key={idx} className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl relative">
              <button type="button" onClick={() => removeArrayItem('openSources', idx)} className="absolute top-4 right-4 text-zinc-400 hover:text-rose-500 bg-white p-1.5 rounded-lg border border-zinc-200 shadow-sm"><Trash2 size={14} /></button>
              <div className="grid grid-cols-1 gap-4 mr-10">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1">{currentLang === 'zh' ? '开源/项目名称' : currentLang === 'en' ? 'Project / Repo Name' : '오픈소스/프로젝트 명'}</label>
                  <input type="text" value={os.name || ''} onChange={(e) => updateItemField('openSources', idx, 'name', e.target.value)} className="w-full text-sm p-2.5 rounded-xl border border-zinc-200 bg-white outline-none focus:border-orange-400" placeholder={currentLang === 'zh' ? '例: yowu-devtools' : currentLang === 'en' ? 'e.g. yowu-devtools' : '예: yowu-devtools'} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1">{currentLang === 'zh' ? '详细内容 (换行分隔，支持 HTML 链接)' : currentLang === 'en' ? 'Details (Enter to split, HTML link supported)' : '상세 내용 (엔터로 구분, HTML 링크 허용)'}</label>
                  <textarea value={os.bullets || ''} onChange={(e) => updateItemField('openSources', idx, 'bullets', e.target.value)} rows={3} className="w-full text-[13px] p-3 rounded-xl border border-zinc-200 bg-white outline-none resize-none focus:border-orange-400" placeholder={currentLang === 'zh' ? '填写贡献内容与链接' : currentLang === 'en' ? 'Describe contributions and link' : '기여 내용 및 링크 작성'} />
                </div>
              </div>
            </div>
          ))}
          {(devData.openSources || []).length === 0 && <p className="text-xs text-zinc-400 font-medium text-center py-6">{currentLang === 'zh' ? '暂无登记的项目。' : currentLang === 'en' ? 'No items listed yet.' : '등록된 항목이 없습니다.'}</p>}
        </div>
      </div>

      {/* 3. 발표 (Presentation) */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-zinc-200/60">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-base font-black text-zinc-900 flex items-center gap-2">
            <Mic className="text-purple-500" size={16} /> {currentLang === 'zh' ? '演讲与分享 (Presentation)' : currentLang === 'en' ? 'Presentation' : '발표 (Presentation)'}
          </h3>
          <button type="button" onClick={() => addArrayItem('presentations', { period: '', title: '', subtitle: '', bullets: '' })} className="text-[11px] md:text-xs font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition shadow-sm"><Plus size={14} /> {currentLang === 'zh' ? '添加演讲' : currentLang === 'en' ? 'Add Presentation' : '발표 추가'}</button>
        </div>
        <div className="space-y-4">
          {(devData.presentations || []).map((pt, idx) => (
            <div key={idx} className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl relative">
              <button type="button" onClick={() => removeArrayItem('presentations', idx)} className="absolute top-4 right-4 text-zinc-400 hover:text-rose-500 bg-white p-1.5 rounded-lg border border-zinc-200 shadow-sm"><Trash2 size={14} /></button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mr-10">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1">{currentLang === 'zh' ? '演讲时间' : currentLang === 'en' ? 'Date / Period' : '발표 시기'}</label>
                  <input type="text" value={pt.period || ''} onChange={(e) => updateItemField('presentations', idx, 'period', e.target.value)} className="w-full text-sm p-2.5 rounded-xl border border-zinc-200 bg-white outline-none focus:border-purple-400" placeholder={currentLang === 'zh' ? '例: 2025. 10' : currentLang === 'en' ? 'e.g. 2025. 10' : '예: 2025. 10'} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1">{currentLang === 'zh' ? '演讲主题' : currentLang === 'en' ? 'Title' : '발표 제목'}</label>
                  <input type="text" value={pt.title || ''} onChange={(e) => updateItemField('presentations', idx, 'title', e.target.value)} className="w-full text-sm p-2.5 rounded-xl border border-zinc-200 bg-white outline-none focus:border-purple-400" placeholder={currentLang === 'zh' ? '例: AI 时代的开发者生存之道' : currentLang === 'en' ? 'e.g. Surviving as a developer in AI era' : '예: AI 시대 살아남는 개발자'} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1">{currentLang === 'zh' ? '活动名称或副标题' : currentLang === 'en' ? 'Event or Subtitle' : '행사명 또는 부제'}</label>
                  <input type="text" value={pt.subtitle || ''} onChange={(e) => updateItemField('presentations', idx, 'subtitle', e.target.value)} className="w-full text-sm p-2.5 rounded-xl border border-zinc-200 bg-white outline-none focus:border-purple-400" placeholder={currentLang === 'zh' ? '例: 下班后 Meetup' : currentLang === 'en' ? 'e.g. After-work Meetup' : '예: 퇴근 후 밋업'} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1">{currentLang === 'zh' ? '详细内容与链接 (换行分隔)' : currentLang === 'en' ? 'Details & Links (Enter to split)' : '발표 상세 내용 및 링크 (엔터로 구분)'}</label>
                  <textarea value={pt.bullets || ''} onChange={(e) => updateItemField('presentations', idx, 'bullets', e.target.value)} rows={3} className="w-full text-[13px] p-3 rounded-xl border border-zinc-200 bg-white outline-none resize-none focus:border-purple-400" placeholder={currentLang === 'zh' ? '填写详细内容' : currentLang === 'en' ? 'Enter details' : '상세 내용 작성'} />
                </div>
              </div>
            </div>
          ))}
          {(devData.presentations || []).length === 0 && <p className="text-xs text-zinc-400 font-medium text-center py-6">{currentLang === 'zh' ? '暂无登记的项目。' : currentLang === 'en' ? 'No items listed yet.' : '등록된 항목이 없습니다.'}</p>}
        </div>
      </div>

      {/* 4. 아티클 (Article) */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-zinc-200/60">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-base font-black text-zinc-900 flex items-center gap-2">
            <FileText className="text-blue-500" size={16} /> {currentLang === 'zh' ? '发表文章 (Article)' : currentLang === 'en' ? 'Articles' : '작성 글 (Article)'}
          </h3>
          <button type="button" onClick={() => addArrayItem('articles', { date: '', title: '', url: '' })} className="text-[11px] md:text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition shadow-sm"><Plus size={14} /> {currentLang === 'zh' ? '添加文章' : currentLang === 'en' ? 'Add Article' : '글 추가'}</button>
        </div>
        <div className="space-y-4">
          {(devData.articles || []).map((art, idx) => (
            <div key={idx} className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center gap-3 relative pr-12">
              <input type="text" value={art.date || ''} onChange={(e) => updateItemField('articles', idx, 'date', e.target.value)} className="w-24 text-xs p-2 rounded-lg border border-zinc-200 bg-white outline-none focus:border-blue-400 text-center font-bold" placeholder="2026.03.17" />
              <input type="text" value={art.title || ''} onChange={(e) => updateItemField('articles', idx, 'title', e.target.value)} className="flex-1 text-sm p-2 rounded-lg border border-zinc-200 bg-white outline-none focus:border-blue-400 font-medium" placeholder={currentLang === 'zh' ? '文章标题 (例: 多语言国际化实战)' : currentLang === 'en' ? 'Article Title (e.g. Building i18n support)' : '글 제목 (예: 다국어 도메인 구축기)'} />
              <button type="button" onClick={() => removeArrayItem('articles', idx)} className="absolute right-4 text-zinc-400 hover:text-rose-500 bg-white p-1.5 rounded-lg border border-zinc-200 shadow-sm"><Trash2 size={14} /></button>
            </div>
          ))}
          {(devData.articles || []).length === 0 && <p className="text-xs text-zinc-400 font-medium text-center py-6">{currentLang === 'zh' ? '暂无登记的项目。' : currentLang === 'en' ? 'No items listed yet.' : '등록된 항목이 없습니다.'}</p>}
        </div>
      </div>

      {/* 5. 학력 (Education) */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-zinc-200/60">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-base font-black text-zinc-900 flex items-center gap-2">
            <GraduationCap className="text-emerald-500" size={16} /> {currentLang === 'zh' ? '教育背景 (Education)' : currentLang === 'en' ? 'Education' : '학력 (Education)'}
          </h3>
          <button type="button" onClick={() => addArrayItem('educations', { period: '', school: '', major: '' })} className="text-[11px] md:text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition shadow-sm"><Plus size={14} /> {currentLang === 'zh' ? '添加学历' : currentLang === 'en' ? 'Add Education' : '학력 추가'}</button>
        </div>
        <div className="space-y-4">
          {(devData.educations || []).map((edu, idx) => (
            <div key={idx} className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl relative">
              <button type="button" onClick={() => removeArrayItem('educations', idx)} className="absolute top-4 right-4 text-zinc-400 hover:text-rose-500 bg-white p-1.5 rounded-lg border border-zinc-200 shadow-sm"><Trash2 size={14} /></button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mr-10">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1">{currentLang === 'zh' ? '在读期间' : currentLang === 'en' ? 'Period' : '재학 기간'}</label>
                  <input type="text" value={edu.period || ''} onChange={(e) => updateItemField('educations', idx, 'period', e.target.value)} className="w-full text-sm p-2.5 rounded-xl border border-zinc-200 bg-white outline-none focus:border-emerald-400 transition-colors" placeholder={currentLang === 'zh' ? '例: 2010. 03 ~ 2016. 08' : currentLang === 'en' ? 'e.g. 2010. 03 ~ 2016. 08' : '예: 2010. 03 ~ 2016. 08'} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1">{currentLang === 'zh' ? '学校名称' : currentLang === 'en' ? 'School Name' : '학교명'}</label>
                  <input type="text" value={edu.school || ''} onChange={(e) => updateItemField('educations', idx, 'school', e.target.value)} className="w-full text-sm p-2.5 rounded-xl border border-zinc-200 bg-white outline-none focus:border-emerald-400 transition-colors" placeholder={currentLang === 'zh' ? '例: 天主教大学' : currentLang === 'en' ? 'e.g. Catholic University' : '예: 가톨릭대학교'} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1">{currentLang === 'zh' ? '专业与学位' : currentLang === 'en' ? 'Major & Degree' : '전공 및 학위'}</label>
                  <input type="text" value={edu.major || ''} onChange={(e) => updateItemField('educations', idx, 'major', e.target.value)} className="w-full text-sm p-2.5 rounded-xl border border-zinc-200 bg-white outline-none focus:border-emerald-400 transition-colors" placeholder={currentLang === 'zh' ? '例: 计算机工学 学士毕业' : currentLang === 'en' ? 'e.g. B.S. in Computer Science' : '예: 컴퓨터공학 학사 졸업'} />
                </div>
              </div>
            </div>
          ))}
          {(devData.educations || []).length === 0 && <p className="text-xs text-zinc-400 font-medium text-center py-6">{currentLang === 'zh' ? '暂无登记的项目。' : currentLang === 'en' ? 'No items listed yet.' : '등록된 항목이 없습니다.'}</p>}
        </div>
      </div>

      {/* 6. 기타 (ETC) */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-zinc-200/60">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-base font-black text-zinc-900 flex items-center gap-2">
            <LayoutList className="text-zinc-600" size={16} /> {currentLang === 'zh' ? '其他经历 (ETC)' : currentLang === 'en' ? 'Other Experience (ETC)' : '기타 이력 (ETC)'}
          </h3>
          <button type="button" onClick={() => addArrayItem('etcs', { period: '', title: '', subtitle: '' })} className="text-[11px] md:text-xs font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-lg flex items-center gap-1 transition shadow-sm"><Plus size={14} /> {currentLang === 'zh' ? '添加其他' : currentLang === 'en' ? 'Add Other' : '기타 추가'}</button>
        </div>
        <div className="space-y-4">
          {(devData.etcs || []).map((etc, idx) => (
            <div key={idx} className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl relative">
              <button type="button" onClick={() => removeArrayItem('etcs', idx)} className="absolute top-4 right-4 text-zinc-400 hover:text-rose-500 bg-white p-1.5 rounded-lg border border-zinc-200 shadow-sm"><Trash2 size={14} /></button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mr-10">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1">{currentLang === 'zh' ? '活动时间' : currentLang === 'en' ? 'Period' : '활동 기간'}</label>
                  <input type="text" value={etc.period || ''} onChange={(e) => updateItemField('etcs', idx, 'period', e.target.value)} className="w-full text-sm p-2.5 rounded-xl border border-zinc-200 bg-white outline-none focus:border-zinc-400 transition-colors" placeholder={currentLang === 'zh' ? '例: 2025. 09 ~ 2025. 12' : currentLang === 'en' ? 'e.g. 2025. 09 ~ 2025. 12' : '예: 2025. 09 ~ 2025. 12'} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1">{currentLang === 'zh' ? '活动名称' : currentLang === 'en' ? 'Activity / Project' : '활동명'}</label>
                  <input type="text" value={etc.title || ''} onChange={(e) => updateItemField('etcs', idx, 'title', e.target.value)} className="w-full text-sm p-2.5 rounded-xl border border-zinc-200 bg-white outline-none focus:border-zinc-400 transition-colors" placeholder={currentLang === 'zh' ? '例: NAVER Boostcamp 代码评审员' : currentLang === 'en' ? 'e.g. NAVER Boostcamp Code Reviewer' : '예: NAVER Boostcamp 코드 리뷰어'} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1">{currentLang === 'zh' ? '详细角色' : currentLang === 'en' ? 'Detailed Role' : '상세 역할'}</label>
                  <input type="text" value={etc.subtitle || ''} onChange={(e) => updateItemField('etcs', idx, 'subtitle', e.target.value)} className="w-full text-sm p-2.5 rounded-xl border border-zinc-200 bg-white outline-none focus:border-zinc-400 transition-colors" placeholder={currentLang === 'zh' ? '例: Web (BE/FE) Code Reviewer' : currentLang === 'en' ? 'e.g. Web (BE/FE) Code Reviewer' : '예: Web (BE/FE) Code Reviewer'} />
                </div>
              </div>
            </div>
          ))}
          {(devData.etcs || []).length === 0 && <p className="text-xs text-zinc-400 font-medium text-center py-6">{currentLang === 'zh' ? '暂无登记的项目。' : currentLang === 'en' ? 'No items listed yet.' : '등록된 항목이 없습니다.'}</p>}
        </div>
      </div>

    </div>
  );
};