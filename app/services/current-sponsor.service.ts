import { supabase } from "../lib/supabase";
import { isRemovedSponsorIdentity } from "../lib/climate-sponsors";

export async function getCurrentSponsor() {
  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

if (authError) {
  throw authError;
}

    if (!user) {
    throw new Error("You must be signed in.");
  }

  // Find sponsor linked to this user
  const { data: sponsor, error: sponsorError } = await supabase
    .from("sponsors")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (sponsorError) {
    throw sponsorError;
  }

  if (!sponsor) {
    throw new Error("Sponsor profile not found.");
  }
  if (
    isRemovedSponsorIdentity(
      String((sponsor as { website?: string }).website ?? ""),
      user.email,
      String(user.user_metadata?.full_name ?? "")
    )
  ) {
    throw new Error("This sponsor account has been removed from the platform.");
  }
  return sponsor;
}

/** Local Business sessions often live in the browser profile if Supabase is slow or signed-out. */
export async function getCurrentSponsorWithTimeout(ms = 4000) {
  return Promise.race([
    getCurrentSponsor(),
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Sponsor session timed out.")), ms);
    }),
  ]);
}