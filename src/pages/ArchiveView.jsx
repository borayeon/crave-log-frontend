import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, Edit2, X as CloseIcon, Plus, LayoutGrid, 
  ListMusic, Hash, AlertTriangle, Loader2, Lock 
} from 'lucide-react';
import { useAppStore } from '../store/AppStore';
import RecordDetailModal from '../components/features/RecordDetailModal';
import ArchiveRecordCard from '../components/features/archive/ArchiveRecordCard';
import PasscodeModal from '../components/features/PasscodeModal';
import { DEFAULT_IMAGE, getYoutubeId, getDomain } from '../utils/mediaUtils';

const ArchiveView = () => {
  const { 
    records, 
    tagTree, 
    isAdmin, 
    setAddRecordModalOpen, 
    apiFetch, 
    fetchAllData, 
    showToast, 
    isGuestMode, 
    searchQuery, 
    isLoading,
    visitedHandle,
    setLoginModalOpen,
    setViewMode
  } = useAppStore();

  const [isEditing, setIsEditing] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [passcodeModalRecord, setPasscodeModalRecord] = useState(null);
  
  const [activeCategory, setActiveCategory] = useState('전체');
  const [activeTag, setActiveTag] = useState('전체');

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [musicViewMode, setMusicViewMode] = useState('grid'); 

  const [customOrderedRecords, setCustomOrderedRecords] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);

  const [editingRankId, setEditingRankId] = useState(null);
  const [rankInputValue, setRankInputValue] = useState('');

  useEffect(() => {
    if (isAdmin || visitedHandle) {
      fetchAllData(true); 
    }
  }, [fetchAllData, isAdmin, visitedHandle]);

  useEffect(() => {
    if (isGuestMode) setIsEditing(false);
  }, [isGuestMode]);

  const executeGridDelete = async () => {
    if (!apiFetch || !confirmDeleteId) return;

    try {
      const res = await apiFetch(`/me/records/${confirmDeleteId}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchAllData(true);
        showToast('기록이 보관함에서 삭제되었습니다.');
        setConfirmDeleteId(null);
      }
    } catch (err) {
      console.error(err);
      showToast('삭제 중 오류가 발생했습니다.');
    }
  };

  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      (records || []).map((r) => r.category || r.categoryName).filter(Boolean)
    );
    return ['전체', ...Array.from(uniqueCategories)];
  }, [records]);

  const activeCategoryTags = useMemo(() => {
    if (activeCategory === '전체') return [];
    const catNode = tagTree.find((c) => c.name === activeCategory);
    return catNode && catNode.children ? catNode.children.map((t) => t.name) : [];
  }, [activeCategory, tagTree]);

  const displayRecords = useMemo(() => {
    let result = records || [];

    const isGuest = !isAdmin || isGuestMode; 
    if (isGuest) {
      result = result.filter((r) => r.isPublic === true);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((r) => 
        (r.title && r.title.toLowerCase().includes(q)) || 
        (r.content && r.content.toLowerCase().includes(q)) ||
        (r.tags && r.tags.some((t) => t.toLowerCase().includes(q))) ||
        ((r.category || r.categoryName) && (r.category || r.categoryName).toLowerCase().includes(q))
      );
    }

    if (activeCategory !== '전체') {
      result = result.filter((r) => (r.category || r.categoryName) === activeCategory);
    }

    if (activeTag !== '전체') {
      result = result.filter((r) => (r.tags || []).includes(activeTag));
    }

    return result.map((item) => {
      const catName = item.category || item.categoryName || '분류 없음';
      const imgUrl = item.image || item.imageUrl || '';
      
      const matchedCat = tagTree.find(
        (c) => c.name === catName || String(c.id) === String(item.categoryId)
      );
      const catType =
        item.categoryType ||
        matchedCat?.type ||
        (catName.includes('음악') ? 'MUSIC' : catName.includes('URL') ? 'URL' : 'GENERAL');

      const isMusic = catType === 'MUSIC';
      const isUrlItem = catType === 'URL';
      
      const videoId = isMusic && item.youtubeUrl ? getYoutubeId(item.youtubeUrl) : null;
      const domain = isUrlItem && item.youtubeUrl ? getDomain(item.youtubeUrl) : null;
      const hasImage = imgUrl && imgUrl.trim() !== '' && imgUrl !== DEFAULT_IMAGE;
      const isTextOnly = !isMusic && !isUrlItem && !hasImage;

      return { 
        ...item, 
        isMusic, 
        isUrlItem, 
        videoId, 
        domain, 
        hasImage, 
        isTextOnly, 
        category: catName, 
        image: imgUrl, 
        type: catType 
      };
    });
  }, [records, searchQuery, activeCategory, activeTag, isGuestMode, isAdmin, tagTree]);

  useEffect(() => {
    setCustomOrderedRecords(displayRecords);
  }, [displayRecords]);

  useEffect(() => {
    if (selectedRecord && displayRecords.length > 0) {
      const latestRecord = displayRecords.find((r) => r.id === selectedRecord.id);
      if (latestRecord && JSON.stringify(latestRecord) !== JSON.stringify(selectedRecord)) {
        setSelectedRecord(latestRecord);
      }
    }
  }, [displayRecords, selectedRecord]);

  const handleDragStart = (e, index) => {
    if (editingRankId) return; 
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const updated = [...customOrderedRecords];
    const [draggedItem] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, draggedItem);

    setCustomOrderedRecords(updated);
    setDraggedIndex(null);
  };

  const handleMoveItem = (e, index, direction) => {
    e.stopPropagation();
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= customOrderedRecords.length) return;

    const updated = [...customOrderedRecords];
    const [movedItem] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, movedItem);

    setCustomOrderedRecords(updated);
  };

  const handleRankDirectChange = (id, currentIndex, newRankStr) => {
    setEditingRankId(null);
    const newRank = parseInt(newRankStr, 10);
    
    if (isNaN(newRank)) return;

    let targetIndex = newRank - 1; 

    if (targetIndex < 0) targetIndex = 0;
    if (targetIndex >= customOrderedRecords.length) targetIndex = customOrderedRecords.length - 1;

    if (targetIndex === currentIndex) return;

    const updated = [...customOrderedRecords];
    const [movedItem] = updated.splice(currentIndex, 1);
    updated.splice(targetIndex, 0, movedItem);

    setCustomOrderedRecords(updated);
    showToast(`순위가 ${targetIndex + 1}위로 변경되었습니다! 🎵`);
  };

  const isCurrentCategoryMusic = useMemo(() => {
    if (activeCategory === '전체') return false;
    const catNode = tagTree.find((c) => c.name === activeCategory);
    return catNode?.type === 'MUSIC' || activeCategory.includes('음악');
  }, [activeCategory, tagTree]);

  const isListMode = isCurrentCategoryMusic && musicViewMode === 'list';

  const handleUnlockSuccess = (unlocked) => {
    setCustomOrderedRecords(prev => prev.map(r => String(r.id) === String(unlocked.id) ? unlocked : r));
  };

  const handleFollowHost = async () => {
    if (!isAdmin) {
      setLoginModalOpen(true);
      return;
    }
    if (visitedHandle) {
      try {
        const res = await apiFetch(`/users/${visitedHandle}/follow`, { method: 'POST' });
        if (res?.ok) {
          showToast(`@${visitedHandle}님을 팔로우했습니다! 이제 팔로워 공개 기록을 열람할 수 있습니다. 🎉`);
          await fetchAllData(true);
        } else {
          showToast('팔로우 처리에 실패했습니다.');
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

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
          나만의 소중한 기록과 컬렉션을 관리하시려면 먼저 CraveLog에 로그인해주세요.
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

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 pb-24 md:pb-0 bg-[#F8FAFC] relative w-full">
      
      {passcodeModalRecord && (
        <PasscodeModal
          recordId={passcodeModalRecord.id}
          recordTitle={passcodeModalRecord.title}
          onClose={() => setPasscodeModalRecord(null)}
          onSuccess={handleUnlockSuccess}
        />
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 z-[300] bg-black/50 backdrop-blur-sm flex items-center justify-center animate-in fade-in p-4">
          <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full text-center">
            <AlertTriangle size={56} className="text-rose-500 mx-auto mb-4" />
            <h3 className="text-xl font-black text-zinc-900 mb-2">기록 삭제</h3>
            <p className="text-sm text-zinc-500 mb-8">
              선택한 기록을 정말 삭제하시겠습니까?<br/>삭제 후에는 복구할 수 없습니다.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeleteId(null)} className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-bold transition">
                취소
              </button>
              <button onClick={executeGridDelete} className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold transition">
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}

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

      <header className="px-6 md:px-10 pt-8 pb-4 shrink-0 relative z-10 bg-[#F8FAFC]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 md:mb-6">
          <h2 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
            취향 아카이브 <Sparkles size={24} className="text-rose-500 fill-rose-500" />
          </h2>
          
          <div className="flex flex-wrap items-center gap-2">
            {isCurrentCategoryMusic && (
              <div className="flex items-center gap-1 bg-white border border-zinc-200 rounded-lg p-1 shadow-sm shrink-0">
                <button 
                  onClick={() => setMusicViewMode('grid')} 
                  className={`p-1.5 rounded-md transition-colors ${musicViewMode === 'grid' ? 'bg-zinc-100 text-zinc-900 shadow-sm' : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50'}`}
                  title="그리드 뷰 (레코드판)"
                >
                  <LayoutGrid size={16} />
                </button>
                <button 
                  onClick={() => setMusicViewMode('list')} 
                  className={`p-1.5 rounded-md transition-colors ${musicViewMode === 'list' ? 'bg-zinc-100 text-zinc-900 shadow-sm' : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50'}`}
                  title="리스트 뷰 (멜론 차트형)"
                >
                  <ListMusic size={16} />
                </button>
              </div>
            )}

            {isAdmin && !isGuestMode && (
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setAddRecordModalOpen(true)}
                  className="px-4 py-2 bg-zinc-900 text-white rounded-full text-xs font-bold hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-sm"
                >
                  <Plus size={14}/> 새 기록 추가
                </button>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${isEditing ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}
                >
                  {isEditing ? <><CloseIcon size={14}/> 편집 완료</> : <><Edit2 size={14}/> 보관함 편집</>}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 items-center">
          <div className="flex flex-nowrap gap-2 w-max pr-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setActiveTag('전체'); 
                }}
                className={`px-4 py-2 rounded-full text-sm font-black whitespace-nowrap transition-all duration-300 ${
                  activeCategory === cat 
                    ? 'bg-zinc-900 text-white shadow-md' 
                    : 'bg-white border border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {activeCategory !== '전체' && activeCategoryTags.length > 0 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pt-1 pb-2 items-center animate-in fade-in slide-in-from-top-2">
            <button
              onClick={() => setActiveTag('전체')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                activeTag === '전체' 
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                  : 'bg-white border border-zinc-200 text-zinc-500 hover:bg-zinc-50'
              }`}
            >
              전체보기
            </button>
            {activeCategoryTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-300 flex items-center gap-1.5 ${
                  activeTag === tag 
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                    : 'bg-white border border-zinc-200 text-zinc-500 hover:bg-zinc-50'
                }`}
              >
                <Hash size={12} className={activeTag === tag ? "text-indigo-500" : "text-zinc-400"}/>
                {tag}
              </button>
            ))}
          </div>
        )}
      </header>
      
      <div className="flex-1 px-6 md:px-10 py-6 overflow-y-auto scrollbar-hide">
        {customOrderedRecords.length === 0 && (
          <div className="text-center py-20 text-zinc-400 font-bold bg-white rounded-[2rem] border border-zinc-200/80 border-dashed">
            선택한 필터 조건에 해당하는 기록이 없습니다.
          </div>
        )}
        
        <div className={isListMode 
          ? "flex flex-col gap-3 pb-10 max-w-4xl mx-auto w-full"
          : "grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-5 sm:gap-7 md:gap-8 pb-10 justify-items-center items-start w-full"
        }>
          {customOrderedRecords.map((item, index) => (
            <ArchiveRecordCard
              key={item.id}
              item={item}
              index={index}
              totalCount={customOrderedRecords.length}
              isListMode={isListMode}
              isEditing={isEditing}
              editingRankId={editingRankId}
              setEditingRankId={setEditingRankId}
              rankInputValue={rankInputValue}
              setRankInputValue={setRankInputValue}
              handleRankDirectChange={handleRankDirectChange}
              handleMoveItem={handleMoveItem}
              handleDragStart={handleDragStart}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              draggedIndex={draggedIndex}
              onSelectRecord={setSelectedRecord}
              onConfirmDelete={setConfirmDeleteId}
              onUnlockSecret={setPasscodeModalRecord}
              onFollowHost={handleFollowHost}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArchiveView;