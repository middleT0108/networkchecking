import { useNetworkStore } from '../store/useNetworkStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { soundService } from './soundService';

class MeasurementService {
  private timer: number | null = null;
  private ws: WebSocket | null = null;
  private isMeasuring = false;
  private lastStatusWasOffline = false;

  public init() {
    // 1. Listen for browser online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        useNetworkStore.getState().setOnline(true);
        if (useSettingsStore.getState().soundEnabled) {
          soundService.playReconnectChime();
        }
      });

      window.addEventListener('offline', () => {
        useNetworkStore.getState().setOnline(false);
        if (useSettingsStore.getState().soundEnabled) {
          soundService.playDisconnectAlert();
        }
      });

      // 2. Listen for tab visibility changes
      document.addEventListener('visibilitychange', () => {
        const isHidden = document.visibilityState === 'hidden';
        useNetworkStore.getState().setTabHidden(isHidden);
      });

      // 3. Monitor navigator.connection if available
      this.updateConnectionInfo();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const navConn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      if (navConn) {
        navConn.addEventListener('change', () => this.updateConnectionInfo());
      }
    }

    this.startLoop();
  }

  public updateConnectionInfo() {
    if (typeof navigator === 'undefined') return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const navConn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

    useNetworkStore.getState().setConnectionInfo({
      online: navigator.onLine,
      effectiveType: navConn?.effectiveType,
      downlink: navConn?.downlink,
      rtt: navConn?.rtt,
      saveData: navConn?.saveData
    });
  }

  /**
   * Main measurement tick
   */
  private async tick() {
    const { isTesting, activeEndpointUrl, isTabHidden } = useNetworkStore.getState();
    const { chartWindowSeconds } = useSettingsStore.getState();

    if (!isTesting || this.isMeasuring) return;

    // When tab is hidden, measure less frequently to conserve user network
    if (isTabHidden && Math.random() < 0.75) {
      return;
    }

    this.isMeasuring = true;

    try {
      const rtt = await this.measureHttpPing(activeEndpointUrl);
      useNetworkStore.getState().addSample(rtt, 'success', chartWindowSeconds);

      if (this.lastStatusWasOffline) {
        this.lastStatusWasOffline = false;
        if (useSettingsStore.getState().soundEnabled) {
          soundService.playReconnectChime();
        }
      }
    } catch {
      useNetworkStore.getState().addSample(0, 'timeout', chartWindowSeconds);

      if (!this.lastStatusWasOffline) {
        this.lastStatusWasOffline = true;
        if (useSettingsStore.getState().soundEnabled) {
          soundService.playDisconnectAlert();
        }
      }
    } finally {
      this.isMeasuring = false;
    }
  }

  /**
   * Measure HTTP RTT using performance.now() with cache busting
   */
  public async measureHttpPing(url: string, timeoutMs = 2500): Promise<number> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const cacheBuster = `_t=${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const separator = url.includes('?') ? '&' : '?';
    const finalUrl = `${url}${separator}${cacheBuster}`;

    const start = performance.now();
    try {
      await fetch(finalUrl, {
        method: 'HEAD',
        mode: 'no-cors', // allows pinging cross-origin CDN/cloud health checks without CORS failures
        cache: 'no-store',
        signal: controller.signal
      });
      const end = performance.now();
      return Math.round((end - start) * 10) / 10;
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Start or restart continuous measurement loop
   */
  public startLoop() {
    this.stopLoop();
    const run = async () => {
      await this.tick();
      const interval = useSettingsStore.getState().intervalMs;
      this.timer = window.setTimeout(run, interval);
    };
    run();
  }

  public stopLoop() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.ws) {
      try {
        this.ws.close();
      } catch {
        // closed
      }
      this.ws = null;
    }
  }

  /**
   * Runs an on-demand Download & Upload Speed Test
   * Uses Cloudflare Speed CDN (__down / __up) as reliable global high-speed endpoints,
   * with fallback to custom worker endpoint if configured.
   */
  public async runSpeedTest() {
    const { setSpeed } = useNetworkStore.getState();
    setSpeed({ isRunning: true, phase: 'download', progress: 10, error: undefined });

    const apiUrl = ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_URL) || '';

    try {
      // 1. Download Test (Fetch ~2MB chunk from Edge CDN)
      let downloadUrl = 'https://speed.cloudflare.com/__down?bytes=2097152';
      if (apiUrl && !apiUrl.includes('your-subdomain')) {
        downloadUrl = `${apiUrl}/api/speed/download?bytes=2097152`;
      }

      const downloadStart = performance.now();
      let downloadRes = await fetch(downloadUrl, { cache: 'no-store' });

      // Fallback to Cloudflare Speed CDN if custom API endpoint is down or 404
      if (!downloadRes.ok && downloadUrl !== 'https://speed.cloudflare.com/__down?bytes=2097152') {
        downloadUrl = 'https://speed.cloudflare.com/__down?bytes=2097152';
        downloadRes = await fetch(downloadUrl, { cache: 'no-store' });
      }

      if (!downloadRes.ok) {
        throw new Error(`Download test không thành công (HTTP ${downloadRes.status})`);
      }

      const buf = await downloadRes.arrayBuffer();
      const downloadEnd = performance.now();

      const downloadSeconds = Math.max(0.1, (downloadEnd - downloadStart) / 1000);
      const downloadMbps = Math.round(((buf.byteLength * 8) / downloadSeconds / (1024 * 1024)) * 100) / 100;

      setSpeed({ downloadMbps, phase: 'upload', progress: 60 });

      // 2. Upload Test (Send 1MB payload to Edge upload endpoint)
      let uploadUrl = 'https://speed.cloudflare.com/__up';
      if (apiUrl && !apiUrl.includes('your-subdomain')) {
        uploadUrl = `${apiUrl}/api/speed/upload`;
      }

      const uploadBytes = 1048576;
      const uploadPayload = new Uint8Array(uploadBytes);
      const uploadStart = performance.now();

      let uploadRes = await fetch(uploadUrl, {
        method: 'POST',
        body: uploadPayload
      });

      // Fallback to Cloudflare Speed CDN upload if custom worker fails
      if (!uploadRes.ok && uploadUrl !== 'https://speed.cloudflare.com/__up') {
        uploadUrl = 'https://speed.cloudflare.com/__up';
        uploadRes = await fetch(uploadUrl, {
          method: 'POST',
          body: uploadPayload
        });
      }

      if (!uploadRes.ok) {
        throw new Error(`Upload test không thành công (HTTP ${uploadRes.status})`);
      }

      const uploadEnd = performance.now();
      const uploadSeconds = Math.max(0.1, (uploadEnd - uploadStart) / 1000);
      const uploadMbps = Math.round(((uploadBytes * 8) / uploadSeconds / (1024 * 1024)) * 100) / 100;

      setSpeed({
        downloadMbps,
        uploadMbps,
        isRunning: false,
        phase: 'complete',
        progress: 100
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setSpeed({
        isRunning: false,
        phase: 'error',
        error: msg
      });
    }
  }
}

export const measurementService = new MeasurementService();
