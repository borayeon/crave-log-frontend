import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Globe, Briefcase, GraduationCap, MapPin, Sparkles, 
  Users, Eye, UserPlus, UserCheck, Hash, X, SlidersHorizontal, 
  ShieldCheck, ChevronDown, FileText
} from 'lucide-react';
import { useAppStore } from '../store/AppStore';
import { trackSearchEvent } from '../utils/analyticsTracker';

const PAGE_SIZE = 12;

const SearchView = () => {
  const { 
    searchResults, setSearchResults, searchQuery, searchFilter, 
    searchUsers, showToast, visitUserProfile, apiFetch,
    isAdmin, currentUser, user, setViewMode, setLoginModalOpen,
    t, currentLang 
  } = useAppStore();

  const [localInput, setLocalInput] = useState(searchQuery || '');
  const [sortBy, setSortBy] = useState('relevance'); // 'relevance' | 'visits' | 'followers' | 'name'
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [followLoadingMap, setFollowLoadingMap] = useState({});

  const myHandle = currentUser?.handle || (!isAdmin ? null : user?.handle);

  useEffect(() => {
    setLocalInput(searchQuery || '');
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery, searchFilter]);

  // 페이지 진입 시 검색 결과가 비어있고 초기 상태라면 전체 사용자 목록 로드
  useEffect(() => {
    if ((!searchResults || searchResults.length === 0) && !searchQuery) {
      searchUsers('', searchFilter || 'all');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const FILTER_OPTIONS = [
    { id: 'all', label: currentLang === 'zh' ? '全部' : currentLang === 'en' ? 'All' : '전체 통합', icon: Globe },
    { id: 'name', label: currentLang === 'zh' ? '姓名 / ID' : currentLang === 'en' ? 'Name / ID' : '이름 · 아이디', icon: Search },
    { id: 'role', label: currentLang === 'zh' ? '职位 / 专业' : currentLang === 'en' ? 'Role / Major' : '직무 · 전공 · 지역', icon: Briefcase },
    { id: 'tag', label: currentLang === 'zh' ? '标签 (#Tag)' : currentLang === 'en' ? 'Tags (#Tag)' : '키워드 태그', icon: Hash },
    { id: 'bio', label: currentLang === 'zh' ? '个人简介' : currentLang === 'en' ? 'Bio / Status' : '소개 · 상태메시지', icon: FileText },
  ];

  const handleExecuteSearch = (e) => {
    if (e) e.preventDefault();
    const trimmed = (localInput || '').trim();
    if (trimmed) {
      trackSearchEvent(trimmed);
    }
    searchUsers(trimmed, searchFilter);
  };

  const handleFilterChange = (nextFilter) => {
    const trimmed = (localInput || '').trim();
    searchUsers(trimmed, nextFilter);
  };

  const handleTagClick = (e, tagText) => {
    e.stopPropagation();
    setLocalInput(tagText);
    trackSearchEvent(tagText);
    searchUsers(tagText, 'tag');
  };

  // 검색 결과 내 인기 태그 추출 (상위 10개)
  const popularTags = useMemo(() => {
    const counts = {};
    (searchResults || []).forEach(u => {
      if (Array.isArray(u.tags)) {
        u.tags.forEach(tag => {
          const clean = String(tag || '').trim();
          if (clean) counts[clean] = (counts[clean] || 0) + 1;
        });
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag);
  }, [searchResults]);

  // 정렬된 검색 결과
  const sortedResults = useMemo(() => {
    const list = [...(searchResults || [])];
    if (sortBy === 'visits') {
      return list.sort((a, b) => (b.totalVisits || 0) - (a.totalVisits || 0));
    }
    if (sortBy === 'followers') {
      return list.sort((a, b) => (b.followerCount || 0) - (a.followerCount || 0));
    }
    if (sortBy === 'name') {
      return list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }
    return list; // 'relevance': 백엔드 정확도/기본 정렬 유지
  }, [searchResults, sortBy]);

  const visibleResults = useMemo(() => {
    return sortedResults.slice(0, visibleCount);
  }, [sortedResults, visibleCount]);

  // 검색 카드에서 즉시 팔로우 / 언팔로우 토글
  const handleToggleFollow = async (e, targetUser) => {
    e.stopPropagation();
    if (!isAdmin) {
      setLoginModalOpen(true);
      showToast(t('toast.login_required', '로그인이 필요한 서비스입니다. 🔒'));
      return;
    }

    const handle = targetUser.handle;
    if (followLoadingMap[handle]) return;

    const currentlyFollowing = !!targetUser.isFollowing;
    setFollowLoadingMap(prev => ({ ...prev, [handle]: true }));

    try {
      const res = await apiFetch(`/users/${handle}/follow`, {
        method: currentlyFollowing ? 'DELETE' : 'POST',
      });

      if (res?.ok) {
        setSearchResults(prev =>
          prev.map(u =>
            u.handle === handle
              ? {
                  ...u,
                  isFollowing: !currentlyFollowing,
                  followerCount: Math.max(0, (u.followerCount || 0) + (currentlyFollowing ? -1 : 1)),
                }
              : u
          )
        );
        showToast(
          currentlyFollowing
            ? `@${handle} ${currentLang === 'zh' ? '已取消关注。' : currentLang === 'en' ? 'unfollowed.' : '팔로우를 취소했습니다.'}`
            : `@${handle} ${currentLang === 'zh' ? '关注成功！✨' : currentLang === 'en' ? 'followed! ✨' : '님을 팔로우했습니다! ✨'}`
        );
      } else {
        showToast(currentLang === 'zh' ? '请求失败。' : currentLang === 'en' ? 'Request failed.' : '요청 처리에 실패했습니다.');
      }
    } catch (err) {
      console.error('Follow toggle error:', err);
      showToast(currentLang === 'zh' ? '发生服务器错误。' : currentLang === 'en' ? 'Server error occurred.' : '서버 오류가 발생했습니다.');
    } finally {
      setFollowLoadingMap(prev => ({ ...prev, [handle]: false }));
    }
  };

  const getMatchBadgeLabel = (field) => {
    switch (field) {
      case 'role':
        return currentLang === 'zh' ? '职位/专业匹配' : currentLang === 'en' ? 'Role Match' : '직무·전공 일치';
      case 'tags':
        return currentLang === 'zh' ? '标签匹配' : currentLang === 'en' ? 'Tag Match' : '태그 일치';
      case 'bio':
        return currentLang === 'zh' ? '简介匹配' : currentLang === 'en' ? 'Bio Match' : '소개글 일치';
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-10 animate-in fade-in duration-300 pb-28 md:pb-12">
      {/* 상단 헤더 */}
      <header className="mb-6 pb-6 border-b border-zinc-200/60 flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
              <Search className="text-indigo-500 shrink-0" size={28} />
              <span>
                <span className="text-indigo-600">
                  {searchQuery.trim() === '' ? t('search.all_users', '모든 사용자') : `"${searchQuery}"`}
                </span>{' '}
                {t('search.results_suffix', '검색 결과')}
              </span>
            </h2>
            <p className="text-xs md:text-sm font-bold text-zinc-400 mt-1.5">
              {t('search.found_count', { count: sortedResults.length })}
            </p>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={() => setViewMode('access_control')}
              className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-white border border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-xs font-black text-zinc-600 hover:text-indigo-600 transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <ShieldCheck size={15} className="text-indigo-600" />
              {currentLang === 'zh' ? '我的搜索曝光设置' : currentLang === 'en' ? 'My Search Privacy' : '내 정보 검색 노출 설정'}
            </button>
          )}
        </div>

        {/* 페이지 내 통합 검색바 */}
        <form onSubmit={handleExecuteSearch} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={localInput}
              onChange={(e) => setLocalInput(e.target.value)}
              placeholder={
                currentLang === 'zh'
                  ? '输入姓名、@ID、职位、专业、#标签或简介关键词...'
                  : currentLang === 'en'
                  ? 'Search by name, @handle, role, major, #tag, or bio...'
                  : '이름, @아이디, 직무/전공, #키워드 태그, 한 줄 소개로 검색...'
              }
              className="w-full bg-white border border-zinc-200/90 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-2xl py-3 pl-11 pr-10 text-sm font-bold text-zinc-800 outline-none transition-all shadow-xs"
            />
            {localInput && (
              <button
                type="button"
                onClick={() => {
                  setLocalInput('');
                  searchUsers('', searchFilter);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-zinc-100 transition-colors"
                title={currentLang === 'zh' ? '清除并查看全部' : currentLang === 'en' ? 'Clear & view all' : '검색어 지우고 전체 보기'}
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-black transition-all shadow-sm shrink-0 flex items-center justify-center gap-2"
          >
            <Search size={16} />
            {currentLang === 'zh' ? '搜索' : currentLang === 'en' ? 'Search' : '검색'}
          </button>
        </form>

        {/* 검색 범위 필터 탭 & 정렬 셀렉터 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-1 md:pb-0">
            {FILTER_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isActive = (searchFilter || 'all') === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleFilterChange(opt.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 whitespace-nowrap transition-all border ${
                    isActive
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                      : 'bg-white text-zinc-500 border-zinc-200/80 hover:border-zinc-300 hover:text-zinc-800'
                  }`}
                >
                  <Icon size={13} />
                  {opt.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <SlidersHorizontal size={14} className="text-zinc-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-zinc-200/80 rounded-xl px-3 py-1.5 text-xs font-black text-zinc-700 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="relevance">{currentLang === 'zh' ? '按相关度/默认排序' : currentLang === 'en' ? 'Sort: Relevance' : '정확도 · 기본순'}</option>
              <option value="visits">{currentLang === 'zh' ? '按访问量排序' : currentLang === 'en' ? 'Sort: Most Visited' : '방문자 많은순'}</option>
              <option value="followers">{currentLang === 'zh' ? '按关注者数排序' : currentLang === 'en' ? 'Sort: Most Followers' : '팔로워 많은순'}</option>
              <option value="name">{currentLang === 'zh' ? '按姓名排序' : currentLang === 'en' ? 'Sort: Name' : '이름 가나다순'}</option>
            </select>
          </div>
        </div>

        {/* 추천 / 인기 태그 빠른 탐색 바 */}
        {popularTags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-[11px] font-black text-zinc-400 uppercase tracking-wider flex items-center gap-1 mr-1">
              <Hash size={12} className="text-indigo-500" />
              {currentLang === 'zh' ? '热门标签:' : currentLang === 'en' ? 'Popular Tags:' : '인기 태그:'}
            </span>
            {popularTags.map((tag) => {
              const isSelectedTag = searchQuery.toLowerCase() === tag.toLowerCase();
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={(e) => handleTagClick(e, tag)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all border ${
                    isSelectedTag
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-indigo-50/60 text-indigo-600 border-indigo-100 hover:bg-indigo-100/80'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* 검색 결과 목록 */}
      {sortedResults.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[2rem] border border-zinc-200/80 shadow-sm px-4">
          <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300 mb-4 border border-zinc-100">
            <Search size={32} />
          </div>
          <h3 className="text-xl font-black text-zinc-800 mb-2">{t('search.empty_title', '검색 결과가 없습니다')}</h3>
          <p className="text-sm font-medium text-zinc-500 max-w-md">
            {t('search.empty_desc', '다른 이름이나 아이디, 직무, 또는 키워드 태그로 다시 시도해 보세요.')}
          </p>
          {(searchQuery || searchFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setLocalInput('');
                searchUsers('', 'all');
              }}
              className="mt-5 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-black transition-all shadow-xs"
            >
              {currentLang === 'zh' ? '查看所有公开用户' : currentLang === 'en' ? 'View All Searchable Users' : '전체 공개 사용자 보기'}
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleResults.map((u) => {
              const isMe = myHandle && u.handle === myHandle;
              const roleParts = [u.role, u.major, u.location].filter(Boolean);
              const matchedBadges = (u.matchedFields || [])
                .map(getMatchBadgeLabel)
                .filter(Boolean);

              return (
                <div
                  key={u.handle}
                  onClick={() => {
                    showToast(
                      currentLang === 'zh'
                        ? `正在前往 ${u.name} 的主页 🚀`
                        : currentLang === 'en'
                        ? `Visiting ${u.name}'s profile 🚀`
                        : `${u.name}님의 프로필로 이동합니다 🚀`
                    );
                    if (visitUserProfile) {
                      visitUserProfile(u.handle);
                    }
                  }}
                  className="p-5 bg-white border border-zinc-200/80 rounded-3xl flex flex-col justify-between gap-4 hover:shadow-lg hover:border-indigo-300 hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                >
                  <div>
                    {/* 상단: 프로필 아바타 + 이름/핸들 + 팔로우 버튼 */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-rose-400 p-[2px] shrink-0">
                          <div className="w-full h-full bg-white flex items-center justify-center rounded-[14px] overflow-hidden">
                            {u.profileImageUrl ? (
                              <img src={u.profileImageUrl} alt={u.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xl font-black text-zinc-300 group-hover:text-indigo-500 transition-colors">
                                {(u.name || '?').charAt(0)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-base font-black text-zinc-900 truncate group-hover:text-indigo-600 transition-colors">
                              {u.name}
                            </p>
                            {isMe && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-600 border border-indigo-200 shrink-0">
                                ME
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-zinc-400 truncate mt-0.5">@{u.handle}</p>

                          {/* 검색어 매칭 영역 표시 배지 */}
                          {searchQuery && matchedBadges.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {matchedBadges.map((badge, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/80 text-[10px] font-extrabold"
                                >
                                  {badge}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 팔로우 / 언팔로우 버튼 (본인 제외) */}
                      {!isMe && (
                        <button
                          type="button"
                          disabled={!!followLoadingMap[u.handle]}
                          onClick={(e) => handleToggleFollow(e, u)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all flex items-center gap-1 shrink-0 border ${
                            u.isFollowing
                              ? 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'
                              : 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600'
                          }`}
                        >
                          {u.isFollowing ? (
                            <>
                              <UserCheck size={13} />
                              <span>{currentLang === 'zh' ? '已关注' : currentLang === 'en' ? 'Following' : '팔로잉'}</span>
                            </>
                          ) : (
                            <>
                              <UserPlus size={13} />
                              <span>{currentLang === 'zh' ? '关注' : currentLang === 'en' ? 'Follow' : '팔로우'}</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* 중단: 직무 / 전공 / 지역 정보 */}
                    {roleParts.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-3.5 text-[11px] font-bold text-zinc-600">
                        {u.role && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-50 border border-zinc-200/70 truncate max-w-full">
                            <Briefcase size={11} className="text-indigo-500 shrink-0" />
                            <span className="truncate">{u.role}</span>
                          </span>
                        )}
                        {u.major && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-50 border border-zinc-200/70 truncate max-w-full">
                            <GraduationCap size={11} className="text-violet-500 shrink-0" />
                            <span className="truncate">{u.major}</span>
                          </span>
                        )}
                        {u.location && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-50 border border-zinc-200/70 truncate">
                            <MapPin size={11} className="text-rose-400 shrink-0" />
                            <span className="truncate">{u.location}</span>
                          </span>
                        )}
                      </div>
                    )}

                    {/* 상태 메시지 또는 한 줄 소개 */}
                    {(u.status || u.bio) && (
                      <div className="mt-3 space-y-1">
                        {u.status && (
                          <p className="text-[11px] font-extrabold text-indigo-600/90 bg-indigo-50/50 px-2.5 py-1 rounded-lg truncate flex items-center gap-1.5">
                            <Sparkles size={11} className="text-amber-500 shrink-0" />
                            <span className="truncate">{u.status}</span>
                          </p>
                        )}
                        {u.bio && (
                          <p className="text-xs font-medium text-zinc-500 line-clamp-2 leading-relaxed">
                            {u.bio}
                          </p>
                        )}
                      </div>
                    )}

                    {/* 대표 태그 목록 (최대 4개 노출, 클릭 시 태그 검색) */}
                    {Array.isArray(u.tags) && u.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {u.tags.slice(0, 4).map((tag, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={(e) => handleTagClick(e, tag)}
                            className="px-2 py-0.5 rounded-md bg-zinc-100 hover:bg-indigo-50 text-zinc-600 hover:text-indigo-600 text-[10px] font-extrabold transition-colors"
                          >
                            #{tag}
                          </button>
                        ))}
                        {u.tags.length > 4 && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold text-zinc-400">
                            +{u.tags.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 하단: 팔로워 수 & 누적 방문자 수 & 이동 아이콘 */}
                  <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] font-bold text-zinc-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Users size={12} className="text-zinc-400" />
                        {currentLang === 'zh' ? '关注者' : currentLang === 'en' ? 'Followers' : '팔로워'}{' '}
                        <strong className="text-zinc-700 font-black">{u.followerCount || 0}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye size={12} className="text-zinc-400" />
                        {currentLang === 'zh' ? '访问' : currentLang === 'en' ? 'Visits' : '방문'}{' '}
                        <strong className="text-zinc-700 font-black">{u.totalVisits || 0}</strong>
                      </span>
                    </div>

                    <span className="text-indigo-400 group-hover:text-indigo-600 flex items-center gap-1 text-[11px] font-black transition-colors">
                      <Globe size={14} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 더보기 (클라이언트 페이징) 버튼 */}
          {visibleCount < sortedResults.length && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                className="px-6 py-3 bg-white hover:bg-zinc-50 border border-zinc-200/90 rounded-2xl text-xs font-black text-zinc-700 shadow-xs transition-all flex items-center gap-2"
              >
                <ChevronDown size={15} />
                {currentLang === 'zh'
                  ? `加载更多 (${visibleCount} / ${sortedResults.length})`
                  : currentLang === 'en'
                  ? `Load More (${visibleCount} / ${sortedResults.length})`
                  : `더보기 (${visibleCount} / ${sortedResults.length})`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchView;