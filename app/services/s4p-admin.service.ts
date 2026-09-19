import { supabase } from "../lib/supabase";
import { storedFullName, type RegisteredFan } from "../lib/s4p-admin";
import { getFanRegistrationsForStaff } from "./supporters.service";

export async function loadStaffParticipantRoster() {
  const { fans, memberships } = await getFanRegistrationsForStaff();

  const directors = await supabase
    .from("club_accounts")
    .select("id, first_name, last_name, email, clubs(name)")
    .order("last_name");

  const sponsors = await supabase
    .from("sponsors")
    .select("id, name, website, industry")
    .order("name");

  return {
    fans,
    memberships,
    directors: (directors.data ?? []).map((row) => {
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
    }),
    sponsors: (sponsors.data ?? []).map((row) => ({
      id: String(row.id),
      brandName: String(row.name ?? "").trim() || "Unnamed brand",
      contactName: String(row.website ?? "").trim() || "No contact name",
      jobTitle: String(row.industry ?? "").trim() || "Sponsorship Manager",
    })),
    directorError: directors.error?.message ?? null,
    sponsorError: sponsors.error?.message ?? null,
  };
}

export type { RegisteredFan };
