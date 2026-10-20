import { readFileSync } from "fs";
import {
  brandLocalFundingInMonth,
  inferredPostcodeArea,
  lobiRowsForArea,
  localFundingInMonth,
  LOBI_AREA_COPY,
  LOBI_DESCRIPTION,
  postcodeArea,
} from "../app/lib/lobi";
import {
  localCommittedGbp,
  localRecordsForBrand,
  localSponsoredMatches,
} from "../app/lib/local-sponsor-home";
import { sponsorHomePath } from "../app/lib/sponsor-home";
import {
  LOCAL_SPONSOR_HOME_PATH,
  SPONSOR_DASHBOARD_PATH,
  localNewSponsorshipPath,
} from "../app/lib/routes";
import type { LocalSponsorRecord } from "../app/lib/local-sponsor";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(postcodeArea("EH7 5AA") === "EH", "EH7 5AA sits in the EH postcode area");
assert(postcodeArea("eh6 6ad") === "EH", "Lower-case Edinburgh postcodes still map to EH");
assert(postcodeArea("N7 7AJ") === "N", "Arsenal-area postcodes map to N");

const mashHibs: LocalSponsorRecord = {
  brandName: "Mash Tun",
  email: "mash@local.test",
  clubName: "Hibernian",
  pledgeGbp: 600,
  createdAt: "2026-10-01T12:00:00.000Z",
  submittedAt: "2026-10-01T12:00:00.000Z",
  postcode: "EH7 5AA",
  source: "registered",
  matchSponsorships: [
    { fixtureName: "Hibernian v Motherwell", amountGbp: 600 },
  ],
};
const mashHearts: LocalSponsorRecord = {
  ...mashHibs,
  clubName: "Hearts",
  pledgeGbp: 600,
  matchSponsorships: [{ fixtureName: "Hearts v Aberdeen", amountGbp: 600 }],
};
const cheaper: LocalSponsorRecord = {
  brandName: "Kokobean Cafe",
  email: "koko@local.test",
  clubName: "Hibernian",
  pledgeGbp: 1000,
  createdAt: "2026-10-02T12:00:00.000Z",
  submittedAt: "2026-10-02T12:00:00.000Z",
  postcode: "EH6 6AA",
  source: "registered",
  matchSponsorships: [{ fixtureName: "Hibernian v Dundee", amountGbp: 1000 }],
};
const fixtures = [
  { fixtureName: "Hibernian v Motherwell", date: "2026-10-18" },
  { fixtureName: "Hearts v Aberdeen", date: "2026-10-31" },
  { fixtureName: "Hibernian v Dundee", date: "2026-10-25" },
];

assert(
  localFundingInMonth(mashHibs, "2026-10", fixtures) === 600 &&
    localFundingInMonth(mashHearts, "2026-10", fixtures) === 600,
  "Each Mash Tun Match in October counts its own amount"
);
assert(
  brandLocalFundingInMonth({
    records: [mashHibs, mashHearts, cheaper],
    brandName: "Mash Tun",
    monthKey: "2026-10",
    fixtures,
  }) === 1200,
  "Hearts £600 plus Hibernian £600 is £1,200 for Mash Tun in October"
);
assert(
  localCommittedGbp([mashHibs, mashHearts]) === 1200,
  "Local committed total sums every club the business sponsored"
);

const rows = lobiRowsForArea({
  records: [mashHibs, mashHearts, cheaper],
  area: "EH",
  monthKey: "2026-10",
  brandName: "Mash Tun",
  fixtures,
});
assert(
  rows[0]?.name === "Mash Tun" &&
    rows[0]?.rank === 1 &&
    rows[0]?.highlighted &&
    rows[1]?.name === "Kokobean Cafe" &&
    rows[1]?.rank === 2,
  "£1,200 across Hearts and Hibernian ranks above a £1,000 EH business"
);
assert(
  inferredPostcodeArea(mashHibs) === "EH",
  "Mash Tun's Easter Road postcode is the EH area"
);

const fulhamPier: LocalSponsorRecord = {
  brandName: "Fulham Pier",
  email: "pier@local.test",
  clubName: "Fulham",
  pledgeGbp: 800,
  createdAt: "2026-10-01T12:00:00.000Z",
  submittedAt: "2026-10-01T12:00:00.000Z",
  signedAt: "2026-10-01T12:00:00.000Z",
  postcode: "SW6 1AA",
  source: "registered",
  matchSponsorships: [
    { fixtureName: "Coventry City v Fulham", amountGbp: 800 },
  ],
};
const fulhamDuplicate: LocalSponsorRecord = {
  brandName: "Fulham Pier",
  email: "pier@local.test",
  clubName: "Fulham",
  pledgeGbp: 500,
  createdAt: "2026-10-01T12:00:00.000Z",
  source: "uploaded",
};
const fulhamFixtures = [
  { fixtureName: "Coventry City v Fulham", date: "2026-10-24" },
];
assert(
  localCommittedGbp([fulhamPier, fulhamDuplicate, fulhamPier]) === 800,
  "Fulham Pier's pledged Match amount is counted once"
);
assert(
  localRecordsForBrand("Fulham Pier", [fulhamPier, fulhamDuplicate, fulhamPier])
    .length === 1,
  "The same Fulham Pier Fulham record is not listed twice"
);
const fulhamRows = lobiRowsForArea({
  records: [fulhamPier, fulhamDuplicate],
  area: "SW",
  monthKey: "2026-10",
  brandName: "Fulham Pier",
  ownFundingGbp: 1300,
  fixtures: fulhamFixtures,
});
assert(
  fulhamRows[0]?.name === "Fulham Pier" &&
    fulhamRows[0]?.funding === "£800" &&
    fulhamRows[0]?.postcodeArea === "SW",
  "LOBI shows the exact Fulham Pier Match pledge, not £1,300"
);
assert(
  inferredPostcodeArea(fulhamPier) === "SW",
  "Fulham Pier's SW6 postcode sits in the SW local area"
);

