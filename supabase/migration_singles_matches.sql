-- Support 1v1 training matches while keeping existing 2v2 matches intact.

alter table matches
  add column if not exists match_format text not null default 'doubles';

update matches
set match_format = 'doubles'
where match_format is null;

alter table matches
  alter column team_a_player2 drop not null,
  alter column team_b_player2 drop not null;

do $$
begin
  alter table matches
    add constraint matches_match_format_check
    check (match_format in ('singles','doubles'));
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table matches
    add constraint matches_format_players_check
    check (
      (match_format = 'singles' and team_a_player2 is null and team_b_player2 is null)
      or
      (match_format = 'doubles' and team_a_player2 is not null and team_b_player2 is not null)
    );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table matches
    add constraint matches_singles_training_check
    check (match_format <> 'singles' or match_type = 'training');
exception
  when duplicate_object then null;
end $$;
