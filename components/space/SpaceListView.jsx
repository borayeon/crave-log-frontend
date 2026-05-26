"use client";
import { useState } from 'react';
import { Search, ChevronRight, Hash } from 'lucide-react';
import { useAppStore } from '@/store/useStore';

export default function SpaceListView() {
  const { nodes, setSelectedNodeId, setGraphSubMode } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');

  // 중심 노드('me')를 제외한 리스트 필터링 및 검색
  const filteredNodes = nodes.filter(n => 
    n.id !== 'me' && n.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 카테고리별로 노드 그룹화
  const groupedNodes = filteredNodes.reduce((acc, node) => {
    if (!acc[node.category]) acc[node.category] = [];
    acc[node.category].push(node);
    return acc;
  }, {});

  // 아이템 클릭 시, 해당 노드를 선택하고 그래프 뷰로 전환 (바텀 시트 열림)
  const handleNodeClick = (id) => {
    setSelectedNodeId(id);
    setGraphSubMode('graph');
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white animate-in fade-in duration-300">
      <div className="p-5 border-b border-slate-50 shrink-0">
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="노드 이름 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide">
        {Object.entries(groupedNodes).map(([category, items]) => (
          <div key={category}>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Hash size={12} className="text-indigo-400" /> {category}
            </h3>
            <div className="space-y-2">
              {items.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleNodeClick(item.id)}
                  className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between cursor-pointer hover:bg-white hover:border-indigo-200 hover:shadow-sm transition-all group"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{item.label}</h4>
                    <p className="text-[10px] text-slate-500 mt-1 font-medium">{item.desc}</p>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {filteredNodes.length === 0 && (
          <div className="py-12 text-center flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-2">
              <Search size={20} className="text-slate-300" />
            </div>
            <p className="text-xs font-bold text-slate-400">검색 결과가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}