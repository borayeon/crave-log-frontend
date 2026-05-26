"use client";
import { Settings, Share2, Sparkles, Briefcase, MapPin, ArrowUpRight, Compass, Music } from 'lucide-react';
import { useAppStore } from '@/store/useStore';
import { USER_DATA, SOCIAL_LINKS } from '@/lib/constants';

export default function ProfileView() {
  const { setViewMode, nodes } = useAppStore();

  return (
    <div className="flex flex-col flex-1 bg-white overflow-hidden pb-16 animate-in fade-in duration-300">
      <header className="px-6 pt-6 pb-4 flex justify-between items-center z-10 border-b border-slate-50 shrink-0">
        <button className="w-9 h-9 bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-xl"><Settings size={15} /></button>
        <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:bg-slate-800 transition"><Share2 size={13} /> 공유</button>
      </header>

      <main className="flex-1 px-6 py-6 overflow-y-auto scrollbar-hide space-y-6">
        <section className="flex flex-col items-center text-center mt-2">
          <div className="relative mb-5">
            <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-rose-400 p-[3px] rounded-2xl shadow-sm">
              <div className="w-full h-full border-2 border-white bg-slate-100 flex items-center justify-center rounded-[1.2rem] overflow-hidden"><span className="text-3xl font-black text-slate-300">태</span></div>
            </div>
            <div className="absolute -bottom-1 -right-2 bg-slate-900 text-white px-2.5 py-1 shadow-sm flex items-center gap-1 rounded-lg"><Sparkles size={10} className="text-yellow-400 animate-pulse" /><span className="text-[9px] font-bold tracking-wider">{USER_DATA.status}</span></div>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1">{USER_DATA.name}</h1>
          <p className="text-xs font-bold text-slate-400 mt-0.5">@{USER_DATA.handle}</p>
          <p className="text-xs font-medium text-slate-600 mt-4 max-w-[280px] leading-relaxed border-t border-b border-slate-50 py-3">{USER_DATA.bio}</p>
        </section>

        <section className="grid grid-cols-2 gap-3 pb-8">
          <div className="col-span-2 bg-slate-50 p-4 border border-slate-100 flex flex-col gap-2.5 hover:bg-slate-100/50 transition duration-300 rounded-2xl">
            <div className="flex items-center gap-3 text-slate-700"><div className="w-7 h-7 bg-white border border-slate-200/60 flex items-center justify-center text-slate-600 rounded-lg"><Briefcase size={13} /></div><span className="text-xs font-semibold">{USER_DATA.role}</span></div>
            <div className="flex items-center gap-3 text-slate-700"><div className="w-7 h-7 bg-white border border-slate-200/60 flex items-center justify-center text-slate-600 rounded-lg"><MapPin size={13} /></div><span className="text-xs font-semibold">{USER_DATA.location}</span></div>
          </div>

          {SOCIAL_LINKS.map(link => {
            const Icon = link.icon;
            return (
              <a key={link.id} href={link.url} className={`group relative p-4 text-white flex flex-col justify-between aspect-square overflow-hidden hover:translate-y-[-2px] transition-all duration-300 rounded-2xl ${link.color}`}>
                <div className="flex justify-between items-start">
                  <div className="p-1.5 bg-white/20 backdrop-blur-md border border-white/10 rounded-xl">
                    {/* 안전망: Icon이 정상적으로 넘어왔을 때만 렌더링하도록 수정 */}
                    {Icon ? <Icon size={18} strokeWidth={2} /> : null}
                  </div>
                  <ArrowUpRight size={16} className="opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
                <span className="font-bold text-xs tracking-tight">{link.name}</span>
              </a>
            );
          })}

          <div className="col-span-2 bg-[#09090b] p-5 text-white relative overflow-hidden group cursor-pointer hover:bg-black transition-all duration-300 border border-slate-800 rounded-2xl shadow-sm" onClick={() => setViewMode('archive')}>
            <div className="absolute -right-4 -top-4 opacity-20"><Compass size={110} strokeWidth={1} className="text-indigo-400 transition-transform duration-700 group-hover:rotate-45" /></div>
            <div className="relative z-10">
              <div className="w-8 h-8 bg-white/10 backdrop-blur-md flex items-center justify-center mb-3 border border-white/10 rounded-lg"><Music size={15} className="text-white" /></div>
              <h3 className="text-sm font-bold mb-1 tracking-tight flex items-center gap-1.5">My Personal Space<Sparkles size={12} className="text-indigo-400" /></h3>
              <p className="text-[11px] font-medium text-slate-400 leading-relaxed">거주지, 취미, 여행, 영화 기록 보관함 ({nodes.length - 1}개)</p>
            </div>
            <ArrowUpRight size={16} className="absolute right-5 bottom-5 text-indigo-400 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>
        </section>
      </main>
    </div>
  );
}
