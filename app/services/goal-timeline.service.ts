import { supabase } from "../lib/supabase";

export async function getGoalTimeline(fixtureId: string) {
  const { data, error } = await supabase
    .from("score_events")
    .select(`
      fixture_id,
      minute,
      scorer_name,
      club_id
    `)
    .eq("fixture_id", fixtureId)
    .order("minute", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}