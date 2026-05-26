"use client";
import { Network, List } from 'lucide-react';
import { useAppStore } from '@/store/useStore';
import GraphCanvas from './GraphCanvas';
import SpaceBottomSheet from './SpaceBottomSheet';
import SpaceListView from './SpaceListView';

export default function SpaceView() {
  const { graphSubMode, setGraphSubMode } = useAppStore();

  return (
    <div className="flex flex-col flex-1 bg-slate-50 h-full overflow-hidden animate-in slide-in-from-right duration-500 pb-16">
      <header className="px-6 pt-5 pb-3 bg-white border-b border-slate-100 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-2">
          <Network size={16} className="text-indigo-600" />
          <div><h2 className="text-sm font-bold text-slate-950">아이덴티티 맵</h2><p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">드래그와 패닝으로 탐색하세요</p></div>
        </div>
        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50 shrink-0">
          <button onClick={() => setGraphSubMode('graph')} className={`px-2.5 py-1 rounded-md text-[10px] font-black transition-all flex items-center gap-1 ${graphSubMode === 'graph' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}><Network size={11} />지도</button>
          <button onClick={() => setGraphSubMode('list')} className={`px-2.5 py-1 rounded-md text-[10px] font-black transition-all flex items-center gap-1 ${graphSubMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}><List size={11} />목록</button>
        </div>
      </header>

      {graphSubMode === 'graph' ? (
        <>
          <GraphCanvas />
          <SpaceBottomSheet />
        </>
      ) : (
        <SpaceListView />
      )}
    </div>
  );
}