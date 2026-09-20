import { supabase } from "../lib/supabase";
import {
  MATCH_DAY_PROJECT_COUNT,
  MATCH_DAY_CHOICE_COUNT,
  MATCH_DAY_LEAD_HOURS,
  listsWithUploadsFirst,
} from "../lib/partner-projects";
import {
  DEFAULT_GBP_PER_VOTE,
  DEFAULT_MINIMUM_SPONSORSHIP,
  DEFAULT_PROJECTED_VOTES,
  expectedSponsorshipFromVotes,
} from "../lib/sponsorship-auction";
import { findClubOnRoster } from "../lib/current-season";
import type { ClimateCountryContext } from "../lib/featured-climate-country";
import {
  localCatalogCountryForClub,
  selectableCatalogForClub,
} from "../lib/featured-climate-country";
import {
  MATCH_DAY_PORTFOLIO_POSTED,
  MATCH_DAY_PORTFOLIO_SELECTED,
  MATCH_DAY_PORTFOLIO_VOTED,
  fanTeamMatchesPostedClub,
  fanPostVisibleAt,
  isVotedPortfolioStatus,
  matchDayCampaignTitle,
  writeFanPostSchedule,
} from "../lib/match-day-post";
import {
  assignLookbackSponsors,
  dedupeLookbackRecords,
  findCurrentLookbackRecord,
  mergeLookbackProjects,
  preferFullerLookbackSelected,
  votedProjectsOnSignedOffer,
} from "../lib/sponsor-dashboard";
import { publishSccanCatalog, loadUploadedPartnerProjects } from "./partner.service";
import { listClubSignedSponsorships } from "./sponsor-offers.service";
import { sponsorLogoSrc } from "./teams.service";
import {
  isFeaturedClimateProject,
  type ClimateProject,
} from "./votes.service";

const PROJECT_FIELDS =
  "id, name, description, category, country, estimated_co2, funding_goal, image_url, status, featured, location";

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
  projectedVotes: number;
  gbpPerVote: number;
  expectedSponsorship: number;
  savedAt: string;
  campaignId: string | null;
  postedAt?: string | null;
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
  sponsorName?: string | null;
  sponsorLogoUrl?: string | null;
};

const MATCH_DAY_STORAGE_PREFIX = "s4p.sd.matchDay.";
const FILE_RECORD_STORAGE_PREFIX = "s4p.sd.fileRecords.";
const CAMPAIGN_AUCTION_PREFIX = "s4p.campaign.auction.";

export async function loadPartnerClimateProjects(
  context: ClimateCountryContext = {}
): Promise<ClimateProject[]> {
  const lists = await loadPartnerClimateProjectLists(context);
  return [...lists.local, ...lists.international];
}

export async function loadPartnerClimateProjectLists(
  context: ClimateCountryContext = {}
): Promise<{ local: ClimateProject[]; international: ClimateProject[] }> {
  const published = await publishSccanCatalog();
  const uploaded = await loadUploadedPartnerProjects();
  const byName = new Map(
    published.map((project) => [project.name.toLowerCase(), project])
  );
  const generic = selectableCatalogForClub(context)
    .map((item) => byName.get(item.name.toLowerCase()))
    .filter((project): project is ClimateProject => Boolean(project));
  return listsWithUploadsFirst(
    generic,
    uploaded,
    localCatalogCountryForClub(context)
  );
}

export async function loadFeaturedMatchDayProject(): Promise<ClimateProject | null> {
  const published = await publishSccanCatalog();
  return published.find(isFeaturedClimateProject) ?? null;
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
  return fanTeamMatchesPostedClub(
    { id: clubId, name: clubName, displayName: clubName },
    { clubId: row.club_id, title: row.title }
  );
}

type OpenClubCampaign = {
  id: string;
  title: string | null;
  sponsorship_per_goal: number | null;
  club_id?: string | null;
  voting_opens?: string | null;
};

