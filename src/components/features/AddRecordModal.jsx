import React, { useState, useEffect } from 'react';
import { Sparkles, X as CloseIcon, Folder, Plus, ChevronDown, Globe, Lock, PlayCircle, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useAppStore } from '../../store/AppStore';

const AddRecordModal = () => {
  const { addRecordModalOpen, setAddRecordModalOpen, tagTree, fetchAllData, showToast, setViewMode, apiFetch } = useAppStore();
  
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tagIds, setTagIds] = useState([]);
  const [imageUrl, setImageUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState(''); // ⭐️ 유튜브 URL 상태 추가
  const [content, setContent] = useState(''); 
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [isTagExpanded, setIsTagExpanded] = useState(false);
  const [imageInputType, setImageInputType] = useState('file');

  // 선택된 카테고리 정보 찾기
  const selectedCategory = tagTree.find(c => String(c.id) === String(categoryId));

  // ⭐️ 핵심 수정: 모든 useEffect는 반드시 return null 보다 위(먼저)에 선언해야 합니다!
  useEffect(() => {
      if (selectedCategory && selectedCategory.name !== '음악') {
          setYoutubeUrl('');
      } else if (selectedCategory && selectedCategory.name === '음악') {
          setImageUrl(''); // 반대로 음악일 땐 이미지 초기화
      }
  }, [categoryId, selectedCategory]);

  // ⭐️ Hook 선언이 모두 끝난 후에 Early Return 처리
  if (!addRecordModalOpen) return null;

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

  const handleSubmit = async () => {
    if (!title.trim() || !categoryId) { showToast('제목과 카테고리는 필수 입력 사항입니다.'); return; }
    setIsLoading(true);
    
    try {
      const numericTagIds = tagIds.map(id => Number(String(id).replace(/^(cat_|tag_)/, '')));
      const payload = {
        title: title.trim(), 
        categoryName: selectedCategory?.name || '분류 없음', 
        recordDate: date.replace(/-/g, '.'),
        imageUrl: imageUrl || (selectedCategory?.name !== '음악' ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop' : ''),
        youtubeUrl: selectedCategory?.name === '음악' ? youtubeUrl.trim() : '',
        content: content.trim(),
        isPublic: isPublic, 
        tagIds: numericTagIds
      };
      
      const res = await apiFetch(`/me/records`, { method: 'POST', body: JSON.stringify(payload) });
      if (res.ok) { 
        await fetchAllData(); 
        showToast('새 기록이 성공적으로 추가되었습니다! 🎉'); 
        setAddRecordModalOpen(false); 
        setTitle(''); setCategoryId(''); setTagIds([]); setImageUrl(''); setYoutubeUrl(''); setContent(''); setIsPublic(true);
      }
      else showToast('기록 추가에 실패했습니다.');
    } catch (e) { 
        console.error(e); showToast('서버 연동 중 오류가 발생했습니다.'); 
    } finally {
        // ⭐️ 종료 시 로딩 해제
        setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/60 z-[150] flex justify-center items-center p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setAddRecordModalOpen(false)}>
      <div className="bg-white w-full max-w-md rounded-[2rem] p-8 flex flex-col shadow-2xl border border-zinc-100 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-zinc-900 tracking-tight flex items-center gap-2"><Sparkles size={20} className="text-indigo-500" /> 새 기록 추가</h2>
          <button onClick={() => setAddRecordModalOpen(false)} className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-full transition"><CloseIcon size={20}/></button>
        </div>

        {tagTree.length === 0 ? (
            <div className="text-center py-10">
                <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400 shadow-inner"><Folder size={24} /></div>
                <h3 className="text-lg font-black text-zinc-800 mb-2">카테고리가 필요해요!</h3>
                <p className="text-sm text-zinc-500 mb-8 leading-relaxed">기록을 분류할 폴더가 아직 없습니다.<br/>타임라인의 '트리 편집'에서 카테고리를 먼저 만들어주세요.</p>
                <button onClick={() => { setAddRecordModalOpen(false); setViewMode('timeline'); }} className="w-full py-3.5 bg-zinc-900 text-white rounded-xl font-bold text-sm shadow-md hover:bg-zinc-800 transition">타임라인으로 이동하기</button>
            </div>
        ) : (
            <>
                <div className="space-y-5">
                  <div><label className="text-xs font-black text-zinc-500 uppercase tracking-widest">제목 <span className="text-rose-500">*</span></label><input type="text" value={title} onChange={e=>setTitle(e.target.value)} placeholder="기억하고 싶은 이름" className="w-full mt-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">카테고리 폴더 <span className="text-rose-500">*</span></label>
                      <select value={categoryId} onChange={e=>{setCategoryId(e.target.value); setTagIds([]);setIsTagExpanded(true);}} className="w-full mt-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"><option value="">선택</option>{tagTree.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select>
                    </div>
                    <div><label className="text-xs font-black text-zinc-500 uppercase tracking-widest">날짜</label><input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full mt-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                  </div>
                  {selectedCategory && (selectedCategory.children || []).length > 0 && (
                    <div className="animate-in fade-in slide-in-from-top-2 bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden transition-all">
                      <button 
                        type="button"
                        onClick={() => setIsTagExpanded(!isTagExpanded)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-100/80 transition-colors outline-none"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">태그 달기</span>
                          {tagIds.length > 0 && (<span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md text-[10px] font-black">{tagIds.length}개 선택됨</span>)}
                        </div>
                        <ChevronDown size={16} className={`text-zinc-400 transition-transform duration-300 ${isTagExpanded ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {isTagExpanded && (
                        <div className="p-4 border-t border-zinc-200 flex flex-wrap gap-2 max-h-40 overflow-y-auto bg-white animate-in slide-in-from-top-1">
                          {selectedCategory.children.map(tag => {
                            const isSelected = tagIds.includes(tag.id);
                            return (
                              <button key={tag.id} type="button" onClick={() => setTagIds(prev => isSelected ? prev.filter(id=>id!==tag.id) : [...prev, tag.id])} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isSelected ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-200 ring-offset-1' : 'bg-zinc-50 text-zinc-600 border border-zinc-200 hover:bg-zinc-200/50'}`}>#{tag.name}</button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                  {selectedCategory && (selectedCategory.children || []).length === 0 && (<p className="text-xs font-bold text-rose-500 bg-rose-50 p-3 rounded-xl border border-rose-100">이 카테고리에는 아직 생성된 태그가 없습니다. 타임라인 트리 편집에서 태그를 먼저 추가해보세요.</p>)}
                  
                  {/* ⭐️ '음악' 카테고리 선택 시 UI 변경 */}
                  {selectedCategory?.name === '음악' ? (
                    <div className="animate-in fade-in slide-in-from-top-2 p-4 bg-red-50/50 border border-red-100 rounded-xl">
                      <label className="text-xs font-black text-red-600 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                        {/* ⭐️ Youtube 대신 PlayCircle 컴포넌트 사용 */}
                        <PlayCircle size={16} className="text-red-500" /> 유튜브 URL 연결
                      </label>
                      <input 
                        type="text" 
                        placeholder="https://www.youtube.com/watch?v=..." 
                        value={youtubeUrl}
                        onChange={e => setYoutubeUrl(e.target.value)}
                        className="w-full bg-white border border-red-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-red-500 outline-none shadow-sm"
                      />
                      <p className="text-[10px] text-red-500/70 font-bold mt-2 ml-1">유튜브 영상 링크를 붙여넣으면 아카이브에서 레코드판 디자인으로 렌더링됩니다. 🎵</p>
                    </div>
                  ) : (
                    <div className="animate-in fade-in">
                      <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                            <ImageIcon size={14} className="text-zinc-400" /> 이미지 첨부
                          </label>
                          <div className="flex bg-zinc-100 p-0.5 rounded-lg">
                              <button type="button" onClick={() => setImageInputType('file')} className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition ${imageInputType === 'file' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'}`}>파일</button>
                              <button type="button" onClick={() => setImageInputType('url')} className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition ${imageInputType === 'url' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'}`}>URL</button>
                          </div>
                      </div>

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
                          placeholder="https://..." 
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none" 
                          />
                      )}

                      {imageUrl && (
                        <div className="mt-3 w-32 h-32 rounded-xl overflow-hidden border border-zinc-200 shadow-sm relative group">
                           <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                           <button onClick={() => setImageUrl('')} className="absolute top-1.5 right-1.5 p-1 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><CloseIcon size={12}/></button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div>
                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">간단한 메모 (선택)</label>
                    <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="이 기록에 대해 남기고 싶은 이야기를 적어주세요." rows={3} className="w-full mt-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-medium text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
                  </div>

                  {/* ⭐️ 공개/비공개 토글 UI */}
                  <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200 rounded-xl">
                    <div>
                      <h4 className="text-sm font-bold text-zinc-800 flex items-center gap-1.5">
                        {isPublic ? <Globe size={16} className="text-indigo-500"/> : <Lock size={16} className="text-rose-500"/>}
                        {isPublic ? '전체 공개' : '나만 보기 (비공개)'}
                      </h4>
                      <p className="text-[10px] font-medium text-zinc-500 mt-1">
                        {isPublic ? '방문하는 모든 사람이 이 기록을 볼 수 있습니다.' : '나의 공간에서 나에게만 보입니다.'}
                      </p>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setIsPublic(!isPublic)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${isPublic ? 'bg-indigo-500' : 'bg-zinc-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPublic ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
          <button 
            onClick={handleSubmit} 
            disabled={isLoading}
            className={`w-full mt-8 py-4 rounded-xl font-black text-sm transition duration-300 shadow-md flex items-center justify-center gap-2 ${
                isLoading ? 'bg-indigo-400 text-white/80 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
        >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />} 
            {isLoading ? '처리 중...' : '보관함에 기록 저장하기'}
        </button>
            </>
        )}
      </div>
    </div>
  );
};

export default AddRecordModal;