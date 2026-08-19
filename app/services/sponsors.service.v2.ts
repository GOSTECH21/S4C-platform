import { supabase } from "../lib/supabase";
export async function getCurrentSponsor() {

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;

  if (!user) {
    throw new Error("User not authenticated.");
  }

  const { data, error } = await supabase
    .from("sponsors")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) throw error;

  return data;
}