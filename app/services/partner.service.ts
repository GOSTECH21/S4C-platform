import { supabase } from "../lib/supabase";
import {
  FEATURED_PROJECT_NAME,
  PARTNER_MATCH_DAY_CATALOG,
  SCCAN_LOCATION_TAG,
  SCCAN_PARTNER_NAME,
  type PartnerCatalogProject,
} from "../lib/sccan-catalog";
import type { ClimateProject } from "./votes.service";

const PROJECT_FIELDS =
  "id, name, description, category, country, estimated_co2, funding_goal, image_url, status, featured, location";

const PARTNER_PROFILE_KEY = "s4p.partner.profile.";

export type PartnerProfile = {
  organisationName: string;
  contactName: string;
  website: string;
  country: string;
};

export type PartnerProjectInput = {
  name: string;
  description: string;
  category: string;
  country: string;
  estimated_co2: number;
  funding_goal: number;
};

export async function registerClimatePartner({
  organisationName,
  contactName,
  email,
  password,
  website,
  country,
}: PartnerProfile & { email: string; password: string }) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  const user = data.user;
  if (!user) throw new Error("Registration succeeded, but no user was returned.");

  const profile = await supabase.from("profiles").insert({
    id: user.id,
    email: user.email,
    role: "partner",
  });
  if (profile.error) {
    if (profile.error.code === "23505") {
      await supabase
        .from("profiles")
        .update({ role: "partner" })
        .eq("id", user.id);
    } else {
      throw profile.error;
    }
  }

  writePartnerProfile(user.id, {
    organisationName,
    contactName,
    website,
    country,
  });

  await publishSccanCatalog();
  return user;
}

export async function loginClimatePartner(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  if (data.user) {
    await supabase.from("profiles").update({ role: "partner" }).eq("id", data.user.id);
  }
  return data.user;
}

export async function loadPartnerSession(): Promise<{
  userId: string;
  email: string | null;
  profile: PartnerProfile;
} | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return {
    userId: user.id,
    email: user.email ?? null,
    profile: readPartnerProfile(user.id),
  };
}

export async function publishSccanCatalog(): Promise<ClimateProject[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return loadPublishedPartnerProjects();

  const { data: existing } = await supabase
    .from("climate_projects")
    .select("id, name")
    .in(
      "name",
      PARTNER_MATCH_DAY_CATALOG.map((project) => project.name)
    );

  const idByName = new Map(
    (existing ?? []).map((row) => [String(row.name).toLowerCase(), row.id as string])
  );

  for (const project of PARTNER_MATCH_DAY_CATALOG) {
    const payload = catalogPayload(project);
    const existingId = idByName.get(project.name.toLowerCase());
    if (existingId) {
      await supabase.from("climate_projects").update(payload).eq("id", existingId);
    } else {
      await supabase.from("climate_projects").insert(payload);
    }
  }

  return loadPublishedPartnerProjects();
}

export async function loadPublishedPartnerProjects(): Promise<ClimateProject[]> {
  const { data, error } = await supabase
    .from("climate_projects")
    .select(PROJECT_FIELDS)
    .is("club_id", null);

  if (error) throw error;

  const byName = new Map(
    ((data ?? []) as ClimateProject[]).map((project) => [
      project.name.toLowerCase(),
      project,
    ])
  );

  return PARTNER_MATCH_DAY_CATALOG.map((item) => byName.get(item.name.toLowerCase()))
    .filter((project): project is ClimateProject => Boolean(project))
    .map((project) =>
      project.name === FEATURED_PROJECT_NAME
        ? { ...project, featured: true, country: project.country || "International" }
        : project
    );
}

export async function loadPartnerLibrary(): Promise<ClimateProject[]> {
  const published = await loadPublishedPartnerProjects();
  const session = await loadPartnerSession();
  if (!session) return published;

  const { data } = await supabase
    .from("climate_projects")
    .select(PROJECT_FIELDS)
    .is("club_id", null)
    .ilike("location", `%${session.profile.organisationName}%`);

  const extra = ((data ?? []) as ClimateProject[]).filter(
    (project) =>
      !published.some((item) => item.id === project.id) &&
      !PARTNER_MATCH_DAY_CATALOG.some(
        (item) => item.name.toLowerCase() === project.name.toLowerCase()
      )
  );
  return [...published, ...extra];
}

export async function uploadPartnerProject(
  input: PartnerProjectInput
): Promise<ClimateProject> {
  const session = await loadPartnerSession();
  if (!session) throw new Error("Sign in as a Climate Partner to upload a project.");

  const { data, error } = await supabase
    .from("climate_projects")
    .insert({
      name: input.name.trim(),
      description: input.description.trim(),
      category: input.category,
      country: input.country.trim() || session.profile.country,
      location: `${session.profile.organisationName} · Climate Partner`,
      estimated_co2: input.estimated_co2,
      funding_goal: input.funding_goal,
      featured: false,
      verified: false,
      status: "active",
      club_id: null,
    })
    .select(PROJECT_FIELDS)
    .single();

  if (error) throw error;
  return data as ClimateProject;
}

function catalogPayload(project: PartnerCatalogProject) {
  return {
    name: project.name,
    description: project.description,
    category: project.category,
    country: project.country,
    location: project.location,
    estimated_co2: project.estimated_co2,
    funding_goal: project.funding_goal,
    featured: project.featured,
    verified: true,
    status: "active",
    club_id: null,
  };
}

function writePartnerProfile(userId: string, profile: PartnerProfile) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    PARTNER_PROFILE_KEY + userId,
    JSON.stringify(profile)
  );
}

function readPartnerProfile(userId: string): PartnerProfile {
  const fallback: PartnerProfile = {
    organisationName: SCCAN_PARTNER_NAME,
    contactName: "",
    website: "https://sccan.scot/",
    country: "Scotland",
  };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PARTNER_PROFILE_KEY + userId);
    if (!raw) return fallback;
    return { ...fallback, ...(JSON.parse(raw) as PartnerProfile) };
  } catch {
    return fallback;
  }
}

export { SCCAN_LOCATION_TAG };
