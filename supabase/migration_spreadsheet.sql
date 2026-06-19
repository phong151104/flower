-- ============================================================
-- MIGRATION: Giao diện bảng /quy
-- - players.gender: giới tính (nam/nu/khac)
-- - fund_drive_members.amount: số tiền riêng từng người (null = mức mặc định của đợt)
-- - fund_drives.period: 'YYYY-MM' cho quỹ tháng (gom theo tháng)
-- Chạy MỘT LẦN trong Supabase SQL Editor.
-- ============================================================

alter table players            add column if not exists gender text;
alter table fund_drive_members add column if not exists amount numeric;
alter table fund_drives        add column if not exists period text;
