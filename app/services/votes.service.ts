import { supabase } from "../lib/supabase";
import {
  displayClubName,
  getSupportedTeams,
  scoreLabelForSport,
  sponsorLogoSrc,
  type TeamOption,
} from "./teams.service";
import {
  DEFAULT_GBP_PER_VOTE,
  DEFAULT_MINIMUM_SPONSORSHIP,
  DEFAULT_PROJECTED_VOTES,
  OPENING_SPONSORSHIP,
  currentSponsorshipAmount,
  formatMatchHeadline,
} from "../lib/sponsorship-auction";
import { seasonNamesMatch } from "../lib/current-season";
import {
  MATCH_DAY_PORTFOLIO_VOTED,
  fanPostVisibility,
  fanTeamMatchesPostedClub,
  isPostedPortfolioStatus,
  matchDayCampaignTitle,
  portfolioProjectId,
  postedMatchDayForFanTeam,
  readAllFanPostSchedules,
  storedCampaignIdForClub,
} from "../lib/match-day-post";
import {
  MISSING_CAMPAIGN_VOTE_MESSAGE,
  isCampaignIdNotNullError,
  isVoteUuid,
  ownedCampaignId,
  retainVoteCampaignId,
  voteRowsForInsert,
} from "../lib/fan-votes";
import { resolvedFullName } from "../lib/s4p-admin";
import { identifySignedInKind } from "./signed-in-role.service";
import { isFanFacingKind } from "../lib/signed-in-role";

export type ClimateProject = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  country: string | null;
  estimated_co2: number | null;
  funding_goal: number | null;
  image_url: string | null;
  status: string | null;
  featured?: boolean | null;
  location?: string | null;
};

export type Supporter = {
  id: string;
  full_name: string | null;
  email: string | null;
  auth_user_id: string | null;
  favourite_club_id?: string | null;
};

const PROJECT_FIELDS =
  "id, name, description, category, country, estimated_co2, funding_goal, image_url, status, featured";

const FEATURED_PROJECT_NAME = "Global Schools Solar";

export function describeDataError(error: unknown, fallback = "Request failed."): string {
  if (error instanceof Error && error.message.trim()) return error.message;
  if (error && typeof error === "object") {
    const row = error as {
      message?: string;
      details?: string;
      hint?: string;
      code?: string;
    };
    const parts = [row.message, row.details, row.hint, row.code]
      .map((part) => String(part ?? "").trim())
      .filter(Boolean);
    if (parts.length > 0) return parts.join(" — ");
  }
  if (typeof error === "string" && error.trim()) return error;
  return fallback;
}

function throwIfQueryError(error: unknown, fallback: string) {
  if (!error) return;
  const message = describeDataError(error, fallback);
  const code = String((error as { code?: string }).code ?? "");
  const err = new Error(message);
  (err as Error & { code?: string }).code = code;
  throw err;
}

export function isFeaturedClimateProject(
  project: Pick<ClimateProject, "name" | "featured">
): boolean {
  if (project.featured) return true;
  return /global\s+schools\s+solar/i.test(project.name ?? "");
}

export async function getFeaturedClimateProject(): Promise<ClimateProject | null> {
  const byFlag = await supabase
    .from("climate_projects")
    .select(PROJECT_FIELDS)
    .eq("featured", true)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (byFlag.data) return byFlag.data as ClimateProject;

  const byName = await supabase
    .from("climate_projects")
    .select(PROJECT_FIELDS)
    .ilike("name", FEATURED_PROJECT_NAME)
    .maybeSingle();

  return (byName.data as ClimateProject | null) ?? null;
}

async function splitFeaturedProjects(
  projects: ClimateProject[]
): Promise<{
  featuredProject: ClimateProject | null;
  clubProjects: ClimateProject[];
}> {
  // Featured is platform-level (Global Schools Solar) and sits above the
  // club sustainability director's five match projects — never as one of them.
  const featuredProject =
    (await getFeaturedClimateProject()) ??
    projects.find(isFeaturedClimateProject) ??
    null;
  const clubProjects = projects
    .filter(
      (project) =>
        project.id !== featuredProject?.id &&
        !isFeaturedClimateProject(project)
    )
    .slice(0, 5);
  return { featuredProject, clubProjects };
}

async function resolveOpenCampaignId(
  clubId: string | null | undefined,
  clubName?: string | null
): Promise<string | null> {
  const stored = storedCampaignIdForClub(clubId);
  if (stored) return stored;

  if (isVoteUuid(clubId)) {
    const { data } = await supabase
      .from("match_campaigns")
      .select("id, club_id, title, status")
      .eq("club_id", clubId);
    const ranked = data ?? [];
    const open =
      ranked.find((row) => String(row.status ?? "").toLowerCase() === "open") ??
      ranked[0];
    const owned = ownedCampaignId(open, clubId);
    if (owned) return owned;
  }

  if (clubName) {
    const { data } = await supabase
      .from("match_campaigns")
      .select("id, club_id, title, status");
    const named = (data ?? []).filter((row) =>
      seasonNamesMatch(String(row.title ?? ""), clubName)
    );
    const open =
      named.find((row) => String(row.status ?? "").toLowerCase() === "open") ??
      named[0];
    if (isVoteUuid(open?.id)) return open.id;
  }

  return null;
}

