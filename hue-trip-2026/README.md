# Huế Trip 2026

Website kế hoạch chuyến đi Huế 02-04/10/2026 cho nhóm 8 người, kết hợp:

- Lịch trình 3 ngày 2 đêm
- Phân bổ thành viên, vé tàu và phòng
- Ngân sách kế hoạch
- Checklist chuẩn bị
- Chi tiêu thực tế theo từng cá nhân
- Tricount Exporter và REST adapter cùng domain

## Cấu trúc

```text
hue-trip-web/
├── public/
│   └── index.html
├── functions/
│   └── api/
│       └── tricount/
│           └── [id].js
├── package.json
├── wrangler.toml
└── README.md
```

## Deploy miễn phí bằng Cloudflare Pages

1. Tạo repository GitHub mới.
2. Upload toàn bộ nội dung thư mục này lên repository.
3. Trong Cloudflare chọn Workers & Pages > Create > Pages > Connect to Git.
4. Chọn repository.
5. Framework preset: None.
6. Build command: để trống.
7. Build output directory: `public`.
8. Deploy.

Website dự kiến:

```text
https://hue-trip-2026.pages.dev
```

API cùng domain:

```text
https://hue-trip-2026.pages.dev/api/tricount/taKHasAsiHaQJDNMKX
```

## Giới hạn Tricount Exporter

URL `https://tricount-exporter.pages.dev/tricount/taKHasAsiHaQJDNMKX` hiện là trang HTML. Function đi kèm sẽ:

1. Gọi trực tiếp URL này khi có request Sync.
2. Nhận JSON nếu dịch vụ bắt đầu trả JSON.
3. Tìm JSON được nhúng trong HTML nếu có.
4. Trả lỗi có cấu trúc nếu trang chỉ chứa HTML và dữ liệu được tải sau bằng JavaScript.

Do chính sách same-origin, một website khác không thể đọc dữ liệu runtime của trang exporter nếu exporter không công bố JSON API hoặc cơ chế `postMessage`.

## Chạy local

```bash
npm install
npm run dev
```

Sau đó mở URL do Wrangler hiển thị.

## Bảo mật

- Không đưa token, khóa bí mật hoặc thông tin đăng nhập vào `index.html`.
- Không dùng proxy CORS công cộng cho dữ liệu chi tiêu.
- Nếu sau này có API key, lưu bằng Cloudflare Secrets.
- Chỉ chia sẻ URL Tricount với thành viên được phép xem dữ liệu tài chính.

## Giao diện Sync đơn giản

Trong tab Chi tiêu thực tế, người dùng chỉ cần:

1. Dán liên kết Tricount Exporter.
2. Nhấn **Sync Tricount**.
3. Website tự trích xuất ID và gọi API cùng domain `/api/tricount/:id`.

Không có khu vực nhập baseline JSON trên giao diện.
