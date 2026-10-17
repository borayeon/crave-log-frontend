import React from 'react';
import { 
  Calendar, Disc, Lock, PlayCircle, Link as LinkIcon, 
  ExternalLink, Quote 
} from 'lucide-react';
import { DEFAULT_IMAGE, MUSIC_DEFAULT_IMAGE, getYoutubeId, getDomain } from '../../../utils/mediaUtils';
import { trackOutboundClick } from '../../../utils/analyticsTracker';

const TimelineItemCard = ({ item, isEditing, safeTagTree, onSelectRecord, onUnlockSecret, onFollowHost }) => {
  if (item.isLocked) {
    const isFollowerLocked = item.lockType === 'FOLLOWER';
    return (
      <div className="relative pl-6 md:pl-8 group">
        <div className="absolute w-3 h-3 bg-zinc-300 border-[3px] border-zinc-400 rounded-full -left-[5px] top-6 z-10" />
        <div className="bg-zinc-50 border border-dashed border-zinc-300 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
          <div className="w-12 h-12 rounded-2xl bg-zinc-200/70 flex items-center justify-center shrink-0">
            <Lock size={20} className={isFollowerLocked ? 'text-indigo-600' : 'text-amber-600'} />
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-black px-2 py-0.5 rounded ${isFollowerLocked ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>
                {isFollowerLocked ? '1단계: 팔로워 공개' : '2단계: 비밀 공개'}
              </span>
              <span className="text-[11px] font-bold text-zinc-400">{item.date}</span>
            </div>
            <h4 className="text-sm font-black text-zinc-800 truncate mb-1">{item.title}</h4>
            <p className="text-xs text-zinc-500 line-clamp-1">{item.content}</p>
          </div>
          {isFollowerLocked ? (
            onFollowHost && (
              <button
                onClick={onFollowHost}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors"
              >
                팔로우 요청
              </button>
            )
          ) : (
            onUnlockSecret && (
              <button
                onClick={() => onUnlockSecret(item)}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shrink-0 transition-colors"
              >
                PIN 입력
              </button>
            )
          )}
        </div>
      </div>
    );
  }

  const matchedCat = safeTagTree.find(
    (c) => c.name === item.category || String(c.id) === String(item.categoryId)
  );
  const catType =
    item.categoryType ||
    matchedCat?.type ||
    (item.category?.includes('음악')
      ? 'MUSIC'
      : item.category?.includes('URL')
      ? 'URL'
      : 'GENERAL');

  const isMusic = catType === 'MUSIC';
  const isUrlItem = catType === 'URL';

  const videoId = isMusic && item.youtubeUrl ? getYoutubeId(item.youtubeUrl) : null;
  const hasImage = item.image && item.image.trim() !== '' && item.image !== DEFAULT_IMAGE;
  const isTextOnly = !isMusic && !isUrlItem && !hasImage;

  const handleClick = () => {
    if (isEditing) return;
    // URL 아이템 클릭 시 새 창 열기
    if (item.isUrlItem && item.youtubeUrl) {
      trackOutboundClick(item.youtubeUrl, item.title);
      window.open(item.youtubeUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    onSelectRecord(item);
  };

  return (
    <div className="relative pl-6 md:pl-8 group">
      <div className="absolute w-3 h-3 bg-white border-[3px] border-indigo-400 rounded-full -left-[5px] top-6 group-hover:border-indigo-600 group-hover:scale-150 transition-all duration-300 shadow-sm z-10" />

      <div
        onClick={handleClick}
        className={`bg-white border border-zinc-200/80 rounded-2xl p-3.5 md:p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 flex flex-col sm:flex-row gap-4 items-center sm:items-start group-hover:-translate-y-1 cursor-pointer ${
          isTextOnly ? 'bg-gradient-to-br from-white to-zinc-50/50' : ''
        }`}
      >
        {/* 타입별 썸네일 영역 */}
        {isMusic ? (
          <div className="w-24 h-24 sm:w-24 sm:h-24 md:w-28 md:h-28 shrink-0 overflow-hidden bg-zinc-100 relative shadow-inner rounded-full border-4 border-zinc-900 group-hover:rotate-12 transition-transform duration-700 mx-auto sm:mx-0">
            <img
              src={videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : MUSIC_DEFAULT_IMAGE}
              onError={(e) => {
                e.target.src = MUSIC_DEFAULT_IMAGE;
              }}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-700 ease-out scale-125"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-zinc-900 rounded-full border-2 border-zinc-700 flex items-center justify-center shadow-inner">
              <PlayCircle size={14} className="text-white/80 translate-x-[1px]" />
            </div>
          </div>
        ) : isUrlItem ? (
          <div className="w-full h-24 sm:w-24 sm:h-24 md:w-28 md:h-28 shrink-0 bg-white border-2 border-zinc-100 hover:border-blue-400 rounded-xl flex flex-col items-center justify-center relative shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group/link">
            <div className="absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300 bg-white group-hover/link:opacity-0">
              {item.youtubeUrl && getDomain(item.youtubeUrl) ? (
                <img
                  src={`https://icons.duckduckgo.com/ip3/${getDomain(item.youtubeUrl)}.ico`}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${getDomain(item.youtubeUrl)?.charAt(0)}&background=EFF6FF&color=4F46E5&bold=true&size=128`;
                  }}
                  alt="favicon"
                  className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mb-2 rounded-lg shadow-sm"
                />
              ) : (
                <LinkIcon size={28} className="text-blue-300 mb-2" />
              )}
              <span className="text-[9px] md:text-[10px] font-bold text-zinc-400 max-w-[80%] truncate">
                {getDomain(item.youtubeUrl)}
              </span>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 transition-opacity duration-300 group-hover/link:opacity-100 bg-blue-50/95 backdrop-blur-sm">
              <ExternalLink size={32} className="text-blue-500 mb-2" />
              <span className="text-[11px] font-black text-blue-600 bg-white px-3 py-1 rounded-md shadow-sm hidden sm:block">
                새 창으로 열기
              </span>
            </div>
            <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-white/80 backdrop-blur-sm text-blue-700 text-[8px] font-black rounded-md shadow-sm uppercase tracking-wider border border-white/50 z-10">
              {item.category}
            </div>
          </div>
        ) : isTextOnly ? (
          <div className="w-full h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 shrink-0 bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-100/50 rounded-xl flex items-center justify-center relative shadow-inner group-hover:shadow-md transition-shadow duration-300">
            <Quote size={28} className="text-indigo-200 group-hover:text-indigo-300 transition-colors transform sm:-translate-y-2" />
            <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-white/80 backdrop-blur-sm text-indigo-700 text-[8px] font-black rounded-md shadow-sm uppercase tracking-wider border border-white/50">
              {item.category}
            </div>
          </div>
        ) : (
          <div className="w-full h-40 sm:w-24 sm:h-24 md:w-28 md:h-28 shrink-0 overflow-hidden bg-zinc-100 relative shadow-inner rounded-xl">
            <img
              src={item.image}
              onError={(e) => {
                e.target.src = DEFAULT_IMAGE;
              }}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-white/90 backdrop-blur-sm text-zinc-900 text-[8px] font-black rounded-md shadow-sm uppercase tracking-wider">
              {item.category}
            </div>
          </div>
        )}

        {/* 메인 텍스트 정보 */}
        <div className="flex-1 w-full text-left py-0.5 flex flex-col justify-center min-w-0">
          <div className="flex items-center gap-1.5 mb-1 sm:mb-1.5">
            <Calendar size={12} className="text-indigo-500" />
            <span className="text-[11px] md:text-xs font-black text-indigo-500 tracking-tight">
              {item.date}
            </span>
          </div>

          <h3
            className={`text-base md:text-lg font-black text-zinc-900 tracking-tight mb-1 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5 ${
              isTextOnly ? 'text-xl md:text-2xl mt-1' : ''
            }`}
          >
            {isMusic && <Disc size={16} className="text-zinc-400 shrink-0" />}
            <span className="truncate">{item.title}</span>
            {!item.isPublic && (
              <Lock size={14} className="text-rose-500 shrink-0" title="비공개 기록" />
            )}
          </h3>

          {item.content && (
            <p
              className={`text-xs text-zinc-500 font-medium truncate ${
                isTextOnly
                  ? 'text-sm sm:text-base text-zinc-600 mb-3 whitespace-normal line-clamp-2 leading-relaxed'
                  : 'mb-2'
              }`}
            >
              {isTextOnly && (
                <span className="text-indigo-300 font-serif text-lg leading-none mr-1">"</span>
              )}
              {item.content}
              {isTextOnly && (
                <span className="text-indigo-300 font-serif text-lg leading-none ml-1">"</span>
              )}
            </p>
          )}

          <div
            className={`flex flex-wrap gap-1.5 ${
              isTextOnly && !item.content ? 'mt-3 sm:mt-4' : 'mt-auto'
            }`}
          >
            {(item.tags || []).slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-zinc-50 border border-zinc-200 rounded-lg text-[9px] font-bold text-zinc-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors whitespace-nowrap"
              >
                #{tag}
              </span>
            ))}
            {(item.tags || []).length > 3 && (
              <span className="px-2 py-1 bg-zinc-50 border border-zinc-200 rounded-lg text-[9px] font-bold text-zinc-400 whitespace-nowrap">
                +{(item.tags || []).length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineItemCard;
