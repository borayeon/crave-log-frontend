import React, { useState, useMemo, useEffect } from 'react';
import { History, Network, ChevronDown, ChevronRight, Folder, FolderOpen, Hash, Trash2, Plus, X as CloseIcon, Edit2, Calendar, Lock, PlayCircle, Disc, Quote, ExternalLink, Link as LinkIcon, Loader2, GripVertical } from 'lucide-react';
import { useAppStore } from '../store/AppStore';
import EmptyState from '../components/common/EmptyState';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop';
const MUSIC_DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop';

const getYoutubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|\/shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const getDomain = (url) => {
    try {
        const domain = new URL(url).hostname;
        return domain.replace('www.', '');
    } catch (e) {
        return null;
    }
};

const TimelineView = () => {
  const { records, tagTree, isAdmin, setLoginModalOpen, showToast, fetchAllData, setAddRecordModalOpen, apiFetch, isGuestMode, searchQuery } = useAppStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState({ type: 'all', value: '전체', id: 'all' });
  const [expandedFolders, setExpandedFolders] = useState({});
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState('GENERAL');
  const [newTagNames, setNewTagNames] = useState({});

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingTag, setIsAddingTag] = useState(false);
  
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');

  // 💡 카테고리 드래그 앤 드롭 순서 관리용 상태
  const [orderedCategories, setOrderedCategories] = useState([]);
  const [draggedCatIndex, setDraggedCatIndex] = useState(null);

  const safeRecords = Array.isArray(records) ? records : [];
  const safeTagTree = Array.isArray(tagTree) ? tagTree : [];

  // 스토어의 tagTree가 업데이트되면 로컬 정렬 상태 동기화
  useEffect(() => {
    setOrderedCategories(safeTagTree);
  }, [safeTagTree]);

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

  useEffect(() => {
    fetchAllData(true); 
  }, [fetchAllData]);

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
    if (!newCategoryName.trim() || !apiFetch || isAddingCategory) return;
    
    setIsAddingCategory(true); 
    try {
      const res = await apiFetch(`/me/categories`, {
        method: 'POST',
        body: JSON.stringify({ name: newCategoryName.trim(), type: newCategoryType })
      });
      if (res.ok) {
        await fetchAllData(true);
        setNewCategoryName('');
        setNewCategoryType('GENERAL');
        showToast('새 카테고리가 추가되었습니다.');
      }
    } catch(e) { 
        console.error(e); 
    } finally {
        setIsAddingCategory(false); 
    }
  };

  const handleAddTag = async (catId) => {
    const tagName = newTagNames[catId];
    if (!tagName || !tagName.trim() || !apiFetch || isAddingTag) return;
    
    setIsAddingTag(true);
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
    } catch(e) { 
        console.error(e); 
    } finally {
        setIsAddingTag(false);
    }
  };

  const handleDeleteNode = async (type, parentId, cat, e) => {
    e.stopPropagation();
    if (!apiFetch) return;

    if (type === 'category') {
        const catType = cat.type || (cat.name.includes('음악') ? 'MUSIC' : cat.name.includes('URL') ? 'URL' : 'GENERAL');
        if (catType === 'MUSIC' || catType === 'URL') {
            return showToast("시스템 기본 폴더는 삭제할 수 없습니다.");
        }
    }

    try {
      const url = type === 'category' ? `/me/categories/${cat.id}` : `/me/tags/${cat.id}`;
      const res = await apiFetch(url, { method: 'DELETE' });
      
      if (res.ok) {
        await fetchAllData(true);
        if(String(selectedFilter.id) === String(cat.id) && selectedFilter.type === type) {
          if (type === 'category') setSelectedFilter({ type: 'all', value: '전체', id: 'all' });
          else setSelectedFilter({ type: 'category', value: safeTagTree.find(c => String(c.id) === String(parentId))?.name, id: parentId });
        }
        showToast('삭제되었습니다.');
      }
    } catch(e) { console.error(e); }
  };

  const handleUpdateCategory = async (cat) => {
    const newName = editCategoryName.trim();
    if (!newName || newName === cat.name) {
      setEditingCategoryId(null);
      return;
    }

    try {
      const res = await apiFetch(`/me/categories/${cat.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: newName }) 
      });
      if (res.ok) {
        await fetchAllData(true);
        if (selectedFilter.type === 'category' && selectedFilter.id === cat.id) {
          setSelectedFilter({ ...selectedFilter, value: newName });
        }
        showToast('카테고리 이름이 변경되었습니다! ✨');
      }
    } catch(e) {
      console.error(e);
      showToast('이름 변경에 실패했습니다.');
    } finally {
      setEditingCategoryId(null);
    }
  };

  // 💡 드래그 앤 드롭 핸들러 로직
  const handleCatDragStart = (e, index) => {
    if (editingCategoryId) return; // 이름 수정 중일 땐 드래그 방지
    setDraggedCatIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleCatDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleCatDrop = async (e, targetIndex) => {
    e.preventDefault();
    if (draggedCatIndex === null || draggedCatIndex === targetIndex) return;

    const updated = [...orderedCategories];
    const [draggedItem] = updated.splice(draggedCatIndex, 1);
    updated.splice(targetIndex, 0, draggedItem);

    setOrderedCategories(updated);
    setDraggedCatIndex(null);

    // 백엔드 연동 (백엔드에 API가 있어야 완벽하게 저장됨)
    try {
        if (apiFetch) {
            const orderedIds = updated.map(c => c.id);
            await apiFetch('/me/categories/reorder', {
                method: 'PUT',
                body: JSON.stringify({ categoryIds: orderedIds })
            });
            showToast('카테고리 순서가 저장되었습니다! 🔄');
        }
    } catch (err) {
        console.error("순서 저장 API 연동 실패 (백엔드 추가 필요):", err);
    }
  };

  return (
    <div className="flex flex-col h-full flex-1 min-h-0 animate-in fade-in duration-500 pb-24 md:pb-0 bg-[#F8FAFC]">
      <header className="px-6 md:px-10 py-8 shrink-0 flex justify-end items-end border-b border-zinc-200/50">  {isAdmin && !isGuestMode && (
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${isEditing ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}
          >
            {isEditing ? <><CloseIcon size={14}/> 편집 완료</> : <><Edit2 size={14}/> 트리 편집</>}
          </button>
        )}
      </header>

      <div className="flex-1 px-6 md:px-10 py-8 overflow-hidden min-h-0 flex flex-col md:flex-row gap-8">
        
        {/* 사이드바 영역 */}
        <div className="w-full md:w-[320px] shrink-0 flex flex-col h-full max-h-full border border-zinc-200/80 bg-white rounded-[2rem] shadow-sm overflow-hidden transition-all duration-300">
          
          <div className={`p-4 border-b flex items-center justify-between shrink-0 ${isEditing ? 'bg-rose-50/30 border-rose-100' : 'bg-zinc-50/50 border-zinc-100'}`}>
            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-zinc-600">
              <FolderOpen size={14} className={isEditing ? 'text-rose-500' : 'text-indigo-500'}/> 
              {isEditing ? '카테고리 관리자' : 'Tag Explorer'}
            </h3>
            {isEditing && <span className="px-2 py-0.5 bg-rose-100 text-rose-600 rounded-md text-[9px] font-black animate-pulse">편집 중</span>}
          </div>
          
          {/* 편집 모드 관리자 뷰 */}
          {isEditing ? (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50 scrollbar-hide min-h-0">
              {orderedCategories.map((cat, index) => {
                const catType = cat.type || (cat.name.includes('음악') ? 'MUSIC' : cat.name.includes('URL') ? 'URL' : 'GENERAL');
                const isSystemCat = catType === 'MUSIC' || catType === 'URL';
                const isEditingThisCat = editingCategoryId === cat.id;

                return (
                  <div 
                    key={cat.id} 
                    draggable={!editingCategoryId}
                    onDragStart={(e) => handleCatDragStart(e, index)}
                    onDragOver={(e) => handleCatDragOver(e, index)}
                    onDrop={(e) => handleCatDrop(e, index)}
                    className={`bg-white border border-zinc-200 rounded-2xl p-3.5 shadow-sm flex flex-col gap-3 transition-shadow hover:shadow-md ${draggedCatIndex === index ? 'opacity-40 border-dashed border-indigo-400' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      
                      {/* 💡 드래그 핸들 추가 */}
                      {!editingCategoryId && (
                        <div className="cursor-grab active:cursor-grabbing text-zinc-300 hover:text-zinc-600 p-1 shrink-0 transition-colors" title="드래그하여 순서 변경">
                            <GripVertical size={16} />
                        </div>
                      )}

                      {isEditingThisCat ? (
                        <input
                          autoFocus
                          value={editCategoryName}
                          onChange={(e) => setEditCategoryName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleUpdateCategory(cat);
                            if (e.key === 'Escape') setEditingCategoryId(null);
                          }}
                          onBlur={() => handleUpdateCategory(cat)}
                          className="flex-1 w-full bg-indigo-50 border border-indigo-300 rounded-lg px-2 py-1.5 text-sm outline-none font-black text-indigo-900 shadow-sm"
                        />
                      ) : (
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="px-1.5 py-0.5 bg-zinc-100 text-zinc-500 rounded-md text-[10px] font-black shrink-0 shadow-sm border border-zinc-200">
                            {catType === 'MUSIC' ? '🎵' : catType === 'URL' ? '🔗' : '📁'}
                          </span>
                          <span className="font-black text-[15px] text-zinc-800 truncate">{cat.name}</span>
                        </div>
                      )}
                      
                      {!isEditingThisCat && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button onClick={() => { setEditingCategoryId(cat.id); setEditCategoryName(cat.name); }} className="p-1.5 text-zinc-400 hover:text-indigo-600 bg-zinc-50 hover:bg-indigo-50 rounded-lg transition-colors border border-zinc-100"><Edit2 size={14}/></button>
                          {isSystemCat ? (
                              <div className="p-1.5 text-zinc-300 bg-zinc-50 rounded-lg border border-zinc-100 cursor-not-allowed" title="시스템 폴더 삭제 불가"><Lock size={14}/></div>
                          ) : (
                              <button onClick={(e) => handleDeleteNode('category', null, cat, e)} className="p-1.5 text-rose-400 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-100"><Trash2 size={14}/></button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 카테고리별 태그 목록 */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-zinc-100 ml-6">
                      {(cat.children || []).map(tag => (
                        <div key={tag.id} className="group/tag flex items-center gap-1 pl-2.5 pr-1 py-1 bg-zinc-100 text-zinc-600 rounded-lg text-xs font-bold border border-zinc-200 hover:bg-rose-50 hover:border-rose-200 transition-colors">
                          <span>#{tag.name}</span>
                          <button onClick={(e) => handleDeleteNode('tag', cat.id, tag, e)} className="text-zinc-400 hover:text-rose-500 hover:bg-white rounded-md p-0.5 transition-colors"><CloseIcon size={12}/></button>
                        </div>
                      ))}
                      
                      {/* 개별 태그 추가 인풋 */}
                      <input 
                        type="text"
                        placeholder="+ 새 태그 추가"
                        value={newTagNames[cat.id] || ''}
                        onChange={e => setNewTagNames(prev => ({ ...prev, [cat.id]: e.target.value }))}
                        onKeyDown={e => { if (e.key === 'Enter') handleAddTag(cat.id); }}
                        disabled={isAddingTag}
                        className="w-24 focus:w-32 transition-all px-2.5 py-1 bg-white border border-dashed border-zinc-300 rounded-lg text-xs font-bold outline-none focus:border-indigo-400 focus:border-solid placeholder:text-zinc-400 disabled:opacity-50 shadow-sm"
                      />
                    </div>
                  </div>
                );
              })}

              {/* 새로운 카테고리 추가 박스 */}
              <div className="bg-white border border-dashed border-zinc-300 rounded-2xl p-4 flex flex-col gap-3 mt-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-400"></div>
                <div className="text-[11px] font-black text-indigo-500 flex items-center gap-1.5"><Plus size={14} strokeWidth={3}/> 카테고리 새로 만들기</div>
                <div className="flex gap-2">
                    <select 
                        value={newCategoryType} onChange={e=>setNewCategoryType(e.target.value)} disabled={isAddingCategory}
                        className="bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-2 text-xs font-bold outline-none focus:border-indigo-400 focus:bg-white text-zinc-700 shrink-0 w-[72px]"
                    >
                        <option value="GENERAL">📁 일반</option>
                        <option value="MUSIC">🎵 음악</option>
                        <option value="URL">🔗 URL</option>
                    </select>
                    <input 
                        value={newCategoryName} onChange={e=>setNewCategoryName(e.target.value)} disabled={isAddingCategory}
                        onKeyDown={e=>{if(e.key==='Enter') handleAddCategory()}}
                        placeholder="카테고리 이름 지정"
                        className="flex-1 min-w-0 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-indigo-400 focus:bg-white placeholder:font-medium placeholder:text-zinc-400"
                    />
                </div>
                <button onClick={handleAddCategory} disabled={isAddingCategory || !newCategoryName.trim()} className="w-full py-2 bg-zinc-900 text-white rounded-lg text-xs font-black hover:bg-zinc-800 disabled:bg-zinc-300 disabled:text-zinc-500 transition-colors flex justify-center items-center gap-1.5 shadow-sm">
                    {isAddingCategory ? <Loader2 size={14} className="animate-spin" /> : '완료 및 추가'}
                </button>
              </div>
            </div>
          ) : (
            // 💡 뷰 모드 탐색용 트리 UI (변경된 orderedCategories 기준 렌더링)
            <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-hide min-h-0">
              <button 
                onClick={() => setSelectedFilter({ type: 'all', value: '전체', id: 'all' })}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-bold transition-colors ${selectedFilter.type === 'all' ? 'bg-indigo-50 text-indigo-700' : 'text-zinc-600 hover:bg-zinc-100'}`}
              >
                <Network size={16} className={selectedFilter.type === 'all' ? 'text-indigo-600' : 'text-zinc-400'}/> 전체보기
              </button>

              {orderedCategories.map(cat => {
                const isCatSelected = selectedFilter.type === 'category' && String(selectedFilter.id) === String(cat.id);
                const isExpanded = expandedFolders[cat.id];

                return (
                  <div key={cat.id} className="pt-1">
                    <div className={`group flex items-center justify-between rounded-xl transition-colors ${isCatSelected ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-zinc-50 text-zinc-700'}`}>
                      <button 
                        onClick={() => setSelectedFilter({ type: 'category', value: cat.name, id: cat.id })} 
                        className="flex-1 flex items-center gap-2.5 px-3 py-2 text-sm font-bold truncate"
                      >
                        <span onClick={(e) => toggleFolder(cat.id, e)} className="p-0.5 rounded-md hover:bg-zinc-200/50 text-zinc-400 transition-transform shrink-0">
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </span>
                        {isExpanded ? <FolderOpen size={16} className="text-indigo-400 shrink-0"/> : <Folder size={16} className="text-indigo-400 shrink-0"/>}
                        <span className="truncate">{cat.name}</span>
                      </button>
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
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 타임라인 메인 목록 */}
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
              
              const matchedCat = safeTagTree.find(c => c.name === item.category || String(c.id) === String(item.categoryId));
              const catType = item.categoryType || matchedCat?.type || (item.category?.includes('음악') ? 'MUSIC' : item.category?.includes('URL') ? 'URL' : 'GENERAL');
              
              const isMusic = catType === 'MUSIC';
              const isUrlItem = catType === 'URL';
              
              const videoId = isMusic && item.youtubeUrl ? getYoutubeId(item.youtubeUrl) : null;
              const hasImage = item.image && item.image.trim() !== '' && item.image !== DEFAULT_IMAGE;
              
              const isTextOnly = !isMusic && !isUrlItem && !hasImage;

              return (
                <div key={item.id} className="relative pl-6 md:pl-8 group">
                  <div className="absolute w-3 h-3 bg-white border-[3px] border-indigo-400 rounded-full -left-[5px] top-6 group-hover:border-indigo-600 group-hover:scale-150 transition-all duration-300 shadow-sm z-10" />
                  
                  <div className={`bg-white border border-zinc-200/80 rounded-2xl p-3 md:p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 flex flex-col sm:flex-row gap-4 items-center sm:items-start group-hover:-translate-y-1 ${isTextOnly ? 'bg-gradient-to-br from-white to-zinc-50/50' : ''}`}>
                    
                    {/* 타입별 썸네일 영역 */}
                    {isMusic ? (
                      <div className="w-20 h-24 sm:w-24 sm:h-24 shrink-0 overflow-hidden bg-zinc-100 relative shadow-inner rounded-full border-4 border-zinc-900 group-hover:rotate-12 transition-transform duration-700">
                        <img 
                          src={videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : MUSIC_DEFAULT_IMAGE} 
                          onError={(e) => { e.target.src = MUSIC_DEFAULT_IMAGE; }} 
                          alt={item.title} 
                          className="w-full h-full object-cover transition-transform duration-700 ease-out scale-125" 
                        />
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-zinc-900 rounded-full border-2 border-zinc-700 flex items-center justify-center shadow-inner">
                            <PlayCircle size={10} className="text-white/80 translate-x-[1px]" />
                        </div>
                      </div>
                    ) : isUrlItem ? (
                      <a 
                          href={item.youtubeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="w-20 h-24 sm:w-24 sm:h-24 shrink-0 bg-white border-2 border-zinc-100 hover:border-blue-400 rounded-xl flex flex-col items-center justify-center relative shadow-sm hover:shadow-md transition-all duration-300 group/link overflow-hidden"
                      >
                          <div className="absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300 group-hover/link:opacity-0 bg-white">
                              {item.youtubeUrl && getDomain(item.youtubeUrl) ? (
                                  <img 
                                    src={`https://www.google.com/s2/favicons?domain=${getDomain(item.youtubeUrl)}&sz=128`} 
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = `https://ui-avatars.com/api/?name=${getDomain(item.youtubeUrl)?.charAt(0)}&background=EFF6FF&color=4F46E5&bold=true&size=128`;
                                    }}
                                    alt="favicon" 
                                    className="w-8 h-8 sm:w-10 sm:h-10 mb-2 rounded-lg shadow-sm" 
                                  />
                              ) : (
                                  <LinkIcon size={28} className="text-blue-300 mb-2" />
                              )}
                              <span className="text-[9px] font-bold text-zinc-400 max-w-[80%] truncate">{getDomain(item.youtubeUrl)}</span>
                          </div>
                          
                          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 transition-opacity duration-300 group-hover/link:opacity-100 bg-blue-50/95 backdrop-blur-sm">
                              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(item.youtubeUrl || '')}`} alt="QR Code" className="w-12 h-12 sm:w-14 sm:h-14 mix-blend-multiply mb-1" />
                              <span className="text-[9px] font-black text-blue-600 bg-white px-2 py-0.5 rounded-md shadow-sm">이동/스캔</span>
                          </div>
                          
                          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-white/80 backdrop-blur-sm text-blue-700 text-[8px] font-black rounded-md shadow-sm uppercase tracking-wider border border-white/50 z-10">{item.category}</div>
                      </a>
                    ) : isTextOnly ? (
                      <div className="w-20 h-24 sm:w-24 sm:h-24 shrink-0 bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-100/50 rounded-xl flex items-center justify-center relative shadow-inner group-hover:shadow-md transition-shadow duration-300">
                         <Quote size={28} className="text-indigo-200 group-hover:text-indigo-300 transition-colors transform -translate-y-2" />
                         <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-white/80 backdrop-blur-sm text-indigo-700 text-[8px] font-black rounded-md shadow-sm uppercase tracking-wider border border-white/50">{item.category}</div>
                      </div>
                    ) : (
                      <div className="w-20 h-24 sm:w-24 sm:h-24 shrink-0 overflow-hidden bg-zinc-100 relative shadow-inner rounded-xl">
                        <img 
                          src={item.image} 
                          onError={(e) => { e.target.src = DEFAULT_IMAGE; }} 
                          alt={item.title} 
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
                        />
                        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-white/90 backdrop-blur-sm text-zinc-900 text-[8px] font-black rounded-md shadow-sm uppercase tracking-wider">{item.category}</div>
                      </div>
                    )}
                    
                    {/* 메인 텍스트 정보 */}
                    <div className="flex-1 w-full text-left py-0.5 flex flex-col justify-center min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Calendar size={12} className="text-indigo-500" />
                        <span className="text-[11px] md:text-xs font-black text-indigo-500 tracking-tight">{item.date}</span>
                      </div>
                      
                      <h3 className={`text-base md:text-lg font-black text-zinc-900 tracking-tight mb-1 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5 ${isTextOnly ? 'text-xl md:text-2xl mt-1' : ''}`}>
                        {isMusic && <Disc size={16} className="text-zinc-400 shrink-0" />}
                        <span className="truncate">{item.title}</span>
                        {!item.isPublic && <Lock size={14} className="text-rose-500 shrink-0" title="비공개 기록" />} 
                      </h3>
                      
                      {item.content && (
                        <p className={`text-xs text-zinc-500 font-medium truncate ${isTextOnly ? 'text-sm text-zinc-600 mb-3 whitespace-normal line-clamp-2 leading-relaxed' : 'mb-2'}`}>
                          {isTextOnly && <span className="text-indigo-300 font-serif text-lg leading-none mr-1">"</span>}
                          {item.content}
                          {isTextOnly && <span className="text-indigo-300 font-serif text-lg leading-none ml-1">"</span>}
                        </p>
                      )}
                      
                      <div className={`flex flex-wrap gap-1.5 ${isTextOnly && !item.content ? 'mt-4' : 'mt-auto'}`}>
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