async function campaignIdFromProjects(
  projectIds: string[],
  postedClubId?: string | null
): Promise<string | null> {
  const ids = [...new Set(projectIds.filter(Boolean))];
  if (ids.length === 0) return null;
  const { data } = await supabase
    .from("campaign_projects")
    .select("campaign_id")
    .in("climate_project_id", ids)
    .limit(20);
  const campaignIds = [
    ...new Set(
      (data ?? [])
        .map((row) => String(row.campaign_id ?? ""))
        .filter((id) => isVoteUuid(id))
    ),
  ];
  if (campaignIds.length === 0) return null;
  if (!isVoteUuid(postedClubId) || campaignIds.length === 1) {
    return campaignIds[0];
  }
  const owned = await supabase
    .from("match_campaigns")
    .select("id, club_id")
    .in("id", campaignIds);
  const match = (owned.data ?? []).find((row) => row.club_id === postedClubId);
  return match?.id ?? campaignIds[0];
}

async function openCampaignIdViaRpc(
  clubId: string | null | undefined
): Promise<string | null> {
  if (!isVoteUuid(clubId)) return null;
  const rpc = await supabase.rpc("open_match_day_campaign_for_club", {
    p_club_id: clubId,
  });
  const opened = rpc.data;
  return isVoteUuid(opened) ? opened : null;
}

async function ensureOpenCampaignIdForClub(
  clubId: string | null | undefined,
  clubName?: string | null
): Promise<string | null> {
  const existing = await resolveOpenCampaignId(clubId, clubName);
  if (existing) return existing;
  if (!isVoteUuid(clubId)) return null;

  const viaRpc = await openCampaignIdViaRpc(clubId);
  if (viaRpc) return viaRpc;

  const { data: club } = await supabase
    .from("clubs")
    .select("name")
    .eq("id", clubId)
    .maybeSingle();
  const title = matchDayCampaignTitle(clubName || club?.name || "Match Day");

  const fixtureId =
    (await findExistingFixtureId(clubId)) ??
    (await createVoteFixtureId(clubId));
  const attempts: Array<Record<string, unknown>> = [
    {
      club_id: clubId,
      title,
      status: "open",
      sponsorship_per_goal: OPENING_SPONSORSHIP,
      maximum_votes: 3,
      ...(fixtureId ? { match_id: fixtureId } : {}),
    },
    {
      club_id: clubId,
      title,
      status: "open",
      sponsorship_per_goal: OPENING_SPONSORSHIP,
      ...(fixtureId ? { match_id: fixtureId } : {}),
    },
    {
      club_id: clubId,
      title,
      status: "open",
      ...(fixtureId ? { match_id: fixtureId } : {}),
    },
    { club_id: clubId, title, status: "open" },
  ];
  for (const payload of attempts) {
    const inserted = await supabase
      .from("match_campaigns")
      .insert(payload)
      .select("id, club_id")
      .single();
    if (!inserted.error && inserted.data) {
      return ownedCampaignId(inserted.data, clubId);
    }
  }

  return resolveOpenCampaignId(clubId, clubName);
}

async function findExistingFixtureId(clubId: string): Promise<string | null> {
  const { data } = await supabase
    .from("fixtures")
    .select("id")
    .or(`home_club_id.eq.${clubId},away_club_id.eq.${clubId}`)
    .limit(1)
    .maybeSingle();
  return (data?.id as string | undefined) ?? null;
}

async function createVoteFixtureId(clubId: string): Promise<string | null> {
  const { data: other } = await supabase
    .from("clubs")
    .select("id")
    .neq("id", clubId)
    .limit(1)
    .maybeSingle();
  if (!other?.id) return null;
  const fixture = await supabase
    .from("fixtures")
    .insert({
      home_club_id: clubId,
      away_club_id: other.id,
      status: "scheduled",
      fixture_date: new Date().toISOString().slice(0, 10),
    })
    .select("id")
    .single();
  return fixture.data?.id ?? null;
}

function metadataFullName(user: {
  email?: string | null;
  user_metadata?: { full_name?: string; first_name?: string; last_name?: string };
}) {
  const meta = user.user_metadata;
  const combined = `${meta?.first_name ?? ""} ${meta?.last_name ?? ""}`.trim();
  return (
    meta?.full_name?.trim() ||
    combined ||
    undefined
  );
}

async function supporterWithResolvedName(
  row: Supporter,
  user: { email?: string | null; user_metadata?: { full_name?: string; first_name?: string; last_name?: string } }
): Promise<Supporter> {
  const fullName = resolvedFullName(
    row.full_name,
    row.email ?? user.email,
    metadataFullName(user)
  );
  if (!fullName || fullName === row.full_name) return row;
  await supabase.from("supporters").update({ full_name: fullName }).eq("id", row.id);
  return { ...row, full_name: fullName };
}

/**
 * Resolve the supporter row for the currently authenticated user, creating a
 * minimal one on first use. Registration only creates a `profiles` row, so a
 * fan may not yet have a `supporters` record when they first vote.
 */
export async function getOrCreateSupporter(): Promise<Supporter | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const kind = await identifySignedInKind();
  if (kind && !isFanFacingKind(kind)) return null;

  const byAuthId = await supabase
    .from("supporters")
    .select("id, full_name, email, auth_user_id, favourite_club_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (byAuthId.data) return supporterWithResolvedName(byAuthId.data, user);

  if (user.email) {
    const byEmail = await supabase
      .from("supporters")
      .select("id, full_name, email, auth_user_id, favourite_club_id")
      .eq("email", user.email)
      .maybeSingle();

    if (byEmail.data) {
      if (!byEmail.data.auth_user_id) {
        await supabase
          .from("supporters")
          .update({ auth_user_id: user.id })
          .eq("id", byEmail.data.id);
      }
      return supporterWithResolvedName(
        { ...byEmail.data, auth_user_id: user.id },
        user
      );
    }
  }

  const created = await supabase
    .from("supporters")
    .insert({
      full_name: metadataFullName(user) || "Supporter",
      email: user.email,
      auth_user_id: user.id,
      notification_enabled: true,
    })
    .select("id, full_name, email, auth_user_id, favourite_club_id")
    .single();

  if (created.error) throw created.error;

  return created.data;
}

/** Projects this supporter has voted for, plus those votes that have been funded. */
export async function getVotedAndFundedProjects(supporterId: string): Promise<{
  voted: ClimateProject[];
  funded: ClimateProject[];
}> {
  const voted = await getVotedProjects(supporterId);
  const fundedIds = await getFundedProjectIds(voted.map((project) => project.id));
  return {
    voted,
    funded: voted.filter((project) => fundedIds.has(project.id)),
  };
}

async function getFundedProjectIds(projectIds: string[]): Promise<Set<string>> {
  const funded = new Set<string>();
  if (projectIds.length === 0) return funded;

  const { data, error } = await supabase
    .from("campaign_projects")
    .select("climate_project_id")
    .eq("is_winner", true)
    .in("climate_project_id", projectIds);

  if (!error) {
    for (const row of data ?? []) {
      if (row.climate_project_id) funded.add(row.climate_project_id as string);
    }
  }

  return funded;
}

/** The set of project ids the supporter has already voted for. */
export async function getVotedProjectIds(
  supporterId: string
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("supporter_votes")
    .select("climate_project_id")
    .eq("supporter_id", supporterId);

  throwIfQueryError(error, "Could not load your previous votes.");

  return new Set((data ?? []).map((row) => row.climate_project_id as string));
}

/** Full project records the supporter has voted for (for the My S4P page). */
export async function getVotedProjects(
  supporterId: string
): Promise<ClimateProject[]> {
  const { data, error } = await supabase
    .from("supporter_votes")
    .select(`id, climate_projects (${PROJECT_FIELDS})`)
    .eq("supporter_id", supporterId);

  throwIfQueryError(error, "Could not load the Climate Projects you voted for.");

  return (data ?? [])
    .map((row) => (row as unknown as { climate_projects: ClimateProject }).climate_projects)
    .filter((project): project is ClimateProject => Boolean(project));
}

export type CampaignProject = ClimateProject & {
  votesReceived: number;
  minimumAmount: number;
  gbpPerVote: number;
  currentAmount: number;
  fansWhoVoted: number;
};

export type S4PCampaign = {
  clubId: string;
  clubName: string;
  matchTitle: string;
  sponsorName: string;
  sponsorLogoUrl: string | null;
  scoreLabel: string;
  requiredVotes: number;
  fixtureId: string | null;
  featuredProject: CampaignProject | null;
  projects: CampaignProject[];
  campaignId: string | null;
  postedClubId: string | null;
  minimumAmount: number;
  gbpPerVote: number;
  fansWhoVoted: number;
  projectedVotes: number;
  postedAt: string | null;
  visibleAt: string | null;
  isVisible: boolean;
};

const REQUIRED_VOTES = 3;

/**
 * Match climate campaigns for a fan: clubs they support that have posted
 * Match Day projects, with the sustainability director's sponsored list.
 */
