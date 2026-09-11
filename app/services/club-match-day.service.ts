import { supabase } from "../lib/supabase";
import {
  MATCH_DAY_PROJECT_COUNT,
  MATCH_DAY_LEAD_HOURS,
} from "../lib/partner-projects";
import { OPENING_SPONSORSHIP } from "../lib/sponsorship-auction";
import { seasonNamesMatch } from "../lib/current-season";
import type { ClimateProject } from "./votes.service";

const PROJECT_FIELDS =
  "id, name, description, category, country, estimated_co2, funding_goal, image_url, status, featured";

export type ClubAccount = {
  id: string;
  club_id: string;
  first_name: string | null;
  last_name: string | null;
  job_title: string | null;
  email: string | null;
  phone: string | null;
  status: string | null;
  supporter_base: string | null;
  average_attendance: string | number | null;
};

export type ClubProfile = {
  id: string;
  name: string;
  country: string | null;
};

export type MatchDaySelection = {
  projectIds: string[];
  minAmount: number;
  savedAt: string;
  campaignId: string | null;
};

const MATCH_DAY_STORAGE_PREFIX = "s4p.sd.matchDay.";

export async function loadPartnerClimateProjects(): Promise<ClimateProject[]> {
  const { data, error } = await supabase
    .from("climate_projects")
    .select(PROJECT_FIELDS)
    .is("club_id", null)
    .order("name");

  if (error) throw error;

  return ((data ?? []) as ClimateProject[])
    .filter((project) => (project.status ?? "active") !== "archived")
    .slice(0, 20);
}

export async function loadClubSession(): Promise<{
  account: ClubAccount;
  club: ClubProfile;
} | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: account, error: accountError } = await supabase
    .from("club_accounts")
    .select(
      "id, club_id, first_name, last_name, job_title, email, phone, status, supporter_base, average_attendance"
    )
    .eq("auth_user_id", user.id)
    .single();

  if (accountError || !account) return null;

  const { data: club, error: clubError } = await supabase
    .from("clubs")
    .select("id, name, country")
    .eq("id", account.club_id)
    .single();

  if (clubError || !club) return null;

  return {
    account: account as ClubAccount,
    club: club as ClubProfile,
  };
}

function campaignBelongsToClub(
  row: { club_id?: string | null; title?: string | null },
  clubId: string,
  clubName: string
): boolean {
  if (row.club_id === clubId) return true;
  const title = row.title ?? "";
  const shortName = clubName.replace(/\s+fc$/i, "").trim();
  if (shortName.length >= 4 && title.toLowerCase().includes(shortName.toLowerCase())) {
    return true;
  }
  return seasonNamesMatch(clubName, title.replace(/climate campaign/i, ""));
}

export async function findOpenClubCampaign(
  clubId: string,
  clubName: string
): Promise<{ id: string; title: string | null; sponsorship_per_goal: number | null } | null> {
  const forClub = await supabase
    .from("match_campaigns")
    .select("id, title, sponsorship_per_goal, club_id")
    .eq("status", "open")
    .eq("club_id", clubId)
    .maybeSingle();

  if (forClub.data) return forClub.data;

  const { data: open } = await supabase
    .from("match_campaigns")
    .select("id, title, sponsorship_per_goal, club_id")
    .eq("status", "open");

  const match = (open ?? []).find((row) =>
    campaignBelongsToClub(row, clubId, clubName)
  );
  return match ?? null;
}

export async function loadCampaignProjectLists(campaignId: string | null): Promise<{
  selected: ClimateProject[];
  voted: ClimateProject[];
  funded: ClimateProject[];
}> {
  const empty = { selected: [], voted: [], funded: [] };
  if (!campaignId) return empty;

  const { data, error } = await supabase
    .from("campaign_projects")
    .select(
      `vote_count, is_winner, display_order, climate_project_id, climate_projects (${PROJECT_FIELDS})`
    )
    .eq("campaign_id", campaignId)
    .order("display_order");

  if (error) return empty;

  const rows = (data ?? []).map((row) => {
    const project = (
      row as unknown as { climate_projects: ClimateProject | null }
    ).climate_projects;
    return {
      project,
      votes: Number(row.vote_count) || 0,
      funded: Boolean(row.is_winner),
    };
  });

  const selected = rows
    .map((row) => row.project)
    .filter((project): project is ClimateProject => Boolean(project));
  const voted = rows
    .filter((row) => row.votes > 0 && row.project && !row.funded)
    .map((row) => row.project) as ClimateProject[];
  const funded = rows
    .filter((row) => row.funded && row.project)
    .map((row) => row.project) as ClimateProject[];

  return { selected, voted, funded };
}

export function readStoredMatchDay(clubId: string): MatchDaySelection | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(MATCH_DAY_STORAGE_PREFIX + clubId);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MatchDaySelection;
    if (!Array.isArray(parsed.projectIds)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStoredMatchDay(clubId: string, selection: MatchDaySelection) {
  window.localStorage.setItem(
    MATCH_DAY_STORAGE_PREFIX + clubId,
    JSON.stringify(selection)
  );
}

export async function saveMatchDaySelection({
  clubId,
  clubName,
  projectIds,
  minAmount,
}: {
  clubId: string;
  clubName: string;
  projectIds: string[];
  minAmount: number;
}): Promise<MatchDaySelection> {
  if (projectIds.length !== MATCH_DAY_PROJECT_COUNT) {
    throw new Error(`Select exactly ${MATCH_DAY_PROJECT_COUNT} climate projects.`);
  }
  const amount = Math.max(OPENING_SPONSORSHIP, Math.round(minAmount));
  const campaign = await findOpenClubCampaign(clubId, clubName);

  if (campaign) {
    await supabase
      .from("campaign_projects")
      .delete()
      .eq("campaign_id", campaign.id);

    const { error: insertError } = await supabase.from("campaign_projects").insert(
      projectIds.map((projectId, index) => ({
        campaign_id: campaign.id,
        climate_project_id: projectId,
        display_order: index + 1,
        vote_count: 0,
        is_winner: false,
      }))
    );
    if (insertError) {
      throw new Error("Could not save the 5 match-day projects. Please try again.");
    }
  }

  await supabase.from("club_match_portfolio").delete().eq("club_id", clubId);
  const portfolioAttempts = [
    projectIds.map((projectId) => ({
      club_id: clubId,
      project_id: projectId,
      status: "selected",
    })),
    projectIds.map((projectId) => ({
      club_id: clubId,
      climate_project_id: projectId,
      status: "selected",
    })),
  ];
  for (const rows of portfolioAttempts) {
    const { error } = await supabase.from("club_match_portfolio").insert(rows);
    if (!error) break;
  }

  const selection: MatchDaySelection = {
    projectIds,
    minAmount: amount,
    savedAt: new Date().toISOString(),
    campaignId: campaign?.id ?? null,
  };
  writeStoredMatchDay(clubId, selection);
  return selection;
}

export function matchDayWindowCopy(): string {
  return `Select ${MATCH_DAY_PROJECT_COUNT} projects at least ${MATCH_DAY_LEAD_HOURS} hours before kick-off so supporters can vote.`;
}