export async function findOpenClubCampaign(
  clubId: string,
  clubName: string
): Promise<OpenClubCampaign | null> {
  const forClub = await supabase
    .from("match_campaigns")
    .select("id, title, sponsorship_per_goal, club_id, voting_opens")
    .eq("status", "open")
    .eq("club_id", clubId)
    .maybeSingle();

  if (forClub.data) return forClub.data;

  const { data: open } = await supabase
    .from("match_campaigns")
    .select("id, title, sponsorship_per_goal, club_id, voting_opens")
    .eq("status", "open");

  const match = (open ?? []).find((row) =>
    campaignBelongsToClub(row, clubId, clubName)
  );
  return match ?? null;
}

async function findClubFixtureId(clubId: string): Promise<string | null> {
  const { data } = await supabase
    .from("fixtures")
    .select("id")
    .or(`home_club_id.eq.${clubId},away_club_id.eq.${clubId}`)
    .limit(1)
    .maybeSingle();
  return (data?.id as string | undefined) ?? null;
}

async function createClubFixtureId(clubId: string): Promise<string | null> {
  const { data: other } = await supabase
    .from("clubs")
    .select("id")
    .neq("id", clubId)
    .limit(1)
    .maybeSingle();
  if (!other?.id) return null;
  const inserted = await supabase
    .from("fixtures")
    .insert({
      home_club_id: clubId,
      away_club_id: other.id,
      status: "scheduled",
      fixture_date: new Date().toISOString().slice(0, 10),
    })
    .select("id")
    .single();
  return (inserted.data?.id as string | undefined) ?? null;
}

async function writeCampaignProjects(
  campaignId: string,
  projectIds: string[]
) {
  await supabase.from("campaign_projects").delete().eq("campaign_id", campaignId);
  const { error } = await supabase.from("campaign_projects").insert(
    projectIds.map((projectId, index) => ({
      campaign_id: campaignId,
      climate_project_id: projectId,
      display_order: index + 1,
      vote_count: 0,
      is_winner: false,
    }))
  );
  if (error) {
    throw new Error(
      error.message || "Could not attach the 5 climate projects to the campaign."
    );
  }
}