export async function getMyS4PCampaigns(
  supporter: Supporter & { favourite_club_id?: string | null }
): Promise<S4PCampaign[]> {
  const teams = await getSupportedTeams(supporter);
  if (teams.length === 0) return [];

  const campaigns: S4PCampaign[] = [];
  const seenTeams = new Set<string>();

  const { data: open } = await supabase
    .from("match_campaigns")
    .select(
      "id, club_id, title, sponsorship_per_goal, maximum_votes, status, match_id, voting_opens"
    )
    .eq("status", "open");

  for (const row of open ?? []) {
    const matched = matchingSupportedTeams(row, teams);
    if (matched.length === 0) continue;
    const built = await buildCampaignFromMatchRow(row, teams);
    if (!built) continue;
    const unseen = matched.filter((team) => !seenTeams.has(team.id));
    if (unseen.length === 0) continue;
    for (const team of unseen) seenTeams.add(team.id);
    const primary = unseen[0];
    campaigns.push({
      ...built,
      clubId: primary.id,
      clubName: primary.displayName || built.clubName,
      postedClubId: built.postedClubId || built.clubId,
    });
  }

  for (const team of teams) {
    if (seenTeams.has(team.id)) continue;
    const fromPortfolio = await campaignFromClubPortfolio(team);
    if (!fromPortfolio) continue;
    seenTeams.add(team.id);
    campaigns.push(fromPortfolio);
  }

  return campaigns;
}

export async function getMyS4PCampaign(
  supporter: Supporter & { favourite_club_id?: string | null }
): Promise<S4PCampaign | null> {
  const campaigns = await getMyS4PCampaigns(supporter);
  return campaigns[0] ?? null;
}

function matchingSupportedTeams(
  row: { club_id: string | null; title: string | null },
  teams: TeamOption[]
): TeamOption[] {
  return teams.filter((team) =>
    fanTeamMatchesPostedClub(team, {
      clubId: row.club_id,
      title: row.title,
    })
  );
}

function titleIncludesTeam(title: string, team: TeamOption): boolean {
  return fanTeamMatchesPostedClub(team, { title });
}

async function resolveClubIdsForFanTeam(team: TeamOption): Promise<string[]> {
  const ids = new Set<string>();
  if (team.id && !team.id.startsWith("season:")) ids.add(team.id);

  const posted = postedMatchDayForFanTeam(team);
  if (posted?.clubId) ids.add(posted.clubId);

  for (const schedule of readAllFanPostSchedules()) {
    if (
      fanTeamMatchesPostedClub(team, {
        clubId: schedule.clubId,
        clubName: schedule.clubName,
      })
    ) {
      ids.add(schedule.clubId);
    }
  }

  const { data } = await supabase.from("clubs").select("id, name");
  for (const club of data ?? []) {
    const clubId = String(club.id);
    const clubName = String(club.name ?? "");
    if (
      fanTeamMatchesPostedClub(team, { clubId, clubName }) ||
      seasonNamesMatch(team.name, clubName) ||
      seasonNamesMatch(team.displayName, clubName)
    ) {
      ids.add(clubId);
    }
  }
  return [...ids];
}

