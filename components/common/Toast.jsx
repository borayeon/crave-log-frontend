"use client";
import { Sparkles } from 'lucide-react';
import { useAppStore } from '../../store/useStore';

export default function Toast() {
  // 🚀 기존 Zustand 방식 대신 Context API의 구조분해할당 방식으로 꺼내옵니다.
  const { toastMessage } = useAppStore();
  
  if (!toastMessage) return null;
  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-[11px] tracking-tight py-2.5 px-4 shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-300 rounded-xl">
      <Sparkles size={13} className="text-yellow-400" />
      <span>{toastMessage}</span>
    </div>
  );
}