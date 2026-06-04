"use client";
import { useEffect, useMemo } from 'react';
import { LayoutList, Plus, Lock, Loader2, Instagram, Github, Music, Palette, Coffee, Edit3 } from 'lucide-react';
import { useAppStore } from '@/store/useStore';

const IconMap = {
  'Instagram': Instagram,
  'Github': Github,
  'Music': Music,
  'Palette': Palette,
  'Coffee': Coffee,
  'Edit3': Edit3,
  'Lock': Lock
};

export default function BentoArchiveGrid() {
  const { activeSpace, mode, archives, isLoading, fetchArchives } = useAppStore();

  // 🚀 컴포넌트 렌더링 시 백엔드 DB에서 1번 유저의 아카이브 데이터를 가져옵니다.
  useEffect(() => {
    fetchArchives(1);
  }, [fetchArchives]);

  // 현재 탭(public, friends 등)에 일치하는 데이터만 필터링합니다.
  const filteredItems = useMemo(() => {
    return archives.filter(item => item.space === activeSpace);
  }, [archives, activeSpace]);

  if (isLoading) {
    return (
      <div className="flex-1 px-6 pb-12 flex items-center justify-center">
        <Loader2 size={32} className="text-indigo-500 animate-spin opacity-50" />
      </div>
    );
  }

  return (
    <div className="flex-1 px-6 pb-12 overflow-y-auto scrollbar-hide">
      <div className="grid grid-cols-2 gap-4">
        {filteredItems.map((item, idx) => {
          const IconComponent = IconMap[item.iconName] || LayoutList;
          return (
            <div 
              key={item.id} 
              className={`
                p-5 rounded-[2rem] transition-all duration-500 flex flex-col justify-between group cursor-pointer
                ${idx === 2 ? 'col-span-2 aspect-auto h-32' : 'aspect-square'}
                ${activeSpace === 'mine' 
                  ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' 
                  : 'bg-white border-white hover:shadow-xl hover:scale-[1.02]'}
                border-2
              `}
            >
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${activeSpace === 'mine' ? 'bg-slate-900 text-slate-400' : 'bg-slate-50 text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-50'}`}>
                <IconComponent size={20} />
              </div>
              <div>
                <h4 className={`text-[15px] font-black leading-tight ${activeSpace === 'mine' ? 'text-white' : 'text-slate-900'}`}>{item.title}</h4>
                {/* DB 컬럼명에 맞게 item.description 사용 */}
                {item.description && <p className="text-[11px] font-medium text-slate-400 mt-1 line-clamp-2">{item.description}</p>}
              </div>
            </div>
          );
        })}
        
        {mode === 'edit' && (
           <div className={`flex flex-col items-center justify-center gap-2 aspect-square rounded-[2rem] border-2 border-dashed transition-all cursor-pointer ${activeSpace === 'mine' ? 'border-slate-700 text-slate-500 hover:bg-slate-800' : 'border-slate-200 text-slate-300 hover:bg-white hover:border-indigo-200 hover:text-indigo-300'}`}>
             <Plus size={24} />
             <span className="text-[10px] font-black">ADD NEW</span>
           </div>
        )}
      </div>

      {filteredItems.length === 0 && (
        <div className="py-20 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
            <Lock size={24} className="text-slate-200" />
          </div>
          <p className="text-sm font-bold text-slate-300">비어있는 공간입니다.</p>
        </div>
      )}
    </div>
  );
}