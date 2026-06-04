"use client";
import { useRef, useState, useEffect, useMemo } from 'react';
import { useAppStore } from '../../store/useStore';

export default function GraphCanvas() {
  const { 
    nodes, selectedNodeId, setSelectedNodeId, 
    hoveredNodeId, setHoveredNodeId, 
    activeNodeIds, sheetHeight, graphSubMode 
  } = useAppStore();
  
  const simNodes = useRef([]);
  const canvasRef = useRef(null);
  const [tick, setTick] = useState(0); 
  
  const isPanning = useRef(false);
  const draggedNodeIdRef = useRef(null);
  const lastMouse = useRef({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  const activeHighlightIds = useMemo(() => {
    if (!hoveredNodeId) return null;
    const set = new Set();
    set.add(hoveredNodeId);
    simNodes.current.forEach(n => {
      if (n.id === hoveredNodeId && n.parentId) set.add(n.parentId);
      if (n.parentId === hoveredNodeId) set.add(n.id);
    });
    return set;
  }, [hoveredNodeId, tick]);

  useEffect(() => {
    const currentSims = simNodes.current || [];
    simNodes.current = nodes.map(n => {
      const existing = currentSims.find(sn => sn.id === n.id);
      if (existing) return { ...n, x: existing.x, y: existing.y, vx: existing.vx, vy: existing.vy };
      const parent = currentSims.find(sn => sn.id === n.parentId);
      const startX = parent ? parent.x + (Math.random() - 0.5) * 40 : 200 + (Math.random() - 0.5) * 80;
      const startY = parent ? parent.y + (Math.random() - 0.5) * 40 : 200 + (Math.random() - 0.5) * 80;
      return { ...n, x: startX, y: startY, vx: 0, vy: 0 };
    });
  }, [nodes]);

  useEffect(() => {
    if (graphSubMode !== 'graph') return;
    let animationId;
    const step = () => {
      const ns = simNodes.current;
      const edges = [];
      ns.forEach(n => { if (n.parentId) edges.push({ source: n.id, target: n.parentId }); });

      const damping = 0.85; const repulsion = 1200; const springK = 0.05; const springDist = 60; const centerGravity = 0.015; 

      for (let i = 0; i < ns.length; i++) {
        for (let j = i + 1; j < ns.length; j++) {
          const dx = ns[i].x - ns[j].x; const dy = ns[i].y - ns[j].y;
          let distSq = dx * dx + dy * dy || 1; const dist = Math.sqrt(distSq);
          const force = repulsion / distSq; const fx = (dx / dist) * force; const fy = (dy / dist) * force;
          ns[i].vx += fx; ns[i].vy += fy; ns[j].vx -= fx; ns[j].vy -= fy;
        }
      }

      edges.forEach(edge => {
        const n1 = ns.find(n => n.id === edge.source); const n2 = ns.find(n => n.id === edge.target);
        if(!n1 || !n2) return;
        const dx = n2.x - n1.x; const dy = n2.y - n1.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (dist - springDist) * springK;
        const fx = (dx / dist) * force; const fy = (dy / dist) * force;
        n1.vx += fx; n1.vy += fy; n2.vx -= fx; n2.vy -= fy;
      });

      ns.forEach(n => {
        n.vx += (200 - n.x) * centerGravity; n.vy += (200 - n.y) * centerGravity;
        if (draggedNodeIdRef.current !== n.id) { n.x += n.vx; n.y += n.vy; } else { n.vx = 0; n.vy = 0; }
        n.vx *= damping; n.vy *= damping;
      });

      setTick(t => t + 1); 
      animationId = requestAnimationFrame(step);
    };
    animationId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationId);
  }, [graphSubMode]);

  const handleCanvasPointerDown = (e) => {
    const clientX = e.clientX || (e.touches && e.touches?.clientX);
    const clientY = e.clientY || (e.touches && e.touches?.clientY);
    lastMouse.current = { x: clientX, y: clientY };
    isPanning.current = true;
  };

  const handleNodePointerDown = (id, e) => {
    e.stopPropagation();
    isPanning.current = false;
    draggedNodeIdRef.current = id;
    setSelectedNodeId(id);
  };

  useEffect(() => {
    const handleMove = (e) => {
      const cx = e.clientX || (e.touches && e.touches?.clientX);
      const cy = e.clientY || (e.touches && e.touches?.clientY);
      if (cx === undefined || cy === undefined) return;
      const dx = cx - lastMouse.current.x; const dy = cy - lastMouse.current.y;

      if (isPanning.current) setPanOffset(p => ({ x: p.x + dx, y: p.y + dy }));
      if (draggedNodeIdRef.current) {
        const node = simNodes.current.find(n => n.id === draggedNodeIdRef.current);
        if (node) {
          const scale = 1.0 - (((Math.max(190, Math.min(440, sheetHeight)) - 190) / 250) * 0.18);
          node.x += dx / scale; node.y += dy / scale; node.vx = 0; node.vy = 0;
        }
      }
      lastMouse.current = { x: cx, y: cy };
    };
    const handleUp = () => { isPanning.current = false; draggedNodeIdRef.current = null; };

    window.addEventListener('mousemove', handleMove); window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove, { passive: false }); window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove); window.removeEventListener('touchend', handleUp);
    };
  }, [sheetHeight]);

  const transformStyle = () => {
    const ratio = (Math.max(190, Math.min(440, sheetHeight)) - 190) / 250;
    const scale = 1.0 - (ratio * 0.18);
    const translateY = -(ratio * 55) + panOffset.y;
    return {
      transform: `scale(${scale}) translate(${panOffset.x}px, ${translateY}px)`,
      transformOrigin: '200px 220px',
      transition: isPanning.current || draggedNodeIdRef.current ? 'none' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
    };
  };

  return (
    <div ref={canvasRef} onMouseDown={handleCanvasPointerDown} onTouchStart={handleCanvasPointerDown} className="flex-1 relative bg-[#FAF9F6] overflow-hidden select-none cursor-grab active:cursor-grabbing">
      <div className="absolute inset-0 bg-[radial-gradient(#E2E8F0_1px,transparent_1px)] bg-[size:20px_20px] opacity-60 pointer-events-none" />
      <div style={transformStyle()} className="w-full h-full relative">
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
          {simNodes.current.map(node => {
            if (!node.parentId) return null;
            const parent = simNodes.current.find(n => n.id === node.parentId);
            if (!parent) return null;
            const isHighlighted = activeHighlightIds ? (activeHighlightIds.has(node.id) && activeHighlightIds.has(parent.id)) : (activeNodeIds && activeNodeIds.has(node.id) && activeNodeIds.has(parent.id));
            return (
              <line key={`link-${node.id}`} x1={parent.x} y1={parent.y} x2={node.x} y2={node.y}
                stroke={isHighlighted ? "#CBD5E1" : "#F1F5F9"} strokeWidth={isHighlighted ? "1.5" : "0.5"}
                className="transition-all duration-300" style={{ opacity: isHighlighted ? 1 : 0.1 }} />
            );
          })}
        </svg>

        {simNodes.current.map(node => {
          const isSelected = selectedNodeId === node.id;
          const isHovered = hoveredNodeId === node.id;
          const isHighlighted = activeHighlightIds ? activeHighlightIds.has(node.id) : (activeNodeIds && activeNodeIds.has(node.id));
          const dotSize = node.size === 'lg' ? 'w-4 h-4' : node.size === 'md' ? 'w-3 h-3' : 'w-2 h-2';

          return (
            <div key={node.id} onMouseDown={(e) => handleNodePointerDown(node.id, e)} onTouchStart={(e) => handleNodePointerDown(node.id, e)}
              onMouseEnter={() => setHoveredNodeId(node.id)} onMouseLeave={() => setHoveredNodeId(null)}
              style={{ position: 'absolute', left: `${node.x}px`, top: `${node.y}px`, transform: 'translate(-50%, -50%)', zIndex: isSelected || isHovered ? 40 : isHighlighted ? 20 : 10, opacity: isHighlighted ? 1 : 0.15 }}
              className="absolute cursor-pointer select-none transition-opacity duration-300 group"
            >
              <div className={`rounded-full bg-gradient-to-br ${node.color} shadow-sm transition-transform duration-200 ${dotSize} ${isSelected ? 'ring-4 ring-indigo-200 scale-125' : 'group-hover:scale-125'}`} />
              <span className={`absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap font-bold pointer-events-none transition-colors duration-200 drop-shadow-sm ${isSelected ? 'text-indigo-600 text-xs' : 'text-slate-600 text-[10px] group-hover:text-slate-900'}`}>
                {node.label}
              </span>
            </div>
          );
        })}
      </div>
      <button onClick={(e) => { e.stopPropagation(); setPanOffset({x:0, y:0}); }} className="absolute bottom-4 right-4 p-2 bg-white/80 backdrop-blur border border-slate-200 text-slate-500 rounded-full shadow-sm hover:text-slate-800 z-50 text-[10px] font-bold">
        중앙 정렬
      </button>
    </div>
  );
}