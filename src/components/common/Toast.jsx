import React from 'react';
import { Sparkles } from 'lucide-react';
import { useAppStore } from '../../store/AppStore';

const Toast = () => {
  const { toastMessage } = useAppStore();
  if (!toastMessage) return null;
  return (
    <div className="fixed bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 z-[200] bg-zinc-900 text-white text-sm tracking-tight py-3 px-6 shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5 duration-300 rounded-full border border-zinc-800">
      <Sparkles size={16} className="text-yellow-400" />
      <span className="font-medium">{toastMessage}</span>
    </div>
  );
};
export default Toast;