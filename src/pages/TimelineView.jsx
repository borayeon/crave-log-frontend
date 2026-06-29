import React, { useState, useMemo } from 'react';
import { History, Network, ChevronDown, ChevronRight, Folder, FolderOpen, Hash, Trash2, Plus, X as CloseIcon, Edit2, Calendar } from 'lucide-react';
import { useAppStore, API_BASE_URL } from '../store/AppStore';
import EmptyState from '../components/common/EmptyState';

const TimelineView = () => {
  const { records, tagTree, isAdmin, setLoginModalOpen, showToast, fetchAllData, setAddRecordModalOpen } = useAppStore();
  const [selectedFilter, setSelectedFilter] = useState({ type: 'all', value: '전체', id: 'all' });
  const [expandedFolders, setExpandedFolders] = useState({ 'cat1': true, 'cat2': true, 'cat3': true, 'cat4': true });
  const [isEditing, setIsEditing] = useState(false);
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newTagNames, setNewTagNames] = useState({});

  if (records.length === 0 && tagTree.length === 0 && !isEditing) {
      return (
          <div className="h-full bg-[#F8FAFC]">
            <EmptyState 
                title="아직 발자취가 없어요" 
                icon={<History size={32}/>} 
                onAction={() => isAdmin ? setIsEditing(true) : setLoginModalOpen(true)}
                actionLabel={isAdmin ? "카테고리 만들기" : "로그인하고 시작하기"}
            />
          </div>
      );
  }

  const toggleFolder = (catId, e) => {
    e.stopPropagation();
    setExpandedFolders(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const res = await apiFetch(`${API_BASE_URL}/me/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim() })
      });
      if (res.ok) {
        await fetchAllData();
        setNewCategoryName('');
        showToast('새 카테고리가 추가되었습니다.');
      }
    } catch(e) { console.error(e); }
  };

  const handleAddTag = async (catId) => {
    const tagName = newTagNames[catId];
    if (!tagName || !tagName.trim()) return;
    
    const numericCatId = catId.replace('cat_', '');
    try {
      const res = await apiFetch(`${API_BASE_URL}/me/categories/${numericCatId}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tagName.trim() })
      });
      if (res.ok) {
        await fetchAllData();
        setNewTagNames(prev => ({ ...prev, [catId]: '' }));
        showToast('새 태그가 추가되었습니다.');
      }
    } catch(e) { console.error(e); }
  };

  const handleDeleteNode = async (type, parentId, nodeId, e) => {
    e.stopPropagation();
    const numericId = nodeId.replace(/^(cat_|tag_)/, '');
    
    try {
      const url = type === 'category' 
        ? `${API_BASE_URL}/me/categories/${numericId}`
        : `${API_BASE_URL}/me/tags/${numericId}`;
        
      const res = await apiFetch(url, { method: 'DELETE' });
      
      if (res.ok) {
        await fetchAllData();
        if(selectedFilter.id === nodeId) {
          if (type === 'category') setSelectedFilter({ type: 'all', value: '전체', id: 'all' });
          else setSelectedFilter({ type: 'category', value: tagTree.find(c=>c.id===parentId)?.name, id: parentId });
        }
        showToast('성공적으로 삭제되었습니다.');
      }
    } catch(e) { console.error(e); }
  };

  const filteredRecords = useMemo(() => {
    let filtered = records;
    if (selectedFilter.type === 'category') {
      const categoryNode = tagTree.find(c => c.id === selectedFilter.id);
      const childTagNames = categoryNode ? (categoryNode.children||[]).map(c => c.name) : [];
      filtered = records.filter(r => r.category === selectedFilter.value || (r.tags||[]).some(t => childTagNames.includes(t)));
    } else if (selectedFilter.type === 'tag') {
      filtered = records.filter(r => (r.tags||[]).includes(selectedFilter.value));
    }
    return [...filtered].sort((a, b) => {
        const dateA = new Date(a.date?.replace(/\./g, '-') || 0);
        const dateB = new Date(b.date?.replace(/\./g, '-') || 0);
        return dateB - dateA;
    });
  }, [records, selectedFilter, tagTree]);

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 pb-24 md:pb-0 bg-[#F8FAFC]">
      <header className="px-6 md:px-10 py-8 shrink-0 flex justify-between items-end border-b border-zinc-200/50">
        <div>
          <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Timeline</h2>
          <p className="text-xs font-bold text-zinc-500 mt-2 tracking-widest uppercase">시간의 흐름에 따라 기록된 나의 취향들</p>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${isEditing ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}
        >
          {isEditing ? <><CloseIcon size={14}/> 편집 완료</> : <><Edit2 size={14}/> 트리 편집</>}
        </button>
      </header>

      <div className="flex-1 px-6 md:px-10 py-8 overflow-hidden flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 shrink-0 flex flex-col h-[40vh] md:h-full border border-zinc-200/80 bg-white rounded-[2rem] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <FolderOpen size={14} className="text-indigo-500"/> Tag Explorer
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-hide">
            <button 
              onClick={() => setSelectedFilter({ type: 'all', value: '전체', id: 'all' })}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-bold transition-colors ${selectedFilter.type === 'all' ? 'bg-indigo-50 text-indigo-700' : 'text-zinc-600 hover:bg-zinc-100'}`}
            >
              <Network size={16} className={selectedFilter.type === 'all' ? 'text-indigo-600' : 'text-zinc-400'}/> 전체보기
            </button>

            {tagTree.map(cat => {
              const isCatSelected = selectedFilter.id === cat.id;
              const isExpanded = expandedFolders[cat.id];
              return (
                <div key={cat.id} className="pt-1">
                  <div className={`group flex items-center justify-between rounded-xl transition-colors ${isCatSelected ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-zinc-50 text-zinc-700'}`}>
                    <button onClick={() => setSelectedFilter({ type: 'category', value: cat.name, id: cat.id })} className="flex-1 flex items-center gap-2.5 px-3 py-2 text-sm font-bold truncate">
                      <span onClick={(e) => toggleFolder(cat.id, e)} className="p-0.5 rounded-md hover:bg-zinc-200/50 text-zinc-400 transition-transform">
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </span>
                      {isExpanded ? <FolderOpen size={16} className="text-indigo-400 shrink-0"/> : <Folder size={16} className="text-indigo-400 shrink-0"/>}
                      <span className="truncate">{cat.name}</span>
                    </button>
                    {isEditing && (
                      <button onClick={(e) => handleDeleteNode('category', null, cat.id, e)} className="p-2 opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 transition-opacity shrink-0">
                        <Trash2 size={14}/>
                      </button>
                    )}
                  </div>
                  {isExpanded && (
                    <div className="ml-8 mt-1 space-y-1 relative before:absolute before:left-[-11px] before:top-0 before:bottom-2 before:w-px before:bg-zinc-200">
                      {(cat.children || []).map(tag => {
                        const isTagSelected = selectedFilter.id === tag.id;
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
                            {isEditing && (
                              <button onClick={(e) => handleDeleteNode('tag', cat.id, tag.id, e)} className="p-1.5 opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 transition-opacity shrink-0 mr-1">
                                <Trash2 size={12}/>
                              </button>
                            )}
                          </div>
                        );
                      })}
                      {isEditing && (
                        <div className="relative flex items-center pl-3 py-1 pr-2 mt-1">
                          <div className="absolute left-[-11px] top-1/2 w-2.5 h-px bg-zinc-200" />
                          <input type="text" value={newTagNames[cat.id] || ''} onChange={(e) => setNewTagNames(prev => ({ ...prev, [cat.id]: e.target.value }))} placeholder="새 태그" className="flex-1 w-full bg-zinc-100 border-none rounded-md px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-400" onKeyDown={(e) => e.key === 'Enter' && handleAddTag(cat.id)} />
                          <button onClick={() => handleAddTag(cat.id)} className="ml-1 p-1 text-indigo-500 hover:bg-indigo-50 rounded-md"><Plus size={14}/></button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {isEditing && (
            <div className="p-3 border-t border-zinc-100 bg-zinc-50/50 flex gap-2">
              <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="새 폴더..." className="flex-1 min-w-0 bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()} />
              <button onClick={handleAddCategory} className="px-3 py-1.5 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition"><Plus size={16}/></button>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 overflow-y-auto pr-2 scrollbar-hide">
          {filteredRecords.length === 0 && (
            <div className="text-center py-20 text-zinc-400 font-bold bg-white rounded-[2rem] border border-zinc-200/80 border-dashed flex flex-col items-center gap-3">
              <FolderOpen size={32} className="text-zinc-300" />
              해당 태그의 기록이 없습니다.
              {isAdmin && (
                <button onClick={() => setAddRecordModalOpen(true)} className="mt-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm hover:bg-indigo-100 transition">
                  새 기록 추가하기
                </button>
              )}
            </div>
          )}

          <div className="relative border-l-2 border-dashed border-zinc-300 ml-4 md:ml-6 space-y-10 pb-10">
            {filteredRecords.map((item) => (
              <div key={item.id} className="relative pl-8 md:pl-10 group">
                <div className="absolute w-4 h-4 bg-white border-[4px] border-indigo-400 rounded-full -left-[9px] top-1 group-hover:border-indigo-600 group-hover:scale-125 transition-all duration-300 shadow-sm z-10" />
                <div className="bg-white border border-zinc-200/80 rounded-[2rem] p-4 md:p-6 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all duration-300 flex flex-col sm:flex-row gap-5 md:gap-6 items-center sm:items-start group-hover:-translate-y-1">
                  <div className="w-full sm:w-36 h-48 sm:h-36 shrink-0 rounded-[1.2rem] overflow-hidden bg-zinc-100 relative shadow-inner">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                    <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm text-zinc-900 text-[10px] font-black rounded-lg shadow-sm">{item.category}</div>
                  </div>
                  <div className="flex-1 w-full text-left py-1">
                    <div className="flex items-center gap-2 mb-2"><Calendar size={14} className="text-indigo-500" /><span className="text-sm font-black text-indigo-500 tracking-tight">{item.date}</span></div>
                    <h3 className="text-xl md:text-2xl font-black text-zinc-900 tracking-tight mb-4 group-hover:text-indigo-600 transition-colors">{item.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      {(item.tags || []).map(tag => <span key={tag} className="px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-[11px] font-bold text-zinc-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors">#{tag}</span>)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
export default TimelineView;