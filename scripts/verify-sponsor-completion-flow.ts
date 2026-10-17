import { readFileSync } from "fs";
import { applyWalletFundingLock, includeBrandOnTargets, isWalletFundingLocked, resolveCommittedMatchFunding, shouldFillLockedOfferWithUploads, shouldPullLockedClubUploads } from "../app/lib/sponsor-completion-flow";
import { formatSponsorPayableCopy } from "../app/lib/sponsorship-auction";
import { sponsorDashboardReceivePath } from "../app/lib/routes";
import { SPONSOR_DASHBOARD_PATH } from "../app/lib/routes";

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
const { lockMatchDayClub, lockWalletFundingToClub, ensureGoalNetwork, bindFundedSponsorToClub, loadMatchDayLock, loadClubSponsorRoster, recordSignedLeadClimateSponsor, leadClimateSponsorsForClub } = await import("../app/services/climate-sponsors.service");
const { depositLeadClimateWallet, readClimateWallet } = await import("../app/services/sponsor-wallet.service");
const { ensureOfferFromLockedClubUploads, ensureCarbonOffsetSponsorshipOffer, listSponsorMatchOffers } = await import("../app/services/sponsor-offers.service");
const { publishMatchDayFolderFromSignedOffer, uploadedMatchDayFolderForClub } = await import("../app/services/match-day-folder.service");
const { readFanPostSchedule, writeFanPostSchedule } = await import("../app/lib/match-day-post");

ensureGoalNetwork({
  brandName: "Puma",
  email: "puma@puma.test",
  clubNames: ["Arsenal", "Hearts", "Hibernian"],
});

const lock = lockMatchDayClub({
  brandName: "Puma",
  clubName: "Hibernian",
  matchLabel: "Scottish Premiership Match",
  fixtureName: "Hibernian v Celtic",
  competition: "Scottish Premiership Match",
});
assert(lock.clubName === "Hibernian", "Step 1 locks Puma into Hibernian");

let secondLeadRejected = false;
try {
  lockMatchDayClub({
    brandName: "Budweiser Europe",
    clubName: "Hibernian",
    matchLabel: "Scottish Premiership Match",
    fixtureName: "Hibernian v Celtic",
    competition: "Scottish Premiership Match",
  });
} catch (err) {
  secondLeadRejected = /only one lead climate sponsor/i.test(
    err instanceof Error ? err.message : String(err)
  );
}
assert(
  secondLeadRejected,
  "A second Lead Climate Sponsor lock on Hibernian is rejected"
);

const wallet = depositLeadClimateWallet({
  clubName: "Hibernian",
  brandName: "Puma",
  commitmentFeeGbp: 2500,
  gbpPerGoal: 3500,
  maximumSponsorshipGbp: 7500,
});
const funded = lockWalletFundingToClub({
  brandName: "Puma",
  clubName: "Hibernian",
  commitmentFeeGbp: wallet.commitmentFeeGbp,
  gbpPerGoal: wallet.gbpPerGoal,
  maximumSponsorshipGbp: wallet.maximumSponsorshipGbp,
});
bindFundedSponsorToClub({
  clubName: "Hibernian",
  brandName: "Puma",
  spentGbp: wallet.commitmentFeeGbp,
});

assert(wallet.commitmentFeeGbp === 2500, "Step 2 deposits the Commitment Fee");
assert(
  Boolean(funded && isWalletFundingLocked(funded)),
  "Step 2 locks that wallet funding to Hibernian"
);
assert(
  readClimateWallet("Hibernian", "Puma")?.commitmentFeeGbp === 2500,
  "The Climate Sponsorship Wallet is stored against Hibernian"
);
assert(
  loadClubSponsorRoster("Hibernian", "Hibernian").sponsors.some(
    (row) => row.brandName === "Puma"
  ),
  "The funded brand is bound to the sponsored club"
);
assert(
  sponsorDashboardReceivePath() === `${SPONSOR_DASHBOARD_PATH}#receive-club-projects`,
  "The club's 5 chosen Climate Projects record stays available on the dashboard"
);
assert(
  readFileSync("app/sponsor/wallet/page.tsx", "utf8").includes(
    "sponsorOfferSignOffPath"
  ) &&
    readFileSync("app/sponsor/wallet/page.tsx", "utf8").includes(
      "ensureCarbonOffsetSponsorshipOffer"
    ),
  "Step 3 after a wallet deposit opens Terms & Conditions + sign-off of the Match Day carbon footprint offset"
);

