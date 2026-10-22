import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldCheck, Globe, Users, KeyRound, Lock, Eye, EyeOff,
  UserCheck, UserMinus, UserX, Loader2, Search, Check, 
  AlertCircle, Sparkles, RefreshCw, ChevronRight, X, Briefcase, Hash, FileText, Clock
} from 'lucide-react';
import { useAppStore } from '../store/AppStore';

const AccessControlView = () => {
  const { 
    apiFetch, showToast, records, fetchAllData, user, currentUser, 
    isAdmin, setViewMode, setLoginModalOpen, visitedHandle, resetToMyProfile,
    t, currentLang,
    followRequests, followRequestCount, fetchFollowRequests, acceptFollowRequest, rejectFollowRequest
  } = useAppStore();
  const [activeTab, setActiveTab] = useState('records'); // 'records' | 'search_privacy' | 'followers'
  const [searchQuery, setSearchQuery] = useState('');

  // 🔒 비로그인 사용자 및 타인 방문 상태의 접근 원천 방어
  useEffect(() => {
    if (!isAdmin) {
      showToast(t('toast.login_required', '로그인이 필요한 서비스입니다. 🔒'), 'error');
      setLoginModalOpen(true);
      setViewMode('landing');
      return;
    }
    if (visitedHandle && resetToMyProfile) {
      resetToMyProfile();
    }
  }, [isAdmin, visitedHandle, resetToMyProfile, setLoginModalOpen, setViewMode, showToast, t]);

  // 비로그인 상태일 때는 화면 노출을 완전히 차단
  if (!isAdmin) {
    return null;
  }

  // ⭐️ 사용자 검색 노출 설정 상태 (내 프로필 privacy 동기화)
  const myProfile = currentUser || user;
  const parseInitialSearchPrivacy = useCallback(() => {
    const rawPrivacy = myProfile?.privacy || {};
    const p = typeof rawPrivacy === 'string' ? (() => { try { return JSON.parse(rawPrivacy); } catch { return {}; } })() : rawPrivacy;
    return {
      isSearchable: p.isSearchable !== false && p.isSearchable !== 'false',
      searchRole: p.search_role !== false && p.search_role !== 'false',
      searchBio: p.search_bio !== false && p.search_bio !== 'false',
      searchTags: p.search_tags !== false && p.search_tags !== 'false',
    };
  }, [myProfile]);

  const [searchPrivacy, setSearchPrivacy] = useState(parseInitialSearchPrivacy);
  const [isSavingSearchPrivacy, setIsSavingSearchPrivacy] = useState(false);

  useEffect(() => {
    setSearchPrivacy(parseInitialSearchPrivacy());
  }, [parseInitialSearchPrivacy]);

  // ⭐️ 검색 노출 설정 즉시 저장 핸들러
  const handleUpdateSearchPrivacy = async (nextState) => {
    const updated = { ...searchPrivacy, ...nextState };
    setSearchPrivacy(updated);
    try {
      setIsSavingSearchPrivacy(true);
      const res = await apiFetch('/me/search-privacy', {
        method: 'PATCH',
        body: JSON.stringify(updated),
      });
      if (res?.ok) {
        showToast(
          currentLang === 'zh'
            ? '🔍 搜索曝光设置已更新。'
            : currentLang === 'en'
            ? '🔍 Search visibility settings updated.'
            : '🔍 내 정보 검색 노출 설정이 변경되었습니다.'
        );
        fetchAllData(true);
      } else {
        showToast(
          currentLang === 'zh'
            ? '保存设置失败。'
            : currentLang === 'en'
            ? 'Failed to save settings.'
            : '설정 저장에 실패했습니다.'
        );
      }
    } catch (err) {
      console.error('Search privacy update error:', err);
      showToast(
        currentLang === 'zh'
          ? '发生错误。'
          : currentLang === 'en'
          ? 'An error occurred.'
          : '오류가 발생했습니다.'
      );
    } finally {
      setIsSavingSearchPrivacy(false);
    }
  };

  // 팔로우 관련 상태
  const [followers, setFollowers] = useState([]);
  const [followings, setFollowings] = useState([]);
  const [followSubTab, setFollowSubTab] = useState('requests'); // 'requests' | 'followers' | 'followings'
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  // 비밀번호 설정 팝업 상태 (2단계 비밀 공개 설정 시 사용)
  const [pinModalRecord, setPinModalRecord] = useState(null);
  const [newPin, setNewPin] = useState('');
  const [isSavingPin, setIsSavingPin] = useState(false);

  // 로컬 기록 상태 (즉각적인 UI 반응을 위해 동기화)
  const [localRecords, setLocalRecords] = useState(records || []);

  useEffect(() => {
    setLocalRecords(records || []);
  }, [records]);

  // 팔로우 및 요청 목록 불러오기
  const loadFollowData = useCallback(async () => {
    try {
      setIsFollowLoading(true);
      const [followersRes, followingsRes] = await Promise.all([
        apiFetch('/me/followers'),
        apiFetch('/me/followings'),
        fetchFollowRequests(),
      ]);

      if (followersRes?.ok) {
        setFollowers(await followersRes.json());
      }
      if (followingsRes?.ok) {
        setFollowings(await followingsRes.json());
      }
    } catch (err) {
      console.error('Follow data load error:', err);
    } finally {
      setIsFollowLoading(false);
    }
  }, [apiFetch, fetchFollowRequests]);

  useEffect(() => {
    if (activeTab === 'followers') {
      loadFollowData();
    }
  }, [activeTab, loadFollowData]);

  // 1. 기록 공개 레벨 변경 핸들러
  const handleVisibilityChange = async (recordId, targetLevel) => {
    if (targetLevel === 2) {
      // 2단계 비밀공개는 PIN 설정 모달을 띄움
      const target = localRecords.find(r => String(r.id) === String(recordId));
      setPinModalRecord(target);
      setNewPin('');
      return;
    }

    try {
      const res = await apiFetch(`/me/records/${recordId}/visibility`, {
        method: 'PATCH',
        body: JSON.stringify({ visibilityLevel: targetLevel }),
      });

      if (res?.ok) {
        setLocalRecords(prev => prev.map(r => 
          String(r.id) === String(recordId) 
            ? { ...r, visibilityLevel: targetLevel, isPublic: targetLevel === 0 }
            : r
        ));
        const levelNames = { 
          0: currentLang === 'zh' ? '公开(第0级)' : currentLang === 'en' ? 'Public (Level 0)' : '전체 공개(0단계)', 
          1: currentLang === 'zh' ? '仅关注者(第1级)' : currentLang === 'en' ? 'Followers Only (Level 1)' : '팔로워 공개(1단계)', 
          4: currentLang === 'zh' ? '私密(第4级)' : currentLang === 'en' ? 'Private (Level 4)' : '비공개(4단계)' 
        };
        showToast(currentLang === 'zh' ? `🔒 已更改为 ${levelNames[targetLevel]}。` : currentLang === 'en' ? `🔒 Changed to ${levelNames[targetLevel]}.` : `🔒 ${levelNames[targetLevel]}로 변경되었습니다.`);
        fetchAllData(true);
      } else {
        showToast(currentLang === 'zh' ? '更改公开范围失败。' : currentLang === 'en' ? 'Failed to update visibility.' : '공개 범위 변경에 실패했습니다.');
      }
    } catch (err) {
      console.error('Visibility update error:', err);
      showToast(currentLang === 'zh' ? '发生错误。' : currentLang === 'en' ? 'An error occurred.' : '오류가 발생했습니다.');
    }
  };

  // 2단계 PIN 저장 핸들러
  const handleSavePin = async (e) => {
    e.preventDefault();
    if (!pinModalRecord) return;
    if (!newPin.trim()) {
      showToast(currentLang === 'zh' ? '请输入访问密码。' : currentLang === 'en' ? 'Please enter a passcode.' : '비밀번호를 입력해주세요.');
      return;
    }

    try {
      setIsSavingPin(true);
      const res = await apiFetch(`/me/records/${pinModalRecord.id}/visibility`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          visibilityLevel: 2,
          passcode: newPin.trim() 
        }),
      });

      if (res?.ok) {
        setLocalRecords(prev => prev.map(r => 
          String(r.id) === String(pinModalRecord.id) 
            ? { ...r, visibilityLevel: 2, isPublic: false }
            : r
        ));
        showToast(currentLang === 'zh' ? '🔐 已成功设置秘密公开(第2级)并保存PIN。' : currentLang === 'en' ? '🔐 Secret access (Level 2) and PIN saved.' : '🔐 비밀 공개(2단계) 설정 및 PIN 저장이 완료되었습니다.');
        setPinModalRecord(null);
        setNewPin('');
        fetchAllData(true);
      } else {
        showToast(currentLang === 'zh' ? '保存设置失败。' : currentLang === 'en' ? 'Failed to save settings.' : '설정 저장에 실패했습니다.');
      }
    } catch (err) {
      console.error('Save pin error:', err);
      showToast(currentLang === 'zh' ? '发生错误。' : currentLang === 'en' ? 'An error occurred.' : '오류가 발생했습니다.');
    } finally {
      setIsSavingPin(false);
    }
  };

  // 2. 팔로워 끊기 (삭제)
  const handleRemoveFollower = async (followerId) => {
    const confirmMsg = currentLang === 'zh' 
      ? '确定要移除该关注者吗？（对方将无法查看您的关注者专属记录）' 
      : currentLang === 'en' 
      ? 'Remove this follower? (They will no longer be able to view your follower-only records)' 
      : '이 사용자의 팔로우를 해제하시겠습니까? (상대방은 더 이상 내 팔로워 공개 글을 볼 수 없습니다)';
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await apiFetch(`/me/followers/${followerId}`, { method: 'DELETE' });
      if (res?.ok) {
        setFollowers(prev => prev.filter(f => f.id !== followerId));
        showToast(currentLang === 'zh' ? '关注者已移除。' : currentLang === 'en' ? 'Follower removed.' : '팔로워가 삭제되었습니다.');
      }
    } catch (err) {
      console.error('Remove follower error:', err);
    }
  };

  // 3. 언팔로우
  const handleUnfollow = async (targetHandle) => {
    try {
      const res = await apiFetch(`/users/${targetHandle}/follow`, { method: 'DELETE' });
      if (res?.ok) {
        setFollowings(prev => prev.filter(f => f.handle !== targetHandle));
        showToast(`@${targetHandle} ${currentLang === 'zh' ? '已取消关注。' : currentLang === 'en' ? 'unfollowed.' : '팔로우를 취소했습니다.'}`);
      }
    } catch (err) {
      console.error('Unfollow error:', err);
    }
  };

  // 필터링된 기록 목록
  const filteredRecords = localRecords.filter(r => 
    !searchQuery || 
    r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-[1100px] mx-auto w-full pb-16 px-4 md:px-8 pt-6 md:pt-10 animate-in fade-in duration-300">
      
      {/* 2단계 PIN 설정 모달 */}
      {pinModalRecord && (
        <div className="fixed inset-0 z-[500] bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={() => setPinModalRecord(null)}>
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative border border-zinc-100 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm border border-amber-100">
                <KeyRound size={22} />
              </div>
              <button onClick={() => setPinModalRecord(null)} className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>

            <h3 className="text-base font-black text-zinc-900 tracking-tight">
              {currentLang === 'zh' ? '设置第2级密码保护 PIN' : currentLang === 'en' ? 'Set Level 2 PIN Passcode' : '2단계 비밀 공개 PIN 설정'}
            </h3>
            <p className="text-xs text-zinc-500 font-semibold mt-1 mb-5 break-keep">
              {currentLang === 'zh' 
                ? `请输入查看 "${pinModalRecord.title}" 记录所需的密码(PIN)。` 
                : currentLang === 'en' 
                ? `Enter the passcode (PIN) required to view "${pinModalRecord.title}".` 
                : `"${pinModalRecord.title}" 기록을 열람할 수 있는 비밀번호(PIN)를 입력하세요.`}
            </p>

            <form onSubmit={handleSavePin} className="space-y-4">
              <div>
                <input
                  type="password"
                  autoFocus
                  value={newPin}
                  onChange={e => setNewPin(e.target.value)}
                  placeholder={currentLang === 'zh' ? '输入新密码 (例: 1234)' : currentLang === 'en' ? 'Enter new passcode (e.g. 1234)' : '새 비밀번호 입력 (예: 1234)'}
                  className="w-full bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-2xl py-3 px-4 text-sm font-black tracking-widest text-zinc-900 outline-none transition-all"
                />
                <p className="text-[11px] text-zinc-400 font-medium mt-2">
                  {currentLang === 'zh' ? '只有知晓此密码的用户才能查看该记录。' : currentLang === 'en' ? 'Only people who know this passcode can view this record.' : '이 비밀번호를 알고 있는 사람만 해당 기록을 열람할 수 있습니다.'}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPinModalRecord(null)}
                  className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 rounded-xl text-xs font-black transition-all"
                >
                  {currentLang === 'zh' ? '取消' : currentLang === 'en' ? 'Cancel' : '취소'}
                </button>
                <button
                  type="submit"
                  disabled={isSavingPin || !newPin.trim()}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isSavingPin ? <Loader2 size={16} className="animate-spin" /> : (currentLang === 'zh' ? '保存密码设置' : currentLang === 'en' ? 'Save PIN' : '비밀 공개 저장')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-zinc-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wider uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
              <ShieldCheck size={13} className="text-indigo-600" />
              Privacy & Access Control
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-2.5">
            {currentLang === 'zh' ? '记录访问权限与关注管理' : currentLang === 'en' ? 'Access Control & Follower Management' : '기록 공개 권한 및 팔로우 관리'}
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 font-semibold mt-1">
            {currentLang === 'zh' 
              ? '设置记录公开范围（第0级公开 ~ 第4级私密），安全管理关注关系。' 
              : currentLang === 'en' 
              ? 'Set visibility levels (Level 0 Public ~ Level 4 Private) and manage followers securely.' 
              : '내 기록의 공개 범위(0단계 전체공개 ~ 4단계 비공개)를 설정하고, 나를 팔로우하는 관계를 안전하게 관리합니다.'}
          </p>
        </div>

        {/* 메인 탭 전환 (기록 공개 관리 vs 검색 노출 설정 vs 팔로우 관리) */}
        <div className="flex flex-wrap items-center bg-zinc-100 p-1.5 rounded-2xl border border-zinc-200/80 self-start md:self-auto gap-1">
          <button
            onClick={() => setActiveTab('records')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'records'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Lock size={14} className={activeTab === 'records' ? 'text-indigo-600' : ''} />
            {currentLang === 'zh' ? `记录公开 (${localRecords.length})` : currentLang === 'en' ? `Records (${localRecords.length})` : `기록 공개범위 (${localRecords.length})`}
          </button>
          <button
            onClick={() => setActiveTab('search_privacy')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'search_privacy'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Search size={14} className={activeTab === 'search_privacy' ? 'text-indigo-600' : ''} />
            {currentLang === 'zh' ? '搜索曝光设置' : currentLang === 'en' ? 'Search Privacy' : '검색 노출 설정'}
            <span className={`w-2 h-2 rounded-full ${searchPrivacy.isSearchable ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
          </button>
          <button
            onClick={() => setActiveTab('followers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'followers'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Users size={14} className={activeTab === 'followers' ? 'text-indigo-600' : ''} />
            {currentLang === 'zh' ? `关注管理 (${followers.length})` : currentLang === 'en' ? `Followers (${followers.length})` : `팔로우 관리 (${followers.length})`}
            {followRequestCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black leading-none">
                {followRequestCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 탭 1-1: 내 프로필 검색 노출 설정 */}
      {activeTab === 'search_privacy' && (
        <div className="mt-8 space-y-6 animate-in fade-in duration-200">
          {/* 메인 마스터 스위치 카드 */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-zinc-200/80 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                  searchPrivacy.isSearchable
                    ? 'bg-indigo-50 text-indigo-600 border-indigo-100'
                    : 'bg-zinc-100 text-zinc-400 border-zinc-200'
                }`}>
                  {searchPrivacy.isSearchable ? <Search size={22} /> : <EyeOff size={22} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-zinc-900">
                      {currentLang === 'zh' ? '允许搜索我的个人资料' : currentLang === 'en' ? 'Allow Profile Search & Discovery' : '내 프로필 검색 및 탐색 허용'}
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                      searchPrivacy.isSearchable
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                    }`}>
                      {searchPrivacy.isSearchable
                        ? (currentLang === 'zh' ? '公开搜索中' : currentLang === 'en' ? 'Searchable' : '검색 허용됨')
                        : (currentLang === 'zh' ? '已隐藏' : currentLang === 'en' ? 'Hidden' : '검색 비허용')}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-zinc-500 font-medium mt-1 leading-relaxed">
                    {searchPrivacy.isSearchable
                      ? (currentLang === 'zh'
                          ? '其他用户可以通过顶部搜索栏或“所有用户”目录找到您的个人主页。'
                          : currentLang === 'en'
                          ? 'Other users can find your profile through the search bar or the "All Users" directory.'
                          : '다른 사용자가 상단 검색창이나 전체 사용자 탐색 목록에서 내 프로필을 검색하고 방문할 수 있습니다.')
                      : (currentLang === 'zh'
                          ? '您的主页已从所有搜索结果和用户目录中隐藏，只有拥有您直接分享链接(?u=ID)的人才能访问。'
                          : currentLang === 'en'
                          ? 'Your profile is completely hidden from search results and user directories. Only people with your direct link (?u=handle) can visit.'
                          : '모든 검색 결과 및 전체 사용자 목록에서 내 프로필이 숨겨집니다. 내가 직접 공유한 링크(?u=아이디)를 아는 사람만 방문할 수 있습니다.')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  disabled={isSavingSearchPrivacy}
                  onClick={() => handleUpdateSearchPrivacy({ isSearchable: true })}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border ${
                    searchPrivacy.isSearchable
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-zinc-50 text-zinc-500 border-zinc-200 hover:text-zinc-800'
                  }`}
                >
                  <Globe size={14} />
                  {currentLang === 'zh' ? '允许搜索' : currentLang === 'en' ? 'Searchable' : '검색 허용'}
                </button>
                <button
                  type="button"
                  disabled={isSavingSearchPrivacy}
                  onClick={() => handleUpdateSearchPrivacy({ isSearchable: false })}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border ${
                    !searchPrivacy.isSearchable
                      ? 'bg-zinc-800 text-white border-zinc-800 shadow-sm'
                      : 'bg-zinc-50 text-zinc-500 border-zinc-200 hover:text-zinc-800'
                  }`}
                >
                  <EyeOff size={14} />
                  {currentLang === 'zh' ? '禁止搜索' : currentLang === 'en' ? 'Hide from Search' : '검색 비허용'}
                </button>
              </div>
            </div>

            {/* 세부 항목별 검색 허용 설정 */}
            <div className={`mt-6 transition-opacity ${searchPrivacy.isSearchable ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <div className="mb-4">
                <h4 className="text-sm font-black text-zinc-900">
                  {currentLang === 'zh' ? '细化搜索条件与结果卡片展示项' : currentLang === 'en' ? 'Searchable Fields & Result Card Details' : '세부 항목별 검색 및 결과 카드 노출 설정'}
                </h4>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">
                  {currentLang === 'zh'
                    ? '选择允许其他用户通过哪些关键词搜索到您，并在搜索结果卡片上展示对应信息。'
                    : currentLang === 'en'
                    ? 'Choose which profile fields can be matched in search queries and displayed on your search result card.'
                    : '어떤 정보로 나를 검색할 수 있게 할지, 그리고 검색 결과 카드에 어떤 정보를 함께 보여줄지 개별적으로 선택할 수 있습니다.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    key: 'searchRole',
                    icon: Briefcase,
                    title: currentLang === 'zh' ? '职位 · 专业 · 地区' : currentLang === 'en' ? 'Role · Major · Location' : '직무 · 전공 · 지역 정보',
                    desc: currentLang === 'zh' ? '允许通过职务(如: 后端开发)、专业或所在地区搜索到我，并在搜索卡片中展示。' : currentLang === 'en' ? 'Allow users to find you by role, major, or location, and show them on search cards.' : '직무(예: 백엔드 개발자), 전공/소속, 지역 키워드로 나를 검색할 수 있고 검색 카드에 표시합니다.',
                    sample: myProfile?.role || myProfile?.major || (currentLang === 'zh' ? '例: 后端开发者 · 计算机科学' : currentLang === 'en' ? 'e.g. Backend Developer · CS' : '예: Backend Developer · 컴퓨터공학')
                  },
                  {
                    key: 'searchTags',
                    icon: Hash,
                    title: currentLang === 'zh' ? '兴趣与技术标签 (#Tag)' : currentLang === 'en' ? 'Keyword Tags (#Tag)' : '나의 키워드 해시태그 (#Tag)',
                    desc: currentLang === 'zh' ? '允许通过个人资料中登记的标签关键词搜索到我，并在搜索卡片中展示代表标签。' : currentLang === 'en' ? 'Allow users to find you by your profile tags and display top tags on search cards.' : '프로필에 등록한 키워드 태그(#React, #취미 등)로 나를 검색할 수 있고 카드 하단에 태그를 노출합니다.',
                    sample: (myProfile?.tags?.length ? myProfile.tags.slice(0, 3).map(t => `#${t}`).join(' ') : '#React #Spring #CraveLog')
                  },
                  {
                    key: 'searchBio',
                    icon: FileText,
                    title: currentLang === 'zh' ? '一句话简介与状态消息' : currentLang === 'en' ? 'Bio & Status Message' : '한 줄 소개 및 상태 메시지',
                    desc: currentLang === 'zh' ? '允许通过个人简介或状态签名中的词句搜索到我，并在搜索卡片中预览简介。' : currentLang === 'en' ? 'Allow users to find you by words in your bio or status message and preview them on cards.' : '자기소개 문구나 상태 메시지에 포함된 단어로 나를 검색할 수 있고 카드에 소개글을 함께 표시합니다.',
                    sample: myProfile?.bio || myProfile?.status || (currentLang === 'zh' ? '例: 记录每日成长的开发者 🚀' : currentLang === 'en' ? 'e.g. Recording daily growth 🚀' : '예: 매일의 성장을 기록하는 공간입니다 🚀')
                  }
                ].map((item) => {
                  const Icon = item.icon;
                  const enabled = searchPrivacy[item.key];
                  return (
                    <div
                      key={item.key}
                      onClick={() => handleUpdateSearchPrivacy({ [item.key]: !enabled })}
                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                        enabled
                          ? 'border-indigo-500/80 bg-indigo-50/20 shadow-xs'
                          : 'border-zinc-200/80 bg-zinc-50/60 hover:border-zinc-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            enabled ? 'bg-indigo-600 text-white' : 'bg-zinc-200 text-zinc-500'
                          }`}>
                            <Icon size={17} />
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1 ${
                            enabled ? 'bg-indigo-100 text-indigo-700' : 'bg-zinc-200 text-zinc-500'
                          }`}>
                            {enabled ? <Check size={11} /> : <EyeOff size={11} />}
                            {enabled
                              ? (currentLang === 'zh' ? '允许搜索与展示' : currentLang === 'en' ? 'Searchable' : '검색·노출 허용')
                              : (currentLang === 'zh' ? '不公开' : currentLang === 'en' ? 'Excluded' : '검색·노출 제외')}
                          </span>
                        </div>
                        <h5 className="text-sm font-black text-zinc-900">{item.title}</h5>
                        <p className="text-xs text-zinc-500 font-medium mt-1.5 leading-relaxed">{item.desc}</p>
                      </div>

                      <div className="pt-3 border-t border-zinc-200/60">
                        <p className="text-[11px] font-bold text-zinc-400 truncate">{item.sample}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 탭 1: 기록별 4단계 공개 범위 관리 */}
      {activeTab === 'records' && (
        <div className="mt-8 space-y-6">
          
          {/* 가이드 배너 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-zinc-200/80 shadow-sm">
              <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider flex items-center gap-1.5">
                <Globe size={13} /> {currentLang === 'zh' ? '0级 全部公开' : currentLang === 'en' ? 'Level 0 Public' : '0단계 전체공개'}
              </span>
              <p className="text-xs font-bold text-zinc-700 mt-1">{currentLang === 'zh' ? '所有人均可访问' : currentLang === 'en' ? 'Anyone can view' : '누구나 열람 가능'}</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">{currentLang === 'zh' ? '包含访客在内的所有人' : currentLang === 'en' ? 'Open to everyone including guests' : '손님(GUEST) 포함 전체 오픈'}</p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-zinc-200/80 shadow-sm">
              <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider flex items-center gap-1.5">
                <Users size={13} /> {currentLang === 'zh' ? '1级 仅关注者' : currentLang === 'en' ? 'Level 1 Followers' : '1단계 팔로워공개'}
              </span>
              <p className="text-xs font-bold text-zinc-700 mt-1">{currentLang === 'zh' ? '仅关注者可访问' : currentLang === 'en' ? 'Followers only' : '팔로워만 열람 가능'}</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">{currentLang === 'zh' ? '专供关注您的用户' : currentLang === 'en' ? 'Only users who follow you' : '나를 팔로우한 유저 전용'}</p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-zinc-200/80 shadow-sm">
              <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider flex items-center gap-1.5">
                <KeyRound size={13} /> {currentLang === 'zh' ? '2级 密码保护' : currentLang === 'en' ? 'Level 2 PIN Protected' : '2단계 비밀공개'}
              </span>
              <p className="text-xs font-bold text-zinc-700 mt-1">{currentLang === 'zh' ? '需要访问密码(PIN)' : currentLang === 'en' ? 'Passcode (PIN) required' : '비밀번호(PIN) 필요'}</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">{currentLang === 'zh' ? '仅输入正确密码可看' : currentLang === 'en' ? 'Unlocked by PIN entry' : '암호 입력자만 열람'}</p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-zinc-200/80 shadow-sm">
              <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider flex items-center gap-1.5">
                <Lock size={13} /> {currentLang === 'zh' ? '4级 私密' : currentLang === 'en' ? 'Level 4 Private' : '4단계 비공개'}
              </span>
              <p className="text-xs font-bold text-zinc-700 mt-1">{currentLang === 'zh' ? '仅自己可见' : currentLang === 'en' ? 'Only me' : '나만 보기'}</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">{currentLang === 'zh' ? '不对任何外部人员展示' : currentLang === 'en' ? 'Completely hidden externally' : '외부에 절대 노출 안 됨'}</p>
            </div>
          </div>

          {/* 검색 및 필터 */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={currentLang === 'zh' ? '按记录标题或分类搜索...' : currentLang === 'en' ? 'Search by title or category...' : '기록 제목이나 카테고리로 검색...'}
                className="w-full bg-white border border-zinc-200/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-2xl py-2 pl-10 pr-4 text-xs font-bold text-zinc-800 outline-none transition-all shadow-sm"
              />
            </div>
            <span className="text-xs font-bold text-zinc-400">
              {currentLang === 'zh' ? `共 ${filteredRecords.length} 条记录` : currentLang === 'en' ? `Total ${filteredRecords.length} records` : `총 ${filteredRecords.length}개 기록`}
            </span>
          </div>

          {/* 기록 목록 테이블/카드 */}
          <div className="space-y-3">
            {filteredRecords.length > 0 ? (
              filteredRecords.map(rec => {
                const currentLevel = rec.visibilityLevel != null ? rec.visibilityLevel : (rec.isPublic ? 0 : 4);

                return (
                  <div 
                    key={rec.id}
                    className="bg-white p-4 md:p-5 rounded-2xl border border-zinc-200/80 shadow-sm hover:border-zinc-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* 좌측 정보 */}
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      {rec.image ? (
                        <img 
                          src={rec.image} 
                          alt="thumbnail" 
                          className="w-14 h-14 rounded-xl object-cover shrink-0 border border-zinc-100" 
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-400 shrink-0 font-bold text-xs">
                          {rec.category?.charAt(0) || (currentLang === 'zh' ? '记' : currentLang === 'en' ? 'R' : '기')}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded-md bg-zinc-100 border border-zinc-200/60 text-[10px] font-black text-zinc-600">
                            {rec.category || (currentLang === 'zh' ? '常规' : currentLang === 'en' ? 'General' : '기본')}
                          </span>
                          <span className="text-[11px] font-bold text-zinc-400">{rec.date}</span>
                        </div>
                        <h4 className="text-sm font-black text-zinc-900 truncate tracking-tight">{rec.title}</h4>
                        <p className="text-xs text-zinc-500 font-medium truncate mt-0.5">{rec.content || (currentLang === 'zh' ? '暂无内容' : currentLang === 'en' ? 'No content' : '작성된 내용 없음')}</p>
                      </div>
                    </div>

                    {/* 우측: 4단계 세그먼트 버튼 */}
                    <div className="bg-zinc-100 p-1 rounded-xl flex items-center shrink-0 border border-zinc-200/60 self-start md:self-center">
                      {/* 0단계 전체공개 */}
                      <button
                        onClick={() => handleVisibilityChange(rec.id, 0)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                          currentLevel === 0
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : 'text-zinc-500 hover:text-zinc-800'
                        }`}
                        title={currentLang === 'zh' ? '第0级: 所有人均可访问' : currentLang === 'en' ? 'Level 0: Anyone can view' : '0단계: 누구나 열람 가능'}
                      >
                        <Globe size={13} />
                        <span className="hidden sm:inline">{currentLang === 'zh' ? '0级' : currentLang === 'en' ? 'Lvl 0' : '0단계'}</span> {currentLang === 'zh' ? '公开' : currentLang === 'en' ? 'Public' : '전체'}
                      </button>

                      {/* 1단계 팔로워공개 */}
                      <button
                        onClick={() => handleVisibilityChange(rec.id, 1)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                          currentLevel === 1
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-zinc-500 hover:text-zinc-800'
                        }`}
                        title={currentLang === 'zh' ? '第1级: 仅限关注者访问' : currentLang === 'en' ? 'Level 1: Followers only' : '1단계: 나를 팔로우한 유저만 열람 가능'}
                      >
                        <Users size={13} />
                        <span className="hidden sm:inline">{currentLang === 'zh' ? '1级' : currentLang === 'en' ? 'Lvl 1' : '1단계'}</span> {currentLang === 'zh' ? '关注者' : currentLang === 'en' ? 'Followers' : '팔로워'}
                      </button>

                      {/* 2단계 비밀공개 */}
                      <button
                        onClick={() => handleVisibilityChange(rec.id, 2)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                          currentLevel === 2
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'text-zinc-500 hover:text-zinc-800'
                        }`}
                        title={currentLang === 'zh' ? '第2级: 输入密码后访问' : currentLang === 'en' ? 'Level 2: PIN protected' : '2단계: 비밀번호(PIN) 입력자만 열람 가능'}
                      >
                        <KeyRound size={13} />
                        <span className="hidden sm:inline">{currentLang === 'zh' ? '2级' : currentLang === 'en' ? 'Lvl 2' : '2단계'}</span> {currentLang === 'zh' ? '密码' : currentLang === 'en' ? 'PIN' : '비밀'}
                      </button>

                      {/* 4단계 비공개 */}
                      <button
                        onClick={() => handleVisibilityChange(rec.id, 4)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                          currentLevel === 4
                            ? 'bg-zinc-700 text-white shadow-sm'
                            : 'text-zinc-500 hover:text-zinc-800'
                        }`}
                        title={currentLang === 'zh' ? '第4级: 仅自己可见 (外部完全屏蔽)' : currentLang === 'en' ? 'Level 4: Private (Completely hidden)' : '4단계: 나만 보기 (외부 완전 차단)'}
                      >
                        <Lock size={13} />
                        <span className="hidden sm:inline">{currentLang === 'zh' ? '4级' : currentLang === 'en' ? 'Lvl 4' : '4단계'}</span> {currentLang === 'zh' ? '私密' : currentLang === 'en' ? 'Private' : '비공개'}
                      </button>
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-zinc-200/80">
                <p className="text-sm font-bold text-zinc-400">
                  {currentLang === 'zh' ? '暂无记录或未找到搜索结果。' : currentLang === 'en' ? 'No records found.' : '등록된 기록이 없거나 검색 결과가 없습니다.'}
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* 탭 2: 팔로우 관리 */}
      {activeTab === 'followers' && (
        <div className="mt-8 space-y-6">
          
          {/* 상단 서브탭 (팔로우 요청 vs 팔로워 vs 팔로잉) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFollowSubTab('requests')}
                className={`text-sm font-black pb-2 border-b-2 transition-all flex items-center gap-1.5 ${
                  followSubTab === 'requests'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-zinc-400 hover:text-zinc-700'
                }`}
              >
                <Clock size={14} />
                <span>{t('access.follow_requests', '팔로우 요청')}</span>
                {followRequests.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black leading-none">
                    {followRequests.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setFollowSubTab('followers')}
                className={`text-sm font-black pb-2 border-b-2 transition-all ${
                  followSubTab === 'followers'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-zinc-400 hover:text-zinc-700'
                }`}
              >
                {currentLang === 'zh' ? `我的关注者 (${followers.length})` : currentLang === 'en' ? `My Followers (${followers.length})` : `나의 팔로워 (${followers.length}명)`}
              </button>
              <button
                onClick={() => setFollowSubTab('followings')}
                className={`text-sm font-black pb-2 border-b-2 transition-all ${
                  followSubTab === 'followings'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-zinc-400 hover:text-zinc-700'
                }`}
              >
                {currentLang === 'zh' ? `我关注的人 (${followings.length})` : currentLang === 'en' ? `Following (${followings.length})` : `내가 팔로우 중 (${followings.length}명)`}
              </button>
            </div>

            <button
              onClick={loadFollowData}
              disabled={isFollowLoading}
              className="p-2 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-xl transition-colors"
              title={currentLang === 'zh' ? '刷新' : currentLang === 'en' ? 'Refresh' : '새로고침'}
            >
              <RefreshCw size={16} className={isFollowLoading ? 'animate-spin text-indigo-600' : ''} />
            </button>
          </div>

          {/* 목록: 1. 팔로우 요청 대기 목록 */}
          {followSubTab === 'requests' && (
            <div className="space-y-3">
              {followRequests.length > 0 ? (
                followRequests.map(r => (
                  <div 
                    key={r.id} 
                    className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-sm flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-full bg-zinc-100 overflow-hidden shrink-0 border border-zinc-200">
                        {r.profileImageUrl ? (
                          <img src={r.profileImageUrl} alt="profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-black text-sm text-zinc-500">
                            {r.name?.charAt(0) || '?'}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-zinc-900 truncate">{r.name}</h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200">
                            {t('profile.requested', '요청됨')}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 font-bold truncate">@{r.handle}</p>
                        {r.statusMessage && (
                          <p className="text-xs text-zinc-500 font-medium truncate mt-0.5">{r.statusMessage}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={async () => {
                          const ok = await acceptFollowRequest(r.id);
                          if (ok) {
                            loadFollowData();
                          }
                        }}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-xs"
                      >
                        <Check size={14} /> {t('profile.accept', '수락')}
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await rejectFollowRequest(r.id);
                        }}
                        className="px-3 py-1.5 bg-zinc-50 hover:bg-rose-50 border border-zinc-200 hover:border-rose-200 text-zinc-600 hover:text-rose-600 rounded-xl text-xs font-black transition-all flex items-center gap-1.5"
                      >
                        <X size={14} /> {t('profile.reject', '거절')}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-2xl p-12 text-center border border-zinc-200/80">
                  <p className="text-sm font-bold text-zinc-400">
                    {t('access.no_requests', '대기 중인 팔로우 요청이 없습니다.')}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 목록 */}
          {followSubTab === 'followers' && (
            <div className="space-y-3">
              {followers.length > 0 ? (
                followers.map(f => (
                  <div 
                    key={f.id} 
                    className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-sm flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-full bg-zinc-100 overflow-hidden shrink-0 border border-zinc-200">
                        {f.profileImageUrl ? (
                          <img src={f.profileImageUrl} alt="profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-black text-sm text-zinc-500">
                            {f.name?.charAt(0) || '?'}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-black text-zinc-900 truncate">{f.name}</h4>
                        <p className="text-xs text-zinc-400 font-bold truncate">@{f.handle}</p>
                        {f.statusMessage && (
                          <p className="text-xs text-zinc-500 font-medium truncate mt-0.5">{f.statusMessage}</p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveFollower(f.id)}
                      className="px-3 py-1.5 bg-zinc-50 hover:bg-rose-50 border border-zinc-200 hover:border-rose-200 text-zinc-600 hover:text-rose-600 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <UserX size={14} /> {currentLang === 'zh' ? '移除关注者' : currentLang === 'en' ? 'Remove' : '팔로워 끊기'}
                    </button>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-2xl p-12 text-center border border-zinc-200/80">
                  <p className="text-sm font-bold text-zinc-400">
                    {currentLang === 'zh' ? '还没有用户关注您。' : currentLang === 'en' ? 'No followers yet.' : '아직 나를 팔로우한 사용자가 없습니다.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {followSubTab === 'followings' && (
            <div className="space-y-3">
              {followings.length > 0 ? (
                followings.map(f => (
                  <div 
                    key={f.id} 
                    className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-sm flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-full bg-zinc-100 overflow-hidden shrink-0 border border-zinc-200">
                        {f.profileImageUrl ? (
                          <img src={f.profileImageUrl} alt="profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-black text-sm text-zinc-500">
                            {f.name?.charAt(0) || '?'}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-black text-zinc-900 truncate">{f.name}</h4>
                        <p className="text-xs text-zinc-400 font-bold truncate">@{f.handle}</p>
                        {f.statusMessage && (
                          <p className="text-xs text-zinc-500 font-medium truncate mt-0.5">{f.statusMessage}</p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleUnfollow(f.handle)}
                      className="px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <UserMinus size={14} /> {currentLang === 'zh' ? '取消关注' : currentLang === 'en' ? 'Unfollow' : '언팔로우'}
                    </button>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-2xl p-12 text-center border border-zinc-200/80">
                  <p className="text-sm font-bold text-zinc-400">
                    {currentLang === 'zh' ? '您还没有关注任何用户。' : currentLang === 'en' ? 'Not following anyone yet.' : '내가 팔로우 중인 사용자가 없습니다.'}
                  </p>
                </div>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default AccessControlView;
