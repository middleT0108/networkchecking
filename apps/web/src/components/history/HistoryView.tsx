import React, { useState, useEffect } from 'react';
import { History, Download, CloudUpload, Filter, Database, Check } from 'lucide-react';
import { useNetworkStore } from '../../store/useNetworkStore';
import { useGameStore } from '../../store/useGameStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { HistoryRecord, HistoryAggregation } from '@netcheck/shared';

export const HistoryView: React.FC = () => {
  const { metrics, connectionInfo } = useNetworkStore();
  const { getSelectedGame, selectedRegionId } = useGameStore();
  const { lang } = useSettingsStore();
  const activeGame = getSelectedGame();

  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [aggregation, setAggregation] = useState<HistoryAggregation | null>(null);
  const [selectedRange, setSelectedRange] = useState<'1h' | '24h' | '7d'>('24h');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch history from backend
  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/history?gameId=${activeGame.id}&range=${selectedRange}`);
      if (res.ok) {
        const data = (await res.json()) as { records: HistoryRecord[]; aggregation: HistoryAggregation };
        setRecords(data.records);
        setAggregation(data.aggregation);
      }
    } catch {
      // Offline fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [activeGame.id, selectedRange]);

  // Save current session to D1 backend
  const handleSaveSession = async () => {
    if (metrics.sampleCount === 0 || isSaving) return;
    setIsSaving(true);

    try {
      const payload: Partial<HistoryRecord> = {
        gameId: activeGame.id,
        regionId: selectedRegionId,
        timestamp: Date.now(),
        avgPing: metrics.ping.average,
        medianPing: metrics.ping.median,
        minPing: metrics.ping.min,
        maxPing: metrics.ping.max,
        jitter: metrics.jitter,
        packetLoss: metrics.packetLoss,
        score: metrics.quality.score,
        rating: metrics.quality.rating,
        connectionType: connectionInfo.effectiveType || 'wifi-lan',
        clientType: 'web'
      };

      const res = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        fetchHistory(); // refresh list
      }
    } catch {
      // Handle error
    } finally {
      setIsSaving(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (records.length === 0) return;

    const headers = ['ID', 'Game', 'Region', 'Time', 'AvgPing', 'MedianPing', 'Jitter', 'Loss%', 'Score', 'Rating'];
    const rows = records.map((r) => [
      r.id || '',
      r.gameId,
      r.regionId,
      new Date(r.timestamp).toISOString(),
      r.avgPing,
      r.medianPing,
      r.jitter,
      r.packetLoss,
      r.score,
      r.rating
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `netcheck-history-${activeGame.id}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to JSON
  const handleExportJSON = () => {
    if (records.length === 0) return;
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(records, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', jsonStr);
    link.setAttribute('download', `netcheck-history-${activeGame.id}-${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-lg backdrop-blur flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-100">
              {lang === 'vi' ? 'Lịch Sử Đo & Thống Kê Cộng Đồng' : 'Telemetry History & Analytics'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'vi'
              ? 'Lưu trữ phiên đo ẩn danh vào Cloudflare D1. Dữ liệu hoàn toàn riêng tư, không lưu IP người dùng.'
              : 'Anonymous telemetry stored in Cloudflare D1. Zero personal data or raw IP stored.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Save current test */}
          <button
            onClick={handleSaveSession}
            disabled={metrics.sampleCount === 0 || isSaving}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              saveSuccess
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : metrics.sampleCount === 0
                ? 'bg-slate-800 text-slate-500 border-slate-800 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 shadow-md active:scale-95'
            }`}
          >
            {saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>{lang === 'vi' ? 'Đã lưu ẩn danh!' : 'Saved!'}</span>
              </>
            ) : (
              <>
                <CloudUpload className="w-3.5 h-3.5" />
                <span>{lang === 'vi' ? 'Lưu phiên đo này' : 'Save Session'}</span>
              </>
            )}
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            disabled={records.length === 0}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-colors disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          {/* Export JSON */}
          <button
            onClick={handleExportJSON}
            disabled={records.length === 0}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-colors disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Filter and Summary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Filter Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
            <Filter className="w-4 h-4 text-sky-400" />
            <span>{lang === 'vi' ? 'Bộ lọc thời gian:' : 'Time Range:'}</span>
          </div>

          <div className="flex space-x-2">
            {(['1h', '24h', '7d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRange(r)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                  selectedRange === r
                    ? 'bg-sky-500 text-white border-sky-400 font-bold'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                {r === '1h' ? '1 giờ' : r === '24h' ? '24 giờ' : '7 ngày'}
              </button>
            ))}
          </div>

          <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-800">
            {lang === 'vi' ? 'Đang lọc cho game:' : 'Active Game:'} <strong className="text-slate-200">{activeGame.name}</strong>
          </p>
        </div>

        {/* Aggregated Stats Cards */}
        <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1">
            <span className="text-[11px] text-slate-400 block font-medium">P50 PING (MEDIAN)</span>
            <div className="text-2xl font-extrabold font-mono text-emerald-400">
              {aggregation?.p50Ping ? `${aggregation.p50Ping} ms` : '--'}
            </div>
            <span className="text-[10px] text-slate-500 block">50% mẫu đo đạt được</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1">
            <span className="text-[11px] text-slate-400 block font-medium">P95 PING</span>
            <div className="text-2xl font-extrabold font-mono text-amber-400">
              {aggregation?.p95Ping ? `${aggregation.p95Ping} ms` : '--'}
            </div>
            <span className="text-[10px] text-slate-500 block">Độ trễ ở tình huống xấu</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1">
            <span className="text-[11px] text-slate-400 block font-medium">JITTER TRUNG BÌNH</span>
            <div className="text-2xl font-extrabold font-mono text-sky-400">
              {aggregation?.avgJitter ? `${aggregation.avgJitter} ms` : '--'}
            </div>
            <span className="text-[10px] text-slate-500 block">Độ lệch trễ tổng hợp</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1">
            <span className="text-[11px] text-slate-400 block font-medium">MẪU GHI NHẬN</span>
            <div className="text-2xl font-extrabold font-mono text-indigo-400">
              {aggregation?.count || 0}
            </div>
            <span className="text-[10px] text-slate-500 block">Phiên đo trong khoảng thời gian</span>
          </div>
        </div>
      </div>

      {/* History Records Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-slate-400" />
            <h3 className="font-semibold text-slate-200 text-sm">
              {lang === 'vi' ? 'Bản ghi lịch sử gần nhất' : 'Recent Telemetry Logs'}
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">{records.length} records</span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            {lang === 'vi' ? 'Đang tải dữ liệu từ D1...' : 'Loading records from D1...'}
          </div>
        ) : records.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs space-y-1">
            <p>{lang === 'vi' ? 'Chưa có bản ghi nào trong khoảng thời gian này.' : 'No records found for this period.'}</p>
            <p className="text-[11px] text-slate-600">
              {lang === 'vi' ? 'Hãy bấm "Lưu phiên đo này" ở trên để ghi nhận kết quả.' : 'Click "Save Session" above to store your test.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-sans">
                  <th className="py-2.5 px-3">THỜI GIAN</th>
                  <th className="py-2.5 px-3">REGION</th>
                  <th className="py-2.5 px-3">AVG PING</th>
                  <th className="py-2.5 px-3">JITTER</th>
                  <th className="py-2.5 px-3">MẤT GÓI</th>
                  <th className="py-2.5 px-3">ĐIỂM</th>
                  <th className="py-2.5 px-3">ISP / QG</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {records.map((r, idx) => (
                  <tr key={r.id || idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3 text-slate-400 font-sans">
                      {new Date(r.timestamp).toLocaleTimeString('vi-VN', { hour12: false })}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-200">{r.regionId}</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">{r.avgPing}ms</td>
                    <td className="py-2.5 px-3 text-sky-400">{r.jitter}ms</td>
                    <td className="py-2.5 px-3 text-amber-400">{r.packetLoss}%</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                        {r.score}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-sans text-[11px]">
                      {r.ispCountry || 'VN'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
