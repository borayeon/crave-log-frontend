"use client";
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAppStore } from '@/store/useStore';

export default function TimelineForm() {
  const { setTimeline, showToast } = useAppStore();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [tag, setTag] = useState('일상');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return showToast("제목을 입력해 주세요.");
    
    const newPost = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('ko-KR').replace(/. /g, '.').slice(0, -1),
      title: title.trim(), desc: desc.trim(), tag
    };
    
    setTimeline(prev => [newPost, ...prev]);
    setTitle(''); setDesc('');
    showToast("새로운 소식이 기록되었습니다! 📅");
  };

  return (
    <section className="bg-slate-50/50 p-4 border border-slate-100 rounded-2xl">
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Plus size={13} className="text-indigo-600" />새로운 순간 흘려보내기</h3>
      <form onSubmit={handleSubmit} className="space-y-2.5">
        <div className="flex gap-2">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="오늘 무슨 기록을 남길까요?" className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 transition" />
          <select value={tag} onChange={(e) => setTag(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-2 text-xs font-bold text-slate-600 outline-none">
            <option value="개발">개발</option><option value="일상">일상</option><option value="문화">문화</option>
          </select>
        </div>
        <div className="flex gap-2">
          <input type="text" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="간단한 소감 코멘트 (선택)" className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-600 outline-none focus:border-indigo-500 transition" />
          <button type="submit" className="px-4 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition">기록</button>
        </div>
      </form>
    </section>
  );
}