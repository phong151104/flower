-- ============================================================
-- MIGRATION: Realtime cho training_sessions
-- Chạy một lần trong Supabase SQL Editor để buổi tập tự đồng bộ
-- giữa trang Lịch tập và tab Quỹ > Theo tháng trên nhiều thiết bị.
-- ============================================================

do $$ begin
  alter publication supabase_realtime add table training_sessions;
exception when duplicate_object then null; end $$;
