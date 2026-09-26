import { supabase } from "../lib/supabase";
import {
  compactIdentity,
  emailKey,
  staffFanRoster,
  storedFullName,
  uniqueClubNames,
  type RegisteredFan,
} from "../lib/s4p-admin";
import { getFanRegistrationsForStaff } from "./supporters.service";
import { clubsForBrandFromLocalStores } from "./climate-sponsors.service";

export type StaffDirector = {
  id: string;
  fullName: string;
  email: string;
  clubName: string;
};

export type StaffSponsor = {
  id: string;
  brandName: string;
  contactName: string;
  jobTitle: string;
  email: string | null;
  userId: string | null;
  clubNames: string[];
};

export async function loadStaffParticipantRoster() {
  const { fans } = await getFanRegistrationsForStaff();

  const directors = await supabase
    .from("club_accounts")
    .select("id, first_name, last_name, email, auth_user_id, clubs(name)")
    .order("last_name");

  const sponsors = await supabase
    .from("sponsors")
    .select("id, name, website, industry, user_id")
    .not("user_id", "is", null)
    .order("name");

  const mappedDirectors: StaffDirector[] = (directors.data ?? []).map((row) => {
    const club = (row as { clubs?: { name?: string } | null }).clubs;
    return {
      id: String(row.id),
      fullName:
        storedFullName(
          String(row.first_name ?? ""),
          String(row.last_name ?? "")
        ) || "Unnamed director",
      email: String(row.email ?? "").trim() || "No email",
      clubName: String(club?.name ?? "").trim() || "No club selected",
    };
  });

  const mappedSponsorsBase = (sponsors.data ?? []).map((row) => ({
    id: String(row.id),
    brandName: String(row.name ?? "").trim() || "Unnamed brand",
    contactName: String(row.website ?? "").trim() || "No contact name",
    jobTitle: String(row.industry ?? "").trim() || "Sponsorship Manager",
    email: null as string | null,
    userId: row.user_id ? String(row.user_id) : null,
  }));

  const networkRows = await supabase
    .from("sponsor_club_network")
    .select("brand_name, club_name, email");

  const clubsFromDb = new Map<string, string[]>();
  for (const row of networkRows.data ?? []) {
    const brand = String(row.brand_name ?? "").trim();
    const club = String(row.club_name ?? "").trim();
    if (!brand || !club) continue;
    const list = clubsFromDb.get(compactIdentity(brand)) ?? [];
    list.push(club);
    clubsFromDb.set(compactIdentity(brand), list);
  }

  const networkMissing =
    networkRows.error?.code === "PGRST205" ||
    /could not find the table/i.test(networkRows.error?.message ?? "");

  const mappedSponsors: StaffSponsor[] = mappedSponsorsBase.map((row) => {
    const fromDb = clubsFromDb.get(compactIdentity(row.brandName)) ?? [];
    const fromLocal = clubsForBrandFromLocalStores(row.brandName, row.email);
    return {
      ...row,
      clubNames: uniqueClubNames([...fromDb, ...fromLocal]),
    };
  });

  const excluded = {
    emails: [
      ...mappedDirectors.map((row) => emailKey(row.email)),
      ...mappedSponsors.map((row) => emailKey(row.email)).filter(Boolean),
    ],
    authUserIds: mappedSponsors
      .map((row) => row.userId)
      .filter((id): id is string => Boolean(id)),
    contactKeys: [
      ...mappedDirectors.map((row) => compactIdentity(row.fullName)),
      ...mappedSponsors.map((row) => compactIdentity(row.contactName)),
    ].filter((key) => key.length >= 6),
  };

  const fanRoster = staffFanRoster(fans, excluded);

  return {
    fans: fanRoster,
    memberships: fanRoster,
    directors: mappedDirectors,
    sponsors: mappedSponsors,
    directorError: directors.error?.message ?? null,
    sponsorError: sponsors.error?.message ?? (networkMissing ? null : networkRows.error?.message ?? null),
  };
}

export type { RegisteredFan };
