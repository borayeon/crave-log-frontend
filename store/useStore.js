import { create } from 'zustand';
import { useMemo } from 'react';
import { INITIAL_TIMELINE, INITIAL_NODES } from '@/lib/constants';

export const useAppStore = create((set) => ({
  // UI State
  viewMode: 'profile',
  setViewMode: (mode) => set({ viewMode: mode }),
  graphSubMode: 'graph',
  setGraphSubMode: (mode) => set({ graphSubMode: mode }),
  sheetHeight: 190,
  setSheetHeight: (height) => set({ sheetHeight: height }),
  
  // Toast State
  toastMessage: '',
  showToast: (msg) => {
    set({ toastMessage: msg });
    setTimeout(() => set({ toastMessage: '' }), 3000);
  },
  
  // Data State
  timeline: INITIAL_TIMELINE,
  setTimeline: (updater) => set((state) => ({
    timeline: typeof updater === 'function' ? updater(state.timeline) : updater
  })),
  nodes: INITIAL_NODES,
  setNodes: (updater) => set((state) => ({
    nodes: typeof updater === 'function' ? updater(state.nodes) : updater
  })),
  
  // Interaction State
  selectedNodeId: 'me',
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  hoveredNodeId: null,
  setHoveredNodeId: (id) => set({ hoveredNodeId: id }),
}));

// 활성화된 노드를 계산하는 커스텀 훅 (Selector 분리)
export const useActiveNodes = () => {
  const selectedNodeId = useAppStore(state => state.selectedNodeId);
  const nodes = useAppStore(state => state.nodes);
  
  return useMemo(() => {
    const active = new Set();
    if (!selectedNodeId) return active;
    
    active.add(selectedNodeId);
    let current = nodes.find(n => n.id === selectedNodeId);

    if (current && current.parentId === 'me') {
      nodes.filter(n => n.parentId === 'me').forEach(s => active.add(s.id));
    }

    while (current && current.parentId) {
      active.add(current.parentId);
      current = nodes.find(n => n.id === current.parentId);
    }
    
    const queue = [selectedNodeId];
    while (queue.length > 0) {
      const currId = queue.shift();
      nodes.filter(n => n.parentId === currId).forEach(c => {
        active.add(c.id);
        queue.push(c.id);
      });
    }
    return active;
  }, [selectedNodeId, nodes]);
};
