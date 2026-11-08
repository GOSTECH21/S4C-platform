import { supabase } from "../lib/supabase";
import {
  adminParticipantId,
  compactAdminKey,
  emptyAdminSnapshot,
  isAdminRemovedBrand,
  isAdminRemovedEmail,
  isAdminRemovedId,
  keysMatch,
  readAdminLedger,
  readAdminRemoved,
  recordAdminFanFund,
  recordAdminMatchrav,
  recordAdminP4p,
  recordAdminParticipant,
  uniqueAdminNames,
  readAdminMatchravTrips,
  writeAdminRemoved,
  type AdminBackendSnapshot,
  type AdminClubMatch,
  type AdminClubRecord,
  type AdminSponsorAccount,
  type AdminSupporterRecord,
} from "../lib/admin-backend";
import { storedFullName, uniqueClubNames } from "../lib/s4p-admin";
import { clubsMatch } from "../lib/sponsor-dashboard";
import { isLeadClimateBrand } from "../lib/match-day-branding";
import { isKnownLocalBusinessSponsorName } from "../lib/climate-sponsors";
import { allLocalSponsors } from "../lib/local-sponsor";
import { listAllMatchDayFolders } from "./match-day-folder.service";
import {
  loadInviteRounds,
  loadSponsorDirectory,
} from "./sponsor-listings.service";
import { listMatchDayLocks } from "./climate-sponsors.service";
import { listClimateWallets } from "./sponsor-wallet.service";
import { listLeadProjectFolders } from "../lib/lead-project-folder";
import {
  listP4pPredictions,
  listP4pProjectAllocations,
} from "./predict-for-planet.service";
import { readLocalSupportedClubs } from "./teams.service";

function listingName(
  listings: Array<{ id: string; brandName: string }>,
  id: string
) {
  return listings.find((row) => row.id === id)?.brandName ?? "";
}

function clubKey(name: string) {
  return compactAdminKey(name);
}

function markStatus<T extends { id: string; email?: string; brandName?: string; clubName?: string }>(
  row: T,
  extraRemoved = false
): "on-platform" | "removed" {
  if (extraRemoved) return "removed";
  if (isAdminRemovedId(row.id)) return "removed";
  if (isAdminRemovedEmail(row.email)) return "removed";
  if (row.brandName && isAdminRemovedBrand(row.brandName)) return "removed";
  return "on-platform";
}

function sponsorRole(input: {
  brandName: string;
  jobTitle?: string | null;
  listingKind?: string | null;
}): "lead" | "local" {
  if (isLeadClimateBrand(input.brandName)) return "lead";
  if (/local\s+business/i.test(input.jobTitle ?? "")) return "local";
  if (input.listingKind === "local") return "local";
  if (isKnownLocalBusinessSponsorName(input.brandName)) return "local";
  if (
    allLocalSponsors().some((row) => keysMatch(row.brandName, input.brandName))
  ) {
    return "local";
  }
  return "lead";
}

