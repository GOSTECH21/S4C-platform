import { readFileSync } from "fs";

const memory = new Map<string, string>();
const localStorage = {
  getItem(key: string) {
    return memory.has(key) ? memory.get(key)! : null;
  },
  setItem(key: string, value: string) {
    memory.set(key, String(value));
  },
  removeItem(key: string) {
    memory.delete(key);
  },
  clear() {
    memory.clear();
  },
  key(index: number) {
    return [...memory.keys()][index] ?? null;
  },
  get length() {
    return memory.size;
  },
};

(globalThis as { window?: unknown }).window = {
  localStorage,
  dispatchEvent() {
    return true;
  },
  addEventListener() {},
  removeEventListener() {},
};

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

async function main() {
  const {
    recordSignedLeadClimateSponsor,
    leadClimateSponsorsForClub,
    lockMatchDayClub,
  } = await import("../app/services/climate-sponsors.service");

  const emptyHibs = leadClimateSponsorsForClub("Hibernian");
  assert(
    emptyHibs.length === 0,
    "Hibernian starts with no Lead Climate Sponsor before sign-off"
  );

  const signed = recordSignedLeadClimateSponsor({
    brandName: "American Express",
    clubName: "Hibernian",
    clubId: "hibs-demo",
    fixtureName: "Hibernian v Celtic",
    fixtureDate: "2026-10-10",
    competition: "Scottish Premiership Match",
  });
  assert(
    signed?.brandName === "American Express",
    "American Express sign-off occupies the Hibernian Lead Climate Sponsor tab"
  );

  const hibsLeads = leadClimateSponsorsForClub("Hibernian");
  assert(
    hibsLeads.length === 1 && hibsLeads[0]?.brandName === "American Express",
    "Our Lead Climate Sponsor lists American Express immediately after sign-off"
  );
  assert(
    (hibsLeads[0]?.matches ?? []).some((name) => /celtic/i.test(name)),
    "The activated Lead tab shows the signed Hibernian v Celtic match"
  );

  const localIgnored = recordSignedLeadClimateSponsor({
    brandName: "Top Cellar",
    clubName: "Hibernian",
    fixtureName: "Hibernian v Celtic",
  });
  assert(
    localIgnored === null &&
      leadClimateSponsorsForClub("Hibernian")[0]?.brandName ===
        "American Express",
    "A Local Business Climate Sponsor sign-off does not occupy the Lead tab"
  );

  let secondRejected = false;
  try {
    lockMatchDayClub({
      brandName: "Puma",
      clubName: "Hibernian",
      matchLabel: "Scottish Premiership Match",
      fixtureName: "Hibernian v Hearts",
      competition: "Scottish Premiership Match",
    });
  } catch (err) {
    secondRejected = /only one lead climate sponsor/i.test(
      err instanceof Error ? err.message : String(err)
    );
  }
  assert(
    secondRejected &&
      leadClimateSponsorsForClub("Hibernian")[0]?.brandName ===
        "American Express",
    "A second Lead Climate Sponsor is still rejected after Amex sign-off"
  );

  const pumaAttempt = recordSignedLeadClimateSponsor({
    brandName: "Puma",
    clubName: "Hibernian",
    fixtureName: "Hibernian v Hearts",
  });
  assert(
    pumaAttempt?.brandName === "American Express",
    "Signing off a second Lead leaves American Express on the Lead tab"
  );

  const dashboard = readFileSync("app/club/dashboard/page.tsx", "utf8");
  const liveRefresh = dashboard.slice(
    dashboard.indexOf("refreshSignedLive")
  );
  assert(
    liveRefresh.includes("leadClimateSponsorsForClub") &&
      liveRefresh.includes("setLeadSponsors") &&
      dashboard.includes('initialTab="lead"'),
    "The club dashboard refreshes and activates Our Lead Climate Sponsor as soon as a brand signs off"
  );

  const offers = readFileSync("app/services/sponsor-offers.service.ts", "utf8");
  assert(
    offers.includes("recordSignedLeadClimateSponsor") &&
      offers.includes("notifySignedSponsorship"),
    "Agree and sign off records the Lead Climate Sponsor and notifies the club dashboard"
  );

  const tabs = readFileSync(
    "app/components/club/ClubClimateSponsorTabs.tsx",
    "utf8"
  );
  assert(
    tabs.includes('setTab("lead")') &&
      tabs.includes("activateLeadWhenSignedOff") &&
      tabs.includes("aria-pressed") &&
      tabs.includes("setSelectedLeadKey"),
    "The Lead Climate Sponsor tab activates after sign-off so the Sustainability Director can click the brand"
  );

  if (failures.length > 0) {
    console.error("verify-lead-tab-after-signoff failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log("verify-lead-tab-after-signoff: ok");
  console.log(
    JSON.stringify(
      {
        lead: hibsLeads[0]?.brandName,
        matches: hibsLeads[0]?.matches,
        secondRejected,
      },
      null,
      2
    )
  );
}

void main();
