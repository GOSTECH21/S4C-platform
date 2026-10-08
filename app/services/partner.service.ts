import { supabase } from "../lib/supabase";
import {
  FEATURED_PROJECT_NAME,
  PARTNER_MATCH_DAY_CATALOG,
  SCCAN_LOCATION_TAG,
  type PartnerCatalogProject,
} from "../lib/sccan-catalog";
import {
  assertCanListClimateProject,
  catalogClimateImpactValue,
  civRecordFromListing,
  encodeLocationCiv,
  encodePartnerLocation,
  type ClimateProjectCivInput,
} from "../lib/climate-impact-value";
import { encodeLocationSite } from "../lib/project-site";
import {
  RETIRED_PARTNER_LISTING_NAMES,
  isRetiredPartnerListing,
  selectOwnListedProjects,
} from "../lib/partner-projects";
import type { ClimateProject } from "./votes.service";

const PROJECT_FIELDS =
  "id, name, description, category, country, estimated_co2, funding_goal, image_url, status, featured, location";

const PARTNER_PROFILE_KEY = "s4p.partner.profile.";
const PARTNER_OWN_LISTINGS_KEY = "s4p.partner.ownListings.";

export type PartnerProfile = {
  organisationName: string;
  contactName: string;
  website: string;
  country: string;
};

export type PartnerProjectInput = ClimateProjectCivInput & {
  description: string;
  category: string;
  country: string;
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

export async function loadUploadedPartnerProjects(): Promise<ClimateProject[]> {
  const { data, error } = await supabase
    .from("climate_projects")
    .select(PROJECT_FIELDS)
    .is("club_id", null)
    .order("created_at", { ascending: false });

  if (error) {
    const fallback = await supabase
      .from("climate_projects")
      .select(PROJECT_FIELDS)
      .is("club_id", null);
    if (fallback.error) throw fallback.error;
    return uniqueUploaded(fallback.data as ClimateProject[]);
  }

  return uniqueUploaded(data as ClimateProject[]);
}

function uniqueUploaded(rows: ClimateProject[]): ClimateProject[] {
  const catalogNames = new Set(
    PARTNER_MATCH_DAY_CATALOG.map((project) => project.name.toLowerCase())
  );
  const seen = new Set<string>();
  const unique: ClimateProject[] = [];
  for (const project of rows ?? []) {
    const key = project.name.toLowerCase();
    if (
      catalogNames.has(key) ||
      isFeaturedName(project.name) ||
      isRetiredPartnerListing(project.name) ||
      (project.status ?? "active") === "archived" ||
      seen.has(key)
    ) {
      continue;
    }
    seen.add(key);
    unique.push(project);
  }
  return unique;
}

function isFeaturedName(name: string | null | undefined) {
  return (name ?? "").trim().toLowerCase() === FEATURED_PROJECT_NAME.toLowerCase();
}

export async function loadPartnerLibrary(): Promise<ClimateProject[]> {
  const [published, uploaded] = await Promise.all([
    loadPublishedPartnerProjects(),
    loadUploadedPartnerProjects(),
  ]);
  const session = await loadPartnerSession();
  if (!session) return [...uploaded, ...published];
  const mine = uploaded.filter((project) =>
    selectOwnListedProjects([project], session.profile.organisationName).length > 0
  );
  const others = uploaded.filter(
    (project) => !mine.some((row) => row.id === project.id)
  );
  return [...mine, ...others, ...published];
}

function ownListingStorageKey(userId: string) {
  return PARTNER_OWN_LISTINGS_KEY + userId;
}

function readOwnListedIds(userId: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ownListingStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.map((id) => String(id)).filter(Boolean)
      : [];
  } catch {
    return [];
  }
}

export function rememberOwnListedProject(
  userId: string,
  projectId: string
) {
  if (typeof window === "undefined" || !userId || !projectId) return;
  const next = [...new Set([...readOwnListedIds(userId), projectId])];
  window.localStorage.setItem(ownListingStorageKey(userId), JSON.stringify(next));
}

async function archiveRetiredPartnerListings() {
  try {
    await supabase
      .from("climate_projects")
      .update({ status: "archived" })
      .in("name", RETIRED_PARTNER_LISTING_NAMES);
  } catch {
    // Hosted archive can fail if the row is already gone or RLS blocks it.
  }
}

export async function loadMyListedClimateProjects(): Promise<ClimateProject[]> {
  const session = await loadPartnerSession();
  if (!session) return [];
  await archiveRetiredPartnerListings();
  const uploaded = await loadUploadedPartnerProjects();
  return selectOwnListedProjects(
    uploaded,
    session.profile.organisationName,
    readOwnListedIds(session.userId)
  );
}

export async function updateListedProjectImage(
  projectId: string,
  imageUrl: string | null
) {
  const session = await loadPartnerSession();
  if (!session) throw new Error("Sign in as a Climate Partner to attach images.");
  if (!projectId) return;
  const { error } = await supabase
    .from("climate_projects")
    .update({ image_url: imageUrl })
    .eq("id", projectId);
  if (error) throw error;
}

export async function uploadPartnerProject(
  input: PartnerProjectInput
): Promise<ClimateProject> {
  const session = await loadPartnerSession();
  if (!session) throw new Error("Sign in as a Climate Partner to upload a project.");

  assertCanListClimateProject(input);
  const civ = civRecordFromListing(input);

  const { data, error } = await supabase
    .from("climate_projects")
    .insert({
      name: input.name.trim(),
      description: input.description.trim(),
      category: input.category,
      country: input.country.trim() || session.profile.country,
      location: encodePartnerLocation(session.profile.organisationName, civ, {
        postcode: input.postcode,
        address: input.address,
      }),
      estimated_co2: civ.projectedCiv,
      funding_goal: input.fundingAmountSought,
      featured: false,
      verified: /independently verified/i.test(civ.verificationStatus),
      status: "listed",
      club_id: null,
    })
    .select(PROJECT_FIELDS)
    .single();

  if (error) throw error;
  const listed = data as ClimateProject;
  rememberOwnListedProject(session.userId, listed.id);
  return listed;
}

function catalogPayload(project: PartnerCatalogProject) {
  const civ = catalogClimateImpactValue(project);
  return {
    name: project.name,
    description: project.description,
    category: project.category,
    country: project.country,
    location: encodeLocationCiv(
      encodeLocationSite(project.location, {
        postcode: project.postcode ?? "",
        address: project.address ?? "",
      }),
      civ
    ),
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
    organisationName: "",
    contactName: "",
    website: "",
    country: "",
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
