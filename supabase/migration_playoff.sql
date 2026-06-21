-- ============================================================
-- MIGRATION: Thể thức giải mới (double-elimination 6 seed)
-- - Mở rộng matches.round (giữ giá trị cũ để giải cũ không vỡ)
-- - tournaments.format: 'group_knockout' (cũ) | 'double_elim' (mới)
-- Chạy MỘT LẦN trong Supabase SQL Editor.
-- ============================================================

alter table matches drop constraint if exists matches_round_check;
alter table matches add constraint matches_round_check check (round in (
  'group','semi','third','final',
  'seeding','ur1','ur2','ur3','lr1','lr2','lr3','lr_final','grand_final'
));

alter table tournaments add column if not exists format text not null default 'group_knockout';
