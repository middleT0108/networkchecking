import { create } from 'zustand';

export type Language = 'vi' | 'en';
export type MeasurementMethod = 'auto' | 'ws' | 'http';

interface SettingsState {
  lang: Language;
  soundEnabled: boolean;
  intervalMs: number;       // 1000, 2000, 3000 ms
  chartWindowSeconds: number; // 60, 180, 300
  method: MeasurementMethod;
  setLang: (lang: Language) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setIntervalMs: (ms: number) => void;
  setChartWindowSeconds: (sec: number) => void;
  setMethod: (method: MeasurementMethod) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  lang: 'vi',
  soundEnabled: true,
  intervalMs: 1000,
  chartWindowSeconds: 60,
  method: 'auto',
  setLang: (lang) => set({ lang }),
  setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
  setIntervalMs: (intervalMs) => set({ intervalMs }),
  setChartWindowSeconds: (chartWindowSeconds) => set({ chartWindowSeconds }),
  setMethod: (method) => set({ method })
}));
