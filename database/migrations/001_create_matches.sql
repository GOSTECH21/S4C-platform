create table matches (

    id uuid primary key default gen_random_uuid(),

    competition_id uuid,

    home_club_id uuid references clubs(id),

    away_club_id uuid references clubs(id),

    kickoff timestamp,

    stadium text,

    status text default 'scheduled',

    home_goals integer default 0,

    away_goals integer default 0,

    created_at timestamp default now()

);

create index idx_matches_home
on matches(home_club_id);

create index idx_matches_away
on matches(away_club_id);

create index idx_matches_kickoff
on matches(kickoff);