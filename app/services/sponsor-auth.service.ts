import { supabase } from "../lib/supabase";

export async function registerSponsor({
  companyName,
  contactName,
  email,
  password,
}: {
  companyName: string;
  contactName: string;
  email: string;
  password: string;
}) {
  // Create authentication account
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) throw authError;

  if (!authData.user) {
    throw new Error("Registration failed.");
  }

  // Create sponsor profile
  const { error: sponsorError } = await supabase
    .from("sponsors")
    .insert({
      user_id: authData.user.id,
      name: companyName,
      industry: "",
      website: "",
    });

  if (sponsorError) throw sponsorError;

  return authData.user;
}

export async function loginSponsor({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  return data.user;
}

export async function logoutSponsor() {
  const { error } = await supabase.auth.signOut();

  if (error) throw error;
}

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;

  return user;
}