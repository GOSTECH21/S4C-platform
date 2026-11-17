import { readFileSync } from "fs";
import { localInviteDealtBySignedRecord, LOCAL_MY_S4P_COPY, LOCAL_MY_S4P_HEADING, LOCAL_MY_S4P_NAV, localFansFromAllocated, localSponsorMyS4pSnapshot } from "../app/lib/local-sponsor-mys4p";
import type { LocalSponsorRecord } from "../app/lib/local-sponsor";
import { LOCAL_SPONSOR_MY_S4P_PATH } from "../app/lib/routes";
import { createLocalWallet, DEFAULT_WALLET_VOTE_GBP } from "../app/lib/sponsor-wallet";
import type { ClimateWalletTake } from "../app/lib/climate-wallet-takes";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const record: LocalSponsorRecord = {
  brandName: "The Stadium Cafe",
  email: "cafe@example.test",
  clubName: "Hearts",
  pledgeGbp: 750,
  createdAt: "2026-10-26T09:00:00.000Z",
  source: "registered",
  matchSponsorships: [
    {
      fixtureName: "Hearts v Rangers",
      amountGbp: 750,
      projectName: "Meadows Community Energy",
    },
  ],
  submittedAt: "2026-10-26T10:00:00.000Z",
  acceptedTerms: true,
  signerName: "Alex Cafe",
  signedAt: "2026-10-26T10:00:00.000Z",
  sponsoredProjectName: "Meadows Community Energy",
};

const wallet = {
  ...createLocalWallet({
    clubName: "Hearts",
    brandName: "The Stadium Cafe",
    sponsorshipGbp: 750,
    sponsoredProjectName: "Meadows Community Energy",
  }),
  allocatedGbp: 2,
};

const takes: ClimateWalletTake[] = [
  {
    amountGbp: 0.2,
    projectName: "Meadows Community Energy",
    brandName: "The Stadium Cafe",
    clubName: "Hearts",
    at: "2026-10-26T12:00:00.000Z",
  },
  {
    amountGbp: 0.2,
    projectName: "Meadows Community Energy",
    brandName: "The Stadium Cafe",
    clubName: "Hearts",
    at: "2026-10-26T12:01:00.000Z",
  },
];

const snapshot = localSponsorMyS4pSnapshot({
  brandName: "The Stadium Cafe",
  records: [record],
  wallets: [wallet],
  takes,
});

assert(
  LOCAL_MY_S4P_NAV === "My S4P" &&
    LOCAL_MY_S4P_HEADING === "My S4P" &&
    LOCAL_SPONSOR_MY_S4P_PATH === "/sponsor/local/mys4p" &&
    LOCAL_MY_S4P_COPY.includes("Climate Projects") &&
    LOCAL_MY_S4P_COPY.includes("how much you have spent") &&
    LOCAL_MY_S4P_COPY.includes("Fans have taken money"),
  "Local My S4P is the records home for spend, projects, and fan takes"
);

assert(
  snapshot.spentGbp === 787.5 &&
    snapshot.spentLabel === "£787.50" &&
    snapshot.takenGbp === 2 &&
    snapshot.fansEngaged === 10 &&
    snapshot.brandSightings === 10 &&
    snapshot.remainingGbp === 748 &&
    snapshot.projects[0]?.name === "Meadows Community Energy" &&
    snapshot.projects[0]?.clubName === "Hearts" &&
    snapshot.projects[0]?.fans === 10,
  "My S4P totals spent (including 5% Platform Fee), remaining wallet, and fans who saw the brand"
);

assert(
  localFansFromAllocated(2) === Math.round(2 / DEFAULT_WALLET_VOTE_GBP) &&
    localInviteDealtBySignedRecord(
      { clubName: "Hearts", matchLabel: "Hearts v Rangers" },
      "The Stadium Cafe",
      [record]
    ) &&
    !localInviteDealtBySignedRecord(
      { clubName: "Rangers", matchLabel: "Rangers v Celtic" },
      "The Stadium Cafe",
      [record]
    ),
  "A signed local record for that club and match is treated as a dealt invitation"
);

const nav = readFileSync("app/sponsor/sponsor-nav.tsx", "utf8");
const page = readFileSync("app/sponsor/local/mys4p/page.tsx", "utf8");
const preview = readFileSync("app/preview/local-mys4p/page.tsx", "utf8");
const ui = readFileSync("app/components/sponsor/LocalSponsorMyS4p.tsx", "utf8");
const service = readFileSync(
  "app/services/sponsor-listings.service.ts",
  "utf8"
);

assert(
  nav.includes("LOCAL_MY_S4P_NAV") &&
    nav.includes("LOCAL_SPONSOR_MY_S4P_PATH") &&
    nav.includes("local-mys4p-tab-v1") &&
    nav.includes("showMyS4p") &&
    page.includes("LocalSponsorMyS4p") &&
    page.includes("listLocalWalletTakes") &&
    preview.includes("inviteCount={1}") &&
    preview.includes("The Stadium Cafe") &&
    ui.includes('data-testid="local-mys4p"') &&
    ui.includes("Fans who saw your brand") &&
    ui.includes("Spend vs Fan takes") &&
    service.includes("commitLocalInviteSponsorship") &&
    service.includes("localInviteDealtBySignedRecord"),
  "Local nav includes My S4P and the page graphs spend and fan brand sightings"
);

if (failures.length > 0) {
  console.error("verify-local-mys4p failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-local-mys4p: ok");