const projects = [
  { id: "gss", name: "Global Schools Solar" },
  { id: "p2", name: "Leith Heat Network" },
  { id: "p3", name: "Portobello Cycles" },
  { id: "p4", name: "Ugandan Cookstoves" },
  { id: "p5", name: "Kenya Solar Hub" },
];
window.localStorage.setItem(
  "s4p.sd.matchDayFolder.hibs-demo",
  JSON.stringify({
    clubId: "hibs-demo",
    clubName: "Hibernian",
    matchDate: "2026-10-10",
    sponsorsFile: null,
    projectsFile: {
      fileName: "Climate Projects File",
      matchDate: "2026-10-10",
      savedAt: new Date().toISOString(),
      projects: projects.map((project, index) => ({
        ...project,
        number: index + 1,
        fundedGbp: 0,
        votesReceived: 0,
      })),
    },
    submittedAt: null,
  })
);
window.localStorage.setItem(
  "s4p.sponsor.matchOffers",
  JSON.stringify([
    {
      id: "hibs-old-offer",
      clubId: "hibs-demo",
      clubName: "Hibernian",
      clubEmail: null,
      matchTitle: "Hibernian v Hearts",
      matchDate: "2026-09-25",
      scoreLabel: "Goal",
      projectIds: ["old-1", "old-2", "old-3", "old-4", "old-5"],
      projects: [
        { id: "old-1", name: "Edinburgh Remakery" },
        { id: "old-2", name: "Wee Spoke Hub" },
        { id: "old-3", name: "Cargo Bike Movement" },
        { id: "old-4", name: "Lauriston Agroecology Farm" },
        { id: "old-5", name: "Global Schools Solar" },
      ],
      postedAt: "2026-09-20T10:00:00.000Z",
      headline: "5 Climate Projects Sponsorship for Goals scored by Hibernian players during Hibernian v Hearts on 25th September 2026",
      sponsorshipAmountGbp: 2500,
      gbpPerGoal: 3500,
      maxAmount: 7500,
      targetBrandNames: ["American Express"],
    },
    {
      id: "hibs-celtic-offer",
      clubId: "hibs-demo",
      clubName: "Hibernian",
      clubEmail: null,
      matchTitle: "Hibernian v Celtic",
      matchDate: "2026-10-10",
      scoreLabel: "Goal",
      projectIds: projects.map((project) => project.id),
      projects,
      postedAt: "2026-10-07T10:00:00.000Z",
      headline: "5 Climate Projects Sponsorship for Goals scored by Hibernian players during Hibernian v Celtic",
      sponsorshipAmountGbp: 1000,
      gbpPerGoal: 0,
      maxAmount: 0,
      targetBrandNames: ["Puma"],
    },
  ])
);

const pulled = await ensureOfferFromLockedClubUploads({ brandName: "Puma" });
assert(Boolean(pulled), "Step 5 pulls the uploaded Hibernian five for locked-in Puma");
assert(
  pulled?.id === "hibs-celtic-offer" &&
    /celtic/i.test(pulled?.matchTitle ?? ""),
  "Sign-off binds Puma to Hibernian v Celtic, not a leftover American Express offer"
);
assert(
  (pulled?.targetBrandNames ?? []).includes("Puma"),
  "The locked-in brand is added to the offer so sign-off can open immediately"
);
assert(
  pulled?.projects.map((project) => project.name).join(",") ===
    projects.map((project) => project.name).join(","),
  "The pulled offer is the Sustainability Director's uploaded Climate Projects"
);
assert(
  pulled?.sponsorshipAmountGbp === 2500 &&
    pulled?.gbpPerGoal === 3500 &&
    pulled?.maxAmount === 7500,
  "Sign-off stores the wallet Commitment Fee, £/Goal and Maximum, not the leftover £1,000"
);
assert(
  formatSponsorPayableCopy({
    ...resolveCommittedMatchFunding({
      lock: loadMatchDayLock("Puma"),
      wallet: readClimateWallet("Hibernian", "Puma"),
      offer: { sponsorshipAmountGbp: 1000, gbpPerGoal: 0, maxAmount: 0 },
    }),
    clubName: "Hibernian",
  }).includes("£2,500") &&
    formatSponsorPayableCopy({
      ...resolveCommittedMatchFunding({
        lock: loadMatchDayLock("Puma"),
        wallet: readClimateWallet("Hibernian", "Puma"),
        offer: { sponsorshipAmountGbp: 1000 },
      }),
      clubName: "Hibernian",
    }).includes("£3,500") &&
    !formatSponsorPayableCopy({
      ...resolveCommittedMatchFunding({
        lock: loadMatchDayLock("Puma"),
        wallet: readClimateWallet("Hibernian", "Puma"),
        offer: { sponsorshipAmountGbp: 1000 },
      }),
      clubName: "Hibernian",
    }).includes("£1,000"),
  "Agree to be Goal Sponsor states the deposited amounts, not a leftover £1,000"
);

