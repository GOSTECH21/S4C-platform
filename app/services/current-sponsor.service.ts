import { supabase } from "../lib/supabase";

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
console.log("Authenticated User:", user.id);
console.log("Sponsor Record:", sponsor);
    return sponsor;
}