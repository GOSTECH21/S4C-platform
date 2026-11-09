import { supabase } from "../lib/supabase";
import {
  buildStaffFanProfile,
  p4pCategoryLabels,
  travelModeLabel,
  type StaffFanDonation,
  type StaffFanMatchrav,
  type StaffFanPrediction,
  type StaffFanProfile,
  type StaffFanProject,
} from "../lib/admin-fan-profile";
import type { RegisteredFan } from "../lib/s4p-admin";
import type { P4pPrediction, P4pProjectAllocation } from "../lib/predict-for-planet";
import type { MatchravTrip } from "../lib/matchrav-journey";
import {
  listP4pPredictions,
  listP4pProjectAllocations,
} from "./predict-for-planet.service";
import { listMatchravTrips } from "../lib/matchrav-journey";
import { roundGbp } from "../lib/sponsor-wallet";

type FanIdentity = {
  supporter_id: string | null;
  auth_user_id: string | null;
  email: string | null;
  fan_id: string | null;
};

function uuidOrNull(value?: string | null): string | null {
  if (!value) return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  )
    ? value
    : null;
}

async function currentFanIdentity(fanId?: string | null): Promise<FanIdentity> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let supporterId: string | null = null;
  if (user?.id) {
    const existing = await supabase
      .from("supporters")
      .select("id, email")
      .eq("auth_user_id", user.id)
      .maybeSingle();
    supporterId = existing.data?.id ? String(existing.data.id) : null;
  }
  const email = user?.email ?? null;
  return {
    supporter_id: uuidOrNull(supporterId),
    auth_user_id: user?.id ?? null,
    email,
    fan_id: String(fanId ?? email ?? supporterId ?? "").trim() || null,
  };
}

