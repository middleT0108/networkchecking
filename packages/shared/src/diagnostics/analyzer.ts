import { GameCategory, GameThresholds } from '../types/game';
import { NetworkMetrics } from '../types/metrics';

export interface DiagnosticItem {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  titleVi: string;
  titleEn: string;
  descriptionVi: string;
  descriptionEn: string;
  possibleCausesVi: string[];
  possibleCausesEn: string[];
  solutionsVi: string[];
  solutionsEn: string[];
}

export function analyzeNetworkDiagnostics(
  metrics: NetworkMetrics,
  category: GameCategory = 'fps',
  thresholds?: GameThresholds
): DiagnosticItem[] {
  const items: DiagnosticItem[] = [];
  const { ping, jitter, packetLoss } = metrics;
  const th = thresholds ?? {
    greatPing: 30,
    okPing: 60,
    greatJitter: 3,
    okJitter: 7,
    maxLoss: 0
  };

  // 1. Packet Loss Diagnosis
  if (packetLoss > 0) {
    const isCritical = packetLoss >= 2;
    items.push({
      id: 'packet-loss',
      severity: isCritical ? 'critical' : 'warning',
      titleVi: isCritical ? `Mất gói tin nghiêm trọng (${packetLoss}%)` : `Phát hiện mất gói tin (${packetLoss}%)`,
      titleEn: isCritical ? `Severe Packet Loss (${packetLoss}%)` : `Packet Loss Detected (${packetLoss}%)`,
      descriptionVi: 'Gói tin mạng bị rơi trên đường truyền, dẫn đến hiện tượng nhân vật giật lùi (rubberbanding), trúng đạn nhưng không tính sát thương hoặc mất kết nối đột ngột.',
      descriptionEn: 'Packets dropped in transit, causing rubberbanding, unregistered hits, or sudden disconnections.',
      possibleCausesVi: [
        'Sóng Wi-Fi yếu, bị nhiễu bởi các thiết bị khác hoặc vật cản tường bê tông',
        'Dây cáp mạng LAN (RJ45) bị gãy, bấm lỏng đầu tiếp xúc hoặc chất lượng kém',
        'Có thiết bị khác trong mạng đang tải torrent, stream 4K hoặc đồng bộ Cloud làm nghẽn router',
        'Đường truyền quốc tế của nhà mạng (ISP) bị suy hao hoặc đứt cáp quang biển'
      ],
      possibleCausesEn: [
        'Weak Wi-Fi signal, interference, or thick concrete walls',
        'Faulty, loose, or bent LAN/Ethernet cable',
        'Another device in your LAN heavily downloading/uploading or streaming',
        'ISP routing congestion or undersea cable degradation'
      ],
      solutionsVi: [
        'Ưu tiên cắm dây mạng trực tiếp (Ethernet CAT5e/CAT6) thay vì dùng Wi-Fi',
        'Khởi động lại (reboot) Modem/Router để giải phóng bộ nhớ đệm router',
        'Kiểm tra và tắt các ứng dụng chạy ngầm ngốn băng thông: Steam/Epic updates, Torrent, OneDrive, Google Drive',
        'Bật tính năng QoS (Quality of Service) hoặc SQM (Smart Queue Management) trên Router nếu có'
      ],
      solutionsEn: [
        'Switch to a wired Ethernet cable (CAT5e/CAT6) instead of Wi-Fi',
        'Reboot your modem/router to clear buffer and state tables',
        'Pause background downloads (Steam updates, Torrent, Cloud sync)',
        'Enable QoS or SQM on your router to prioritize gaming packets'
      ]
    });
  }

  // 2. High Jitter Diagnosis
  if (jitter > th.okJitter) {
    const isCritical = jitter > th.okJitter * 2;
    items.push({
      id: 'high-jitter',
      severity: isCritical ? 'critical' : 'warning',
      titleVi: `Độ lệch trễ (Jitter) cao: ${jitter}ms`,
      titleEn: `High Jitter Variation: ${jitter}ms`,
      descriptionVi: 'Ping thay đổi thất thường giữa các thời điểm, khiến cảm giác điều khiển bị khựng và không nhất quán.',
      descriptionEn: 'Ping fluctuates erratically between samples, causing micro-stutters and inconsistent input timing.',
      possibleCausesVi: [
        'Đang dùng Wi-Fi (đặc biệt là băng tần 2.4GHz dễ bị nhiễu sóng)',
        'Bufferbloat: Router không quản lý hàng đợi tốt khi có tải đột ngột',
        'Ứng dụng chạy ngầm gửi dữ liệu theo từng burst ngắt quãng'
      ],
      possibleCausesEn: [
        'Using 2.4GHz Wi-Fi subject to radio interference',
        'Bufferbloat: Router queue builds up latency under sudden bursts',
        'Background software syncing data periodically'
      ],
      solutionsVi: [
        'Chuyển sang băng tần Wi-Fi 5GHz hoặc tốt nhất là cắm dây LAN',
        'Đổi kênh truyền Wi-Fi (Wi-Fi Channel) ít bị trùng với hàng xóm',
        'Đóng các tab trình duyệt chạy video ngầm hoặc Discord stream'
      ],
      solutionsEn: [
        'Switch to 5GHz Wi-Fi band or ideally wired Ethernet',
        'Change router Wi-Fi channel to an uncontested channel',
        'Close video streams or background heavy browser tabs'
      ]
    });
  }

  // 3. High Ping Diagnosis
  if (ping.median > th.okPing) {
    const isCritical = ping.median > th.okPing * 2;
    items.push({
      id: 'high-ping',
      severity: isCritical ? 'critical' : 'warning',
      titleVi: `Độ trễ (Ping) cao: ${ping.median}ms`,
      titleEn: `High Latency: ${ping.median}ms`,
      descriptionVi: `Ping vượt quá ngưỡng tối ưu cho game ${category.toUpperCase()} (ngưỡng khuyến nghị <= ${th.greatPing}ms).`,
      descriptionEn: `Latency exceeds optimal threshold for ${category.toUpperCase()} gaming (recommended <= ${th.greatPing}ms).`,
      possibleCausesVi: [
        'Đang kết nối tới máy chủ quá xa địa lý (ví dụ từ VN sang EU/US thay vì Singapore/Hong Kong)',
        'Tuyến cáp quang quốc tế của nhà mạng đang gặp sự cố, phải đi vòng qua tuyến dự phòng',
        'Đang bật VPN hoặc Proxy định tuyến vòng qua nước khác'
      ],
      possibleCausesEn: [
        'Selected game region is geographically far (e.g. EU/US instead of SEA/HK)',
        'ISP undersea cable maintenance routing traffic sub-optimally',
        'VPN or proxy active rerouting traffic through a distant hop'
      ],
      solutionsVi: [
        'Chọn đúng cụm máy chủ gần nhất (Singapore, Hong Kong, Tokyo đối với người chơi tại Việt Nam)',
        'Tắt VPN/Proxy khi chơi game nếu không cần thiết',
        'Thử các dịch vụ giảm ping gaming uy tín (GearUP, ExitLag, Tiny, WTFast) nếu nhà mạng bị routing vòng'
      ],
      solutionsEn: [
        'Select the geographically closest region (Singapore / Hong Kong for SEA players)',
        'Disable unneeded VPNs or proxies before matchmaking',
        'Try specialized gaming route optimizers (ExitLag, GearUP) if your ISP routing is sub-optimal'
      ]
    });
  }

  // If no major issues
  if (items.length === 0) {
    items.push({
      id: 'optimal',
      severity: 'info',
      titleVi: 'Đường truyền ổn định tuyệt vời',
      titleEn: 'Optimal Network Health',
      descriptionVi: `Ping ${ping.median}ms, Jitter ${jitter}ms, không mất gói. Bạn đã sẵn sàng vào trận!`,
      descriptionEn: `Ping ${ping.median}ms, Jitter ${jitter}ms, 0% packet loss. Optimal condition for gaming!`,
      possibleCausesVi: ['Đường truyền sạch, không bị nghẽn.'],
      possibleCausesEn: ['Clean route with minimal congestion.'],
      solutionsVi: ['Duy trì kết nối mạng hiện tại để có trải nghiệm tốt nhất.'],
      solutionsEn: ['Keep current setup for best gaming experience.']
    });
  }

  return items;
}
