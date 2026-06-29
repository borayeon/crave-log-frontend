import React from 'react';
import { Sparkles, FolderOpen } from 'lucide-react';
import { useAppStore } from '../store/AppStore';
import EmptyState from '../components/common/EmptyState';

const ArchiveView = () => {
  const { records, isAdmin, setLoginModalOpen, setAddRecordModalOpen } = useAppStore();

  if (records.length === 0) {
      return (
          <div className="h-full bg-[#F8FAFC]">
            <EmptyState 
                title="텅 빈 보관함입니다" 
                icon={<FolderOpen size={32}/>} 
                onAction={() => isAdmin ? setAddRecordModalOpen(true) : setLoginModalOpen(true)}
                actionLabel={isAdmin ? "첫 기록 추가하기" : "로그인하고 시작하기"}
            />
          </div>
      );
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 pb-24 md:pb-0 bg-zinc-200/50">
      <header className="px-6 md:px-10 py-8 flex flex-col shrink-0 relative z-10 bg-white border-b border-zinc-200 shadow-sm">
        <h2 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
            Taste Archive <Sparkles size={24} className="text-indigo-500" />
        </h2>
        <p className="text-xs font-bold text-zinc-500 mt-2 tracking-widest uppercase">내가 수집한 취향의 조각들</p>
      </header>
      
      <div className="flex-1 px-4 md:px-10 py-10 overflow-y-auto scrollbar-hide flex justify-center">
        <div className="bg-white rounded-r-3xl rounded-l-md shadow-2xl border border-zinc-300 w-full max-w-6xl flex relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-12 before:bg-gradient-to-r before:from-zinc-200 before:to-transparent before:rounded-l-md">
            
            <div className="absolute left-6 top-10 bottom-10 flex flex-col justify-between z-20">
                {[1,2,3,4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-4 border-zinc-300 shadow-inner bg-zinc-100 flex items-center justify-center -ml-4">
                        <div className="w-4 h-4 rounded-full bg-zinc-800 shadow-inner"></div>
                    </div>
                ))}
            </div>

            <div className="flex-1 p-8 pl-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 bg-[url('[https://www.transparenttextures.com/patterns/cream-paper.png](https://www.transparenttextures.com/patterns/cream-paper.png)')]">
                {records.map(item => (
                    <div key={item.id} className="group relative aspect-[63/88] rounded-xl bg-white p-1.5 shadow-sm border border-zinc-200 cursor-pointer hover:-translate-y-1 transition-transform">
                        <div className="relative w-full h-full rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200">
                            <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-white/50 to-transparent opacity-50 pointer-events-none" />
                            
                            <div className="absolute bottom-0 w-full p-2 bg-white/90 backdrop-blur-sm border-t border-zinc-200 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                <span className="block text-[8px] font-black text-indigo-500 uppercase">{item.category}</span>
                                <h4 className="text-xs font-black text-zinc-900 truncate">{item.title}</h4>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};
export default ArchiveView;
