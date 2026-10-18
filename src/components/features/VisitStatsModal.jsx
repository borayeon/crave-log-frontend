import React, { useState, useEffect } from 'react';
import { X as CloseIcon, TrendingUp, Users, Calendar, Award, Loader2 } from 'lucide-react';
import { useAppStore } from '../../store/AppStore';

const VisitStatsModal = ({ handle, onClose }) => {
  const { apiFetch, currentLang } = useAppStore();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchStats = async () => {
      if (!handle) return;
      try {
        setIsLoading(true);
        const res = await apiFetch(`/users/${handle}/visit-stats`);
        if (res?.ok) {
          const data = await res.json();
          if (!cancelled) {
            setStats(data);
          }
        }
      } catch (err) {
        console.error('Visit stats load error:', err);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      cancelled = true;
    };
  }, [handle, apiFetch]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const todayCount = stats?.todayVisits || 0;
  const yesterdayCount = stats?.yesterdayVisits || 0;
  const diff = todayCount - yesterdayCount;
  const highestCount = stats?.highestVisits || Math.max(...(stats?.recentDays?.map(d => d.count) || [1]), 1);

  return (
    <div 
      className="fixed inset-0 z-[400] bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative border border-zinc-100" 
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-gradient-to-r from-zinc-50 to-indigo-50/30">
          <div>
            <h3 className="text-lg font-black text-zinc-900 flex items-center gap-2">
              <TrendingUp className="text-indigo-600" size={20} /> 
              {currentLang === 'zh' ? '访客统计分析' : currentLang === 'en' ? 'Visitor Analytics' : '방문자 통계 분석'}
            </h3>
            <p className="text-xs text-zinc-500 font-bold mt-1">
              {currentLang === 'zh' 
                ? `@${handle} 个人主页的日访问及近7天访客趋势。` 
                : currentLang === 'en' 
                ? `Daily and 7-day visitor trends for @${handle}'s profile.` 
                : `@${handle} 프로필의 일간 및 최근 7일간 방문자 추이입니다.`}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 bg-white hover:bg-zinc-100 rounded-full text-zinc-400 hover:text-zinc-700 transition-colors border border-zinc-200/60 shadow-sm"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* 바디 */}
        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-xs font-bold text-zinc-400">
                {currentLang === 'zh' ? '正在分析统计数据...' : currentLang === 'en' ? 'Analyzing statistics...' : '통계 데이터를 분석하는 중...'}
              </p>
            </div>
          ) : (
            <>
              {/* 핵심 지표 KPI 그리드 */}
              <div className="grid grid-cols-3 gap-3">
                {/* 1. Today */}
                <div className="bg-gradient-to-br from-indigo-50/80 to-white p-4 rounded-2xl border border-indigo-100 shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] font-black uppercase text-indigo-500 tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Today
                  </span>
                  <div className="mt-2 mb-1">
                    <span className="text-2xl font-black text-zinc-900 tracking-tight">
                      {todayCount.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-zinc-500 ml-1">
                      {currentLang === 'zh' ? '人' : currentLang === 'en' ? '' : '명'}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold ${diff > 0 ? 'text-emerald-600' : diff < 0 ? 'text-rose-500' : 'text-zinc-400'}`}>
                    {diff > 0 
                      ? (currentLang === 'zh' ? `▲ 较昨日 +${diff}` : currentLang === 'en' ? `▲ +${diff} vs yesterday` : `▲ 어제보다 +${diff}`) 
                      : diff < 0 
                      ? (currentLang === 'zh' ? `▼ 较昨日 ${diff}` : currentLang === 'en' ? `▼ ${diff} vs yesterday` : `▼ 어제보다 ${diff}`) 
                      : (currentLang === 'zh' ? '与昨日相同' : currentLang === 'en' ? 'Same as yesterday' : '어제와 동일')}
                  </span>
                </div>

                {/* 2. Total */}
                <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200/80 shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1">
                    <Users size={12} />
                    Total
                  </span>
                  <div className="mt-2 mb-1">
                    <span className="text-2xl font-black text-zinc-900 tracking-tight">
                      {(stats?.totalVisits || 0).toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-zinc-500 ml-1">
                      {currentLang === 'zh' ? '人' : currentLang === 'en' ? '' : '명'}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-400">
                    {currentLang === 'zh' ? '累计访问量' : currentLang === 'en' ? 'Total Visits' : '누적 방문 수'}
                  </span>
                </div>

                {/* 3. Peak Day */}
                <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200/80 shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider flex items-center gap-1">
                    <Award size={12} />
                    {currentLang === 'zh' ? '最高纪录' : currentLang === 'en' ? 'Peak Record' : '최고 기록'}
                  </span>
                  <div className="mt-2 mb-1">
                    <span className="text-2xl font-black text-zinc-900 tracking-tight">
                      {highestCount.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-zinc-500 ml-1">
                      {currentLang === 'zh' ? '人' : currentLang === 'en' ? '' : '명'}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-600">
                    {currentLang === 'zh' ? '本周单日最高' : currentLang === 'en' ? 'Weekly Peak Day' : '주간 최고 방문일'}
                  </span>
                </div>
              </div>

              {/* 최근 7일 방문자 추이 바 차트 */}
              <div className="bg-zinc-50/70 border border-zinc-200/80 rounded-2xl p-5">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-xs font-black text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar size={13} className="text-indigo-500" /> 
                    {currentLang === 'zh' ? '近7天访客趋势' : currentLang === 'en' ? 'Recent 7-Day Trend' : '최근 7일 방문자 추이'}
                  </h4>
                  <span className="text-[10px] font-bold text-zinc-400">
                    {currentLang === 'zh' ? '单位: 人' : currentLang === 'en' ? 'Unit: visits' : '단위: 명'}
                  </span>
                </div>

                <div className="h-36 flex items-end justify-between gap-2 pt-6 px-1">
                  {(stats?.recentDays || []).map((item, idx) => {
                    const isToday = idx === (stats.recentDays.length - 1);
                    const ratio = highestCount > 0 ? (item.count / highestCount) : 0;
                    // 최소 높이 10%, 최대 100%
                    const barHeightPercent = Math.max(Math.round(ratio * 100), item.count > 0 ? 15 : 6);

                    return (
                      <div key={item.date} className="flex-1 flex flex-col items-center gap-2 group/bar relative">
                        {/* 툴팁 숫자 */}
                        <div className="opacity-0 group-hover/bar:opacity-100 transition-opacity absolute -top-7 bg-zinc-900 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-md pointer-events-none whitespace-nowrap z-20">
                          {item.count}{currentLang === 'zh' ? '人' : currentLang === 'en' ? ' visits' : '명'} ({item.date})
                        </div>

                        {/* 상단 수치 라벨 */}
                        <span className={`text-[10px] font-black ${isToday ? 'text-indigo-600' : 'text-zinc-500'} group-hover/bar:text-indigo-600 transition-colors`}>
                          {item.count}
                        </span>

                        {/* 막대 바 */}
                        <div className="w-full bg-zinc-200/60 rounded-t-lg h-24 flex items-end overflow-hidden p-0.5">
                          <div 
                            style={{ height: `${barHeightPercent}%` }}
                            className={`w-full rounded-t-md transition-all duration-700 ease-out ${
                              isToday 
                                ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-sm' 
                                : item.count === highestCount && item.count > 0
                                ? 'bg-gradient-to-t from-amber-500 to-amber-300'
                                : 'bg-gradient-to-t from-zinc-400 to-zinc-300 group-hover/bar:from-indigo-400 group-hover/bar:to-indigo-300'
                            }`}
                          />
                        </div>

                        {/* 날짜 라벨 */}
                        <span className={`text-[10px] font-bold tracking-tight ${isToday ? 'text-indigo-600 font-black' : 'text-zinc-400'}`}>
                          {isToday ? (currentLang === 'zh' ? '今日' : currentLang === 'en' ? 'Today' : '오늘') : item.dayLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 안내 문구 */}
              <p className="text-[11px] text-zinc-400 text-center font-medium leading-relaxed">
                {currentLang === 'zh' 
                  ? '🛡️ 防止同一访客重复计数，准确统计独立访客数 (UV)。' 
                  : currentLang === 'en' 
                  ? '🛡️ De-duplicated to measure reliable unique visitors (UV).' 
                  : '🛡️ 동일 방문자의 중복 카운트를 방지하여 신뢰할 수 있는 순수 방문자(UV)를 집계합니다.'}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisitStatsModal;
