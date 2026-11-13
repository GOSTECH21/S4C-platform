import { supabase } from "../lib/supabase";
import { resolvedFullName } from "../lib/s4p-admin";
import { identifySignedInKind } from "./signed-in-role.service";
import { isFanFacingKind } from "../lib/signed-in-role";

export type Supporter = {
  id: string;
  full_name: string | null;
  email: string | null;
  auth_user_id: string | null;
  favourite_club_id?: string | null;
};

function metadataFullName(user: {
  email?: string | null;
  user_metadata?: { full_name?: string; first_name?: string; last_name?: string };
}) {
  const meta = user.user_metadata;
  const combined = `${meta?.first_name ?? ""} ${meta?.last_name ?? ""}`.trim();
  return meta?.full_name?.trim() || combined || undefined;
}

async function supporterWithResolvedName(
  row: Supporter,
  user: {
    email?: string | null;
    user_metadata?: { full_name?: string; first_name?: string; last_name?: string };
  }
): Promise<Supporter> {
  const fullName = resolvedFullName(
    row.full_name,
    row.email ?? user.email,
    metadataFullName(user)
  );
  if (!fullName || fullName === row.full_name) return row;
  await supabase.from("supporters").update({ full_name: fullName }).eq("id", row.id);
  return { ...row, full_name: fullName };
}

/**
 * Resolve the supporter row for the currently authenticated user, creating a
 * minimal one on first use. Registration only creates a `profiles` row, so a
 * fan may not yet have a `supporters` record when they first vote.
 *
 * Kept off `votes.service` so fan login / P4P do not pull the published
 * fixture catalogue into the phone's JavaScript bundle.
 */
export async function getOrCreateSupporter(): Promise<Supporter | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const kind = await identifySignedInKind();
  if (kind && !isFanFacingKind(kind)) return null;

  const byAuthId = await supabase
    .from("supporters")
    .select("id, full_name, email, auth_user_id, favourite_club_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (byAuthId.data) return supporterWithResolvedName(byAuthId.data, user);

  if (user.email) {
    const byEmail = await supabase
      .from("supporters")
      .select("id, full_name, email, auth_user_id, favourite_club_id")
      .eq("email", user.email)
      .maybeSingle();

    if (byEmail.data) {
      if (!byEmail.data.auth_user_id) {
        await supabase
          .from("supporters")
          .update({ auth_user_id: user.id })
          .eq("id", byEmail.data.id);
      }
      return supporterWithResolvedName(
        { ...byEmail.data, auth_user_id: user.id },
        user
      );
    }
  }

  const created = await supabase
    .from("supporters")
    .insert({
      full_name: metadataFullName(user) || "Supporter",
      email: user.email,
      auth_user_id: user.id,
      notification_enabled: true,
    })
    .select("id, full_name, email, auth_user_id, favourite_club_id")
    .single();

  if (created.error) throw created.error;

  return created.data;
}
