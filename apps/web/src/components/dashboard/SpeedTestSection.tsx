import React from 'react';
import { ArrowDown, ArrowUp, RefreshCw, Zap } from 'lucide-react';
import { useNetworkStore } from '../../store/useNetworkStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { measurementService } from '../../services/measurementService';

export const SpeedTestSection: React.FC = () => {
  const { speed } = useNetworkStore();
  const { lang } = useSettingsStore();

  const handleStart = () => {
    if (!speed.isRunning) {
      measurementService.runSpeedTest();
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-amber-400" />
          <h3 className="font-semibold text-slate-200 text-sm">
            {lang === 'vi' ? 'Kiểm tra tốc độ tải (On-Demand Speed Test)' : 'Bandwidth Throughput Test'}
          </h3>
        </div>

        <button
          onClick={handleStart}
          disabled={speed.isRunning}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-md ${
            speed.isRunning
              ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 active:scale-95'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${speed.isRunning ? 'animate-spin' : ''}`} />
          <span>
            {speed.isRunning
              ? lang === 'vi'
                ? 'Đang đo...'
                : 'Testing...'
              : lang === 'vi'
              ? 'Bắt đầu đo tốc độ'
              : 'Run Speed Test'}
          </span>
        </button>
      </div>

      {/* Progress Bar when testing */}
      {speed.isRunning && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>
              {speed.phase === 'download'
                ? lang === 'vi'
                  ? 'Đang kiểm tra Download (tải gói dữ liệu từ Edge Cloudflare)...'
                  : 'Testing Download from Edge CDN...'
                : lang === 'vi'
                ? 'Đang kiểm tra Upload (gửi dữ liệu lên Worker)...'
                : 'Testing Upload to Worker...'}
            </span>
            <span className="font-mono">{speed.progress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-300 rounded-full"
              style={{ width: `${speed.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Results grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ArrowDown className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">DOWNLOAD SPEED</span>
              <span className="text-lg font-mono font-bold text-white">
                {speed.downloadMbps !== null ? `${speed.downloadMbps} Mbps` : '--'}
              </span>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <ArrowUp className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">UPLOAD SPEED</span>
              <span className="text-lg font-mono font-bold text-white">
                {speed.uploadMbps !== null ? `${speed.uploadMbps} Mbps` : '--'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {speed.error && (
        <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
          {speed.error}
        </p>
      )}
    </div>
  );
};
