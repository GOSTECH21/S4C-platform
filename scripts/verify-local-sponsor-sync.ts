import { readFileSync } from "fs";
import {
  localRecordsForBrand,
  localSponsoredClubMatches,
  localSponsoredMatches,
} from "../app/lib/local-sponsor-home";
import { lobiRowsForArea } from "../app/lib/lobi";
import {
  shouldSyncLocalSponsorRecord,
  uniqueLocalClubBrandRecords,
  type LocalSponsorRecord,
} from "../app/lib/local-sponsor";
import { recordFromSponsorRow } from "../app/lib/local-sponsor";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const scotmid: LocalSponsorRecord = {
  brandName: "Scotmid Coop",
  email: "scotmid@local.test",
  clubName: "Hearts",
  pledgeGbp: 500,
  createdAt: "2026-10-20T12:00:00.000Z",
  submittedAt: "2026-10-20T12:00:00.000Z",
  signedAt: "2026-10-20T12:00:00.000Z",
  postcode: "EH7 5AA",
  source: "registered",
  matchSponsorships: [
    { fixtureName: "Hearts v Aberdeen", amountGbp: 500, date: "2026-12-02" },
  ],
};
const emptyPc: LocalSponsorRecord = {
  brandName: "Scotmid Coop",
  email: "scotmid@local.test",
  clubName: "Hearts",
  pledgeGbp: 0,
  createdAt: "2026-10-31T08:00:00.000Z",
  source: "registered",
};

assert(
  shouldSyncLocalSponsorRecord(scotmid) &&
    uniqueLocalClubBrandRecords([emptyPc, scotmid])[0]?.matchSponsorships?.[0]
      ?.fixtureName === "Hearts v Aberdeen",
  "A phone record with the Match wins over an empty PC login stub"
);

const lines = localSponsoredClubMatches([scotmid]);
assert(
  lines.length === 1 &&
    lines[0].clubName === "Hearts" &&
    lines[0].fixtureName === "Hearts v Aberdeen" &&
    lines[0].amountGbp === 500,
  "Who you are sponsoring lists the Club and the Match Scotmid locked in"
);

const dated = localSponsoredMatches({ records: [scotmid] });
assert(
  dated.some(
    (row) =>
      row.clubName === "Hearts" &&
      row.fixtureName === "Hearts v Aberdeen" &&
      row.date === "2026-12-02"
  ),
  "The calendar uses the stored Match date so phone and PC highlight the same day"
);

const fromCatalog = localSponsoredMatches({
  records: [
    {
      ...scotmid,
      matchSponsorships: [{ fixtureName: "Hearts v Aberdeen", amountGbp: 500 }],
    },
  ],
});
assert(
  fromCatalog.some(
    (row) =>
      row.fixtureName === "Hearts v Aberdeen" && row.date === "2026-12-02"
  ),
  "If the phone omitted the date, the Sporting Calendar still finds Hearts v Aberdeen"
);

const lobi = lobiRowsForArea({
  records: [
    scotmid,
    {
      brandName: "CR Smith",
      email: "crsmith@local.test",
      clubName: "Hearts",
      pledgeGbp: 1000,
      createdAt: "2026-10-02T12:00:00.000Z",
      submittedAt: "2026-10-02T12:00:00.000Z",
      postcode: "EH4 2AA",
      source: "registered",
      matchSponsorships: [
        {
          fixtureName: "Hearts v Dundee United",
          amountGbp: 1000,
          date: "2026-12-05",
        },
      ],
    },
  ],
  area: "EH",
  monthKey: "2026-12",
  brandName: "Scotmid Coop",
});
assert(
  lobi.some((row) => row.name === "Scotmid Coop" && row.highlighted) &&
    lobi.some((row) => row.name === "CR Smith" && row.funding === "£1,000"),
  "LOBI uses the stored Match date so phone and PC rank the same month"
);

const fromSponsor = recordFromSponsorRow({
  name: "Scotmid Coop",
  club_name: "Hearts",
  postcode: "EH7 5AA",
  pledge_gbp: 500,
  match_sponsorships: [
    { fixtureName: "Hearts v Aberdeen", amountGbp: 500, date: "2026-12-02" },
  ],
  sponsor_tier: "local",
});
assert(
  fromSponsor?.clubName === "Hearts" &&
    fromSponsor.matchSponsorships?.[0]?.fixtureName === "Hearts v Aberdeen" &&
    localRecordsForBrand("Scotmid Coop", [fromSponsor]).length === 1,
  "Login can rebuild the Local record from the shared sponsor row"
);

const sql = readFileSync(
  "supabase/migrations/0020_local_sponsor_records.sql",
  "utf8"
);
assert(
  sql.includes("create table if not exists public.local_sponsor_records") &&
    sql.includes("match_sponsorships jsonb") &&
    sql.includes("alter table public.sponsors add column if not exists club_name") &&
    sql.includes("sponsor_tier"),
  "Migration 0020 stores Local Club and Match records for every login"
);

const service = readFileSync("app/services/local-sponsor.service.ts", "utf8");
assert(
  service.includes("hydrateLocalSponsorRecords") &&
    service.includes("persistLocalSponsorRecord") &&
    service.includes("fetchClubsForBrand") &&
    service.includes("local_sponsor_records"),
  "The Local sponsor service copies records from this device onto the shared catalog"
);

const home = readFileSync("app/sponsor/local/page.tsx", "utf8");
const login = readFileSync("app/sponsor/login/page.tsx", "utf8");
const register = readFileSync("app/sponsor/local/register/page.tsx", "utf8");
const auth = readFileSync("app/services/sponsor-auth.service.ts", "utf8");
const signed = readFileSync(
  "app/components/sponsor/LocalSignedSponsorHome.tsx",
  "utf8"
);
const lib = readFileSync("app/lib/local-sponsor.ts", "utf8");
assert(
  home.includes("hydrateLocalSponsorRecords") &&
    home.includes("clubMatches") &&
    login.includes("hydrateLocalSponsorRecords") &&
    register.includes("matchSponsorships") &&
    register.includes("calendarFixturesForClub") &&
    auth.includes("match_sponsorships") &&
    auth.includes("club_name") &&
    lib.includes("persistLocalSponsorRecord") &&
    lib.includes("matchSponsorships") &&
    signed.includes("Who you are sponsoring"),
  "Register, login, and Local home share Club and Match instead of keeping them in one browser"
);

if (failures.length > 0) {
  console.error("verify-local-sponsor-sync failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-local-sponsor-sync: ok");
