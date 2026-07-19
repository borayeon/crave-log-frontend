import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, FolderOpen, Edit2, X as CloseIcon, Trash2, Calendar, Save, Plus, ChevronDown, MapPin, MoreHorizontal, Heart, MessageCircle, Send, Bookmark, Globe, Lock, Disc, PlayCircle, Quote } from 'lucide-react'; // ⭐️ Quote 아이콘 추가
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

const RecordDetailModal = ({ record, onClose, isAdmin, isGuestMode, tagTree, apiFetch, fetchAllData, showToast }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tagIds, setTagIds] = useState([]);
  const [date, setDate] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState(''); 
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isTagExpanded, setIsTagExpanded] = useState(true);
  const [imageInputType, setImageInputType] = useState('file');

  const { user } = useAppStore(); 

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
      setImageUrl(record.image === DEFAULT_IMAGE ? '' : record.image); // ⭐️ 편집 모드일 때 기본 이미지는 빈칸으로 치환
      setYoutubeUrl(record.youtubeUrl || ''); 
      setContent(record.content || '');
      setIsPublic(record.isPublic ?? true);
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

      // ⭐️ 빈 이미지로 저장 허용 (프론트에서 빈 이미지를 빈 텍스트로 처리)
      const payload = {
        title: title.trim(),
        categoryName: selectedCategory?.name || '분류 없음',
        recordDate: date.replace(/-/g, '.'),
        imageUrl: imageUrl.trim(), // 빈 문자열 허용
        youtubeUrl: selectedCategory?.name === '음악' ? youtubeUrl.trim() : '', 
        content: content.trim(),
        isPublic: isPublic,
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

  const videoId = record.category === '음악' && !isEditMode ? getYoutubeId(record.youtubeUrl) : null;
  const hasImage = record.image && record.image.trim() !== '' && record.image !== DEFAULT_IMAGE;
  const isTextOnly = record.category !== '음악' && !hasImage; // 텍스트 전용 판별

  return (
    <div className="fixed inset-0 z-[200] bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-in fade-in" onClick={onClose}>
      <div 
        className="bg-zinc-950 md:bg-zinc-900 rounded-2xl w-full max-w-5xl h-[75vh] flex flex-col md:flex-row overflow-hidden shadow-2xl border border-zinc-800 relative"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-[250] p-2 bg-black/50 hover:bg-white text-white hover:text-zinc-900 transition-colors rounded-full backdrop-blur-md shadow-lg border border-white/10">
            <CloseIcon size={20}/>
        </button>

        <div className="w-full md:w-[55%] lg:w-[60%] h-64 md:h-full flex items-center justify-center relative border-r border-zinc-800 shrink-0 bg-black">
            {isEditMode ? (
                 <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-zinc-900">
                     <p className="text-zinc-400 mb-4 font-bold text-sm">이미지/영상 미리보기</p>
                     
                     {tagTree.find(c => String(c.id) === String(categoryId))?.name === '음악' && getYoutubeId(youtubeUrl) ? (
                         <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-xl border border-zinc-700 bg-black">
                             <img src={`https://img.youtube.com/vi/${getYoutubeId(youtubeUrl)}/hqdefault.jpg`} alt="youtube thumbnail" className="max-w-full max-h-full object-contain" />
                         </div>
                     ) : imageUrl ? (
                        <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-xl border border-zinc-700 bg-black">
                             <img src={imageUrl} alt="preview" className="max-w-full max-h-full object-contain" />
                        </div>
                     ) : (
                         <div className="w-full h-full border-2 border-dashed border-zinc-700 rounded-xl flex items-center justify-center text-zinc-600 bg-black/50 flex-col gap-2">
                             <ImageIcon size={24} className="opacity-50" />
                             <span>이미지 없음 (텍스트 전용)</span>
                         </div>
                     )}
                 </div>
            ) : videoId ? (
                <iframe 
                    width="100%" 
                    height="100%" 
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1`} 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    className="w-full h-full border-none outline-none"
                ></iframe>
            ) : isTextOnly ? (
                // ⭐️ 모달 좌측: 이미지가 없을 경우 멋진 텍스트 인용구 렌더링
                <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-zinc-900 to-black flex flex-col items-center justify-center p-10 text-center relative overflow-hidden">
                    <Quote size={80} className="absolute -top-4 -left-4 text-white/5" />
                    <Quote size={80} className="absolute -bottom-4 -right-4 text-white/5 rotate-180" />
                    
                    <h2 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-lg mb-6">
                        {record.title}
                    </h2>
                    {record.content && (
                      <p className="text-zinc-300 text-lg md:text-xl font-medium leading-relaxed max-w-md line-clamp-6">
                          "{record.content}"
                      </p>
                    )}
                </div>
            ) : (
                // 일반 이미지
                <img 
                    src={record.image} 
                    onError={(e) => { e.target.src = DEFAULT_IMAGE; }} 
                    alt={record.title} 
                    className="w-full h-full object-contain" 
                />
            )}
        </div>

        <div className="w-full md:w-[45%] lg:w-[40%] flex flex-col h-full bg-zinc-950 text-zinc-200 overflow-hidden relative z-10">
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
                        <div className="flex items-center gap-1 mr-6 md:mr-0">
                            <button onClick={() => setIsEditMode(true)} className="p-2 text-zinc-400 hover:text-white transition-colors" title="수정"><Edit2 size={16}/></button>
                            <button onClick={handleDelete} className="p-2 text-zinc-400 hover:text-rose-500 transition-colors" title="삭제"><Trash2 size={16}/></button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
                {isEditMode ? (
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

                        {tagTree.find(c => String(c.id) === String(categoryId))?.name === '음악' ? (
                          <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-lg">
                            <label className="text-[10px] font-bold text-red-500 uppercase tracking-wider block mb-1.5">유튜브 URL 연결</label>
                            <input 
                              type="text" 
                              value={youtubeUrl} 
                              onChange={e => setYoutubeUrl(e.target.value)} 
                              placeholder="https://www.youtube.com/watch?v=..." 
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-red-500/50 outline-none transition-colors" 
                            />
                          </div>
                        ) : (
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
                                      type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="선택: 새 이미지 URL을 입력하거나 비워두세요." 
                                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white outline-none" 
                                  />
                              )}
                          </div>
                        )}

                        <div>
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">본문</label>
                            <textarea value={content} onChange={e=>setContent(e.target.value)} rows={5} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-zinc-600 outline-none resize-none transition-colors" />
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg mt-2">
                          <div>
                            <h4 className="text-[11px] font-bold text-white flex items-center gap-1.5">
                              {isPublic ? <Globe size={14} className="text-indigo-400"/> : <Lock size={14} className="text-rose-400"/>}
                              {isPublic ? '전체 공개' : '나만 보기 (비공개)'}
                            </h4>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => setIsPublic(!isPublic)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${isPublic ? 'bg-indigo-500' : 'bg-zinc-600'}`}
                          >
                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isPublic ? 'translate-x-5' : 'translate-x-1'}`} />
                          </button>
                        </div>
                    </div>
                ) : (
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
                                    <span className="font-bold text-white mb-1 flex items-center gap-1.5">
                                        {record.title}
                                        {!record.isPublic && <Lock size={12} className="text-rose-400" title="비공개 기록" />} 
                                    </span>
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

            {isEditMode ? (
                 <div className="p-4 border-t border-zinc-800 bg-zinc-950 shrink-0">
                    <div className="flex gap-2">
                        <button onClick={() => setIsEditMode(false)} className="flex-1 py-2.5 bg-zinc-900 text-zinc-300 border border-zinc-800 rounded-lg font-bold text-sm hover:bg-zinc-800 transition">취소</button>
                        <button onClick={handleSave} className="flex-1 py-2.5 bg-zinc-100 text-zinc-900 rounded-lg font-black text-sm hover:bg-white transition flex items-center justify-center gap-2">저장 완료</button>
                    </div>
                 </div>
            ) : (
                <div className="border-t border-zinc-800 p-4 shrink-0 bg-zinc-950">
                    <div className="flex items-center justify-between mb-3 text-white">
                        <div className="flex gap-4">
                            <button className="hover:text-zinc-400 transition-colors"><Heart size={24} /></button>
                            <button className="hover:text-zinc-400 transition-colors"><MessageCircle size={24} /></button>
                            <button className="hover:text-zinc-400 transition-colors"><Send size={24} /></button>
                        </div>
                        <button className="hover:text-zinc-400 transition-colors"><Bookmark size={24} /></button>
                    </div>
                    <p className="text-sm font-bold text-white mb-1">CraveLog Archive</p>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{record.date}</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

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

    if (isGuestMode) {
      result = result.filter(r => r.isPublic !== false);
    }

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
  }, [records, searchQuery, activeCategory, isGuestMode]);

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
            {displayRecords.map(item => {
                
                const isMusic = item.category === '음악';
                const videoId = isMusic && item.youtubeUrl ? getYoutubeId(item.youtubeUrl) : null;
                const hasImage = item.image && item.image.trim() !== '' && item.image !== DEFAULT_IMAGE;
                
                // ⭐️ 이미지가 없는 일반 텍스트 메모 기록인지 판별
                const isTextOnly = !isMusic && !hasImage;
                
                if (isMusic) {
                  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : MUSIC_DEFAULT_IMAGE;
                  return (
                    <div 
                      key={item.id} 
                      onClick={() => !isEditing && setSelectedRecord(item)}
                      className={`group cursor-pointer flex flex-col items-center animate-in fade-in transition-all duration-500 ease-out ${!isEditing ? 'hover:-translate-y-1' : ''}`}
                    >
                      <div className={`relative w-full aspect-square rounded-full overflow-hidden shadow-lg border-[6px] border-zinc-900 transition-transform duration-500 ease-out ${isEditing ? 'opacity-80 scale-100' : 'group-hover:scale-105 group-hover:shadow-2xl group-hover:border-zinc-800'}`}>
                        <img src={thumbnailUrl} alt={item.title} className={`w-full h-full object-cover scale-125 transition-transform duration-700 ease-out ${!isEditing ? 'group-hover:rotate-12 group-hover:scale-150' : ''}`} />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                        
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-zinc-900 rounded-full border-[3px] border-zinc-700 flex items-center justify-center shadow-inner">
                            <PlayCircle size={18} className="text-white/80 translate-x-[1px]" />
                        </div>
                        
                        {isEditing && (
                            <button 
                            onClick={(e) => handleDeleteGridRecord(item.id, e)}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 p-3 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 hover:scale-110 transition-all animate-in zoom-in-50"
                            >
                            <Trash2 size={20} />
                            </button>
                        )}
                        
                        {!item.isPublic && !isEditing && (
                          <div className="absolute top-2 right-2 p-1.5 bg-zinc-900/80 backdrop-blur-md text-rose-400 rounded-full shadow-sm z-20">
                            <Lock size={12} />
                          </div>
                        )}
                      </div>
                      <div className="mt-3 text-center px-2">
                        <h3 className="text-sm font-black text-zinc-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">{item.title}</h3>
                        <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center justify-center gap-1 uppercase tracking-widest">
                          <Disc size={12} /> Record
                        </p>
                      </div>
                    </div>
                  );
                }

                // 일반 카테고리의 갤러리 뷰
                return (
                  <div 
                    key={item.id} 
                    onClick={() => !isEditing && setSelectedRecord(item)}
                    className={`group relative aspect-[4/5] rounded-2xl md:rounded-[1.5rem] overflow-hidden shadow-sm cursor-pointer border border-zinc-100/50 bg-white transition-all duration-500 ease-out transform flex flex-col ${!isEditing ? 'hover:scale-[1.04] hover:-translate-y-1 hover:shadow-xl hover:z-10 hover:border-indigo-200' : ''}`}
                  >
                      {/* ⭐️ 이미지가 없는 텍스트 전용 카드 (갤러리 뷰) */}
                      {isTextOnly ? (
                          <div className="w-full h-full bg-gradient-to-br from-indigo-50 via-white to-zinc-50 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                              <Quote size={40} className="text-indigo-100 absolute top-4 left-4" />
                              <div className="absolute top-4 left-4 px-2.5 py-1 bg-indigo-100/50 text-indigo-600 text-[10px] font-black rounded-md uppercase tracking-wider">{item.category}</div>
                              <h3 className="text-lg font-black text-zinc-800 mb-2 mt-4 leading-tight group-hover:text-indigo-600 transition-colors">{item.title}</h3>
                              {item.content && (
                                <p className="text-xs font-medium text-zinc-500 line-clamp-4 leading-relaxed px-2">"{item.content}"</p>
                              )}
                          </div>
                      ) : (
                          // 일반 이미지 렌더링
                          <>
                            <div className="relative w-full flex-1 overflow-hidden bg-zinc-100">
                                <img 
                                    src={item.image} 
                                    onError={(e) => { e.target.src = DEFAULT_IMAGE; }} 
                                    alt={item.title} 
                                    className={`w-full h-full object-cover transition-transform duration-700 ease-out ${isEditing ? 'opacity-80 scale-100' : 'group-hover:scale-110'}`} 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                                <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-md text-indigo-600 text-[10px] font-black rounded-lg shadow-sm uppercase tracking-wider">{item.category}</div>
                            </div>
                            <div className="p-4 flex flex-col justify-center bg-white z-10 border-t border-zinc-100">
                                <h4 className="text-sm font-black text-zinc-900 truncate group-hover:text-indigo-600 transition-colors">{item.title}</h4>
                                {(item.tags || []).length > 0 && (
                                  <div className="mt-1.5 flex flex-wrap gap-1.5 overflow-hidden h-4">
                                    {item.tags.slice(0, 2).map(tag => (
                                      <span key={tag} className="text-[10px] font-bold text-zinc-400 truncate max-w-[60px]">#{tag}</span>
                                    ))}
                                  </div>
                                )}
                            </div>
                          </>
                      )}

                      {!item.isPublic && (
                        <div className="absolute top-3 right-3 p-1.5 bg-zinc-900/80 backdrop-blur-md text-rose-400 rounded-full shadow-sm z-20">
                          <Lock size={12} />
                        </div>
                      )}
                      
                      {isEditing && (
                          <button 
                          onClick={(e) => handleDeleteGridRecord(item.id, e)}
                          className="absolute top-3 right-3 z-30 p-2.5 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 hover:scale-110 transition-all animate-in zoom-in-50"
                          >
                          <Trash2 size={16} />
                          </button>
                      )}
                  </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};

export default ArchiveView;