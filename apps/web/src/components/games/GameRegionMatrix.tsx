import React from 'react';
import { Crown, Check, AlertCircle, Radio, Sparkles } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { gameService } from '../../services/gameService';

export const GameRegionMatrix: React.FC = () => {
  const { getSelectedGame, selectedRegionId, regionResults, isBenchmarkingAll } = useGameStore();
  const { lang } = useSettingsStore();
  const game = getSelectedGame();

  const handleBenchmarkAll = () => {
    gameService.benchmarkCurrentGameRegions();
  };

  const handleSelectRegion = (regionId: string) => {
    gameService.selectActiveGameRegion(game.id, regionId);
  };

  // Find lowest RTT among success results
  const successResults = Object.values(regionResults).filter((r) => r.status === 'success' && r.rtt > 0);
  const bestRtt = successResults.length > 0 ? Math.min(...successResults.map((r) => r.rtt)) : null;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-lg backdrop-blur space-y-5">
      {/* Header & Parallel Test Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-slate-100 text-base">
              {game.name} - {lang === 'vi' ? 'Các cụm máy chủ khu vực' : 'Regional Game Servers'}
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">
              {game.regions.length} regions
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'vi'
              ? 'Đo song song nhiều server để chọn ra khu vực có ping thấp nhất cho tài khoản của bạn.'
              : 'Benchmark all regional routes simultaneously to find your optimal matchmaking server.'}
          </p>
        </div>

        <button
          onClick={handleBenchmarkAll}
          disabled={isBenchmarkingAll}
          className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shrink-0 ${
            isBenchmarkingAll
              ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white shadow-sky-500/20 active:scale-95'
          }`}
        >
          <Sparkles className={`w-4 h-4 ${isBenchmarkingAll ? 'animate-spin' : ''}`} />
          <span>
            {isBenchmarkingAll
              ? lang === 'vi'
                ? 'Đang đo song song...'
                : 'Benchmarking all...'
              : lang === 'vi'
              ? 'Đo song song tất cả Region'
              : 'Benchmark All Regions'}
          </span>
        </button>
      </div>

      {/* Grid of Regions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {game.regions.map((region) => {
          const result = regionResults[region.id];
          const isSelected = region.id === selectedRegionId;
          const isBest = bestRtt !== null && result?.status === 'success' && result.rtt === bestRtt;

          // Quality color
          let pingColor = 'text-slate-400';
          let borderHighlight = isSelected ? 'border-sky-500' : 'border-slate-800';
          if (result?.status === 'success') {
            if (result.rtt <= game.thresholds.greatPing) pingColor = 'text-emerald-400';
            else if (result.rtt <= game.thresholds.okPing) pingColor = 'text-sky-400';
            else pingColor = 'text-amber-400';
          }

          if (isBest) {
            borderHighlight = 'border-emerald-500 shadow-emerald-500/10 shadow-lg';
          }

          return (
            <div
              key={region.id}
              className={`bg-slate-850/80 rounded-xl p-4 border transition-all flex flex-col justify-between space-y-3 relative overflow-hidden ${borderHighlight}`}
            >
              {/* Best Badge */}
              {isBest && (
                <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 px-2.5 py-0.5 rounded-bl-lg font-bold text-[10px] flex items-center space-x-1 shadow-sm">
                  <Crown className="w-3 h-3 fill-current" />
                  <span>{lang === 'vi' ? 'TỐT NHẤT' : 'BEST ROUTE'}</span>
                </div>
              )}

              {/* Title & verification */}
              <div>
                <div className="flex items-center space-x-1.5 pr-14">
                  <span className="font-bold text-slate-200 text-sm">{region.name}</span>
                </div>

                <div className="flex items-center space-x-2 mt-1">
                  {region.verified ? (
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>{lang === 'vi' ? 'Đã xác thực Edge' : 'Verified Edge'}</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-amber-400 flex items-center space-x-1" title={region.note}>
                      <AlertCircle className="w-3 h-3" />
                      <span>{lang === 'vi' ? 'Cần kiểm tra lại (TODO)' : 'Unverified (TODO)'}</span>
                    </span>
                  )}
                </div>

                {region.note && (
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                    {region.note}
                  </p>
                )}
              </div>

              {/* Latency display & Selection button */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">LATENCY (RTT)</span>
                  <div className="flex items-baseline space-x-1">
                    {result?.status === 'measuring' ? (
                      <span className="text-xs text-sky-400 animate-pulse font-mono">Đang đo...</span>
                    ) : result?.status === 'success' ? (
                      <>
                        <span className={`text-xl font-extrabold font-mono ${pingColor}`}>
                          {result.rtt}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">ms</span>
                      </>
                    ) : result?.status === 'timeout' ? (
                      <span className="text-xs text-rose-400 font-mono">Timeout</span>
                    ) : (
                      <span className="text-xs text-slate-500 font-mono">Chưa đo</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleSelectRegion(region.id)}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  <Radio className={`w-3.5 h-3.5 ${isSelected ? 'text-sky-400 animate-pulse' : 'text-slate-400'}`} />
                  <span>{isSelected ? (lang === 'vi' ? 'Đang đo trực tiếp' : 'Active') : (lang === 'vi' ? 'Chọn' : 'Select')}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
