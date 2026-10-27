import { startAgentServer } from './server.js';

const PORT = parseInt(process.env.PORT || '48201', 10);

console.log('========================================================');
console.log('       🎮 NetCheck Gaming - Desktop Agent v1.0.0       ');
console.log('   Raw Socket / ICMP / TCP Telemetry Engine for PC     ');
console.log('========================================================');
console.log(`[OS] Detected platform: ${process.platform} (${process.arch})`);
console.log(`[Port] Listening on 127.0.0.1:${PORT}`);
console.log('Mở trang web NetCheck Gaming trên trình duyệt để tự động');
console.log('đồng bộ kết quả đo ICMP ping thật trong thời gian thực.');
console.log('--------------------------------------------------------');

startAgentServer({ port: PORT });
