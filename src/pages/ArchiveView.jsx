import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, FolderOpen, Edit2, X as CloseIcon, Trash2, Calendar, Save, Plus, ChevronDown, ChevronUp, MapPin, MoreHorizontal, Heart, MessageCircle, Send, Bookmark, Globe, Lock, Disc, PlayCircle, Quote, Image as ImageIcon, Loader2, Link as LinkIcon, ExternalLink, AlertTriangle, LayoutGrid, ListMusic, GripVertical, Hash } from 'lucide-react';
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

const RecordDetailModal = ({ record, onClose, isAdmin, isGuestMode, tagTree, apiFetch, fetchAllData, showToast }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tagIds, setTagIds] = useState([]);
  const [date, setDate] = useState('');
  
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null); 
  
  const [youtubeUrl, setYoutubeUrl] = useState(''); 
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isTagExpanded, setIsTagExpanded] = useState(true);
  const [imageInputType, setImageInputType] = useState('file');
  const [isLoading, setIsLoading] = useState(false);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { user } = useAppStore(); 

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showDeleteConfirm) setShowDeleteConfirm(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, showDeleteConfirm]);

  useEffect(() => {
    setIsEditMode(false);
    setShowDeleteConfirm(false);
  }, [record?.id]);

  useEffect(() => {
    if (record && isEditMode) {
      setTitle(record.title);
      setDate(record.date?.replace(/\./g, '-') || '');
      
      const recordImage = record.image || record.imageUrl || '';
      setImageUrl(recordImage === DEFAULT_IMAGE ? '' : recordImage);
      setImageFile(null);
      setYoutubeUrl(record.youtubeUrl || ''); 
      setContent(record.content || '');
      setIsPublic(record.isPublic ?? true);
      setIsTagExpanded(true);

      const recordCategory = record.category || record.categoryName || '';
      const cat = tagTree.find(c => c.name === recordCategory);
      setCategoryId(cat ? cat.id : '');

      if (cat && cat.children) {
        const matchedTagIds = (record.tags || [])
            .map(tagName => cat.children.find(t => t.name === tagName)?.id)
            .filter(Boolean);
        setTagIds(matchedTagIds);
      } else {
        setTagIds([]);
      }
    }
  }, [record, isEditMode, tagTree]);

  if (!record) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !categoryId) {
      showToast('제목과 카테고리는 필수 입력 사항입니다.');
      return;
    }
    setIsLoading(true);
    try {
      const selectedCategory = tagTree.find(c => String(c.id) === String(categoryId));
      const numericTagIds = tagIds.map(id => Number(String(id).replace(/^(cat_|tag_)/, '')));

      let finalImageUrl = imageUrl;

      if (imageFile) {
        finalImageUrl = await new Promise((resolve) => {
           const reader = new FileReader();
           reader.onloadend = () => resolve(reader.result);
           reader.readAsDataURL(imageFile);
        });
      }

      const payload = {
        title: title.trim(),
        categoryId: selectedCategory?.id,
        categoryName: selectedCategory?.name || '분류 없음',
        recordDate: date.replace(/-/g, '.'),
        imageUrl: finalImageUrl?.trim(),
        youtubeUrl: selectedCategory?.name?.includes('음악') || selectedCategory?.name?.includes('URL') ? youtubeUrl.trim() : '',
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
      } else {
        showToast('수정에 실패했습니다.');
      }
    } catch (e) {
      console.error(e);
      showToast('서버 연결 중 오류가 발생했습니다.');
    } finally {
        setIsLoading(false);
    }
  };

  const executeDelete = async () => {
    try {
      const res = await apiFetch(`/me/records/${record.id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchAllData(true);
        showToast('기록이 삭제되었습니다.');
        onClose();
      }
    } catch(err) {
      console.error(err);
      showToast('삭제 중 오류가 발생했습니다.');
    }
  };

  const currentCategoryName = tagTree.find(c => String(c.id) === String(categoryId))?.name || '';
  const isEditMusicCat = currentCategoryName.includes('음악');
  const isEditUrlCat = currentCategoryName.includes('URL');
  
  const recordImage = record.image || record.imageUrl || '';
  const recordCategory = record.category || record.categoryName || '';

  return (
    <div className="fixed inset-0 z-[200] bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-in fade-in" onClick={onClose}>
      <div 
        className="bg-zinc-950 md:bg-zinc-900 rounded-2xl w-full max-w-5xl h-[75vh] flex flex-col md:flex-row overflow-hidden shadow-2xl border border-zinc-800 relative"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-[250] p-2 bg-black/50 hover:bg-white text-white hover:text-zinc-900 transition-colors rounded-full backdrop-blur-md shadow-lg border border-white/10">
            <CloseIcon size={20}/>
        </button>

        {showDeleteConfirm && (
          <div className="absolute inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in p-6 text-center">
             <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl">
                <AlertTriangle size={56} className="text-rose-500 mx-auto mb-4" />
                <h3 className="text-xl font-black text-white mb-2">정말 삭제하시겠습니까?</h3>
                <p className="text-sm text-zinc-400 mb-8">이 기록은 영구적으로 삭제되며 복구할 수 없습니다.</p>
                <div className="flex gap-3">
                    <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 bg-zinc-800 text-white hover:bg-zinc-700 rounded-xl font-bold transition">취소</button>
                    <button onClick={executeDelete} className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition">삭제하기</button>
                </div>
             </div>
          </div>
        )}

        <div className="w-full md:w-[55%] lg:w-[60%] h-64 md:h-full flex items-center justify-center relative border-r border-zinc-800 shrink-0 bg-black">
            {isEditMode ? (
                 <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-zinc-900">
                     <p className="text-zinc-400 mb-4 font-bold text-sm">이미지/영상 미리보기</p>
                     
                     {isEditMusicCat && getYoutubeId(youtubeUrl) ? (
                         <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-xl border border-zinc-700 bg-black">
                             <img src={`https://img.youtube.com/vi/${getYoutubeId(youtubeUrl)}/hqdefault.jpg`} alt="youtube thumbnail" className="max-w-full max-h-full object-contain" />
                         </div>
                     ) : isEditUrlCat && youtubeUrl ? (
                         <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden rounded-xl border border-zinc-700 bg-black p-6 text-center">
                             {getDomain(youtubeUrl) ? (
                                <img 
                                  src={`https://www.google.com/s2/favicons?domain=${getDomain(youtubeUrl)}&sz=128`} 
                                  onError={(e) => { 
                                      e.target.onerror = null; 
                                      e.target.src = `https://ui-avatars.com/api/?name=${getDomain(youtubeUrl)?.charAt(0)}&background=EFF6FF&color=4F46E5&bold=true&size=128`; 
                                  }}
                                  className="w-20 h-20 bg-white p-2 rounded-2xl mb-4" 
                                  alt="favicon" 
                                />
                             ) : <LinkIcon size={48} className="text-zinc-500 mb-4" />}
                             <span className="text-zinc-400 font-bold">{getDomain(youtubeUrl)}</span>
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
            ) : record.videoId ? (
                <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${record.videoId}?autoplay=1`} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full border-none outline-none"></iframe>
            ) : record.isUrlItem ? (
                <div className="w-full h-full bg-gradient-to-br from-blue-900 via-zinc-900 to-black flex flex-col items-center justify-center p-10 text-center relative overflow-hidden">
                    {record.youtubeUrl && record.domain ? (
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-3xl p-4 shadow-2xl mb-6 flex items-center justify-center transform hover:scale-105 transition-transform z-10">
                            <img 
                                src={`https://www.google.com/s2/favicons?domain=${record.domain}&sz=128`} 
                                onError={(e) => { 
                                    e.target.onerror = null; 
                                    e.target.src = `https://ui-avatars.com/api/?name=${record.domain?.charAt(0)}&background=EFF6FF&color=4F46E5&bold=true&size=128`; 
                                }} 
                                alt="favicon" 
                                className="w-full h-full object-contain" 
                            />
                        </div>
                    ) : <LinkIcon size={80} className="text-blue-400 mb-6 z-10" />}
                    
                    <h2 className="text-2xl md:text-4xl font-black text-white leading-tight tracking-tight drop-shadow-lg mb-4 z-10">{record.title}</h2>
                    {record.content && <p className="text-zinc-400 text-base md:text-lg font-medium leading-relaxed max-w-md line-clamp-3 z-10">{record.content}</p>}
                    
                    {record.youtubeUrl && (
                        <div className="mt-8 flex flex-col items-center justify-center gap-6 bg-white/5 p-5 md:p-6 rounded-[2rem] backdrop-blur-md border border-white/10 z-10">
                            <div className="flex flex-col items-center text-center">
                                <p className="text-zinc-300 font-bold text-sm mb-3">아래 버튼을 눌러 웹사이트로 이동하세요.</p>
                                <a href={record.youtubeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-colors shadow-lg shadow-blue-900/50 font-black text-base md:text-lg">
                                    <ExternalLink size={20} /> 웹사이트 방문하기
                                </a>
                            </div>
                        </div>
                    )}
                    <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none" />
                    <div className="absolute top-20 -left-20 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />
                </div>
            ) : record.isTextOnly ? (
                <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-zinc-900 to-black flex flex-col items-center justify-center p-10 text-center relative overflow-hidden">
                    <Quote size={80} className="absolute -top-4 -left-4 text-white/5" />
                    <Quote size={80} className="absolute -bottom-4 -right-4 text-white/5 rotate-180" />
                    <h2 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-lg mb-6">{record.title}</h2>
                    {record.content && <p className="text-zinc-300 text-lg md:text-xl font-medium leading-relaxed max-w-md line-clamp-6">"{record.content}"</p>}
                </div>
            ) : (
                <img src={recordImage} onError={(e) => { e.target.src = DEFAULT_IMAGE; }} alt={record.title} className="w-full h-full object-contain" />
            )}
        </div>

        <div className="w-full md:w-[45%] lg:w-[40%] flex flex-col h-full bg-zinc-950 text-zinc-200 overflow-hidden relative z-10">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-800 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-700">
                         {user?.profileImageUrl ? <img src={user.profileImageUrl} alt="profile" className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-zinc-400">{user?.name?.charAt(0) || '?'}</span>}
                    </div>
                    <div className="leading-tight">
                        <p className="text-sm font-bold text-white flex items-center gap-1.5">{user?.handle || 'User'} <span className="text-[10px] text-zinc-500 font-medium tracking-wider">• {recordCategory}</span></p>
                        {user?.location && <p className="text-[10px] text-zinc-400">{user.location}</p>}
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    {!isEditMode && isAdmin && !isGuestMode && (
                        <div className="flex items-center gap-1 mr-6 md:mr-0">
                            <button onClick={() => setIsEditMode(true)} className="p-2 text-zinc-400 hover:text-white transition-colors" title="수정"><Edit2 size={16}/></button>
                            <button onClick={() => setShowDeleteConfirm(true)} className="p-2 text-zinc-400 hover:text-rose-500 transition-colors" title="삭제"><Trash2 size={16}/></button>
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

                        {isEditMusicCat || isEditUrlCat ? (
                          <div className={`p-3 border rounded-lg ${isEditMusicCat ? 'bg-red-950/30 border-red-900/50' : 'bg-indigo-950/30 border-indigo-900/50'}`}>
                            <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 ${isEditMusicCat ? 'text-red-500' : 'text-indigo-400'}`}>
                                {isEditMusicCat ? '유튜브 URL 연결' : '웹사이트 링크 (URL)'}
                            </label>
                            <input type="text" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} placeholder="https://..." className={`w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white outline-none transition-colors ${isEditMusicCat ? 'focus:border-red-500/50' : 'focus:border-indigo-500/50'}`} />
                          </div>
                        ) : null}

                        {!isEditMusicCat && !isEditUrlCat && (
                          <div>
                              <div className="flex items-center justify-between mb-1.5">
                                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">이미지 소스</label>
                                  <div className="flex bg-zinc-800 p-0.5 rounded-md">
                                      <button type="button" onClick={() => setImageInputType('file')} className={`px-2 py-0.5 text-[10px] font-bold rounded transition ${imageInputType === 'file' ? 'bg-zinc-600 text-white' : 'text-zinc-500'}`}>파일</button>
                                      <button type="button" onClick={() => setImageInputType('url')} className={`px-2 py-0.5 text-[10px] font-bold rounded transition ${imageInputType === 'url' ? 'bg-zinc-600 text-white' : 'text-zinc-500'}`}>URL</button>
                                  </div>
                              </div>
                              {imageInputType === 'file' ? (
                                  <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-400 file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-bold file:bg-zinc-700 file:text-white hover:file:bg-zinc-600 cursor-pointer" />
                              ) : (
                                  <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="선택: 새 이미지 URL을 입력하거나 비워두세요." className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white outline-none" />
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
                          <button type="button" onClick={() => setIsPublic(!isPublic)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${isPublic ? 'bg-indigo-500' : 'bg-zinc-600'}`}>
                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isPublic ? 'translate-x-5' : 'translate-x-1'}`} />
                          </button>
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in duration-300">
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700">
                                {user?.profileImageUrl ? <img src={user.profileImageUrl} alt="profile" className="w-full h-full object-cover" /> : <span className="w-full h-full flex items-center justify-center text-xs font-bold text-zinc-400">{user?.name?.charAt(0) || '?'}</span>}
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
                                
                                {record.isUrlItem && record.youtubeUrl && (
                                    <div className="mt-4">
                                        <a href={record.youtubeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 text-blue-300 hover:bg-blue-500/40 hover:text-white rounded-lg transition-colors text-xs font-bold border border-blue-500/30">
                                            <LinkIcon size={12} /> 바로가기
                                        </a>
                                    </div>
                                )}

                                <div className="mt-4 flex flex-wrap gap-1.5">
                                    {(record.tags || []).map(tag => <span key={tag} className="text-xs font-medium text-[#E0F2FE] hover:text-white cursor-pointer transition-colors">#{tag}</span>)}
                                </div>
                                <div className="mt-3 text-[11px] text-zinc-500 font-medium">{record.date}</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {isEditMode ? (
                 <div className="p-4 border-t border-zinc-800 bg-zinc-950 shrink-0">
                    <div className="flex gap-2">
                        <button onClick={() => setIsEditMode(false)} className="flex-1 py-2.5 bg-zinc-900 text-zinc-300 border border-zinc-800 rounded-lg font-bold text-sm hover:bg-zinc-800 transition">취소</button>
                        <button onClick={handleSave} disabled={isLoading} className={`flex-1 py-2.5 rounded-lg font-black text-sm transition flex items-center justify-center gap-2 ${isLoading ? 'bg-zinc-400 text-zinc-800 cursor-not-allowed' : 'bg-zinc-100 text-zinc-900 hover:bg-white'}`}>
                            {isLoading && <Loader2 size={16} className="animate-spin" />}
                            {isLoading ? '저장 중...' : '저장 완료'}
                        </button>
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
  // 🏷️ 새로운 상태: 현재 선택된 카테고리의 활성 태그 필터
  const [activeTag, setActiveTag] = useState('전체');

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // 🎵 음악 카테고리 전용 뷰 모드 상태 (grid | list)
  const [musicViewMode, setMusicViewMode] = useState('grid'); 

  // 🔀 커스텀 재정렬용 목록 상태
  const [customOrderedRecords, setCustomOrderedRecords] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);

  // ✍️ 순위 직접 수정 입력 상태
  const [editingRankId, setEditingRankId] = useState(null);
  const [rankInputValue, setRankInputValue] = useState('');

  useEffect(() => {
    fetchAllData(true); 
  }, [fetchAllData]);

  useEffect(() => {
    if (isGuestMode) setIsEditing(false);
  }, [isGuestMode]);

  const executeGridDelete = async () => {
    if (!confirmDeleteId || !apiFetch) return;
    try {
      const res = await apiFetch(`/me/records/${confirmDeleteId}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchAllData(true);
        showToast('기록이 보관함에서 삭제되었습니다.');
      }
    } catch(err) {
      console.error(err);
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const categories = useMemo(() => {
    const uniqueCategories = new Set((records || []).map(r => r.category || r.categoryName).filter(Boolean));
    return ['전체', ...Array.from(uniqueCategories)];
  }, [records]);

  // 🏷️ 선택된 카테고리에 속한 태그 목록 추출
  const activeCategoryTags = useMemo(() => {
    if (activeCategory === '전체') return [];
    const catNode = tagTree.find(c => c.name === activeCategory);
    return catNode && catNode.children ? catNode.children.map(t => t.name) : [];
  }, [activeCategory, tagTree]);

  const displayRecords = useMemo(() => {
    let result = records || [];

    const isGuest = !isAdmin || isGuestMode; 
    if (isGuest) {
      result = result.filter(r => r.isPublic === true);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => 
          (r.title && r.title.toLowerCase().includes(q)) || 
          (r.content && r.content.toLowerCase().includes(q)) ||
          (r.tags && r.tags.some(t => t.toLowerCase().includes(q))) ||
          ((r.category || r.categoryName) && (r.category || r.categoryName).toLowerCase().includes(q))
      );
    }

    // 1. 카테고리 필터링
    if (activeCategory !== '전체') {
      result = result.filter(r => (r.category || r.categoryName) === activeCategory);
    }

    // 2. 🏷️ 태그 필터링
    if (activeTag !== '전체') {
      result = result.filter(r => (r.tags || []).includes(activeTag));
    }

    return result.map(item => {
        const catName = item.category || item.categoryName || '분류 없음';
        const imgUrl = item.image || item.imageUrl || '';
        const isMusic = catName.includes('음악');
        const isUrlItem = catName.includes('URL');
        const videoId = isMusic && item.youtubeUrl ? getYoutubeId(item.youtubeUrl) : null;
        const domain = isUrlItem && item.youtubeUrl ? getDomain(item.youtubeUrl) : null;
        const hasImage = imgUrl && imgUrl.trim() !== '' && imgUrl !== DEFAULT_IMAGE;
        const isTextOnly = !isMusic && !isUrlItem && !hasImage;

        return { ...item, isMusic, isUrlItem, videoId, domain, hasImage, isTextOnly, category: catName, image: imgUrl };
    });
  }, [records, searchQuery, activeCategory, activeTag, isGuestMode, isAdmin]);

  // displayRecords가 변경되면 customOrderedRecords에 동기화
  useEffect(() => {
    setCustomOrderedRecords(displayRecords);
  }, [displayRecords]);

  // 🔀 드래그 앤 드롭 순서 변경 핸들러
  const handleDragStart = (e, index) => {
    if (editingRankId) return; // 수정 중일 땐 드래그 방지
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
    showToast('순위가 재정렬되었습니다! 🎵');
  };

  // 🔼🔽 버튼을 통한 순서 이동 핸들러
  const handleMoveItem = (e, index, direction) => {
    e.stopPropagation();
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= customOrderedRecords.length) return;

    const updated = [...customOrderedRecords];
    const [movedItem] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, movedItem);

    setCustomOrderedRecords(updated);
  };

  // ✍️ 직접 번호 입력으로 순위 변경 핸들러
  const handleRankDirectChange = (id, currentIndex, newRankStr) => {
    setEditingRankId(null);
    const newRank = parseInt(newRankStr, 10);
    
    // 유효한 숫자가 아니면 무시
    if (isNaN(newRank)) return;

    let targetIndex = newRank - 1; 

    // 범위 보정 (너무 큰 숫자는 맨 끝으로, 0 이하는 맨 처음으로)
    if (targetIndex < 0) targetIndex = 0;
    if (targetIndex >= customOrderedRecords.length) targetIndex = customOrderedRecords.length - 1;

    // 제자리 이동이면 무시
    if (targetIndex === currentIndex) return;

    const updated = [...customOrderedRecords];
    const [movedItem] = updated.splice(currentIndex, 1);
    updated.splice(targetIndex, 0, movedItem);

    setCustomOrderedRecords(updated);
    showToast(`순위가 ${targetIndex + 1}위로 변경되었습니다! 🎵`);
  };

  if (!records || records.length === 0) {
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

  // 리스트 뷰 모드인지 확인 (음악 카테고리이면서 list 모드일 때만)
  const isListMode = activeCategory.includes('음악') && musicViewMode === 'list';

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 pb-24 md:pb-0 bg-[#F8FAFC] relative">
      
      {confirmDeleteId && (
        <div className="fixed inset-0 z-[300] bg-black/50 backdrop-blur-sm flex items-center justify-center animate-in fade-in p-4">
           <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full text-center">
               <AlertTriangle size={56} className="text-rose-500 mx-auto mb-4" />
               <h3 className="text-xl font-black text-zinc-900 mb-2">기록 삭제</h3>
               <p className="text-sm text-zinc-500 mb-8">선택한 기록을 정말 삭제하시겠습니까?<br/>삭제 후에는 복구할 수 없습니다.</p>
               <div className="flex gap-3">
                   <button onClick={() => setConfirmDeleteId(null)} className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-bold transition">취소</button>
                   <button onClick={executeGridDelete} className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold transition">삭제하기</button>
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

        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 items-center">
            <div className="flex-1 flex gap-2">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => {
                            setActiveCategory(cat);
                            setActiveTag('전체'); // 🏷️ 카테고리 변경 시 태그 필터 초기화
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

            {/* 🎵 음악 카테고리 전용 뷰 토글 스위치 */}
            {activeCategory.includes('음악') && (
                <div className="flex items-center gap-1 bg-white border border-zinc-200 rounded-lg p-1 shadow-sm shrink-0 ml-auto">
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
        </div>

        {/* 🏷️ 하위 태그 필터 바 */}
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
                {activeCategoryTags.map(tag => (
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
        
        {/* 리스트 모드일 때는 flex-col, 아닐 때는 기존 grid 유지 */}
        <div className={isListMode 
            ? "flex flex-col gap-3 pb-10 max-w-4xl mx-auto w-full"
            : "grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4 sm:gap-6 lg:gap-8 pb-10 justify-items-center"
        }>
            {customOrderedRecords.map((item, index) => {
                if (item.isMusic) {
                  const thumbnailUrl = item.videoId ? `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg` : MUSIC_DEFAULT_IMAGE;
                  
                  // 🎵 멜론 차트형 리스트 뷰 UI (드래그, 버튼, 그리고 ✍️직접 입력 지원)
                  if (isListMode) {
                      return (
                          <div 
                              key={item.id} 
                              draggable={!isEditing && editingRankId !== item.id}
                              onDragStart={(e) => handleDragStart(e, index)}
                              onDragOver={(e) => handleDragOver(e, index)}
                              onDrop={(e) => handleDrop(e, index)}
                              onClick={() => !isEditing && setSelectedRecord(item)} 
                              className={`group relative w-full flex items-center gap-3 sm:gap-4 p-3 bg-white border border-zinc-200/80 rounded-2xl shadow-sm cursor-pointer transition-all hover:shadow-md hover:border-indigo-200 ${draggedIndex === index ? 'opacity-40 border-dashed border-indigo-400' : ''} ${isEditing ? 'opacity-90' : ''}`}
                          >
                              {/* 드래그 핸들 (스팀 찜목록 스타일) */}
                              {!isEditing && (
                                  <div className="cursor-grab active:cursor-grabbing text-zinc-300 hover:text-zinc-600 p-1 shrink-0 transition-colors" title="드래그하여 순서 변경">
                                      <GripVertical size={18} />
                                  </div>
                              )}

                              {/* ✍️ 차트 순위 (직접 수정 가능) & 위/아래 조작 버튼 */}
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
                                              max={customOrderedRecords.length}
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
                                              disabled={index === customOrderedRecords.length - 1}
                                              className="p-0.5 text-zinc-400 hover:text-indigo-600 disabled:opacity-20 hover:bg-zinc-100 rounded"
                                              title="아래로 이동"
                                          >
                                              <ChevronDown size={12} />
                                          </button>
                                      </div>
                                  )}
                              </div>

                              {/* 썸네일 */}
                              <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-xl overflow-hidden border border-zinc-100 ml-1">
                                  <img src={thumbnailUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-zinc-900/80 rounded-full flex items-center justify-center backdrop-blur-sm shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                      <PlayCircle size={14} className="text-white/90 translate-x-[1px]" />
                                  </div>
                              </div>

                              {/* 음악 정보 */}
                              <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
                                  <div className="flex items-center gap-2 mb-0.5">
                                      <h3 className="text-sm sm:text-base font-black text-zinc-900 truncate group-hover:text-indigo-600 transition-colors">{item.title}</h3>
                                      {!item.isPublic && !isEditing && <Lock size={12} className="text-rose-400 shrink-0" />}
                                  </div>
                                  {item.content && <p className="text-xs text-zinc-500 truncate font-medium">{item.content}</p>}
                              </div>

                              {/* 우측 부가정보 및 버튼 */}
                              <div className="hidden sm:flex flex-col items-end gap-1.5 shrink-0 ml-4">
                                  <span className="text-[10px] font-bold text-zinc-400">{item.date}</span>
                                  <div className="flex gap-1.5">
                                      {(item.tags || []).slice(0, 2).map(tag => (
                                          <span key={tag} className="px-1.5 py-0.5 bg-zinc-50 border border-zinc-100 rounded-md text-[9px] font-bold text-zinc-500">#{tag}</span>
                                      ))}
                                  </div>
                              </div>

                              {/* 편집 모드 삭제 버튼 */}
                              {isEditing && (
                                  <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(item.id); }} className="p-2 sm:p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-colors ml-2 shrink-0">
                                      <Trash2 size={16} />
                                  </button>
                              )}
                          </div>
                      );
                  }

                  // 📀 기존 레코드판 그리드 뷰 UI
                  return (
                    <div key={item.id} onClick={() => !isEditing && setSelectedRecord(item)} className={`group relative w-full max-w-[280px] flex flex-col items-center justify-start cursor-pointer animate-in fade-in transition-all duration-500 ease-out ${!isEditing ? 'hover:-translate-y-1' : ''}`}>
                      <div className={`relative w-full aspect-square rounded-full overflow-hidden shadow-xl border-[6px] border-zinc-900 transition-transform duration-500 ease-out ${isEditing ? 'opacity-80 scale-100' : 'group-hover:scale-105 group-hover:shadow-2xl group-hover:border-zinc-800'}`}>
                        <img src={thumbnailUrl} alt={item.title} className={`w-full h-full object-cover scale-125 transition-transform duration-700 ease-out ${!isEditing ? 'group-hover:rotate-12 group-hover:scale-150' : ''}`} />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-zinc-900 rounded-full border-[3px] border-zinc-700 flex items-center justify-center shadow-inner">
                            <PlayCircle size={18} className="text-white/80 translate-x-[1px]" />
                        </div>
                        {isEditing && (
                            <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(item.id); }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 p-3 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 hover:scale-110 transition-all animate-in zoom-in-50">
                                <Trash2 size={20} />
                            </button>
                        )}
                      </div>
                      <div className="mt-4 text-center px-2">
                        <h3 className="text-sm font-black text-zinc-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">{item.title}</h3>
                        <p className="text-[10px] font-bold text-red-500 mt-1.5 flex items-center justify-center gap-1 uppercase tracking-widest"><Disc size={12} /> Record</p>
                      </div>
                      {!item.isPublic && !isEditing && <div className="absolute top-0 right-0 p-1.5 bg-zinc-900/80 backdrop-blur-md text-rose-400 rounded-full shadow-sm z-20"><Lock size={12} /></div>}
                    </div>
                  );
                }

                return (
                  <div key={item.id} onClick={() => { 
                      if (isEditing) return;
                      setSelectedRecord(item);
                  }} className={`group relative aspect-[4/5] w-full max-w-[280px] rounded-[1.5rem] overflow-hidden shadow-sm cursor-pointer border border-zinc-200/80 bg-white transition-all duration-500 ease-out transform flex flex-col ${!isEditing ? 'hover:scale-[1.03] hover:-translate-y-1 hover:shadow-xl hover:z-10 hover:border-indigo-300' : ''}`}>
                      {item.isUrlItem ? (
                          <div className="w-full h-full bg-gradient-to-br from-blue-50/80 via-white to-zinc-50/80 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden group/card">
                              <div className="absolute top-5 left-5 px-3 py-1.5 bg-blue-100/60 text-blue-700 text-[11px] font-black rounded-xl flex items-center gap-1.5 shadow-sm z-10"><LinkIcon size={12} /> {item.category}</div>
                              <div className="flex flex-col items-center w-full h-full justify-center mt-4">
                                  {item.youtubeUrl && item.domain ? (
                                      <div className="w-20 h-20 bg-white rounded-2xl shadow-md flex items-center justify-center p-3 mb-4 border border-zinc-100 transition-transform group-hover/card:scale-110">
                                          <img 
                                            src={`https://www.google.com/s2/favicons?domain=${item.domain}&sz=128`} 
                                            onError={(e) => { 
                                                e.target.onerror = null; 
                                                e.target.src = `https://ui-avatars.com/api/?name=${item.domain?.charAt(0)}&background=EFF6FF&color=4F46E5&bold=true&size=128`; 
                                            }} 
                                            className="w-full h-full object-contain" 
                                            alt="site logo" 
                                          />
                                      </div>
                                  ) : <div className="w-20 h-20 bg-blue-50 text-blue-300 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover/card:scale-110"><LinkIcon size={32} /></div>}
                                  <h3 className="text-lg font-black text-zinc-800 mb-2 leading-snug line-clamp-2 px-2 w-full">{item.title}</h3>
                                  <p className="text-[10px] font-bold text-zinc-400 mt-2 bg-white/80 px-3 py-1.5 rounded-lg border border-zinc-100 truncate max-w-[80%]" >{item.domain || '클릭하여 열기'}</p>
                              </div>
                          </div>
                      ) : item.isTextOnly ? (
                          <div className="w-full h-full bg-gradient-to-br from-indigo-50/60 via-white to-zinc-50/60 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                              <div className="absolute top-5 left-5 px-3 py-1.5 bg-indigo-100/60 text-indigo-600 text-[11px] font-black rounded-xl flex items-center gap-1.5 shadow-sm"><Quote size={12} /> {item.category}</div>
                              <h3 className="text-lg font-black text-zinc-800 mb-3 mt-6 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2 px-2">{item.title}</h3>
                              {item.content && <p className="text-xs font-medium text-zinc-500 line-clamp-3 leading-relaxed px-4">"{item.content}"</p>}
                          </div>
                      ) : (
                          <>
                            <div className="relative w-full flex-1 overflow-hidden bg-zinc-100">
                                <img src={item.image} onError={(e) => { e.target.src = DEFAULT_IMAGE; }} alt={item.title} className={`w-full h-full object-cover transition-transform duration-700 ease-out ${isEditing ? 'opacity-80 scale-100' : 'group-hover:scale-105'}`} />
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                                <div className="absolute top-4 left-4 px-3 py-1.5 bg-white/90 backdrop-blur-md text-indigo-600 text-[10px] font-black rounded-xl shadow-sm uppercase tracking-wider">{item.category}</div>
                            </div>
                            <div className="p-4 flex flex-col justify-center bg-white z-10 border-t border-zinc-100 shrink-0 h-[72px]">
                                <h4 className="text-sm font-black text-zinc-900 truncate group-hover:text-indigo-600 transition-colors">{item.title}</h4>
                                {(item.tags || []).length > 0 && (
                                  <div className="mt-1.5 flex flex-wrap gap-1.5 overflow-hidden h-4">
                                    {item.tags.slice(0, 2).map(tag => <span key={tag} className="text-[10px] font-bold text-zinc-400 truncate max-w-[80px]">#{tag}</span>)}
                                  </div>
                                )}
                            </div>
                          </>
                      )}

                      {!item.isPublic && <div className="absolute top-4 right-4 p-1.5 bg-zinc-900/80 backdrop-blur-md text-rose-400 rounded-full shadow-sm z-20"><Lock size={12} /></div>}
                      
                      {isEditing && (
                          <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(item.id); }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 p-3 bg-rose-50 text-white rounded-full shadow-lg hover:bg-rose-600 hover:scale-110 transition-all animate-in zoom-in-50">
                              <Trash2 size={20} />
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