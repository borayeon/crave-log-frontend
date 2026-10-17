import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldCheck, Globe, Users, KeyRound, Lock, Eye, 
  UserCheck, UserMinus, UserX, Loader2, Search, Check, 
  AlertCircle, Sparkles, RefreshCw, ChevronRight, X
} from 'lucide-react';
import { useAppStore } from '../store/AppStore';

const AccessControlView = () => {
  const { apiFetch, showToast, records, fetchAllData } = useAppStore();
  const [activeTab, setActiveTab] = useState('records'); // 'records' | 'followers'
  const [searchQuery, setSearchQuery] = useState('');

  // 팔로우 관련 상태
  const [followers, setFollowers] = useState([]);
  const [followings, setFollowings] = useState([]);
  const [followSubTab, setFollowSubTab] = useState('followers'); // 'followers' | 'followings'
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

  // 팔로우 목록 불러오기
  const loadFollowData = useCallback(async () => {
    try {
      setIsFollowLoading(true);
      const [followersRes, followingsRes] = await Promise.all([
        apiFetch('/me/followers'),
        apiFetch('/me/followings'),
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
  }, [apiFetch]);

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
        const levelNames = { 0: '전체 공개(0단계)', 1: '팔로워 공개(1단계)', 4: '비공개(4단계)' };
        showToast(`🔒 ${levelNames[targetLevel]}로 변경되었습니다.`);
        fetchAllData(true);
      } else {
        showToast('공개 범위 변경에 실패했습니다.');
      }
    } catch (err) {
      console.error('Visibility update error:', err);
      showToast('오류가 발생했습니다.');
    }
  };

  // 2단계 PIN 저장 핸들러
  const handleSavePin = async (e) => {
    e.preventDefault();
    if (!pinModalRecord) return;
    if (!newPin.trim()) {
      showToast('비밀번호를 입력해주세요.');
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
        showToast('🔐 비밀 공개(2단계) 설정 및 PIN 저장이 완료되었습니다.');
        setPinModalRecord(null);
        setNewPin('');
        fetchAllData(true);
      } else {
        showToast('설정 저장에 실패했습니다.');
      }
    } catch (err) {
      console.error('Save pin error:', err);
      showToast('오류가 발생했습니다.');
    } finally {
      setIsSavingPin(false);
    }
  };

  // 2. 팔로워 끊기 (삭제)
  const handleRemoveFollower = async (followerId) => {
    if (!window.confirm('이 사용자의 팔로우를 해제하시겠습니까? (상대방은 더 이상 내 팔로워 공개 글을 볼 수 없습니다)')) return;

    try {
      const res = await apiFetch(`/me/followers/${followerId}`, { method: 'DELETE' });
      if (res?.ok) {
        setFollowers(prev => prev.filter(f => f.id !== followerId));
        showToast('팔로워가 삭제되었습니다.');
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
        showToast(`@${targetHandle} 팔로우를 취소했습니다.`);
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
              2단계 비밀 공개 PIN 설정
            </h3>
            <p className="text-xs text-zinc-500 font-semibold mt-1 mb-5 break-keep">
              &quot;{pinModalRecord.title}&quot; 기록을 열람할 수 있는 비밀번호(PIN)를 입력하세요.
            </p>

            <form onSubmit={handleSavePin} className="space-y-4">
              <div>
                <input
                  type="password"
                  autoFocus
                  value={newPin}
                  onChange={e => setNewPin(e.target.value)}
                  placeholder="새 비밀번호 입력 (예: 1234)"
                  className="w-full bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-2xl py-3 px-4 text-sm font-black tracking-widest text-zinc-900 outline-none transition-all"
                />
                <p className="text-[11px] text-zinc-400 font-medium mt-2">
                  이 비밀번호를 알고 있는 사람만 해당 기록을 열람할 수 있습니다.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPinModalRecord(null)}
                  className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 rounded-xl text-xs font-black transition-all"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSavingPin || !newPin.trim()}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isSavingPin ? <Loader2 size={16} className="animate-spin" /> : '비밀 공개 저장'}
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
            기록 공개 권한 및 팔로우 관리
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 font-semibold mt-1">
            내 기록의 공개 범위(0단계 전체공개 ~ 4단계 비공개)를 설정하고, 나를 팔로우하는 관계를 안전하게 관리합니다.
          </p>
        </div>

        {/* 메인 탭 전환 (기록 공개 관리 vs 팔로우 관리) */}
        <div className="flex items-center bg-zinc-100 p-1.5 rounded-2xl border border-zinc-200/80 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('records')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'records'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Lock size={14} className={activeTab === 'records' ? 'text-indigo-600' : ''} />
            기록 공개범위 설정 ({localRecords.length})
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
            팔로우 관리 ({followers.length})
          </button>
        </div>
      </div>

      {/* 탭 1: 기록별 4단계 공개 범위 관리 */}
      {activeTab === 'records' && (
        <div className="mt-8 space-y-6">
          
          {/* 가이드 배너 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-zinc-200/80 shadow-sm">
              <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider flex items-center gap-1.5">
                <Globe size={13} /> 0단계 전체공개
              </span>
              <p className="text-xs font-bold text-zinc-700 mt-1">누구나 열람 가능</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">손님(GUEST) 포함 전체 오픈</p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-zinc-200/80 shadow-sm">
              <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider flex items-center gap-1.5">
                <Users size={13} /> 1단계 팔로워공개
              </span>
              <p className="text-xs font-bold text-zinc-700 mt-1">팔로워만 열람 가능</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">나를 팔로우한 유저 전용</p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-zinc-200/80 shadow-sm">
              <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider flex items-center gap-1.5">
                <KeyRound size={13} /> 2단계 비밀공개
              </span>
              <p className="text-xs font-bold text-zinc-700 mt-1">비밀번호(PIN) 필요</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">암호 입력자만 열람</p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-zinc-200/80 shadow-sm">
              <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider flex items-center gap-1.5">
                <Lock size={13} /> 4단계 비공개
              </span>
              <p className="text-xs font-bold text-zinc-700 mt-1">나만 보기</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">외부에 절대 노출 안 됨</p>
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
                placeholder="기록 제목이나 카테고리로 검색..."
                className="w-full bg-white border border-zinc-200/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-2xl py-2 pl-10 pr-4 text-xs font-bold text-zinc-800 outline-none transition-all shadow-sm"
              />
            </div>
            <span className="text-xs font-bold text-zinc-400">총 {filteredRecords.length}개 기록</span>
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
                          {rec.category?.charAt(0) || '기록'}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded-md bg-zinc-100 border border-zinc-200/60 text-[10px] font-black text-zinc-600">
                            {rec.category || '기본'}
                          </span>
                          <span className="text-[11px] font-bold text-zinc-400">{rec.date}</span>
                        </div>
                        <h4 className="text-sm font-black text-zinc-900 truncate tracking-tight">{rec.title}</h4>
                        <p className="text-xs text-zinc-500 font-medium truncate mt-0.5">{rec.content || '작성된 내용 없음'}</p>
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
                        title="0단계: 누구나 열람 가능"
                      >
                        <Globe size={13} />
                        <span className="hidden sm:inline">0단계</span> 전체
                      </button>

                      {/* 1단계 팔로워공개 */}
                      <button
                        onClick={() => handleVisibilityChange(rec.id, 1)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                          currentLevel === 1
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-zinc-500 hover:text-zinc-800'
                        }`}
                        title="1단계: 나를 팔로우한 유저만 열람 가능"
                      >
                        <Users size={13} />
                        <span className="hidden sm:inline">1단계</span> 팔로워
                      </button>

                      {/* 2단계 비밀공개 */}
                      <button
                        onClick={() => handleVisibilityChange(rec.id, 2)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                          currentLevel === 2
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'text-zinc-500 hover:text-zinc-800'
                        }`}
                        title="2단계: 비밀번호(PIN) 입력자만 열람 가능"
                      >
                        <KeyRound size={13} />
                        <span className="hidden sm:inline">2단계</span> 비밀
                      </button>

                      {/* 4단계 비공개 */}
                      <button
                        onClick={() => handleVisibilityChange(rec.id, 4)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                          currentLevel === 4
                            ? 'bg-zinc-700 text-white shadow-sm'
                            : 'text-zinc-500 hover:text-zinc-800'
                        }`}
                        title="4단계: 나만 보기 (외부 완전 차단)"
                      >
                        <Lock size={13} />
                        <span className="hidden sm:inline">4단계</span> 비공개
                      </button>
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-zinc-200/80">
                <p className="text-sm font-bold text-zinc-400">등록된 기록이 없거나 검색 결과가 없습니다.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* 탭 2: 팔로우 관리 */}
      {activeTab === 'followers' && (
        <div className="mt-8 space-y-6">
          
          {/* 상단 서브탭 (팔로워 vs 팔로잉) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFollowSubTab('followers')}
                className={`text-sm font-black pb-2 border-b-2 transition-all ${
                  followSubTab === 'followers'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-zinc-400 hover:text-zinc-700'
                }`}
              >
                나의 팔로워 ({followers.length}명)
              </button>
              <button
                onClick={() => setFollowSubTab('followings')}
                className={`text-sm font-black pb-2 border-b-2 transition-all ${
                  followSubTab === 'followings'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-zinc-400 hover:text-zinc-700'
                }`}
              >
                내가 팔로우 중 ({followings.length}명)
              </button>
            </div>

            <button
              onClick={loadFollowData}
              disabled={isFollowLoading}
              className="p-2 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-xl transition-colors"
              title="새로고침"
            >
              <RefreshCw size={16} className={isFollowLoading ? 'animate-spin text-indigo-600' : ''} />
            </button>
          </div>

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
                      <UserX size={14} /> 팔로워 끊기
                    </button>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-2xl p-12 text-center border border-zinc-200/80">
                  <p className="text-sm font-bold text-zinc-400">아직 나를 팔로우한 사용자가 없습니다.</p>
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
                      <UserMinus size={14} /> 언팔로우
                    </button>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-2xl p-12 text-center border border-zinc-200/80">
                  <p className="text-sm font-bold text-zinc-400">내가 팔로우 중인 사용자가 없습니다.</p>
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
