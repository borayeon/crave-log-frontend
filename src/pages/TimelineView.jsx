import React, { useState, useMemo, useEffect } from 'react';
import { History, Network, ChevronDown, ChevronRight, Folder, FolderOpen, Hash, Trash2, Plus, X as CloseIcon, Edit2, Calendar, Lock, PlayCircle, Disc } from 'lucide-react';
import { useAppStore } from '../store/AppStore';
import EmptyState from '../components/common/EmptyState';

// ⭐️ 이미지 상수 정의
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop';
const MUSIC_DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop'; // ⭐️ 음악 전용 대체 이미지 (멋진 DJ 턴테이블)

// ⭐️ 유튜브 ID 추출 함수 (Shorts 등 다양한 링크 형태 완벽 지원)
const getYoutubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|\/shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const TimelineView = () => {
  const { records, tagTree, isAdmin, setLoginModalOpen, showToast, fetchAllData, setAddRecordModalOpen, apiFetch, isGuestMode, searchQuery } = useAppStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState({ type: 'all', value: '전체', id: 'all' });
  const [expandedFolders, setExpandedFolders] = useState({});
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newTagNames, setNewTagNames] = useState({});

  const safeRecords = Array.isArray(records) ? records : [];
  const safeTagTree = Array.isArray(tagTree) ? tagTree : [];

  const filteredRecords = useMemo(() => {
    let filtered = safeRecords;
    
    if (isGuestMode) {
      filtered = filtered.filter(r => r.isPublic !== false);
    }
    
    if (searchQuery && searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        (r.title && r.title.toLowerCase().includes(q)) || 
        (r.content && r.content.toLowerCase().includes(q)) ||
        (r.tags && r.tags.some(t => t.toLowerCase().includes(q))) ||
        (r.category && r.category.toLowerCase().includes(q))
      );
    }

    if (selectedFilter.type === 'category') {
      const categoryNode = safeTagTree.find(c => String(c.id) === String(selectedFilter.id));
      const childTagNames = categoryNode ? (categoryNode.children||[]).map(c => c.name) : [];
      filtered = filtered.filter(r => r.category === selectedFilter.value || (r.tags||[]).some(t => childTagNames.includes(t)));
    } else if (selectedFilter.type === 'tag') {
      filtered = filtered.filter(r => (r.tags||[]).includes(selectedFilter.value));
    }

    return [...filtered].sort((a, b) => {
        const dateA = new Date(a.date?.replace(/\./g, '-') || 0);
        const dateB = new Date(b.date?.replace(/\./g, '-') || 0);
        return dateB - dateA;
    });
  }, [safeRecords, selectedFilter, safeTagTree, searchQuery, isGuestMode]);

  useEffect(() => {
    if (isGuestMode) setIsEditing(false);
  }, [isGuestMode]);

  if (safeRecords.length === 0 && safeTagTree.length === 0 && !isEditing) {
      return (
          <div className="h-full bg-[#F8FAFC]">
            <EmptyState 
                title="아직 발자취가 없어요" 
                icon={<History size={32}/>} 
                onAction={() => isAdmin && !isGuestMode ? setIsEditing(true) : setLoginModalOpen(true)}
                actionLabel={isAdmin && !isGuestMode ? "카테고리 만들기" : "로그인하고 시작하기"}
            />
          </div>
      );
  }

  const toggleFolder = (catId, e) => {
    e.stopPropagation(); 
    setExpandedFolders(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim() || !apiFetch) return;
    try {
      const res = await apiFetch(`/me/categories`, {
        method: 'POST',
        body: JSON.stringify({ name: newCategoryName.trim() })
      });
      if (res.ok) {
        await fetchAllData(true);
        setNewCategoryName('');
        showToast('새 카테고리가 추가되었습니다.');
      }
    } catch(e) { console.error(e); }
  };

  const handleAddTag = async (catId) => {
    const tagName = newTagNames[catId];
    if (!tagName || !tagName.trim() || !apiFetch) return;
    
    try {
      const res = await apiFetch(`/me/categories/${catId}/tags`, {
        method: 'POST',
        body: JSON.stringify({ name: tagName.trim() })
      });
      if (res.ok) {
        await fetchAllData(true);
        setNewTagNames(prev => ({ ...prev, [catId]: '' }));
        showToast('새 태그가 추가되었습니다.');
      }
    } catch(e) { console.error(e); }
  };

  const handleDeleteNode = async (type, parentId, nodeId, e) => {
    e.stopPropagation();
    if (!apiFetch) return;

    try {
      const url = type === 'category' 
        ? `/me/categories/${nodeId}`
        : `/me/tags/${nodeId}`;
        
      const res = await apiFetch(url, { method: 'DELETE' });
      
      if (res.ok) {
        await fetchAllData(true);
        if(String(selectedFilter.id) === String(nodeId) && selectedFilter.type === type) {
          if (type === 'category') setSelectedFilter({ type: 'all', value: '전체', id: 'all' });
          else setSelectedFilter({ type: 'category', value: safeTagTree.find(c => String(c.id) === String(parentId))?.name, id: parentId });
        }
        showToast('삭제되었습니다.');
      }
    } catch(e) { console.error(e); }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 pb-24 md:pb-0 bg-[#F8FAFC]">
      <header className="px-6 md:px-10 py-8 shrink-0 flex justify-between items-end border-b border-zinc-200/50">
        <div>
          <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Timeline</h2>
          <p className="text-xs font-bold text-zinc-500 mt-2 tracking-widest uppercase">시간의 흐름에 따라 기록된 나의 취향들</p>
        </div>
        {isAdmin && !isGuestMode && (
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${isEditing ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}
          >
            {isEditing ? <><CloseIcon size={14}/> 편집 완료</> : <><Edit2 size={14}/> 트리 편집</>}
          </button>
        )}
      </header>

      <div className="flex-1 px-6 md:px-10 py-8 overflow-hidden flex flex-col md:flex-row gap-8">
        
        {/* 우측 네비게이션 트리 */}
        <div className="w-full md:w-64 shrink-0 flex flex-col h-[40vh] md:h-full border border-zinc-200/80 bg-white rounded-[2rem] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <FolderOpen size={14} className="text-indigo-500"/> Tag Explorer
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-hide">
            <button 
              onClick={() => setSelectedFilter({ type: 'all', value: '전체', id: 'all' })}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-bold transition-colors ${selectedFilter.type === 'all' ? 'bg-indigo-50 text-indigo-700' : 'text-zinc-600 hover:bg-zinc-100'}`}
            >
              <Network size={16} className={selectedFilter.type === 'all' ? 'text-indigo-600' : 'text-zinc-400'}/> 전체보기
            </button>

            {safeTagTree.map(cat => {
              const isCatSelected = selectedFilter.type === 'category' && String(selectedFilter.id) === String(cat.id);
              const isExpanded = expandedFolders[cat.id];
              return (
                <div key={cat.id} className="pt-1">
                  <div className={`group flex items-center justify-between rounded-xl transition-colors ${isCatSelected ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-zinc-50 text-zinc-700'}`}>
                    
                    <button 
                      onClick={() => setSelectedFilter({ type: 'category', value: cat.name, id: cat.id })} 
                      className="flex-1 flex items-center gap-2.5 px-3 py-2 text-sm font-bold truncate"
                    >
                      <span onClick={(e) => toggleFolder(cat.id, e)} className="p-0.5 rounded-md hover:bg-zinc-200/50 text-zinc-400 transition-transform">
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </span>
                      {isExpanded ? <FolderOpen size={16} className="text-indigo-400 shrink-0"/> : <Folder size={16} className="text-indigo-400 shrink-0"/>}
                      <span className="truncate">{cat.name}</span>
                    </button>
                    
                    {isEditing && (
                      <button onClick={(e) => handleDeleteNode('category', null, cat.id, e)} className="p-2 opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 transition-opacity shrink-0">
                        <Trash2 size={14}/>
                      </button>
                    )}
                  </div>
                  
                  {isExpanded && (
                    <div className="ml-8 mt-1 space-y-1 relative before:absolute before:left-[-11px] before:top-0 before:bottom-2 before:w-px before:bg-zinc-200">
                      {(cat.children || []).map(tag => {
                        const isTagSelected = selectedFilter.type === 'tag' && String(selectedFilter.id) === String(tag.id);
                        return (
                          <div key={tag.id} className="group relative flex items-center justify-between rounded-lg transition-colors">
                            <div className="absolute left-[-11px] top-1/2 w-2.5 h-px bg-zinc-200" />
                            <button 
                              onClick={() => setSelectedFilter({ type: 'tag', value: tag.name, id: tag.id, parentId: cat.id })}
                              className={`flex-1 flex items-center gap-2.5 px-3 py-1.5 text-sm font-medium transition-colors truncate ${isTagSelected ? 'text-indigo-600 bg-indigo-50/50 rounded-lg font-bold' : 'text-zinc-500 hover:text-zinc-900'}`}
                            >
                              <Hash size={14} className="shrink-0 opacity-50"/>
                              <span className="truncate">{tag.name}</span>
                            </button>
                            {isEditing && (
                              <button onClick={(e) => handleDeleteNode('tag', cat.id, tag.id, e)} className="p-1.5 opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 transition-opacity shrink-0 mr-1">
                                <Trash2 size={12}/>
                              </button>
                            )}
                          </div>
                        );
                      })}
                      {isEditing && (
                        <div className="relative flex items-center pl-3 py-1 pr-2 mt-1">
                          <div className="absolute left-[-11px] top-1/2 w-2.5 h-px bg-zinc-200" />
                          <input 
                            type="text" 
                            value={newTagNames[cat.id] || ''} 
                            onChange={(e) => setNewTagNames(prev => ({ ...prev, [cat.id]: e.target.value }))} 
                            placeholder="태그 추가" 
                            className="flex-1 w-full bg-zinc-100 border-none rounded-md px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-400" 
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                                e.preventDefault();
                                handleAddTag(cat.id);
                              }
                            }} 
                          />
                          <button onClick={() => handleAddTag(cat.id)} className="ml-1 p-1 text-indigo-500 hover:bg-indigo-50 rounded-md"><Plus size={14}/></button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {isEditing && (
            <div className="p-3 border-t border-zinc-100 bg-zinc-50/50 flex gap-2">
              <input 
                type="text" 
                value={newCategoryName} 
                onChange={(e) => setNewCategoryName(e.target.value)} 
                placeholder="카테고리 추가" 
                className="flex-1 min-w-0 bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" 
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    handleAddCategory();
                  }
                }} 
              />
              <button onClick={handleAddCategory} className="px-3 py-1.5 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition"><Plus size={16}/></button>
            </div>
          )}
        </div>

        {/* 메인 리스트 영역 */}
        <div className="flex-1 min-w-0 overflow-y-auto pr-2 pl-2 md:pl-4 py-2 scrollbar-hide">
          {safeRecords.length > 0 && filteredRecords.length === 0 && (
            <div className="text-center py-20 text-zinc-400 font-bold bg-white rounded-[2rem] border border-zinc-200/80 border-dashed flex flex-col items-center gap-3">
              <FolderOpen size={32} className="text-zinc-300" />
              해당 분류의 기록이 없습니다.
              {isAdmin && !isGuestMode && (
                <button onClick={() => setAddRecordModalOpen(true)} className="mt-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm hover:bg-indigo-100 transition">
                  새 기록 추가하기
                </button>
              )}
            </div>
          )}

          <div className="relative border-l-2 border-dashed border-zinc-200 ml-3 md:ml-4 space-y-5 pb-10 mt-2">
            {filteredRecords.map((item) => {
              
              // ⭐️ 음악 카테고리 여부와 썸네일 URL 동적 할당 로직 완벽 보강
              const isMusic = item.category === '음악';
              const videoId = isMusic && item.youtubeUrl ? getYoutubeId(item.youtubeUrl) : null;
              
              // ⭐️ 비디오 ID가 있으면 유튜브 썸네일을, 없으면(혹은 옛날 기록이면) 음악 전용 기본 이미지를, 일반 기록이면 일반 이미지를 렌더링
              const imageUrlToRender = isMusic 
                ? (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : MUSIC_DEFAULT_IMAGE)
                : (item.image?.trim() ? item.image : DEFAULT_IMAGE);

              return (
                <div key={item.id} className="relative pl-6 md:pl-8 group">
                  <div className="absolute w-3 h-3 bg-white border-[3px] border-indigo-400 rounded-full -left-[5px] top-6 group-hover:border-indigo-600 group-hover:scale-150 transition-all duration-300 shadow-sm z-10" />
                  
                  <div className="bg-white border border-zinc-200/80 rounded-2xl p-3 md:p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 flex flex-row gap-4 items-center sm:items-start group-hover:-translate-y-1">
                    
                    {/* ⭐️ 이미지 렌더링 영역 (음악일 땐 둥근 레코드판 UI) */}
                    <div className={`w-20 h-24 sm:w-24 sm:h-24 shrink-0 overflow-hidden bg-zinc-100 relative shadow-inner ${isMusic ? 'rounded-full border-4 border-zinc-900 group-hover:rotate-12 transition-transform duration-700' : 'rounded-xl'}`}>
                      <img 
                        src={imageUrlToRender} 
                        // 이미지가 엑박(404) 뜰 경우 방어 로직
                        onError={(e) => { e.target.src = isMusic ? MUSIC_DEFAULT_IMAGE : DEFAULT_IMAGE; }} 
                        alt={item.title} 
                        className={`w-full h-full object-cover transition-transform duration-700 ease-out ${isMusic ? 'scale-125' : 'group-hover:scale-105'}`} 
                      />
                      
                      {/* 음악 카테고리일 때 가운데 구멍 표시 */}
                      {isMusic && (
                         <>
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-zinc-900 rounded-full border-2 border-zinc-700 flex items-center justify-center shadow-inner">
                                <PlayCircle size={10} className="text-white/80 translate-x-[1px]" />
                            </div>
                         </>
                      )}

                      {!isMusic && (
                        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-white/90 backdrop-blur-sm text-zinc-900 text-[8px] font-black rounded-md shadow-sm uppercase tracking-wider">{item.category}</div>
                      )}
                    </div>
                    
                    <div className="flex-1 w-full text-left py-0.5 flex flex-col justify-center min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Calendar size={12} className="text-indigo-500" />
                        <span className="text-[11px] md:text-xs font-black text-indigo-500 tracking-tight">{item.date}</span>
                      </div>
                      
                      <h3 className="text-base md:text-lg font-black text-zinc-900 tracking-tight mb-1 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                        {isMusic && <Disc size={16} className="text-zinc-400 shrink-0" />}
                        <span className="truncate">{item.title}</span>
                        {!item.isPublic && <Lock size={14} className="text-rose-500 shrink-0" title="비공개 기록" />} 
                      </h3>
                      
                      {item.content && (
                        <p className="text-xs text-zinc-500 font-medium mb-2 truncate">
                          {item.content}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-1.5 mt-auto">
                        {(item.tags || []).slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-1 bg-zinc-50 border border-zinc-200 rounded-lg text-[9px] font-bold text-zinc-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors whitespace-nowrap">
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
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineView;