import { describe, it, expect } from 'vitest';
import { measureIcmpPing, measureTcpPing } from '../src/pinger';

describe('Desktop Agent Pinger', () => {
  it('measureIcmpPing should attempt ICMP probe to 127.0.0.1', async () => {
    const res = await measureIcmpPing('127.0.0.1', 2000);
    expect(res.protocol).toBe('icmp');
    expect(['success', 'timeout', 'error']).toContain(res.status);
  });

  it('measureTcpPing should timeout or refuse gracefully for invalid closed port', async () => {
    // Port 19283 on 127.0.0.1 is unlikely to have a service listening
    const res = await measureTcpPing('127.0.0.1', 19283, 500);
    expect(res.protocol).toBe('tcp');
    expect(res.status === 'error' || res.status === 'timeout').toBe(true);
  });
});
