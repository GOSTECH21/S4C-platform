create table match_campaigns (

    id uuid primary key default gen_random_uuid(),

    match_id uuid not null
        references matches(id)
        on delete cascade,

    club_id uuid not null
        references clubs(id)
        on delete cascade,

    title text,

    sponsorship_per_goal numeric(12,2) default 0,

    maximum_votes integer default 3,

    voting_opens timestamp,

    voting_closes timestamp,

    status text default 'draft',

    created_at timestamp default now()

);

create index idx_campaign_match
on match_campaigns(match_id);

create index idx_campaign_club
on match_campaigns(club_id);

create unique index idx_match_club
on match_campaigns(match_id, club_id);