import { supabase } from "../lib/supabase";
import {
  MATCH_DAY_PROJECT_COUNT,
  MATCH_DAY_LEAD_HOURS,
} from "../lib/partner-projects";
import { OPENING_SPONSORSHIP } from "../lib/sponsorship-auction";
import { findClubOnRoster, seasonNamesMatch } from "../lib/current-season";
import { publishSccanCatalog } from "./partner.service";
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
  return publishSccanCatalog();
}

const ACCOUNT_FIELDS =
  "id, club_id, first_name, last_name, job_title, email, phone, status, supporter_base, average_attendance";

export type ClubRegistrationInput = {
  clubName: string;
  country: string;
  website: string;
  stadium: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  email: string;
  phone: string;
  password: string;
  supporterBase: string;
  attendance: string;
  sustainability: string;
  climateSponsorship: boolean;
  climateCredits: boolean;
  climateLeague: boolean;
  globalSchoolsSolar: boolean;
};

export async function loadClubSession(): Promise<{
  account: ClubAccount;
  club: ClubProfile;
} | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const account = await loadClubAccountForUser(user.id, user.email);
  if (!account) return null;

  const { data: club, error: clubError } = await supabase
    .from("clubs")
    .select("id, name, country")
    .eq("id", account.club_id)
    .maybeSingle();

  if (clubError || !club) return null;

  return {
    account,
    club: club as ClubProfile,
  };
}

async function loadClubAccountForUser(
  userId: string,
  email: string | null | undefined
): Promise<ClubAccount | null> {
  const byAuth = await supabase
    .from("club_accounts")
    .select(ACCOUNT_FIELDS)
    .eq("auth_user_id", userId)
    .maybeSingle();

  if (byAuth.data) return byAuth.data as ClubAccount;

  if (!email) return null;

  const byEmail = await supabase
    .from("club_accounts")
    .select(ACCOUNT_FIELDS)
    .ilike("email", email)
    .limit(1)
    .maybeSingle();

  if (!byEmail.data) return null;

  await supabase
    .from("club_accounts")
    .update({ auth_user_id: userId })
    .eq("id", byEmail.data.id);

  return byEmail.data as ClubAccount;
}

export async function findClubForRegistration(
  clubName: string
): Promise<ClubProfile | null> {
  const { data } = await supabase.from("clubs").select("id, name, country");
  const match = findClubOnRoster(data ?? [], clubName);
  return match ?? null;
}

export async function registerClubSustainabilityDirector(
  input: ClubRegistrationInput
) {
  const user = await createOrSignInClubUser(input.email, input.password);
  await upsertClubProfile(user.id, input.email);

  const club = await resolveRegisteredClub(input);
  const payload = {
    club_id: club.id,
    auth_user_id: user.id,
    first_name: input.firstName,
    last_name: input.lastName,
    job_title: input.jobTitle,
    email: input.email,
    phone: input.phone,
    website: input.website,
    supporter_base: input.supporterBase,
    average_attendance: input.attendance,
    sustainability_notes: input.sustainability,
    climate_sponsorship: input.climateSponsorship,
    climate_league: input.climateLeague,
    fan_climate_credits: input.climateCredits,
    impact_dashboard: input.globalSchoolsSolar,
    status: "pending",
  };

  const existing = await supabase
    .from("club_accounts")
    .select("id")
    .ilike("email", input.email)
    .limit(1)
    .maybeSingle();

  if (existing.data) {
    const { error } = await supabase
      .from("club_accounts")
      .update(payload)
      .eq("id", existing.data.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("club_accounts").insert(payload);
    if (error) throw error;
  }

  return club;
}

async function createOrSignInClubUser(email: string, password: string) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    if (!/already (been )?registered|already exists/i.test(authError.message)) {
      throw authError;
    }
    const signedIn = await supabase.auth.signInWithPassword({ email, password });
    if (signedIn.error) throw signedIn.error;
    if (!signedIn.data.user) throw new Error("Could not sign in to this club account.");
    return signedIn.data.user;
  }

  if (!authData.session) {
    const signedIn = await supabase.auth.signInWithPassword({ email, password });
    if (signedIn.error) throw signedIn.error;
    if (!signedIn.data.user) {
      throw new Error("Failed to create authentication user.");
    }
    return signedIn.data.user;
  }

  if (!authData.user) throw new Error("Failed to create authentication user.");
  return authData.user;
}

async function resolveRegisteredClub(
  input: ClubRegistrationInput
): Promise<ClubProfile> {
  const existing = await findClubForRegistration(input.clubName);
  if (existing) return existing;

  const { data: club, error } = await supabase
    .from("clubs")
    .insert({
      name: input.clubName,
      short_name: input.clubName,
      country: input.country,
      city: "",
      stadium: input.stadium,
      logo_url: "",
      primary_colour: "",
      secondary_colour: "",
      competition_id: null,
    })
    .select("id, name, country")
    .single();

  if (error || !club) throw error ?? new Error("Could not create the club.");
  return club as ClubProfile;
}

async function upsertClubProfile(userId: string, email: string) {
  const inserted = await supabase.from("profiles").insert({
    id: userId,
    email,
    role: "club",
  });
  if (!inserted.error) return;
  if (inserted.error.code === "23505") {
    await supabase.from("profiles").update({ role: "club" }).eq("id", userId);
    return;
  }
  throw inserted.error;
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
