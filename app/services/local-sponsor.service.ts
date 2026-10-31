import { supabase } from "../lib/supabase";
import { brandsMatch } from "../lib/climate-sponsors";
import {
  LOCAL_SPONSOR_STORAGE,
  allLocalSponsors,
  clubKey,
  localBrandKey,
  localRecordFromProfile,
  readLocalSponsorRecord,
  replaceAllLocalSponsors,
  shouldSyncLocalSponsorRecord,
  uniqueLocalClubBrandRecords,
  withAgreedPledge,
  parseMatchSponsorships,
  recordFromSponsorRow,
  type LocalSponsorRecord,
} from "../lib/local-sponsor";
import { isSportingCalendarClub } from "../lib/calendar-clubs";

const TABLE = "local_sponsor_records";

type LocalSponsorRow = {
  brand_key: string;
  club_key: string;
  brand_name: string;
  club_name: string;
  email?: string | null;
  pledge_gbp?: number | null;
  postcode?: string | null;
  logo_url?: string | null;
  tagline?: string | null;
  source?: string | null;
  match_sponsorships?: unknown;
  submitted_at?: string | null;
  accepted_terms?: boolean | null;
  signer_name?: string | null;
  signed_at?: string | null;
  created_at?: string | null;
};

function isMissingTable(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  return (
    error.code === "PGRST205" ||
    error.code === "42703" ||
    /could not find the table/i.test(error.message ?? "") ||
    /column .* does not exist/i.test(error.message ?? "")
  );
}

export { recordFromSponsorRow };

function recordFromCatalogRow(row: LocalSponsorRow): LocalSponsorRecord | null {
  const brandName = String(row.brand_name ?? "").trim();
  const clubName = String(row.club_name ?? "").trim();
  if (!brandName || !clubName || !isSportingCalendarClub(clubName)) return null;
  const source =
    row.source === "example" || row.source === "uploaded" || row.source === "registered"
      ? row.source
      : "registered";
  return withAgreedPledge({
    brandName,
    email: String(row.email ?? "").trim(),
    clubName,
    pledgeGbp: Number(row.pledge_gbp) || 0,
    createdAt: row.created_at || new Date().toISOString(),
    logoUrl: row.logo_url ?? null,
    tagline: row.tagline ?? null,
    source,
    matchSponsorships: parseMatchSponsorships(row.match_sponsorships),
    submittedAt: row.submitted_at ?? undefined,
    acceptedTerms: Boolean(row.accepted_terms),
    signerName: row.signer_name ?? undefined,
    signedAt: row.signed_at ?? undefined,
    postcode: String(row.postcode ?? "").trim() || undefined,
  });
}