export async function ensureOpenClubCampaign(
  clubId: string,
  clubName: string,
  minAmount: number,
  options?: { votingOpens?: string | null }
): Promise<OpenClubCampaign> {
  const title = matchDayCampaignTitle(clubName);
  const amount = Math.max(0, Math.round(Number(minAmount) || 0));
  const votingOpens = options?.votingOpens ?? null;
  const existing = await findOpenClubCampaign(clubId, clubName);
  if (existing) {
    await supabase
      .from("match_campaigns")
      .update({
        title: existing.title || title,
        sponsorship_per_goal: amount,
        status: "open",
        ...(votingOpens ? { voting_opens: votingOpens } : {}),
      })
      .eq("id", existing.id);
    return {
      ...existing,
      title: existing.title || title,
      sponsorship_per_goal: amount,
      voting_opens: votingOpens ?? existing.voting_opens,
    };
  }

  const matchId = await findClubFixtureId(clubId);
  const votingOpensAt = votingOpens ?? new Date().toISOString();
  const votingCloses = new Date(Date.now() + MATCH_DAY_LEAD_HOURS * 60 * 60 * 1000).toISOString();
  const attemptsFor = (fixtureId: string | null): Array<Record<string, unknown>> => [
    {
      club_id: clubId,
      title,
      status: "open",
      sponsorship_per_goal: amount,
      maximum_votes: 3,
      voting_opens: votingOpensAt,
      voting_closes: votingCloses,
      ...(fixtureId ? { match_id: fixtureId } : {}),
    },
    {
      club_id: clubId,
      title,
      status: "open",
      sponsorship_per_goal: amount,
      maximum_votes: 3,
      ...(fixtureId ? { match_id: fixtureId } : {}),
    },
    {
      club_id: clubId,
      title,
      status: "open",
      sponsorship_per_goal: amount,
      ...(fixtureId ? { match_id: fixtureId } : {}),
    },
    {
      club_id: clubId,
      title,
      status: "open",
      ...(fixtureId ? { match_id: fixtureId } : {}),
    },
  ];

  let lastError = "Could not post the Match Day campaign for your fans.";
  for (const payload of attemptsFor(matchId)) {
    const inserted = await supabase
      .from("match_campaigns")
      .insert(payload)
      .select("id, title, sponsorship_per_goal, club_id, voting_opens")
      .single();
    if (!inserted.error && inserted.data) {
      return inserted.data as OpenClubCampaign;
    }
    lastError = inserted.error?.message || lastError;
  }

  if (!matchId) {
    const createdMatchId = await createClubFixtureId(clubId);
    if (createdMatchId) {
      for (const payload of attemptsFor(createdMatchId)) {
        const inserted = await supabase
          .from("match_campaigns")
          .insert(payload)
          .select("id, title, sponsorship_per_goal, club_id, voting_opens")
          .single();
        if (!inserted.error && inserted.data) {
          return inserted.data as OpenClubCampaign;
        }
        lastError = inserted.error?.message || lastError;
      }
      await supabase.from("fixtures").delete().eq("id", createdMatchId);
    }
  }

  throw new Error(lastError);
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

export async function loadVotedPortfolioProjects(
  clubId: string
): Promise<ClimateProject[]> {
  const { data, error } = await supabase
    .from("club_match_portfolio")
    .select("*")
    .eq("club_id", clubId);
  if (error || !data?.length) return [];

  const ids = (data as Array<Record<string, unknown>>)
    .filter((row) => isVotedPortfolioStatus(row.status))
    .map((row) => String(row.project_id ?? row.climate_project_id ?? ""))
    .filter(Boolean);
  return loadProjectsByIds([...new Set(ids)]);
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
  await publishSccanCatalog();
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

  const selected = await ensureFeaturedSelection(
    lists.selected.length > 0
      ? lists.selected
      : portfolio.length > 0
        ? portfolio
        : storedProjects
  );
  const votedFromPortfolio = await loadVotedPortfolioProjects(clubId);
  const voted = uniqueProjects([...lists.voted, ...votedFromPortfolio]);
  const funded = uniqueProjects(lists.funded);
  const minAmount = stored?.minAmount ?? campaign?.sponsorship_per_goal ?? null;
  let campaignId = campaign?.id ?? stored?.campaignId ?? null;
  if (!campaign && selected.length >= MATCH_DAY_PROJECT_COUNT) {
    try {
      const opened = await ensureOpenClubCampaign(
        clubId,
        clubName,
        minAmount ?? DEFAULT_MINIMUM_SPONSORSHIP
      );
      campaignId = opened.id;
      await writeCampaignProjects(
        opened.id,
        selected.map((project) => project.id)
      );
    } catch {
      // Fan votes still save on the portfolio; campaign_id can stay empty
      // once that column is nullable.
    }
  }
  const signed = await listClubSignedSponsorships(clubId, clubName);
  const logoFor = (name: string) => sponsorLogoSrc(name, null);

  if (signed.length === 0) {
    await persistFileRecord({
      clubId,
      clubName,
      campaignId,
      minAmount,
      selected,
      voted,
    });
  } else {
    for (const copy of signed) {
      const offerSelected =
        copy.offer.projects.length > 0
          ? copy.offer.projects
          : selected.filter((project) => copy.offer.projectIds.includes(project.id));
      await persistFileRecord({
        clubId,
        clubName,
        campaignId,
        minAmount,
        selected: offerSelected,
        voted: votedProjectsOnSignedOffer(copy.offer, voted),
        sponsorName: copy.signature.brandName,
        sponsorLogoUrl: logoFor(copy.signature.brandName),
        savedAt: copy.signature.signedAt,
      });
    }
  }

  const remote = await loadRemoteFileRecords(clubId);
  const merged = mergeRecordLists(readFileRecords(clubId), remote);
  const records = dedupeLookbackRecords(
    assignLookbackSponsors(merged, signed, logoFor)
  );
  writeFileRecords(clubId, records);
  await dropSupersededFileRecords(
    [...merged, ...remote, ...readFileRecords(clubId)],
    records
  );

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

async function ensureFeaturedSelection(
  selected: ClimateProject[]
): Promise<ClimateProject[]> {
  const featured = await loadFeaturedMatchDayProject();
  if (!featured) return uniqueProjects(selected).slice(0, MATCH_DAY_PROJECT_COUNT);
  const others = selected.filter(
    (project) => project.id !== featured.id && !isFeaturedClimateProject(project)
  );
  return uniqueProjects([featured, ...others]).slice(0, MATCH_DAY_PROJECT_COUNT);
}

function snapshotProject(project: {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  country?: string | null;
  estimated_co2?: number | null;
}): ClubFileProject {
  return {
    id: project.id,
    name: project.name,
    description: project.description ?? null,
    category: project.category ?? null,
    country: project.country ?? null,
    estimated_co2: project.estimated_co2 ?? null,
  };
}

function mergeVotedProjects(
  previous: ClubFileProject[] | undefined,
  next: ClubFileProject[]
): ClubFileProject[] {
  return mergeLookbackProjects(previous, next);
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
  return dedupeLookbackRecords([...byId.values()]).slice(0, 50);
}

async function dropSupersededFileRecords(
  previous: { id: string }[],
  kept: { id: string }[]
) {
  const keep = new Set(kept.map((row) => row.id));
  const dropped = [...new Set(previous.map((row) => row.id))].filter(
    (id) => id && !keep.has(id)
  );
  if (dropped.length === 0) return;
  try {
    await supabase.from("club_climate_file_records").delete().in("id", dropped);
  } catch {
    // Local lookbacks are already collapsed; remote cleanup is best-effort.
  }
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
    sponsorName:
      "sponsor_name" in row
        ? (row.sponsor_name as string | null) ?? null
        : undefined,
    sponsorLogoUrl:
      "sponsor_logo_url" in row
        ? (row.sponsor_logo_url as string | null) ?? null
        : undefined,
  }));
}