const liveFolder = publishMatchDayFolderFromSignedOffer({
  clubId: "hibs-demo",
  clubName: "Hibernian",
  projects,
  minAmount: 2500,
  gbpPerGoal: 3500,
});
writeFanPostSchedule({
  clubId: "hibs-demo",
  clubName: "Hibernian",
  postedAt: new Date().toISOString(),
  visibleAt: new Date().toISOString(),
  projectIds: projects.map((project) => project.id),
  sponsorNames: ["Puma"],
  leadSponsorName: "Puma",
});
assert(
  Boolean(liveFolder?.submittedAt) &&
    (liveFolder?.projectsFile?.projects.length ?? 0) === 5,
  "Step 7 lodges the signed five in the club Match-Day folder"
);
assert(
  readFanPostSchedule("hibs-demo")?.leadSponsorName === "Puma",
  "Step 7 makes the signed five visible to Hibernian fans immediately"
);
assert(
  uploadedMatchDayFolderForClub("Hibernian")?.clubId === "hibs-demo",
  "The club Sustainability Director can read the signed folder for Hibernian"
);
assert(
  shouldPullLockedClubUploads({ pendingForClub: 0, uploadedProjectCount: 5 }),
  "Uploaded projects are pulled when no pending offer is waiting"
);
assert(
  includeBrandOnTargets(["American Express"], "Puma").includes("Puma"),
  "Retargeting keeps the original brand and adds the locked-in sponsor"
);
assert(
  applyWalletFundingLock(loadMatchDayLock("Puma")!, {
    commitmentFeeGbp: 2500,
  }).commitmentFeeGbp === 2500,
  "Funding lock copy stays on the Hibernian match-day lock"
);

assert(
  recordSignedLeadClimateSponsor({
    brandName: "American Express",
    clubName: "Hibernian",
    fixtureName: "Hibernian v Celtic",
  })?.brandName === "Puma" &&
    leadClimateSponsorsForClub("Hibernian")[0]?.brandName === "Puma",
  "A later American Express sign-off does not replace the occupying Hibernian Lead"
);

ensureGoalNetwork({
  brandName: "Budweiser Europe",
  email: "budweiser.europe@budweiser.test",
  clubNames: ["Brentford"],
});
lockMatchDayClub({
  brandName: "Budweiser Europe",
  clubName: "Brentford",
  matchLabel: "Premier League",
  fixtureName: "Brentford v Liverpool",
  competition: "Premier League",
  fixtureDate: "2026-10-25",
});
depositLeadClimateWallet({
  clubName: "Brentford",
  brandName: "Budweiser Europe",
  commitmentFeeGbp: 2500,
  gbpPerGoal: 4000,
  maximumSponsorshipGbp: 8000,
});
lockWalletFundingToClub({
  brandName: "Budweiser Europe",
  clubName: "Brentford",
  commitmentFeeGbp: 2500,
  gbpPerGoal: 4000,
  maximumSponsorshipGbp: 8000,
});
const brentfordProjects = [
  { id: "bf-gss", name: "Global Schools Solar" },
  { id: "bf-2", name: "West London Heat Network" },
  { id: "bf-3", name: "Brentford Towpath Wilding" },
  { id: "bf-4", name: "Kenya Solar Hub" },
  { id: "bf-5", name: "Ugandan Cookstoves" },
];
window.localStorage.setItem(
  "s4p.sd.matchDayFolder.brentford-club",
  JSON.stringify({
    clubId: "brentford-club",
    clubName: "Brentford",
    matchDate: "2026-10-25",
    sponsorsFile: null,
    projectsFile: {
      fileName: "Climate Projects File",
      matchDate: "2026-10-25",
      savedAt: new Date().toISOString(),
      projects: brentfordProjects.map((project, index) => ({
        ...project,
        number: index + 1,
        fundedGbp: 0,
        votesReceived: 0,
      })),
    },
    submittedAt: null,
  })
);
window.localStorage.setItem(
  "s4p.sd.fileRecords.brentford-club",
  JSON.stringify([
    {
      id: "brentford-file",
      clubId: "brentford-club",
      campaignId: null,
      savedAt: new Date().toISOString(),
      matchLabel: "Brentford Match Day",
      minAmount: 2500,
      selected: brentfordProjects,
      voted: [],
    },
  ])
);
const existingOffers = JSON.parse(
  window.localStorage.getItem("s4p.sponsor.matchOffers") ?? "[]"
) as Array<Record<string, unknown>>;
window.localStorage.setItem(
  "s4p.sponsor.matchOffers",
  JSON.stringify([
    {
      id: "brentford-empty-offer",
      clubId: "brentford-club",
      clubName: "Brentford",
      clubEmail: null,
      matchTitle: "Brentford v Liverpool",
      matchDate: "2026-10-25",
      scoreLabel: "Goal",
      projectIds: [],
      projects: [],
      postedAt: "2026-10-17T10:00:00.000Z",
      headline: "Match Day carbon footprint offset for Brentford during Brentford v Liverpool",
      sponsorshipAmountGbp: 2500,
      gbpPerGoal: 4000,
      maxAmount: 8000,
      targetBrandNames: ["Budweiser Europe"],
    },
    ...existingOffers,
  ])
);

