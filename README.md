# 🌸 Bloomella - Cửa hàng hoa tươi trực tuyến

Ứng dụng web bán hoa tươi, xây dựng bằng **Next.js 14** với tính năng AI tạo bó hoa tùy chỉnh.

## Yêu cầu hệ thống

- **Node.js** >= 18.x
- **npm** >= 9.x (hoặc yarn / pnpm)
- **Google API Key** (cho tính năng AI Bouquet Builder - tùy chọn)

## Cài đặt

### 1. Clone dự án

```bash
git clone <repository-url>
cd flower
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình biến môi trường

Tạo file `.env` ở thư mục gốc:

```env
GOOGLE_API_KEY=your_google_api_key_here
```

> **Lưu ý:** Google API Key dùng cho tính năng AI Bouquet Builder (tạo ảnh bó hoa bằng Gemini/Imagen). Nếu không có key, ứng dụng vẫn chạy bình thường, chỉ tính năng AI sẽ không hoạt động.

### 4. Chạy ứng dụng

```bash
# Chế độ development
npm run dev
```

Mở trình duyệt tại **http://localhost:3000**

### 5. Build production

```bash
npm run build
npm start
```

## Cấu trúc dự án

```
src/
├── app/                    # Các trang (Next.js App Router)
│   ├── page.tsx            # Trang chủ
│   ├── about/              # Giới thiệu
│   ├── shop/               # Cửa hàng + Chi tiết sản phẩm
│   ├── gallery/            # Bộ sưu tập
│   ├── contact/            # Liên hệ
│   └── api/                # API routes (AI image generation)
├── components/             # Các component UI
│   ├── home/               # Component trang chủ
│   └── shop/               # Component cửa hàng
├── context/                # React Context (Cart, Wishlist)
├── data/                   # Dữ liệu sản phẩm
├── lib/                    # Tiện ích, hằng số
└── types/                  # TypeScript declarations
```

## Công nghệ sử dụng

| Công nghệ | Mục đích |
|---|---|
| Next.js 14 | Framework React (App Router) |
| TailwindCSS | Styling |
| Framer Motion | Animations |
| Lucide React | Icons |
| Google Gemini API | AI tạo ảnh bó hoa |

## Tính năng chính

- 🛒 Giỏ hàng & Danh sách yêu thích
- 🔍 Lọc sản phẩm theo danh mục, giá, màu sắc, dịp
- 🤖 AI Bouquet Builder - Tạo bó hoa tùy chỉnh bằng AI
- 📱 Responsive trên mọi thiết bị
- ✨ Animations mượt mà

## Thông tin liên hệ

- 📍 44 Ng. 176 P. Lê Trọng Tấn, Khương Mai, Thanh Xuân, Hà Nội
- 📞 0888 229 955
- 📧 blommella102@gmail.com
