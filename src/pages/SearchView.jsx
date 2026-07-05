import React, { useEffect } from 'react';
import { Search, User } from 'lucide-react';
import { useAppStore } from '../store/AppStore';

const SearchView = () => {
  const { searchResults, searchQuery, searchUsers, setViewMode, showToast } = useAppStore();

  useEffect(() => {
    if (searchQuery) {
      searchUsers(searchQuery);
    }
  }, [searchQuery, searchUsers]);

  return (
    <div className="max-w-4xl mx-auto p-10 animate-in fade-in duration-300">
      <header className="mb-8 border-b border-zinc-200/60 pb-6">
        <h2 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
          <Search className="text-indigo-500" size={28} /> 
          <span className="text-indigo-600">"{searchQuery}"</span> 검색 결과
        </h2>
        <p className="text-sm font-bold text-zinc-400 mt-2 uppercase tracking-widest">
          총 {searchResults.length}명의 사용자를 찾았습니다
        </p>
      </header>

      {searchResults.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[2rem] border border-zinc-200/80 shadow-sm">
          <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300 mb-4 border border-zinc-100">
            <Search size={32} />
          </div>
          <h3 className="text-xl font-black text-zinc-800 mb-2">검색 결과가 없습니다</h3>
          <p className="text-sm font-medium text-zinc-500">다른 이름이나 아이디로 검색해보세요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {searchResults.map(user => (
            <div 
              key={user.handle} 
              // ⭐️ 클릭 시 알림 메시지 띄우기
              onClick={() => showToast(`${user.name}님의 프로필 방문 기능은 곧 추가됩니다! 🛠️`)}
              className="p-5 bg-white border border-zinc-200/80 rounded-2xl flex items-center gap-4 hover:shadow-md hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-rose-400 p-[2px] shrink-0">
                 <div className="w-full h-full bg-white flex items-center justify-center rounded-[14px] overflow-hidden">
                    {user.profileImageUrl ? (
                        <img src={user.profileImageUrl} alt="profile" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-xl font-black text-zinc-300 group-hover:text-indigo-500 transition-colors">
                            {user.name.charAt(0)}
                        </span>
                    )}
                 </div>
              </div>
              <div className="flex-1 min-w-0">
                  <p className="text-base font-black text-zinc-900 truncate group-hover:text-indigo-600 transition-colors">
                      {user.name}
                  </p>
                  <p className="text-xs font-bold text-zinc-400 truncate mt-0.5">
                      @{user.handle}
                  </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchView;