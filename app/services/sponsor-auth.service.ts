import { supabase } from "../lib/supabase";

export async function registerSponsor({
  companyName,
  contactName,
  jobTitle,
  email,
  password,
  logoDataUrl,
  tier = "national",
  pledgeGbp,
  clubName,
}: {
  companyName: string;
  contactName: string;
  jobTitle?: string;
  email: string;
  password: string;
  logoDataUrl?: string | null;
  tier?: "local" | "national";
  pledgeGbp?: number;
  clubName?: string;
}) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) throw authError;
  if (!authData.user) {
    throw new Error("Registration failed.");
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: authData.user.id,
    email,
    role: "sponsor",
  });
  if (profileError && profileError.code !== "23505") throw profileError;

  const payload = {
    user_id: authData.user.id,
    name: companyName,
    industry: jobTitle || "Sponsorship Manager",
    website: contactName,
    ...(logoDataUrl ? { logo_url: logoDataUrl } : {}),
  };
  const { error: sponsorError } = await supabase.from("sponsors").insert(payload);
  if (sponsorError && logoDataUrl) {
    const { error: withoutLogo } = await supabase.from("sponsors").insert({
      user_id: authData.user.id,
      name: companyName,
      industry: jobTitle || "Sponsorship Manager",
      website: contactName,
    });
    if (withoutLogo) throw withoutLogo;
  } else if (sponsorError) {
    throw sponsorError;
  }

  if (typeof window !== "undefined") {
    window.localStorage.setItem(
      "s4p.sponsor.profile",
      JSON.stringify({
        companyName,
        contactName,
        jobTitle: jobTitle || "Sponsorship Manager",
        email,
        logoDataUrl: logoDataUrl || null,
        tier,
        pledgeGbp: pledgeGbp ?? null,
        clubName: clubName ?? null,
      })
    );
  }

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