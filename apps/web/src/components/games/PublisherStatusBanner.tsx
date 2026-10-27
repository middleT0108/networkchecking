import React from 'react';
import { Server, CheckCircle2, ExternalLink } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { useSettingsStore } from '../../store/useSettingsStore';

export const PublisherStatusBanner: React.FC = () => {
  const { getSelectedGame } = useGameStore();
  const { lang } = useSettingsStore();
  const game = getSelectedGame();

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-xl bg-slate-800 text-sky-400 border border-slate-750">
          <Server className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">
              {lang === 'vi' ? 'Trạng thái máy chủ' : 'Publisher Server Status'}:
            </span>
            <span className="font-semibold text-slate-200">{game.publisher}</span>
            <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-medium">
              <CheckCircle2 className="w-3 h-3" />
              <span>{lang === 'vi' ? 'Hoạt động bình thường' : 'Operational'}</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {lang === 'vi'
              ? 'Tách biệt với phép đo của bạn: Trạng thái này do hãng công bố, độc lập với đường truyền mạng gia đình.'
              : 'Independent from local network: Reflects publisher cloud health status.'}
          </p>
        </div>
      </div>

      {game.statusUrl && (
        <a
          href={game.statusUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 text-[11px] font-medium transition-colors shrink-0"
        >
          <span>{lang === 'vi' ? 'Xem trang Status chính hãng' : 'Official Status Page'}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  );
};
