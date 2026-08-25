import React from 'react';
import { Compass } from 'lucide-react';

const Mandalart = ({ visionData, isEditMode = false, updateNested }) => {
  const defaultVision = { core: "", subs: Array(8).fill(""), details: Array.from({length: 8}, () => Array(8).fill("")) };
  const v = {
      core: visionData?.core || defaultVision.core,
      subs: visionData?.subs?.length === 8 ? visionData.subs : defaultVision.subs,
      details: visionData?.details?.length === 8 ? visionData.details : defaultVision.details
  };
  
  const handleCoreChange = (val) => updateNested && updateNested(['idol', 'vision', 'core'], val);
  const handleSubChange = (subIdx, val) => {
    const newSubs = [...v.subs];
    newSubs[subIdx] = val;
    updateNested && updateNested(['idol', 'vision', 'subs'], newSubs);
  };
  const handleDetailChange = (subIdx, detailIdx, val) => {
    const newDetails = [...v.details];
    if (!newDetails[subIdx]) newDetails[subIdx] = Array(8).fill("");
    else newDetails[subIdx] = [...newDetails[subIdx]]; 
    newDetails[subIdx][detailIdx] = val;
    updateNested && updateNested(['idol', 'vision', 'details'], newDetails);
  };

  const blocks = [];
  for (let i = 0; i < 9; i++) {
      if (i === 4) {
          blocks.push([
              { t: 'sub', idx: 0, val: v.subs[0] }, { t: 'sub', idx: 1, val: v.subs[1] }, { t: 'sub', idx: 2, val: v.subs[2] },
              { t: 'sub', idx: 3, val: v.subs[3] }, { t: 'core', idx: 0, val: v.core }, { t: 'sub', idx: 4, val: v.subs[4] },
              { t: 'sub', idx: 5, val: v.subs[5] }, { t: 'sub', idx: 6, val: v.subs[6] }, { t: 'sub', idx: 7, val: v.subs[7] }
          ]);
      } else {
          const subIdx = i < 4 ? i : i - 1;
          const d = v.details[subIdx] || Array(8).fill("");
          blocks.push([
              { t: 'detail', subIdx, idx: 0, val: d[0] }, { t: 'detail', subIdx, idx: 1, val: d[1] }, { t: 'detail', subIdx, idx: 2, val: d[2] },
              { t: 'detail', subIdx, idx: 3, val: d[3] }, { t: 'sub-readonly', subIdx, idx: 0, val: v.subs[subIdx] }, { t: 'detail', subIdx, idx: 4, val: d[4] },
              { t: 'detail', subIdx, idx: 5, val: d[5] }, { t: 'detail', subIdx, idx: 6, val: d[6] }, { t: 'detail', subIdx, idx: 7, val: d[7] }
          ]);
      }
  }

  return (
      <div className={`bg-zinc-900 p-6 md:p-10 rounded-3xl shadow-sm overflow-x-auto scrollbar-hide text-white relative ${!isEditMode ? 'pointer-events-none opacity-90' : ''}`}>
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>
          {!isEditMode && <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>}
          
          <div className="text-center mb-8 relative z-10">
              <h3 className="text-2xl md:text-3xl font-black mb-2 flex items-center justify-center gap-2"><Compass className="text-violet-400"/> {isEditMode ? 'Mandalart Editor' : 'Mandalart'}</h3>
              <p className="text-violet-200/80 text-[11px] font-medium uppercase tracking-widest">나의 비전을 이루기 위한 81가지 세부 계획{isEditMode && '을 수정하세요'}</p>
          </div>
          <div className={`${isEditMode ? 'min-w-[650px]' : 'w-full'} max-w-2xl mx-auto aspect-square grid grid-cols-3 gap-1 md:gap-1.5 p-1.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 relative z-10 shadow-2xl`}>
              {blocks.map((block, bIdx) => (
                  <div key={bIdx} className="grid grid-cols-3 gap-px bg-white/30 border border-white/20 rounded-xl overflow-hidden shadow-inner p-px">
                      {block.map((cell, cIdx) => {
                          let bg = isEditMode ? "bg-white/95 hover:bg-white focus:bg-white" : "bg-white/95";
                          let textClass = "text-slate-800 font-bold";
                          let placeholder = "세부 계획";
                          let onChange = null;
                          let disabled = !isEditMode;

                          if (cell.t === 'core') {
                              bg = isEditMode ? "bg-violet-500 hover:bg-violet-400 focus:bg-violet-400 z-10 shadow-md" : "bg-violet-500 shadow-lg z-10";
                              textClass = "text-white font-black text-[9px] sm:text-[11px] md:text-sm";
                              placeholder = "최종 목표";
                              onChange = (e) => handleCoreChange(e.target.value);
                          } else if (cell.t === 'sub') {
                              bg = isEditMode ? "bg-violet-100 hover:bg-violet-50 focus:bg-violet-50" : "bg-violet-50";
                              textClass = "text-violet-900 font-black text-[8px] sm:text-[10px] md:text-sm";
                              placeholder = "핵심 요건";
                              onChange = (e) => handleSubChange(cell.idx, e.target.value);
                          } else if (cell.t === 'sub-readonly') {
                              bg = isEditMode ? "bg-violet-200/80 cursor-not-allowed" : "bg-violet-50";
                              textClass = "text-violet-900 font-black text-[8px] sm:text-[10px] md:text-sm";
                              disabled = true;
                          } else if (cell.t === 'detail') {
                              onChange = (e) => handleDetailChange(cell.subIdx, cell.idx, e.target.value);
                              textClass = "text-slate-800 font-bold text-[7px] sm:text-[9px] md:text-xs";
                          }

                          if (!isEditMode) {
                              return (
                                  <div key={cIdx} className={`${bg} ${textClass} flex items-center justify-center text-center p-0.5 md:p-1 overflow-hidden break-words leading-tight transition-colors hover:brightness-95 cursor-default`}>
                                      {cell.val || '-'}
                                  </div>
                              )
                          }

                          return (
                              <textarea
                                  key={cIdx}
                                  disabled={disabled}
                                  value={cell.val || ''}
                                  onChange={onChange}
                                  placeholder={placeholder}
                                  className={`w-full h-full min-h-[50px] p-1 text-center resize-none outline-none transition-colors placeholder:text-black/20 flex items-center justify-center ${bg} ${textClass}`}
                                  style={{ lineHeight: '1.2' }}
                              />
                          );
                      })}
                  </div>
              ))}
          </div>
      </div>
  );
};

export default Mandalart;