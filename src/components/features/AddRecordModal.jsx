import React, { useState } from 'react';
import { Sparkles, X as CloseIcon, Folder, Plus } from 'lucide-react';
import { useAppStore, API_BASE_URL } from '../../store/AppStore';

const AddRecordModal = () => {
  const { addRecordModalOpen, setAddRecordModalOpen, tagTree, fetchAllData, showToast, setViewMode } = useAppStore();
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tagIds, setTagIds] = useState([]);
  const [imageUrl, setImageUrl] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  if (!addRecordModalOpen) return null;

  const selectedCategory = tagTree.find(c => String(c.id) === String(categoryId));

  const handleSubmit = async () => {
    if (!title.trim() || !categoryId) { showToast('제목과 카테고리는 필수 입력 사항입니다.'); return; }
    try {
      const numericTagIds = tagIds.map(id => Number(String(id).replace(/^(cat_|tag_)/, '')));
      const payload = {
        title: title.trim(), categoryName: selectedCategory?.name || '분류 없음', recordDate: date.replace(/-/g, '.'),
        imageUrl: imageUrl || '[https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop)',
        isPublic: true, tagIds: numericTagIds
      };
      const res = await fetch(`${API_BASE_URL}/me/records`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) { 
        await fetchAllData(); showToast('새 기록이 성공적으로 추가되었습니다! 🎉'); setAddRecordModalOpen(false); 
        setTitle(''); setCategoryId(''); setTagIds([]); setImageUrl(''); 
      }
      else showToast('기록 추가에 실패했습니다.');
    } catch (e) { console.error(e); showToast('서버 연동 중 오류가 발생했습니다.'); }
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
                      <select value={categoryId} onChange={e=>{setCategoryId(e.target.value); setTagIds([]);}} className="w-full mt-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"><option value="">선택</option>{tagTree.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select>
                    </div>
                    <div><label className="text-xs font-black text-zinc-500 uppercase tracking-widest">날짜</label><input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full mt-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                  </div>
                  {selectedCategory && (selectedCategory.children || []).length > 0 && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                      <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">태그 달기</label>
                      <div className="mt-2 flex flex-wrap gap-2 p-4 bg-zinc-50 border border-zinc-200 rounded-xl max-h-32 overflow-y-auto">
                        {selectedCategory.children.map(tag => {
                          const isSelected = tagIds.includes(tag.id);
                          return <button key={tag.id} onClick={() => setTagIds(prev => isSelected ? prev.filter(id=>id!==tag.id) : [...prev, tag.id])} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isSelected ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-200/50'}`}>#{tag.name}</button>;
                        })}
                      </div>
                    </div>
                  )}
                  {selectedCategory && (selectedCategory.children || []).length === 0 && (<p className="text-xs font-bold text-rose-500 bg-rose-50 p-3 rounded-xl border border-rose-100">이 카테고리에는 아직 생성된 태그가 없습니다.</p>)}
                  <div><label className="text-xs font-black text-zinc-500 uppercase tracking-widest">이미지 URL (선택)</label><input type="text" value={imageUrl} onChange={e=>setImageUrl(e.target.value)} placeholder="https://..." className="w-full mt-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none" /><p className="text-[10px] font-medium text-zinc-400 mt-2">비워두시면 기본 이미지가 삽입됩니다.</p></div>
                </div>
                <button onClick={handleSubmit} className="w-full mt-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-sm transition duration-300 shadow-md flex items-center justify-center gap-2"><Plus size={18} /> 보관함에 기록 저장하기</button>
            </>
        )}
      </div>
    </div>
  );
};
export default AddRecordModal;
