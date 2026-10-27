import { WebSocketServer, WebSocket } from 'ws';
import { measureIcmpPing, measureTcpPing, PingResult } from './pinger.js';

export interface AgentConfig {
  port: number;
}

export function startAgentServer(config: AgentConfig = { port: 48201 }) {
  const wss = new WebSocketServer({ port: config.port });

  console.log(`[NetCheck Desktop Agent] WebSocket server running on ws://127.0.0.1:${config.port}`);

  wss.on('connection', (ws: WebSocket) => {
    console.log('[NetCheck Desktop Agent] Website client connected.');

    // Send handshake
    ws.send(
      JSON.stringify({
        type: 'agent_status',
        connected: true,
        version: '1.0.0',
        platform: process.platform
      })
    );

    let activeTimer: NodeJS.Timeout | null = null;
    let sequence = 0;

    const stopPinging = () => {
      if (activeTimer) {
        clearInterval(activeTimer);
        activeTimer = null;
      }
    };

    ws.on('message', async (data: Buffer | string) => {
      try {
        const msg = JSON.parse(data.toString());

        if (msg.type === 'start') {
          stopPinging();
          const host = msg.host || 'ap-southeast-1.signin.aws.amazon.com';
          const protocol = msg.protocol === 'tcp' ? 'tcp' : 'icmp';
          const port = msg.port || 443;
          const interval = Math.max(500, msg.interval || 1000);

          console.log(`[NetCheck Desktop Agent] Starting ${protocol.toUpperCase()} measurements to ${host} (every ${interval}ms)...`);

          const runMeasurement = async () => {
            sequence++;
            let res: PingResult;
            if (protocol === 'icmp') {
              res = await measureIcmpPing(host, 2000);
            } else {
              res = await measureTcpPing(host, port, 2000);
            }

            if (ws.readyState === WebSocket.OPEN) {
              ws.send(
                JSON.stringify({
                  type: 'ping_result',
                  sequence,
                  timestamp: Date.now(),
                  ...res
                })
              );
            }
          };

          // Run first immediately, then interval
          runMeasurement();
          activeTimer = setInterval(runMeasurement, interval);
        } else if (msg.type === 'stop') {
          console.log('[NetCheck Desktop Agent] Stopped measurements upon client request.');
          stopPinging();
        }
      } catch (err) {
        console.error('[NetCheck Desktop Agent] Error parsing message:', err);
      }
    });

    ws.on('close', () => {
      console.log('[NetCheck Desktop Agent] Client disconnected.');
      stopPinging();
    });

    ws.on('error', (err) => {
      console.error('[NetCheck Desktop Agent] Socket error:', err);
      stopPinging();
    });
  });

  return wss;
}