export async function persistFileRecord({
  clubId,
  clubName,
  campaignId,
  minAmount,
  selected,
  voted,
  sponsorName,
  sponsorLogoUrl,
  savedAt,
}: {
  clubId: string;
  clubName: string;
  campaignId: string | null;
  minAmount: number | null;
  selected: Array<{
    id: string;
    name: string;
    description?: string | null;
    category?: string | null;
    country?: string | null;
    estimated_co2?: number | null;
  }>;
  voted: Array<{
    id: string;
    name: string;
    description?: string | null;
    category?: string | null;
    country?: string | null;
    estimated_co2?: number | null;
  }>;
  sponsorName?: string | null;
  sponsorLogoUrl?: string | null;
  savedAt?: string | null;
}): Promise<ClubFileRecord | null> {
  if (selected.length === 0 && voted.length === 0) return null;

  const selectedSnap = selected.map(snapshotProject);
  const votedSnap = voted.map(snapshotProject);
  const existing = readFileRecords(clubId);
  const current = findCurrentLookbackRecord(existing, {
    campaignId,
    selected: selectedSnap,
    sponsorName,
  });

  if (!current && selectedSnap.length < MATCH_DAY_PROJECT_COUNT) {
    return null;
  }

  const record: ClubFileRecord = {
    id: current?.id ?? crypto.randomUUID(),
    clubId,
    campaignId: campaignId ?? current?.campaignId ?? null,
    savedAt: current?.savedAt ?? savedAt ?? new Date().toISOString(),
    matchLabel: current?.matchLabel ?? `${clubName} Match Day`,
    minAmount: minAmount ?? current?.minAmount ?? null,
    selected: preferFullerLookbackSelected(current?.selected, selectedSnap),
    voted: mergeVotedProjects(current?.voted, votedSnap),
    sponsorName: sponsorName ?? current?.sponsorName ?? null,
    sponsorLogoUrl: sponsorLogoUrl ?? current?.sponsorLogoUrl ?? null,
  };

  const next = mergeFileRecords(existing, record);
  writeFileRecords(clubId, next);
  await dropSupersededFileRecords([...existing, record], next);

  const stored =
    next.find((row) => row.id === record.id) ??
    findCurrentLookbackRecord(next, {
      campaignId: record.campaignId,
      selected: record.selected,
      sponsorName: record.sponsorName,
    }) ??
    record;

  const payload = {
    id: stored.id,
    club_id: clubId,
    campaign_id: stored.campaignId,
    saved_at: stored.savedAt,
    match_label: stored.matchLabel,
    min_amount: stored.minAmount,
    selected: stored.selected,
    voted: stored.voted,
  };
  const updated = await supabase
    .from("club_climate_file_records")
    .update(payload)
    .eq("id", stored.id);
  if (updated.error) {
    await supabase.from("club_climate_file_records").insert(payload);
  }

  return stored;
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
    return withAuctionDefaults(parsed);
  } catch {
    return null;
  }
}