async function campaignFromClubPortfolio(
  team: TeamOption
): Promise<S4PCampaign | null> {
  const posted = postedMatchDayForFanTeam(team);
  const clubIds = await resolveClubIdsForFanTeam(team);
  const dbClubIdsForQuery = clubIds.filter(isVoteUuid);
  if (clubIds.length === 0 && !posted) return null;

  const { data: portfolio } = dbClubIdsForQuery.length
    ? await supabase
        .from("club_match_portfolio")
        .select("*")
        .in("club_id", dbClubIdsForQuery)
    : { data: [] as Array<Record<string, unknown>> };

  const rows = (portfolio ?? []).filter((row) =>
    isPostedPortfolioStatus((row as { status?: unknown }).status)
  );

  const projectIds = [
    ...new Set(
      [
        ...rows.map((row) => portfolioProjectId(row as Record<string, unknown>)),
        ...(posted?.projectIds ?? []),
      ].filter(Boolean)
    ),
  ];
  if (projectIds.length === 0) return null;

  const { data: projectRows } = await supabase
    .from("climate_projects")
    .select(PROJECT_FIELDS)
    .in("id", projectIds);
  const byId = new Map(
    ((projectRows ?? []) as ClimateProject[]).map((project) => [
      project.id,
      project,
    ])
  );
  const projects = projectIds
    .map((id) => byId.get(id))
    .filter((project): project is ClimateProject => Boolean(project));
  if (projects.length === 0) return null;

  const postedClubId = String(
    rows[0]?.club_id ?? posted?.clubId ?? clubIds[0] ?? team.id
  );
  const dbClubIds = [...new Set([...clubIds, postedClubId].filter(isVoteUuid))];
  const { data: club } = isVoteUuid(postedClubId)
    ? await supabase
        .from("clubs")
        .select("id, name")
        .eq("id", postedClubId)
        .maybeSingle()
    : { data: null };

  const fixtureId =
    rows.map((row) => row.fixture_id as string | null).find(Boolean) ?? null;

  let matchTitle = club?.name ?? posted?.clubName ?? team.displayName;
  const { data: fixture } = fixtureId
    ? await supabase
        .from("fixtures")
        .select("home_club_id, away_club_id")
        .eq("id", fixtureId)
        .maybeSingle()
    : dbClubIds.length > 0
      ? await supabase
          .from("fixtures")
          .select("home_club_id, away_club_id")
          .or(
            dbClubIds
              .map((id) => `home_club_id.eq.${id},away_club_id.eq.${id}`)
              .join(",")
          )
          .limit(1)
          .maybeSingle()
      : { data: null };
  if (fixture) {
    const { data: names } = await supabase
      .from("clubs")
      .select("id, name")
      .in("id", [fixture.home_club_id, fixture.away_club_id]);
    const nameById = Object.fromEntries(
      (names ?? []).map((c) => [c.id, displayClubName(c.name as string)])
    );
    matchTitle = `${nameById[fixture.home_club_id] ?? matchTitle} vs ${
      nameById[fixture.away_club_id] ?? "Opponent"
    }`;
  }

  const { featuredProject, clubProjects } = await splitFeaturedProjects(projects);
  const campaignId =
    (isVoteUuid(posted?.campaignId) ? posted.campaignId : null) ??
    (await resolveOpenCampaignId(postedClubId, club?.name ?? team.name)) ??
    (await ensureOpenCampaignIdForClub(postedClubId, club?.name ?? team.name));
  const sponsor = await resolveCampaignSponsor({
    clubName: club?.name ?? posted?.clubName ?? team.name,
    matchTitle,
    sport: team.sport,
    postedSponsorNames: posted?.sponsorNames,
  });
  const voteCounts = await countProjectVotes(campaignId, [
    featuredProject?.id,
    ...clubProjects.map((project) => project.id),
  ]);
  const fansWhoVoted = await countFansWhoVoted(campaignId, [
    featuredProject?.id,
    ...clubProjects.map((project) => project.id),
  ]);
  const auction = auctionSettingsForClub(
    postedClubId ?? team.id,
    campaignId,
    undefined,
    fansWhoVoted
  );

  return {
    clubId: postedClubId,
    clubName: team.displayName || club?.name || team.name,
    matchTitle: formatMatchHeadline(matchTitle),
    sponsorName: sponsor.name,
    sponsorLogoUrl: sponsor.logoUrl,
    scoreLabel: sponsor.scoreLabel,
    requiredVotes: REQUIRED_VOTES,
    fixtureId,
    featuredProject: featuredProject
      ? withAuction(featuredProject, voteCounts.get(featuredProject.id) ?? 0, auction)
      : null,
    projects: clubProjects.map((project) =>
      withAuction(project, voteCounts.get(project.id) ?? 0, auction)
    ),
    campaignId,
    postedClubId,
    minimumAmount: auction.minimumAmount,
    gbpPerVote: auction.gbpPerVote,
    fansWhoVoted: auction.fansWhoVoted,
    projectedVotes: auction.projectedVotes,
    ...fanPostVisibility({
      clubId: postedClubId,
    }),
  };
}

