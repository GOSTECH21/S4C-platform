import { supabase } from "../lib/supabase";
import {
  getSupportedTeams,
  scoreLabelForSport,
  sponsorLogoSrc,
  type TeamOption,
} from "./teams.service";

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
  clubId: string | null
): Promise<string | null> {
  if (clubId) {
    const forClub = await supabase
      .from("match_campaigns")
      .select("id")
      .eq("status", "open")
      .eq("club_id", clubId)
      .maybeSingle();
    if (forClub.data?.id) return forClub.data.id as string;
  }

  const anyOpen = await supabase
    .from("match_campaigns")
    .select("id")
    .eq("status", "open")
    .limit(1)
    .maybeSingle();

  return (anyOpen.data?.id as string | undefined) ?? null;
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

  const byAuthId = await supabase
    .from("supporters")
    .select("id, full_name, email, auth_user_id, favourite_club_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (byAuthId.data) return byAuthId.data;

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
      return { ...byEmail.data, auth_user_id: user.id };
    }
  }

  const created = await supabase
    .from("supporters")
    .insert({
      full_name: user.email?.split("@")[0] ?? "Supporter",
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

  if (error) throw error;

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

  if (error) throw error;

  return (data ?? [])
    .map((row) => (row as unknown as { climate_projects: ClimateProject }).climate_projects)
    .filter((project): project is ClimateProject => Boolean(project));
}

export type S4PCampaign = {
  clubId: string;
  clubName: string;
  matchTitle: string;
  sponsorName: string;
  sponsorLogoUrl: string | null;
  amountPerGoal: number;
  scoreLabel: string;
  requiredVotes: number;
  fixtureId: string | null;
  featuredProject: ClimateProject | null;
  projects: ClimateProject[];
  campaignId: string | null;
};

const DEFAULT_SPONSOR = "Budweiser";
const DEFAULT_AMOUNT_PER_GOAL = 10000;
const REQUIRED_VOTES = 3;

/**
 * Match climate campaigns for a fan: only matches involving teams they
 * support, with the sustainability director's sponsored projects.
 */
export async function getMyS4PCampaigns(
  supporter: Supporter & { favourite_club_id?: string | null }
): Promise<S4PCampaign[]> {
  const teams = await getSupportedTeams(supporter);
  if (teams.length === 0) return [];

  const clubIds = new Set(teams.map((team) => team.id));
  const campaigns: S4PCampaign[] = [];
  const seen = new Set<string>();

  const { data: open } = await supabase
    .from("match_campaigns")
    .select(
      "id, club_id, title, sponsorship_per_goal, maximum_votes, status, match_id"
    )
    .eq("status", "open");

  for (const row of open ?? []) {
    if (!campaignMatchesSupportedTeams(row, clubIds, teams)) continue;
    const built = await buildCampaignFromMatchRow(row, teams);
    const key = built?.campaignId ?? built?.clubId;
    if (built && key && !seen.has(key)) {
      seen.add(key);
      campaigns.push(built);
    }
  }

  return campaigns;
}

export async function getMyS4PCampaign(
  supporter: Supporter & { favourite_club_id?: string | null }
): Promise<S4PCampaign | null> {
  const campaigns = await getMyS4PCampaigns(supporter);
  return campaigns[0] ?? null;
}

function campaignMatchesSupportedTeams(
  row: { club_id: string; title: string | null },
  clubIds: Set<string>,
  teams: TeamOption[]
): boolean {
  if (clubIds.has(row.club_id)) return true;
  const title = (row.title ?? "").toLowerCase();
  return teams.some((team) => titleIncludesTeam(title, team));
}

function titleIncludesTeam(title: string, team: TeamOption): boolean {
  const names = [team.name, team.displayName].map((name) =>
    name.toLowerCase()
  );
  return names.some((name) => name.length > 2 && title.includes(name.toLowerCase()));
}

async function campaignFromClubPortfolio(
  team: TeamOption
): Promise<S4PCampaign | null> {
  const clubId = team.id;
  const { data: club } = await supabase
    .from("clubs")
    .select("id, name")
    .eq("id", clubId)
    .maybeSingle();
  if (!club) return null;

  const { data: portfolio } = await supabase
    .from("club_match_portfolio")
    .select(`fixture_id, climate_projects (${PROJECT_FIELDS})`)
    .eq("club_id", clubId);

  const projects = (portfolio ?? [])
    .map(
      (row) =>
        (row as unknown as { climate_projects: ClimateProject })
          .climate_projects
    )
    .filter((p): p is ClimateProject => Boolean(p));

  if (projects.length === 0) return null;

  const fixtureId =
    (portfolio ?? []).map((row) => row.fixture_id).find(Boolean) ?? null;

  // Match title from the linked (or any) fixture involving this club.
  let matchTitle = `${club.name} Climate Campaign`;
  const fixtureQuery = fixtureId
    ? supabase
        .from("fixtures")
        .select("home_club_id, away_club_id")
        .eq("id", fixtureId)
        .maybeSingle()
    : supabase
        .from("fixtures")
        .select("home_club_id, away_club_id")
        .or(`home_club_id.eq.${clubId},away_club_id.eq.${clubId}`)
        .limit(1)
        .maybeSingle();
  const { data: fixture } = await fixtureQuery;
  if (fixture) {
    const { data: names } = await supabase
      .from("clubs")
      .select("id, name")
      .in("id", [fixture.home_club_id, fixture.away_club_id]);
    const nameById = Object.fromEntries(
      (names ?? []).map((c) => [c.id, c.name])
    );
    matchTitle = `${nameById[fixture.home_club_id] ?? club.name} vs ${
      nameById[fixture.away_club_id] ?? "Opponent"
    }`;
  }

  const { featuredProject, clubProjects } = await splitFeaturedProjects(projects);
  const campaignId = await resolveOpenCampaignId(clubId);
  const sponsor = await resolveCampaignSponsor({
    clubName: club.name,
    matchTitle,
    amountPerGoal: DEFAULT_AMOUNT_PER_GOAL,
    sport: team.sport,
  });

  return {
    clubId: club.id,
    clubName: team.displayName || club.name,
    matchTitle,
    sponsorName: sponsor.name,
    sponsorLogoUrl: sponsor.logoUrl,
    amountPerGoal: sponsor.amountPerGoal,
    scoreLabel: sponsor.scoreLabel,
    requiredVotes: REQUIRED_VOTES,
    fixtureId,
    featuredProject,
    projects: clubProjects,
    campaignId,
  };
}

async function buildCampaignFromMatchRow(
  openCampaign: {
    id: string;
    club_id: string;
    title: string | null;
    sponsorship_per_goal: number | string | null;
    maximum_votes: number | null;
  },
  teams: TeamOption[]
): Promise<S4PCampaign | null> {

  const { data: rows } = await supabase
    .from("campaign_projects")
    .select(`display_order, climate_projects (${PROJECT_FIELDS})`)
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

  const { data: club } = await supabase
    .from("clubs")
    .select("id, name")
    .eq("id", openCampaign.club_id)
    .maybeSingle();

  const { featuredProject, clubProjects } = await splitFeaturedProjects(projects);
  const matchTitle =
    openCampaign.title?.replace(/ Climate Campaign$/i, "") ??
    club?.name ??
    "Match";
  const fanTeam =
    teams.find((team) => team.id === openCampaign.club_id) ??
    teams.find((team) => titleIncludesTeam(matchTitle.toLowerCase(), team));
  const amountPerGoal =
    Number(openCampaign.sponsorship_per_goal) || DEFAULT_AMOUNT_PER_GOAL;
  const sponsor = await resolveCampaignSponsor({
    clubName: fanTeam?.name ?? club?.name ?? "Your club",
    matchTitle,
    amountPerGoal,
    sport: fanTeam?.sport ?? "Football",
  });

  return {
    clubId: openCampaign.club_id,
    clubName: fanTeam?.displayName ?? club?.name ?? "Your club",
    matchTitle,
    sponsorName: sponsor.name,
    sponsorLogoUrl: sponsor.logoUrl,
    amountPerGoal: sponsor.amountPerGoal,
    scoreLabel: sponsor.scoreLabel,
    requiredVotes: openCampaign.maximum_votes ?? REQUIRED_VOTES,
    fixtureId: null,
    featuredProject,
    projects: clubProjects,
    campaignId: openCampaign.id,
  };
}

async function resolveCampaignSponsor({
  clubName,
  matchTitle,
  amountPerGoal,
  sport,
}: {
  clubName: string;
  matchTitle: string;
  amountPerGoal: number;
  sport: string;
}): Promise<{
  name: string;
  logoUrl: string | null;
  amountPerGoal: number;
  scoreLabel: string;
}> {
  const scoreLabel = scoreLabelForSport(sport);
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

  let name = DEFAULT_SPONSOR;
  let logoUrl = sponsorLogoSrc(DEFAULT_SPONSOR, null);
  let amount = amountPerGoal;

  if (preferred) {
    if (preferred.sponsor_id) {
      const { data: sponsor } = await supabase
        .from("sponsors")
        .select("name, logo_url")
        .eq("id", preferred.sponsor_id)
        .maybeSingle();
      if (sponsor?.name) {
        name = sponsor.name;
        logoUrl = sponsorLogoSrc(sponsor.name, sponsor.logo_url);
      }
    }
  }

  return { name, logoUrl, amountPerGoal: amount, scoreLabel };
}

/**
 * Persist a fan's campaign vote: replaces any prior votes among the campaign's
 * projects with the newly selected set.
 */
export async function submitCampaignVotes(
  supporterId: string,
  selectedProjectIds: string[],
  campaignProjectIds: string[],
  campaignId?: string | null
) {
  if (campaignProjectIds.length > 0) {
    const { error: delError } = await supabase
      .from("supporter_votes")
      .delete()
      .eq("supporter_id", supporterId)
      .in("climate_project_id", campaignProjectIds);
    if (delError) throw delError;
  }

  const resolvedCampaignId =
    campaignId ?? (await resolveOpenCampaignId(null));

  const rows = selectedProjectIds.map((projectId) => ({
    supporter_id: supporterId,
    climate_project_id: projectId,
    ...(resolvedCampaignId ? { campaign_id: resolvedCampaignId } : {}),
  }));

  const { error } = await supabase.from("supporter_votes").insert(rows);
  if (error) throw error;
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
