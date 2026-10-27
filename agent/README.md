# NetCheck Gaming - Desktop Agent 🖥️⚡

> **Ứng dụng Desktop Agent nhỏ gọn chạy nền trên máy tính (Windows, macOS, Linux) để đo ICMP Ping thô và TCP Handshake trực tiếp tới server game, sau đó đẩy dữ liệu realtime lên website NetCheck qua WebSocket nội bộ (`ws://127.0.0.1:48201`).**

---

## 🌟 Tính năng của Agent

- 🎯 **Đo ICMP Ping thực**: Sử dụng ngăn xếp mạng ICMP native của hệ điều hành, cho ra số ping trùng khớp 100% với lệnh `ping` trong CMD / Terminal.
- 🔌 **Đo TCP Handshake Connect**: Đo độ trễ kết nối TCP trực tiếp tới cổng game (port 443 / 80).
- 🚀 **Không cần quyền Administrator/Root**: Chạy bằng tài khoản người dùng bình thường, tuyệt đối an toàn.
- 🔄 **Tự động bắt tay với Website**: Khi mở trang web NetCheck Gaming trên trình duyệt, web sẽ tự động nhận diện Agent và chuyển sang chế độ đo ICMP thực. Khi tắt Agent, website vẫn hoạt động bình thường với chế độ đo Web HTTP RTT.

---

## 🛠️ Hướng dẫn cài đặt & Chạy Agent

### Cách 1: Chạy trực tiếp bằng Node.js (Khuyến nghị)

1. Cài đặt [Node.js](https://nodejs.org/) (phiên bản 18, 20 hoặc 22).
2. Mở Terminal / PowerShell và di chuyển vào thư mục `agent`:
   ```bash
   cd agent
   npm install
   npm start
   ```

### Cách 2: Chạy chế độ Development (với tsx)
```bash
cd agent
npm run dev
```

Sau khi chạy, bạn sẽ thấy thông báo:
```
========================================================
       🎮 NetCheck Gaming - Desktop Agent v1.0.0       
   Raw Socket / ICMP / TCP Telemetry Engine for PC     
========================================================
[OS] Detected platform: win32 (x64)
[Port] Listening on 127.0.0.1:48201
Mở trang web NetCheck Gaming trên trình duyệt để tự động
đồng bộ kết quả đo ICMP ping thật trong thời gian thực.
--------------------------------------------------------
```

Bây giờ bạn chỉ cần mở website NetCheck Gaming trên trình duyệt, website sẽ tự động kết nối và hiển thị nhãn:
`🟢 Desktop Agent: Đã kết nối (ICMP Thật)`.
