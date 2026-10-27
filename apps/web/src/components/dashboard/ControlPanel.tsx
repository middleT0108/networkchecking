import React from 'react';
import { Play, Pause, RotateCcw, Clock, EyeOff, Radio } from 'lucide-react';
import { useNetworkStore } from '../../store/useNetworkStore';
import { useSettingsStore } from '../../store/useSettingsStore';

export const ControlPanel: React.FC = () => {
  const { isTesting, setTesting, resetMetrics, activeEndpointName, isTabHidden } = useNetworkStore();
  const { intervalMs, setIntervalMs, chartWindowSeconds, setChartWindowSeconds, lang } = useSettingsStore();

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur space-y-4">
      {/* Tab hidden notification */}
      {isTabHidden && (
        <div className="flex items-center space-x-2 text-xs py-2 px-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-lg">
          <EyeOff className="w-4 h-4 shrink-0" />
          <span>
            {lang === 'vi'
              ? 'Tab đang chạy nền: Đã tự động giảm tần suất đo để tiết kiệm băng thông khi bạn chơi game.'
              : 'Background tab: Measurement throttled to save bandwidth during gameplay.'}
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Left: Active endpoint & Start/Pause */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setTesting(!isTesting)}
            className={`flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md ${
              isTesting
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20 active:scale-95'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20 active:scale-95'
            }`}
          >
            {isTesting ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>{lang === 'vi' ? 'Tạm dừng đo' : 'Pause Test'}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{lang === 'vi' ? 'Bắt đầu đo' : 'Start Test'}</span>
              </>
            )}
          </button>

          <button
            onClick={resetMetrics}
            title={lang === 'vi' ? 'Xóa dữ liệu đo hiện tại' : 'Reset current metrics'}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="hidden md:flex items-center space-x-2 pl-2 border-l border-slate-800">
            <Radio className="w-4 h-4 text-sky-400 animate-pulse" />
            <div className="text-xs">
              <span className="text-slate-500 block">{lang === 'vi' ? 'Mục tiêu đo:' : 'Target:'}</span>
              <span className="text-slate-200 font-medium">{activeEndpointName}</span>
            </div>
          </div>
        </div>

        {/* Right: Interval & Window selectors */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Interval */}
          <div className="flex items-center space-x-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            <Clock className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            <span className="text-slate-400 mr-1">{lang === 'vi' ? 'Chu kỳ:' : 'Interval:'}</span>
            {[1000, 2000, 3000].map((ms) => (
              <button
                key={ms}
                onClick={() => setIntervalMs(ms)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  intervalMs === ms
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {ms / 1000}s
              </button>
            ))}
          </div>

          {/* Time window */}
          <div className="flex items-center space-x-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            <span className="text-slate-400 ml-2 mr-1">{lang === 'vi' ? 'Lưu trữ:' : 'Window:'}</span>
            {[60, 180, 300].map((sec) => (
              <button
                key={sec}
                onClick={() => setChartWindowSeconds(sec)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  chartWindowSeconds === sec
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
