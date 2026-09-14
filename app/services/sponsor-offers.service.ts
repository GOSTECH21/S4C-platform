import { supabase } from "../lib/supabase";
import { LEAGUE_SPORT, leagueForClubName } from "../lib/current-season";
import { scoreLabelForSport } from "../lib/sports";
import { sponsorOfferHeadline } from "../lib/s4p-climate-projects";
import type { ClimateProject } from "./votes.service";
import { getCurrentSponsor } from "./current-sponsor.service";

export type SponsorOfferProject = {
  id: string;
  name: string;
  description: string | null;
  country: string | null;
  category: string | null;
  estimated_co2: number | null;
};

export type SponsorMatchOffer = {
  id: string;
  clubId: string;
  clubName: string;
  clubEmail: string | null;
  matchTitle: string;
  matchDate: string | null;
  scoreLabel: string;
  projectIds: string[];
  projects: SponsorOfferProject[];
  postedAt: string;
  headline: string;
};

export type SponsorOfferSignature = {
  id: string;
  offerId: string;
  sponsorId: string | null;
  signerName: string;
  brandName: string;
  acceptedTerms: boolean;
  signedAt: string;
};

export type SponsorProjectProposal = {
  id: string;
  clubId: string;
  clubName: string;
  sponsorId: string | null;
  sponsorName: string;
  sponsorEmail: string | null;
  projectIds: string[];
  projects: SponsorOfferProject[];
  createdAt: string;
  status: string;
};

const OFFER_STORAGE = "s4p.sponsor.matchOffers";
const SIGN_STORAGE = "s4p.sponsor.offerSignatures";
const PROPOSAL_STORAGE = "s4p.sponsor.projectProposals";

