import { supabase } from "../lib/supabase";
import {
  clubNameFromSources,
  expandFanClubMemberships,
  type RegisteredFan,
} from "../lib/s4p-admin";

export async function getSupporters() {
  const { data, error } = await supabase
    .from("supporters")
    .select(`
      *,
      clubs(name)
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data ?? [];
}

function mapFanRow(row: {
  id?: unknown;
  full_name?: unknown;
  email?: unknown;
  auth_user_id?: unknown;
  clubs?: { name?: string } | null;
}): RegisteredFan {
  const club = row.clubs;
  return {
    id: String(row.id),
    fullName: String(row.full_name ?? "").trim() || "Unnamed fan",
    email: String(row.email ?? "").trim() || "No email",
    clubName: String(club?.name ?? "").trim() || "No club selected",
    authUserId: row.auth_user_id ? String(row.auth_user_id) : null,
  };
}

async function loadPreferenceClubsByUser(): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  const { data, error } = await supabase
    .from("supporter_preferences")
    .select("user_id, club");
  if (error || !data) return map;
  for (const row of data) {
    const userId = String(row.user_id ?? "").trim();
    const club = String(row.club ?? "").trim();
    if (!userId || !club) continue;
    const list = map.get(userId) ?? [];
    if (!list.some((name) => name.toLowerCase() === club.toLowerCase())) {
      list.push(club);
    }
    map.set(userId, list);
  }
  return map;
}

export async function getFanRegistrationsForStaff(): Promise<{
  fans: RegisteredFan[];
  memberships: RegisteredFan[];
}> {
  const { data, error } = await supabase
    .from("supporters")
    .select("id, full_name, email, auth_user_id, favourite_club_id, clubs(name)")
    .order("full_name");

  if (error) throw error;

  const prefsByUser = await loadPreferenceClubsByUser();
  const fans = (data ?? []).map((row) => {
    const mapped = mapFanRow(row as Parameters<typeof mapFanRow>[0]);
    const preferenceClubs = mapped.authUserId
      ? prefsByUser.get(mapped.authUserId) ?? []
      : [];
    return {
      ...mapped,
      clubName: clubNameFromSources({
        joinedClubName: mapped.clubName,
        preferenceClubs,
      }),
    };
  });

  return {
    fans,
    memberships: expandFanClubMemberships(fans, prefsByUser),
  };
}

export async function createSupporter({
  fullName,
  email,
  favouriteClubId,
  country,
  city,
}: {
  fullName: string;
  email: string;
  favouriteClubId: string;
  country: string;
  city: string;
}) {
  const { data, error } = await supabase
    .from("supporters")
    .insert([
      {
        full_name: fullName,
        email,
        favourite_club_id: favouriteClubId,
        country,
        city,
        notification_enabled: true,
      },
    ])
    .select();

  if (error) throw error;

  return data;
}
