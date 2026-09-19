import { supabase } from "../lib/supabase";
import type { RegisteredFan } from "../lib/s4p-admin";

export async function getSupporters() {
  const { data, error } = await supabase
    .from("supporters")
    .select(`
      *,
      clubs(name)
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
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

export async function getFanRegistrationsForStaff(): Promise<{
  fans: RegisteredFan[];
  memberships: RegisteredFan[];
}> {
  const { data, error } = await supabase
    .from("supporters")
    .select("id, full_name, email, auth_user_id, favourite_club_id, clubs(name)")
    .order("full_name");

  if (error) throw error;

  const fans = (data ?? []).map((row) =>
    mapFanRow(row as Parameters<typeof mapFanRow>[0])
  );
  const memberships = await expandFanClubMemberships(fans);
  return { fans, memberships };
}

async function expandFanClubMemberships(
  fans: RegisteredFan[]
): Promise<RegisteredFan[]> {
  const userIds = fans
    .map((fan) => fan.authUserId)
    .filter((id): id is string => Boolean(id));
  if (userIds.length === 0) return fans;

  const { data, error } = await supabase
    .from("supporter_preferences")
    .select("user_id, club")
    .in("user_id", userIds);

  if (error || !data?.length) return fans;

  const clubsByUser = new Map<string, Set<string>>();
  for (const row of data) {
    const userId = String(row.user_id ?? "");
    const clubName = String(row.club ?? "").trim();
    if (!userId || !clubName) continue;
    const clubs = clubsByUser.get(userId) ?? new Set<string>();
    clubs.add(clubName);
    clubsByUser.set(userId, clubs);
  }

  const memberships: RegisteredFan[] = [];
  for (const fan of fans) {
    const extra = fan.authUserId ? clubsByUser.get(fan.authUserId) : undefined;
    if (!extra || extra.size === 0) {
      memberships.push(fan);
      continue;
    }
    for (const clubName of extra) {
      memberships.push({ ...fan, clubName });
    }
  }
  return memberships.length > 0 ? memberships : fans;
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
