import React from 'react';
import { 
  Code, Briefcase, Terminal, ExternalLink, Target, MapPin, 
  UserPlus, Compass, Heart, MessageSquare, Quote, FileText, Grid 
} from 'lucide-react';

export const DeveloperTab = ({ data }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 animate-in fade-in slide-in-from-bottom-2">
    <div className="md:col-span-1 flex flex-col gap-4 md:gap-5">
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-100">
        <h4 className="text-[11px] md:text-xs font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-1.5"><UserPlus size={14}/> About Me</h4>
        <p className="text-sm text-zinc-700 leading-relaxed font-medium whitespace-pre-line">
          {data?.about || '입력된 자기소개가 없습니다.'}
        </p>
      </div>
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-100 flex-1">
        <h4 className="text-[11px] md:text-xs font-black text-zinc-400 uppercase tracking-widest mb-5 flex items-center gap-1.5"><Code size={14}/> Tech Stack</h4>
        <div className="space-y-5">
            {['backend', 'db', 'frontend', 'tools'].map(type => {
                const stackData = data?.techStack?.[type];
                if (!stackData) return null;
                const stackArray = Array.isArray(stackData) ? stackData : typeof stackData === 'string' ? stackData.split(',').filter(Boolean) : [];
                if (stackArray.length === 0) return null;
                return (
                    <div key={type}>
                        <span className="block text-[10px] font-black text-zinc-300 uppercase mb-2">{type}</span>
                        <div className="flex flex-wrap gap-2">
                            {stackArray.map((tech, i) => (
                                <span key={i} className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-xl text-[11px] font-bold cursor-default shadow-sm hover:bg-zinc-100 transition-colors">
                                    {typeof tech === 'string' ? tech.trim() : String(tech)}
                                </span>
                            ))}
                        </div>
                    </div>
                )
            })}
        </div>
      </div>
    </div>
    <div className="md:col-span-2">
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-100 h-full">
         <h4 className="text-[11px] md:text-xs font-black text-zinc-400 uppercase tracking-widest mb-5 flex items-center gap-1.5"><Code size={14}/> Post & Portfolio</h4>
         <div className="grid grid-cols-1 gap-4">
            {(data?.projects || []).map((proj, idx) => (
                <div key={idx} className="p-5 bg-zinc-50/50 rounded-2xl border border-zinc-100 hover:bg-white hover:shadow-md hover:border-indigo-100 transition-all duration-300">
                    <div className="flex justify-between items-start mb-2">
                        <h5 className="text-base md:text-lg font-black text-zinc-900">{proj.name}</h5>
                        <div className="flex gap-1.5 text-zinc-400">
                            {proj.githubUrl && <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="bg-white border border-zinc-200 shadow-sm p-1.5 rounded-lg hover:text-zinc-900 hover:bg-zinc-50 transition"><Terminal size={14} /></a>}
                            {proj.liveUrl && <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer" className="bg-white border border-zinc-200 shadow-sm p-1.5 rounded-lg hover:text-indigo-600 hover:bg-indigo-50 transition"><ExternalLink size={14} /></a>}
                        </div>
                    </div>
                    <p className="text-xs md:text-sm text-zinc-500 font-medium leading-relaxed">{proj.desc}</p>
                </div>
            ))}
            {(!data?.projects || data.projects.length === 0) && <p className="text-sm text-zinc-400 font-medium text-center py-12 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">등록된 프로젝트가 없습니다.</p>}
         </div>
      </div>
    </div>
  </div>
);

export const CareerTab = ({ data }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 animate-in fade-in slide-in-from-bottom-2">
    <div className="md:col-span-1 flex flex-col gap-4 md:gap-5">
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-100">
        <h4 className="text-[11px] md:text-xs font-black text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Target size={14}/> Target Job</h4>
        <p className="text-xl md:text-2xl font-black text-blue-600">{data?.targetJob || '미입력'}</p>
      </div>
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-100 flex-1">
         <h4 className="text-[11px] md:text-xs font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-1.5"><MapPin size={14}/> Career Goals</h4>
         <div className="flex flex-col gap-3">
           <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
              <h5 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1.5">단기 목표</h5>
              <p className="text-xs font-bold text-zinc-800 leading-relaxed">{data?.careerGoals?.short || '-'}</p>
           </div>
           <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
              <h5 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1.5">중장기 목표</h5>
              <p className="text-xs font-bold text-zinc-800 leading-relaxed">{data?.careerGoals?.mid || '-'}</p>
           </div>
           <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
              <h5 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1.5">Long Term Goal</h5>
              <p className="text-xs font-bold text-zinc-800 leading-relaxed">{data?.careerGoals?.long || '-'}</p>
           </div>
         </div>
      </div>
    </div>
    <div className="md:col-span-2">
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-100 h-full">
         <h4 className="text-[11px] md:text-xs font-black text-zinc-400 uppercase tracking-widest mb-5 flex items-center gap-1.5"><Briefcase size={14}/> 이력 및 강점</h4>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(data?.strengths || []).map((str, idx) => (
                <div key={idx} className="p-5 bg-zinc-50/80 rounded-2xl border border-zinc-100 hover:bg-white hover:shadow-md hover:border-blue-100 transition-all duration-300">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs mb-3 shadow-sm">{idx+1}</div>
                    <h5 className="text-sm md:text-base font-black text-zinc-900 mb-2">{str.title}</h5>
                    <p className="text-xs text-zinc-500 font-medium leading-relaxed">{str.desc}</p>
                </div>
            ))}
            {(!data?.strengths || data.strengths.length === 0) && (
                <div className="sm:col-span-2 text-center py-12 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
                    <p className="text-sm text-zinc-400 font-medium">등록된 이력 및 강점이 없습니다.</p>
                </div>
            )}
         </div>
      </div>
    </div>
  </div>
);

