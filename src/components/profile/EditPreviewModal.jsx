import React from 'react';
import { Eye, Save, Sparkles, Briefcase, GraduationCap, MapPin, Quote, Lock, User, UserPlus, Compass, Heart, MessageSquare, Image as ImageIcon, FileText, Grid } from 'lucide-react';

const EditPreviewModal = ({ 
    showPreview, setShowPreview, formData, handleSave, 
    availablePreviewTabs, previewTab, setPreviewTab, 
    renderBusinessCardUI, renderVisionPreview,
    isTabPrivate 
}) => {
    if (!showPreview) return null;

    return (
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

            <div className="flex-1 overflow-y-auto pb-10">
              <div className="mx-4 md:mx-10 mt-6 bg-white rounded-3xl p-6 md:p-8 shadow-sm relative z-20 border border-zinc-100">
                <div className="flex justify-between items-start mb-6 md:mb-8 w-full">
                  <div className="flex-1 pr-4">
                    {formData.status && (
                      <div className="inline-flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 text-zinc-800 px-3 py-1.5 md:px-4 md:py-2 rounded-2xl shadow-sm">
                          <Sparkles size={14} className="text-yellow-500" />
                          <span className="text-[11px] md:text-xs font-bold tracking-wider">{formData.status}</span>
                      </div>
                    )}
                  </div>
                </div>

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
                          <div className="flex items-center gap-1.5 text-[11px] md:text-sm font-medium text-zinc-600 truncate"><Briefcase size={12} className="text-zinc-400 shrink-0"/> {formData.role || '소속 미입력'}</div>
                          <div className="flex items-center gap-1.5 text-[11px] md:text-sm font-medium text-zinc-600 truncate"><GraduationCap size={12} className="text-zinc-400 shrink-0"/> {formData.major || '전공 미입력'}</div>
                          <div className="flex items-center gap-1.5 text-[11px] md:text-sm font-medium text-zinc-600 truncate"><MapPin size={12} className="text-zinc-400 shrink-0"/> {formData.location || '지역 미입력'}</div>
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
                    <p className="text-[10px] md:text-xs text-zinc-500 font-medium mb-2">미리보기에서는 선택된 탭 하나만 렌더링됩니다. (🔒 표시는 현재 비공개 상태임을 의미합니다)</p>
                    
                    <div className="flex gap-2.5 md:gap-4 overflow-x-auto scrollbar-hide pt-2 pb-4">
                      {availablePreviewTabs.map(tab => {
                          const isPrivate = isTabPrivate ? isTabPrivate(tab.id) : false;
                          
                          return (
                              <button 
                                key={tab.id} onClick={() => setPreviewTab(tab.id)} 
                                className={`flex flex-col items-center gap-1.5 shrink-0 group outline-none`}
                              >
                                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center relative transition-all duration-300 border ${previewTab === tab.id ? 'bg-violet-50 text-violet-500 border-violet-200 shadow-md scale-105' : 'bg-white border-zinc-200 text-zinc-400 shadow-sm group-hover:scale-105 group-hover:border-zinc-300'}`}>
                                  {React.cloneElement(tab.icon, { className: 'w-5 h-5' })}
                                  {isPrivate && (
                                      <div className="absolute -top-1 -right-1 bg-white border border-zinc-200 p-1 rounded-full shadow-sm z-10">
                                          <Lock size={10} className="text-rose-400"/>
                                      </div>
                                  )}
                                </div>
                                <span className={`text-[9px] md:text-[10px] font-black ${previewTab === tab.id ? 'text-zinc-900' : 'text-zinc-400'}`}>{tab.label}</span>
                              </button>
                          );
                      })}
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
                                <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-zinc-200/60">
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
                    {previewTab === 'businessCard' && (
                        <div className="py-10">
                            {renderBusinessCardUI(formData.idol?.businessCard, formData.name)}
                        </div>
                    )}
                    
                    {previewTab === 'qna' && (
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100">
                            <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-1.5"><MessageSquare size={14}/> Q&A ({formData.idol?.qna?.length || 0}개)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                {((formData.idol?.qna) || []).map((item, idx) => (
                                    <div key={idx} className="p-5 bg-violet-50/50 rounded-2xl border border-violet-100/50 relative overflow-hidden">
                                        <div className="absolute top-2 right-3 md:right-4 text-4xl md:text-5xl font-black text-violet-200/50 pointer-events-none">Q</div>
                                        <p className="text-sm font-black text-violet-900 mb-2 relative z-10 pr-8">{item.q}</p>
                                        <p className="text-xs font-medium text-zinc-600 relative z-10 leading-relaxed">{item.a}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {previewTab === 'hobby' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 overflow-hidden">
                            <div className="h-32 bg-zinc-100 relative"><img src={formData.idol?.hobby?.image} className="w-full h-full object-cover" alt="hobby"/></div>
                        </div>
                    )}
                    
                    {previewTab === 'vision' && renderVisionPreview()}
                    
                    {previewTab === 'quotes' && (
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100">
                            <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5"><Quote size={14}/> Quotes ({formData.idol?.quotes?.length || 0}개)</h4>
                        </div>
                    )}

                    {/* MEMO PREVIEW */}
                    {previewTab === 'memo' && (
                        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-100 flex flex-col">
                            <h4 className="text-[11px] md:text-xs font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-1.5"><FileText size={14}/> Free Memo</h4>
                            <div className="w-full text-sm text-zinc-800 leading-relaxed font-medium whitespace-pre-line bg-amber-50/30 p-5 rounded-2xl border border-amber-100/50 min-h-[150px]">
                                {formData.idol?.memoArea?.text || '입력된 메모가 없습니다.'}
                            </div>
                        </div>
                    )}

                    {/* DOT ART PREVIEW */}
                    {previewTab === 'art' && (() => {
                        const gridSize = formData.idol?.memoArea?.gridSize || 15;
                        const dots = formData.idol?.memoArea?.dots || Array(gridSize * gridSize).fill("");

                        return (
                            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-100 flex flex-col items-center justify-center">
                                <h4 className="text-[11px] md:text-xs font-black text-zinc-400 uppercase tracking-widest mb-6 w-full text-left flex items-center gap-1.5"><Grid size={14}/> Dot Canvas</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }} className="gap-0.5 sm:gap-1 bg-zinc-50 p-2 sm:p-3 rounded-2xl border border-zinc-200 shadow-inner w-max">
                                    {dots.map((dotColor, idx) => (
                                        <div 
                                            key={idx} 
                                            style={{ backgroundColor: dotColor || 'transparent' }}
                                            className={`rounded-[2px] sm:rounded-sm border ${dotColor ? 'border-transparent shadow-sm' : 'border-zinc-200/80 bg-white'}
                                                ${gridSize === 10 ? 'w-6 h-6 sm:w-8 sm:h-8' : gridSize === 15 ? 'w-4 h-4 sm:w-6 sm:h-6' : 'w-3 h-3 sm:w-4 sm:h-4'}
                                            `} 
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })()}

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
    );
};

export default EditPreviewModal;