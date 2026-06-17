-- ============================================================
-- MIGRATION: Ẩn buổi tập (giữ dữ liệu, chỉ ẩn khỏi danh sách)
-- Chạy MỘT LẦN trong Supabase SQL Editor.
-- ============================================================

alter table training_sessions
  add column if not exists archived boolean not null default false;