export function readCampaignAuction(campaignId: string | null | undefined) {
  if (!campaignId || typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CAMPAIGN_AUCTION_PREFIX + campaignId);
    if (!raw) return null;
    return JSON.parse(raw) as Pick<
      MatchDaySelection,
      "minAmount" | "projectedVotes" | "gbpPerVote" | "expectedSponsorship"
    >;
  } catch {
    return null;
  }
}

function writeCampaignAuction(
  campaignId: string | null,
  selection: MatchDaySelection
) {
  if (!campaignId || typeof window === "undefined") return;
  window.localStorage.setItem(
    CAMPAIGN_AUCTION_PREFIX + campaignId,
    JSON.stringify({
      minAmount: selection.minAmount,
      projectedVotes: selection.projectedVotes,
      gbpPerVote: selection.gbpPerVote,
      expectedSponsorship: selection.expectedSponsorship,
    })
  );
}

function withAuctionDefaults(
  parsed: Partial<MatchDaySelection> & { projectIds: string[] }
): MatchDaySelection {
  const projectedVotes =
    Number(parsed.projectedVotes) > 0
      ? Number(parsed.projectedVotes)
      : DEFAULT_PROJECTED_VOTES;
  const gbpPerVote =
    Number(parsed.gbpPerVote) > 0 ? Number(parsed.gbpPerVote) : DEFAULT_GBP_PER_VOTE;
  const expectedSponsorship =
    Number(parsed.expectedSponsorship) > 0
      ? Number(parsed.expectedSponsorship)
      : expectedSponsorshipFromVotes({ projectedVotes, gbpPerVote });
  return {
    projectIds: parsed.projectIds,
    minAmount:
      Number(parsed.minAmount) > 0
        ? Number(parsed.minAmount)
        : DEFAULT_MINIMUM_SPONSORSHIP,
    projectedVotes,
    gbpPerVote,
    expectedSponsorship,
    savedAt: parsed.savedAt ?? new Date().toISOString(),
    campaignId: parsed.campaignId ?? null,
    postedAt: parsed.postedAt,
  };
}

function writeStoredMatchDay(clubId: string, selection: MatchDaySelection) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    MATCH_DAY_STORAGE_PREFIX + clubId,
    JSON.stringify(selection)
  );
}

