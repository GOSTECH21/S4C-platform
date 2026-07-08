import { supabase } from "../lib/supabase";

export async function getSports() {
  const { data, error } = await supabase
    .from("sports")
    .select("*")
    .order("name");

  if (error) throw error;

  return data;
}

export async function createSport(name: string) {
  const { data, error } = await supabase
    .from("sports")
    .insert([{ name }])
    .select();

  if (error) throw error;

  return data;
}