function matchesForClub(clubName: string): AdminClubMatch[] {
  const listings = loadSponsorDirectory();
  const rounds = loadInviteRounds().filter((round) =>
    clubsMatch(round.clubName, clubName)
  );
  const folders = listAllMatchDayFolders().filter((folder) =>
    clubsMatch(folder.clubName, clubName)
  );
  const locks = listMatchDayLocks().filter((lock) =>
    clubsMatch(lock.clubName, clubName)
  );
  const wallets = listClimateWallets().filter((wallet) =>
    clubsMatch(wallet.clubName, clubName)
  );
  const byMatch = new Map<string, AdminClubMatch>();

  function rowFor(label: string): AdminClubMatch {
    const key = compactAdminKey(label) || "match";
    const existing = byMatch.get(key);
    if (existing) return existing;
    const next: AdminClubMatch = {
      matchLabel: label,
      projectNames: [],
      invited: [],
      proceeded: [],
    };
    byMatch.set(key, next);
    return next;
  }

  for (const folder of folders) {
    const label =
      folder.sponsorsFile?.fileName ||
      folder.projectsFile?.fileName ||
      folder.matchDate ||
      "Match Day";
    const row = rowFor(label);
    row.projectNames = uniqueAdminNames([
      ...row.projectNames,
      ...(folder.projectsFile?.projects ?? []).map((project) => project.name),
    ]);
    row.proceeded = uniqueAdminNames([
      ...row.proceeded,
      ...(folder.sponsorsFile?.sponsors ?? []).map((sponsor) => sponsor.brandName),
    ]);
  }

  for (const round of rounds) {
    const row = rowFor(round.matchLabel || "Match Day");
    row.projectNames = uniqueAdminNames([
      ...row.projectNames,
      ...round.projectNames,
    ]);
    row.invited = uniqueAdminNames([
      ...row.invited,
      ...round.globalInviteeIds.map((id) => listingName(listings, id)),
      ...round.localInviteeIds.map((id) => listingName(listings, id)),
      ...round.commitments.map((item) => item.brandName),
    ]);
    row.proceeded = uniqueAdminNames([
      ...row.proceeded,
      round.lockedBrandName,
      ...round.commitments
        .filter((item) => keysMatch(item.brandName, round.lockedBrandName))
        .map((item) => item.brandName),
    ]);
  }

  for (const lock of locks) {
    const row = rowFor(lock.fixtureName || lock.matchLabel || "Match Day");
    row.proceeded = uniqueAdminNames([...row.proceeded, lock.brandKey]);
  }

  for (const wallet of wallets) {
    if ((wallet.allocatedGbp || 0) <= 0 && (wallet.paidGbp || 0) <= 0) continue;
    const row = rowFor("Sponsored matches");
    row.proceeded = uniqueAdminNames([...row.proceeded, wallet.brandName]);
  }

  return [...byMatch.values()];
}

function projectLogForBrand(brandName: string) {
  const fromLead = listLeadProjectFolders()
    .filter((entry) => keysMatch(entry.brandName, brandName))
    .map((entry) => ({
      clubName: entry.clubName,
      matchLabel: entry.matchTitle || entry.headline || "Match Day",
      projectNames: uniqueAdminNames(entry.projects.map((project) => project.name)),
    }));
  const fromRounds = loadInviteRounds()
    .filter(
      (round) =>
        keysMatch(round.lockedBrandName, brandName) ||
        round.commitments.some((item) => keysMatch(item.brandName, brandName))
    )
    .map((round) => ({
      clubName: round.clubName,
      matchLabel: round.matchLabel || "Match Day",
      projectNames: uniqueAdminNames(round.projectNames),
    }));
  const fromLocal = allLocalSponsors()
    .filter((row) => keysMatch(row.brandName, brandName))
    .flatMap((row) =>
      (row.matchSponsorships ?? []).map((match) => ({
        clubName: row.clubName,
        matchLabel: match.fixtureName,
        projectNames: [] as string[],
      }))
    );
  const merged = new Map<string, { clubName: string; matchLabel: string; projectNames: string[] }>();
  for (const row of [...fromLead, ...fromRounds, ...fromLocal]) {
    const key = `${clubKey(row.clubName)}:${compactAdminKey(row.matchLabel)}`;
    const existing = merged.get(key);
    if (!existing) {
      merged.set(key, { ...row, projectNames: uniqueAdminNames(row.projectNames) });
      continue;
    }
    existing.projectNames = uniqueAdminNames([
      ...existing.projectNames,
      ...row.projectNames,
    ]);
  }
  return [...merged.values()];
}

