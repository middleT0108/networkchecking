import React from 'react';
import { AlertTriangle, CheckCircle, HelpCircle, Wrench, ShieldAlert } from 'lucide-react';
import { useNetworkStore } from '../../store/useNetworkStore';
import { useGameStore } from '../../store/useGameStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { analyzeNetworkDiagnostics } from '@netcheck/shared';

export const DiagnosticView: React.FC = () => {
  const { metrics } = useNetworkStore();
  const { getSelectedGame } = useGameStore();
  const { lang } = useSettingsStore();
  const game = getSelectedGame();

  const diagnostics = analyzeNetworkDiagnostics(metrics, game.category, game.thresholds);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-lg backdrop-blur space-y-2">
        <div className="flex items-center space-x-2.5">
          <Wrench className="w-5 h-5 text-sky-400" />
          <h2 className="text-lg font-bold text-slate-100">
            {lang === 'vi' ? 'Chẩn Đoán Kết Nối & Hướng Khắc Phục' : 'Network Diagnostics & Optimization'}
          </h2>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
          {lang === 'vi'
            ? `Hệ thống tự động phân tích các chỉ số mạng (Ping ${metrics.ping.median}ms, Jitter ${metrics.jitter}ms, Loss ${metrics.packetLoss}%) dựa trên tiêu chuẩn yêu cầu của tựa game ${game.name} (${game.category.toUpperCase()}).`
            : `Automated diagnostics analyzing latency variance, packet dropping and route health against ${game.name} profile standards.`}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {diagnostics.map((item) => {
          const isCritical = item.severity === 'critical';
          const isWarning = item.severity === 'warning';

          return (
            <div
              key={item.id}
              className={`rounded-2xl border p-5 sm:p-6 shadow-lg backdrop-blur space-y-4 transition-all ${
                isCritical
                  ? 'bg-rose-950/20 border-rose-500/30 shadow-rose-950/10'
                  : isWarning
                  ? 'bg-amber-950/20 border-amber-500/30 shadow-amber-950/10'
                  : 'bg-emerald-950/20 border-emerald-500/30 shadow-emerald-950/10'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2.5 rounded-xl border shrink-0 ${
                      isCritical
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : isWarning
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {isCritical ? (
                      <ShieldAlert className="w-5 h-5" />
                    ) : isWarning ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <CheckCircle className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3
                      className={`text-base font-bold ${
                        isCritical
                          ? 'text-rose-300'
                          : isWarning
                          ? 'text-amber-300'
                          : 'text-emerald-300'
                      }`}
                    >
                      {lang === 'vi' ? item.titleVi : item.titleEn}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {lang === 'vi' ? item.descriptionVi : item.descriptionEn}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 border ${
                    isCritical
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : isWarning
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}
                >
                  {item.severity}
                </span>
              </div>

              {/* Causes & Solutions 2-col Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
                {/* Causes */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300">
                    <HelpCircle className="w-4 h-4 text-amber-400" />
                    <span>{lang === 'vi' ? 'Nguyên nhân có thể gây ra:' : 'Possible Causes:'}</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-400">
                    {(lang === 'vi' ? item.possibleCausesVi : item.possibleCausesEn).map((cause, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-slate-500 mt-1 text-xs">•</span>
                        <span>{cause}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Solutions */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300">
                    <Wrench className="w-4 h-4 text-sky-400" />
                    <span>{lang === 'vi' ? 'Hướng dẫn khắc phục đề xuất:' : 'Recommended Solutions:'}</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {(lang === 'vi' ? item.solutionsVi : item.solutionsEn).map((sol, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-emerald-400 mt-1 text-xs">✓</span>
                        <span>{sol}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
