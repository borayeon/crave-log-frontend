import React from 'react';
import { Search, User, Globe } from 'lucide-react';
import { useAppStore } from '../store/AppStore';

const SearchView = () => {
  const { searchResults, searchQuery, showToast, visitUserProfile } = useAppStore(); // ⭐️ visitUserProfile 꺼내오기

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-10 animate-in fade-in duration-300 pb-28 md:pb-10">
      <header className="mb-8 border-b border-zinc-200/60 pb-6">
        <h2 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
          <Search className="text-indigo-500" size={28} /> 
          <span className="text-indigo-600">
            {searchQuery.trim() === '' ? '모든 사용자' : `"${searchQuery}"`}
          </span> 검색 결과
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
          <p className="text-sm font-medium text-zinc-500">다른 이름이나 아이디로 다시 시도해 보세요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {searchResults.map(user => (
            <div 
              key={user.handle} 
              // ⭐️ 클릭 시 해당 유저의 프로필 데이터를 로드하고 화면을 전환합니다!
              onClick={() => {
                showToast(`${user.name}님의 프로필을 불러옵니다 🚀`);
                visitUserProfile(user.handle); 
              }}
              className="p-5 bg-white border border-zinc-200/80 rounded-2xl flex items-center gap-4 hover:shadow-md hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-rose-400 p-[2px] shrink-0 z-10">
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
              <div className="flex-1 min-w-0 z-10">
                  <p className="text-base font-black text-zinc-900 truncate group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                      {user.name}
                  </p>
                  <p className="text-xs font-bold text-zinc-400 truncate mt-0.5">
                      @{user.handle}
                  </p>
              </div>
              
              <div className="absolute right-4 text-indigo-100 group-hover:text-indigo-500 transition-colors transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 duration-300">
                <Globe size={20} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};