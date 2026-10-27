import React from 'react';
import { Award, Zap } from 'lucide-react';
import { useNetworkStore } from '../../store/useNetworkStore';
import { useSettingsStore } from '../../store/useSettingsStore';

export const ScoreGauge: React.FC = () => {
  const { metrics } = useNetworkStore();
  const { lang } = useSettingsStore();
  const { quality } = metrics;

  // Calculate circular SVG progress
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (quality.score / 100) * circumference;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg backdrop-blur flex flex-col justify-between relative overflow-hidden">
      {/* Background glow based on score rating */}
      <div
        className="absolute -right-16 -top-16 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: quality.color }}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Award className="w-5 h-5 text-sky-400" />
          <h3 className="font-semibold text-slate-200 text-sm">
            {lang === 'vi' ? 'Điểm chất lượng mạng' : 'Connection Quality Score'}
          </h3>
        </div>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider"
          style={{
            backgroundColor: `${quality.color}20`,
            color: quality.color,
            border: `1px solid ${quality.color}40`
          }}
        >
          {lang === 'vi' ? quality.labelVi : quality.labelEn}
        </span>
      </div>

      {/* Center Gauge */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-4">
        <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
            {/* Background ring */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              className="text-slate-800/80"
              fill="transparent"
            />
            {/* Animated progress ring */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke={quality.color}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-500 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-4xl font-extrabold font-mono tracking-tight text-white">
              {metrics.sampleCount === 0 ? '--' : quality.score}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">/ 100</span>
          </div>
        </div>

        {/* Verdict & Details */}
        <div className="space-y-2 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start space-x-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-medium text-slate-300">
              {lang === 'vi' ? 'Đánh giá cho game FPS/Thi đấu:' : 'Competitive FPS Benchmark:'}
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
            {metrics.sampleCount === 0
              ? lang === 'vi'
                ? 'Đang khởi động phép đo baseline...'
                : 'Starting baseline measurement...'
              : quality.summary}
          </p>
        </div>
      </div>

      {/* Footer stats */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span>{lang === 'vi' ? 'Số mẫu đã đo:' : 'Total samples:'} <strong className="text-slate-200 font-mono">{metrics.sampleCount}</strong></span>
        <span>{lang === 'vi' ? 'Cửa sổ trượt:' : 'Window:'} <strong className="text-slate-200 font-mono">{metrics.windowSize}</strong> mẫu</span>
      </div>
    </div>
  );
};
