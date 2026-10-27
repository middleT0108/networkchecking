import { spawn } from 'node:child_process';
import net from 'node:net';

export interface PingResult {
  host: string;
  rtt: number;
  protocol: 'icmp' | 'tcp';
  status: 'success' | 'timeout' | 'error';
  errorMessage?: string;
}

/**
 * Measures real ICMP ping using the operating system's native ICMP stack.
 * Works seamlessly without requiring Administrator/root privileges.
 */
export function measureIcmpPing(host: string, timeoutMs = 2000): Promise<PingResult> {
  return new Promise((resolve) => {
    const isWindows = process.platform === 'win32';
    const isMac = process.platform === 'darwin';

    // Windows: ping -n 1 -w 2000 <host>
    // Linux: ping -c 1 -W 2 <host>
    // macOS: ping -c 1 -t 2 <host>
    const args = isWindows
      ? ['-n', '1', '-w', timeoutMs.toString(), host]
      : isMac
      ? ['-c', '1', '-t', Math.ceil(timeoutMs / 1000).toString(), host]
      : ['-c', '1', '-W', Math.ceil(timeoutMs / 1000).toString(), host];

    let output = '';
    const child = spawn('ping', args);

    const timer = setTimeout(() => {
      try {
        child.kill();
      } catch {
        // ignore
      }
      resolve({
        host,
        rtt: 0,
        protocol: 'icmp',
        status: 'timeout',
        errorMessage: 'ICMP ping timed out'
      });
    }, timeoutMs + 500);

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      output += data.toString();
    });

    child.on('close', (code) => {
      clearTimeout(timer);

      if (code !== 0 && !output.includes('time=')) {
        resolve({
          host,
          rtt: 0,
          protocol: 'icmp',
          status: 'timeout',
          errorMessage: 'Packet lost / Host unreachable'
        });
        return;
      }

      // Regex matching for RTT in Windows / Linux / macOS ping output
      // Windows: "time=15ms" or "time<1ms"
      // Linux/mac: "time=14.8 ms"
      const match = output.match(/time[=<]([\d.]+)\s*ms/i);
      if (match && match[1]) {
        const rtt = parseFloat(match[1]);
        resolve({
          host,
          rtt: Math.round(rtt * 10) / 10,
          protocol: 'icmp',
          status: 'success'
        });
      } else {
        resolve({
          host,
          rtt: 0,
          protocol: 'icmp',
          status: 'timeout',
          errorMessage: 'Could not parse ICMP reply'
        });
      }
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({
        host,
        rtt: 0,
        protocol: 'icmp',
        status: 'error',
        errorMessage: err.message
      });
    });
  });
}

/**
 * Measures real TCP connect latency to host:port
 */
export function measureTcpPing(host: string, port = 443, timeoutMs = 2000): Promise<PingResult> {
  return new Promise((resolve) => {
    const start = process.hrtime.bigint();
    const socket = new net.Socket();

    const timer = setTimeout(() => {
      socket.destroy();
      resolve({
        host,
        rtt: 0,
        protocol: 'tcp',
        status: 'timeout',
        errorMessage: 'TCP handshake timed out'
      });
    }, timeoutMs);

    socket.connect(port, host, () => {
      const end = process.hrtime.bigint();
      clearTimeout(timer);
      socket.destroy();

      const durationMs = Number(end - start) / 1_000_000;
      resolve({
        host,
        rtt: Math.round(durationMs * 10) / 10,
        protocol: 'tcp',
        status: 'success'
      });
    });

    socket.on('error', (err) => {
      clearTimeout(timer);
      socket.destroy();
      resolve({
        host,
        rtt: 0,
        protocol: 'tcp',
        status: 'error',
        errorMessage: err.message
      });
    });
  });
}