export async function saveMatchDaySelection({
  clubId,
  clubName,
  country,
  projectIds,
  minAmount,
  projectedVotes,
  gbpPerVote,
  expectedSponsorship,
}: {
  clubId: string;
  clubName: string;
  country?: string | null;
  projectIds: string[];
  minAmount: number;
  projectedVotes?: number;
  gbpPerVote?: number;
  expectedSponsorship?: number;
}): Promise<MatchDaySelection> {
  const featured = await loadFeaturedMatchDayProject();
  if (!featured) {
    throw new Error("The Featured Climate Project could not be loaded.");
  }
  const selectable = await loadPartnerClimateProjects({ clubName, country });
  const validIds = new Set(selectable.map((project) => project.id));
  const chosen = [
    ...new Set(
      projectIds.filter((id) => id !== featured.id && validIds.has(id))
    ),
  ];
  if (chosen.length !== MATCH_DAY_CHOICE_COUNT) {
    throw new Error(
      `Select exactly ${MATCH_DAY_CHOICE_COUNT} Climate Partner projects. Global Schools Solar is included automatically.`
    );
  }
  const portfolioIds = [featured.id, ...chosen];
  const stored = readStoredMatchDay(clubId);
  const campaign = await findOpenClubCampaign(clubId, clubName);
  const auction = withAuctionDefaults({
    projectIds: portfolioIds,
    minAmount: Math.max(0, Math.round(Number(minAmount) || 0)),
    projectedVotes,
    gbpPerVote,
    expectedSponsorship,
    savedAt: new Date().toISOString(),
    campaignId: campaign?.id ?? stored?.campaignId ?? null,
    postedAt: campaign ? stored?.postedAt ?? new Date().toISOString() : stored?.postedAt ?? null,
  });

  if (campaign && campaignBelongsToClub(campaign, clubId, clubName)) {
    await supabase
      .from("match_campaigns")
      .update({
        sponsorship_per_goal: auction.minAmount,
        status: "open",
      })
      .eq("id", campaign.id);
    await writeCampaignProjects(campaign.id, portfolioIds);
  }

  await writeClubPortfolio(
    clubId,
    portfolioIds,
    campaign ? MATCH_DAY_PORTFOLIO_POSTED : MATCH_DAY_PORTFOLIO_SELECTED
  );

  writeStoredMatchDay(clubId, auction);
  writeCampaignAuction(auction.campaignId, auction);
  const selectedProjects = await loadProjectsByIds(portfolioIds);
  const votedProjects = (await loadVotedPortfolioProjects(clubId)).filter(
    (project) => portfolioIds.includes(project.id)
  );
  await persistFileRecord({
    clubId,
    clubName,
    campaignId: campaign?.id ?? stored?.campaignId ?? null,
    minAmount: auction.minAmount,
    selected: selectedProjects,
    voted: votedProjects,
  });
  return auction;
}

async function writeClubPortfolio(
  clubId: string,
  projectIds: string[],
  status: string
) {
  const existing = await supabase
    .from("club_match_portfolio")
    .select("*")
    .eq("club_id", clubId);
  const previouslyVoted = new Set(
    ((existing.data ?? []) as Array<Record<string, unknown>>)
      .filter((row) => isVotedPortfolioStatus(row.status))
      .map((row) => String(row.project_id ?? row.climate_project_id ?? ""))
      .filter(Boolean)
  );

  await supabase.from("club_match_portfolio").delete().eq("club_id", clubId);
  const rowStatus = (projectId: string) =>
    status === MATCH_DAY_PORTFOLIO_POSTED && previouslyVoted.has(projectId)
      ? MATCH_DAY_PORTFOLIO_VOTED
      : status;
  const portfolioAttempts = [
    projectIds.map((projectId) => ({
      club_id: clubId,
      project_id: projectId,
      status: rowStatus(projectId),
    })),
    projectIds.map((projectId) => ({
      club_id: clubId,
      climate_project_id: projectId,
      status: rowStatus(projectId),
    })),
  ];
  let lastError = "Could not save the Match Day projects.";
  for (const rows of portfolioAttempts) {
    const { error } = await supabase.from("club_match_portfolio").insert(rows);
    if (!error) return;
    lastError = error.message;
  }
  throw new Error(lastError);
}

