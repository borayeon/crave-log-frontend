import React, { useState, useMemo, useEffect } from 'react';
import { History, Edit2, X as CloseIcon, FolderOpen, Loader2, Lock } from 'lucide-react';
import { useAppStore } from '../store/AppStore';
import EmptyState from '../components/common/EmptyState';
import RecordDetailModal from '../components/features/RecordDetailModal';
import TimelineCategoryExplorer from '../components/features/timeline/TimelineCategoryExplorer';
import TimelineItemCard from '../components/features/timeline/TimelineItemCard';
import PasscodeModal from '../components/features/PasscodeModal';

const TimelineView = () => {
  const { 
    records, 
    tagTree, 
    isAdmin, 
    hostUser,
    setLoginModalOpen, 
    showToast, 
    fetchAllData, 
    setAddRecordModalOpen, 
    apiFetch, 
    isGuestMode, 
    searchQuery, 
    isLoading,
    visitedHandle,
    setViewMode
  } = useAppStore();
  
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [passcodeTargetRecord, setPasscodeTargetRecord] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState({ type: 'all', value: '전체', id: 'all' });

  const handleUnlockSecret = (record) => {
    setPasscodeTargetRecord(record);
  };

  const handleFollowHost = async () => {
    if (!hostUser?.handle) return;
    try {
      await apiFetch(`/api/v1/users/${hostUser.handle}/follow`, { method: 'POST' });
      showToast(`${hostUser.nickname || hostUser.handle}님을 팔로우했습니다. 타임라인을 새로고침합니다.`, 'success');
      await fetchAllData(true);
    } catch (err) {
      showToast(err.message || '팔로우에 실패했습니다.', 'error');
    }
  };
  const [expandedFolders, setExpandedFolders] = useState({});
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState('GENERAL');
  const [newTagNames, setNewTagNames] = useState({});

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingTag, setIsAddingTag] = useState(false);
  
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');

  const [orderedCategories, setOrderedCategories] = useState([]);
  const [draggedCatIndex, setDraggedCatIndex] = useState(null);

  const safeRecords = Array.isArray(records) ? records : [];
  const safeTagTree = Array.isArray(tagTree) ? tagTree : [];

  useEffect(() => {
    setOrderedCategories(safeTagTree);
  }, [safeTagTree]);

  const activeCategoryNode = useMemo(() => {
    if (selectedFilter.type === 'category') {
      return orderedCategories.find(c => String(c.id) === String(selectedFilter.id));
    }
    if (selectedFilter.type === 'tag') {
      return orderedCategories.find(c => c.children?.some(t => String(t.id) === String(selectedFilter.id)));
    }
    return null;
  }, [selectedFilter, orderedCategories]);

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
      const childTagNames = categoryNode ? (categoryNode.children || []).map(c => c.name) : [];
      filtered = filtered.filter(r => r.category === selectedFilter.value || (r.tags || []).some(t => childTagNames.includes(t)));
    } else if (selectedFilter.type === 'tag') {
      filtered = filtered.filter(r => (r.tags || []).includes(selectedFilter.value));
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
    if (isAdmin || visitedHandle) {
      fetchAllData(true); 
    }
  }, [fetchAllData, isAdmin, visitedHandle]);

  if (isLoading && (!records || records.length === 0)) {
    return (
      <div className="w-full h-[70vh] flex flex-col items-center justify-center bg-[#F8FAFC]">
        <Loader2 size={40} className="text-indigo-500 animate-spin mb-4" />
        <h2 className="text-lg font-black text-zinc-800 tracking-tight">데이터를 불러오는 중입니다...</h2>
        <p className="text-sm text-zinc-500 font-medium mt-2">잠시만 기다려주세요</p>
      </div>
    );
  }

  // ⭐️ 비로그인 상태이면서 특정 사용자의 프로필을 방문 중이지 않은 경우: 로그인 요구 화면 렌더링
  if (!isAdmin && !visitedHandle) {
    return (
      <div className="max-w-md mx-auto w-full min-h-[70vh] flex flex-col items-center justify-center text-center px-4 animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-5 shadow-inner">
          <Lock size={30} />
        </div>
        <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg mb-2">
          로그인 필요
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight mb-2">
          로그인이 필요한 페이지입니다
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 font-medium leading-relaxed mb-6 max-w-sm">
          나만의 타임라인과 시간순 기록을 확인하시려면 먼저 CraveLog에 로그인해주세요.
        </p>
        <div className="flex items-center gap-3 w-full justify-center">
          <button
            onClick={() => setLoginModalOpen(true)}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition shadow-md hover:shadow-lg active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <Lock size={14} />
            <span>로그인하기</span>
          </button>
          <button
            onClick={() => setViewMode('landing')}
            className="px-5 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer"
          >
            홈(소개)으로 이동
          </button>
        </div>
      </div>
    );
  }

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
    } catch (e) { 
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
    } catch (e) { 
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
        if (String(selectedFilter.id) === String(cat.id) && selectedFilter.type === type) {
          if (type === 'category') setSelectedFilter({ type: 'all', value: '전체', id: 'all' });
          else setSelectedFilter({ type: 'category', value: safeTagTree.find(c => String(c.id) === String(parentId))?.name, id: parentId });
        }
        showToast('삭제되었습니다.');
      }
    } catch (e) { 
      console.error(e); 
    }
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
    } catch (e) {
      console.error(e);
      showToast('이름 변경에 실패했습니다.');
    } finally {
      setEditingCategoryId(null);
    }
  };

  const handleCatDragStart = (e, index) => {
    if (editingCategoryId) return; 
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
      console.error("순서 저장 API 연동 실패:", err);
    }
  };

  return (
    <div className="flex flex-col h-full flex-1 min-h-0 animate-in fade-in duration-500 pb-24 md:pb-0 bg-[#F8FAFC]">
      {selectedRecord && (
        <RecordDetailModal 
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          isAdmin={isAdmin}
          isGuestMode={isGuestMode}
          tagTree={tagTree}
          apiFetch={apiFetch}
          fetchAllData={fetchAllData}
          showToast={showToast}
        />
      )}

      {passcodeTargetRecord && (
        <PasscodeModal
          record={passcodeTargetRecord}
          onClose={() => setPasscodeTargetRecord(null)}
          onSuccess={(unlockedRecord) => {
            setSelectedRecord(unlockedRecord);
          }}
        />
      )}

      <header className="px-6 md:px-10 py-4 md:py-8 shrink-0 flex justify-end items-end border-b border-zinc-200/50"> 
        {isAdmin && !isGuestMode && (
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${isEditing ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}
          >
            {isEditing ? <><CloseIcon size={14}/> 편집 완료</> : <><Edit2 size={14}/> 트리 편집</>}
          </button>
        )}
      </header>

      <div className="flex-1 px-4 sm:px-6 md:px-10 py-4 md:py-8 overflow-hidden min-h-0 flex flex-col md:flex-row gap-4 md:gap-8">
        <TimelineCategoryExplorer 
          isEditing={isEditing}
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          orderedCategories={orderedCategories}
          activeCategoryNode={activeCategoryNode}
          editingCategoryId={editingCategoryId}
          setEditingCategoryId={setEditingCategoryId}
          editCategoryName={editCategoryName}
          setEditCategoryName={setEditCategoryName}
          handleUpdateCategory={handleUpdateCategory}
          handleDeleteNode={handleDeleteNode}
          handleCatDragStart={handleCatDragStart}
          handleCatDragOver={handleCatDragOver}
          handleCatDrop={handleCatDrop}
          draggedCatIndex={draggedCatIndex}
          newTagNames={newTagNames}
          setNewTagNames={setNewTagNames}
          handleAddTag={handleAddTag}
          isAddingTag={isAddingTag}
          newCategoryType={newCategoryType}
          setNewCategoryType={setNewCategoryType}
          newCategoryName={newCategoryName}
          setNewCategoryName={setNewCategoryName}
          handleAddCategory={handleAddCategory}
          isAddingCategory={isAddingCategory}
          expandedFolders={expandedFolders}
          toggleFolder={toggleFolder}
        />

        {/* ⭐️ 타임라인 메인 목록 */}
        <div className="flex-1 min-w-0 overflow-y-auto pr-1 md:pr-2 pl-1 md:pl-4 py-2 scrollbar-hide">
          {safeRecords.length > 0 && filteredRecords.length === 0 && (
            <div className="text-center py-16 md:py-20 text-zinc-400 font-bold bg-white rounded-[2rem] border border-zinc-200/80 border-dashed flex flex-col items-center gap-3">
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
            {filteredRecords.map((item) => (
              <TimelineItemCard
                key={item.id}
                item={item}
                isEditing={isEditing}
                safeTagTree={safeTagTree}
                onSelectRecord={setSelectedRecord}
                onUnlockSecret={handleUnlockSecret}
                onFollowHost={handleFollowHost}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineView;