"use client";
import { useState, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown, Check, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store/useStore';

export default function SpaceBottomSheet() {
  const { sheetHeight, setSheetHeight, selectedNodeId, nodes, setNodes, showToast } = useAppStore();
  const [isDraggingSheet, setIsDraggingSheet] = useState(false);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);
  const currentHeightRef = useRef(sheetHeight);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newChildLabel, setNewChildLabel] = useState('');
  const [editLabel, setEditLabel] = useState('');
  
  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const subItems = selectedNode ? (selectedNode.id === 'me' ? nodes.filter(n => n.id !== 'me') : [...nodes.filter(n => n.parentId === selectedNode.id), ...nodes.filter(n => nodes.filter(c => c.parentId === selectedNode.id).map(c => c.id).includes(n.parentId))]) : [];

  useEffect(() => {
    if (selectedNode) setEditLabel(selectedNode.label);
    setShowAddForm(false);
  }, [selectedNodeId, selectedNode]);

  const handleSheetDragStart = (e) => {
    e.preventDefault(); setIsDraggingSheet(true);
    dragStartY.current = e.clientY || (e.touches && e.touches?.clientY); dragStartHeight.current = sheetHeight;
  };

  useEffect(() => {
    const handleMove = (e) => {
      if (!isDraggingSheet) return;
      const cy = e.clientY || (e.touches && e.touches?.clientY);
      if (cy === undefined) return;
      const h = Math.max(190, Math.min(440, dragStartHeight.current + (dragStartY.current - cy)));
      setSheetHeight(h); currentHeightRef.current = h;
    };
    const handleUp = () => {
      if (!isDraggingSheet) return;
      setIsDraggingSheet(false);
      const h = currentHeightRef.current >= 315 ? 440 : 190;
      setSheetHeight(h); currentHeightRef.current = h;
    };
    if (isDraggingSheet) {
      window.addEventListener('mousemove', handleMove); window.addEventListener('mouseup', handleUp);
      window.addEventListener('touchmove', handleMove, { passive: false }); window.addEventListener('touchend', handleUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove); window.removeEventListener('touchend', handleUp);
    };
  }, [isDraggingSheet, setSheetHeight]);

  const handleAddChild = (e) => {
    e.preventDefault();
    if (!newChildLabel.trim()) return showToast("이름을 적어주세요.");
    const newId = `node-${Date.now()}`;
    setNodes(prev => [...prev, { id: newId, label: newChildLabel.trim(), parentId: selectedNodeId, category: selectedNode.category === 'root' ? '일상' : selectedNode.category, color: 'from-slate-400 to-slate-500', size: 'sm', desc: '새 노드' }]);
    setNewChildLabel(''); setShowAddForm(false); showToast(`추가되었습니다!`);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!editLabel.trim()) return showToast("노드 이름은 필수입니다.");
    setNodes(prev => prev.map(n => n.id === selectedNodeId ? { ...n, label: editLabel.trim() } : n));
    showToast("저장되었습니다.");
  };

  const handleDelete = (id) => {
    if (id === 'me') return showToast("중심 노드는 지울 수 없습니다.");
    setNodes(prev => prev.filter(n => n.id !== id && n.parentId !== id));
    showToast("제거되었습니다.");
  };

  return (
    <div style={{ height: `${sheetHeight}px`, transition: isDraggingSheet ? 'none' : 'height 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }} className="bg-white border-t border-slate-100/95 flex flex-col shrink-0 shadow-[0_-10px_35px_rgba(0,0,0,0.03)] relative z-50">
      <div onMouseDown={handleSheetDragStart} onTouchStart={handleSheetDragStart} onClick={() => setSheetHeight(sheetHeight < 300 ? 440 : 190)} className="w-full py-2.5 cursor-ns-resize hover:bg-slate-50/80 shrink-0 flex flex-col items-center gap-1 border-b border-slate-50">
        <div className="w-10 h-1.5 bg-slate-200 rounded-full" />
        <span className="text-[8px] font-black text-slate-400 uppercase flex items-center gap-0.5">{sheetHeight < 300 ? <><ChevronUp size={10} className="animate-bounce" /> 올려보기</> : <><ChevronDown size={10} /> 닫기</>}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 scrollbar-hide bg-white">
        {selectedNode ? (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[8px] font-extrabold uppercase text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">{selectedNode.category}</span>
                <h3 className="text-xs font-black text-slate-900 mt-1">{selectedNode.label}</h3>
              </div>
              <button onClick={() => setShowAddForm(!showAddForm)} className="px-2.5 py-1 rounded-lg bg-slate-50 text-[10px] font-bold text-slate-600 border border-slate-200/50 hover:bg-slate-100">+ 노드 추가</button>
            </div>

            {showAddForm && (
              <form onSubmit={handleAddChild} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex gap-2">
                <input type="text" value={newChildLabel} onChange={(e) => setNewChildLabel(e.target.value)} placeholder="하위 노드명..." className="flex-1 px-3 py-1.5 text-xs font-bold rounded-lg border outline-none focus:border-indigo-500" autoFocus />
                <button type="submit" className="px-3 bg-slate-900 text-white rounded-lg text-xs font-bold">생성</button>
              </form>
            )}

            <form onSubmit={handleUpdate} className="flex gap-2 pt-1 border-t border-slate-50">
              <input type="text" value={editLabel} onChange={(e) => setEditLabel(e.target.value)} placeholder="이름 변경" className="flex-1 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-500" />
              <button type="submit" className="px-3 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-black transition flex items-center gap-1 shrink-0"><Check size={12} /> 저장</button>
            </form>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between pb-1"><span className="text-[10px] font-black text-slate-400">📋 하위 피드</span><span className="text-[9px] font-extrabold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">{subItems.length}개</span></div>
              {subItems.length === 0 ? <div className="py-6 text-center text-slate-350 text-[11px] font-semibold bg-slate-50 rounded-xl border border-slate-100">하위 노드가 없습니다.</div> : (
                <div className="space-y-2 pb-6">
                  {subItems.map(item => (
                    <div key={item.id} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-start justify-between gap-3 group">
                      <div className="space-y-1 min-w-0 flex-1"><h4 className="text-[11px] font-bold text-slate-900 truncate">{item.label}</h4><p className="text-[10px] text-slate-500 leading-relaxed font-semibold">{item.desc}</p></div>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-md text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition shrink-0"><Trash2 size={11} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (<div className="py-12 text-center text-xs text-slate-300 font-bold">노드를 선택하세요.</div>)}
      </div>
    </div>
  );
}