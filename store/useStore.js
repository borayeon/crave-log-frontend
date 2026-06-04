"use client";
import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import api from '@/lib/api';
import { INITIAL_TIMELINE, INITIAL_NODES } from '@/lib/constants';

const AppContext = createContext();

export const useAppStore = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  // UI State
  const [viewMode, setViewMode] = useState('profile'); 
  const [graphSubMode, setGraphSubMode] = useState('graph');
  const [sheetHeight, setSheetHeight] = useState(190);
  const [toastMessage, setToastMessage] = useState('');
  
  // Data State
  const [timeline, setTimeline] = useState(INITIAL_TIMELINE);
  const [nodes, setNodes] = useState(INITIAL_NODES);
  
  // Interaction State
  const [selectedNodeId, setSelectedNodeId] = useState('me');
  const [hoveredNodeId, setHoveredNodeId] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // 🚀 실제 백엔드 DB 데이터 연동 로직 (8080 포트 API 호출)
  useEffect(() => {
    const fetchDBData = async () => {
      try {
        const response = await api.get('/archives/users/1'); // 1번 유저 데이터 조회
        const data = response.data;

        // 1. 중심 노드(나)는 무조건 유지
        const rootNode = { 
          id: 'me', label: '나 (태경)', category: 'root', 
          color: 'from-indigo-500 to-rose-400', size: 'lg', 
          desc: 'CraveLog의 시작점', extra: '나의 Identity' 
        };

        // 2. DB 데이터를 프론트 물리엔진 노드 규격으로 매핑
        const fetchedNodes = data.map(item => {
          // DB의 spaceType (예: LV4_MINE)에서 숫자 제거 및 카테고리화
          const categoryName = item.spaceType ? item.spaceType.replace(/LV[0-9]_/, '') : 'OPEN'; 
          const isMine = categoryName === 'MINE';

          return {
            id: `node-${item.id}`,
            label: item.title,
            parentId: 'me', // 기본적으로 모두 중심 노드('me')에 연결
            category: categoryName,
            color: isMine ? 'from-slate-700 to-slate-900' : 'from-slate-400 to-slate-500',
            size: 'sm',
            desc: item.content || '내용 없음'
          };
        });

        // 3. 기존 가짜 데이터 대신 진짜 데이터로 덮어쓰기
        setNodes([rootNode, ...fetchedNodes]);
        
      } catch (error) {
        console.error("DB 연동 중 에러 발생:", error);
      }
    };

    fetchDBData();
  }, []);

  // Node Highlight Logic (Selector)
  const activeNodeIds = useMemo(() => {
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

  const value = {
    viewMode, setViewMode,
    graphSubMode, setGraphSubMode,
    sheetHeight, setSheetHeight,
    toastMessage, showToast,
    timeline, setTimeline,
    nodes, setNodes,
    selectedNodeId, setSelectedNodeId,
    hoveredNodeId, setHoveredNodeId,
    activeNodeIds
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};