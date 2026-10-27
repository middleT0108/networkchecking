import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid
} from 'recharts';
import { Activity } from 'lucide-react';
import { useNetworkStore, ChartPoint } from '../../store/useNetworkStore';
import { useSettingsStore } from '../../store/useSettingsStore';

// Custom Tooltip
interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: ChartPoint }>;
  label?: string;
}

const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-750 p-3 rounded-xl shadow-2xl text-xs space-y-1 font-mono">
        <p className="text-slate-400 font-sans">{label}</p>
        <div className="flex items-center justify-between space-x-4">
          <span className="text-slate-300">Ping RTT:</span>
          <span className="font-bold text-sky-400">{data.ping} ms</span>
        </div>
        <div className="flex items-center justify-between space-x-4">
          <span className="text-slate-300">Jitter:</span>
          <span className="font-bold text-indigo-400">{data.jitter} ms</span>
        </div>
      </div>
    );
  }
  return null;
};

export const RealtimePingChart: React.FC = () => {
  const { chartData, metrics } = useNetworkStore();
  const { chartWindowSeconds, lang } = useSettingsStore();

  // Dynamic stroke & gradient color based on current ping
  const cur = metrics.ping.current;
  let themeColor = '#38bdf8'; // sky
  if (cur > 0 && cur <= 30) themeColor = '#22c55e'; // green
  else if (cur > 30 && cur <= 60) themeColor = '#38bdf8'; // sky
  else if (cur > 60 && cur <= 100) themeColor = '#f59e0b'; // amber
  else if (cur > 100) themeColor = '#ef4444'; // rose

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-lg backdrop-blur space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-sky-400" />
          <h3 className="font-semibold text-slate-200 text-sm">
            {lang === 'vi' ? 'Biểu đồ độ trễ thời gian thực' : 'Real-time Latency Stream'}
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            ({chartWindowSeconds}s gần nhất)
          </span>
        </div>

        {/* Legend for thresholds */}
        <div className="flex items-center space-x-3 text-[11px] text-slate-400">
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-0.5 bg-emerald-400 inline-block" />
            <span>&le; 30ms ({lang === 'vi' ? 'Lý tưởng' : 'Ideal'})</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-0.5 bg-amber-400 inline-block" />
            <span>&le; 60ms ({lang === 'vi' ? 'Chấp nhận' : 'Fair'})</span>
          </div>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full pt-2">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm font-medium">
            {lang === 'vi' ? 'Đang thu thập mẫu đo...' : 'Collecting stream samples...'}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="pingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={themeColor} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={themeColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

              <XAxis
                dataKey="time"
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickLine={false}
                minTickGap={40}
              />

              <YAxis
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickLine={false}
                domain={[0, (dataMax: number) => Math.max(80, Math.ceil(dataMax * 1.25))]}
                unit="ms"
              />

              <Tooltip content={<CustomTooltip />} />

              {/* Threshold reference lines */}
              <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="4 4" strokeOpacity={0.6} />
              <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="4 4" strokeOpacity={0.6} />

              <Area
                type="monotone"
                dataKey="ping"
                stroke={themeColor}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#pingGradient)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
