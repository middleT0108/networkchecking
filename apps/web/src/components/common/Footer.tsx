import React from 'react';
import { AlertCircle, ShieldCheck } from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';

export const Footer: React.FC = () => {
  const { lang } = useSettingsStore();

  return (
    <footer className="mt-16 border-t border-slate-800/80 bg-slate-950/60 py-8 px-4 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Transparency note */}
        <div className="flex items-start space-x-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-slate-300">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-300">
              {lang === 'vi' ? 'Cam kết tính minh bạch đo lường:' : 'Measurement Transparency Notice:'}
            </p>
            <p className="text-slate-400 leading-relaxed">
              {lang === 'vi'
                ? 'Trình duyệt web không hỗ trợ gửi ICMP Ping thô do giới hạn bảo mật Sandbox. NetCheck Gaming đo RTT bằng HTTP HEAD/WebSocket echo tới cụm Edge Server và CDN của từng game. Tỉ lệ mất gói (Packet Loss) là chỉ số ước lượng dựa trên tỉ lệ request bị timeout trong cửa sổ đo trượt.'
                : 'Web browsers do not support raw ICMP Ping due to security sandbox constraints. NetCheck Gaming measures RTT via HTTP HEAD/WebSocket echo to Edge and CDN nodes. Packet Loss is an estimated metric calculated from request timeouts within a sliding sample window.'}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between text-slate-500 pt-4 border-t border-slate-900 gap-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>NetCheck Gaming Open Source 2026 • Bảo vệ quyền riêng tư (Không lưu địa chỉ IP thô)</span>
          </div>
          <div>
            <span>Backend: Cloudflare Workers Edge • Deploy via GitHub Actions</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
