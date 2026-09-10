import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

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
};

export type Supporter = {
  id: string;
  full_name: string | null;
  email: string | null;
  auth_user_id: string | null;
  favourite_club_id?: string | null;
};

const PROJECT_FIELDS =
  "id, name, description, category, country, estimated_co2, funding_goal, image_url, status";

/**
 * Wait until Supabase has restored the session from storage. `getUser()` can
 * return null immediately after a client-side login navigation, which previously
 * bounced fans back to /fan/login (or left My S4P spinning on "Loading...").
 */
export async function waitForAuthUser(
  timeoutMs = 4000
): Promise<User | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.user) return session.user;

  return new Promise((resolve) => {
    let settled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (settled) return;
      if (nextSession?.user) {
        settled = true;
        if (timer) clearTimeout(timer);
        data.subscription.unsubscribe();
        resolve(nextSession.user);
      } else if (event === "INITIAL_SESSION") {
        settled = true;
        if (timer) clearTimeout(timer);
        data.subscription.unsubscribe();
        resolve(null);
      }
    });

    timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      data.subscription.unsubscribe();
      resolve(null);
    }, timeoutMs);
  });
}

/**
 * Resolve the supporter row for the currently authenticated user, creating a
 * minimal one on first use. Registration only creates a `profiles` row, so a
 * fan may not yet have a `supporters` record when they first vote.
 */
export async function getOrCreateSupporter(): Promise<Supporter | null> {
  const user = await waitForAuthUser();

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

/** All active climate projects supporters can vote for. */
export async function getClimateProjectsForVoting(): Promise<ClimateProject[]> {
  const { data, error } = await supabase
    .from("climate_projects")
    .select(PROJECT_FIELDS)
    .eq("status", "active")
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data ?? []) as ClimateProject[];
}

/** The set of project ids the supporter has already voted for. */
export async function getVotedProjectIds(
  supporterId: string
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("supporter_votes")
    .select("climate_project_id")
    .eq("supporter_id", supporterId);

  // Missing table / RLS should not block the campaign page from rendering.
  if (error) {
    console.warn("Could not load existing votes:", error.message);
    return new Set();
  }

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
  amountPerGoal: number;
  requiredVotes: number;
  fixtureId: string | null;
  projects: ClimateProject[];
};

const DEFAULT_SPONSOR = "Budweiser";
const DEFAULT_AMOUNT_PER_GOAL = 10000;
const REQUIRED_VOTES = 3;

/**
 * The match climate campaign shown on a fan's My S4P page: the projects the
 * club's sustainability director selected for the match, plus the sponsor
 * commitment. Resilient to sparse data via sensible fallbacks.
 */
export async function getMyS4PCampaign(
  supporter: Supporter & { favourite_club_id?: string | null }
): Promise<S4PCampaign | null> {
  const clubId = supporter.favourite_club_id;
  if (!clubId) return null;

  const { data: club } = await supabase
    .from("clubs")
    .select("id, name")
    .eq("id", clubId)
    .maybeSingle();
  if (!club) return null;

  // Director-selected projects (the club's match portfolio).
  const { data: portfolio, error: portfolioError } = await supabase
    .from("club_match_portfolio")
    .select(`fixture_id, climate_projects (${PROJECT_FIELDS})`)
    .eq("club_id", clubId);

  if (portfolioError) {
    console.warn("Match portfolio query failed:", portfolioError.message);
  }

  const projects = (portfolio ?? [])
    .map(
      (row) =>
        (row as unknown as { climate_projects: ClimateProject | ClimateProject[] })
          .climate_projects
    )
    .flatMap((p) => (Array.isArray(p) ? p : p ? [p] : []))
    .filter((p): p is ClimateProject => Boolean(p));

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

  // Sponsor commitment from an active campaign referencing this club.
  let sponsorName = DEFAULT_SPONSOR;
  let amountPerGoal = DEFAULT_AMOUNT_PER_GOAL;
  const { data: camp } = await supabase
    .from("sponsorship_campaigns")
    .select("amount_per_goal, sponsor_id")
    .eq("status", "Active")
    .ilike("fixture", `%${club.name}%`)
    .limit(1)
    .maybeSingle();
  if (camp) {
    amountPerGoal = camp.amount_per_goal ?? amountPerGoal;
    if (camp.sponsor_id) {
      const { data: sponsor } = await supabase
        .from("sponsors")
        .select("name")
        .eq("id", camp.sponsor_id)
        .maybeSingle();
      if (sponsor?.name) sponsorName = sponsor.name;
    }
  }

  return {
    clubId: club.id,
    clubName: club.name,
    matchTitle,
    sponsorName,
    amountPerGoal,
    requiredVotes: REQUIRED_VOTES,
    fixtureId,
    projects: projects.slice(0, 5),
  };
}

/**
 * Persist a fan's campaign vote: replaces any prior votes among the campaign's
 * projects with the newly selected set.
 */
export async function submitCampaignVotes(
  supporterId: string,
  selectedProjectIds: string[],
  campaignProjectIds: string[]
) {
  if (campaignProjectIds.length > 0) {
    const { error: delError } = await supabase
      .from("supporter_votes")
      .delete()
      .eq("supporter_id", supporterId)
      .in("climate_project_id", campaignProjectIds);
    if (delError) throw delError;
  }

  const rows = selectedProjectIds.map((projectId) => ({
    supporter_id: supporterId,
    climate_project_id: projectId,
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