export async function loadAdminBackend(): Promise<AdminBackendSnapshot> {
  const snapshot = emptyAdminSnapshot();
  const ledger = readAdminLedger();

  const directors = await supabase
    .from("club_accounts")
    .select("id, first_name, last_name, email, clubs(name)")
    .order("last_name");
  const supporters = await supabase
    .from("supporters")
    .select("id, full_name, email, auth_user_id, clubs(name)")
    .order("full_name");
  const prefs = await supabase
    .from("supporter_preferences")
    .select("user_id, club");
  const sponsors = await supabase
    .from("sponsors")
    .select("id, name, website, industry, user_id, club_name, sponsor_tier")
    .not("user_id", "is", null)
    .order("name");

  snapshot.error =
    directors.error?.message ||
    supporters.error?.message ||
    sponsors.error?.message ||
    null;

  const prefClubs = new Map<string, string[]>();
  for (const row of prefs.data ?? []) {
    const userId = String(row.user_id ?? "");
    const club = String(row.club ?? "").trim();
    if (!userId || !club) continue;
    const list = prefClubs.get(userId) ?? [];
    list.push(club);
    prefClubs.set(userId, list);
  }

  const clubMap = new Map<string, AdminClubRecord>();
  for (const row of directors.data ?? []) {
    const club = (row as { clubs?: { name?: string } | null }).clubs;
    const clubName = String(club?.name ?? "").trim() || "No club selected";
    const record: AdminClubRecord = {
      id: adminParticipantId("club", clubName),
      clubName,
      directorName:
        storedFullName(String(row.first_name ?? ""), String(row.last_name ?? "")) ||
        "Unnamed director",
      email: String(row.email ?? "").trim() || "No email",
      directorId: String(row.id),
      matches: matchesForClub(clubName),
      status: "on-platform",
    };
    record.status = markStatus(record);
    clubMap.set(clubKey(clubName), record);
  }

  for (const folder of listAllMatchDayFolders()) {
    const key = clubKey(folder.clubName);
    if (!key) continue;
    if (!clubMap.has(key)) {
      const record: AdminClubRecord = {
        id: adminParticipantId("club", folder.clubName),
        clubName: folder.clubName,
        directorName: "Awaiting director record",
        email: "",
        matches: matchesForClub(folder.clubName),
        status: "on-platform",
      };
      record.status = markStatus(record);
      clubMap.set(key, record);
    }
  }

  for (const round of loadInviteRounds()) {
    const key = clubKey(round.clubName);
    if (!key || clubMap.has(key)) continue;
    const record: AdminClubRecord = {
      id: adminParticipantId("club", round.clubName),
      clubName: round.clubName,
      directorName: round.directorName || "Awaiting director record",
      email: "",
      matches: matchesForClub(round.clubName),
      status: "on-platform",
    };
    record.status = markStatus(record);
    clubMap.set(key, record);
  }

  for (const row of ledger.participants.filter((item) => item.role === "club")) {
    const clubName = row.clubName || row.displayName;
    const key = clubKey(clubName);
    if (!key || clubMap.has(key)) continue;
    const record: AdminClubRecord = {
      id: row.id,
      clubName,
      directorName: row.displayName,
      email: row.email,
      matches: matchesForClub(clubName),
      status: "on-platform",
    };
    record.status = markStatus(record);
    clubMap.set(key, record);
  }

  snapshot.clubs = [...clubMap.values()].sort((left, right) =>
    left.clubName.localeCompare(right.clubName)
  );

  const predictions = listP4pPredictions();
  const allocations = listP4pProjectAllocations();
  const trips = readAdminMatchravTrips();

  const supporterMap = new Map<string, AdminSupporterRecord>();
  for (const row of supporters.data ?? []) {
    const club = (row as { clubs?: { name?: string } | null }).clubs;
    const email = String(row.email ?? "").trim();
    const authUserId = row.auth_user_id ? String(row.auth_user_id) : null;
    const id = adminParticipantId("supporter", email || String(row.id));
    const teams = uniqueClubNames([
      String(club?.name ?? ""),
      ...(prefClubs.get(authUserId ?? "") ?? []),
      ...readLocalSupportedClubs(authUserId),
    ]);
    const record: AdminSupporterRecord = {
      id,
      fullName: String(row.full_name ?? "").trim() || "Unnamed supporter",
      email: email || "No email",
      supporterId: String(row.id),
      authUserId,
      teams,
      fundedProjects: [],
      p4p: [],
      matchrav: [],
      status: "on-platform",
    };
    record.status = markStatus(record);
    supporterMap.set(compactAdminKey(email || String(row.id)), record);
  }

  for (const row of ledger.participants.filter((item) => item.role === "supporter")) {
    const existing =
      supporterFor(row.email) ||
      supporterFor(row.id) ||
      supporterMap.get(compactAdminKey(row.email || row.id));
    if (existing) {
      existing.teams = uniqueClubNames([...existing.teams, ...(row.teams ?? [])]);
      continue;
    }
    const record: AdminSupporterRecord = {
      id: row.id,
      fullName: row.displayName,
      email: row.email,
      teams: uniqueClubNames(row.teams ?? []),
      fundedProjects: [],
      p4p: [],
      matchrav: [],
      status: "on-platform",
    };
    record.status = markStatus(record);
    supporterMap.set(compactAdminKey(row.email || row.id), record);
  }

  function supporterFor(key: string | null | undefined) {
    const compact = compactAdminKey(key);
    if (!compact) return null;
    for (const row of supporterMap.values()) {
      if (
        compactAdminKey(row.email) === compact ||
        compactAdminKey(row.supporterId) === compact ||
        compactAdminKey(row.authUserId) === compact ||
        compactAdminKey(row.id) === compact
      ) {
        return row;
      }
    }
    return null;
  }

  for (const row of ledger.funds) {
    const fan = supporterFor(row.supporterKey);
    if (!fan) continue;
    fan.fundedProjects = [
      ...fan.fundedProjects,
      { clubName: row.clubName, projectName: row.projectName, gbp: row.gbp },
    ];
  }
  for (const row of allocations) {
    const fan = supporterFor(row.fanId);
    if (!fan) continue;
    fan.fundedProjects.push({
      clubName: row.clubName,
      projectName: row.projectName,
      gbp: row.amountGbp,
    });
  }
  for (const row of predictions) {
    const fan = supporterFor(row.fanId);
    if (!fan) continue;
    fan.p4p.push({
      clubName: row.clubName,
      fixtureName: row.fixtureName,
      projectName: row.projectName,
    });
  }
  for (const row of ledger.p4p) {
    const fan = supporterFor(row.supporterKey);
    if (!fan) continue;
    fan.p4p.push({
      clubName: row.clubName,
      fixtureName: row.fixtureName,
      projectName: row.projectName,
    });
  }
  for (const trip of trips) {
    const fan = supporterFor(trip.fanKey);
    if (!fan) continue;
    fan.matchrav.push({
      clubName: trip.club,
      fixtureName: trip.fixtureName,
      kg: trip.totalKg,
    });
  }
  for (const row of ledger.matchrav) {
    const fan = supporterFor(row.supporterKey);
    if (!fan) continue;
    fan.matchrav.push({
      clubName: row.clubName,
      fixtureName: row.fixtureName,
      kg: row.kg,
    });
  }

  snapshot.supporters = [...supporterMap.values()].sort((left, right) =>
    left.fullName.localeCompare(right.fullName)
  );

  const listings = loadSponsorDirectory();
  const sponsorMap = new Map<string, AdminSponsorAccount>();

  function upsertSponsor(row: Omit<AdminSponsorAccount, "status">) {
    const key = compactAdminKey(row.brandName || row.email);
    const existing = sponsorMap.get(key);
    if (existing) {
      existing.teams = uniqueClubNames([...existing.teams, ...row.teams]);
      existing.projectLog = [...existing.projectLog, ...row.projectLog];
      if (!existing.email && row.email) existing.email = row.email;
      if (!existing.contactName && row.contactName) existing.contactName = row.contactName;
      return;
    }
    const next: AdminSponsorAccount = { ...row, status: "on-platform" };
    next.status = markStatus(next);
    sponsorMap.set(key, next);
  }

  for (const row of sponsors.data ?? []) {
    const brandName = String(row.name ?? "").trim() || "Unnamed brand";
    const listing = listings.find((item) => keysMatch(item.brandName, brandName));
    const role = sponsorRole({
      brandName,
      jobTitle: String(row.industry ?? ""),
      listingKind: listing?.kind,
    });
    upsertSponsor({
      id: adminParticipantId(role, brandName),
      role,
      brandName,
      contactName: String(row.website ?? "").trim() || listing?.contactName || "No contact name",
      email: listing?.email || "",
      sponsorId: String(row.id),
      teams: uniqueClubNames([String(row.club_name ?? "")]),
      projectLog: projectLogForBrand(brandName),
    });
  }

  for (const listing of listings) {
    const role = listing.kind === "local" ? "local" : "lead";
    upsertSponsor({
      id: adminParticipantId(role, listing.brandName),
      role,
      brandName: listing.brandName,
      contactName: listing.contactName,
      email: listing.email,
      teams: [],
      projectLog: projectLogForBrand(listing.brandName),
    });
  }

  for (const local of allLocalSponsors()) {
    upsertSponsor({
      id: adminParticipantId("local", local.brandName),
      role: "local",
      brandName: local.brandName,
      contactName: local.signerName || "",
      email: local.email,
      teams: uniqueClubNames([local.clubName]),
      projectLog: projectLogForBrand(local.brandName),
    });
  }

  for (const entry of listLeadProjectFolders()) {
    upsertSponsor({
      id: adminParticipantId("lead", entry.brandName),
      role: "lead",
      brandName: entry.brandName,
      contactName: entry.signerName,
      email: "",
      teams: uniqueClubNames([entry.clubName]),
      projectLog: projectLogForBrand(entry.brandName),
    });
  }

  for (const row of ledger.participants.filter(
    (item) => item.role === "lead" || item.role === "local"
  )) {
    upsertSponsor({
      id: row.id,
      role: row.role,
      brandName: row.brandName || row.displayName,
      contactName: row.displayName,
      email: row.email,
      teams: uniqueClubNames(row.teams ?? (row.clubName ? [row.clubName] : [])),
      projectLog: projectLogForBrand(row.brandName || row.displayName),
    });
  }

  const accounts = [...sponsorMap.values()];
  snapshot.lead = accounts
    .filter((row) => row.role === "lead")
    .sort((left, right) => left.brandName.localeCompare(right.brandName));
  snapshot.local = accounts
    .filter((row) => row.role === "local")
    .sort((left, right) => left.brandName.localeCompare(right.brandName));

  return snapshot;
}

