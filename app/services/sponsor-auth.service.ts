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
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        company_name: companyName,
        contact_name: contactName,
        role: "sponsor",
      },
    },
  });

  if (error) throw error;

  return data;
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

  return data;
}