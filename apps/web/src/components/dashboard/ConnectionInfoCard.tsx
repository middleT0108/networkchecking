import React from 'react';
import { Network, Info } from 'lucide-react';
import { useNetworkStore } from '../../store/useNetworkStore';
import { useSettingsStore } from '../../store/useSettingsStore';

export const ConnectionInfoCard: React.FC = () => {
  const { connectionInfo, isOnline } = useNetworkStore();
  const { lang } = useSettingsStore();

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur space-y-4">
      <div className="flex items-center space-x-2">
        <Network className="w-5 h-5 text-indigo-400" />
        <h3 className="font-semibold text-slate-200 text-sm">
          {lang === 'vi' ? 'Thông tin kết nối thiết bị' : 'Client Connection Interface'}
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-750">
          <span className="text-slate-400 block mb-1">
            {lang === 'vi' ? 'Trạng thái mạng' : 'Network State'}
          </span>
          <span className={`font-semibold ${isOnline ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isOnline ? (lang === 'vi' ? 'Đang kết nối' : 'Connected') : (lang === 'vi' ? 'Mất kết nối' : 'Offline')}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-750">
          <span className="text-slate-400 block mb-1">
            {lang === 'vi' ? 'Chuẩn kết nối' : 'Effective Type'}
          </span>
          <span className="font-mono font-semibold text-slate-200 uppercase">
            {connectionInfo.effectiveType || 'Ethernet / Wi-Fi'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-750">
          <span className="text-slate-400 block mb-1">
            {lang === 'vi' ? 'Băng thông ước tính' : 'Downlink'}
          </span>
          <span className="font-mono font-semibold text-sky-400">
            {connectionInfo.downlink ? `${connectionInfo.downlink} Mbps` : 'Không xác định'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-750">
          <span className="text-slate-400 block mb-1">
            {lang === 'vi' ? 'RTT Ngăn xếp OS' : 'OS Stack RTT'}
          </span>
          <span className="font-mono font-semibold text-indigo-400">
            {connectionInfo.rtt ? `${connectionInfo.rtt} ms` : '~0-20 ms'}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2 text-[11px] text-slate-400 pt-1">
        <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <span>
          {lang === 'vi'
            ? 'Số liệu lấy trực tiếp từ Network Information API của trình duyệt trên máy bạn.'
            : 'Extracted directly from client-side Web API navigator.connection.'}
        </span>
      </div>
    </div>
  );
};
