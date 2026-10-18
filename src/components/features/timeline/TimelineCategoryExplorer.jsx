import { 
  Network, Hash, FolderOpen, Folder, Edit2, Lock, 
  Trash2, X as CloseIcon, GripVertical, Plus, ChevronDown, 
  ChevronRight, Loader2 
} from 'lucide-react';
import { useAppStore } from '../../../store/AppStore';

const TimelineCategoryExplorer = ({
  isEditing,
  selectedFilter,
  setSelectedFilter,
  orderedCategories,
  activeCategoryNode,
  editingCategoryId,
  setEditingCategoryId,
  editCategoryName,
  setEditCategoryName,
  handleUpdateCategory,
  handleDeleteNode,
  handleCatDragStart,
  handleCatDragOver,
  handleCatDrop,
  draggedCatIndex,
  newTagNames,
  setNewTagNames,
  handleAddTag,
  isAddingTag,
  newCategoryType,
  setNewCategoryType,
  newCategoryName,
  setNewCategoryName,
  handleAddCategory,
  isAddingCategory,
  expandedFolders,
  toggleFolder
}) => {
  const { t, currentLang } = useAppStore();

  return (
    <>
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
              <Network size={14}/> {t('common.all', '전체보기')}
            </button>
            
            {orderedCategories.map(cat => {
              const catType = cat.type || (cat.name.includes('음악') ? 'MUSIC' : cat.name.includes('URL') ? 'URL' : 'GENERAL');
              const isSelected = (selectedFilter.type === 'category' && String(selectedFilter.id) === String(cat.id)) || (activeCategoryNode?.id === cat.id);
              
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
                  );
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
            {isEditing ? t('timeline.explorer_title', '카테고리 관리자') : t('timeline.explorer_tag', 'Tag Explorer')}
          </h3>
          {isEditing && <span className="px-2 py-0.5 bg-rose-100 text-rose-600 rounded-md text-[9px] font-black animate-pulse">{t('timeline.editing_badge', '편집 중')}</span>}
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
                      <div className="cursor-grab active:cursor-grabbing text-zinc-300 hover:text-zinc-600 p-1 shrink-0 transition-colors" title={currentLang === 'zh' ? '拖拽调整顺序' : currentLang === 'en' ? 'Drag to reorder' : '드래그하여 순서 변경'}>
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
                            <div className="p-1.5 text-zinc-300 bg-zinc-50 rounded-lg border border-zinc-100 cursor-not-allowed" title={currentLang === 'zh' ? '无法删除系统文件夹' : currentLang === 'en' ? 'Cannot delete system folder' : '시스템 폴더 삭제 불가'}><Lock size={14}/></div>
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
                      placeholder={currentLang === 'zh' ? '+ 添加新标签' : currentLang === 'en' ? '+ Add new tag' : '+ 새 태그 추가'}
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
              <div className="text-[11px] font-black text-indigo-500 flex items-center gap-1.5"><Plus size={14} strokeWidth={3}/> {currentLang === 'zh' ? '新建分类' : currentLang === 'en' ? 'Create New Category' : '카테고리 새로 만들기'}</div>
              <div className="flex flex-col sm:flex-row gap-2">
                  <select 
                      value={newCategoryType} onChange={e=>setNewCategoryType(e.target.value)} disabled={isAddingCategory}
                      className="bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-2 text-xs font-bold outline-none focus:border-indigo-400 focus:bg-white text-zinc-700 shrink-0"
                  >
                      <option value="GENERAL">📁 {currentLang === 'zh' ? '常规' : currentLang === 'en' ? 'General' : '일반'}</option>
                      <option value="MUSIC">🎵 {currentLang === 'zh' ? '音乐' : currentLang === 'en' ? 'Music' : '음악'}</option>
                      <option value="URL">🔗 URL</option>
                  </select>
                  <input 
                      value={newCategoryName} onChange={e=>setNewCategoryName(e.target.value)} disabled={isAddingCategory}
                      onKeyDown={e=>{if(e.key==='Enter') handleAddCategory()}}
                      placeholder={currentLang === 'zh' ? '设置分类名称' : currentLang === 'en' ? 'Enter category name' : '카테고리 이름 지정'}
                      className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-indigo-400 focus:bg-white placeholder:font-medium placeholder:text-zinc-400"
                  />
              </div>
              <button onClick={handleAddCategory} disabled={isAddingCategory || !newCategoryName.trim()} className="w-full py-2 bg-zinc-900 text-white rounded-lg text-xs font-black hover:bg-zinc-800 disabled:bg-zinc-300 disabled:text-zinc-500 transition-colors flex justify-center items-center gap-1.5 shadow-sm">
                  {isAddingCategory ? <Loader2 size={14} className="animate-spin" /> : (currentLang === 'zh' ? '完成并添加' : currentLang === 'en' ? 'Done & Add' : '완료 및 추가')}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-3 space-y-1 min-h-0 scrollbar-hide">
            <button 
              onClick={() => setSelectedFilter({ type: 'all', value: '전체', id: 'all' })}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-bold transition-colors ${selectedFilter.type === 'all' ? 'bg-indigo-50 text-indigo-700' : 'text-zinc-600 hover:bg-zinc-100'}`}
            >
              <Network size={16} className={selectedFilter.type === 'all' ? 'text-indigo-600' : 'text-zinc-400'}/> {t('common.all', '전체보기')}
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
    </>
  );
};

export default TimelineCategoryExplorer;
