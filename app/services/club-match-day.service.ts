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

export type ClubFileProject = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  country: string | null;
  estimated_co2: number | null;
};

export type ClubFileRecord = {
  id: string;
  clubId: string;
  campaignId: string | null;
  savedAt: string;
  matchLabel: string;
  minAmount: number | null;
  selected: ClubFileProject[];
  voted: ClubFileProject[];
};

const MATCH_DAY_STORAGE_PREFIX = "s4p.sd.matchDay.";
const FILE_RECORD_STORAGE_PREFIX = "s4p.sd.fileRecords.";

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

export async function loadProjectsByIds(
  projectIds: string[]
): Promise<ClimateProject[]> {
  if (projectIds.length === 0) return [];
  const { data, error } = await supabase
    .from("climate_projects")
    .select(PROJECT_FIELDS)
    .in("id", projectIds);
  if (error || !data) return [];
  const byId = new Map(
    (data as ClimateProject[]).map((project) => [project.id, project])
  );
  return projectIds
    .map((id) => byId.get(id))
    .filter((project): project is ClimateProject => Boolean(project));
}

export async function loadPortfolioProjects(
  clubId: string
): Promise<ClimateProject[]> {
  const { data, error } = await supabase
    .from("club_match_portfolio")
    .select("*")
    .eq("club_id", clubId);
  if (error || !data?.length) return [];

  const ids = (data as Array<Record<string, unknown>>)
    .map((row) =>
      String(row.project_id ?? row.climate_project_id ?? "")
    )
    .filter(Boolean);
  return loadProjectsByIds([...new Set(ids)]);
}

export async function loadClubProjectBoard(
  clubId: string,
  clubName: string
): Promise<{
  selected: ClimateProject[];
  voted: ClimateProject[];
  funded: ClimateProject[];
  minAmount: number | null;
  records: ClubFileRecord[];
}> {
  const stored = readStoredMatchDay(clubId);
  const campaign = await findOpenClubCampaign(clubId, clubName);
  const lists = await loadCampaignProjectLists(
    campaign?.id ?? stored?.campaignId ?? null
  );
  const portfolio = lists.selected.length
    ? []
    : await loadPortfolioProjects(clubId);
  const storedProjects =
    lists.selected.length || portfolio.length
      ? []
      : await loadProjectsByIds(stored?.projectIds ?? []);

  const selected =
    lists.selected.length > 0
      ? lists.selected
      : portfolio.length > 0
        ? portfolio
        : storedProjects;
  const voted = uniqueProjects(lists.voted);
  const funded = uniqueProjects(lists.funded);
  const minAmount = stored?.minAmount ?? campaign?.sponsorship_per_goal ?? null;

  const record = await persistFileRecord({
    clubId,
    clubName,
    campaignId: campaign?.id ?? stored?.campaignId ?? null,
    minAmount,
    selected,
    voted,
  });
  const remote = await loadRemoteFileRecords(clubId);
  const records = mergeFileRecords(
    mergeRecordLists(readFileRecords(clubId), remote),
    record
  );
  writeFileRecords(clubId, records);

  return { selected, voted, funded, minAmount, records };
}

function uniqueProjects(projects: ClimateProject[]): ClimateProject[] {
  const seen = new Set<string>();
  return projects.filter((project) => {
    if (seen.has(project.id)) return false;
    seen.add(project.id);
    return true;
  });
}

function snapshotProject(project: ClimateProject): ClubFileProject {
  return {
    id: project.id,
    name: project.name,
    description: project.description ?? null,
    category: project.category ?? null,
    country: project.country ?? null,
    estimated_co2: project.estimated_co2 ?? null,
  };
}

function sameProjectSet(left: ClubFileProject[], right: ClubFileProject[]) {
  if (left.length !== right.length) return false;
  const ids = new Set(left.map((project) => project.id));
  return right.every((project) => ids.has(project.id));
}

function readFileRecords(clubId: string): ClubFileRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FILE_RECORD_STORAGE_PREFIX + clubId);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ClubFileRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeFileRecords(clubId: string, records: ClubFileRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    FILE_RECORD_STORAGE_PREFIX + clubId,
    JSON.stringify(records.slice(0, 50))
  );
}