const listed = await listSponsorMatchOffers();
assert(
  listed.some((offer) => offer.clubName === "Brentford"),
  "Match Day Climate Projects keeps a calendar club such as Brentford, not only the 3-club Sports Teams demo"
);
assert(
  shouldFillLockedOfferWithUploads({
    pendingProjectCount: 0,
    uploadedProjectCount: 5,
  }),
  "An empty Brentford offer is filled from the club Sustainability Director's uploaded five"
);
const brentfordOffer = await ensureOfferFromLockedClubUploads({
  brandName: "Budweiser Europe",
});
assert(Boolean(brentfordOffer), "Locked Budweiser Europe receives Brentford's uploaded five");
assert(
  (brentfordOffer?.projects.length ?? 0) === 5 &&
    (brentfordOffer?.projects.every((project) => Boolean(project.name)) ?? false),
  "Match Day Climate Projects lists Brentford's five chosen Climate Projects automatically"
);
const carbon = await ensureCarbonOffsetSponsorshipOffer({
  brandName: "Budweiser Europe",
});
assert(
  (carbon?.projects.length ?? 0) === 5 &&
    carbon?.clubName === "Brentford",
  "A wallet deposit for Brentford keeps the club's five on the Match Day record"
);

ensureGoalNetwork({
  brandName: "Heineken",
  email: "heineken@heineken.test",
  clubNames: ["SV Elversberg"],
});
lockMatchDayClub({
  brandName: "Heineken",
  clubName: "SV Elversberg",
  matchLabel: "2. Bundesliga",
  fixtureName: "SV Elversberg v SC Paderborn",
  competition: "2. Bundesliga",
  fixtureDate: "2026-11-07",
});
const elversbergProjects = [
  { id: "el-gss", name: "Global Schools Solar" },
  { id: "el-2", name: "Saarland Heat Network" },
  { id: "el-3", name: "Spiesen Wilding" },
  { id: "el-4", name: "Kenya Solar Hub" },
  { id: "el-5", name: "Ugandan Cookstoves" },
];
window.localStorage.setItem(
  "s4p.sd.matchDayFolder.elversberg-club",
  JSON.stringify({
    clubId: "elversberg-club",
    clubName: "SV Elversberg",
    matchDate: "2026-11-07",
    sponsorsFile: null,
    projectsFile: {
      fileName: "Climate Projects File",
      matchDate: "2026-11-07",
      savedAt: new Date().toISOString(),
      projects: elversbergProjects.map((project, index) => ({
        ...project,
        number: index + 1,
        fundedGbp: 0,
        votesReceived: 0,
      })),
    },
    submittedAt: null,
  })
);
const elversbergOffer = await ensureOfferFromLockedClubUploads({
  brandName: "Heineken",
});
assert(
  (elversbergOffer?.projects.map((project) => project.name) ?? []).join(",") ===
    elversbergProjects.map((project) => project.name).join(",") &&
    (await listSponsorMatchOffers()).some((offer) =>
      /elversberg/i.test(offer.clubName)
    ),
  "A Sporting Calendar club outside the 3-club Sports Teams demo still shows its uploaded five"
);
assert(
  readFileSync("app/lib/current-season.ts", "utf8").includes(
    'DEMO_CLUB_NAMES = ["Arsenal", "Hearts", "Hibernian"]'
  ) &&
    readFileSync("app/sponsor/offers/page.tsx", "utf8").includes(
      "appear here automatically"
    ),
  "Sports Teams stays the 3-club demo while Match Day Climate Projects shows any locked club's five"
);

if (failures.length > 0) {
  console.error("verify-sponsor-completion-flow failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-sponsor-completion-flow: ok");
console.log(
  JSON.stringify(
    {
      lock: loadMatchDayLock("Puma")?.clubName,
      fundingLocked: isWalletFundingLocked(loadMatchDayLock("Puma")),
      walletGbp: readClimateWallet("Hibernian", "Puma")?.commitmentFeeGbp,
      pulledBrand: pulled?.targetBrandNames,
      projectCount: pulled?.projects.length,
      fanLead: readFanPostSchedule("hibs-demo")?.leadSponsorName,
      folderSubmitted: Boolean(liveFolder?.submittedAt),
      brentfordClub: brentfordOffer?.clubName,
      brentfordProjects: brentfordOffer?.projects.length,
    },
    null,
    2
  )
);
}

void main();
