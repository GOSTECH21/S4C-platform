import { readFileSync } from "fs";
import {
  createLeadWallet,
  remainingGbp,
} from "../app/lib/sponsor-wallet";
import {
  alertsForClub,
  brandNameFromGoalMessage,
  clubNamesMatchForGoal,
  creditLeadWalletForGoal,
  DEFAULT_LEAD_GBP_PER_GOAL,
  DEFAULT_LEAD_GOAL_SPONSOR,
  FAN_GOAL_ALERTS_STORAGE,
  goalAlertForCampaign,
  goalScoreline,
  goalStatementAmountGbp,
  isGenericLeadSponsorName,
  leadWalletForGoalStatement,
  leadWalletIncreaseGbp,
  mergeFanGoalAlerts,
  recordFanGoalAlert,
  SPONSORED_GOAL_EVENT,
  resolveVisibleFanGoalAlert,
  withSponsorWalletOnGoalAlert,
} from "../app/lib/sponsored-goal";
import { currentSeasonTeamCount } from "../app/lib/current-season";
import { mergePlatformStats } from "../app/lib/platform-stats";

const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(
  currentSeasonTeamCount() === 3,
  "The Sports Teams window must be exactly the three demo clubs"
);
assert(
  mergePlatformStats({ sportsTeams: 221 }).sportsTeams === 3,
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

assert(
  brandNameFromGoalMessage(
    "Arsenal FC scored against Leeds United. Puma has released £3,000 Goals-scored sponsorship into the Carbon Wallet."
  ) === "Puma",
  "Goal notifications keep the Lead Climate Sponsor who signed that match"
);

const amexAlert = localAlerts[0];
const leftoverAmexAlert = {
  ...amexAlert,
  opponentName: "Leeds United",
  scoreline: "Arsenal FC scored",
  brandName: "American Express",
};
const pumaLeedsAlert = {
  ...leftoverAmexAlert,
  brandName: "Puma",
};
assert(
  goalAlertForCampaign({
    alerts: [amexAlert, leftoverAmexAlert],
    clubName: "Arsenal",
    matchTitle: "Arsenal v Leeds United Climate Campaign",
    sponsorName: "Puma",
  }) == null,
  "A leftover American Express GOAL is not shown as Puma for Arsenal v Leeds United"
);
assert(
  goalAlertForCampaign({
    alerts: [amexAlert, pumaLeedsAlert],
    clubName: "Arsenal",
    matchTitle: "Arsenal v Leeds United Climate Campaign",
    sponsorName: "Puma",
  })?.brandName === "Puma",
  "My S4P GOAL banner names Puma for Arsenal v Leeds United, not a leftover American Express"
);
assert(
  goalAlertForCampaign({
    alerts: [leftoverAmexAlert],
    clubName: "Arsenal",
    matchTitle: null,
    sponsorName: null,
  }) == null,
  "Empty My S4P does not keep a leftover American Express GOAL after Arsenal's Lead is deleted"
);
assert(
  resolveVisibleFanGoalAlert({
    alerts: [leftoverAmexAlert],
    clubName: "Arsenal",
    wallets: [wallet],
  }) == null,
  "A leftover American Express wallet is not enough to put Amex on Arsenal My S4P"
);
assert(
  resolveVisibleFanGoalAlert({
    alerts: [leftoverAmexAlert],
    clubName: "Arsenal",
    clubLeadBrands: ["Puma"],
  }) == null,
  "Arsenal's current Lead being Puma does not recycle an American Express GOAL"
);
assert(
  resolveVisibleFanGoalAlert({
    alerts: [
      {
        ...leftoverAmexAlert,
        clubName: "Hibernian",
        scoreline: "Hibernian scored",
      },
    ],
    clubName: "Hibernian",
    clubLeadBrands: ["American Express"],
  })?.brandName === "American Express",
  "Hibernian still shows American Express when that club's Lead is American Express"
);
assert(
  goalAlertForCampaign({
    alerts: [
      {
        ...amexAlert,
        scoreline: "Arsenal FC v Chelsea",
        opponentName: "Chelsea",
      },
    ],
    clubName: "Arsenal",
    matchTitle: "Arsenal v Leeds United",
    sponsorName: "Puma",
  }) == null,
  "A Chelsea goal alert is not shown on the Arsenal v Leeds United campaign"
);

const pumaWallet = {
  ...createLeadWallet({
    clubName: "Arsenal",
    brandName: "Puma",
    commitmentFeeGbp: 3500,
    gbpPerGoal: 3000,
  }),
  allocatedGbp: 0.2,
};
assert(remainingGbp(pumaWallet) === 3499.8, "Puma's Carbon Wallet shows £3,499.80 after FUND-IT");
assert(
  goalStatementAmountGbp(pumaWallet) === 3500,
  "The GOAL statement uses Puma's committed £3,500, not a leftover £3,000 /Goal"
);
assert(
  isGenericLeadSponsorName("Lead Climate Sponsor"),
  "Lead Climate Sponsor is a label, not a brand"
);
assert(
  leadWalletForGoalStatement(
    [pumaWallet],
    "Arsenal FC",
    "Lead Climate Sponsor"
  )?.brandName === "Puma",
  "Arsenal FC fans resolve Puma's wallet even when the banner was labelled Lead Climate Sponsor"
);
assert(
  leadWalletForGoalStatement([wallet, pumaWallet], "Arsenal FC") == null,
  "Arsenal does not pick a leftover American Express wallet when no Lead is named"
);
assert(
  leadWalletForGoalStatement([wallet], "Arsenal FC", "Puma") == null,
  "An American Express wallet is not used as Puma's Arsenal GOAL statement"
);
const pumaBanner = withSponsorWalletOnGoalAlert(
  {
    clubName: "Arsenal FC",
    opponentName: "Leeds United",
    fixtureDate: "2026-10-10",
    scoreline: "Arsenal FC scored",
    brandName: "Lead Climate Sponsor",
    amountGbp: DEFAULT_LEAD_GBP_PER_GOAL,
    at: "2026-10-02T12:00:00.000Z",
  },
  pumaWallet
);
assert(
  pumaBanner.brandName === "Puma" && pumaBanner.amountGbp === 3500,
  "GOAL! names Puma and £3,500 — the amount shown on Puma's Carbon Wallet"
);

const dashboard = readFileSync("app/components/fan/FanCampaignWorkspace.tsx", "utf8");
assert(
  dashboard.includes("FanGoalAlertBanner") &&
    dashboard.includes("sponsorRemainingGbp") &&
    dashboard.includes("SPONSORED_GOAL_EVENT"),
  "My S4P shows the Arsenal goal banner and refreshes the Lead wallet"
);

assert(
  readFileSync("app/components/fan/FanGoalAlertBanner.tsx", "utf8").includes(
    "resolveVisibleFanGoalAlert"
  ) &&
    readFileSync("app/components/fan/FanGoalAlertBanner.tsx", "utf8").includes(
      "leadClimateSponsorsForClub"
    ),
  "The GOAL banner uses the amount shown on the sponsor Carbon Wallet and only the club's current Lead"
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
    service.includes("supporter_preferences") &&
    service.includes("leadSponsorBrandForFixture") &&
    service.includes("brandNameFromGoalMessage") &&
    !service.includes("brandName: DEFAULT_LEAD_GOAL_SPONSOR"),
  "A sponsored goal posts a score event and names the Lead Climate Sponsor who signed that match"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "Sponsored Arsenal goal: Sports Teams stay at 3; Lead wallet +£3,000; fan alert stored."
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
