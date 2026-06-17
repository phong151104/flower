-- ============================================================
-- MIGRATION: Đợt thu quỹ (quỹ tháng / quỹ giải / tùy chỉnh)
-- Tạo đợt thu → chọn người cần đóng → tick ai đã đóng.
-- Chạy MỘT LẦN trong Supabase SQL Editor.
-- ============================================================

create table if not exists fund_drives (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  kind text not null default 'custom' check (kind in ('monthly','custom')),
  amount numeric not null default 0 check (amount >= 0),  -- mỗi người đóng
  note text,
  created_at timestamptz not null default now()
);

create table if not exists fund_drive_members (
  id uuid primary key default gen_random_uuid(),
  drive_id uuid not null references fund_drives(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  paid boolean not null default false,
  paid_at timestamptz,
  unique (drive_id, player_id)
);
create index if not exists idx_fund_drive_members_drive on fund_drive_members(drive_id);

alter table fund_drives enable row level security;
alter table fund_drive_members enable row level security;

drop policy if exists "anon full access" on fund_drives;
drop policy if exists "anon full access" on fund_drive_members;
create policy "anon full access" on fund_drives for all using (true) with check (true);
create policy "anon full access" on fund_drive_members for all using (true) with check (true);

do $$ begin alter publication supabase_realtime add table fund_drives; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table fund_drive_members; exception when duplicate_object then null; end $$;