export const AddProfileTab = ({ data }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 animate-in fade-in slide-in-from-bottom-2">
    <div className="md:col-span-1 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-100 h-full flex flex-col">
      <div className="w-40 h-56 sm:w-48 sm:h-64 mx-auto rounded-3xl bg-zinc-50 border border-zinc-200 shadow-inner overflow-hidden mb-5 relative group flex items-center justify-center">
          {data?.extraImage ? (
              <img src={data.extraImage} alt="Extra Profile" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
              <UserPlus size={32} className="text-zinc-200" />
          )}
      </div>
      <div className="space-y-2">
          <div className="flex justify-between items-center bg-rose-50/50 p-3 rounded-xl border border-rose-100/50"><span className="text-[10px] font-bold text-rose-400">MBTI</span><span className="text-xs font-black text-zinc-800">{data?.mbti || '-'}</span></div>
          <div className="flex justify-between items-center bg-rose-50/50 p-3 rounded-xl border border-rose-100/50"><span className="text-[10px] font-bold text-rose-400">Blood Type</span><span className="text-xs font-black text-zinc-800">{data?.bloodType || '-'}</span></div>
          <div className="flex justify-between items-center bg-rose-50/50 p-3 rounded-xl border border-rose-100/50"><span className="text-[10px] font-bold text-rose-400">Height</span><span className="text-xs font-black text-zinc-800">{data?.height || '-'}</span></div>
          <div className="flex justify-between items-center bg-rose-50/50 p-3 rounded-xl border border-rose-100/50"><span className="text-[10px] font-bold text-rose-400">Religion</span><span className="text-xs font-black text-zinc-800">{data?.religion || '-'}</span></div>
          <div className="flex justify-between items-center bg-rose-50/50 p-3 rounded-xl border border-rose-100/50"><span className="text-[10px] font-bold text-rose-400">Relationship</span><span className="text-xs font-black text-zinc-800">{data?.relationship || '-'}</span></div>
          <div className="flex justify-between items-center bg-rose-50/50 p-3 rounded-xl border border-rose-100/50"><span className="text-[10px] font-bold text-rose-400">Languages</span><span className="text-xs font-black text-zinc-800">{data?.languages || '-'}</span></div>
      </div>
    </div>
    <div className="md:col-span-2 flex flex-col gap-4 md:gap-5">
      <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-zinc-200/60">
          <h4 className="text-[11px] md:text-xs font-black text-zinc-400 uppercase tracking-widest mb-5 flex items-center gap-1.5"><Compass size={14}/> Lifestyle & Work</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 gap-1.5 sm:col-span-2">
                <span className="text-[10px] font-bold text-blue-400">Motto (좌우명)</span>
                <span className="text-sm font-black text-zinc-800">{data?.motto || '-'}</span>
              </div>
              <div className="flex flex-col bg-zinc-50 p-4 rounded-xl border border-zinc-200/60 gap-1.5">
                <span className="text-[10px] font-bold text-zinc-400">Recent Hobby</span>
                <span className="text-xs font-black text-zinc-800">{data?.recentHobby || '-'}</span>
              </div>
              <div className="flex flex-col bg-zinc-50 p-4 rounded-xl border border-zinc-200/60 gap-1.5">
                <span className="text-[10px] font-bold text-zinc-400">Working Style</span>
                <span className="text-xs font-black text-zinc-800">{data?.workingStyle || '-'}</span>
              </div>
              <div className="flex flex-col bg-zinc-50 p-4 rounded-xl border border-zinc-200/60 gap-1.5">
                <span className="text-[10px] font-bold text-zinc-400">Active Hours</span>
                <span className="text-xs font-black text-zinc-800">{data?.activeHours || '-'}</span>
              </div>
              <div className="flex flex-col bg-zinc-50 p-4 rounded-xl border border-zinc-200/60 gap-1.5">
                <span className="text-[10px] font-bold text-zinc-400">Contact</span>
                <div className="flex items-center gap-2 mt-1">
                    {['적극', '중간', '소극'].map(status => (
                        <div key={status} className={`flex-1 text-center py-1 rounded-md text-[10px] font-black transition-all ${data?.contact === status ? 'bg-violet-100 text-violet-600 shadow-sm border border-violet-200' : 'bg-zinc-100 text-zinc-400'}`}>
                            {status}
                        </div>
                    ))}
                </div>
              </div>
          </div>
      </div>
      <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-zinc-200/60">
          <h4 className="text-[11px] md:text-xs font-black text-zinc-400 uppercase tracking-widest mb-5 flex items-center gap-1.5"><Heart size={14}/> My Tastes</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-zinc-50/80 rounded-2xl border border-zinc-100">
                <span className="block text-[10px] font-black text-zinc-400 uppercase mb-2">Hobbies & Interests</span>
                <div className="flex flex-wrap gap-1.5">{(data?.tastes?.hobbies || []).map(c=><span key={c} className="px-2.5 py-1 bg-white border border-zinc-200 rounded-lg text-[10px] font-bold text-zinc-700 shadow-sm">{c}</span>)}</div>
              </div>
              <div className="p-3 bg-orange-50/50 rounded-2xl border border-orange-100/50">
                <span className="block text-[10px] font-black text-orange-400 uppercase mb-2">Culture (Music/Movies)</span>
                <div className="flex flex-wrap gap-1.5">{(data?.tastes?.culture || []).map(c=><span key={c} className="px-2.5 py-1 bg-white border border-orange-200 rounded-lg text-[10px] font-bold text-orange-700 shadow-sm">{c}</span>)}</div>
              </div>
              <div className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                <span className="block text-[10px] font-black text-indigo-400 uppercase mb-2">Food & Drink</span>
                <div className="flex flex-wrap gap-1.5">{(data?.tastes?.foods || []).map(c=><span key={c} className="px-2.5 py-1 bg-white border border-indigo-200 rounded-lg text-[10px] font-bold text-indigo-700 shadow-sm">{c}</span>)}</div>
              </div>
              <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                <span className="block text-[10px] font-black text-emerald-400 uppercase mb-2">Lifestyle & Places</span>
                <div className="flex flex-wrap gap-1.5">{(data?.tastes?.lifestyle || []).map(c=><span key={c} className="px-2.5 py-1 bg-white border border-emerald-200 rounded-lg text-[10px] font-bold text-emerald-700 shadow-sm">{c}</span>)}</div>
              </div>
          </div>
      </div>
    </div>
  </div>
);

