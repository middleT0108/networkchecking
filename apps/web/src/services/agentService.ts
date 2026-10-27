import { useAgentStore } from '../store/useAgentStore';
import { useNetworkStore } from '../store/useNetworkStore';
import { useSettingsStore } from '../store/useSettingsStore';

class AgentService {
  private ws: WebSocket | null = null;
  private reconnectTimer: number | null = null;

  public init() {
    this.connect();
  }

  private connect() {
    if (typeof window === 'undefined') return;

    try {
      this.ws = new WebSocket('ws://127.0.0.1:48201');

      this.ws.onopen = () => {
        // Connected to local Desktop Agent
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'agent_status') {
            useAgentStore.getState().setAgentConnected(true, data.version, data.platform);
          } else if (data.type === 'ping_result') {
            const { isAgentEnabled } = useAgentStore.getState();
            if (isAgentEnabled) {
              const { chartWindowSeconds } = useSettingsStore.getState();
              useNetworkStore.getState().addSample(data.rtt, data.status, chartWindowSeconds);
            }
          }
        } catch {
          // ignore parsing error
        }
      };

      this.ws.onclose = () => {
        useAgentStore.getState().setAgentConnected(false);
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        useAgentStore.getState().setAgentConnected(false);
        try {
          this.ws?.close();
        } catch {
          // closed
        }
      };
    } catch {
      useAgentStore.getState().setAgentConnected(false);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    // Periodically check if user started the Desktop Agent
    this.reconnectTimer = window.setTimeout(() => {
      this.connect();
    }, 8000);
  }

  /**
   * Instructs the Desktop Agent to start ICMP/TCP pinging a target host
   */
  public sendStartMeasurement(host: string, protocol: 'icmp' | 'tcp' = 'icmp') {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const interval = useSettingsStore.getState().intervalMs;
      this.ws.send(
        JSON.stringify({
          type: 'start',
          host,
          protocol,
          interval
        })
      );
    }
  }

  public sendStopMeasurement() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'stop' }));
    }
  }
}

export const agentService = new AgentService();
