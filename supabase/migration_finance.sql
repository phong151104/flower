-- ============================================================
-- MIGRATION: Thu tiền theo buổi tập + chia tiền tự động
-- Chạy file này MỘT LẦN trong Supabase SQL Editor nếu DB đã tồn tại
-- (không cần chạy lại schema.sql — chạy lại sẽ xóa bảng transactions).
-- ============================================================

create table if not exists session_costs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references training_sessions(id) on delete cascade,
  label text not null,
  amount numeric not null check (amount >= 0),
  category text not null default 'khac' check (category in ('tien_san','tien_nuoc','tien_bong','khac')),
  created_at timestamptz not null default now()
);
create index if not exists idx_session_costs_session on session_costs(session_id);

create table if not exists session_payments (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references training_sessions(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  paid boolean not null default true,
  paid_at timestamptz not null default now(),
  unique (session_id, player_id)
);

alter table session_costs enable row level security;
alter table session_payments enable row level security;

drop policy if exists "anon full access" on session_costs;
drop policy if exists "anon full access" on session_payments;
create policy "anon full access" on session_costs for all using (true) with check (true);
create policy "anon full access" on session_payments for all using (true) with check (true);

-- Realtime (bỏ qua lỗi nếu bảng đã có trong publication)
do $$
begin
  alter publication supabase_realtime add table session_costs;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table session_payments;
exception when duplicate_object then null;
end $$;
