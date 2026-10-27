import { describe, it, expect, beforeEach } from 'vitest';
import { useNetworkStore } from '../src/store/useNetworkStore';
import { useSettingsStore } from '../src/store/useSettingsStore';

describe('Web Stores', () => {
  beforeEach(() => {
    useNetworkStore.getState().resetMetrics();
  });

  it('useSettingsStore should update language and interval', () => {
    useSettingsStore.getState().setLang('en');
    expect(useSettingsStore.getState().lang).toBe('en');

    useSettingsStore.getState().setIntervalMs(2000);
    expect(useSettingsStore.getState().intervalMs).toBe(2000);
  });

  it('useNetworkStore should accurately add samples and calculate ping stats', () => {
    const store = useNetworkStore.getState();
    expect(store.metrics.sampleCount).toBe(0);

    store.addSample(25, 'success', 60);
    store.addSample(35, 'success', 60);
    store.addSample(30, 'success', 60);

    const updated = useNetworkStore.getState();
    expect(updated.metrics.sampleCount).toBe(3);
    expect(updated.metrics.ping.min).toBe(25);
    expect(updated.metrics.ping.max).toBe(35);
    expect(updated.metrics.ping.median).toBe(30);
    expect(updated.metrics.packetLoss).toBe(0);
    expect(updated.chartData.length).toBe(3);
  });

  it('useNetworkStore should track timeout as packet loss', () => {
    const store = useNetworkStore.getState();
    store.addSample(30, 'success', 60);
    store.addSample(0, 'timeout', 60);

    const updated = useNetworkStore.getState();
    expect(updated.metrics.lossCount).toBe(1);
    expect(updated.metrics.packetLoss).toBe(50);
  });
});