function identityFilter(fan: RegisteredFan) {
  const parts: string[] = [];
  if (uuidOrNull(fan.id)) parts.push(`supporter_id.eq.${fan.id}`);
  if (fan.authUserId) parts.push(`auth_user_id.eq.${fan.authUserId}`);
  const email = fan.email.trim();
  if (email && email !== "No email") {
    const safe = email.replace(/"/g, "");
    parts.push(`email.eq."${safe}"`);
    parts.push(`fan_id.eq."${safe}"`);
  }
  if (fan.id) parts.push(`fan_id.eq."${fan.id.replace(/"/g, "")}"`);
  return parts.join(",");
}

export async function persistStaffP4pPrediction(
  prediction: P4pPrediction,
  supporterId?: string | null
) {
  try {
    const identity = await currentFanIdentity(prediction.fanId);
    await supabase.from("fan_p4p_predictions").upsert({
      id: prediction.id,
      supporter_id: identity.supporter_id ?? uuidOrNull(supporterId),
      auth_user_id: identity.auth_user_id,
      email: identity.email,
      fan_id: identity.fan_id ?? prediction.fanId,
      club_name: prediction.clubName,
      fixture_name: prediction.fixtureName,
      window_index: prediction.windowIndex,
      category_id: prediction.categoryId,
      category_ids: prediction.categoryIds ?? [prediction.categoryId],
      project_name: prediction.projectName,
      engagement_gbp: prediction.engagementGbp,
      participation_gbp: prediction.participationGbp ?? null,
      accuracy_gbp: prediction.accuracyGbp ?? null,
      correct: prediction.correct ?? null,
      at: prediction.at,
    });
  } catch {
    // Phone P4P still saves locally if the hosted table is not live yet.
  }
}

export async function persistStaffP4pFund(
  allocation: P4pProjectAllocation,
  supporterId?: string | null
) {
  try {
    const identity = await currentFanIdentity(allocation.fanId);
    await supabase.from("fan_p4p_project_funds").upsert({
      id: allocation.id,
      supporter_id: identity.supporter_id ?? uuidOrNull(supporterId),
      auth_user_id: identity.auth_user_id,
      email: identity.email,
      fan_id: identity.fan_id ?? allocation.fanId,
      club_name: allocation.clubName,
      fixture_name: allocation.fixtureName,
      project_name: allocation.projectName,
      amount_gbp: roundGbp(allocation.amountGbp),
      at: allocation.at,
    });
  } catch {
    // Phone P4P fund still saves locally if the hosted table is not live yet.
  }
}

export async function persistStaffMatchravTrip(
  trip: MatchravTrip,
  supporterId?: string | null
) {
  try {
    const identity = await currentFanIdentity();
    await supabase.from("fan_matchrav_trips").upsert({
      id: trip.id,
      supporter_id: identity.supporter_id ?? uuidOrNull(supporterId),
      auth_user_id: identity.auth_user_id,
      email: identity.email,
      club: trip.club,
      fixture_name: trip.fixtureName,
      venue: trip.venue,
      match_date: trip.matchDate,
      origin: trip.origin,
      destination: trip.destination,
      outbound_mode: trip.outboundMode,
      return_mode: trip.returnMode,
      outbound_miles: trip.outboundMiles,
      return_miles: trip.returnMiles,
      total_kg: trip.totalKg,
      saved_vs_solo_car_kg: trip.savedVsSoloCarKg,
      status: trip.status,
      confirmed_mode: trip.confirmedMode,
      created_at: trip.createdAt,
      updated_at: trip.updatedAt,
    });
  } catch {
    // Phone Matchrav still saves locally if the hosted table is not live yet.
  }
}

export async function syncFanActivityToStaff(supporterId?: string | null) {
  const identity = await currentFanIdentity();
  const keys = [identity.supporter_id, identity.email, identity.fan_id, supporterId]
    .map((value) => String(value ?? "").trim().toLowerCase())
    .filter(Boolean);

  function mine(fanId: string) {
    if (keys.length === 0) return true;
    return keys.includes(fanId.trim().toLowerCase());
  }

  await Promise.all([
    ...listP4pPredictions()
      .filter((row) => mine(row.fanId))
      .map((row) => persistStaffP4pPrediction(row, supporterId)),
    ...listP4pProjectAllocations()
      .filter((row) => mine(row.fanId))
      .map((row) => persistStaffP4pFund(row, supporterId)),
    ...listMatchravTrips().map((row) =>
      persistStaffMatchravTrip(row, supporterId)
    ),
  ]);
}

async function loadSupporterFan(id: string): Promise<RegisteredFan | null> {
  const { data, error } = await supabase
    .from("supporters")
    .select("id, full_name, email, auth_user_id, clubs(name)")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  const club = (data as { clubs?: { name?: string } | null }).clubs;
  return {
    id: String(data.id),
    fullName: String(data.full_name ?? "").trim() || "Unnamed fan",
    email: String(data.email ?? "").trim() || "No email",
    clubName: String(club?.name ?? "").trim() || "No club selected",
    authUserId: data.auth_user_id ? String(data.auth_user_id) : null,
  };
}

async function loadPreferenceClubs(authUserId: string | null) {
  if (!authUserId) return [];
  const { data, error } = await supabase
    .from("supporter_preferences")
    .select("club")
    .eq("user_id", authUserId);
  if (error || !data) return [];
  return data
    .map((row) => String(row.club ?? "").trim())
    .filter(Boolean);
}

async function loadVotedProjects(supporterId: string): Promise<StaffFanProject[]> {
  const { data, error } = await supabase
    .from("supporter_votes")
    .select("climate_projects ( name )")
    .eq("supporter_id", supporterId);
  if (error || !data) return [];
  return data
    .map((row) => {
      const project = (
        row as { climate_projects?: { name?: string } | null }
      ).climate_projects;
      return String(project?.name ?? "").trim();
    })
    .filter(Boolean)
    .map((projectName) => ({
      projectName,
      clubName: "",
      amountGbp: null,
      source: "vote" as const,
    }));
}

async function loadWalletDonations(fan: RegisteredFan): Promise<StaffFanDonation[]> {
  const query = supabase
    .from("climate_wallet_takes")
    .select("amount_gbp, project_name, brand_name, club_name, created_at, supporter_id, auth_user_id, email")
    .or(identityFilter(fan));
  const { data, error } = await query;
  if (error || !data) return [];
  return data.map((row) => ({
    projectName: String(row.project_name ?? "").trim() || "Climate Project",
    clubName: String(row.club_name ?? "").trim(),
    brandName: String(row.brand_name ?? "").trim() || "Climate Sponsor",
    amountGbp: roundGbp(Number(row.amount_gbp) || 0),
    source: "wallet" as const,
    at: String(row.created_at ?? ""),
  }));
}

async function loadP4pFunds(fan: RegisteredFan): Promise<StaffFanDonation[]> {
  const { data, error } = await supabase
    .from("fan_p4p_project_funds")
    .select("project_name, club_name, amount_gbp, at, fixture_name")
    .or(identityFilter(fan));
  if (error || !data) return [];
  return data.map((row) => ({
    projectName: String(row.project_name ?? "").trim() || "Climate Project",
    clubName: String(row.club_name ?? "").trim(),
    brandName: "P4P",
    amountGbp: roundGbp(Number(row.amount_gbp) || 0),
    source: "p4p" as const,
    at: String(row.at ?? ""),
  }));
}

async function loadPredictions(fan: RegisteredFan): Promise<StaffFanPrediction[]> {
  const { data, error } = await supabase
    .from("fan_p4p_predictions")
    .select(
      "id, club_name, fixture_name, category_id, category_ids, project_name, engagement_gbp, correct, at"
    )
    .or(identityFilter(fan))
    .order("at", { ascending: false });
  if (error || !data) return [];
  return data.map((row) => ({
    id: String(row.id),
    clubName: String(row.club_name ?? "").trim(),
    fixtureName: String(row.fixture_name ?? "").trim() || "P4P match",
    categoryLabels: p4pCategoryLabels({
      categoryId: String(row.category_id ?? ""),
      categoryIds: Array.isArray(row.category_ids)
        ? row.category_ids.map((id) => String(id))
        : [],
    }),
    projectName: String(row.project_name ?? "").trim(),
    engagementGbp: roundGbp(Number(row.engagement_gbp) || 0),
    correct:
      row.correct === true ? true : row.correct === false ? false : null,
    at: String(row.at ?? ""),
  }));
}

async function loadMatchrav(fan: RegisteredFan): Promise<StaffFanMatchrav[]> {
  const { data, error } = await supabase
    .from("fan_matchrav_trips")
    .select(
      "id, club, fixture_name, origin, outbound_mode, return_mode, total_kg, status, updated_at, created_at"
    )
    .or(identityFilter(fan))
    .order("updated_at", { ascending: false });
  if (error || !data) return [];
  return data.map((row) => ({
    id: String(row.id),
    clubName: String(row.club ?? "").trim(),
    fixtureName: String(row.fixture_name ?? "").trim() || "Match journey",
    origin: String(row.origin ?? "").trim(),
    outboundMode: travelModeLabel(String(row.outbound_mode ?? "")),
    returnMode: travelModeLabel(String(row.return_mode ?? "")),
    totalKg: Number(row.total_kg) || 0,
    status: String(row.status ?? "planned"),
    at: String(row.updated_at ?? row.created_at ?? ""),
  }));
}

export async function loadStaffFanProfile(
  id: string
): Promise<StaffFanProfile | null> {
  const fan = await loadSupporterFan(id);
  if (!fan) return null;

  const [clubs, votes, walletDonations, p4pDonations, predictions, matchrav] =
    await Promise.all([
      loadPreferenceClubs(fan.authUserId ?? null),
      loadVotedProjects(fan.id),
      loadWalletDonations(fan),
      loadP4pFunds(fan),
      loadPredictions(fan),
      loadMatchrav(fan),
    ]);

  const donations = [...walletDonations, ...p4pDonations];
  const fundedNames = new Set(
    donations.map((row) => row.projectName.trim().toLowerCase())
  );
  const projects: StaffFanProject[] = [
    ...votes.filter(
      (row) => !fundedNames.has(row.projectName.trim().toLowerCase())
    ),
    ...donations.map((row) => ({
      projectName: row.projectName,
      clubName: row.clubName,
      amountGbp: row.amountGbp,
      source: row.source,
    })),
  ];

  return buildStaffFanProfile({
    fan,
    clubs,
    projects,
    donations,
    predictions,
    matchrav,
  });
}
