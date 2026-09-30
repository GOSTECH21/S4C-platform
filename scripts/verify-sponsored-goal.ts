import { readFileSync } from "fs";
import {
  createLeadWallet,
  remainingGbp,
} from "../app/lib/sponsor-wallet";
import {
  alertsForClub,
  clubNamesMatchForGoal,
  creditLeadWalletForGoal,
  DEFAULT_LEAD_GBP_PER_GOAL,
  DEFAULT_LEAD_GOAL_SPONSOR,
  FAN_GOAL_ALERTS_STORAGE,
  goalScoreline,
  leadWalletIncreaseGbp,
  mergeFanGoalAlerts,
  recordFanGoalAlert,
  SPONSORED_GOAL_EVENT,
} from "../app/lib/sponsored-goal";
import { currentSeasonTeamCount } from "../app/lib/current-season";
import { mergePlatformStats } from "../app/lib/platform-stats";

const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(
  currentSeasonTeamCount() === 200,
  "The Sports Teams window must be exactly 200 unique 2026/27 clubs"
);
assert(
  mergePlatformStats({ sportsTeams: 221 }).sportsTeams === 200,
  "Leftover duplicate club rows must not become the Sports Teams count"
);
assert(
  clubNamesMatchForGoal("Arsenal FC", "Arsenal"),
  "Arsenal FC on a fixture matches the catalog club Arsenal"
);

const wallet = createLeadWallet({
  clubName: "Arsenal",
  brandName: DEFAULT_LEAD_GOAL_SPONSOR,
  commitmentFeeGbp: 3000,
  gbpPerGoal: DEFAULT_LEAD_GBP_PER_GOAL,
});
assert(remainingGbp(wallet) === 3000, "Lead wallet starts at the Commitment Fee");
assert(
  leadWalletIncreaseGbp(wallet) === DEFAULT_LEAD_GBP_PER_GOAL,
  "A sponsored goal releases the agreed £/Goal into the Lead wallet"
);
assert(
  remainingGbp(creditLeadWalletForGoal(wallet)) === 6000,
  "After one Arsenal goal the Lead Carbon Wallet holds £6,000"
);

const localAlerts = [
  {
    clubName: "Arsenal FC",
    opponentName: "Chelsea",
    fixtureDate: "2026-10-09",
    scoreline: "Arsenal FC 1 - 0 Chelsea",
    brandName: DEFAULT_LEAD_GOAL_SPONSOR,
    amountGbp: DEFAULT_LEAD_GBP_PER_GOAL,
    at: "2026-10-09T15:23:00.000Z",
  },
];
assert(
  mergeFanGoalAlerts(localAlerts, localAlerts).length === 1,
  "Duplicate Arsenal goal alerts collapse to one banner"
);

assert(
  goalScoreline({
    homeName: "Arsenal FC",
    homeScore: 1,
    awayName: "Chelsea",
    awayScore: 0,
  }) === "Arsenal FC 1 - 0 Chelsea",
  "Posted scoreline uses the live fixture names"
);

const store: Record<string, string> = {};
const listeners: Array<(event: { type: string }) => void> = [];
class FakeCustomEvent {
  type: string;
  detail: unknown;
  constructor(type: string, init?: { detail?: unknown }) {
    this.type = type;
    this.detail = init?.detail;
  }
}
(globalThis as { CustomEvent?: typeof FakeCustomEvent }).CustomEvent = FakeCustomEvent;
(globalThis as { window?: unknown }).window = {
  localStorage: {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
  },
  addEventListener: (type: string, handler: (event: { type: string }) => void) => {
    if (type === SPONSORED_GOAL_EVENT) listeners.push(handler);
  },
  dispatchEvent: (event: { type: string }) => {
    if (event.type === SPONSORED_GOAL_EVENT) {
      listeners.forEach((handler) => handler(event));
    }
    return true;
  },
};

let heard = false;
(window as unknown as {
  addEventListener: (type: string, handler: () => void) => void;
}).addEventListener(SPONSORED_GOAL_EVENT, () => {
  heard = true;
});
recordFanGoalAlert(localAlerts[0]);
assert(heard, "Posting the Arsenal goal dispatches a fan alert event");
assert(
  JSON.parse(store[FAN_GOAL_ALERTS_STORAGE] ?? "[]").length === 1,
  "The Arsenal goal alert is stored for My S4P"
);
assert(
  alertsForClub("Arsenal").length === 1,
  "Registered Arsenal supporters see the stored goal alert"
);
assert(
  alertsForClub("Chelsea").length === 0,
  "Chelsea supporters are not shown the Arsenal goal banner"
);

const dashboard = readFileSync("app/supporter/dashboard/page.tsx", "utf8");
assert(
  dashboard.includes("FanGoalAlertBanner") &&
    dashboard.includes("SPONSORED_GOAL_EVENT"),
  "My S4P shows the Arsenal goal banner and refreshes the Lead wallet"
);

const admin = readFileSync("app/admin/fixtures/page.tsx", "utf8");
assert(
  admin.includes("Simulate Arsenal Goal") &&
    admin.includes("runClientSponsoredGoal"),
  "Fixtures Admin can post the Arsenal sponsored goal"
);

const preview = readFileSync("app/preview/arsenal-goal/page.tsx", "utf8");
assert(
  preview.includes("runClientSponsoredGoal") &&
    preview.includes("Arsenal scored a goal"),
  "The Arsenal goal test page posts the fixture, wallet and fan alert together"
);

const service = readFileSync("app/services/sponsored-goal.service.ts", "utf8");
assert(
  service.includes("createNotification") &&
    service.includes("score_events") &&
    service.includes("supporter_preferences"),
  "A sponsored goal posts a score event and alerts registered club fans"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "Sponsored Arsenal goal: Sports Teams stay at 200; Lead wallet +£3,000; fan alert stored."
);

if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  Promise.all([
    import("../app/services/platform-stats.service"),
    import("../app/services/sponsored-goal.service"),
  ])
    .then(async ([{ loadPlatformStats }, { findUpcomingClubFixture, countImpactMoments }]) => {
      const stats = await loadPlatformStats();
      const moments = await countImpactMoments();
      const fixture = await findUpcomingClubFixture("Arsenal");
      if (stats.sportsTeams !== currentSeasonTeamCount()) {
        throw new Error(
          `Live Sports Teams is ${stats.sportsTeams}, expected ${currentSeasonTeamCount()}`
        );
      }
      if (stats.impactMomentsCreated !== moments) {
        throw new Error(
          `Live Impact Moments is ${stats.impactMomentsCreated}, score_events count is ${moments}`
        );
      }
      if (!fixture) {
        throw new Error("No Arsenal fixture is stored for the sponsored-goal test");
      }
      console.log(
        `Live Arsenal fixture: ${fixture.home_club?.name} v ${fixture.away_club?.name} on ${fixture.fixture_date} (${fixture.home_score}-${fixture.away_score}); Impact Moments ${moments}.`
      );
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    });
}