export async function postMatchDayProjectsToFans({
  clubId,
  clubName,
}: {
  clubId: string;
  clubName: string;
  country?: string | null;
}): Promise<MatchDaySelection> {
  await publishSccanCatalog();
  const stored = readStoredMatchDay(clubId);
  const board = await loadClubProjectBoard(clubId, clubName);
  const selected = await ensureFeaturedSelection(board.selected);
  if (selected.length < MATCH_DAY_PROJECT_COUNT) {
    throw new Error(
      `Choose ${MATCH_DAY_PROJECT_COUNT} Match Day projects before posting them to your fans.`
    );
  }

  const portfolioIds = selected.slice(0, MATCH_DAY_PROJECT_COUNT).map(
    (project) => project.id
  );
  const existingCampaign = await findOpenClubCampaign(clubId, clubName);
  const campaignFloor = Number(existingCampaign?.sponsorship_per_goal);
  const boardFloor = Number(board.minAmount);
  const storedFloor = Number(stored?.minAmount);
  const minimumAmount =
    (storedFloor > 0 ? storedFloor : 0) ||
    (boardFloor > 0 ? boardFloor : 0) ||
    (campaignFloor > 0 ? campaignFloor : 0) ||
    DEFAULT_MINIMUM_SPONSORSHIP;
  const postedAt = new Date();
  const visibleAt = fanPostVisibleAt(postedAt);
  let sponsorNames: string[] = [];
  try {
    const { loadClubSponsorRoster } = await import("./climate-sponsors.service");
    const { selectedSponsors } = await import("../lib/climate-sponsors");
    sponsorNames = selectedSponsors(
      loadClubSponsorRoster(clubId, clubName)
    ).map((sponsor) => sponsor.brandName);
  } catch {
    sponsorNames = [];
  }
  writeFanPostSchedule({
    clubId,
    clubName,
    postedAt: postedAt.toISOString(),
    visibleAt: visibleAt.toISOString(),
    projectIds: portfolioIds,
    campaignId: stored?.campaignId ?? existingCampaign?.id ?? null,
    sponsorNames,
  });
  const auction = withAuctionDefaults({
    projectIds: portfolioIds,
    minAmount: minimumAmount,
    projectedVotes: stored?.projectedVotes,
    gbpPerVote: stored?.gbpPerVote,
    expectedSponsorship: stored?.expectedSponsorship,
    savedAt: postedAt.toISOString(),
    campaignId: stored?.campaignId ?? existingCampaign?.id ?? null,
  });
  await writeClubPortfolio(clubId, portfolioIds, MATCH_DAY_PORTFOLIO_POSTED);

  let campaign: OpenClubCampaign | null = null;
  try {
    campaign = await ensureOpenClubCampaign(
      clubId,
      clubName,
      auction.minAmount,
      { votingOpens: visibleAt.toISOString() }
    );
    if (campaignBelongsToClub({ ...campaign, club_id: campaign.club_id ?? clubId }, clubId, clubName)) {
      await writeCampaignProjects(campaign.id, portfolioIds);
    }
  } catch {
    campaign = await findOpenClubCampaign(clubId, clubName);
  }

  const selection: MatchDaySelection = {
    ...auction,
    campaignId: campaign?.id ?? stored?.campaignId ?? null,
    postedAt: postedAt.toISOString(),
  };
  writeStoredMatchDay(clubId, selection);
  writeCampaignAuction(selection.campaignId, selection);
  writeFanPostSchedule({
    clubId,
    clubName,
    postedAt: postedAt.toISOString(),
    visibleAt: visibleAt.toISOString(),
    projectIds: portfolioIds,
    campaignId: selection.campaignId,
    sponsorNames,
  });
  const selectedProjects = await loadProjectsByIds(portfolioIds);
  await persistFileRecord({
    clubId,
    clubName,
    campaignId: campaign?.id ?? stored?.campaignId ?? null,
    minAmount: selection.minAmount,
    selected: selectedProjects,
    voted: board.voted,
  });
  try {
    const { publishSponsorMatchOffer } = await import("./sponsor-offers.service");
    await publishSponsorMatchOffer({
      clubId,
      clubName,
      projects: selectedProjects,
      sponsorshipAmountGbp: selection.minAmount,
      gbpPerVote: selection.gbpPerVote,
      targetBrandNames: sponsorNames,
    });
  } catch {
    // Fans still receive the posted five even if the sponsor offer cannot be stored.
  }
  return selection;
}

export function matchDayWindowCopy(): string {
  return `Select ${MATCH_DAY_CHOICE_COUNT} Climate Partner projects at least ${MATCH_DAY_LEAD_HOURS} hours before kick-off. Global Schools Solar is included in every Match Day five. After you post, fans see the five on My S4P and Climate Projects immediately.`;
}
