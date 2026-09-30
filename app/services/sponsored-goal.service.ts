import { supabase } from "../lib/supabase";
import { seasonNamesMatch } from "../lib/current-season";
import { createNotification } from "./notifications.service";
import { createScoreEvent } from "./score-event.service";
import { updateFixtureScore } from "./fixtures.service";
import { creditLeadWalletsForSponsoredGoal } from "./sponsor-wallet.service";
import {
  DEFAULT_LEAD_GOAL_SPONSOR,
  DEFAULT_LEAD_GBP_PER_GOAL,
  goalScoreline,
  recordFanGoalAlert,
  type FanGoalAlert,
  type SponsoredGoalResult,
} from "../lib/sponsored-goal";

type FixtureRow = {
  id: string;
  fixture_date: string | null;
  home_score: number | null;
  away_score: number | null;
  home_club_id: string;
  away_club_id: string;
  home_club?: { name?: string } | null;
  away_club?: { name?: string } | null;
};

export async function findUpcomingClubFixture(clubName: string) {
  const { data, error } = await supabase
    .from("fixtures")
    .select(
      `
      id,
      fixture_date,
      home_score,
      away_score,
      home_club_id,
      away_club_id,
      home_club:clubs!fixtures_home_club_id_fkey(name),
      away_club:clubs!fixtures_away_club_id_fkey(name)
    `
    )
    .order("fixture_date", { ascending: true });
  if (error) throw error;

  const today = new Date().toISOString().slice(0, 10);
  const matches = ((data ?? []) as FixtureRow[]).filter((row) => {
    const home = String(row.home_club?.name ?? "");
    const away = String(row.away_club?.name ?? "");
    return seasonNamesMatch(home, clubName) || seasonNamesMatch(away, clubName);
  });
  const upcoming =
    matches.find((row) => String(row.fixture_date ?? "") >= today) ?? matches[0];
  return upcoming ?? null;
}

export async function countImpactMoments(): Promise<number> {
  const { count, error } = await supabase
    .from("score_events")
    .select("*", { count: "exact", head: true });
  if (error) return 0;
  return Number(count) || 0;
}