async function buildCampaignFromMatchRow(
  openCampaign: {
    id: string;
    club_id: string;
    title: string | null;
    sponsorship_per_goal: number | string | null;
    maximum_votes: number | null;
    match_id?: string | null;
    voting_opens?: string | null;
  },
  teams: TeamOption[]
): Promise<S4PCampaign | null> {

  const { data: rows } = await supabase
    .from("campaign_projects")
    .select(`display_order, vote_count, climate_project_id, climate_projects (${PROJECT_FIELDS})`)
    .eq("campaign_id", openCampaign.id)
    .order("display_order");

  const projects = (rows ?? [])
    .map(
      (row) =>
        (row as unknown as { climate_projects: ClimateProject })
          .climate_projects
    )
    .filter((p): p is ClimateProject => Boolean(p));

  if (projects.length === 0) return null;

  const storedVotes = new Map<string, number>();
  for (const row of rows ?? []) {
    const id = row.climate_project_id as string | null;
    if (id) storedVotes.set(id, Number(row.vote_count) || 0);
  }

  const { data: club } = await supabase
    .from("clubs")
    .select("id, name")
    .eq("id", openCampaign.club_id)
    .maybeSingle();

  const { featuredProject, clubProjects } = await splitFeaturedProjects(projects);
  const fixtureTitle = await matchTitleFromFixture(openCampaign.match_id);
  const matchTitle = formatMatchHeadline(
    fixtureTitle ?? openCampaign.title ?? club?.name ?? "Match"
  );
  const fanTeam =
    teams.find((team) => team.id === openCampaign.club_id) ??
    teams.find((team) => titleIncludesTeam(matchTitle.toLowerCase(), team));
  const sponsor = await resolveCampaignSponsor({
    clubName: fanTeam?.name ?? club?.name ?? "Your club",
    matchTitle,
    sport: fanTeam?.sport ?? "Football",
  });
  const counted = await countProjectVotes(openCampaign.id, [
    featuredProject?.id,
    ...clubProjects.map((project) => project.id),
  ]);
  const votesFor = (projectId: string) =>
    Math.max(counted.get(projectId) ?? 0, storedVotes.get(projectId) ?? 0);
  const fansWhoVoted = await countFansWhoVoted(openCampaign.id, [
    featuredProject?.id,
    ...clubProjects.map((project) => project.id),
  ]);
  const auction = auctionSettingsForClub(
    openCampaign.club_id,
    openCampaign.id,
    Number(openCampaign.sponsorship_per_goal),
    fansWhoVoted
  );

  return {
    clubId: openCampaign.club_id,
    clubName: fanTeam?.displayName ?? club?.name ?? "Your club",
    matchTitle,
    sponsorName: sponsor.name,
    sponsorLogoUrl: sponsor.logoUrl,
    scoreLabel: sponsor.scoreLabel,
    requiredVotes: REQUIRED_VOTES,
    fixtureId: openCampaign.match_id ?? null,
    featuredProject: featuredProject
      ? withAuction(featuredProject, votesFor(featuredProject.id), auction)
      : null,
    projects: clubProjects.map((project) =>
      withAuction(project, votesFor(project.id), auction)
    ),
    campaignId: openCampaign.id,
    postedClubId: openCampaign.club_id,
    minimumAmount: auction.minimumAmount,
    gbpPerVote: auction.gbpPerVote,
    fansWhoVoted: auction.fansWhoVoted,
    projectedVotes: auction.projectedVotes,
    ...fanPostVisibility({
      clubId: openCampaign.club_id,
      votingOpens: openCampaign.voting_opens,
    }),
  };
}

type AuctionSettings = {
  minimumAmount: number;
  gbpPerVote: number;
  projectedVotes: number;
  fansWhoVoted: number;
};

function withAuction(
  project: ClimateProject,
  votesReceived: number,
  auction: AuctionSettings
): CampaignProject {
  return {
    ...project,
    votesReceived,
    minimumAmount: auction.minimumAmount,
    gbpPerVote: auction.gbpPerVote,
    fansWhoVoted: auction.fansWhoVoted,
    currentAmount: currentSponsorshipAmount({
      votesReceived: auction.fansWhoVoted,
      gbpPerVote: auction.gbpPerVote,
      minimumAmount: auction.minimumAmount,
    }),
  };
}

function auctionSettingsForClub(
  clubId: string | null | undefined,
  campaignId: string | null | undefined,
  sponsorshipPerGoal?: number,
  fansWhoVoted = 0
): AuctionSettings {
  const stored = readAuctionStore(campaignId, clubId);
  const projectedVotes =
    Number(stored?.projectedVotes) > 0
      ? Number(stored?.projectedVotes)
      : DEFAULT_PROJECTED_VOTES;
  const gbpPerVote =
    Number(stored?.gbpPerVote) > 0
      ? Number(stored.gbpPerVote)
      : DEFAULT_GBP_PER_VOTE;
  const storedMin = Number(stored?.minAmount);
  const campaignMin = Number(sponsorshipPerGoal);
  const minimumAmount =
    (storedMin > 0 ? storedMin : 0) ||
    (campaignMin > 0 ? campaignMin : 0) ||
    DEFAULT_MINIMUM_SPONSORSHIP;
  return {
    minimumAmount,
    gbpPerVote,
    projectedVotes,
    fansWhoVoted: Math.max(0, fansWhoVoted),
  };
}

function readAuctionStore(
  campaignId: string | null | undefined,
  clubId: string | null | undefined
): {
  projectedVotes?: number;
  expectedSponsorship?: number;
  gbpPerVote?: number;
  minAmount?: number;
} | null {
  if (typeof window === "undefined") return null;
  try {
    if (campaignId) {
      const raw = window.localStorage.getItem(
        `s4p.campaign.auction.${campaignId}`
      );
      if (raw) return JSON.parse(raw);
    }
    if (clubId) {
      const raw = window.localStorage.getItem(`s4p.sd.matchDay.${clubId}`);
      if (raw) return JSON.parse(raw);
    }
  } catch {
    return null;
  }
  return null;
}

async function countFansWhoVoted(
  campaignId: string | null,
  projectIds: (string | null | undefined)[]
): Promise<number> {
  const ids = projectIds.filter((id): id is string => Boolean(id));
  if (ids.length === 0) return 0;

  let query = supabase
    .from("supporter_votes")
    .select("supporter_id")
    .in("climate_project_id", ids);
  if (campaignId) query = query.eq("campaign_id", campaignId);
  const { data } = await query;
  return new Set((data ?? []).map((row) => String(row.supporter_id))).size;
}

