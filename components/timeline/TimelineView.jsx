"use client";
import { History, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store/useStore';
import TimelineForm from './TimelineForm';

export default function TimelineView() {
  const { timeline, setTimeline, showToast } = useAppStore();

  const handleClear = (id) => {
    setTimeline(prev => prev.filter(item => item.id !== id));
    showToast("피드가 지워졌습니다.");
  };

  return (
    <div className="flex flex-col flex-1 bg-white overflow-hidden pb-16 animate-in fade-in duration-300">
      <header className="px-6 pt-6 pb-4 flex justify-between items-center z-10 border-b border-slate-50 shrink-0">
        <div className="flex items-center gap-2">
          <History size={16} className="text-indigo-600 animate-pulse" />
          <h1 className="text-sm font-bold text-slate-800 tracking-tight">CraveLog Feed</h1>
        </div>
      </header>

      <main className="flex-1 px-6 py-6 overflow-y-auto scrollbar-hide space-y-6">
        <TimelineForm />
        
        <section className="relative pl-4 border-l-2 border-slate-100 space-y-6 pb-6 mt-4">
          {timeline.map((post) => (
            <div key={post.id} className="relative group animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-4 ring-white" />
              <div className="bg-white p-4 border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition duration-300 flex justify-between items-start gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-indigo-500">{post.date}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[8px] font-black text-slate-500">{post.tag}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{post.title}</h4>
                  {post.desc && <p className="text-[11px] text-slate-500 leading-relaxed">{post.desc}</p>}
                </div>
                <button onClick={() => handleClear(post.id)} className="p-1 rounded-md text-slate-300 hover:text-rose-500 transition opacity-0 group-hover:opacity-100 shrink-0">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}