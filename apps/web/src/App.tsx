import React, { useEffect } from 'react';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ControlPanel } from './components/dashboard/ControlPanel';
import { MetricCards } from './components/dashboard/MetricCards';
import { RealtimePingChart } from './components/dashboard/RealtimePingChart';
import { ScoreGauge } from './components/dashboard/ScoreGauge';
import { ConnectionInfoCard } from './components/dashboard/ConnectionInfoCard';
import { SpeedTestSection } from './components/dashboard/SpeedTestSection';
import { GameSelectorTabs } from './components/games/GameSelectorTabs';
import { PublisherStatusBanner } from './components/games/PublisherStatusBanner';
import { GameRegionMatrix } from './components/games/GameRegionMatrix';
import { DiagnosticView } from './components/diagnostics/DiagnosticView';
import { HistoryView } from './components/history/HistoryView';
import { measurementService } from './services/measurementService';
import { agentService } from './services/agentService';
import { useSettingsStore } from './store/useSettingsStore';
import { useGameStore } from './store/useGameStore';

export const App: React.FC = () => {
  const { lang } = useSettingsStore();
  const { activeTab, getSelectedGame } = useGameStore();
  const selectedGame = getSelectedGame();

  useEffect(() => {
    measurementService.init();
    agentService.init();
    return () => {
      measurementService.stopLoop();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-white">
      {/* Navigation Header with Integrated Tabs */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Tab 1: General Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {lang === 'vi' ? 'Bảng Điều Khiển Mạng Gaming' : 'Gaming Network Dashboard'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {lang === 'vi'
                  ? 'Đo đạc độ trễ, biến thiên jitter, tỉ lệ mất gói và tốc độ đường truyền theo thời gian thực.'
                  : 'Real-time telemetry for ping latency, jitter variation, estimated packet loss and bandwidth.'}
              </p>
            </div>

            <ControlPanel />
            <MetricCards />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RealtimePingChart />
              </div>
              <div className="lg:col-span-1">
                <ScoreGauge />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SpeedTestSection />
              <ConnectionInfoCard />
            </div>
          </div>
        )}

        {/* Tab 2: Per-Game Profiles & Regional Matrix */}
        {activeTab === 'games' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {lang === 'vi' ? 'Kiểm Tra Mạng Theo Từng Game' : 'Per-Game Network Benchmarks'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {lang === 'vi'
                  ? 'Đo độ trễ tới từng khu vực máy chủ (Singapore, Hong Kong, Tokyo...), tìm cụm server tối ưu nhất.'
                  : 'Benchmark routes to game regions (Singapore, Hong Kong, Tokyo...) and rank the best server.'}
              </p>
            </div>

            <GameSelectorTabs />
            <PublisherStatusBanner />
            <GameRegionMatrix />

            {/* Live Streaming Test for Active Game Region */}
            <div className="pt-4 space-y-4">
              <h3 className="text-sm font-bold text-slate-300">
                {lang === 'vi' ? `Luồng đo trực tiếp: ${selectedGame.name}` : `Live Stream: ${selectedGame.name}`}
              </h3>
              <ControlPanel />
              <MetricCards />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <RealtimePingChart />
                </div>
                <div className="lg:col-span-1">
                  <ScoreGauge />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Diagnostics & Solutions */}
        {activeTab === 'diagnostics' && <DiagnosticView />}

        {/* Tab 4: History & Export */}
        {activeTab === 'history' && <HistoryView />}
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
};

export default App;