async function countProjectVotes(
  campaignId: string | null,
  projectIds: (string | null | undefined)[]
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  const ids = projectIds.filter((id): id is string => Boolean(id));
  if (ids.length === 0) return counts;

  let query = supabase
    .from("supporter_votes")
    .select("climate_project_id")
    .in("climate_project_id", ids);
  if (campaignId) query = query.eq("campaign_id", campaignId);
  const { data } = await query;

  for (const row of data ?? []) {
    const id = row.climate_project_id as string;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return counts;
}

async function matchTitleFromFixture(
  fixtureId: string | null | undefined
): Promise<string | null> {
  if (!fixtureId) return null;
  const { data: fixture } = await supabase
    .from("fixtures")
    .select("home_club_id, away_club_id")
    .eq("id", fixtureId)
    .maybeSingle();
  if (!fixture) return null;
  const { data: names } = await supabase
    .from("clubs")
    .select("id, name")
    .in("id", [fixture.home_club_id, fixture.away_club_id]);
  const nameById = Object.fromEntries(
    (names ?? []).map((row) => [row.id, displayClubName(row.name as string)])
  );
  const home = nameById[fixture.home_club_id as string];
  const away = nameById[fixture.away_club_id as string];
  if (!home || !away) return null;
  return `${home} v ${away}`;
}

async function resolveCampaignSponsor({
  clubName,
  matchTitle,
  sport,
  postedSponsorNames,
}: {
  clubName: string;
  matchTitle: string;
  sport: string;
  postedSponsorNames?: string[] | null;
}): Promise<{
  name: string;
  logoUrl: string | null;
  scoreLabel: string;
}> {
  const scoreLabel = scoreLabelForSport(sport);
  const postedName = (postedSponsorNames ?? [])
    .map((name) => name.trim())
    .find(Boolean);
  try {
    const { signedOrPostedBrandForClub } = await import(
      "./sponsor-offers.service"
    );
    const signed = await signedOrPostedBrandForClub(clubName);
    if (signed) {
      return {
        name: signed,
        logoUrl: sponsorLogoSrc(signed, null),
        scoreLabel,
      };
    }
  } catch {
    // Fall through to the posted Match Day brand, then the campaign table.
  }
  if (postedName) {
    return {
      name: postedName,
      logoUrl: sponsorLogoSrc(postedName, null),
      scoreLabel,
    };
  }
  try {
    const { selectedBrandNamesForClubName } = await import(
      "./climate-sponsors.service"
    );
    const fromRoster = selectedBrandNamesForClubName(clubName)[0];
    if (fromRoster) {
      return {
        name: fromRoster,
        logoUrl: sponsorLogoSrc(fromRoster, null),
        scoreLabel,
      };
    }
  } catch {
    // Fall through to the campaign table.
  }
  const fixtureNeedle = matchTitle.replace(/ Climate Campaign$/i, "").trim();

  const { data: rows } = await supabase
    .from("sponsorship_campaigns")
    .select("amount_per_goal, sponsor_id, fixture, sponsored_event, sport")
    .eq("status", "Active");

  const matching = (rows ?? []).filter((row) => {
    const fixture = (row.fixture ?? "").toLowerCase();
    const event = (row.sponsored_event ?? "").toLowerCase();
    const club = clubName.toLowerCase();
    const needle = fixtureNeedle.toLowerCase();
    return (
      fixture.includes(club) ||
      event.includes(club) ||
      (needle.length > 3 && fixture.includes(needle))
    );
  });

  const preferred =
    matching.find(
      (row) =>
        (row.sponsored_event ?? "").toLowerCase().includes(clubName.toLowerCase()) &&
        row.sponsor_id
    ) ??
    matching.find((row) => row.sponsor_id) ??
    matching[0];

  if (preferred?.sponsor_id) {
    const { data: sponsor } = await supabase
      .from("sponsors")
      .select("name, logo_url")
      .eq("id", preferred.sponsor_id)
      .maybeSingle();
    if (sponsor?.name) {
      return {
        name: sponsor.name,
        logoUrl: sponsorLogoSrc(sponsor.name, sponsor.logo_url),
        scoreLabel,
      };
    }
  }

  return { name: "Goal Sponsor", logoUrl: null, scoreLabel };
}

/**
 * Persist a fan's campaign vote: replaces any prior votes among the campaign's
 * projects with the newly selected set, and marks those projects on the club's
 * Match Day portfolio so the Sustainability Director can see them.
 */
export async function submitCampaignVotes(
  supporterId: string,
  selectedProjectIds: string[],
  campaignProjectIds: string[],
  campaignId?: string | null,
  postedClubId?: string | null
) {
  if (campaignProjectIds.length > 0) {
    const { error: delError } = await supabase
      .from("supporter_votes")
      .delete()
      .eq("supporter_id", supporterId)
      .in("climate_project_id", campaignProjectIds);
    if (delError && delError.code !== "PGRST116") {
      throwIfQueryError(delError, "Could not clear your previous votes.");
    }
  }

  let resolvedCampaignId: string | null = isVoteUuid(campaignId)
    ? campaignId
    : null;
  if (resolvedCampaignId && isVoteUuid(postedClubId)) {
    const owned = await supabase
      .from("match_campaigns")
      .select("id, club_id")
      .eq("id", resolvedCampaignId)
      .maybeSingle();
    resolvedCampaignId = retainVoteCampaignId(
      resolvedCampaignId,
      owned.data,
      postedClubId
    );
  }
  if (!resolvedCampaignId) {
    resolvedCampaignId = storedCampaignIdForClub(postedClubId);
  }
  if (!resolvedCampaignId) {
    resolvedCampaignId = await campaignIdFromProjects(
      [...selectedProjectIds, ...campaignProjectIds],
      postedClubId
    );
  }
  if (!resolvedCampaignId) {
    resolvedCampaignId = await ensureOpenCampaignIdForClub(postedClubId);
  }

  const rows = voteRowsForInsert(
    supporterId,
    selectedProjectIds,
    resolvedCampaignId
  );

  let { error } = await supabase.from("supporter_votes").insert(rows);
  if (isCampaignIdNotNullError(error) && !resolvedCampaignId) {
    resolvedCampaignId =
      (await openCampaignIdViaRpc(postedClubId)) ??
      (await ensureOpenCampaignIdForClub(postedClubId));
    if (resolvedCampaignId) {
      const retried = await supabase
        .from("supporter_votes")
        .insert(
          voteRowsForInsert(supporterId, selectedProjectIds, resolvedCampaignId)
        );
      error = retried.error;
    }
  }
  if (isCampaignIdNotNullError(error)) {
    throwIfQueryError(
      { message: MISSING_CAMPAIGN_VOTE_MESSAGE, code: "23502" },
      MISSING_CAMPAIGN_VOTE_MESSAGE
    );
  }
  if (error && error.code !== "23505") {
    throwIfQueryError(error, "Could not save your vote.");
  }

  try {
    await markPortfolioProjectsVoted(postedClubId, selectedProjectIds);
  } catch {
    // The vote is already stored; the club board can pick it up on refresh.
  }

  if (resolvedCampaignId) {
    try {
      await attachCampaignProjects(resolvedCampaignId, campaignProjectIds);
      await refreshCampaignVoteCounts(resolvedCampaignId, campaignProjectIds);
    } catch {
      // Vote rows remain even if campaign totals cannot be updated.
    }
  }
}

async function attachCampaignProjects(
  campaignId: string,
  projectIds: string[]
) {
  const ids = [...new Set(projectIds.filter(Boolean))];
  if (!isVoteUuid(campaignId) || ids.length === 0) return;
  const existing = await supabase
    .from("campaign_projects")
    .select("id")
    .eq("campaign_id", campaignId)
    .limit(1);
  if (existing.data?.length) return;
  await supabase.from("campaign_projects").insert(
    ids.map((projectId, index) => ({
      campaign_id: campaignId,
      climate_project_id: projectId,
      display_order: index + 1,
      vote_count: 0,
      is_winner: false,
    }))
  );
}

export async function markPortfolioProjectsVoted(
  clubId: string | null | undefined,
  projectIds: string[]
) {
  const ids = [...new Set(projectIds.filter(Boolean))];
  if (!isVoteUuid(clubId) || ids.length === 0) return;

  try {
    await supabase
      .from("club_match_portfolio")
      .update({ status: MATCH_DAY_PORTFOLIO_VOTED })
      .eq("club_id", clubId)
      .in("project_id", ids);
  } catch {
    return;
  }
  try {
    await supabase
      .from("club_match_portfolio")
      .update({ status: MATCH_DAY_PORTFOLIO_VOTED })
      .eq("club_id", clubId)
      .in("climate_project_id", ids);
  } catch {
    // Hosted schema uses project_id only.
  }
}

async function refreshCampaignVoteCounts(
  campaignId: string,
  projectIds: string[]
) {
  const counted = await countProjectVotes(campaignId, projectIds);
  for (const projectId of projectIds) {
    await supabase
      .from("campaign_projects")
      .update({ vote_count: counted.get(projectId) ?? 0 })
      .eq("campaign_id", campaignId)
      .eq("climate_project_id", projectId);
  }
}

export async function castVote(supporterId: string, projectId: string) {
  const { error } = await supabase
    .from("supporter_votes")
    .insert({ supporter_id: supporterId, climate_project_id: projectId });

  // 23505 = unique_violation: the supporter already voted for this project.
  if (error && error.code !== "23505") throw error;
}

export async function removeVote(supporterId: string, projectId: string) {
  const { error } = await supabase
    .from("supporter_votes")
    .delete()
    .eq("supporter_id", supporterId)
    .eq("climate_project_id", projectId);

  if (error) throw error;
}