async function insertScoreEvent({
  fixtureId,
  clubId,
  scorerName,
  minute,
}: {
  fixtureId: string;
  clubId: string;
  scorerName: string;
  minute: number;
}) {
  try {
    return await createScoreEvent({
      fixtureId,
      clubId,
      scoreType: "Goal",
      scorerName,
      minute,
    });
  } catch {
    const { data, error } = await supabase
      .from("score_events")
      .insert([
        {
          fixture_id: fixtureId,
          club_id: clubId,
          score_type: "Goal",
          scorer_name: scorerName,
          minute,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

async function alertClubFans({
  clubId,
  clubName,
  fixtureId,
  message,
  title,
}: {
  clubId: string;
  clubName: string;
  fixtureId: string;
  message: string;
  title: string;
}) {
  await createNotification({
    title,
    message,
    clubId,
    fixtureId,
  }).catch(() => null);

  const ids = new Set<string>();

  const { data: supporters } = await supabase
    .from("supporters")
    .select("id, auth_user_id, favourite_club_id, clubs(name)");
  for (const row of supporters ?? []) {
    const club = String(
      (row as { clubs?: { name?: string } | null }).clubs?.name ?? ""
    );
    const favouriteId = String(
      (row as { favourite_club_id?: string | null }).favourite_club_id ?? ""
    );
    if (
      favouriteId === clubId ||
      seasonNamesMatch(club, clubName) ||
      seasonNamesMatch(favouriteId, clubName)
    ) {
      ids.add(String(row.id));
    }
  }

  const { data: prefs } = await supabase
    .from("supporter_preferences")
    .select("user_id, club");
  for (const pref of prefs ?? []) {
    if (seasonNamesMatch(String(pref.club ?? ""), clubName) && pref.user_id) {
      ids.add(String(pref.user_id));
    }
  }

  const { data: linked } = await supabase
    .from("supporter_clubs")
    .select("supporter_id, clubs(name)");
  for (const row of linked ?? []) {
    const club = String(
      (row as { clubs?: { name?: string } | null }).clubs?.name ?? ""
    );
    if (seasonNamesMatch(club, clubName) && row.supporter_id) {
      ids.add(String(row.supporter_id));
    }
  }

  return ids.size;
}

export async function recordSponsoredGoal({
  clubName = "Arsenal",
  scorerName = "Simulated Goal",
  minute = 23,
  brandName = DEFAULT_LEAD_GOAL_SPONSOR,
  amountGbp = DEFAULT_LEAD_GBP_PER_GOAL,
}: {
  clubName?: string;
  scorerName?: string;
  minute?: number;
  brandName?: string;
  amountGbp?: number;
} = {}): Promise<SponsoredGoalResult> {
  const fixture = await findUpcomingClubFixture(clubName);
  if (!fixture) {
    throw new Error(`No upcoming fixture found for ${clubName}.`);
  }

  const homeName = String(fixture.home_club?.name ?? "Home");
  const awayName = String(fixture.away_club?.name ?? "Away");
  const scoringIsHome = seasonNamesMatch(homeName, clubName);
  const clubId = scoringIsHome ? fixture.home_club_id : fixture.away_club_id;
  const scoringName = scoringIsHome ? homeName : awayName;
  const opponentName = scoringIsHome ? awayName : homeName;
  const homeScore = Math.max(0, Math.round(Number(fixture.home_score) || 0));
  const awayScore = Math.max(0, Math.round(Number(fixture.away_score) || 0));
  const nextHome = scoringIsHome ? homeScore + 1 : homeScore;
  const nextAway = scoringIsHome ? awayScore : awayScore + 1;

  const scoreEvent = await insertScoreEvent({
    fixtureId: fixture.id,
    clubId,
    scorerName,
    minute,
  });

  try {
    await updateFixtureScore({
      fixtureId: fixture.id,
      homeScore: nextHome,
      awayScore: nextAway,
      clubId,
    });
  } catch {
    await supabase
      .from("fixtures")
      .update({ home_score: nextHome, away_score: nextAway, status: "live" })
      .eq("id", fixture.id);
  }

  const alertedFans = await alertClubFans({
    clubId,
    clubName: scoringName,
    fixtureId: fixture.id,
    title: `GOAL! ${scoringName} scored`,
    message: `${scoringName} scored against ${opponentName}. ${brandName} has released £${amountGbp.toLocaleString("en-GB")} Goals-scored sponsorship into the Carbon Wallet.`,
  });

  return {
    fixtureId: fixture.id,
    clubId,
    clubName: scoringName,
    opponentName,
    fixtureDate: String(fixture.fixture_date ?? ""),
    homeName,
    awayName,
    homeScore: nextHome,
    awayScore: nextAway,
    scoreEventId: String(scoreEvent.id),
    brandName,
    amountGbp,
    alertedFans,
  };
}

export async function runClientSponsoredGoal(
  clubName = "Arsenal"
): Promise<{
  scored: SponsoredGoalResult;
  wallets: ReturnType<typeof creditLeadWalletsForSponsoredGoal>;
  alert: FanGoalAlert;
}> {
  const scored = await recordSponsoredGoal({ clubName });
  const wallets = creditLeadWalletsForSponsoredGoal({
    clubName: scored.clubName,
    brandName: scored.brandName,
    gbpPerGoal: scored.amountGbp,
  });
  const alert = recordFanGoalAlert({
    clubName: scored.clubName,
    opponentName: scored.opponentName,
    fixtureDate: scored.fixtureDate,
    scoreline: goalScoreline(scored),
    brandName: scored.brandName,
    amountGbp: scored.amountGbp,
    at: new Date().toISOString(),
  });
  return { scored, wallets, alert };
}

export async function loadLatestGoalAlerts(
  clubNames: string[]
): Promise<FanGoalAlert[]> {
  if (clubNames.length === 0) return [];
  const { data, error } = await supabase
    .from("notifications")
    .select("title, message, created_at, clubs(name)")
    .order("created_at", { ascending: false })
    .limit(20);
  if (error || !data) return [];

  return data.flatMap((row) => {
    const club = String(
      (row as { clubs?: { name?: string } | null }).clubs?.name ?? ""
    );
    if (!clubNames.some((name) => seasonNamesMatch(club, name))) return [];
    const title = String((row as { title?: string }).title ?? "");
    if (!/goal/i.test(title)) return [];
    const message = String((row as { message?: string }).message ?? "");
    const amountMatch = message.match(/£([\d,]+)/);
    return [
      {
        clubName: club,
        opponentName: "",
        fixtureDate: "",
        scoreline: title.replace(/^GOAL!\s*/i, ""),
        brandName: DEFAULT_LEAD_GOAL_SPONSOR,
        amountGbp: amountMatch
          ? Number(amountMatch[1].replace(/,/g, "")) || DEFAULT_LEAD_GBP_PER_GOAL
          : DEFAULT_LEAD_GBP_PER_GOAL,
        at: String((row as { created_at?: string }).created_at ?? ""),
      } satisfies FanGoalAlert,
    ];
  });
}
