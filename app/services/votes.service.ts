import { supabase } from "../lib/supabase";

export type ClimateProject = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  country: string | null;
  estimated_co2: number | null;
  funding_goal: number | null;
  image_url: string | null;
  status: string | null;
};

export type Supporter = {
  id: string;
  full_name: string | null;
  email: string | null;
  auth_user_id: string | null;
};

const PROJECT_FIELDS =
  "id, name, description, category, country, estimated_co2, funding_goal, image_url, status";

/**
 * Resolve the supporter row for the currently authenticated user, creating a
 * minimal one on first use. Registration only creates a `profiles` row, so a
 * fan may not yet have a `supporters` record when they first vote.
 */
export async function getOrCreateSupporter(): Promise<Supporter | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const byAuthId = await supabase
    .from("supporters")
    .select("id, full_name, email, auth_user_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (byAuthId.data) return byAuthId.data;

  if (user.email) {
    const byEmail = await supabase
      .from("supporters")
      .select("id, full_name, email, auth_user_id")
      .eq("email", user.email)
      .maybeSingle();

    if (byEmail.data) {
      if (!byEmail.data.auth_user_id) {
        await supabase
          .from("supporters")
          .update({ auth_user_id: user.id })
          .eq("id", byEmail.data.id);
      }
      return { ...byEmail.data, auth_user_id: user.id };
    }
  }

  const created = await supabase
    .from("supporters")
    .insert({
      full_name: user.email?.split("@")[0] ?? "Supporter",
      email: user.email,
      auth_user_id: user.id,
      notification_enabled: true,
    })
    .select("id, full_name, email, auth_user_id")
    .single();

  if (created.error) throw created.error;

  return created.data;
}

/** All active climate projects supporters can vote for. */
export async function getClimateProjectsForVoting(): Promise<ClimateProject[]> {
  const { data, error } = await supabase
    .from("climate_projects")
    .select(PROJECT_FIELDS)
    .eq("status", "active")
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data ?? []) as ClimateProject[];
}

/** The set of project ids the supporter has already voted for. */
export async function getVotedProjectIds(
  supporterId: string
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("supporter_votes")
    .select("climate_project_id")
    .eq("supporter_id", supporterId);

  if (error) throw error;

  return new Set((data ?? []).map((row) => row.climate_project_id as string));
}

/** Full project records the supporter has voted for (for the My S4P page). */
export async function getVotedProjects(
  supporterId: string
): Promise<ClimateProject[]> {
  const { data, error } = await supabase
    .from("supporter_votes")
    .select(`id, created_at, climate_projects (${PROJECT_FIELDS})`)
    .eq("supporter_id", supporterId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? [])
    .map((row) => (row as unknown as { climate_projects: ClimateProject }).climate_projects)
    .filter((project): project is ClimateProject => Boolean(project));
}

export async function castVote(supporterId: string, projectId: string) {
  const { error } = await supabase
    .from("supporter_votes")
    .insert({ supporter_id: supporterId, climate_project_id: projectId });

  // 23505 = unique_violation: the supporter already voted for this project.
  if (error && error.code !== "23505") throw error;
}

export async function removeVote(supporterId: string, projectId: string) {
  const { error } = await supabase
    .from("supporter_votes")
    .delete()
    .eq("supporter_id", supporterId)
    .eq("climate_project_id", projectId);

  if (error) throw error;
}
