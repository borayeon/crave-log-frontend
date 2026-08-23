import React from 'react';
import { History, X as CloseIcon, UserPlus, Compass, Heart } from 'lucide-react';

const EditHistoryModal = ({ viewHistoryItem, setViewHistoryItem, formData, updateNested, showToast }) => {
    if (!viewHistoryItem) return null;

    return (
        <div className="fixed inset-0 z-[300] bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-in fade-in" onClick={() => setViewHistoryItem(null)}>
            <div className="bg-[#F8FAFC] rounded-3xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <div className="p-5 bg-white border-b border-zinc-200 flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="text-base font-black text-zinc-900 flex items-center gap-2"><History className="text-indigo-500" size={18}/> {viewHistoryItem.date} 과거 기록</h3>
                        <p className="text-[10px] text-zinc-500 font-bold mt-1">해당 날짜에 박제된 상세 프로필의 모든 내용입니다.</p>
                    </div>
                    <button onClick={() => setViewHistoryItem(null)} className="p-2 bg-zinc-50 hover:bg-zinc-100 rounded-full text-zinc-500 transition-colors"><CloseIcon size={18}/></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                    
                    {/* Identity Info */}
                    <div>
                        <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><UserPlus size={12}/> Identity & Info</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                           <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm"><span className="block text-[9px] text-zinc-400 font-bold mb-1">MBTI</span><span className="text-xs font-black text-zinc-800">{viewHistoryItem.snapshot?.mbti || '-'}</span></div>
                           <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm"><span className="block text-[9px] text-zinc-400 font-bold mb-1">Blood Type</span><span className="text-xs font-black text-zinc-800">{viewHistoryItem.snapshot?.bloodType || '-'}</span></div>
                           <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm"><span className="block text-[9px] text-zinc-400 font-bold mb-1">Height</span><span className="text-xs font-black text-zinc-800">{viewHistoryItem.snapshot?.height || '-'}</span></div>
                           <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm"><span className="block text-[9px] text-zinc-400 font-bold mb-1">Religion</span><span className="text-xs font-black text-zinc-800">{viewHistoryItem.snapshot?.religion || '-'}</span></div>
                           <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm"><span className="block text-[9px] text-zinc-400 font-bold mb-1">Relationship</span><span className="text-xs font-black text-zinc-800">{viewHistoryItem.snapshot?.relationship || '-'}</span></div>
                           <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm"><span className="block text-[9px] text-zinc-400 font-bold mb-1">Languages</span><span className="text-xs font-black text-zinc-800">{viewHistoryItem.snapshot?.languages || '-'}</span></div>
                        </div>
                    </div>

                    {/* Lifestyle */}
                    <div>
                        <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Compass size={12}/> Lifestyle & Work</h4>
                        <div className="grid grid-cols-2 gap-3">
                           <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm col-span-2"><span className="block text-[9px] text-zinc-400 font-bold mb-1">Motto</span><span className="text-sm font-black text-indigo-600">{viewHistoryItem.snapshot?.motto || '-'}</span></div>
                           <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm"><span className="block text-[9px] text-zinc-400 font-bold mb-1">Recent Hobby</span><span className="text-xs font-black text-zinc-800">{viewHistoryItem.snapshot?.recentHobby || '-'}</span></div>
                           <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm"><span className="block text-[9px] text-zinc-400 font-bold mb-1">Working Style</span><span className="text-xs font-black text-zinc-800">{viewHistoryItem.snapshot?.workingStyle || '-'}</span></div>
                           <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm"><span className="block text-[9px] text-zinc-400 font-bold mb-1">Active Hours</span><span className="text-xs font-black text-zinc-800">{viewHistoryItem.snapshot?.activeHours || '-'}</span></div>
                           <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm"><span className="block text-[9px] text-zinc-400 font-bold mb-1">Contact</span><span className="text-xs font-black text-zinc-800">{viewHistoryItem.snapshot?.contact || '-'}</span></div>
                        </div>
                    </div>

                    {/* Tastes */}
                    <div>
                        <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Heart size={12}/> My Tastes</h4>
                        <div className="grid grid-cols-2 gap-3">
                           <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm"><span className="block text-[9px] text-zinc-400 font-bold mb-1">Hobbies</span><span className="text-xs font-bold text-zinc-700">{(viewHistoryItem.snapshot?.tastes?.hobbies || []).join(', ') || '-'}</span></div>
                           <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm"><span className="block text-[9px] text-orange-400 font-bold mb-1">Culture</span><span className="text-xs font-bold text-orange-700">{(viewHistoryItem.snapshot?.tastes?.culture || []).join(', ') || '-'}</span></div>
                           <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm"><span className="block text-[9px] text-indigo-400 font-bold mb-1">Food</span><span className="text-xs font-bold text-indigo-700">{(viewHistoryItem.snapshot?.tastes?.foods || []).join(', ') || '-'}</span></div>
                           <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm"><span className="block text-[9px] text-emerald-400 font-bold mb-1">Lifestyle</span><span className="text-xs font-bold text-emerald-700">{(viewHistoryItem.snapshot?.tastes?.lifestyle || []).join(', ') || '-'}</span></div>
                        </div>
                    </div>

                </div>
                <div className="p-5 border-t border-zinc-200 bg-white flex justify-end">
                    <button onClick={() => {
                        updateNested(['idol'], { ...formData.idol, ...viewHistoryItem.snapshot, history: formData.idol.history, updatedAt: viewHistoryItem.date });
                        showToast(`${viewHistoryItem.date} 기록으로 폼이 복원되었습니다!`);
                        setViewHistoryItem(null);
                    }} className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition shadow-sm">
                        이 기록 폼에 불러오기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditHistoryModal;