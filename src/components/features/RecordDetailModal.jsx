import React, { useState, useEffect } from 'react';
import { 
  X as CloseIcon, AlertTriangle, Edit2, Trash2, Calendar, 
  ChevronDown, Globe, Lock, Link as LinkIcon, ExternalLink, 
  Quote, Image as ImageIcon, Loader2, Heart, MessageCircle, 
  Send, Bookmark, Users, KeyRound, ShieldCheck 
} from 'lucide-react';
import { useAppStore } from '../../store/AppStore';
import CustomDateRangePicker from '../common/CustomDateRangePicker';
import { DEFAULT_IMAGE, getYoutubeId, getDomain, getFaviconUrl, getFallbackAvatarUrl } from '../../utils/mediaUtils';
import { trackOutboundClick } from '../../utils/analyticsTracker';

const RecordDetailModal = ({ 
  record, 
  onClose, 
  isAdmin, 
  isGuestMode, 
  tagTree, 
  apiFetch, 
  fetchAllData, 
  showToast 
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tagIds, setTagIds] = useState([]);
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null); 
  
  const [youtubeUrl, setYoutubeUrl] = useState(''); 
  const [content, setContent] = useState('');
  
  // ⭐️ 4단계 공개 범위 레벨 (0: 전체공개, 1: 팔로워공개, 2: 비밀번호 잠금, 4: 나만보기)
  const [visibilityLevel, setVisibilityLevel] = useState(0);
  const [passcode, setPasscode] = useState('');
  
  const [isTagExpanded, setIsTagExpanded] = useState(true);
  const [imageInputType, setImageInputType] = useState('file');
  const [isLoading, setIsLoading] = useState(false);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { user, t, currentLang } = useAppStore(); 

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
      
      const recordDate = record.date || '';
      if (recordDate.includes('~')) {
        const [start, end] = recordDate.split('~').map(d => d.trim().replace(/\./g, '-'));
        setStartDate(start || '');
        setEndDate(end || '');
      } else {
        setStartDate(recordDate.replace(/\./g, '-'));
        setEndDate('');
      }
      
      const recordImage = record.image || record.imageUrl || '';
      setImageUrl(recordImage === DEFAULT_IMAGE ? '' : recordImage);
      setImageFile(null);
      setYoutubeUrl(record.youtubeUrl || ''); 
      setContent(record.content || '');
      const currentLevel = record.visibilityLevel !== undefined && record.visibilityLevel !== null
        ? record.visibilityLevel
        : (record.isPublic ?? true ? 0 : 4);
      setVisibilityLevel(currentLevel);
      setPasscode(record.passcode || '');
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
      showToast(t('record.required_fields', '제목과 카테고리는 필수 입력 사항입니다.'));
      return;
    }

    if (visibilityLevel === 2 && !passcode.trim()) {
      showToast(t('passcode.enter_pin', '비밀 공개(2단계) 시 열람 비밀번호를 입력해주세요.'));
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

      let formattedDate = startDate.replace(/-/g, '.');
      if (endDate && startDate !== endDate) {
        formattedDate += ` ~ ${endDate.replace(/-/g, '.')}`;
      }

      const payload = {
        title: title.trim(),
        categoryId: selectedCategory?.id,
        categoryName: selectedCategory?.name || (currentLang === 'zh' ? '未分类' : currentLang === 'en' ? 'Uncategorized' : '분류 없음'),
        recordDate: formattedDate,
        imageUrl: finalImageUrl?.trim(),
        youtubeUrl: (selectedCategory?.type === 'MUSIC' || selectedCategory?.type === 'URL' || selectedCategory?.name?.includes('음악') || selectedCategory?.name?.includes('URL')) ? youtubeUrl.trim() : '',
        content: content.trim(),
        isPublic: visibilityLevel === 0,
        visibilityLevel: visibilityLevel,
        passcode: visibilityLevel === 2 ? passcode.trim() : null,
        tagIds: numericTagIds
      };

      const res = await apiFetch(`/me/records/${record.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await fetchAllData(true);
        showToast(t('toast.saved', '기록이 성공적으로 수정되었습니다! ✨'));
        setIsEditMode(false);
      } else {
        showToast(currentLang === 'zh' ? '修改失败' : currentLang === 'en' ? 'Failed to update' : '수정에 실패했습니다.');
      }
    } catch (e) {
      console.error(e);
      showToast(t('auth.server_error', '서버 연결 중 오류가 발생했습니다.'));
    } finally {
      setIsLoading(false);
    }
  };

  const executeDelete = async () => {
    try {
      const res = await apiFetch(`/me/records/${record.id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchAllData(true);
        showToast(t('toast.deleted', '기록이 삭제되었습니다.'));
        onClose();
      }
    } catch (err) {
      console.error(err);
      showToast(t('auth.server_error', '삭제 중 오류가 발생했습니다.'));
    }
  };

  const recordImage = record.image || record.imageUrl || '';
  const recordCategory = record.category || record.categoryName || '';

  const viewCategory = tagTree.find(c => String(c.id) === String(record.categoryId) || c.name === recordCategory);
  const viewCatType = record.categoryType || viewCategory?.type || (recordCategory.includes('음악') ? 'MUSIC' : recordCategory.includes('URL') ? 'URL' : 'GENERAL');
  
  const isViewMusic = viewCatType === 'MUSIC';
  const isViewUrl = viewCatType === 'URL';
  const viewVideoId = isViewMusic && record.youtubeUrl ? getYoutubeId(record.youtubeUrl) : null;
  const viewDomain = isViewUrl && record.youtubeUrl ? getDomain(record.youtubeUrl) : null;
  const viewHasImage = recordImage && recordImage.trim() !== '' && recordImage !== DEFAULT_IMAGE;
  const isViewTextOnly = !isViewMusic && !isViewUrl && !viewHasImage;

  const currentCategory = tagTree.find(c => String(c.id) === String(categoryId));
  const editCatType = currentCategory?.type || (currentCategory?.name?.includes('음악') ? 'MUSIC' : currentCategory?.name?.includes('URL') ? 'URL' : 'GENERAL');
  const isEditMusicCat = editCatType === 'MUSIC';
  const isEditUrlCat = editCatType === 'URL';

  return (
    <div className="fixed inset-0 z-[200] bg-zinc-900/50 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-in fade-in" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl w-full max-w-5xl h-[75vh] flex flex-col md:flex-row overflow-hidden shadow-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-[250] p-2 bg-white/90 hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors rounded-full backdrop-blur-md shadow-sm border border-zinc-200">
          <CloseIcon size={20} />
        </button>

        {showDeleteConfirm && (
          <div className="absolute inset-0 z-[300] bg-white/90 backdrop-blur-sm flex items-center justify-center animate-in fade-in p-6 text-center">
            <div className="bg-white border border-zinc-200 rounded-3xl p-8 max-w-sm w-full shadow-2xl">
              <AlertTriangle size={56} className="text-rose-500 mx-auto mb-4" />
              <h3 className="text-xl font-black text-zinc-900 mb-2">{t('record.delete_confirm_title', '정말 삭제하시겠습니까?')}</h3>
              <p className="text-sm text-zinc-500 mb-8">{t('record.delete_confirm_desc', '이 기록은 영구적으로 삭제되며 복구할 수 없습니다.')}</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 rounded-xl font-bold transition">{t('common.cancel', '취소')}</button>
                <button onClick={executeDelete} className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold transition">{t('common.delete', '삭제하기')}</button>
              </div>
            </div>
          </div>
        )}

        <div className="w-full md:w-[55%] lg:w-[60%] h-64 md:h-full flex items-center justify-center relative border-r border-zinc-100 shrink-0 bg-zinc-50 overflow-hidden">
          {isEditMode ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-zinc-50/50">
              <p className="text-zinc-500 mb-4 font-bold text-sm">
                {currentLang === 'zh' ? '媒体预览' : currentLang === 'en' ? 'Media Preview' : '이미지/영상 미리보기'}
              </p>
              
              {isEditMusicCat && getYoutubeId(youtubeUrl) ? (
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
                  <img src={`https://img.youtube.com/vi/${getYoutubeId(youtubeUrl)}/hqdefault.jpg`} alt="youtube thumbnail" className="max-w-full max-h-full object-contain" />
                </div>
              ) : isEditUrlCat && youtubeUrl ? (
                <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 text-center shadow-sm">
                  {getDomain(youtubeUrl) ? (
                    <img 
                      src={getFaviconUrl(getDomain(youtubeUrl))} 
                      referrerPolicy="no-referrer"
                      onError={(e) => { 
                        e.target.onerror = null; 
                        e.target.src = getFallbackAvatarUrl(getDomain(youtubeUrl)); 
                      }}
                      className="w-20 h-20 bg-zinc-50 p-2 rounded-2xl mb-4 border border-zinc-100 object-contain" 
                      alt="favicon" 
                    />
                  ) : <LinkIcon size={48} className="text-zinc-400 mb-4" />}
                  <span className="text-zinc-600 font-bold">{getDomain(youtubeUrl)}</span>
                </div>
              ) : imageUrl ? (
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
                  <img src={imageUrl} alt="preview" className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <div className="w-full h-full border-2 border-dashed border-zinc-300 rounded-xl flex items-center justify-center text-zinc-400 bg-zinc-100/50 flex-col gap-2">
                  <ImageIcon size={24} className="opacity-50" />
                  <span>{t('record.no_image_text', '이미지 없음 (텍스트 전용)')}</span>
                </div>
              )}
            </div>
          ) : viewVideoId ? ( 
            <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${viewVideoId}?autoplay=1`} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full border-none outline-none"></iframe>
          ) : isViewUrl ? (
            <div className="w-full h-full bg-gradient-to-br from-blue-50/80 via-white to-zinc-50/80 flex flex-col items-center justify-center p-10 text-center relative overflow-hidden">
              {record.youtubeUrl && viewDomain ? (
                <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-3xl p-4 shadow-xl mb-6 flex items-center justify-center transform hover:scale-105 transition-transform z-10 border border-zinc-100">
                  <img 
                    src={getFaviconUrl(viewDomain)} 
                    referrerPolicy="no-referrer"
                    onError={(e) => { 
                      e.target.onerror = null; 
                      e.target.src = getFallbackAvatarUrl(viewDomain); 
                    }} 
                    alt="favicon" 
                    className="w-full h-full object-contain" 
                  />
                </div>
              ) : <LinkIcon size={80} className="text-blue-300 mb-6 z-10" />}
              
              <h2 className="text-2xl md:text-4xl font-black text-zinc-900 leading-tight tracking-tight drop-shadow-sm mb-4 z-10">{record.title}</h2>
              {record.content && <p className="text-zinc-500 text-base md:text-lg font-medium leading-relaxed max-w-md line-clamp-3 z-10">{record.content}</p>}
              
              {record.youtubeUrl && (
                <div className="mt-8 flex flex-col items-center justify-center gap-6 bg-white/50 p-5 md:p-6 rounded-[2rem] backdrop-blur-md border border-white/50 z-10 shadow-sm">
                  <div className="flex flex-col items-center text-center">
                    <p className="text-zinc-500 font-bold text-sm mb-3">{t('record.visit_website_guide', '아래 버튼을 눌러 웹사이트로 이동하세요.')}</p>
                    <a 
                      href={record.youtubeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      onClick={() => trackOutboundClick(record.youtubeUrl, record.title)}
                      className="inline-flex items-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded-full transition-colors shadow-sm font-black text-base md:text-lg"
                    >
                      <ExternalLink size={20} /> {t('record.visit_website_btn', '웹사이트 방문하기')}
                    </a>
                  </div>
                </div>
              )}
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
              <div className="absolute top-20 -left-20 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
            </div>
          ) : isViewTextOnly ? (
            <div className="w-full h-full bg-gradient-to-br from-indigo-50/60 via-white to-zinc-50/60 flex flex-col items-center justify-center p-10 text-center relative overflow-hidden">
              <Quote size={80} className="absolute -top-4 -left-4 text-indigo-100" />
              <Quote size={80} className="absolute -bottom-4 -right-4 text-indigo-100 rotate-180" />
              <h2 className="text-3xl md:text-5xl font-black text-zinc-900 leading-tight tracking-tight drop-shadow-sm mb-6">{record.title}</h2>
              {record.content && <p className="text-zinc-600 text-lg md:text-xl font-medium leading-relaxed max-w-md line-clamp-6">"{record.content}"</p>}
            </div>
          ) : (
            <img 
              src={recordImage} 
              referrerPolicy="no-referrer"
              onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_IMAGE; }} 
              alt={record.title} 
              className="w-full h-full object-contain bg-zinc-50" 
            />
          )}
        </div>

        {/* 우측 텍스트 정보 및 폼 영역 */}
        <div className="w-full md:w-[45%] lg:w-[40%] flex flex-col h-full bg-white text-zinc-800 overflow-hidden relative z-10">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-100 flex items-center justify-center shrink-0 border border-zinc-200">
                {user?.profileImageUrl ? <img src={user.profileImageUrl} alt="profile" className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-zinc-400">{user?.name?.charAt(0) || '?'}</span>}
              </div>
              <div className="leading-tight">
                <p className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">{user?.handle || 'User'} <span className="text-[10px] text-zinc-400 font-medium tracking-wider">• {recordCategory}</span></p>
                {user?.location && <p className="text-[10px] text-zinc-500">{user.location}</p>}
              </div>
            </div>

            <div className="flex items-center gap-1">
              {!isEditMode && isAdmin && !isGuestMode && (
                <div className="flex items-center gap-1 mr-6 md:mr-0">
                  <button onClick={() => setIsEditMode(true)} className="p-2 text-zinc-400 hover:text-indigo-500 transition-colors" title={t('common.edit', '수정')}><Edit2 size={16} /></button>
                  <button onClick={() => setShowDeleteConfirm(true)} className="p-2 text-zinc-400 hover:text-rose-500 transition-colors" title={t('common.delete', '삭제')}><Trash2 size={16} /></button>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
            {isEditMode ? (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">{t('record.title_label', '제목')} <span className="text-rose-500">*</span></label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-900 focus:bg-white focus:border-indigo-400 outline-none transition-colors shadow-sm" />
                </div>
                
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">{t('record.category_label', '카테고리')} <span className="text-rose-500">*</span></label>
                    <select 
                      value={categoryId} 
                      onChange={e => {
                        setCategoryId(e.target.value); 
                        setTagIds([]);
                        setIsTagExpanded(true);
                      }} 
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-900 focus:bg-white focus:border-indigo-400 outline-none appearance-none transition-colors shadow-sm"
                    >
                      <option value="">{t('record.select_folder_placeholder', '선택해주세요')}</option>
                      {tagTree.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                  </div>
                  
                  <div className="relative">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">{t('record.date_setting', '날짜 설정')}</label>
                    <div 
                      onClick={() => setShowDatePicker(!showDatePicker)}
                      className="w-full h-[46px] bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2.5 text-xs font-bold text-zinc-900 cursor-pointer flex items-center gap-2 shadow-sm hover:bg-white hover:border-indigo-400 transition-colors"
                    >
                      <Calendar size={14} className="text-indigo-500" />
                      {startDate} {endDate && startDate !== endDate ? ` ~ ${endDate}` : ''}
                    </div>
                    {showDatePicker && (
                      <CustomDateRangePicker 
                        startDate={startDate} 
                        endDate={endDate} 
                        onChange={(s, e) => { setStartDate(s); setEndDate(e); }} 
                        onClose={() => setShowDatePicker(false)} 
                      />
                    )}
                  </div>
                </div>
                
                {tagTree.find(c => String(c.id) === String(categoryId))?.children?.length > 0 && (
                  <div className="bg-zinc-50 border border-zinc-200 rounded-lg overflow-hidden shadow-sm">
                    <button 
                      type="button"
                      onClick={() => setIsTagExpanded(!isTagExpanded)}
                      className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-zinc-100 transition-colors"
                    >
                      <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">
                        {currentLang === 'zh' ? `修改标签 (${tagIds.length})` : currentLang === 'en' ? `Edit Tags (${tagIds.length})` : `태그 수정 (${tagIds.length})`}
                      </span>
                      <ChevronDown size={14} className={`text-zinc-400 transition-transform ${isTagExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isTagExpanded && (
                      <div className="p-3 border-t border-zinc-200 flex flex-wrap gap-2 max-h-40 overflow-y-auto bg-white">
                        {tagTree.find(c => String(c.id) === String(categoryId)).children.map(tag => {
                          const isSelected = tagIds.includes(tag.id);
                          return (
                            <button 
                              key={tag.id} type="button"
                              onClick={() => setTagIds(prev => isSelected ? prev.filter(id => id !== tag.id) : [...prev, tag.id])} 
                              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${isSelected ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 'bg-white border border-zinc-200 text-zinc-500 hover:bg-zinc-50'}`}
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
                  <div className={`p-3 border rounded-lg shadow-sm ${isEditMusicCat ? 'bg-rose-50 border-rose-100' : 'bg-indigo-50 border-indigo-100'}`}>
                    <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 ${isEditMusicCat ? 'text-red-500' : 'text-indigo-500'}`}>
                      {isEditMusicCat ? (currentLang === 'zh' ? '关联 YouTube 链接' : currentLang === 'en' ? 'YouTube Video URL' : '유튜브 URL 연결') : (currentLang === 'zh' ? '网页链接 (URL)' : currentLang === 'en' ? 'Website URL' : '웹사이트 링크 (URL)')}
                    </label>
                    <input type="text" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} placeholder="https://..." className={`w-full bg-white border rounded-lg px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors ${isEditMusicCat ? 'border-rose-200 focus:border-rose-400' : 'border-indigo-200 focus:border-indigo-400'}`} />
                  </div>
                ) : null}

                {!isEditMusicCat && !isEditUrlCat && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">{currentLang === 'zh' ? '图片来源' : currentLang === 'en' ? 'Image Source' : '이미지 소스'}</label>
                      <div className="flex bg-zinc-100 p-1 rounded-md border border-zinc-200">
                        <button type="button" onClick={() => setImageInputType('file')} className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all ${imageInputType === 'file' ? 'bg-white text-zinc-800 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}>{t('record.upload_file', '파일')}</button>
                        <button type="button" onClick={() => setImageInputType('url')} className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all ${imageInputType === 'url' ? 'bg-white text-zinc-800 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}>{t('record.input_url', 'URL')}</button>
                      </div>
                    </div>
                    {imageInputType === 'file' ? (
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-500 file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-bold file:bg-zinc-200 file:text-zinc-700 hover:file:bg-zinc-300 cursor-pointer shadow-sm" />
                    ) : (
                      <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder={t('record.image_url_placeholder', '선택: 새 이미지 URL을 입력하거나 비워두세요.')} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-900 focus:bg-white focus:border-indigo-400 outline-none shadow-sm placeholder:text-zinc-400" />
                    )}
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">{currentLang === 'zh' ? '正文' : currentLang === 'en' ? 'Content' : '본문'}</label>
                  <textarea value={content} onChange={e => setContent(e.target.value)} rows={5} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-900 focus:bg-white focus:border-indigo-400 outline-none resize-none transition-colors shadow-sm placeholder:text-zinc-400" />
                </div>
                
                {/* ⭐️ 4단계 공개 범위 설정 섹션 */}
                <div className="bg-white border border-zinc-200 rounded-xl p-3.5 mt-2 shadow-xs">
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-[10px] font-black text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-indigo-600" />
                      {t('record.visibility_title', '공개 범위 설정')}
                    </label>
                    <span className="text-[10px] font-bold text-zinc-500">
                      {visibilityLevel === 0 && `🌐 ${t('privacy.level0', '전체 공개')}`}
                      {visibilityLevel === 1 && `👥 ${t('privacy.level1', '팔로워 공개')}`}
                      {visibilityLevel === 2 && `🔐 ${t('privacy.level2', '비밀번호 잠금')}`}
                      {visibilityLevel === 4 && `🔒 ${t('privacy.level4', '나만 보기')}`}
                    </span>
                  </div>

                  {/* 4단계 버튼 그리드 */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {[
                      { level: 0, label: t('privacy.level0', '전체 공개'), icon: Globe, activeBg: 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500' },
                      { level: 1, label: t('privacy.level1', '팔로워 공개'), icon: Users, activeBg: 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500' },
                      { level: 2, label: t('privacy.level2', '비밀번호 잠금'), icon: KeyRound, activeBg: 'bg-amber-50 border-amber-500 text-amber-700 ring-1 ring-amber-500' },
                      { level: 4, label: t('privacy.level4', '나만 보기'), icon: Lock, activeBg: 'bg-rose-50 border-rose-500 text-rose-700 ring-1 ring-rose-500' },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isSelected = visibilityLevel === item.level;
                      return (
                        <button
                          key={item.level}
                          type="button"
                          onClick={() => setVisibilityLevel(item.level)}
                          className={`px-2 py-2 rounded-lg border text-[11px] font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 ${
                            isSelected 
                              ? `${item.activeBg} font-black shadow-xs` 
                              : 'bg-zinc-50/70 border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                          }`}
                        >
                          <Icon size={14} className={isSelected ? '' : 'text-zinc-400'} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* 2단계 비밀번호 입력창 */}
                  {visibilityLevel === 2 && (
                    <div className="mt-2.5 p-2.5 bg-amber-50/80 border border-amber-200/90 rounded-lg animate-in fade-in duration-200">
                      <label className="text-[10px] font-bold text-amber-900 flex items-center gap-1 mb-1">
                        <KeyRound size={12} className="text-amber-600" />
                        {t('record.passcode_label', '열람 비밀번호 (Passcode)')} <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        placeholder={t('record.passcode_placeholder', '숫자 또는 영문 (예: 1234)')}
                        maxLength={20}
                        className="w-full bg-white border border-amber-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-200 rounded-md px-2.5 py-1.5 text-xs font-bold text-zinc-800 outline-none transition-all shadow-2xs"
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in duration-300">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200">
                    {user?.profileImageUrl ? <img src={user.profileImageUrl} alt="profile" className="w-full h-full object-cover" /> : <span className="w-full h-full flex items-center justify-center text-xs font-bold text-zinc-400">{user?.name?.charAt(0) || '?'}</span>}
                  </div>
                  <div className="flex-1 pt-1">
                    <span className="text-sm font-bold text-zinc-900 mr-2">{user?.handle || 'User'}</span>
                    <span className="text-sm text-zinc-700 whitespace-pre-wrap leading-relaxed font-medium">
                      <span className="font-black text-zinc-900 mb-1 flex items-center gap-1.5">
                        {record.title}
                        {!record.isPublic && <Lock size={12} className="text-rose-500" title={t('privacy.level4', '비공개 기록')} />} 
                      </span>
                      {record.content}
                    </span>
                    
                    {record.isUrlItem && record.youtubeUrl && (
                      <div className="mt-4">
                        <a href={record.youtubeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors text-xs font-bold border border-blue-200 shadow-sm">
                          <LinkIcon size={12} /> {t('record.shortcut_btn', '바로가기')}
                        </a>
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {(record.tags || []).map(tag => <span key={tag} className="text-xs font-bold text-indigo-500 hover:text-indigo-600 cursor-pointer transition-colors">#{tag}</span>)}
                    </div>
                    <div className="mt-3 text-[11px] text-zinc-400 font-medium">{record.date}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {isEditMode ? (
            <div className="p-4 border-t border-zinc-100 bg-zinc-50/50 shrink-0">
              <div className="flex gap-2">
                <button onClick={() => setIsEditMode(false)} className="flex-1 py-2.5 bg-white text-zinc-600 border border-zinc-200 rounded-lg font-bold text-sm hover:bg-zinc-50 transition shadow-sm">{t('common.cancel', '취소')}</button>
                <button onClick={handleSave} disabled={isLoading} className={`flex-1 py-2.5 rounded-lg font-black text-sm transition flex items-center justify-center gap-2 shadow-sm ${isLoading ? 'bg-zinc-400 text-zinc-800 cursor-not-allowed' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}>
                  {isLoading && <Loader2 size={16} className="animate-spin" />}
                  {isLoading ? t('record.saving', '저장 중...') : t('record.save_done', '저장 완료')}
                </button>
              </div>
            </div>
          ) : (
            <div className="border-t border-zinc-100 p-4 shrink-0 bg-white">
              <div className="flex items-center justify-between mb-3 text-zinc-800">
                <div className="flex gap-4">
                  <button className="text-zinc-400 hover:text-rose-500 transition-colors"><Heart size={24} /></button>
                  <button className="text-zinc-400 hover:text-indigo-500 transition-colors"><MessageCircle size={24} /></button>
                  <button className="text-zinc-400 hover:text-indigo-500 transition-colors"><Send size={24} /></button>
                </div>
                <button className="text-zinc-400 hover:text-indigo-500 transition-colors"><Bookmark size={24} /></button>
              </div>
              <p className="text-sm font-bold text-zinc-900 mb-1">CraveLog Archive</p>
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest">{record.date}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecordDetailModal;
