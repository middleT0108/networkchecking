import React from 'react';
import { Wifi, Volume2, VolumeX, Globe, Github, LayoutDashboard, Gamepad2, Wrench, History, Laptop } from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useNetworkStore } from '../../store/useNetworkStore';
import { useGameStore, ActiveTab } from '../../store/useGameStore';
import { useAgentStore } from '../../store/useAgentStore';

export const Navbar: React.FC = () => {
  const { lang, setLang, soundEnabled, setSoundEnabled } = useSettingsStore();
  const { isOnline, isTesting } = useNetworkStore();
  const { activeTab, setActiveTab } = useGameStore();
  const { isAgentConnected } = useAgentStore();

  const navItems: Array<{ id: ActiveTab; labelVi: string; labelEn: string; icon: React.ElementType }> = [
    { id: 'dashboard', labelVi: 'Tổng quan', labelEn: 'Dashboard', icon: LayoutDashboard },
    { id: 'games', labelVi: 'Theo từng Game', labelEn: 'Games Matrix', icon: Gamepad2 },
    { id: 'diagnostics', labelVi: 'Chẩn đoán', labelEn: 'Diagnostics', icon: Wrench },
    { id: 'history', labelVi: 'Lịch sử', labelEn: 'History', icon: History }
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/90 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20 shadow-inner">
              <Wifi className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-sky-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
                  NetCheck Gaming
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 uppercase tracking-widest font-semibold">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                {lang === 'vi' ? 'Kiểm tra mạng gaming thời gian thực' : 'Real-time Gaming Network Monitor'}
              </p>
            </div>
          </div>

          {/* Center Tabs (Desktop) */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-800/60 p-1 rounded-xl border border-slate-750">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{lang === 'vi' ? item.labelVi : item.labelEn}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Status Indicators & Settings */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Desktop Agent Indicator */}
            <div
              className={`hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                isAgentConnected
                  ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title={
                isAgentConnected
                  ? 'Desktop Agent đang hoạt động: Đo bằng ICMP Socket thật từ PC'
                  : 'Desktop Agent chưa bật: Đang đo bằng Web HTTP RTT. Chạy "npm start" trong thư mục agent để đo ICMP thật.'
              }
            >
              <Laptop className={`w-3.5 h-3.5 ${isAgentConnected ? 'text-indigo-400' : 'text-slate-500'}`} />
              <span>
                {isAgentConnected
                  ? (lang === 'vi' ? 'Agent: ICMP Thật' : 'Agent: Raw ICMP')
                  : (lang === 'vi' ? 'Web Mode' : 'Web Mode')}
              </span>
            </div>

            {/* Online/Offline Status */}
            <div
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                isOnline
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isOnline ? 'bg-emerald-400 animate-live-pulse' : 'bg-rose-400'
                }`}
              />
              <span className="hidden sm:inline">
                {isOnline ? (isTesting ? 'Live' : 'Sẵn sàng') : 'Mất mạng'}
              </span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Tắt âm thanh cảnh báo' : 'Bật âm thanh cảnh báo'}
              className={`p-2 rounded-lg border transition-colors ${
                soundEnabled
                  ? 'bg-slate-800 text-sky-400 border-slate-700 hover:bg-slate-700'
                  : 'bg-slate-800/50 text-slate-500 border-slate-800 hover:text-slate-400'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Language Switch */}
            <button
              onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-colors"
              title="Đổi ngôn ngữ / Change language"
            >
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>{lang.toUpperCase()}</span>
            </button>

            {/* GitHub link */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
              title="Xem mã nguồn trên GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden items-center justify-between space-x-1 py-2 border-t border-slate-800 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-sky-500 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{lang === 'vi' ? item.labelVi : item.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
