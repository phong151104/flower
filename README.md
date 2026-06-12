# 🏓 PickleClub — Website CLB Pickleball

Website nội bộ cho câu lạc bộ pickleball (~12 thành viên): xếp hạng Elo cá nhân cho đánh đôi, lịch sử trận đấu, lịch tập + vote đi tập, quản lý giải đấu, quỹ CLB và bảng tin.

Xây dựng bằng **Next.js 14** + **Supabase** + **TailwindCSS**.

## Tính năng

### Public (không cần đăng nhập)
- **Trang chủ** — thông báo ghim, buổi tập sắp tới, top Elo, trận gần đây
- **Bảng xếp hạng** (`/rankings`) — Elo, thắng/thua, phong độ; badge Tạm tính (<12 trận) / Nghỉ dài (>3 tháng)
- **Ghi trận đấu** (`/matches`) — ai cũng ghi được: chọn 4 người, nhập tỷ số, xem preview Elo, xác nhận → Elo cập nhật ngay
- **Lịch tập + vote** (`/training`) — chọn tên mình, vote Đi tập / Bận
- **Giải đấu** (`/tournaments`) — 6 đội 2 bảng vòng tròn → bán kết → chung kết + tranh 3-4; standings và bracket tự động
- **Profile cá nhân** (`/players/[id]`) — biểu đồ Elo theo thời gian, win rate, đối đầu, partner ăn ý nhất

### Admin (`/admin` — qua AdminAuthGate: Google login hoặc Access Key)
- Quản lý thành viên (tier 1-4 → Elo khởi điểm 1300/1200/1100/1000)
- Quản lý trận đấu: sửa/xóa + **Tính lại toàn bộ Elo** (replay lịch sử)
- Tạo buổi tập, tạo giải đấu + chia đội 2 bảng
- Quỹ CLB: thu chi + grid đóng quỹ tháng theo thành viên
- Thông báo (ghim lên trang chủ)

## Hệ thống Elo

Theo rule trong [rule_xep_hang_elo_pickleball(1).md](<rule_xep_hang_elo_pickleball(1).md>):

```
Elo mới = Elo cũ + K × H × M × (S − E)
```

- **Elo cá nhân** cho đánh đôi — rating đội = trung bình Elo 2 người
- **K**: người mới 10 trận đầu = 40 → chưa đủ 3 giải = 32 → ổn định = 24 → từ 30 trận = 16
- **H** (cách biệt tỷ số): 1-3 điểm = 1.00 · 4-6 điểm = 1.15 · 7+ điểm = 1.25
- **M** (hệ số vòng): vòng bảng/trận tập = 1.00 · bán kết = 1.25 · tranh 3-4 = 1.10 · chung kết = 1.50

Logic nằm trong [src/lib/elo.ts](src/lib/elo.ts) (pure functions). Kiểm tra nhanh: `npx tsx scripts/test-elo.ts`

## Cài đặt

```bash
npm install
```

Tạo `.env` với:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

**Tạo bảng Supabase**: chạy [supabase/schema.sql](supabase/schema.sql) trong Supabase SQL Editor (bảng `admin_keys` cũ giữ nguyên).

```bash
npm run dev      # chạy dev server
npm run build    # build production
```

## Cấu trúc chính

| Đường dẫn | Vai trò |
|---|---|
| `src/lib/elo.ts` | Logic Elo (tính trận, recalculate, trạng thái xếp hạng) |
| `src/lib/stats.ts` | Head-to-head, partner stats, comparator BXH |
| `src/lib/tournament.ts` | Standings vòng bảng, bracket knock-out |
| `src/context/ClubContext.tsx` | State + sync Supabase (optimistic + realtime) |
| `src/context/AuthContext.tsx` | Auth Supabase (chỉ dùng cho admin) |
| `supabase/schema.sql` | Schema database |

## Lưu ý vận hành

- Website public, RLS mở cho anon — phù hợp CLB nội bộ; admin được bảo vệ ở UI
- Sau khi **sửa/xóa trận** trong admin, bấm **"Tính lại toàn bộ Elo"** để replay lịch sử
- Realtime: bảng xếp hạng, trận đấu và vote tự đồng bộ giữa các thiết bị
