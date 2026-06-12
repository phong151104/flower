-- ============================================================
-- PickleClub — Schema cho website CLB Pickleball
-- Chạy file này trong Supabase SQL Editor.
-- Bảng admin_keys cũ GIỮ NGUYÊN (không tạo lại ở đây).
-- Các bảng cũ của web bán hoa (products, orders, manual_orders,
-- transactions cũ) có thể xóa thủ công nếu không cần.
--
-- LƯU Ý RLS: CLB nội bộ ~12 người, website public không có auth
-- cho member ("ai cũng ghi được trận"). Vì vậy anon key được phép
-- CRUD; các trang admin được bảo vệ ở UI bằng AdminAuthGate.
-- Trade-off này chấp nhận được cho CLB nội bộ.
-- ============================================================

-- Xóa bảng transactions cũ của web hoa (schema khác)
drop table if exists transactions cascade;

create table players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  nickname text,
  avatar_url text,
  tier int not null default 4 check (tier between 1 and 4),
  initial_elo int not null default 1000,          -- theo tier: 1300/1200/1100/1000
  current_elo numeric(7,2) not null default 1000, -- denormalized, cập nhật sau mỗi trận
  matches_played int not null default 0,
  tournaments_played int not null default 0,      -- để tính K=32 cho 3 giải đầu
  wins int not null default 0,
  losses int not null default 0,
  last_match_at timestamptz,                      -- tính Inactive (nghỉ 3 tháng)
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tournament_date date not null,
  status text not null default 'draft' check (status in ('draft','group','knockout','completed')),
  note text,
  created_at timestamptz not null default now()
);

create table tournament_teams (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  name text not null,
  player1_id uuid not null references players(id),
  player2_id uuid not null references players(id),
  group_name text not null check (group_name in ('A','B')),
  created_at timestamptz not null default now()
);

create table matches (
  id uuid primary key default gen_random_uuid(),
  match_type text not null check (match_type in ('training','tournament')),
  tournament_id uuid references tournaments(id) on delete set null,
  round text check (round in ('group','semi','third','final')),  -- null nếu training
  played_at timestamptz not null default now(),
  team_a_player1 uuid not null references players(id),
  team_a_player2 uuid not null references players(id),
  team_b_player1 uuid not null references players(id),
  team_b_player2 uuid not null references players(id),
  score_a int not null check (score_a >= 0),
  score_b int not null check (score_b >= 0),
  winner text not null check (winner in ('A','B')),
  -- snapshot Elo: [{playerId, before, after, delta, k, h, m, expected} x 4]
  elo_changes jsonb not null,
  recorded_by text,
  created_at timestamptz not null default now()
);
create index idx_matches_played_at on matches(played_at);
create index idx_matches_tournament on matches(tournament_id);

create table training_sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Buổi tập',
  session_date date not null,
  start_time time,
  end_time time,
  location text,
  note text,
  created_at timestamptz not null default now()
);

create table training_votes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references training_sessions(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  status text not null check (status in ('yes','no')),
  voted_at timestamptz not null default now(),
  unique (session_id, player_id)  -- upsert khi đổi vote
);

create table transactions (
  id text primary key,
  type text not null check (type in ('income','expense')),
  amount numeric not null,
  description text not null,
  category text not null,  -- 'tien_san' | 'bong' | 'quy_thang' | 'khac'
  player_id uuid references players(id) on delete set null,  -- cho đóng quỹ tháng
  date date not null,
  created_at timestamptz not null default now()
);

create table announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  is_pinned boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- RLS: bật RLS + policy mở cho anon (xem lưu ý đầu file)
-- ============================================================

alter table players enable row level security;
alter table tournaments enable row level security;
alter table tournament_teams enable row level security;
alter table matches enable row level security;
alter table training_sessions enable row level security;
alter table training_votes enable row level security;
alter table transactions enable row level security;
alter table announcements enable row level security;

create policy "anon full access" on players for all using (true) with check (true);
create policy "anon full access" on tournaments for all using (true) with check (true);
create policy "anon full access" on tournament_teams for all using (true) with check (true);
create policy "anon full access" on matches for all using (true) with check (true);
create policy "anon full access" on training_sessions for all using (true) with check (true);
create policy "anon full access" on training_votes for all using (true) with check (true);
create policy "anon full access" on transactions for all using (true) with check (true);
create policy "anon full access" on announcements for all using (true) with check (true);

-- Realtime cho các bảng cần đồng bộ giữa nhiều thiết bị
alter publication supabase_realtime add table players;
alter publication supabase_realtime add table matches;
alter publication supabase_realtime add table training_votes;
