import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, FolderOpen, Edit2, X as CloseIcon, Trash2, Calendar, Save, Plus, ChevronDown, MapPin } from 'lucide-react';
import { useAppStore } from '../store/AppStore';
import EmptyState from '../components/common/EmptyState';

// ⭐️ 공통으로 사용할 기본 이미지 URL 상수
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop';

// --- 상세 보기 & 수정 모달 컴포넌트 ---
const RecordDetailModal = ({ record, onClose, isAdmin, isGuestMode, tagTree, apiFetch, fetchAllData, showToast }) => {
  // ⭐️ 누락되었던 수정 모드 관리용 상태값 3개 복구!
  const [isEditMode, setIsEditMode] = useState(false);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const [tagIds, setTagIds] = useState([]);
  const [date, setDate] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [content, setContent] = useState('');
  
  // 🔥 추가: 태그 및 이미지 입력 토글 상태
  const [isTagExpanded, setIsTagExpanded] = useState(true);
  const [imageInputType, setImageInputType] = useState('file'); // ⭐️ 추가

  // ⭐️ 이미지 파일 업로드 핸들러 추가
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

  // 모달이 열리거나 닫힐 때, 다른 기록을 클릭했을 때 수정 모드를 기본 상태로 초기화
  useEffect(() => {
    if (record && !isEditMode) {
      setIsEditMode(false);
    }
  }, [record]);

  // 편집 모드 진입 시 기존 데이터를 폼에 채워넣기
  useEffect(() => {
    if (record && isEditMode) {
      setTitle(record.title);
      setDate(record.date?.replace(/\./g, '-') || '');
      setImageUrl(record.image);
      setContent(record.content || '');
      setIsTagExpanded(true); // 편집 모드 진입 시 태그 영역 열어주기

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

  // 수정 내용 저장
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
        imageUrl: imageUrl || DEFAULT_IMAGE, // ⭐️ 저장할 때 비어있으면 기본 이미지 적용
        content: content.trim(),
        isPublic: true,
        tagIds: numericTagIds
      };

      const res = await apiFetch(`/me/records/${record.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await fetchAllData(true); // 배경 갱신
        showToast('기록이 성공적으로 수정되었습니다! ✨');
        setIsEditMode(false);
        onClose(); // 팝업 닫기
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
    <div className="fixed inset-0 z-[200] bg-zinc-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={onClose}>
      <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        
        {/* 상단 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
          <h3 className="text-sm font-black text-zinc-800 tracking-tight flex items-center gap-2">
            {isEditMode ? <><Edit2 size={16} className="text-indigo-500"/> 기록 수정</> : <><Sparkles size={16} className="text-indigo-500"/> 기록 상세</>}
          </h3>
          <div className="flex items-center gap-2">
            {!isEditMode && isAdmin && !isGuestMode && (
              <>
                <button onClick={() => setIsEditMode(true)} className="p-2 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-800 rounded-full transition"><Edit2 size={16}/></button>
                <button onClick={handleDelete} className="p-2 text-zinc-400 hover:bg-rose-100 hover:text-rose-600 rounded-full transition"><Trash2 size={16}/></button>
              </>
            )}
            <button onClick={onClose} className="p-2 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-800 rounded-full transition"><CloseIcon size={18}/></button>
          </div>
        </div>

        {/* 본문 영역 */}
        <div className="overflow-y-auto p-6 scrollbar-hide">
          {isEditMode ? (
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
              <div>
                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">제목 <span className="text-rose-500">*</span></label>
                <input type="text" value={title} onChange={e=>setTitle(e.target.value)} className="w-full mt-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">카테고리 폴더 <span className="text-rose-500">*</span></label>
                  <select 
                    value={categoryId} 
                    onChange={e=>{
                      setCategoryId(e.target.value); 
                      setTagIds([]);
                      setIsTagExpanded(true); // 🔥 카테고리 변경 시 자동 펼치기
                    }} 
                    className="w-full mt-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                  >
                    <option value="">선택해주세요</option>
                    {tagTree.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">날짜</label>
                  <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full mt-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              
              {/* 🔥 태그 선택 영역 (토글 UI로 변경) */}
              {tagTree.find(c => String(c.id) === String(categoryId))?.children?.length > 0 && (
                <div className="animate-in fade-in slide-in-from-top-2 bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden transition-all">
                  <button 
                    type="button"
                    onClick={() => setIsTagExpanded(!isTagExpanded)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-100/80 transition-colors outline-none"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">태그 수정하기</span>
                      {tagIds.length > 0 && (
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md text-[10px] font-black">{tagIds.length}개 선택됨</span>
                      )}
                    </div>
                    <ChevronDown size={16} className={`text-zinc-400 transition-transform duration-300 ${isTagExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isTagExpanded && (
                    <div className="p-4 border-t border-zinc-200 flex flex-wrap gap-2 max-h-40 overflow-y-auto bg-white animate-in slide-in-from-top-1">
                      {tagTree.find(c => String(c.id) === String(categoryId)).children.map(tag => {
                        const isSelected = tagIds.includes(tag.id);
                        return (
                          <button 
                            key={tag.id} 
                            type="button"
                            onClick={() => setTagIds(prev => isSelected ? prev.filter(id=>id!==tag.id) : [...prev, tag.id])} 
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isSelected ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-200 ring-offset-1' : 'bg-zinc-50 text-zinc-600 border border-zinc-200 hover:bg-zinc-200/50'}`}
                          >
                            #{tag.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ⭐️ 이미지 수정 영역 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">이미지 수정</label>
                    <div className="flex bg-zinc-100 p-0.5 rounded-lg">
                        <button type="button" onClick={() => setImageInputType('file')} className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition ${imageInputType === 'file' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'}`}>파일</button>
                        <button type="button" onClick={() => setImageInputType('url')} className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition ${imageInputType === 'url' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'}`}>URL</button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  {imageUrl && (
                    <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden border border-zinc-200 shadow-sm relative group">
                       <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                       <button onClick={() => setImageUrl('')} className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><CloseIcon size={12}/></button>
                    </div>
                  )}
                  <div className="flex-1 flex items-center">
                    {imageInputType === 'file' ? (
                        <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-black file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 cursor-pointer" 
                        />
                    ) : (
                        <input 
                        type="text" 
                        value={imageUrl} 
                        onChange={e => setImageUrl(e.target.value)} 
                        placeholder="새 이미지 URL" 
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none" 
                        />
                    )}
                  </div>
                </div>
              </div>

              {/* 🔥 추가: 내용 수정 영역 */}
              <div>
                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">간단한 메모</label>
                <textarea value={content} onChange={e=>setContent(e.target.value)} rows={3} className="w-full mt-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-medium text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
              </div>

              <div className="flex gap-2 mt-6">
                <button onClick={() => setIsEditMode(false)} className="flex-1 py-3.5 bg-zinc-100 text-zinc-600 rounded-xl font-bold text-sm hover:bg-zinc-200 transition">취소</button>
                <button onClick={handleSave} className="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-sm"><Save size={16}/> 변경사항 저장</button>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
              <div className="w-full h-64 md:h-80 bg-zinc-100 rounded-2xl overflow-hidden mb-6 relative border border-zinc-200/80 shadow-inner">
                {/* ⭐️ 공백 문자열 방어 코드 적용 (?.) */}
                <img src={record.image?.trim() ? record.image : DEFAULT_IMAGE} onError={(e) => { e.target.src = DEFAULT_IMAGE; }} alt={record.title} className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-indigo-600 text-[11px] font-black rounded-xl shadow-sm uppercase tracking-wider">{record.category}</div>
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={14} className="text-zinc-400" />
                <span className="text-sm font-bold text-zinc-500">{record.date}</span>
              </div>
              
              <h2 className="text-2xl font-black text-zinc-900 tracking-tight mb-6 leading-tight">{record.title}</h2>
              
              {/* 🔥 추가: 내용 표시 영역 */}
              {record.content && (
                <div className="mb-6 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <p className="text-sm font-medium text-zinc-600 leading-relaxed whitespace-pre-wrap">{record.content}</p>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2">
                {(record.tags || []).map(tag => (
                  <span key={tag} className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-600">#{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- 메인 아카이브 뷰 ---
const ArchiveView = () => {
  const { records, tagTree, isAdmin, setLoginModalOpen, setAddRecordModalOpen, apiFetch, fetchAllData, showToast, isGuestMode, searchQuery } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  
  // ⭐️ 추가: 현재 선택된 상단 카테고리 필터 상태
  const [activeCategory, setActiveCategory] = useState('전체');

  // 게스트 모드 켜질 때 편집 상태 강제 해제
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

  // ⭐️ 기록들로부터 고유한 카테고리 목록을 추출합니다.
  const categories = useMemo(() => {
    const uniqueCategories = new Set(records.map(r => r.category).filter(Boolean));
    return ['전체', ...Array.from(uniqueCategories)];
  }, [records]);

  // ⭐️ 검색어 + 카테고리 필터링 적용
  const displayRecords = useMemo(() => {
    let result = records;

    // 1. 검색어 필터링
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => 
          (r.title && r.title.toLowerCase().includes(q)) || 
          (r.content && r.content.toLowerCase().includes(q)) ||
          (r.tags && r.tags.some(t => t.toLowerCase().includes(q))) ||
          (r.category && r.category.toLowerCase().includes(q))
      );
    }

    // 2. 상단 탭 필터링
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

      {/* ⭐️ 상단 헤더 & 카테고리 필터 영역 */}
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

        {/* ⭐️ 가로 스크롤 가능한 카테고리 필터 (Pill UI) */}
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
      
      {/* ⭐️ 사진 중심의 갤러리 그리드 영역 */}
      <div className="flex-1 px-6 md:px-10 py-6 overflow-y-auto scrollbar-hide">
        {displayRecords.length === 0 && (
            <div className="text-center py-20 text-zinc-400 font-bold bg-white rounded-[2rem] border border-zinc-200/80 border-dashed">
              선택한 카테고리에 해당하는 기록이 없습니다.
            </div>
        )}
        
        {/* 그리드 설정: 화면 크기에 맞춰 열 개수 조절 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-5 pb-10">
            {displayRecords.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => !isEditing && setSelectedRecord(item)}
                  className="group relative aspect-square rounded-2xl md:rounded-[1.5rem] overflow-hidden shadow-sm cursor-pointer border border-zinc-100/50 bg-zinc-100"
                >
                    {/* 바탕 이미지 */}
                    <img 
                        src={item.image?.trim() ? item.image : DEFAULT_IMAGE} 
                        onError={(e) => { e.target.src = DEFAULT_IMAGE; }} 
                        alt={item.title} 
                        className={`w-full h-full object-cover transition-transform duration-700 ease-out ${isEditing ? 'opacity-80 scale-100' : 'group-hover:scale-110'}`} 
                    />
                    
                    {/* 편집 모드 삭제 버튼 */}
                    {isEditing && (
                        <button 
                        onClick={(e) => handleDeleteGridRecord(item.id, e)}
                        className="absolute top-3 right-3 z-30 p-2.5 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 hover:scale-110 transition-all animate-in zoom-in-50"
                        >
                        <Trash2 size={16} />
                        </button>
                    )}

                    {/* ⭐️ 마우스 호버 시 나타나는 검은색 오버레이 & 정보 */}
                    {!isEditing && (
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4 md:p-5">
                            
                            {/* 우측 상단 북마크 아이콘 장식 (디자인 요소) */}
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
                                
                                {/* 태그 뱃지 */}
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