function snapshotProject(project: ClimateProject): SponsorOfferProject {
  return {
    id: project.id,
    name: project.name,
    description: project.description ?? null,
    country: project.country ?? null,
    category: project.category ?? null,
    estimated_co2: project.estimated_co2 ?? null,
  };
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function mergeById<T extends { id: string }>(left: T[], right: T[]): T[] {
  const byId = new Map<string, T>();
  for (const item of [...left, ...right]) byId.set(item.id, item);
  return [...byId.values()];
}

export async function lookupClubMatchContext(
  clubId: string,
  clubName: string
): Promise<{ matchTitle: string; matchDate: string | null; scoreLabel: string }> {
  const league = leagueForClubName(clubName);
  const sport = league ? LEAGUE_SPORT[league] ?? "Football" : "Football";
  const scoreLabel = scoreLabelForSport(sport);

  const { data: campaign } = await supabase
    .from("match_campaigns")
    .select("title, voting_closes, match_id")
    .eq("club_id", clubId)
    .eq("status", "open")
    .maybeSingle();

  let matchTitle = (campaign?.title as string | null) ?? `${clubName} Match Day`;
  let matchDate = (campaign?.voting_closes as string | null) ?? null;

  const fixtureId = campaign?.match_id as string | null;
  if (fixtureId) {
    const { data: fixture } = await supabase
      .from("fixtures")
      .select("*")
      .eq("id", fixtureId)
      .maybeSingle();
    if (fixture) {
      const kickoff =
        (fixture.kickoff_at as string | null) ??
        (fixture.kick_off as string | null) ??
        (fixture.starts_at as string | null) ??
        (fixture.match_date as string | null);
      if (kickoff) matchDate = kickoff;
    }
  }

  if (!campaign) {
    const { data: fixture } = await supabase
      .from("fixtures")
      .select("*")
      .or(`home_club_id.eq.${clubId},away_club_id.eq.${clubId}`)
      .limit(1)
      .maybeSingle();
    if (fixture) {
      const kickoff =
        (fixture.kickoff_at as string | null) ??
        (fixture.kick_off as string | null) ??
        (fixture.starts_at as string | null) ??
        (fixture.match_date as string | null);
      if (kickoff) matchDate = kickoff;
    }
  }

  return { matchTitle, matchDate, scoreLabel };
}

export async function publishSponsorMatchOffer({
  clubId,
  clubName,
  clubEmail,
  projects,
}: {
  clubId: string;
  clubName: string;
  clubEmail?: string | null;
  projects: ClimateProject[];
}): Promise<SponsorMatchOffer> {
  const context = await lookupClubMatchContext(clubId, clubName);
  const offer: SponsorMatchOffer = {
    id: crypto.randomUUID(),
    clubId,
    clubName,
    clubEmail: clubEmail ?? null,
    matchTitle: context.matchTitle,
    matchDate: context.matchDate,
    scoreLabel: context.scoreLabel,
    projectIds: projects.map((project) => project.id),
    projects: projects.map(snapshotProject),
    postedAt: new Date().toISOString(),
    headline: sponsorOfferHeadline({
      clubName,
      matchTitle: context.matchTitle,
      matchDate: context.matchDate,
      scoreLabel: context.scoreLabel,
    }),
  };

  const local = readJson<SponsorMatchOffer[]>(OFFER_STORAGE, []);
  writeJson(
    OFFER_STORAGE,
    [offer, ...local.filter((row) => row.clubId !== clubId)].slice(0, 50)
  );

  await supabase.from("sponsor_match_offers").insert({
    id: offer.id,
    club_id: offer.clubId,
    club_name: offer.clubName,
    club_email: offer.clubEmail,
    match_title: offer.matchTitle,
    match_date: offer.matchDate,
    score_label: offer.scoreLabel,
    project_ids: offer.projectIds,
    projects: offer.projects,
    posted_at: offer.postedAt,
    headline: offer.headline,
    status: "open",
  });

  return offer;
}

function mapOfferRow(row: Record<string, unknown>): SponsorMatchOffer {
  const clubName = String(row.club_name ?? "Club");
  const matchTitle = String(row.match_title ?? `${clubName} Match Day`);
  const matchDate = (row.match_date as string | null) ?? null;
  const scoreLabel = String(row.score_label ?? "Goal");
  return {
    id: String(row.id),
    clubId: String(row.club_id ?? ""),
    clubName,
    clubEmail: (row.club_email as string | null) ?? null,
    matchTitle,
    matchDate,
    scoreLabel,
    projectIds: (row.project_ids as string[]) ?? [],
    projects: (row.projects as SponsorOfferProject[]) ?? [],
    postedAt: String(row.posted_at ?? new Date().toISOString()),
    headline:
      (row.headline as string | null) ??
      sponsorOfferHeadline({ clubName, matchTitle, matchDate, scoreLabel }),
  };
}

export async function listSponsorMatchOffers(): Promise<SponsorMatchOffer[]> {
  const local = readJson<SponsorMatchOffer[]>(OFFER_STORAGE, []);
  const { data } = await supabase
    .from("sponsor_match_offers")
    .select("*")
    .order("posted_at", { ascending: false });
  const remote = (data ?? []).map((row) => mapOfferRow(row as Record<string, unknown>));
  return mergeById(local, remote).sort((a, b) => b.postedAt.localeCompare(a.postedAt));
}

export async function getSponsorMatchOffer(
  id: string
): Promise<SponsorMatchOffer | null> {
  const offers = await listSponsorMatchOffers();
  return offers.find((offer) => offer.id === id) ?? null;
}

export async function listOfferSignatures(): Promise<SponsorOfferSignature[]> {
  const local = readJson<SponsorOfferSignature[]>(SIGN_STORAGE, []);
  const { data } = await supabase
    .from("sponsor_offer_signatures")
    .select("*")
    .order("signed_at", { ascending: false });
  const remote = (data ?? []).map((row) => ({
    id: String(row.id),
    offerId: String(row.offer_id),
    sponsorId: (row.sponsor_id as string | null) ?? null,
    signerName: String(row.signer_name ?? ""),
    brandName: String(row.brand_name ?? ""),
    acceptedTerms: Boolean(row.accepted_terms),
    signedAt: String(row.signed_at ?? ""),
  }));
  return mergeById(local, remote);
}

export async function signSponsorOffer({
  offerId,
  signerName,
  brandName,
}: {
  offerId: string;
  signerName: string;
  brandName: string;
}): Promise<SponsorOfferSignature> {
  let sponsorId: string | null = null;
  try {
    const sponsor = await getCurrentSponsor();
    sponsorId = String(sponsor.id);
  } catch {
    sponsorId = null;
  }

  const signature: SponsorOfferSignature = {
    id: crypto.randomUUID(),
    offerId,
    sponsorId,
    signerName: signerName.trim(),
    brandName: brandName.trim(),
    acceptedTerms: true,
    signedAt: new Date().toISOString(),
  };

  const local = readJson<SponsorOfferSignature[]>(SIGN_STORAGE, []);
  writeJson(SIGN_STORAGE, [
    signature,
    ...local.filter((row) => row.offerId !== offerId || row.sponsorId !== sponsorId),
  ]);

  await supabase.from("sponsor_offer_signatures").insert({
    id: signature.id,
    offer_id: signature.offerId,
    sponsor_id: signature.sponsorId,
    signer_name: signature.signerName,
    brand_name: signature.brandName,
    accepted_terms: true,
    signed_at: signature.signedAt,
  });

  return signature;
}

export async function signedBrandForClub(
  clubName: string
): Promise<string | null> {
  const [offers, signatures] = await Promise.all([
    listSponsorMatchOffers(),
    listOfferSignatures(),
  ]);
  const clubOffers = offers.filter((offer) =>
    offer.clubName.toLowerCase().includes(clubName.toLowerCase()) ||
    clubName.toLowerCase().includes(offer.clubName.toLowerCase())
  );
  for (const offer of clubOffers) {
    const signed = signatures.find(
      (row) => row.offerId === offer.id && row.brandName.trim()
    );
    if (signed) return signed.brandName;
  }
  return null;
}

export async function sendSponsorProposalToClub({
  clubId,
  clubName,
  sponsorName,
  sponsorEmail,
  projects,
}: {
  clubId: string;
  clubName: string;
  sponsorName: string;
  sponsorEmail?: string | null;
  projects: ClimateProject[];
}): Promise<SponsorProjectProposal> {
  let sponsorId: string | null = null;
  try {
    const sponsor = await getCurrentSponsor();
    sponsorId = String(sponsor.id);
  } catch {
    sponsorId = null;
  }

  const proposal: SponsorProjectProposal = {
    id: crypto.randomUUID(),
    clubId,
    clubName,
    sponsorId,
    sponsorName,
    sponsorEmail: sponsorEmail ?? null,
    projectIds: projects.map((project) => project.id),
    projects: projects.map(snapshotProject),
    createdAt: new Date().toISOString(),
    status: "sent",
  };

  const local = readJson<SponsorProjectProposal[]>(PROPOSAL_STORAGE, []);
  writeJson(PROPOSAL_STORAGE, [proposal, ...local].slice(0, 50));

  await supabase.from("sponsor_project_proposals").insert({
    id: proposal.id,
    club_id: proposal.clubId,
    club_name: proposal.clubName,
    sponsor_id: proposal.sponsorId,
    sponsor_name: proposal.sponsorName,
    sponsor_email: proposal.sponsorEmail,
    project_ids: proposal.projectIds,
    projects: proposal.projects,
    created_at: proposal.createdAt,
    status: proposal.status,
  });

  return proposal;
}

export async function listClubSponsorProposals(
  clubId: string,
  clubName: string
): Promise<SponsorProjectProposal[]> {
  const local = readJson<SponsorProjectProposal[]>(PROPOSAL_STORAGE, []).filter(
    (row) => row.clubId === clubId || row.clubName.toLowerCase() === clubName.toLowerCase()
  );
  const { data } = await supabase
    .from("sponsor_project_proposals")
    .select("*")
    .order("created_at", { ascending: false });
  const remote = (data ?? [])
    .filter(
      (row) =>
        row.club_id === clubId ||
        String(row.club_name ?? "").toLowerCase() === clubName.toLowerCase()
    )
    .map((row) => ({
      id: String(row.id),
      clubId: String(row.club_id ?? clubId),
      clubName: String(row.club_name ?? clubName),
      sponsorId: (row.sponsor_id as string | null) ?? null,
      sponsorName: String(row.sponsor_name ?? "Sponsor"),
      sponsorEmail: (row.sponsor_email as string | null) ?? null,
      projectIds: (row.project_ids as string[]) ?? [],
      projects: (row.projects as SponsorOfferProject[]) ?? [],
      createdAt: String(row.created_at ?? ""),
      status: String(row.status ?? "sent"),
    }));
  return mergeById(local, remote).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}

export function proposalMailtoToDirector(
  clubEmail: string | null,
  proposal: SponsorProjectProposal
): string {
  const subject = encodeURIComponent(
    `S4P Climate Projects from ${proposal.sponsorName} for ${proposal.clubName}`
  );
  const body = encodeURIComponent(
    `Dear Sustainability Director,\n\nPlease find our 5 Climate Projects for ${proposal.clubName} fans to vote on:\n\n${proposal.projects.map((project) => `• ${project.name}`).join("\n")}\n\nPlease push this list to your Fans/Supporters on S4P.\n\nKind regards,\nSponsorship Manager\n${proposal.sponsorName}`
  );
  return `mailto:${clubEmail ?? ""}?subject=${subject}&body=${body}`;
}
