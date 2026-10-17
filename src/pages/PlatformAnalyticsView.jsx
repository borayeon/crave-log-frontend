import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity, Users, Eye, TrendingUp, BarChart3, Monitor, 
  Smartphone, Globe, Clock, ArrowUpRight, ArrowDownRight, 
  Sparkles, RefreshCw, ShieldCheck, Database, Layers,
  ChevronRight, Laptop, Tablet
} from 'lucide-react';
import { useAppStore } from '../store/AppStore';

const PlatformAnalyticsView = () => {
  const { apiFetch, showToast } = useAppStore();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rangeDays, setRangeDays] = useState(14);
  const [hoveredBar, setHoveredBar] = useState(null);

  const fetchOverview = useCallback(async (days = rangeDays) => {
    try {
      setIsLoading(true);
      const res = await apiFetch(`/analytics/overview?days=${days}`);
      if (res?.ok) {
        const json = await res.json();
        setData(json);
      } else {
        showToast('통계 데이터를 불러오지 못했습니다.');
      }
    } catch (err) {
      console.error('Analytics fetch error:', err);
      showToast('통계 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [apiFetch, rangeDays, showToast]);

  useEffect(() => {
    fetchOverview(rangeDays);
  }, [rangeDays, fetchOverview]);

  // 지표 계산
  const todayUv = data?.todayUv || 0;
  const yesterdayUv = data?.yesterdayUv || 0;
  const uvDiff = todayUv - yesterdayUv;
  const uvPct = yesterdayUv > 0 ? Math.round(((todayUv - yesterdayUv) / yesterdayUv) * 100) : 0;

  const todayPv = data?.todayPv || 0;
  const yesterdayPv = data?.yesterdayPv || 0;
  const pvDiff = todayPv - yesterdayPv;

  const totalUv = data?.totalUv || 0;
  const totalPv = data?.totalPv || 0;
  const totalUsers = data?.totalUsers || 0;
  const totalRecords = data?.totalRecords || 0;

  // 차트 최대값 계산
  const maxUv = Math.max(...(data?.recentDailyStats?.map(d => d.uv) || [1]), 1);
  const maxPv = Math.max(...(data?.recentDailyStats?.map(d => d.pv) || [1]), 1);

  return (
    <div className="max-w-[1200px] mx-auto w-full pb-16 px-4 md:px-8 pt-6 md:pt-10 animate-in fade-in duration-300">
      
      {/* 1. 대시보드 헤더 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-zinc-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wider uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Live Monitoring
            </span>
            <span className="text-xs font-bold text-zinc-400">|</span>
            <span className="text-xs font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
              Developer Analytics
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-2.5">
            <Activity className="text-indigo-600 w-7 h-7" /> 플랫폼 사용량 및 트래픽 통계
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 font-semibold mt-1">
            CraveLog 서비스 전체에 유입된 방문자 수(DAU), 페이지 요청량(PV), 사용자 접속 환경을 실시간 모니터링합니다.
          </p>
        </div>

        {/* 액션 컨트롤 (조회 기간 선택 & 새로고침) */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="bg-zinc-100 p-1 rounded-xl flex items-center border border-zinc-200/80">
            {[7, 14, 30].map(days => (
              <button
                key={days}
                onClick={() => setRangeDays(days)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                  rangeDays === days
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                {days}일
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchOverview(rangeDays)}
            disabled={isLoading}
            className="p-2.5 bg-white hover:bg-zinc-50 text-zinc-700 rounded-xl border border-zinc-200/80 shadow-sm transition-all active:scale-95 disabled:opacity-50"
            title="새로고침"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin text-indigo-600' : ''} />
          </button>
        </div>
      </div>

      {/* 2. 상단 핵심 지표 KPI 카드 (4개 그리드) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        
        {/* KPI 1: 오늘 순 방문자 (Today UV) */}
        <div className="bg-gradient-to-br from-indigo-50/70 via-white to-white p-5 rounded-2xl border border-indigo-100/80 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
              <Users size={14} className="text-indigo-600" /> 오늘 순 방문자 (UV)
            </span>
            <span className="p-2 rounded-xl bg-indigo-100/60 text-indigo-600">
              <Sparkles size={16} />
            </span>
          </div>
          <div>
            <div className="text-3xl font-black text-zinc-900 tracking-tight">
              {todayUv.toLocaleString()}
              <span className="text-sm font-bold text-zinc-500 ml-1.5">명</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs font-bold">
              {uvDiff > 0 ? (
                <span className="inline-flex items-center text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  <ArrowUpRight size={14} /> +{uvDiff}명 ({uvPct > 0 ? `+${uvPct}%` : '어제 대비 상승'})
                </span>
              ) : uvDiff < 0 ? (
                <span className="inline-flex items-center text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md">
                  <ArrowDownRight size={14} /> {uvDiff}명 (어제 대비 감소)
                </span>
              ) : (
                <span className="text-zinc-400 bg-zinc-50 px-2 py-0.5 rounded-md">어제와 동일</span>
              )}
            </div>
          </div>
        </div>

        {/* KPI 2: 오늘 페이지뷰/요청 (Today PV) */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-zinc-600 uppercase tracking-wider flex items-center gap-1.5">
              <Eye size={14} className="text-violet-600" /> 오늘 페이지뷰 (PV)
            </span>
            <span className="p-2 rounded-xl bg-violet-50 text-violet-600">
              <Activity size={16} />
            </span>
          </div>
          <div>
            <div className="text-3xl font-black text-zinc-900 tracking-tight">
              {todayPv.toLocaleString()}
              <span className="text-sm font-bold text-zinc-500 ml-1.5">회</span>
            </div>
            <div className="mt-2 text-xs font-bold text-zinc-400">
              {pvDiff > 0 ? `어제보다 +${pvDiff}회 요청` : pvDiff < 0 ? `어제보다 ${pvDiff}회 요청` : '어제와 동일한 요청량'}
            </div>
          </div>
        </div>

        {/* KPI 3: 누적 방문자 (Total Platform UV) */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-zinc-600 uppercase tracking-wider flex items-center gap-1.5">
              <Globe size={14} className="text-emerald-600" /> 누적 순 방문자 (Total UV)
            </span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <BarChart3 size={16} />
            </span>
          </div>
          <div>
            <div className="text-3xl font-black text-zinc-900 tracking-tight">
              {totalUv.toLocaleString()}
              <span className="text-sm font-bold text-zinc-500 ml-1.5">명</span>
            </div>
            <div className="mt-2 text-xs font-bold text-zinc-400">
              누적 총 요청량: <span className="font-black text-zinc-700">{totalPv.toLocaleString()}회</span>
            </div>
          </div>
        </div>

        {/* KPI 4: 플랫폼 현황 (가입자 & 기록 수) */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-zinc-600 uppercase tracking-wider flex items-center gap-1.5">
              <Database size={14} className="text-amber-500" /> 플랫폼 서비스 규모
            </span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-500">
              <Layers size={16} />
            </span>
          </div>
          <div>
            <div className="text-3xl font-black text-zinc-900 tracking-tight">
              {totalUsers.toLocaleString()}
              <span className="text-sm font-bold text-zinc-500 ml-1.5">유저</span>
            </div>
            <div className="mt-2 text-xs font-bold text-zinc-400">
              총 아카이브 기록: <span className="font-black text-zinc-700">{totalRecords.toLocaleString()}개</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. 최근 N일 트래픽 추이 인터랙티브 차트 */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-black text-zinc-900 flex items-center gap-2">
              <TrendingUp size={18} className="text-indigo-600" /> 일별 접속자(UV) & 페이지뷰(PV) 추이
            </h3>
            <p className="text-xs text-zinc-400 font-bold mt-0.5">
              최근 {rangeDays}일 동안의 순 방문자 및 페이지 요청량 변동 현황입니다.
            </p>
          </div>

          {/* 범례 (Legend) */}
          <div className="flex items-center gap-4 text-xs font-black">
            <span className="flex items-center gap-1.5 text-indigo-600">
              <span className="w-3 h-3 rounded-md bg-indigo-600" /> 순 방문자 (UV)
            </span>
            <span className="flex items-center gap-1.5 text-violet-400">
              <span className="w-3 h-3 rounded-md bg-violet-400" /> 페이지뷰 (PV)
            </span>
          </div>
        </div>

        {/* 바 차트 렌더링 영역 */}
        <div className="h-64 flex items-end justify-between gap-1.5 sm:gap-3 pt-10 pb-2 px-1 relative">
          {(data?.recentDailyStats || []).map((item, idx) => {
            const isToday = idx === (data.recentDailyStats.length - 1);
            const isHovered = hoveredBar === item.date;

            // 높이 비율 계산 (최소 6%, 최대 100%)
            const uvHeightPct = Math.max(Math.round((item.uv / maxUv) * 100), item.uv > 0 ? 15 : 6);
            const pvHeightPct = Math.max(Math.round((item.pv / maxPv) * 100), item.pv > 0 ? 15 : 6);

            return (
              <div 
                key={item.date} 
                className="flex-1 flex flex-col items-center gap-2 group relative h-full justify-end cursor-pointer"
                onMouseEnter={() => setHoveredBar(item.date)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {/* 호버 시 상세 툴팁 */}
                {isHovered && (
                  <div className="absolute -top-16 bg-zinc-900 text-white rounded-xl px-3 py-2 text-[11px] shadow-xl pointer-events-none z-30 whitespace-nowrap animate-in fade-in duration-150">
                    <div className="font-black text-zinc-300 border-b border-zinc-700/80 pb-1 mb-1">
                      {item.date} {isToday ? '(오늘)' : ''}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-indigo-400 font-bold">UV: {item.uv}명</span>
                      <span className="text-violet-300 font-bold">PV: {item.pv}회</span>
                    </div>
                  </div>
                )}

                {/* 듀얼 바 그룹 (UV 바 & PV 바) */}
                <div className="w-full flex items-end justify-center gap-1 h-44">
                  {/* UV Bar */}
                  <div className="w-1/2 bg-zinc-100 rounded-t-md h-full flex items-end overflow-hidden">
                    <div 
                      style={{ height: `${uvHeightPct}%` }}
                      className={`w-full rounded-t-sm transition-all duration-500 ease-out ${
                        isToday 
                          ? 'bg-gradient-to-t from-indigo-700 to-indigo-500 shadow-sm'
                          : 'bg-indigo-600/80 group-hover:bg-indigo-600'
                      }`}
                    />
                  </div>

                  {/* PV Bar */}
                  <div className="w-1/2 bg-zinc-100 rounded-t-md h-full flex items-end overflow-hidden">
                    <div 
                      style={{ height: `${pvHeightPct}%` }}
                      className={`w-full rounded-t-sm transition-all duration-500 ease-out ${
                        isToday 
                          ? 'bg-gradient-to-t from-violet-600 to-violet-400 shadow-sm'
                          : 'bg-violet-300 group-hover:bg-violet-400'
                      }`}
                    />
                  </div>
                </div>

                {/* 하단 날짜 라벨 */}
                <span className={`text-[10px] font-bold tracking-tight ${isToday ? 'text-indigo-600 font-black' : 'text-zinc-400 group-hover:text-zinc-700'}`}>
                  {isToday ? '오늘' : item.dayLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. 세부 통계 그리드 (3개 컬럼: 디바이스 점유율 / 환경 / 인기 페이지) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* 컬럼 1: 디바이스 점유율 (Device Share) */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm">
          <h4 className="text-sm font-black text-zinc-900 flex items-center gap-2 mb-1">
            <Monitor size={16} className="text-indigo-600" /> 접속 기기 점유율
          </h4>
          <p className="text-xs text-zinc-400 font-semibold mb-6">모바일 vs 데스크톱 접속 비중</p>

          <div className="space-y-4">
            {(data?.deviceShare || []).map(device => {
              const isDesktop = device.name === '데스크톱';
              const isMobile = device.name === '모바일';

              return (
                <div key={device.name} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-black">
                    <span className="flex items-center gap-1.5 text-zinc-700">
                      {isDesktop && <Laptop size={14} className="text-indigo-500" />}
                      {isMobile && <Smartphone size={14} className="text-emerald-500" />}
                      {!isDesktop && !isMobile && <Tablet size={14} className="text-amber-500" />}
                      {device.name}
                    </span>
                    <span className="text-zinc-900">{device.percentage}% <span className="text-zinc-400 font-normal">({device.value}회)</span></span>
                  </div>
                  <div className="w-full bg-zinc-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      style={{ width: `${device.percentage}%` }}
                      className={`h-full rounded-full transition-all duration-700 ${
                        isDesktop ? 'bg-indigo-600' : isMobile ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-400 font-bold">
            <span className="flex items-center gap-1">
              <ShieldCheck size={14} className="text-emerald-600" /> 모바일 반응형 최적화 완료
            </span>
          </div>
        </div>

        {/* 컬럼 2: 브라우저 & OS 환경 */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm">
          <h4 className="text-sm font-black text-zinc-900 flex items-center gap-2 mb-1">
            <Globe size={16} className="text-violet-600" /> 브라우저 및 운영체제
          </h4>
          <p className="text-xs text-zinc-400 font-semibold mb-6">주요 유입 클라이언트 환경</p>

          <div className="space-y-4">
            <div className="text-xs font-black text-zinc-500 uppercase tracking-wider mb-2">상위 브라우저 (TOP)</div>
            {(data?.topBrowsers || []).length > 0 ? (
              (data.topBrowsers).map(b => (
                <div key={b.name} className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-700">{b.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-zinc-100 rounded-full h-2 overflow-hidden">
                      <div style={{ width: `${b.percentage}%` }} className="bg-violet-500 h-full rounded-full" />
                    </div>
                    <span className="font-black text-zinc-800 w-12 text-right">{b.percentage}%</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-400 font-medium">집계된 브라우저 데이터가 없습니다.</p>
            )}

            <div className="h-px bg-zinc-100 my-4" />

            <div className="text-xs font-black text-zinc-500 uppercase tracking-wider mb-2">상위 운영체제 (OS)</div>
            {(data?.topOs || []).length > 0 ? (
              (data.topOs).map(os => (
                <div key={os.name} className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-700">{os.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-zinc-100 rounded-full h-2 overflow-hidden">
                      <div style={{ width: `${os.percentage}%` }} className="bg-indigo-400 h-full rounded-full" />
                    </div>
                    <span className="font-black text-zinc-800 w-12 text-right">{os.percentage}%</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-400 font-medium">집계된 OS 데이터가 없습니다.</p>
            )}
          </div>
        </div>

        {/* 컬럼 3: 가장 많이 본 페이지 순위 */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm">
          <h4 className="text-sm font-black text-zinc-900 flex items-center gap-2 mb-1">
            <Layers size={16} className="text-emerald-600" /> 가장 인기 있는 기능 / 경로
          </h4>
          <p className="text-xs text-zinc-400 font-semibold mb-6">사용자가 가장 많이 방문한 화면 순위</p>

          <div className="space-y-4">
            {(data?.topPaths || []).length > 0 ? (
              (data.topPaths).map((p, idx) => (
                <div key={p.name} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-black">
                    <span className="flex items-center gap-2 text-zinc-800">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                        idx === 0 ? 'bg-indigo-600 text-white' : idx === 1 ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-600'
                      }`}>
                        {idx + 1}
                      </span>
                      {p.name}
                    </span>
                    <span className="text-zinc-600">{p.value}회 ({p.percentage}%)</span>
                  </div>
                  <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
                    <div 
                      style={{ width: `${p.percentage}%` }}
                      className={`h-full rounded-full ${
                        idx === 0 ? 'bg-indigo-600' : 'bg-zinc-400'
                      }`}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-400 font-medium">집계된 경로 데이터가 없습니다.</p>
            )}
          </div>
        </div>

      </div>

      {/* 5. 실시간 최근 접속 로그 피드 (Live Access Feed) */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm mt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-black text-zinc-900 flex items-center gap-2">
              <Clock size={16} className="text-indigo-600" /> 최근 실시간 접속 피드 (Live Access Stream)
            </h4>
            <p className="text-xs text-zinc-400 font-semibold mt-0.5">
              방금 플랫폼에 접근한 사용자의 기기, 브라우저, 접속 경로를 안전하게 확인합니다 (IP 비식별화 처리).
            </p>
          </div>
          <span className="text-xs font-bold text-zinc-400">최근 30건</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-100 text-zinc-400 font-black">
                <th className="py-2.5 px-3">접속 시간</th>
                <th className="py-2.5 px-3">마스킹 IP</th>
                <th className="py-2.5 px-3">접속 화면</th>
                <th className="py-2.5 px-3">기기</th>
                <th className="py-2.5 px-3">브라우저 / OS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {(data?.recentLogs || []).length > 0 ? (
                (data.recentLogs).map(log => (
                  <tr key={log.id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-black text-indigo-600 whitespace-nowrap">
                      {log.timeAgo}
                      <span className="text-[10px] text-zinc-400 font-medium ml-1.5 hidden sm:inline">({log.accessedAt})</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-zinc-600 font-bold whitespace-nowrap">
                      {log.ipMasked}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-zinc-800 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-zinc-100 border border-zinc-200/60">
                        {log.path}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 font-bold text-zinc-700">
                        {log.deviceType === 'MOBILE' ? '📱 Mobile' : log.deviceType === 'TABLET' ? '📟 Tablet' : '💻 Desktop'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-zinc-600 font-medium whitespace-nowrap">
                      {log.browser} • {log.os}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-400 font-medium">
                    아직 기록된 최근 접속 로그가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default PlatformAnalyticsView;