function catalogPayload(record: LocalSponsorRecord) {
  return {
    brand_key: localBrandKey(record.brandName),
    club_key: clubKey(record.clubName),
    brand_name: record.brandName.trim(),
    club_name: record.clubName.trim(),
    email: record.email || null,
    pledge_gbp: record.pledgeGbp,
    postcode: record.postcode || null,
    logo_url: record.logoUrl || null,
    tagline: record.tagline || null,
    source: record.source || "registered",
    match_sponsorships: record.matchSponsorships ?? [],
    submitted_at: record.submittedAt || null,
    accepted_terms: record.acceptedTerms ?? null,
    signer_name: record.signerName || null,
    signed_at: record.signedAt || null,
    created_at: record.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function recordKey(record: Pick<LocalSponsorRecord, "brandName" | "clubName">) {
  return `${clubKey(record.clubName)}:${localBrandKey(record.brandName)}`;
}

export async function persistLocalSponsorRecord(record: LocalSponsorRecord) {
  if (typeof window === "undefined") return;
  if (!shouldSyncLocalSponsorRecord(record)) return;
  const payload = catalogPayload(withAgreedPledge(record));
  try {
    const { error } = await supabase.from(TABLE).upsert(payload, {
      onConflict: "brand_key,club_key",
    });
    if (error && !isMissingTable(error)) {
      // Catalog write can fail when the session is still confirming email.
    }
  } catch {
    // Table is optional until migration 0020 is applied.
  }
  try {
    await supabase
      .from("sponsors")
      .update({
        club_name: record.clubName,
        postcode: record.postcode || null,
        pledge_gbp: record.pledgeGbp,
        match_sponsorships: record.matchSponsorships ?? [],
        sponsor_tier: "local",
      })
      .eq("name", record.brandName);
  } catch {
    // Extra sponsor columns are optional until migration 0020 is applied.
  }
}

export async function fetchLocalSponsorRecords(): Promise<LocalSponsorRecord[]> {
  try {
    const { data, error } = await supabase.from(TABLE).select("*");
    if (error) {
      if (!isMissingTable(error)) {
        return [];
      }
      return [];
    }
    return (data ?? [])
      .map((row) => recordFromCatalogRow(row as LocalSponsorRow))
      .filter((row): row is LocalSponsorRecord => Boolean(row));
  } catch {
    return [];
  }
}

export async function fetchClubsForBrand(brandName: string): Promise<
  Array<{ clubName: string; email: string | null; createdAt: string | null }>
> {
  const name = brandName.trim();
  if (!name) return [];
  try {
    const { data, error } = await supabase
      .from("sponsor_club_network")
      .select("brand_name, club_name, email, created_at");
    if (error) return [];
    return (data ?? [])
      .filter((row) => brandsMatch(String(row.brand_name ?? ""), name))
      .map((row) => ({
        clubName: String(row.club_name ?? "").trim(),
        email: (row.email as string | null) ?? null,
        createdAt: (row.created_at as string | null) ?? null,
      }))
      .filter((row) => isSportingCalendarClub(row.clubName));
  } catch {
    return [];
  }
}

function recordsFromNetwork(
  brandName: string,
  email: string,
  clubs: Array<{ clubName: string; email: string | null; createdAt: string | null }>
): LocalSponsorRecord[] {
  return clubs.map((row) =>
    withAgreedPledge({
      brandName,
      email: row.email || email,
      clubName: row.clubName,
      pledgeGbp: 0,
      createdAt: row.createdAt || new Date().toISOString(),
      source: "registered",
    })
  );
}

function writeOwnRecord(record: LocalSponsorRecord) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_SPONSOR_STORAGE, JSON.stringify(record));
}

export async function hydrateLocalSponsorRecords(options?: {
  brandName?: string | null;
  email?: string | null;
  sponsor?: Parameters<typeof recordFromSponsorRow>[0];
}): Promise<LocalSponsorRecord[]> {
  const brandName = String(options?.brandName ?? "").trim();
  const email = String(options?.email ?? "").trim();
  const remote = await fetchLocalSponsorRecords();
  const fromSponsor = recordFromSponsorRow(options?.sponsor ?? null);
  const networkClubs = brandName ? await fetchClubsForBrand(brandName) : [];
  const fromNetwork = brandName
    ? recordsFromNetwork(brandName, email, networkClubs)
    : [];
  const local = [
    ...allLocalSponsors(),
    ...(readLocalSponsorRecord() ? [readLocalSponsorRecord()!] : []),
    ...(localRecordFromProfile() ? [localRecordFromProfile()!] : []),
  ];
  const merged = uniqueLocalClubBrandRecords([
    ...fromNetwork,
    ...local,
    ...(fromSponsor ? [fromSponsor] : []),
    ...remote,
  ]);
  replaceAllLocalSponsors(merged);
  if (brandName) {
    const own = merged.filter((row) => brandsMatch(row.brandName, brandName));
    const best =
      own.find((row) => (row.matchSponsorships?.length ?? 0) > 0) ?? own[0];
    if (best) writeOwnRecord(best);
  }
  if (brandName) {
    const remoteKeys = new Set(remote.map(recordKey));
    for (const row of merged) {
      if (!brandsMatch(row.brandName, brandName)) continue;
      if (!shouldSyncLocalSponsorRecord(row)) continue;
      if (
        remoteKeys.has(recordKey(row)) &&
        (row.matchSponsorships?.length ?? 0) === 0
      ) {
        continue;
      }
      void persistLocalSponsorRecord(row);
    }
  }
  return merged;
}