const matches = localSponsoredMatches({
  records: [mashHibs, mashHearts],
  fixtures: fixtures.map((row) => ({
    id: row.fixtureName,
    homeName: row.fixtureName.split(" v ")[0],
    awayName: row.fixtureName.split(" v ")[1],
    fixtureName: row.fixtureName,
    competition: "Scottish Premiership Match",
    date: row.date,
    kickoff: null,
    venue: null,
    sourceUrl: null,
  })),
});
assert(
  matches.some((row) => row.fixtureName === "Hibernian v Motherwell" && row.date === "2026-10-18") &&
    matches.some((row) => row.fixtureName === "Hearts v Aberdeen" && row.date === "2026-10-31"),
  "The Local calendar lists both Hibernian v Motherwell and Hearts v Aberdeen"
);

assert(
  sponsorHomePath("Mash Tun") === LOCAL_SPONSOR_HOME_PATH &&
    sponsorHomePath("Piazza Italiana") === LOCAL_SPONSOR_HOME_PATH &&
    sponsorHomePath("American Express") === SPONSOR_DASHBOARD_PATH,
  "Local login lands on the LOBI home, not the Lead dashboard or wallet"
);
assert(
  localNewSponsorshipPath() === "/sponsor/wallet?new=1",
  "New Local sponsorship still opens Club + Match, the cash table, and the five-project record"
);

const homePage = readFileSync("app/sponsor/local/page.tsx", "utf8");
const walletPage = readFileSync("app/sponsor/wallet/page.tsx", "utf8");
const registerPage = readFileSync("app/sponsor/local/register/page.tsx", "utf8");
assert(
  homePage.includes("LocalSignedSponsorHome") &&
    homePage.includes("lobiRowsForArea") &&
    walletPage.includes("LOCAL_SPONSOR_HOME_PATH") &&
    registerPage.includes("LOCAL_SPONSOR_HOME_PATH"),
  "Local login, wallet bounce, and register all use the LOBI home"
);
assert(
  walletPage.includes("SeeMatchDetails") &&
    walletPage.includes("MATCH_DAY_PROJECTS_RECORD_LABEL") &&
    walletPage.includes("LOCAL_FIVE_RECORD_COPY"),
  "Local New Sponsorship shows See Match details, the cash table, and the five as a record"
);
assert(
  readFileSync("app/components/sponsor/LocalSignedSponsorHome.tsx", "utf8").includes(
    "SponsorLobiTable"
  ) &&
    readFileSync("app/components/sponsor/LocalSignedSponsorHome.tsx", "utf8").includes(
      "SponsoredMatchCalendar"
    ) &&
    readFileSync("app/components/sponsor/LocalSignedSponsorHome.tsx", "utf8").includes(
      "FundedClimateProjectsList"
    ),
  "The Local home shows calendar, where money went, and LOBI"
);

const moneyWent = readFileSync(
  "app/components/sponsor/FundedClimateProjectsList.tsx",
  "utf8"
);
assert(
  moneyWent.includes(
    "Fans take £0.20 from your Carbon Wallet, and Donate it to a Climate Project of their choice. Your business name and logo will be visible to these Fans."
  ) &&
    moneyWent.includes('kind !== "local"') &&
    !moneyWent.includes(
      "Fans take £0.20 from your Climate Sponsorship Wallet onto numbered Climate Projects"
    ),
  "Local Where your money went uses Carbon Wallet copy for every Local Business"
);
assert(
  LOBI_DESCRIPTION.includes(
    "by their monthly climate funding. A business that puts the most money into Climate Projects that results in more climate impacts is ranked the highest."
  ) &&
    !LOBI_DESCRIPTION.includes("Hearts and Hibernian") &&
    !LOBI_DESCRIPTION.includes("£1,200") &&
    LOBI_AREA_COPY === "This table is for your Local Area Postcode" &&
    readFileSync("app/components/sponsor/SponsorLobiTable.tsx", "utf8").includes(
      "LOBI_AREA_COPY"
    ) &&
    !readFileSync("app/components/sponsor/SponsorLobiTable.tsx", "utf8").includes(
      "This table is the"
    ),
  "LOBI copy ranks by climate funding and names the local area postcode, not Hearts and Hibernian"
);

if (failures.length > 0) {
  console.error("verify-local-lobi-home failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-local-lobi-home: ok");
