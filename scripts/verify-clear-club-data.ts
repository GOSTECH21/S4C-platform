import { readFileSync } from "fs";
import {
  ARSENAL_BLANK_SLATE_VERSION,
  SELECTION_LIVE_PREFIX,
  clearClubLocalProjectsAndSponsors,
  clubDataMatches,
  clubShouldStartBlank,
  markClubSelectionLive,
} from "../app/lib/clear-club-data";

const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(clubDataMatches("Arsenal FC", "Arsenal"), "Arsenal FC is treated as Arsenal");
assert(!clubDataMatches("Chelsea", "Arsenal"), "Chelsea is not treated as Arsenal");
assert(
  !clubDataMatches("Arsenal Women", "Arsenal"),
  "Arsenal Women is not wiped with the men's club"
);

const store: Record<string, string> = {
  "s4p.club.climateSponsors": JSON.stringify({
    "club-a": {
      clubId: "club-a",
      clubName: "Arsenal",
      sponsors: [{ id: "amex", brandName: "American Express" }],
    },
    "club-c": {
      clubId: "club-c",
      clubName: "Chelsea",
      sponsors: [{ id: "nike", brandName: "Nike" }],
    },
  }),
  "s4p.sponsor.wallets": JSON.stringify({
    "arsenal:american express": { clubName: "Arsenal FC", brandName: "American Express" },
    "chelsea:nike": { clubName: "Chelsea", brandName: "Nike" },
  }),
  "s4p.sponsor.goalNetwork": JSON.stringify({
    diageo: { clubNames: ["Arsenal", "Liverpool"] },
  }),
  "s4p.sd.matchDay.club-a": JSON.stringify({ projectIds: ["gss"] }),
  "s4p.campaign.auction.campaign-old": JSON.stringify({ minAmount: 10000 }),
  "s4p.sd.fileRecords.other-id": JSON.stringify([
    {
      clubId: "club-a",
      clubName: "Arsenal FC",
      selected: [{ id: "gss", name: "Global Schools Solar" }],
    },
  ]),
  "s4p.sponsor.projectProposals": JSON.stringify([
    {
      id: "p1",
      clubId: "club-a",
      clubName: "Arsenal FC",
      sponsorName: "Carbon Warriors Limited",
      status: "posted",
    },
    {
      id: "p2",
      clubId: "club-c",
      clubName: "Chelsea",
      sponsorName: "Nike",
      status: "posted",
    },
  ]),
  "s4p.sponsor.matchOffers": JSON.stringify([
    { id: "o1", clubId: "club-a", clubName: "Arsenal FC" },
    { id: "o2", clubId: "club-c", clubName: "Chelsea" },
  ]),
  "s4p.sponsor.offerSignatures": JSON.stringify([
    { id: "s1", offerId: "o1", brandName: "Puma" },
    { id: "s2", offerId: "o2", brandName: "Nike" },
  ]),
};

(globalThis as { window?: unknown }).window = {
  localStorage: {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  },
};

assert(
  clubShouldStartBlank("club-a", "Arsenal FC"),
  "Arsenal starts on a blank Match Day until a new five is saved"
);
assert(
  !clubShouldStartBlank("club-c", "Chelsea"),
  "Other clubs keep their current Match Day until Start afresh is used"
);

const cleared = clearClubLocalProjectsAndSponsors({
  clubName: "Arsenal",
  clubIds: ["club-a"],
  campaignIds: ["campaign-old"],
});
assert(cleared.sponsorsRemoved === 1, "Arsenal sponsor roster is removed");
assert(cleared.walletsRemoved === 1, "Arsenal Carbon Wallet is removed");
assert(!store["s4p.sd.matchDay.club-a"], "Arsenal Match Day file is removed");
assert(!store["s4p.sd.fileRecords.other-id"], "Arsenal lookback file records are removed");
assert(!store["s4p.campaign.auction.campaign-old"], "Old Arsenal campaign auction is removed");
const leftoverRoster = JSON.parse(store["s4p.club.climateSponsors"]);
assert(leftoverRoster["club-c"]?.clubName === "Chelsea", "Chelsea sponsors stay");
const leftoverWallets = JSON.parse(store["s4p.sponsor.wallets"]);
assert(leftoverWallets["chelsea:nike"], "Chelsea wallets stay");
const leftoverNetwork = JSON.parse(store["s4p.sponsor.goalNetwork"]);
assert(
  leftoverNetwork.diageo.clubNames.join(",") === "Liverpool",
  "Arsenal is removed from Goal Sponsorship Networks"
);
const leftoverProposals = JSON.parse(store["s4p.sponsor.projectProposals"]);
assert(
  leftoverProposals.length === 1 && leftoverProposals[0].clubName === "Chelsea",
  "Carbon Warriors Arsenal proposals are removed"
);
const leftoverOffers = JSON.parse(store["s4p.sponsor.matchOffers"]);
assert(leftoverOffers.length === 1 && leftoverOffers[0].id === "o2", "Arsenal match offers are removed");
const leftoverSignatures = JSON.parse(store["s4p.sponsor.offerSignatures"]);
assert(
  leftoverSignatures.length === 1 && leftoverSignatures[0].offerId === "o2",
  "Arsenal signed copies are removed"
);
assert(
  store[SELECTION_LIVE_PREFIX + "club-a"] === "blank",
  "Arsenal is marked as a blank Match Day after the wipe"
);
assert(
  clubShouldStartBlank("club-a", "Arsenal"),
  "Arsenal stays blank until the Sustainability Director saves a new five"
);
markClubSelectionLive("club-a");
assert(
  store[SELECTION_LIVE_PREFIX + "club-a"] === ARSENAL_BLANK_SLATE_VERSION,
  "Saving a new five marks Arsenal Match Day live"
);
assert(
  !clubShouldStartBlank("club-a", "Arsenal"),
  "A newly saved Arsenal five is kept on the dashboard"
);

const dashboard = readFileSync("app/club/dashboard/page.tsx", "utf8");
assert(
  dashboard.includes("Start this club afresh") &&
    dashboard.includes("clearClubProjectsAndSponsors") &&
    dashboard.includes("clubShouldStartBlank"),
  "The club dashboard starts Arsenal from a blank Match Day"
);
const board = readFileSync("app/services/club-match-day.service.ts", "utf8");
assert(
  board.includes("clubShouldStartBlank") &&
    board.includes("if (selected.length === 0) return [];"),
  "The dashboard board does not restore or auto-fill an empty Arsenal five"
);
const sql = readFileSync(
  "supabase/migrations/0016_clear_arsenal_projects_sponsors.sql",
  "utf8"
);
assert(
  sql.includes("clear_club_projects_and_sponsors") &&
    sql.includes("club_match_portfolio") &&
    sql.includes("sponsorship_campaigns") &&
    sql.includes("club_climate_file_records") &&
    sql.includes("sponsor_project_proposals") &&
    sql.includes("other clubs"),
  "Hosted SQL clears Arsenal portfolios, lookbacks and proposals and keeps other clubs"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Clear Arsenal: local sponsors/wallets/projects/lookbacks go; Chelsea stays.");
