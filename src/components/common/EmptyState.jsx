import React from 'react';
import { Plus } from 'lucide-react';

const EmptyState = ({ title, icon, onAction, actionLabel }) => (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4 h-[60vh]">
        <div className="w-20 h-20 bg-zinc-100/50 rounded-full flex items-center justify-center text-zinc-400 mb-6 border border-zinc-200/50 shadow-sm">
            {icon}
        </div>
        <h3 className="text-2xl font-black text-zinc-800 mb-3">{title}</h3>
        <p className="text-sm text-zinc-500 font-medium mb-8 max-w-sm leading-relaxed">
            아직 기록된 내용이 없습니다.<br/>나만의 취향과 이야기를 차곡차곡 쌓아 나를 표현하는 멋진 공간을 완성해보세요.
        </p>
        <button onClick={onAction} className="px-6 py-3 bg-zinc-900 text-white rounded-xl text-sm font-bold shadow-md hover:bg-zinc-800 transition flex items-center gap-2">
            <Plus size={16} /> {actionLabel}
        </button>
    </div>
);
export default EmptyState;