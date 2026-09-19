import { supabase } from "../lib/supabase";
import {
  kindFromProfileRole,
  type SignedInKind,
} from "../lib/signed-in-role";

export async function identifySignedInKind(): Promise<SignedInKind | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const fromProfile = kindFromProfileRole(profile?.role);
  if (fromProfile === "admin") return "admin";

  const clubByAuth = await supabase
    .from("club_accounts")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (clubByAuth.data) return "club";

  if (user.email) {
    const clubByEmail = await supabase
      .from("club_accounts")
      .select("id")
      .ilike("email", user.email)
      .limit(1)
      .maybeSingle();
    if (clubByEmail.data) return "club";
  }

  if (fromProfile === "sponsor" || fromProfile === "partner") return fromProfile;

  const supporterByAuth = await supabase
    .from("supporters")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (supporterByAuth.data) return "fan";

  if (user.email) {
    const supporterByEmail = await supabase
      .from("supporters")
      .select("id")
      .ilike("email", user.email)
      .limit(1)
      .maybeSingle();
    if (supporterByEmail.data) return "fan";
  }

  const sponsor = await supabase
    .from("sponsors")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (sponsor.data) return "sponsor";

  return fromProfile;
}

export async function requireS4PStaff(): Promise<{
  email: string | null;
  fullName: string | null;
} | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, email")
    .eq("id", user.id)
    .maybeSingle();
  if (kindFromProfileRole(profile?.role) !== "admin") return null;
  const meta = user.user_metadata as
    | { full_name?: string; first_name?: string }
    | undefined;
  return {
    email: (profile?.email as string | null) ?? user.email ?? null,
    fullName: meta?.full_name ?? meta?.first_name ?? null,
  };
}
