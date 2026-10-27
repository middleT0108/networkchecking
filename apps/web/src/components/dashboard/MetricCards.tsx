import React from 'react';
import { Activity, Gauge, AlertTriangle, ArrowUpDown } from 'lucide-react';
import { useNetworkStore } from '../../store/useNetworkStore';
import { useSettingsStore } from '../../store/useSettingsStore';

export const MetricCards: React.FC = () => {
  const { metrics, speed } = useNetworkStore();
  const { lang } = useSettingsStore();
  const { ping, jitter, packetLoss } = metrics;

  // Helpers for ping color
  const getPingColor = (val: number) => {
    if (val === 0) return 'text-slate-400';
    if (val <= 30) return 'text-emerald-400';
    if (val <= 60) return 'text-sky-400';
    if (val <= 100) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getJitterColor = (val: number) => {
    if (val <= 3) return 'text-emerald-400';
    if (val <= 7) return 'text-sky-400';
    if (val <= 15) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getLossColor = (val: number) => {
    if (val === 0) return 'text-emerald-400';
    if (val < 2) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Ping Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {lang === 'vi' ? 'Độ trễ (Ping RTT)' : 'Latency (RTT)'}
          </span>
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Activity className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline space-x-2">
          <span className={`text-3xl sm:text-4xl font-extrabold font-mono tracking-tight ${getPingColor(ping.current)}`}>
            {metrics.sampleCount === 0 ? '--' : ping.current}
          </span>
          <span className="text-xs text-slate-400 font-mono">ms</span>
        </div>

        <div className="pt-2 border-t border-slate-800/80 grid grid-cols-3 gap-1 text-[11px] font-mono text-slate-400">
          <div>
            <span className="text-slate-500 block text-[10px]">MIN</span>
            <span className="text-slate-200">{ping.min}ms</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">MEDIAN</span>
            <span className="text-slate-200">{ping.median}ms</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">MAX</span>
            <span className="text-slate-200">{ping.max}ms</span>
          </div>
        </div>
      </div>

      {/* 2. Jitter Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {lang === 'vi' ? 'Độ lệch trễ (Jitter)' : 'Jitter Variation'}
          </span>
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Gauge className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline space-x-2">
          <span className={`text-3xl sm:text-4xl font-extrabold font-mono tracking-tight ${getJitterColor(jitter)}`}>
            {metrics.sampleCount < 2 ? '--' : jitter}
          </span>
          <span className="text-xs text-slate-400 font-mono">ms</span>
        </div>

        <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
          <span className="text-slate-500 block text-[10px]">P95 LATENCY</span>
          <span className="text-slate-200 font-mono">{ping.p95}ms (95% mẫu dưới mức này)</span>
        </div>
      </div>

      {/* 3. Packet Loss Card (Ước lượng) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {lang === 'vi' ? 'Mất gói tin' : 'Packet Loss'}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
              {lang === 'vi' ? 'Ước lượng' : 'Estimated'}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline space-x-2">
          <span className={`text-3xl sm:text-4xl font-extrabold font-mono tracking-tight ${getLossColor(packetLoss)}`}>
            {metrics.sampleCount === 0 ? '--' : packetLoss}
          </span>
          <span className="text-xs text-slate-400 font-mono">%</span>
        </div>

        <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
          <span>{lang === 'vi' ? 'Mẫu lỗi / Timeout:' : 'Dropped samples:'}</span>
          <span className="text-slate-200 font-mono font-medium">{metrics.lossCount} mẫu</span>
        </div>
      </div>

      {/* 4. Speed Down/Up Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {lang === 'vi' ? 'Băng thông Down/Up' : 'Bandwidth Down/Up'}
          </span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ArrowUpDown className="w-4 h-4" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block font-semibold">DOWNLOAD</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-400">
                {speed.downloadMbps !== null ? speed.downloadMbps : '--'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Mbps</span>
            </div>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block font-semibold">UPLOAD</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl sm:text-2xl font-extrabold font-mono text-sky-400">
                {speed.uploadMbps !== null ? speed.uploadMbps : '--'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Mbps</span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
          <span>{speed.phase === 'complete' ? 'Đã kiểm tra gần nhất' : 'Đo theo yêu cầu (On-Demand)'}</span>
        </div>
      </div>
    </div>
  );
};
