import { readFileSync } from "fs";
import {
  clearClubLocalProjectsAndSponsors,
  clubDataMatches,
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

const cleared = clearClubLocalProjectsAndSponsors({
  clubName: "Arsenal",
  clubIds: ["club-a"],
});
assert(cleared.sponsorsRemoved === 1, "Arsenal sponsor roster is removed");
assert(cleared.walletsRemoved === 1, "Arsenal Carbon Wallet is removed");
assert(!store["s4p.sd.matchDay.club-a"], "Arsenal Match Day file is removed");
const leftoverRoster = JSON.parse(store["s4p.club.climateSponsors"]);
assert(leftoverRoster["club-c"]?.clubName === "Chelsea", "Chelsea sponsors stay");
const leftoverWallets = JSON.parse(store["s4p.sponsor.wallets"]);
assert(leftoverWallets["chelsea:nike"], "Chelsea wallets stay");
const leftoverNetwork = JSON.parse(store["s4p.sponsor.goalNetwork"]);
assert(
  leftoverNetwork.diageo.clubNames.join(",") === "Liverpool",
  "Arsenal is removed from Goal Sponsorship Networks"
);

const dashboard = readFileSync("app/club/dashboard/page.tsx", "utf8");
assert(
  dashboard.includes("Start this club afresh") &&
    dashboard.includes("clearClubProjectsAndSponsors"),
  "The club dashboard can start the club from a blank Match Day"
);
const sql = readFileSync(
  "supabase/migrations/0016_clear_arsenal_projects_sponsors.sql",
  "utf8"
);
assert(
  sql.includes("clear_club_projects_and_sponsors") &&
    sql.includes("club_match_portfolio") &&
    sql.includes("sponsorship_campaigns") &&
    sql.includes("other clubs"),
  "Hosted SQL clears Arsenal portfolios and keeps other clubs"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Clear Arsenal: local sponsors/wallets/projects go; Chelsea stays.");