export const QnaTab = ({ data }) => (
  <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-zinc-100 animate-in fade-in slide-in-from-bottom-2">
      <h4 className="text-[11px] md:text-xs font-black text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-1.5"><MessageSquare size={14}/> 100문 100답</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(data || []).map((item, idx) => (
              <div key={idx} className="p-5 bg-violet-50/50 rounded-2xl border border-violet-100/50 relative overflow-hidden hover:bg-violet-50 hover:shadow-sm transition-all duration-300">
                  <div className="absolute top-2 right-3 md:right-4 text-4xl md:text-5xl font-black text-violet-200/50 pointer-events-none">Q</div>
                  <p className="text-sm font-black text-violet-900 mb-2 relative z-10 pr-8">{item.q}</p>
                  <p className="text-xs font-medium text-zinc-600 relative z-10 leading-relaxed">{item.a}</p>
              </div>
          ))}
          {(!data || data.length === 0) && <p className="md:col-span-2 text-sm text-zinc-400 font-medium text-center py-12 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">등록된 Q&A가 없습니다.</p>}
      </div>
  </div>
);

export const HobbyTab = ({ data }) => (
  <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 overflow-hidden flex flex-col md:flex-row group animate-in fade-in slide-in-from-bottom-2">
      <div className="h-56 md:h-auto md:w-1/2 relative bg-zinc-100 overflow-hidden">
          <img src={data?.image || 'https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?q=80&w=1000'} alt="Hobby" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-90"></div>
          <h3 className="absolute bottom-6 left-6 md:left-8 text-2xl md:text-3xl font-black text-white drop-shadow-md">{data?.title || '취미 생활'}</h3>
      </div>
      <div className="p-6 md:p-12 md:w-1/2 flex flex-col justify-center bg-gradient-to-br from-amber-50/30 to-orange-50/10">
          <Quote size={32} className="text-amber-200 mb-4 transform rotate-180" />
          <p className="text-sm text-zinc-700 leading-relaxed font-medium mb-6">
              {data?.description || '설명이 없습니다.'}
          </p>
          <div className="flex flex-wrap gap-2 mt-auto">
              {(data?.keywords || []).map(kw => <span key={kw} className="px-3 md:px-4 py-1.5 md:py-2 bg-white text-amber-600 text-[10px] md:text-xs font-black rounded-xl border border-amber-100 shadow-sm">#{kw}</span>)}
          </div>
      </div>
  </div>
);

export const QuotesTab = ({ data }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-2">
      {(data || []).map((q, idx) => (
          <div key={idx} className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-zinc-100 relative hover:-translate-y-1 hover:shadow-md transition-all duration-300">
              <Quote size={24} className="text-slate-100 absolute top-5 right-6" />
              <p className="text-sm md:text-base font-bold text-slate-800 leading-relaxed pr-6 mb-4">"{q.text}"</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">- {q.author}</p>
          </div>
      ))}
      {(!data || data.length === 0) && (
        <div className="sm:col-span-2 md:col-span-3 bg-zinc-50 p-12 rounded-3xl border border-dashed border-zinc-200 text-center">
          <p className="text-sm text-zinc-400 font-medium">등록된 명언이 없습니다.</p>
        </div>
      )}
  </div>
);

export const MemoTab = ({ data }) => (
  <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-100 flex flex-col h-full animate-in fade-in slide-in-from-bottom-2">
      <h4 className="text-[11px] md:text-xs font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-1.5"><FileText size={14}/> Free Memo</h4>
      <div className="flex-1 text-sm md:text-base text-zinc-800 leading-relaxed font-medium whitespace-pre-line bg-amber-50/30 p-5 md:p-8 rounded-2xl border border-amber-100/50 min-h-[200px]">
          {data?.text || '입력된 메모가 없습니다.'}
      </div>
  </div>
);

export const ArtTab = ({ data }) => {
  const gridSize = data?.gridSize || 15;
  const dots = data?.dots || Array(gridSize * gridSize).fill("");
  return (
      <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-zinc-100 flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-2">
          <h4 className="text-[11px] md:text-xs font-black text-zinc-400 uppercase tracking-widest mb-6 w-full text-center md:text-left flex items-center justify-center md:justify-start gap-1.5"><Grid size={14}/> Dot Canvas</h4>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }} className="gap-1 sm:gap-1.5 bg-zinc-50 p-3 sm:p-5 md:p-6 rounded-[2rem] border border-zinc-200 shadow-inner w-max">
              {dots.map((dotColor, idx) => (
                  <div 
                      key={idx} 
                      style={{ backgroundColor: dotColor || 'transparent' }}
                      className={`rounded-[2px] sm:rounded-md transition-colors ${dotColor ? 'shadow-md scale-105 border-transparent' : 'bg-white border border-zinc-200/80'}
                          ${gridSize === 10 ? 'w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10' : gridSize === 15 ? 'w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7' : 'w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5'}
                      `} 
                  />
              ))}
          </div>
      </div>
  );
};