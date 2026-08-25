import React from 'react';
import { CreditCard, Mail, Phone, MapPin, Globe } from 'lucide-react';

const BusinessCard = ({ data, userName }) => {
  const t = data?.template || 'dark';
  let tClass = "bg-zinc-900 text-white";
  if(t === 'light') tClass = "bg-white text-zinc-900 border border-zinc-200 shadow-sm";
  if(t === 'gradient') tClass = "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md";
  if(t === 'glass') tClass = "bg-zinc-50/80 backdrop-blur-md border border-zinc-200 text-zinc-800 shadow-sm";

  return (
      <div className={`w-full max-w-md mx-auto aspect-auto sm:aspect-[1.58/1] min-h-[220px] sm:min-h-0 rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${tClass}`}>
          {t === 'dark' && <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>}
          {t === 'gradient' && <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>}

          <div className="flex justify-between items-start relative z-10">
              <span className="font-black text-lg sm:text-xl tracking-tight opacity-90">{data?.company || 'Company Name'}</span>
              <CreditCard size={20} className="opacity-50"/>
          </div>

          <div className="relative z-10 mt-6 sm:mt-4">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{userName || 'Your Name'}</h2>
              <p className="text-xs sm:text-sm font-bold opacity-80 mt-1">{data?.position || 'Position / Role'}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-[11px] sm:text-xs font-medium opacity-90 mt-6 relative z-10">
              <div className="flex items-center gap-1.5 truncate min-w-0"><Mail size={12} className="shrink-0"/> <span className="truncate">{data?.email || 'email@example.com'}</span></div>
              <div className="flex items-center gap-1.5 truncate min-w-0"><Phone size={12} className="shrink-0"/> <span className="truncate">{data?.phone || '+82 10-0000-0000'}</span></div>
              <div className="flex items-center gap-1.5 truncate min-w-0"><MapPin size={12} className="shrink-0"/> <span className="truncate">{data?.address || 'Seoul, Republic of Korea'}</span></div>
              <div className="flex items-center gap-1.5 truncate min-w-0"><Globe size={12} className="shrink-0"/> <span className="truncate">{data?.website || 'www.example.com'}</span></div>
          </div>
      </div>
  );
};

export default BusinessCard;