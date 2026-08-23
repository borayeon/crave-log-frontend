import React, { useState, useMemo, useEffect } from 'react';
import { History, Network, ChevronDown, ChevronRight, Folder, FolderOpen, Hash, Trash2, Plus, X as CloseIcon, Edit2, Calendar, Lock, PlayCircle, Disc, Quote, ExternalLink, Link as LinkIcon, Loader2, GripVertical, ChevronLeft } from 'lucide-react';
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

// ⭐️ 에어비앤비/항공권 스타일 커스텀 달력 컴포넌트
const CustomDateRangePicker = ({ startDate, endDate, onChange, onClose }) => {
  const [currentDate, setCurrentDate] = useState(startDate ? new Date(startDate) : new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleDayClick = (day) => {
    const clickedDate = new Date(year, month, day);
    const formatted = `${clickedDate.getFullYear()}-${String(clickedDate.getMonth() + 1).padStart(2, '0')}-${String(clickedDate.getDate()).padStart(2, '0')}`;

    if (!startDate || (startDate && endDate)) {
      onChange(formatted, '');
    } else {
      const start = new Date(startDate);
      if (clickedDate < start) {
        onChange(formatted, '');
      } else if (formatted === startDate) {
        onChange(startDate, '');
      } else {
        onChange(startDate, formatted);
      }
    }
  };

  const isSelected = (day) => {
    const d = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return d === startDate || d === endDate;
  };

  const isInRange = (day) => {
    if (!startDate || !endDate) return false;
    const d = new Date(year, month, day);
    return d > new Date(startDate) && d < new Date(endDate);
  };

  return (
    <div className="bg-white border border-zinc-200 p-4 rounded-2xl shadow-xl w-[280px] absolute z-[300] mt-2 left-0" onClick={e => e.stopPropagation()}>
      <div className="flex justify-between items-center mb-4">
        <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-zinc-100 rounded-lg text-zinc-500 transition-colors"><ChevronLeft size={16}/></button>
        <span className="font-black text-sm text-zinc-800">{year}년 {month + 1}월</span>
        <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-zinc-100 rounded-lg text-zinc-500 transition-colors"><ChevronRight size={16}/></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] mb-2 text-zinc-400 font-bold uppercase">
        <div>일</div><div>월</div><div>화</div><div>수</div><div>목</div><div>금</div><div>토</div>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-sm">
        {blanks.map(b => <div key={`blank-${b}`} className="p-2"/>)}
        {days.map(day => {
          const selected = isSelected(day);
          const inRange = isInRange(day);
          const isStart = startDate === `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isEnd = endDate === `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          
          let bgClass = "hover:bg-zinc-100";
          let textClass = "text-zinc-700 font-medium";
          let roundedClass = "rounded-lg";

          if (selected) {
            bgClass = "bg-indigo-500 shadow-sm";
            textClass = "text-white font-black";
            if (isStart && endDate) roundedClass = "rounded-l-lg rounded-r-none";
            if (isEnd) roundedClass = "rounded-r-lg rounded-l-none";
            if (isStart && !endDate) roundedClass = "rounded-lg";
          } else if (inRange) {
            bgClass = "bg-indigo-50";
            textClass = "text-indigo-700 font-bold";
            roundedClass = "rounded-none";
          }

          return (
            <button
              key={day}
              type="button"
              onClick={() => handleDayClick(day)}
              className={`py-1.5 w-full flex items-center justify-center transition-colors ${bgClass} ${textClass} ${roundedClass}`}
            >
              {day}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex justify-between items-center border-t border-zinc-100 pt-3">
        <span className="text-[10px] font-bold text-zinc-400">{startDate && endDate ? '기간 설정됨' : '날짜 선택'}</span>
        <button type="button" onClick={onClose} className="text-xs font-black text-white bg-zinc-900 px-4 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors">적용</button>
      </div>
    </div>
  );
};

const RecordDetailModal = ({ record, onClose, isAdmin, isGuestMode, tagTree, apiFetch, fetchAllData, showToast }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tagIds, setTagIds] = useState([]);
  
  // ⭐️ 날짜 상태를 시작일과 종료일로 분리
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  
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
      
      // ⭐️ 기간 형태의 날짜(~)를 파싱하여 분리
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

      // ⭐️ 시작일과 종료일이 있으면 ~ 로 이어붙여서 포맷팅
      let formattedDate = startDate.replace(/-/g, '.');
      if (endDate && startDate !== endDate) {
        formattedDate += ` ~ ${endDate.replace(/-/g, '.')}`;
      }

      const payload = {
        title: title.trim(),
        categoryId: selectedCategory?.id,
        categoryName: selectedCategory?.name || '분류 없음',
        recordDate: formattedDate,
        imageUrl: finalImageUrl?.trim(),
        youtubeUrl: (selectedCategory?.type === 'MUSIC' || selectedCategory?.type === 'URL' || selectedCategory?.name?.includes('음악') || selectedCategory?.name?.includes('URL')) ? youtubeUrl.trim() : '',
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
            <CloseIcon size={20}/>
        </button>

        {showDeleteConfirm && (
          <div className="absolute inset-0 z-[300] bg-white/90 backdrop-blur-sm flex items-center justify-center animate-in fade-in p-6 text-center">
             <div className="bg-white border border-zinc-200 rounded-3xl p-8 max-w-sm w-full shadow-2xl">
                <AlertTriangle size={56} className="text-rose-500 mx-auto mb-4" />
                <h3 className="text-xl font-black text-zinc-900 mb-2">정말 삭제하시겠습니까?</h3>
                <p className="text-sm text-zinc-500 mb-8">이 기록은 영구적으로 삭제되며 복구할 수 없습니다.</p>
                <div className="flex gap-3">
                    <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 rounded-xl font-bold transition">취소</button>
                    <button onClick={executeDelete} className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold transition">삭제하기</button>
                </div>
             </div>
          </div>
        )}

        <div className="w-full md:w-[55%] lg:w-[60%] h-64 md:h-full flex items-center justify-center relative border-r border-zinc-100 shrink-0 bg-zinc-50 overflow-hidden">
            {isEditMode ? (
                 <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-zinc-50/50">
                     <p className="text-zinc-500 mb-4 font-bold text-sm">이미지/영상 미리보기</p>
                     
                     {isEditMusicCat && getYoutubeId(youtubeUrl) ? (
                         <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
                             <img src={`https://img.youtube.com/vi/${getYoutubeId(youtubeUrl)}/hqdefault.jpg`} alt="youtube thumbnail" className="max-w-full max-h-full object-contain" />
                         </div>
                     ) : isEditUrlCat && youtubeUrl ? (
                         <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 text-center shadow-sm">
                             {getDomain(youtubeUrl) ? (
                                <img 
                                  src={`https://icons.duckduckgo.com/ip3/${getDomain(youtubeUrl)}.ico`} 
                                  onError={(e) => { 
                                      e.target.onerror = null; 
                                      e.target.src = `https://ui-avatars.com/api/?name=${getDomain(youtubeUrl)?.charAt(0)}&background=EFF6FF&color=4F46E5&bold=true&size=128`; 
                                  }}
                                  className="w-20 h-20 bg-zinc-50 p-2 rounded-2xl mb-4 border border-zinc-100" 
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
                             <span>이미지 없음 (텍스트 전용)</span>
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
                                src={`https://icons.duckduckgo.com/ip3/${viewDomain}.ico`} 
                                onError={(e) => { 
                                    e.target.onerror = null; 
                                    e.target.src = `https://ui-avatars.com/api/?name=${viewDomain?.charAt(0)}&background=EFF6FF&color=4F46E5&bold=true&size=128`; 
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
                                <p className="text-zinc-500 font-bold text-sm mb-3">아래 버튼을 눌러 웹사이트로 이동하세요.</p>
                                <a href={record.youtubeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded-full transition-colors shadow-sm font-black text-base md:text-lg">
                                    <ExternalLink size={20} /> 웹사이트 방문하기
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
                <img src={recordImage} onError={(e) => { e.target.src = DEFAULT_IMAGE; }} alt={record.title} className="w-full h-full object-contain bg-zinc-50" />
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
                            <button onClick={() => setIsEditMode(true)} className="p-2 text-zinc-400 hover:text-indigo-500 transition-colors" title="수정"><Edit2 size={16}/></button>
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
                            <input type="text" value={title} onChange={e=>setTitle(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-900 focus:bg-white focus:border-indigo-400 outline-none transition-colors shadow-sm" />
                        </div>
                        
                        {/* ⭐️ 카테고리와 날짜를 세로(1열)로 넓게 배치하여 찌그러짐 방지 */}
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">카테고리 <span className="text-rose-500">*</span></label>
                                <select 
                                    value={categoryId} 
                                    onChange={e=>{
                                    setCategoryId(e.target.value); 
                                    setTagIds([]);
                                    setIsTagExpanded(true);
                                    }} 
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-900 focus:bg-white focus:border-indigo-400 outline-none appearance-none transition-colors shadow-sm"
                                >
                                    <option value="">선택해주세요</option>
                                    {tagTree.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                            </div>
                            
                            {/* ⭐️ 에어비앤비 스타일 커스텀 달력 렌더링 */}
                            <div className="relative">
                              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">날짜 설정</label>
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
                                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">태그 수정 ({tagIds.length})</span>
                                <ChevronDown size={14} className={`text-zinc-400 transition-transform ${isTagExpanded ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {isTagExpanded && (
                                <div className="p-3 border-t border-zinc-200 flex flex-wrap gap-2 max-h-40 overflow-y-auto bg-white">
                                {tagTree.find(c => String(c.id) === String(categoryId)).children.map(tag => {
                                    const isSelected = tagIds.includes(tag.id);
                                    return (
                                    <button 
                                        key={tag.id} type="button"
                                        onClick={() => setTagIds(prev => isSelected ? prev.filter(id=>id!==tag.id) : [...prev, tag.id])} 
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
                                {isEditMusicCat ? '유튜브 URL 연결' : '웹사이트 링크 (URL)'}
                            </label>
                            <input type="text" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} placeholder="https://..." className={`w-full bg-white border rounded-lg px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors ${isEditMusicCat ? 'border-rose-200 focus:border-rose-400' : 'border-indigo-200 focus:border-indigo-400'}`} />
                          </div>
                        ) : null}

                        {!isEditMusicCat && !isEditUrlCat && (
                          <div>
                              <div className="flex items-center justify-between mb-1.5">
                                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">이미지 소스</label>
                                  <div className="flex bg-zinc-100 p-1 rounded-md border border-zinc-200">
                                      <button type="button" onClick={() => setImageInputType('file')} className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all ${imageInputType === 'file' ? 'bg-white text-zinc-800 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}>파일</button>
                                      <button type="button" onClick={() => setImageInputType('url')} className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all ${imageInputType === 'url' ? 'bg-white text-zinc-800 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}>URL</button>
                                  </div>
                              </div>
                              {imageInputType === 'file' ? (
                                  <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-500 file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-bold file:bg-zinc-200 file:text-zinc-700 hover:file:bg-zinc-300 cursor-pointer shadow-sm" />
                              ) : (
                                  <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="선택: 새 이미지 URL을 입력하거나 비워두세요." className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-900 focus:bg-white focus:border-indigo-400 outline-none shadow-sm placeholder:text-zinc-400" />
                              )}
                          </div>
                        )}

                        <div>
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">본문</label>
                            <textarea value={content} onChange={e=>setContent(e.target.value)} rows={5} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-900 focus:bg-white focus:border-indigo-400 outline-none resize-none transition-colors shadow-sm placeholder:text-zinc-400" />
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-lg mt-2 shadow-sm">
                          <div>
                            <h4 className="text-[11px] font-bold text-zinc-700 flex items-center gap-1.5">
                              {isPublic ? <Globe size={14} className="text-indigo-500"/> : <Lock size={14} className="text-rose-500"/>}
                              {isPublic ? '전체 공개' : '나만 보기 (비공개)'}
                            </h4>
                          </div>
                          <button type="button" onClick={() => setIsPublic(!isPublic)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none shadow-inner ${isPublic ? 'bg-indigo-500' : 'bg-zinc-300'}`}>
                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${isPublic ? 'translate-x-5' : 'translate-x-1'}`} />
                          </button>
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
                                        {!record.isPublic && <Lock size={12} className="text-rose-500" title="비공개 기록" />} 
                                    </span>
                                    {record.content}
                                </span>
                                
                                {record.isUrlItem && record.youtubeUrl && (
                                    <div className="mt-4">
                                        <a href={record.youtubeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors text-xs font-bold border border-blue-200 shadow-sm">
                                            <LinkIcon size={12} /> 바로가기
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
                        <button onClick={() => setIsEditMode(false)} className="flex-1 py-2.5 bg-white text-zinc-600 border border-zinc-200 rounded-lg font-bold text-sm hover:bg-zinc-50 transition shadow-sm">취소</button>
                        <button onClick={handleSave} disabled={isLoading} className={`flex-1 py-2.5 rounded-lg font-black text-sm transition flex items-center justify-center gap-2 shadow-sm ${isLoading ? 'bg-zinc-400 text-zinc-800 cursor-not-allowed' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}>
                            {isLoading && <Loader2 size={16} className="animate-spin" />}
                            {isLoading ? '저장 중...' : '저장 완료'}
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

const TimelineView = () => {
  const { records, tagTree, isAdmin, setLoginModalOpen, showToast, fetchAllData, setAddRecordModalOpen, apiFetch, isGuestMode, searchQuery, isLoading } = useAppStore();
  
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

  const [orderedCategories, setOrderedCategories] = useState([]);
  const [draggedCatIndex, setDraggedCatIndex] = useState(null);

  if (isLoading && (!records || records.length === 0)) {
    return (
      <div className="w-full h-[70vh] flex flex-col items-center justify-center bg-[#F8FAFC]">
        <Loader2 size={40} className="text-indigo-500 animate-spin mb-4" />
        <h2 className="text-lg font-black text-zinc-800 tracking-tight">데이터를 불러오는 중입니다...</h2>
        <p className="text-sm text-zinc-500 font-medium mt-2">잠시만 기다려주세요</p>
      </div>
    );
  }

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
        
        {/* ========================================================
            ⭐️ 모바일 전용 가로형 필터 (편집 모드가 아닐 때만 보임)
            ======================================================== */}
        {!isEditing && (
          <div className="md:hidden flex flex-col gap-2 shrink-0 mb-2 w-full">
            {/* 1열: 카테고리 알약 버튼들 */}
            <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-2 -mx-4 px-4 sm:-mx-6 sm:px-6">
              <button 
                onClick={() => setSelectedFilter({ type: 'all', value: '전체', id: 'all' })}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold border transition-colors shadow-sm ${selectedFilter.type === 'all' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'}`}
              >
                <Network size={14}/> 전체보기
              </button>
              
              {orderedCategories.map(cat => {
                const catType = cat.type || (cat.name.includes('음악') ? 'MUSIC' : cat.name.includes('URL') ? 'URL' : 'GENERAL');
                const isSelected = selectedFilter.type === 'category' && String(selectedFilter.id) === String(cat.id) || (activeCategoryNode?.id === cat.id);
                
                return (
                  <button 
                    key={cat.id}
                    onClick={() => setSelectedFilter({ type: 'category', value: cat.name, id: cat.id })}
                    className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold border transition-colors shadow-sm ${isSelected ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'}`}
                  >
                    <span>{catType === 'MUSIC' ? '🎵' : catType === 'URL' ? '🔗' : '📁'}</span> {cat.name}
                  </button>
                );
              })}
            </div>

            {/* 2열: 선택된 카테고리의 하위 태그들 (존재할 때만 표시) */}
            {activeCategoryNode && activeCategoryNode.children?.length > 0 && (
              <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-2 -mx-4 px-4 sm:-mx-6 sm:px-6">
                 {(activeCategoryNode.children || []).map(tag => {
                    const isTagSelected = selectedFilter.type === 'tag' && String(selectedFilter.id) === String(tag.id);
                    return (
                      <button 
                        key={tag.id}
                        onClick={() => setSelectedFilter({ type: 'tag', value: tag.name, id: tag.id, parentId: activeCategoryNode.id })}
                        className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black transition-colors border ${isTagSelected ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-zinc-100/80 text-zinc-500 border-transparent hover:bg-zinc-200/80'}`}
                      >
                        <Hash size={12} className="opacity-60"/> {tag.name}
                      </button>
                    )
                 })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            ⭐️ 데스크탑 전용 및 편집용 사이드바 영역
            ======================================================== */}
        <div className={`w-full md:w-[320px] shrink-0 flex-col border border-zinc-200/80 bg-white rounded-[2rem] shadow-sm overflow-hidden transition-all duration-300 ${!isEditing ? 'hidden md:flex md:h-full md:max-h-full' : 'flex h-[60vh] max-h-[500px] md:h-full md:max-h-full mb-4 md:mb-0'}`}>
          
          <div className={`p-4 border-b flex items-center justify-between shrink-0 ${isEditing ? 'bg-rose-50/30 border-rose-100' : 'bg-zinc-50/50 border-zinc-100'}`}>
            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-zinc-600">
              <FolderOpen size={14} className={isEditing ? 'text-rose-500' : 'text-indigo-500'}/> 
              {isEditing ? '카테고리 관리자' : 'Tag Explorer'}
            </h3>
            {isEditing && <span className="px-2 py-0.5 bg-rose-100 text-rose-600 rounded-md text-[9px] font-black animate-pulse">편집 중</span>}
          </div>
          
          {/* 편집 모드 관리자 뷰 */}
          {isEditing ? (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50 min-h-0 scrollbar-hide">
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

                    <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-zinc-100 ml-6">
                      {(cat.children || []).map(tag => (
                        <div key={tag.id} className="group/tag flex items-center gap-1 pl-2.5 pr-1 py-1 bg-zinc-100 text-zinc-600 rounded-lg text-xs font-bold border border-zinc-200 hover:bg-rose-50 hover:border-rose-200 transition-colors">
                          <span>#{tag.name}</span>
                          <button onClick={(e) => handleDeleteNode('tag', cat.id, tag, e)} className="text-zinc-400 hover:text-rose-500 hover:bg-white rounded-md p-0.5 transition-colors"><CloseIcon size={12}/></button>
                        </div>
                      ))}
                      
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

              <div className="bg-white border border-dashed border-zinc-300 rounded-2xl p-4 flex flex-col gap-3 mt-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-400"></div>
                <div className="text-[11px] font-black text-indigo-500 flex items-center gap-1.5"><Plus size={14} strokeWidth={3}/> 카테고리 새로 만들기</div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <select 
                        value={newCategoryType} onChange={e=>setNewCategoryType(e.target.value)} disabled={isAddingCategory}
                        className="bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-2 text-xs font-bold outline-none focus:border-indigo-400 focus:bg-white text-zinc-700 shrink-0"
                    >
                        <option value="GENERAL">📁 일반</option>
                        <option value="MUSIC">🎵 음악</option>
                        <option value="URL">🔗 URL</option>
                    </select>
                    <input 
                        value={newCategoryName} onChange={e=>setNewCategoryName(e.target.value)} disabled={isAddingCategory}
                        onKeyDown={e=>{if(e.key==='Enter') handleAddCategory()}}
                        placeholder="카테고리 이름 지정"
                        className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-indigo-400 focus:bg-white placeholder:font-medium placeholder:text-zinc-400"
                    />
                </div>
                <button onClick={handleAddCategory} disabled={isAddingCategory || !newCategoryName.trim()} className="w-full py-2 bg-zinc-900 text-white rounded-lg text-xs font-black hover:bg-zinc-800 disabled:bg-zinc-300 disabled:text-zinc-500 transition-colors flex justify-center items-center gap-1.5 shadow-sm">
                    {isAddingCategory ? <Loader2 size={14} className="animate-spin" /> : '완료 및 추가'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-3 space-y-1 min-h-0 scrollbar-hide">
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

        {/* ⭐️ 타임라인 메인 목록 (세로 리스트, CD 모양 복구, 클릭 동작 통일) */}
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
                  
                  <div 
                    onClick={() => { 
                      if (isEditing) return;
                      // ⭐️ URL 아이템 클릭 시 새 창 열기로 동작 통일
                      if (item.isUrlItem && item.youtubeUrl) {
                          window.open(item.youtubeUrl, '_blank', 'noopener,noreferrer');
                          return;
                      }
                      // 다른 아이템들은 모달창
                      setSelectedRecord(item); 
                    }}
                    className={`bg-white border border-zinc-200/80 rounded-2xl p-3.5 md:p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 flex flex-col sm:flex-row gap-4 items-center sm:items-start group-hover:-translate-y-1 cursor-pointer ${isTextOnly ? 'bg-gradient-to-br from-white to-zinc-50/50' : ''}`}
                  >
                    
                    {/* 타입별 썸네일 영역 */}
                    {isMusic ? (
                      // ⭐️ CD 찌그러짐 현상 완벽 방어 (shrink-0, 고정 w/h)
                      <div className="w-24 h-24 sm:w-24 sm:h-24 md:w-28 md:h-28 shrink-0 overflow-hidden bg-zinc-100 relative shadow-inner rounded-full border-4 border-zinc-900 group-hover:rotate-12 transition-transform duration-700 mx-auto sm:mx-0">
                        <img 
                          src={videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : MUSIC_DEFAULT_IMAGE} 
                          onError={(e) => { e.target.src = MUSIC_DEFAULT_IMAGE; }} 
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
                              <span className="text-[9px] md:text-[10px] font-bold text-zinc-400 max-w-[80%] truncate">{getDomain(item.youtubeUrl)}</span>
                          </div>
                          {/* ⭐️ QR 없이 새 창 텍스트만 렌더링 */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 transition-opacity duration-300 group-hover/link:opacity-100 bg-blue-50/95 backdrop-blur-sm">
                              <ExternalLink size={32} className="text-blue-500 mb-2" />
                              <span className="text-[11px] font-black text-blue-600 bg-white px-3 py-1 rounded-md shadow-sm hidden sm:block">새 창으로 열기</span>
                          </div>
                          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-white/80 backdrop-blur-sm text-blue-700 text-[8px] font-black rounded-md shadow-sm uppercase tracking-wider border border-white/50 z-10">{item.category}</div>
                      </div>
                    ) : isTextOnly ? (
                      <div className="w-full h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 shrink-0 bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-100/50 rounded-xl flex items-center justify-center relative shadow-inner group-hover:shadow-md transition-shadow duration-300">
                         <Quote size={28} className="text-indigo-200 group-hover:text-indigo-300 transition-colors transform sm:-translate-y-2" />
                         <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-white/80 backdrop-blur-sm text-indigo-700 text-[8px] font-black rounded-md shadow-sm uppercase tracking-wider border border-white/50">{item.category}</div>
                      </div>
                    ) : (
                      <div className="w-full h-40 sm:w-24 sm:h-24 md:w-28 md:h-28 shrink-0 overflow-hidden bg-zinc-100 relative shadow-inner rounded-xl">
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
                      <div className="flex items-center gap-1.5 mb-1 sm:mb-1.5">
                        <Calendar size={12} className="text-indigo-500" />
                        <span className="text-[11px] md:text-xs font-black text-indigo-500 tracking-tight">{item.date}</span>
                      </div>
                      
                      <h3 className={`text-base md:text-lg font-black text-zinc-900 tracking-tight mb-1 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5 ${isTextOnly ? 'text-xl md:text-2xl mt-1' : ''}`}>
                        {isMusic && <Disc size={16} className="text-zinc-400 shrink-0" />}
                        <span className="truncate">{item.title}</span>
                        {!item.isPublic && <Lock size={14} className="text-rose-500 shrink-0" title="비공개 기록" />} 
                      </h3>
                      
                      {item.content && (
                        <p className={`text-xs text-zinc-500 font-medium truncate ${isTextOnly ? 'text-sm sm:text-base text-zinc-600 mb-3 whitespace-normal line-clamp-2 leading-relaxed' : 'mb-2'}`}>
                          {isTextOnly && <span className="text-indigo-300 font-serif text-lg leading-none mr-1">"</span>}
                          {item.content}
                          {isTextOnly && <span className="text-indigo-300 font-serif text-lg leading-none ml-1">"</span>}
                        </p>
                      )}
                      
                      <div className={`flex flex-wrap gap-1.5 ${isTextOnly && !item.content ? 'mt-3 sm:mt-4' : 'mt-auto'}`}>
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