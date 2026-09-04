create table campaign_projects (

    id uuid primary key default gen_random_uuid(),

    campaign_id uuid not null
        references match_campaigns(id)
        on delete cascade,

    climate_project_id uuid not null
        references climate_projects(id)
        on delete cascade,

    display_order integer default 1,

    created_at timestamp default now()

);

create index idx_campaign_projects_campaign
on campaign_projects(campaign_id);

create index idx_campaign_projects_project
on campaign_projects(climate_project_id);

create unique index idx_campaign_project_unique
on campaign_projects(
    campaign_id,
    climate_project_id
);