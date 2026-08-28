import React, { useState, useEffect } from 'react';
import { Sparkles, X as CloseIcon, Folder, Plus, ChevronDown, ChevronLeft, ChevronRight, Globe, Lock, PlayCircle, Image as ImageIcon, Loader2, Link as LinkIcon, Calendar } from 'lucide-react';
import { useAppStore } from '../../store/AppStore';

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

const AddRecordModal = () => {
  const { addRecordModalOpen, setAddRecordModalOpen, tagTree, fetchAllData, showToast, setViewMode, apiFetch } = useAppStore();
  
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tagIds, setTagIds] = useState([]);
  
  // ⭐️ 즉석 새 태그 관리를 위한 State 추가
  const [newTags, setNewTags] = useState([]);
  const [newTagInput, setNewTagInput] = useState('');
  
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [imageUrl, setImageUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isTagExpanded, setIsTagExpanded] = useState(false);
  
  const [isAddingNewCat, setIsAddingNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const [imageInputType, setImageInputType] = useState('file');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (addRecordModalOpen) {
      setTitle('');
      setCategoryId('');
      setTagIds([]);
      setNewTags([]); // 창 열 때 초기화
      setNewTagInput('');
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate('');
      setShowDatePicker(false);
      setImageUrl('');
      setYoutubeUrl('');
      setContent('');
      setIsPublic(true);
      setIsTagExpanded(false);
      setIsAddingNewCat(false);
      setNewCatName('');
      setImageInputType('file');
      setIsLoading(false);
    }
  }, [addRecordModalOpen]);

  const selectedCategoryNode = categoryId ? tagTree.find(c => String(c.id) === String(categoryId)) : null;
  
  const isMusicCat = selectedCategoryNode?.name?.includes('음악');
  const isUrlCat = selectedCategoryNode?.name?.includes('URL');

  useEffect(() => {
      if (selectedCategoryNode && !isMusicCat && !isUrlCat) {
          setYoutubeUrl(''); 
      } else if (selectedCategoryNode && (isMusicCat || isUrlCat)) {
          setImageUrl(''); 
      }
  }, [categoryId, selectedCategoryNode, isMusicCat, isUrlCat]);

  if (!addRecordModalOpen) return null;

  const uploadImageToServer = async (file) => {
    setIsLoading(true); 
    const fileData = new FormData();
    fileData.append("file", file);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      const res = await fetch('https://api.cravelog.me/api/v1/files/upload', {
        method: 'POST',
        body: fileData,
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      const data = await res.json();
      
      if (res.ok) {
        const fullImageUrl = `https://api.cravelog.me${data.imageUrl}`;
        setImageUrl(fullImageUrl);
        showToast("이미지가 성공적으로 업로드되었습니다.");
      } else {
        showToast("이미지 업로드에 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
      showToast("서버와 연결할 수 없습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadImageToServer(file);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || (!categoryId && !newCatName.trim())) {
      showToast('제목과 카테고리는 필수 입력 사항입니다.');
      return;
    }

    if ((isMusicCat || isUrlCat) && !youtubeUrl.trim()) {
        showToast(isMusicCat ? '유튜브 영상 링크를 입력해주세요.' : '보관할 웹사이트 링크(URL)를 입력해주세요.');
        return;
    }
    
    setIsLoading(true);

    try {
      let finalCatName = '';
      if (categoryId) {
        finalCatName = tagTree.find(c => String(c.id) === String(categoryId))?.name || '분류 없음';
      } else if (newCatName.trim()) {
        finalCatName = newCatName.trim();
      }

      const numericTagIds = tagIds.map(id => {
        if (typeof id === 'string') return parseInt(id.replace(/[^0-9]/g, ''), 10);
        return id;
      }).filter(id => !isNaN(id));

      let formattedDate = startDate.replace(/-/g, '.');
      if (endDate && startDate !== endDate) {
        formattedDate += ` ~ ${endDate.replace(/-/g, '.')}`;
      }

      // ⭐️ 백엔드로 전송할 페이로드에 즉석 생성된 태그(newTags) 추가
      const payload = {
        title: title.trim(),
        categoryName: finalCatName,
        recordDate: formattedDate,
        imageUrl: imageUrl.trim() || (!(isMusicCat || isUrlCat) ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop' : ''),
        youtubeUrl: (isMusicCat || isUrlCat) ? youtubeUrl.trim() : '',
        content: content.trim(),
        isPublic: isPublic,
        tagIds: numericTagIds,
        newTags: newTags // <-- 여기서 백엔드로 새 태그들을 리스트로 전달합니다. (백엔드 DTO에 List<String> newTags 추가 필요)
      };

      const res = await apiFetch(`/me/records`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await fetchAllData(true);
        showToast('새로운 기록이 보관함에 추가되었습니다! ✨');
        setAddRecordModalOpen(false);
        setViewMode('archive');
      } else {
         showToast('기록 추가에 실패했습니다.');
      }
    } catch(err) {
      console.error(err);
      showToast('서버 연결 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-[200] bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-in fade-in" onClick={() => !isLoading && setAddRecordModalOpen(false)}>
      <div 
        className="bg-white rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[85vh] md:h-auto md:max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        <header className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between bg-white shrink-0">
          <h2 className="text-xl font-black text-zinc-900 flex items-center gap-2">
            <Sparkles size={20} className="text-indigo-500"/> 새 기록 추가하기
          </h2>
          <button onClick={() => !isLoading && setAddRecordModalOpen(false)} className="p-2 text-zinc-400 hover:text-zinc-800 bg-zinc-50 hover:bg-zinc-100 rounded-full transition-colors"><CloseIcon size={20}/></button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-zinc-50/30">
          
          <div>
            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block mb-2">제목 <span className="text-rose-500">*</span></label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="어떤 기록을 남길까요?" 
              className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-base font-bold text-zinc-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block">카테고리 분류 <span className="text-rose-500">*</span></label>
                <button 
                  type="button" 
                  onClick={() => setIsAddingNewCat(!isAddingNewCat)} 
                  className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md transition-colors"
                >
                  {isAddingNewCat ? '기존 카테고리 선택' : '+ 새 카테고리 만들기'}
                </button>
              </div>
              
              {isAddingNewCat ? (
                <input 
                  type="text" 
                  value={newCatName} 
                  onChange={e => {
                    setNewCatName(e.target.value);
                    setCategoryId('');
                  }} 
                  placeholder="새로운 카테고리 이름을 입력하세요" 
                  className="w-full bg-indigo-50/50 border border-indigo-200 rounded-xl px-4 py-3 text-sm font-bold text-indigo-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                />
              ) : (
                <div className="relative">
                  <Folder size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <select 
                    value={categoryId} 
                    onChange={e => {
                      setCategoryId(e.target.value); 
                      setTagIds([]);
                      setIsTagExpanded(true);
                    }} 
                    className="w-full bg-white border border-zinc-200 rounded-xl pl-11 pr-4 py-3 text-sm font-bold text-zinc-900 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none transition-all shadow-sm"
                  >
                    <option value="">보관할 폴더를 선택해주세요</option>
                    {tagTree.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>
              )}
            </div>

            <div className="relative">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block mb-2">날짜 설정</label>
              <div 
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="w-full h-[46px] bg-white border border-zinc-200 rounded-xl px-4 py-2 text-sm font-bold text-zinc-700 cursor-pointer flex items-center gap-2 shadow-sm hover:border-indigo-400 transition-colors"
              >
                <Calendar size={16} className="text-indigo-500" />
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

          {/* ⭐️ 태그 연결 영역 (즉석 추가 기능 포함) */}
          {(categoryId || isAddingNewCat) && (
            <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
              <button 
                type="button"
                onClick={() => setIsTagExpanded(!isTagExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 bg-zinc-50 hover:bg-zinc-100 transition-colors outline-none"
              >
                <span className="text-[11px] font-black text-zinc-600 uppercase tracking-widest">
                  태그 연결 (선택: {tagIds.length}개, 새 태그: {newTags.length}개)
                </span>
                <ChevronDown size={16} className={`text-zinc-400 transition-transform ${isTagExpanded ? 'rotate-180' : ''}`} />
              </button>
              
              {isTagExpanded && (
                <div className="p-4 border-t border-zinc-100 flex flex-col gap-5">
                  
                  {/* 기존 카테고리 태그 목록 */}
                  {!isAddingNewCat && selectedCategoryNode && (selectedCategoryNode.children || []).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedCategoryNode.children.map(tag => {
                        const isSelected = tagIds.includes(tag.id);
                        return (
                          <button 
                            key={tag.id} type="button"
                            onClick={() => setTagIds(prev => isSelected ? prev.filter(id=>id!==tag.id) : [...prev, tag.id])} 
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${isSelected ? 'bg-indigo-600 text-white border border-indigo-600' : 'bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'}`}
                          >
                            #{tag.name}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* ⭐️ 즉석 태그 입력 영역 */}
                  <div>
                    <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block mb-2">
                        + 즉석 태그 만들기
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      {newTags.map((tag, idx) => (
                        <span 
                            key={idx} 
                            onClick={() => setNewTags(prev => prev.filter((_, i) => i !== idx))}
                            className="group flex items-center gap-1 px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold rounded-lg cursor-pointer hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 transition-colors shadow-sm"
                        >
                            #{tag} <CloseIcon size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </span>
                      ))}
                      <input 
                        type="text"
                        value={newTagInput}
                        onChange={e => setNewTagInput(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ',') {
                                e.preventDefault();
                                const val = newTagInput.trim().replace(/^#/, '');
                                if (val && !newTags.includes(val)) setNewTags([...newTags, val]);
                                setNewTagInput('');
                            }
                        }}
                        onBlur={() => {
                            const val = newTagInput.trim().replace(/^#/, '');
                            if (val && !newTags.includes(val)) setNewTags([...newTags, val]);
                            setNewTagInput('');
                        }}
                        placeholder="+ 새 태그 입력 후 Enter"
                        className="flex-1 min-w-[150px] bg-white border border-dashed border-zinc-300 focus:border-solid focus:border-indigo-400 rounded-lg px-3 py-1.5 text-xs font-bold text-zinc-700 outline-none transition-all shadow-sm"
                      />
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

          {isMusicCat ? (
            <div className="p-4 bg-red-50/50 border border-red-100 rounded-xl shadow-sm">
              <label className="text-xs font-black text-red-600 uppercase tracking-widest block mb-2 flex items-center gap-1.5">
                <PlayCircle size={14}/> 유튜브 영상 링크 <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text" 
                value={youtubeUrl} 
                onChange={e => setYoutubeUrl(e.target.value)} 
                placeholder="https://www.youtube.com/watch?v=..." 
                className="w-full bg-white border border-red-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-red-500 outline-none transition-all" 
              />
               <p className="text-[10px] text-red-500/70 font-bold mt-2 ml-1">유튜브 영상 링크를 붙여넣으면 레코드판 디자인으로 렌더링됩니다. 🎵</p>
            </div>
          ) : isUrlCat ? (
            <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl shadow-sm">
              <label className="text-xs font-black text-indigo-600 uppercase tracking-widest block mb-2 flex items-center gap-1.5">
                <LinkIcon size={14}/> 웹사이트 링크 (URL) <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text" 
                value={youtubeUrl} 
                onChange={e => setYoutubeUrl(e.target.value)} 
                placeholder="https://velog.io/@... 등 저장할 링크" 
                className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
              />
              <p className="text-[10px] text-indigo-500/70 font-bold mt-2 ml-1">저장하고 싶은 블로그, 아티클, 포트폴리오 등의 링크를 붙여넣으세요. 🔗</p>
            </div>
          ) : null}

          {!isMusicCat && !isUrlCat && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block">사진 추가</label>
                <div className="flex bg-zinc-100 p-0.5 rounded-lg">
                    <button type="button" onClick={() => setImageInputType('file')} className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition ${imageInputType === 'file' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}>파일 업로드</button>
                    <button type="button" onClick={() => setImageInputType('url')} className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition ${imageInputType === 'url' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}>웹 URL</button>
                </div>
              </div>
              
              <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-sm flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-zinc-100 border border-zinc-200 overflow-hidden shrink-0 flex items-center justify-center border-dashed relative group">
                      {imageUrl ? (
                          <>
                            <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                            <button onClick={() => setImageUrl('')} className="absolute top-1.5 right-1.5 p-1 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><CloseIcon size={12}/></button>
                          </>
                      ) : (
                          <ImageIcon size={24} className="text-zinc-300" />
                      )}
                  </div>
                  
                  <div className="flex-1 w-full">
                      {imageInputType === 'file' ? (
                          <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleImageUpload} 
                              className="w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer transition-colors" 
                          />
                      ) : (
                          <input 
                              type="text" 
                              value={imageUrl} 
                              onChange={e => setImageUrl(e.target.value)} 
                              placeholder="선택: 새 이미지 URL을 입력하거나 비워두세요." 
                              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-bold text-zinc-900 focus:border-indigo-400 outline-none transition-colors" 
                          />
                      )}
                  </div>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block mb-2">간단한 메모 (선택)</label>
            <textarea 
              value={content} 
              onChange={e => setContent(e.target.value)} 
              rows={4} 
              placeholder="이 기록에 대해 남기고 싶은 이야기를 적어주세요."
              className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm font-medium text-zinc-900 focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-all shadow-sm" 
            />
          </div>

        </div>

        <footer className="px-6 py-5 border-t border-zinc-100 bg-white shrink-0 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center justify-between w-full sm:w-auto gap-4 p-4 sm:p-0 bg-zinc-50 sm:bg-transparent rounded-xl border sm:border-none border-zinc-200">
            <div>
              <h4 className="text-sm font-bold text-zinc-800 flex items-center gap-1.5 sm:hidden mb-1">
                 {isPublic ? <Globe size={16} className="text-indigo-500"/> : <Lock size={16} className="text-rose-500"/>}
                 {isPublic ? '전체 공개' : '나만 보기 (비공개)'}
              </h4>
              <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest hidden sm:block">공개 설정</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                type="button" 
                onClick={() => setIsPublic(!isPublic)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isPublic ? 'bg-indigo-500' : 'bg-zinc-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPublic ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className={`text-xs font-bold flex items-center gap-1 hidden sm:flex ${isPublic ? 'text-indigo-600' : 'text-zinc-500'}`}>
                {isPublic ? <><Globe size={12}/> 전체 공개</> : <><Lock size={12}/> 나만 보기</>}
              </span>
            </div>
          </div>

          <div className="w-full sm:w-auto flex gap-2">
            <button 
              onClick={() => !isLoading && setAddRecordModalOpen(false)} 
              className="flex-1 sm:flex-none px-6 py-3 bg-zinc-100 text-zinc-600 rounded-xl font-bold text-sm hover:bg-zinc-200 transition-colors"
            >
              취소
            </button>
            <button 
              onClick={handleSave} 
              disabled={isLoading}
              className={`flex-1 sm:flex-none px-8 py-3 rounded-xl font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                isLoading ? 'bg-indigo-400 text-white/80 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5'
              }`}
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {isLoading ? '저장 중...' : <Plus size={16} />}
              {isLoading ? '저장 중...' : '보관함에 저장하기'}
            </button>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default AddRecordModal;