export async function setAdminParticipantPresence(input: {
  id: string;
  role: "club" | "supporter" | "lead" | "local";
  keep: boolean;
  email?: string;
  brandName?: string;
  directorId?: string;
  supporterId?: string;
  sponsorId?: string;
}) {
  const removed = readAdminRemoved();
  if (input.keep) {
    writeAdminRemoved({
      ids: removed.ids.filter((id) => id !== input.id),
      emails: removed.emails.filter(
        (email) => email !== String(input.email ?? "").trim().toLowerCase()
      ),
      brands: removed.brands.filter(
        (brand) => brand !== compactAdminKey(input.brandName)
      ),
    });
    return;
  }

  writeAdminRemoved({
    ids: [...removed.ids, input.id],
    emails: [
      ...removed.emails,
      String(input.email ?? "").trim().toLowerCase(),
    ].filter(Boolean),
    brands: [...removed.brands, compactAdminKey(input.brandName)].filter(Boolean),
  });

  try {
    if (input.supporterId) {
      await supabase.from("supporters").delete().eq("id", input.supporterId);
    }
    if (input.directorId) {
      await supabase.from("club_accounts").delete().eq("id", input.directorId);
    }
    if (input.sponsorId) {
      await supabase.from("sponsors").delete().eq("id", input.sponsorId);
    }
  } catch {
    // Local removal still hides the record if database delete is blocked.
  }
}

export {
  recordAdminFanFund,
  recordAdminMatchrav,
  recordAdminP4p,
  recordAdminParticipant,
};
