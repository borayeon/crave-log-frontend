import React from 'react';
import { 
  PlayCircle, Disc, Lock, Trash2, GripVertical, 
  ChevronUp, ChevronDown, Link as LinkIcon, ExternalLink, Quote 
} from 'lucide-react';
import { DEFAULT_IMAGE, MUSIC_DEFAULT_IMAGE } from '../../../utils/mediaUtils';

const ArchiveRecordCard = ({
  item,
  index,
  totalCount,
  isListMode,
  isEditing,
  editingRankId,
  setEditingRankId,
  rankInputValue,
  setRankInputValue,
  handleRankDirectChange,
  handleMoveItem,
  handleDragStart,
  handleDragOver,
  handleDrop,
  draggedIndex,
  onSelectRecord,
  onConfirmDelete
}) => {
  // 1. 음악 레코드판 UI
  if (item.isMusic) {
    const thumbnailUrl = item.videoId
      ? `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`
      : MUSIC_DEFAULT_IMAGE;

    if (isListMode) {
      return (
        <div
          draggable={!isEditing && editingRankId !== item.id}
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={(e) => handleDrop(e, index)}
          onClick={() => !isEditing && onSelectRecord(item)}
          className={`group relative w-full flex items-center gap-3 sm:gap-4 p-3 bg-white border border-zinc-200/80 rounded-2xl shadow-sm cursor-pointer transition-all hover:shadow-md hover:border-indigo-200 ${
            draggedIndex === index ? 'opacity-40 border-dashed border-indigo-400' : ''
          } ${isEditing ? 'opacity-90' : ''}`}
        >
          {!isEditing && (
            <div
              className="cursor-grab active:cursor-grabbing text-zinc-300 hover:text-zinc-600 p-1 shrink-0 transition-colors"
              title="드래그하여 순서 변경"
            >
              <GripVertical size={18} />
            </div>
          )}

          <div className="flex items-center gap-1 shrink-0">
            <div className="w-10 text-center flex items-center justify-center">
              {editingRankId === item.id && !isEditing ? (
                <input
                  type="number"
                  autoFocus
                  value={rankInputValue}
                  onChange={(e) => setRankInputValue(e.target.value)}
                  onBlur={() => handleRankDirectChange(item.id, index, rankInputValue)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleRankDirectChange(item.id, index, rankInputValue);
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full text-center text-sm sm:text-base font-black text-indigo-600 bg-indigo-50 rounded border border-indigo-200 outline-none py-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  min="1"
                  max={totalCount}
                />
              ) : (
                <span
                  onClick={(e) => {
                    if (isEditing) return;
                    e.stopPropagation();
                    setEditingRankId(item.id);
                    setRankInputValue(index + 1);
                  }}
                  className="text-sm sm:text-base font-black text-zinc-400 italic group-hover:text-indigo-600 transition-colors cursor-pointer px-1.5 py-0.5 hover:bg-zinc-50 rounded"
                  title="클릭하여 순위 직접 변경"
                >
                  {index + 1}
                </span>
              )}
            </div>
            {!isEditing && (
              <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => handleMoveItem(e, index, 'up')}
                  disabled={index === 0}
                  className="p-0.5 text-zinc-400 hover:text-indigo-600 disabled:opacity-20 hover:bg-zinc-100 rounded"
                  title="위로 이동"
                >
                  <ChevronUp size={12} />
                </button>
                <button
                  onClick={(e) => handleMoveItem(e, index, 'down')}
                  disabled={index === totalCount - 1}
                  className="p-0.5 text-zinc-400 hover:text-indigo-600 disabled:opacity-20 hover:bg-zinc-100 rounded"
                  title="아래로 이동"
                >
                  <ChevronDown size={12} />
                </button>
              </div>
            )}
          </div>

          <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-xl overflow-hidden border border-zinc-100 ml-1">
            <img
              src={thumbnailUrl}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-zinc-900/80 rounded-full flex items-center justify-center backdrop-blur-sm shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
              <PlayCircle size={14} className="text-white/90 translate-x-[1px]" />
            </div>
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-sm sm:text-base font-black text-zinc-900 truncate group-hover:text-indigo-600 transition-colors">
                {item.title}
              </h3>
              {!item.isPublic && !isEditing && <Lock size={12} className="text-rose-400 shrink-0" />}
            </div>
            {item.content && (
              <p className="text-xs text-zinc-500 truncate font-medium">{item.content}</p>
            )}
          </div>

          <div className="hidden sm:flex flex-col items-end gap-1.5 shrink-0 ml-4">
            <span className="text-[10px] font-bold text-zinc-400">{item.date}</span>
            <div className="flex gap-1.5">
              {(item.tags || []).slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 bg-zinc-50 border border-zinc-100 rounded-md text-[9px] font-bold text-zinc-500"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {isEditing && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onConfirmDelete(item.id);
              }}
              className="p-2 sm:p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-colors ml-2 shrink-0"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      );
    }

    return (
      <div
        onClick={() => !isEditing && onSelectRecord(item)}
        className={`group relative w-full max-w-[260px] mx-auto flex flex-col items-center justify-start cursor-pointer animate-in fade-in transition-all duration-500 ease-out ${
          !isEditing ? 'hover:-translate-y-1' : ''
        }`}
      >
        <div
          className={`relative w-full aspect-square rounded-full overflow-hidden shadow-xl border-[5px] sm:border-[6px] border-zinc-900 transition-transform duration-500 ease-out ${
            isEditing
              ? 'opacity-80 scale-100'
              : 'group-hover:scale-105 group-hover:shadow-2xl group-hover:border-zinc-800'
          }`}
        >
          <img
            src={thumbnailUrl}
            alt={item.title}
            className={`w-full h-full object-cover scale-125 transition-transform duration-700 ease-out ${
              !isEditing ? 'group-hover:rotate-12 group-hover:scale-150' : ''
            }`}
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-zinc-900 rounded-full border-[3px] border-zinc-700 flex items-center justify-center shadow-inner">
            <PlayCircle size={24} className="text-white/80 translate-x-[1px]" />
          </div>
          {isEditing && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onConfirmDelete(item.id);
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 p-3 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 hover:scale-110 transition-all animate-in zoom-in-50"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>
        <div className="mt-4 sm:mt-5 text-center px-2 w-full">
          <h3 className="text-sm sm:text-base font-black text-zinc-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {item.title}
          </h3>
          <p className="text-[10px] sm:text-[11px] font-bold text-red-500 mt-1.5 flex items-center justify-center gap-1 uppercase tracking-widest">
            <Disc size={12} /> Record
          </p>
        </div>
        {!item.isPublic && !isEditing && (
          <div className="absolute top-0 right-0 p-1.5 sm:p-2 bg-zinc-900/80 backdrop-blur-md text-rose-400 rounded-full shadow-sm z-20">
            <Lock size={12} />
          </div>
        )}
      </div>
    );
  }

  // 2. 일반 카드 (URL 및 이미지 뷰)
  return (
    <div
      onClick={() => {
        if (isEditing) return;
        if (item.isUrlItem && item.youtubeUrl) {
          window.open(item.youtubeUrl, '_blank', 'noopener,noreferrer');
          return;
        }
        onSelectRecord(item);
      }}
      className={`group relative aspect-[3/4] w-full max-w-[260px] mx-auto rounded-xl sm:rounded-[1.5rem] overflow-hidden shadow-sm cursor-pointer border border-zinc-200/80 bg-white transition-all duration-500 ease-out transform flex flex-col ${
        !isEditing
          ? 'hover:scale-[1.03] hover:-translate-y-1 hover:shadow-xl hover:z-10 hover:border-indigo-300'
          : ''
      }`}
    >
      {item.isUrlItem ? (
        <div className="w-full h-full bg-gradient-to-br from-blue-50/80 via-white to-zinc-50/80 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 text-center relative overflow-hidden group/card">
          <div className="absolute top-3 sm:top-5 left-3 sm:left-5 px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-100/60 text-blue-700 text-[10px] sm:text-[11px] font-black rounded-lg flex items-center gap-1.5 shadow-sm z-10">
            <LinkIcon size={12} /> {item.category}
          </div>
          <div className="flex flex-col items-center w-full h-full justify-center mt-4">
            {item.youtubeUrl && item.domain ? (
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-24 md:h-24 bg-white rounded-xl sm:rounded-2xl shadow-md flex items-center justify-center p-2 sm:p-3 mb-3 sm:mb-4 border border-zinc-100 transition-transform group-hover/card:scale-110">
                <img
                  src={`https://icons.duckduckgo.com/ip3/${item.domain}.ico`}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${item.domain?.charAt(0)}&background=EFF6FF&color=4F46E5&bold=true&size=128`;
                  }}
                  className="w-full h-full object-contain"
                  alt="site logo"
                />
              </div>
            ) : (
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-24 md:h-24 bg-blue-50 text-blue-300 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 transition-transform group-hover/card:scale-110">
                <LinkIcon size={32} className="sm:w-10 sm:h-10" />
              </div>
            )}
            <h3 className="text-sm sm:text-base md:text-lg font-black text-zinc-800 mb-1.5 sm:mb-2 leading-snug line-clamp-2 px-2 w-full">
              {item.title}
            </h3>
            <p className="text-[9px] sm:text-[11px] font-bold text-zinc-400 mt-1.5 sm:mt-2 bg-white/80 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border border-zinc-100 truncate max-w-[80%]">
              {item.domain || '클릭하여 열기'}
            </p>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 transition-opacity duration-300 group-hover/link:opacity-100 bg-blue-50/95 backdrop-blur-sm">
            <ExternalLink size={32} className="text-blue-500 mb-2" />
            <span className="text-[11px] font-black text-blue-600 bg-white px-3 py-1 rounded-md shadow-sm hidden sm:block">
              새 창으로 열기
            </span>
          </div>
        </div>
      ) : item.isTextOnly ? (
        <div className="w-full h-full bg-gradient-to-br from-indigo-50/60 via-white to-zinc-50/60 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 text-center relative overflow-hidden">
          <div className="absolute top-3 sm:top-5 left-3 sm:left-5 px-2 sm:px-3 py-1 sm:py-1.5 bg-indigo-100/60 text-indigo-600 text-[10px] sm:text-[11px] font-black rounded-lg flex items-center gap-1.5 shadow-sm">
            <Quote size={12} /> {item.category}
          </div>
          <h3 className="text-base sm:text-xl md:text-2xl font-black text-zinc-800 mb-2 sm:mb-3 mt-4 sm:mt-6 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2 px-2">
            {item.title}
          </h3>
          {item.content && (
            <p className="text-[10px] sm:text-sm md:text-base font-medium text-zinc-500 line-clamp-3 sm:line-clamp-4 leading-relaxed px-3">
              "{item.content}"
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="relative w-full flex-1 overflow-hidden bg-zinc-100">
            <img
              src={item.image}
              onError={(e) => {
                e.target.src = DEFAULT_IMAGE;
              }}
              alt={item.title}
              className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
                isEditing ? 'opacity-80 scale-100' : 'group-hover:scale-105'
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
            <div className="absolute top-3 sm:top-4 left-3 sm:left-4 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/90 backdrop-blur-md text-indigo-600 text-[9px] sm:text-[11px] font-black rounded-lg shadow-sm uppercase tracking-wider">
              {item.category}
            </div>
          </div>
          <div className="p-3 sm:p-4 flex flex-col justify-center bg-white z-10 border-t border-zinc-100 shrink-0 h-auto sm:h-[72px] min-h-[60px]">
            <h4 className="text-sm sm:text-base font-black text-zinc-900 truncate group-hover:text-indigo-600 transition-colors">
              {item.title}
            </h4>
            {(item.tags || []).length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1.5 overflow-hidden h-4">
                {item.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] sm:text-[11px] font-bold text-zinc-400 truncate max-w-[70px] sm:max-w-[90px]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {!item.isPublic && (
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 p-1.5 sm:p-2 bg-zinc-900/80 backdrop-blur-md text-rose-400 rounded-full shadow-sm z-20">
          <Lock size={12} />
        </div>
      )}

      {isEditing && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onConfirmDelete(item.id);
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 p-3 sm:p-4 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 hover:scale-110 transition-all animate-in zoom-in-50"
        >
          <Trash2 size={20} />
        </button>
      )}
    </div>
  );
};

export default ArchiveRecordCard;
