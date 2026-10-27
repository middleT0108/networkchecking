# NetCheck Gaming 🎮🌐
> **Website kiểm tra chất lượng kết nối mạng thời gian thực chuyên sâu dành cho game thủ (Valorant, CS2, Delta Force, LoL, Dota 2, Apex, PUBG, Fortnite...).**

[![CI - Test & Typecheck](https://github.com/ghuol/networkchecking/actions/workflows/ci.yml/badge.svg)](https://github.com/ghuol/networkchecking/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📌 Tính năng chính

- ⚡ **Đo RTT & Jitter thời gian thực**: Cập nhật mỗi 1-2 giây với độ chính xác nano-giây qua `performance.now()`.
- 📊 **Biểu đồ động đổi màu theo ngưỡng**: Biểu đồ sóng Recharts tự động đổi màu theo chất lượng mạng (Xanh lá &le; 30ms, Xanh dương &le; 60ms, Vàng &le; 100ms, Đỏ > 100ms).
- 🏆 **Chấm điểm chất lượng kết nối (0 - 100)**: Thuật toán thích ứng theo từng thể loại game (FPS cạnh tranh vs MOBA/Battle Royale), tự động phạt nặng nếu có gián đoạn đường truyền.
- 🎯 **Kiểm tra theo từng Game & Xếp hạng Region**:
  - Hỗ trợ cấu hình riêng cho: **Valorant, CS2, Delta Force, League of Legends, Dota 2, Apex Legends, PUBG, Fortnite**.
  - **Đo song song tất cả Region**: Tự động đo đồng thời tất cả máy chủ khu vực (Singapore, Hong Kong, Tokyo, Sydney, Frankfurt...) và gắn huy hiệu **CROWN - TỐT NHẤT** cho cụm server tối ưu nhất.
  - **Tách biệt trạng thái hãng**: Hiển thị rõ ràng trạng thái server chính thức từ nhà phát hành (Riot, Valve, Tencent, Epic) độc lập với chất lượng đường truyền mạng gia đình của bạn.
- 🔧 **Bộ chẩn đoán & Hướng khắc phục**: Tự động phát hiện mất gói (packet loss), jitter cao, ping cao; phân tích nguyên nhân (Wi-Fi 2.4GHz nhiễu sóng, router bufferbloat, đứt cáp biển) và hướng dẫn khắc phục từng bước.
- 🚀 **Đo tốc độ tải (On-Demand Speed Test)**: Đo băng thông Download & Upload thực tế tới cụm CDN Edge gần nhất.
- 🔊 **Cảnh báo âm thanh Synth**: Sử dụng Web Audio API tích hợp sẵn (không tải file mp3 bên ngoài, không lo lỗi 404), cảnh báo tức thì khi bị rớt mạng và báo chuông khi có mạng trở lại.
- 🛡️ **Bảo mật tuyệt đối**: Không lưu trữ địa chỉ IP thô. Dữ liệu lịch sử ẩn danh được băm mã hóa SHA-256 kèm salt xoay vòng hàng ngày trên Cloudflare D1.
- 🌐 **Tiết kiệm băng thông**: Tự động phát hiện tab chạy nền (`document.visibilityState`) để giảm tần suất đo, không làm nghẽn mạng khi bạn đang tập trung vào trận đấu.

---

## 📐 Kiến trúc & Công nghệ

Dự án được cấu trúc theo mô hình **Monorepo** tiêu chuẩn:

```
networkchecking/
├── apps/
│   ├── web/               # Frontend: React 18 + Vite + TypeScript + TailwindCSS + Recharts + Zustand
│   └── api/               # Backend: Cloudflare Workers + Hono Framework + D1 SQLite + WebSocket duplex
├── packages/
│   └── shared/            # Thư viện dùng chung: Thuật toán đo, chấm điểm, chẩn đoán, games.config.json
├── .github/workflows/     # CI/CD: Tự động test, build, deploy Pages & Workers, Cron status check
└── agent/                 # (Tùy chọn) Desktop Agent đo ICMP/UDP socket thực
```

### Tại sao chọn Cloudflare Workers + Cloudflare Pages?
1. **0ms Cold Start & 300+ PoP toàn cầu**: Phản hồi RTT baseline cực kỳ chính xác nhờ mạng lưới Edge gần người dùng nhất (peering trực tiếp tại VNIX, Viettel, FPT, VNPT tại Việt Nam).
2. **Hoàn toàn miễn phí (Free Tier)**:
   - Cloudflare Pages: Miễn phí băng thông không giới hạn.
   - Cloudflare Workers: Miễn phí 100,000 requests/ngày.
   - Cloudflare D1 Database: Miễn phí 5,000,000 lượt đọc/ngày và 100,000 lượt ghi/ngày.
3. **Hỗ trợ WebSocket Hibernation Native**: Cho phép duy trì kết nối WebSocket duplex đo RTT mà không tốn CPU.

---

## 💻 Hướng dẫn chạy thử nghiệm Local (Development)

### Yêu cầu môi trường:
- Node.js >= 20.x hoặc 22.x
- npm >= 10.x

### Bước 1: Clone mã nguồn
```bash
git clone https://github.com/your-username/networkchecking.git
cd networkchecking
```

### Bước 2: Cài đặt thư viện
```bash
npm install
```

### Bước 3: Chạy Unit Tests
Kiểm tra toàn bộ 20 unit test của các gói:
```bash
npm test
```

### Bước 4: Chạy Frontend trên máy
```bash
npm run dev:web
```
Mở trình duyệt tại: `http://localhost:3000`

### Bước 5: (Tùy chọn) Chạy Backend API local
```bash
npm run dev:api
```
Backend Worker sẽ khởi chạy tại: `http://localhost:8787`

---

## 🚀 Hướng dẫn Deploy lên Cloudflare (Từng bước cho người mới)

### Bước 1: Chuẩn bị tài khoản Cloudflare
1. Đăng ký tài khoản miễn phí tại [dash.cloudflare.com](https://dash.cloudflare.com).
2. Lấy **Account ID**:
   - Trong trang tổng quan Cloudflare, nhìn sang cột menu bên phải hoặc URL sẽ thấy chuỗi **Account ID** (dạng 32 ký tự hex).
3. Tạo **API Token**:
   - Truy cập **My Profile** &rarr; **API Tokens** &rarr; **Create Token**.
   - Chọn template **Edit Cloudflare Workers** (hoặc tạo Custom Token có quyền: `Account.Workers Scripts:Edit`, `Account.D1:Edit`, `Account.Pages:Edit`).
   - Lưu lại mã Token vừa tạo.

### Bước 2: Tạo Cơ sở dữ liệu Cloudflare D1
Mở terminal trên máy tính của bạn và chạy:
```bash
cd apps/api

# Đăng nhập vào Cloudflare từ CLI
npx wrangler login

# Tạo Database D1 có tên netcheck-db
npx wrangler d1 create netcheck-db
```
Lệnh trên sẽ in ra thông tin cấu hình tương tự như sau:
```toml
[[d1_databases]]
binding = "DB"
database_name = "netcheck-db"
database_id = "xxxx-xxxx-xxxx-xxxx-xxxx"
```

1. Mở file `apps/api/wrangler.toml`.
2. Thay thế `placeholder-d1-database-id` bằng `database_id` thật của bạn.
3. Khởi tạo bảng dữ liệu trên Cloudflare:
```bash
npx wrangler d1 execute netcheck-db --file=src/db/schema.sql --remote
```

### Bước 3: Thiết lập GitHub Secrets
Trên kho lưu trữ GitHub của bạn, vào **Settings** &rarr; **Secrets and variables** &rarr; **Actions** &rarr; **New repository secret**:

| Tên Secret | Giá trị cần điền |
| :--- | :--- |
| `CLOUDFLARE_API_TOKEN` | Mã API Token bạn đã tạo ở Bước 1. |
| `CLOUDFLARE_ACCOUNT_ID` | Account ID lấy từ trang Dashboard Cloudflare. |
| `VITE_API_URL` | Domain Worker sau khi deploy (VD: `https://netcheck-api.your-account.workers.dev`). |

### Bước 4: Tự động Deploy qua GitHub Actions
Chỉ cần commit và push code lên nhánh `main`:
```bash
git add .
git commit -m "feat: complete netcheck gaming deployment setup"
git push origin main
```

GitHub Actions sẽ tự động:
1. Chạy quy trình **CI** (test & typecheck).
2. Deploy backend lên **Cloudflare Workers**.
3. Build và deploy frontend lên **Cloudflare Pages**.
4. Thiết lập **Cron Workflow** kiểm tra uptime server game mỗi 15 phút.

---

## 🎮 Cách thêm hoặc cập nhật Game mới

Mọi cấu hình tựa game đều nằm tập trung tại một file duy nhất:
👉 [`packages/shared/src/config/games.config.json`](file:///c:/Users/ghuol/Documents/GitHub/networkchecking/packages/shared/src/config/games.config.json)

Để thêm game mới, bạn chỉ cần mở file và chèn thêm đối tượng vào mảng `games`:

```json
{
  "id": "my-game",
  "name": "Tên Game Mới",
  "publisher": "Tên Nhà Phát Hành",
  "category": "fps",
  "icon": "shield",
  "color": "#FF5733",
  "statusUrl": "https://status.example.com",
  "thresholds": {
    "greatPing": 30,
    "okPing": 60,
    "greatJitter": 3,
    "okJitter": 7,
    "maxLoss": 0
  },
  "regions": [
    {
      "id": "sgp",
      "name": "Singapore",
      "host": "sgp.example.com",
      "testUrl": "https://sgp.example.com/health",
      "type": "http-head",
      "verified": true,
      "note": "Cụm server đặt tại Singapore"
    }
  ]
}
```
*Frontend và Backend sẽ tự động nhận diện game mới mà không cần chỉnh sửa bất kỳ dòng code nào khác!*

---

## 🔬 Tính minh bạch & Nguyên lý kỹ thuật

> [!NOTE]
> **Tại sao trình duyệt web không gửi được ICMP Ping?**
>
> Vì lý do bảo mật Sandbox của trình duyệt web (W3C / RFC), mã JavaScript chạy trên trình duyệt **không được phép tạo Raw Socket** để gửi gói tin ICMP Echo Request (lệnh `ping` truyền thống) nhằm ngăn chặn tấn công DDoS ngầm từ website độc hại.

### Giải pháp kỹ thuật của NetCheck Gaming:
1. **Phép đo RTT:** Sử dụng `performance.now()` đo thời gian Round-Trip Time khi gửi request HTTP `HEAD` / WebSocket duplex tới cụm CDN/Edge của từng hãng với cờ `cache: 'no-store'`.
   - Kết quả phản ánh chính xác chất lượng đường truyền vật lý từ máy bạn tới Cloud/PoP của khu vực đó.
   - *Lưu ý:* Độ trễ thực tế trong trận (in-game tick ping) có thể chênh lệch nhẹ từ 3-8ms tùy thuộc vào chu kỳ xử lý của Game Engine server (Tick-rate 64Hz hay 128Hz).
2. **Jitter:** Tính toán theo công thức độ lệch trung bình tuyệt đối giữa các mẫu RTT liên tiếp:
   $$Jitter = \frac{1}{N-1} \sum_{i=1}^{N-1} |RTT_{i+1} - RTT_i|$$
3. **Packet Loss:** Là chỉ số **Ước lượng** dựa trên tỉ lệ request bị timeout hoặc gián đoạn mạng trong cửa sổ trượt 100 mẫu gần nhất.
4. **Bảo mật quyền riêng tư:** Hệ thống không lưu trữ IP của bạn. Địa chỉ IP chỉ được dùng tạm thời để hash SHA-256 kèm salt thay đổi theo ngày nhằm phục vụ phân nhóm thống kê vùng địa lý.

---

## 📜 Giấy phép

Dự án được phân phối dưới giấy phép [MIT License](LICENSE).
Mọi đóng góp (Pull Request / Issue) nhằm bổ sung thêm endpoint server game đều được hoan nghênh!