function mergeFileRecords(
  existing: ClubFileRecord[],
  incoming: ClubFileRecord | null
): ClubFileRecord[] {
  if (!incoming) return existing;
  return mergeRecordLists(existing, [incoming]);
}

function mergeRecordLists(
  left: ClubFileRecord[],
  right: ClubFileRecord[]
): ClubFileRecord[] {
  const byId = new Map<string, ClubFileRecord>();
  for (const record of [...left, ...right]) {
    const previous = byId.get(record.id);
    if (!previous || record.savedAt >= previous.savedAt) byId.set(record.id, record);
  }
  return [...byId.values()]
    .sort((a, b) => b.savedAt.localeCompare(a.savedAt))
    .slice(0, 50);
}

async function loadRemoteFileRecords(clubId: string): Promise<ClubFileRecord[]> {
  const { data, error } = await supabase
    .from("club_climate_file_records")
    .select(
      "id, club_id, campaign_id, saved_at, match_label, min_amount, selected, voted"
    )
    .eq("club_id", clubId)
    .order("saved_at", { ascending: false });
  if (error || !data) return [];
  return data.map((row) => ({
    id: String(row.id),
    clubId: String(row.club_id),
    campaignId: (row.campaign_id as string | null) ?? null,
    savedAt: String(row.saved_at),
    matchLabel: String(row.match_label ?? "Match Day"),
    minAmount:
      row.min_amount == null ? null : Number(row.min_amount),
    selected: (row.selected as ClubFileRecord["selected"]) ?? [],
    voted: (row.voted as ClubFileRecord["voted"]) ?? [],
  }));
}

export async function persistFileRecord({
  clubId,
  clubName,
  campaignId,
  minAmount,
  selected,
  voted,
}: {
  clubId: string;
  clubName: string;
  campaignId: string | null;
  minAmount: number | null;
  selected: ClimateProject[];
  voted: ClimateProject[];
}): Promise<ClubFileRecord | null> {
  if (selected.length === 0 && voted.length === 0) return null;

  const selectedSnap = selected.map(snapshotProject);
  const votedSnap = voted.map(snapshotProject);
  const existing = readFileRecords(clubId);
  const current =
    existing.find((record) =>
      campaignId ? record.campaignId === campaignId : false
    ) ??
    existing.find(
      (record) =>
        sameProjectSet(record.selected, selectedSnap) &&
        record.savedAt.slice(0, 10) === new Date().toISOString().slice(0, 10)
    );

  const record: ClubFileRecord = {
    id: current?.id ?? crypto.randomUUID(),
    clubId,
    campaignId,
    savedAt: new Date().toISOString(),
    matchLabel: current?.matchLabel ?? `${clubName} Match Day`,
    minAmount,
    selected: selectedSnap,
    voted: votedSnap,
  };

  const next = mergeFileRecords(existing, record);
  writeFileRecords(clubId, next);

  const payload = {
    id: record.id,
    club_id: clubId,
    campaign_id: campaignId,
    saved_at: record.savedAt,
    match_label: record.matchLabel,
    min_amount: minAmount,
    selected: selectedSnap,
    voted: votedSnap,
  };
  const updated = await supabase
    .from("club_climate_file_records")
    .update(payload)
    .eq("id", record.id);
  if (updated.error) {
    await supabase.from("club_climate_file_records").insert(payload);
  }

  return record;
}

export function fileRecordDownloadName(clubName: string): string {
  const slug = clubName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `s4p-${slug || "club"}-match-day-file-record.json`;
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
  const selectedProjects = await loadProjectsByIds(projectIds);
  await persistFileRecord({
    clubId,
    clubName,
    campaignId: campaign?.id ?? null,
    minAmount: amount,
    selected: selectedProjects,
    voted: [],
  });
  return selection;
}

export function matchDayWindowCopy(): string {
  return `Select ${MATCH_DAY_PROJECT_COUNT} projects at least ${MATCH_DAY_LEAD_HOURS} hours before kick-off so supporters can vote.`;
}
