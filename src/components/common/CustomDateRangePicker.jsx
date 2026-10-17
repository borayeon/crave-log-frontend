import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CustomDateRangePicker = ({ startDate, endDate, onChange, onClose }) => {
  const [currentDate, setCurrentDate] = useState(startDate ? new Date(startDate) : new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleDayClick = (day) => {
    const clickedDate = new Date(year, month, day);
    const formatted = `${clickedDate.getFullYear()}-${String(clickedDate.getMonth() + 1).padStart(2, '0')}-${String(clickedDate.getDate()).padStart(2, '0')}`;

    if (!startDate || (startDate && endDate)) {
      onChange(formatted, '');
    } else {
      const start = new Date(startDate);
      if (clickedDate < start) {
        onChange(formatted, '');
      } else if (formatted === startDate) {
        onChange(startDate, '');
      } else {
        onChange(startDate, formatted);
      }
    }
  };

  const isSelected = (day) => {
    const d = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return d === startDate || d === endDate;
  };

  const isInRange = (day) => {
    if (!startDate || !endDate) return false;
    const d = new Date(year, month, day);
    return d > new Date(startDate) && d < new Date(endDate);
  };

  return (
    <div className="bg-white border border-zinc-200 p-4 rounded-2xl shadow-xl w-[280px] absolute z-[300] mt-2 left-0" onClick={e => e.stopPropagation()}>
      <div className="flex justify-between items-center mb-4">
        <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-zinc-100 rounded-lg text-zinc-500 transition-colors">
          <ChevronLeft size={16} />
        </button>
        <span className="font-black text-sm text-zinc-800">{year}년 {month + 1}월</span>
        <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-zinc-100 rounded-lg text-zinc-500 transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] mb-2 text-zinc-400 font-bold uppercase">
        <div>일</div><div>월</div><div>화</div><div>수</div><div>목</div><div>금</div><div>토</div>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-sm">
        {blanks.map(b => <div key={`blank-${b}`} className="p-2" />)}
        {days.map(day => {
          const selected = isSelected(day);
          const inRange = isInRange(day);
          const isStart = startDate === `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isEnd = endDate === `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          
          let bgClass = "hover:bg-zinc-100";
          let textClass = "text-zinc-700 font-medium";
          let roundedClass = "rounded-lg";

          if (selected) {
            bgClass = "bg-indigo-500 shadow-sm";
            textClass = "text-white font-black";
            if (isStart && endDate) roundedClass = "rounded-l-lg rounded-r-none";
            if (isEnd) roundedClass = "rounded-r-lg rounded-l-none";
            if (isStart && !endDate) roundedClass = "rounded-lg";
          } else if (inRange) {
            bgClass = "bg-indigo-50";
            textClass = "text-indigo-700 font-bold";
            roundedClass = "rounded-none";
          }

          return (
            <button
              key={day}
              type="button"
              onClick={() => handleDayClick(day)}
              className={`py-1.5 w-full flex items-center justify-center transition-colors ${bgClass} ${textClass} ${roundedClass}`}
            >
              {day}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex justify-between items-center border-t border-zinc-100 pt-3">
        <span className="text-[10px] font-bold text-zinc-400">{startDate && endDate ? '기간 설정됨' : '날짜 선택'}</span>
        <button type="button" onClick={onClose} className="text-xs font-black text-white bg-zinc-900 px-4 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors">
          적용
        </button>
      </div>
    </div>
  );
};

export default CustomDateRangePicker;
