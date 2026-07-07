import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, FolderOpen, Edit2, X as CloseIcon, Trash2, Calendar, Save, Plus, ChevronDown, MapPin, MoreHorizontal, Heart, MessageCircle, Send, Bookmark } from 'lucide-react';
import { useAppStore } from '../store/AppStore';
import EmptyState from '../components/common/EmptyState';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop';

// --- 상세 보기 & 수정 모달 컴포넌트 (인스타그램 UI 스타일) ---
const RecordDetailModal = ({ record, onClose, isAdmin, isGuestMode, tagTree, apiFetch, fetchAllData, showToast }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tagIds, setTagIds] = useState([]);
  const [date, setDate] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [content, setContent] = useState('');
  const [isTagExpanded, setIsTagExpanded] = useState(true);
  const [imageInputType, setImageInputType] = useState('file');

  const { user } = useAppStore(); // 작성자 정보를 표시하기 위해 가져옴

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (record && !isEditMode) {
      setIsEditMode(false);
    }
  }, [record]);

  useEffect(() => {
    if (record && isEditMode) {
      setTitle(record.title);
      setDate(record.date?.replace(/\./g, '-') || '');
      setImageUrl(record.image);
      setContent(record.content || '');
      setIsTagExpanded(true);

      const cat = tagTree.find(c => c.name === record.category);
      setCategoryId(cat ? cat.id : '');

      if (cat && cat.children) {
        const matchedTagIds = record.tags
            .map(tagName => cat.children.find(t => t.name === tagName)?.id)
            .filter(Boolean);
        setTagIds(matchedTagIds);
      } else {
        setTagIds([]);
      }
    }
  }, [record, isEditMode, tagTree]);

  if (!record) return null;

  const handleSave = async () => {
    if (!title.trim() || !categoryId) {
      showToast('제목과 카테고리는 필수 입력 사항입니다.');
      return;
    }

    try {
      const selectedCategory = tagTree.find(c => String(c.id) === String(categoryId));
      const numericTagIds = tagIds.map(id => Number(String(id).replace(/^(cat_|tag_)/, '')));

      const payload = {
        title: title.trim(),
        categoryName: selectedCategory?.name || '분류 없음',
        recordDate: date.replace(/-/g, '.'),
        imageUrl: imageUrl || DEFAULT_IMAGE,
        content: content.trim(),
        isPublic: true,
        tagIds: numericTagIds
      };

      const res = await apiFetch(`/me/records/${record.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await fetchAllData(true);
        showToast('기록이 성공적으로 수정되었습니다! ✨');
        setIsEditMode(false);
        onClose();
      } else {
        showToast('수정에 실패했습니다.');
      }
    } catch (e) {
      console.error(e);
      showToast('서버 연결 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async () => {
    try {
      const res = await apiFetch(`/me/records/${record.id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchAllData(true);
        showToast('기록이 삭제되었습니다.');
        onClose();
      }
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-in fade-in" onClick={onClose}>
      {/* 인스타그램 스타일 분할 모달 컨테이너 */}
      <div 
        className="bg-zinc-950 md:bg-zinc-900 rounded-2xl
             w-full max-w-5xl
             h-[75vh]
             flex flex-col md:flex-row
             overflow-hidden shadow-2xl border border-zinc-800"
        onClick={e => e.stopPropagation()}
      >
        {/* 모바일 닫기 버튼 */}
        <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 text-white hover:text-zinc-300 transition-colors bg-black/50 rounded-full md:hidden backdrop-blur-md">
            <CloseIcon size={20}/>
        </button>

        {/* 좌측 영역: 이미지 (블랙 배경, object-contain으로 원본 비율 유지) */}
        <div className="w-full md:w-[55%] lg:w-[60%] h-64 md:h-full bg-black flex items-center justify-center relative border-r border-zinc-800 shrink-0">
            {isEditMode ? (
                 <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-zinc-900">
                     <p className="text-zinc-400 mb-4 font-bold text-sm">이미지 미리보기</p>
                     {imageUrl ? (
                        <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-xl border border-zinc-700">
                             <img src={imageUrl} alt="preview" className="max-w-full max-h-full object-contain" />
                        </div>
                     ) : (
                         <div className="w-full h-full border-2 border-dashed border-zinc-700 rounded-xl flex items-center justify-center text-zinc-600">
                             이미지 없음
                         </div>
                     )}
                 </div>
            ) : (
                <img 
                    src={record.image?.trim() ? record.image : DEFAULT_IMAGE} 
                    onError={(e) => { e.target.src = DEFAULT_IMAGE; }} 
                    alt={record.title} 
                    className="w-full h-full object-contain" 
                />
            )}
        </div>

        {/* 우측 영역: 상세 정보 및 댓글/수정 폼 */}
        <div className="w-full md:w-[45%] lg:w-[40%] flex flex-col h-full bg-zinc-950 text-zinc-200 overflow-hidden">
            
            {/* Header: 유저 프로필 영역 */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-800 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-700">
                         {user?.profileImageUrl ? (
                            <img src={user.profileImageUrl} alt="profile" className="w-full h-full object-cover" />
                        ) : (
                             <span className="text-xs font-bold text-zinc-400">{user?.name?.charAt(0) || '?'}</span>
                        )}
                    </div>
                    <div className="leading-tight">
                        <p className="text-sm font-bold text-white flex items-center gap-1.5">
                            {user?.handle || 'User'} 
                            <span className="text-[10px] text-zinc-500 font-medium tracking-wider">• {record.category}</span>
                        </p>
                        {user?.location && <p className="text-[10px] text-zinc-400">{user.location}</p>}
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    {!isEditMode && isAdmin && !isGuestMode && (
                        <div className="flex items-center gap-1 mr-2">
                            <button onClick={() => setIsEditMode(true)} className="p-2 text-zinc-400 hover:text-white transition-colors" title="수정"><Edit2 size={16}/></button>
                            <button onClick={handleDelete} className="p-2 text-zinc-400 hover:text-rose-500 transition-colors" title="삭제"><Trash2 size={16}/></button>
                        </div>
                    )}
                    <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white transition-colors hidden md:block"><CloseIcon size={24}/></button>
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
                {isEditMode ? (
                    /* --- 수정 모드 폼 --- */
                    <div className="space-y-5 animate-in fade-in duration-300">
                        <div>
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">제목 <span className="text-rose-500">*</span></label>
                            <input type="text" value={title} onChange={e=>setTitle(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-zinc-600 outline-none transition-colors" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">카테고리 <span className="text-rose-500">*</span></label>
                            <select 
                                value={categoryId} 
                                onChange={e=>{
                                setCategoryId(e.target.value); 
                                setTagIds([]);
                                setIsTagExpanded(true);
                                }} 
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-zinc-600 outline-none appearance-none transition-colors"
                            >
                                <option value="">선택해주세요</option>
                                {tagTree.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>
                            </div>
                            <div>
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">날짜</label>
                            <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-zinc-600 outline-none [color-scheme:dark] transition-colors" />
                            </div>
                        </div>
                        
                        {tagTree.find(c => String(c.id) === String(categoryId))?.children?.length > 0 && (
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
                            <button 
                                type="button"
                                onClick={() => setIsTagExpanded(!isTagExpanded)}
                                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-zinc-800 transition-colors"
                            >
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">태그 수정 ({tagIds.length})</span>
                                <ChevronDown size={14} className={`text-zinc-500 transition-transform ${isTagExpanded ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {isTagExpanded && (
                                <div className="p-3 border-t border-zinc-800 flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                                {tagTree.find(c => String(c.id) === String(categoryId)).children.map(tag => {
                                    const isSelected = tagIds.includes(tag.id);
                                    return (
                                    <button 
                                        key={tag.id} type="button"
                                        onClick={() => setTagIds(prev => isSelected ? prev.filter(id=>id!==tag.id) : [...prev, tag.id])} 
                                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${isSelected ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                                    >
                                        #{tag.name}
                                    </button>
                                    );
                                })}
                                </div>
                            )}
                            </div>
                        )}

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">이미지 소스</label>
                                <div className="flex bg-zinc-800 p-0.5 rounded-md">
                                    <button type="button" onClick={() => setImageInputType('file')} className={`px-2 py-0.5 text-[10px] font-bold rounded transition ${imageInputType === 'file' ? 'bg-zinc-600 text-white' : 'text-zinc-500'}`}>파일</button>
                                    <button type="button" onClick={() => setImageInputType('url')} className={`px-2 py-0.5 text-[10px] font-bold rounded transition ${imageInputType === 'url' ? 'bg-zinc-600 text-white' : 'text-zinc-500'}`}>URL</button>
                                </div>
                            </div>

                            {imageInputType === 'file' ? (
                                <input 
                                    type="file" accept="image/*" onChange={handleImageUpload} 
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-400 file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-bold file:bg-zinc-700 file:text-white hover:file:bg-zinc-600 cursor-pointer" 
                                />
                            ) : (
                                <input 
                                    type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="새 이미지 URL" 
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white outline-none" 
                                />
                            )}
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">본문</label>
                            <textarea value={content} onChange={e=>setContent(e.target.value)} rows={5} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-zinc-600 outline-none resize-none transition-colors" />
                        </div>
                    </div>
                ) : (
                    /* --- 조회 모드 본문 영역 (댓글 UI 연상) --- */
                    <div className="animate-in fade-in duration-300">
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700">
                                {user?.profileImageUrl ? (
                                    <img src={user.profileImageUrl} alt="profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="w-full h-full flex items-center justify-center text-xs font-bold text-zinc-400">{user?.name?.charAt(0) || '?'}</span>
                                )}
                            </div>
                            <div className="flex-1 pt-1">
                                <span className="text-sm font-bold text-white mr-2">{user?.handle || 'User'}</span>
                                <span className="text-sm text-zinc-100 whitespace-pre-wrap leading-relaxed font-medium">
                                    <span className="font-bold text-white mb-1 block">{record.title}</span>
                                    {record.content}
                                </span>
                                
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                    {(record.tags || []).map(tag => (
                                        <span key={tag} className="text-xs font-medium text-[#E0F2FE] hover:text-white cursor-pointer transition-colors">#{tag}</span>
                                    ))}
                                </div>
                                <div className="mt-3 text-[11px] text-zinc-500 font-medium">
                                    {record.date}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

// --- 메인 아카이브 뷰 (갤러리 호버 이펙트 유지) ---
const ArchiveView = () => {
  const { records, tagTree, isAdmin, setLoginModalOpen, setAddRecordModalOpen, apiFetch, fetchAllData, showToast, isGuestMode, searchQuery } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  
  const [activeCategory, setActiveCategory] = useState('전체');

  useEffect(() => {
    if (isGuestMode) setIsEditing(false);
  }, [isGuestMode]);

  const handleDeleteGridRecord = async (recordId, e) => {
    e.stopPropagation();
    if (!apiFetch) return;

    try {
      const res = await apiFetch(`/me/records/${recordId}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchAllData(true);
        showToast('기록이 보관함에서 삭제되었습니다.');
      }
    } catch(err) {
      console.error(err);
    }
  };

  const categories = useMemo(() => {
    const uniqueCategories = new Set(records.map(r => r.category).filter(Boolean));
    return ['전체', ...Array.from(uniqueCategories)];
  }, [records]);

  const displayRecords = useMemo(() => {
    let result = records;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => 
          (r.title && r.title.toLowerCase().includes(q)) || 
          (r.content && r.content.toLowerCase().includes(q)) ||
          (r.tags && r.tags.some(t => t.toLowerCase().includes(q))) ||
          (r.category && r.category.toLowerCase().includes(q))
      );
    }

    if (activeCategory !== '전체') {
      result = result.filter(r => r.category === activeCategory);
    }

    return result;
  }, [records, searchQuery, activeCategory]);

  if (records.length === 0) {
      return (
          <div className="h-full bg-[#F8FAFC]">
            <EmptyState 
                title="텅 빈 보관함입니다" 
                icon={<FolderOpen size={32}/>} 
                onAction={() => isAdmin && !isGuestMode ? setAddRecordModalOpen(true) : setLoginModalOpen(true)}
                actionLabel={isAdmin && !isGuestMode ? "첫 기록 추가하기" : "로그인하고 시작하기"}
            />
          </div>
      );
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 pb-24 md:pb-0 bg-[#F8FAFC] relative">
      
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

      <header className="px-6 md:px-10 pt-8 pb-4 shrink-0 relative z-10 bg-[#F8FAFC]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
                취향 아카이브 <Sparkles size={24} className="text-rose-500 fill-rose-500" />
            </h2>
            
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

        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
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
      </header>
      
      <div className="flex-1 px-6 md:px-10 py-6 overflow-y-auto scrollbar-hide">
        {displayRecords.length === 0 && (
            <div className="text-center py-20 text-zinc-400 font-bold bg-white rounded-[2rem] border border-zinc-200/80 border-dashed">
              선택한 카테고리에 해당하는 기록이 없습니다.
            </div>
        )}
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-5 pb-10">
            {displayRecords.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => !isEditing && setSelectedRecord(item)}
                  className={`group relative aspect-square rounded-2xl md:rounded-[1.5rem] overflow-hidden shadow-sm cursor-pointer border border-zinc-100/50 bg-zinc-100 transition-all duration-500 ease-out transform ${!isEditing ? 'hover:scale-[1.04] hover:-translate-y-1 hover:shadow-2xl hover:z-10' : ''}`}
                >
                    <img 
                        src={item.image?.trim() ? item.image : DEFAULT_IMAGE} 
                        onError={(e) => { e.target.src = DEFAULT_IMAGE; }} 
                        alt={item.title} 
                        className={`w-full h-full object-cover transition-transform duration-700 ease-out ${isEditing ? 'opacity-80 scale-100' : 'group-hover:scale-110'}`} 
                    />
                    
                    {isEditing && (
                        <button 
                        onClick={(e) => handleDeleteGridRecord(item.id, e)}
                        className="absolute top-3 right-3 z-30 p-2.5 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 hover:scale-110 transition-all animate-in zoom-in-50"
                        >
                        <Trash2 size={16} />
                        </button>
                    )}

                    {!isEditing && (
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4 md:p-5">
                            
                            <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 translate-y-[-10px] group-hover:translate-y-0 transition-all duration-500 delay-100">
                                <Sparkles size={14} />
                            </div>

                            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                                <h3 className="text-white text-lg md:text-xl font-black truncate drop-shadow-md mb-1.5">
                                    {item.title}
                                </h3>
                                
                                <div className="flex items-center gap-1.5 text-zinc-300 text-xs font-medium mb-3">
                                    <Calendar size={12} />
                                    <span>{item.date}</span>
                                </div>
                                
                                <div className="flex flex-wrap gap-1.5 h-6 overflow-hidden">
                                    <span className="px-2 py-0.5 bg-rose-500/80 text-white text-[10px] font-black rounded-md backdrop-blur-sm border border-rose-400/50">
                                        {item.category}
                                    </span>
                                    {(item.tags || []).slice(0, 2).map(tag => (
                                        <span key={tag} className="px-2 py-0.5 bg-white/20 text-white text-[10px] font-bold rounded-md backdrop-blur-sm border border-white/10 truncate max-w-[80px]">
                                            #{tag}
                                        </span>
                                    ))}
                                    {(item.tags || []).length > 2 && (
                                        <span className="px-2 py-0.5 bg-white/10 text-zinc-300 text-[10px] font-bold rounded-md backdrop-blur-sm">
                                            +{(item.tags || []).length - 2}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ArchiveView;