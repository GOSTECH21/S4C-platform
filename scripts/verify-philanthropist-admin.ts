import { readFileSync } from "fs";
import {
  PHILANTHROPIST_ADMIN_HEADING,
  PHILANTHROPIST_ADMIN_NAV,
  PHILANTHROPIST_PST_SHORT,
  PHILANTHROPIST_PST_TITLE,
  philanthropistDisplayName,
  type PhilanthropistRecord,
} from "../app/lib/philanthropist";
import {
  fansEngagedFromTakes,
  philanthropistAdminSnapshot,
  philanthropistMatchesForClub,
} from "../app/lib/philanthropist-admin";
import {
  PST_ALL_AREA,
  PST_CATALOG,
  countryForClub,
  mergePstCatalog,
  pstOwnRow,
  pstPositionCopy,
  pstRowsForArea,
} from "../app/lib/pst";
import {
  PHILANTHROPIST_ADMIN_ID,
  PHILANTHROPIST_ADMIN_PATH,
  PHILANTHROPIST_HOME_PATH,
  PHILANTHROPIST_PST_ID,
} from "../app/lib/routes";
import {
  isLocalClimateSponsor,
  sponsorHomePath,
} from "../app/lib/sponsor-home";
import { namesMatch } from "../app/lib/upcoming-matches";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const smith: PhilanthropistRecord = {
  name: "Alex Smith",
  organisation: "The Smith Foundation",
  email: "alex@smith-foundation.test",
  clubName: "Brighton & Hove Albion",
  giftGbp: 17500,
  createdAt: "2026-11-16T10:00:00.000Z",
};

assert(
  countryForClub("Brighton & Hove Albion") === "England" &&
    countryForClub("Brighton") === "England" &&
    countryForClub("Rangers") === "Scotland" &&
    countryForClub("Hearts") === "Scotland",
  "PST areas follow the Sporting Calendar country for the club"
);

const england = pstRowsForArea({
  area: "England",
  ownName: philanthropistDisplayName(smith),
  catalog: mergePstCatalog([smith], PST_CATALOG),
});
const smithEngland = pstOwnRow(england, "The Smith Foundation");
assert(
  england[0]?.organisation === "North Stand Gift" &&
    smithEngland?.rank === 3 &&
    smithEngland.funding === "£17,500" &&
    smithEngland.clubs.includes("Brighton & Hove Albion") &&
    pstPositionCopy(smithEngland, "England") === "You are #3 in England",
  "The Smith Foundation is 3rd in England on PST by climate funding"
);

const scotland = pstRowsForArea({ area: "Scotland" });
assert(
  scotland[0]?.organisation === "Parkhead Foundation" &&
    scotland[0]?.country === "Scotland" &&
    pstOwnRow(scotland, "Davies Family Trust")?.rank === 2 &&
    !scotland.some((row) => /queens park rangers/i.test(row.clubs.join(" "))),
  "Scotland PST ranks Celtic then Rangers philanthropists, never QPR"
);

const all = pstRowsForArea({ area: PST_ALL_AREA, ownName: "The Smith Foundation" });
assert(
  all.length >= 8 &&
    pstOwnRow(all, "The Smith Foundation")?.highlighted === true &&
    pstPositionCopy(null, "Scotland").includes("not yet ranked in Scotland"),
  "All-areas PST includes every catalog philanthropist and highlights the signed-in name"
);

const snapshot = philanthropistAdminSnapshot({
  record: smith,
  takes: [
    {
      brandName: "The Smith Foundation",
      clubName: "Brighton & Hove Albion",
    },
    {
      brandName: "The Smith Foundation",
      clubName: "Brighton & Hove Albion",
    },
  ],
  now: "2026-11-16T12:00:00.000Z",
});
assert(
  snapshot.clubs.length === 1 &&
    snapshot.clubs[0]?.clubName === "Brighton & Hove Albion" &&
    snapshot.clubs[0]?.country === "England" &&
    snapshot.clubs[0]?.giftLabel === "£17,500 per match" &&
    snapshot.clubs[0]?.fansEngaged === 2 &&
    snapshot.fansEngaged === 2,
  "My S4P Admin lists the funded club, per-match gift and fans who took £0.50"
);

assert(
  snapshot.matches.length > 0 &&
    snapshot.matches.every((row) => row.amountLabel === "£17,500") &&
    snapshot.matches.some((row) => /Hull City vs Brighton/i.test(row.fixtureName)) &&
    snapshot.matches.some((row) => row.statusLabel === "Sponsoring") &&
    !snapshot.matches.some((row) => /queens park rangers/i.test(row.fixtureName)),
  "My S4P Admin lists Brighton Match Days at £17,500, including Hull City vs Brighton"
);

assert(
  philanthropistMatchesForClub("Rangers", 12500, "2026-11-16").every(
    (row) =>
      namesMatch(row.clubName, "Rangers") &&
      !/queens park rangers/i.test(row.fixtureName)
  ) && fansEngagedFromTakes([], "The Smith Foundation") === 0,
  "A Rangers philanthropist does not pick up Queens Park Rangers fixtures"
);

const home = readFileSync("app/sponsor/philanthropist/page.tsx", "utf8");
const nav = readFileSync("app/sponsor/sponsor-nav.tsx", "utf8");
const admin = readFileSync(
  "app/components/sponsor/PhilanthropistAdmin.tsx",
  "utf8"
);
const table = readFileSync(
  "app/components/sponsor/PhilanthropistSponsorsTable.tsx",
  "utf8"
);

assert(
  PHILANTHROPIST_ADMIN_HEADING === "My S4P Admin" &&
    PHILANTHROPIST_ADMIN_NAV === "My S4P Admin" &&
    PHILANTHROPIST_PST_SHORT === "PST" &&
    PHILANTHROPIST_PST_TITLE === "Philanthropist Sponsors Table (PST)" &&
    PHILANTHROPIST_ADMIN_PATH === `${PHILANTHROPIST_HOME_PATH}#${PHILANTHROPIST_ADMIN_ID}` &&
    PHILANTHROPIST_PST_ID === "pst" &&
    home.includes("PhilanthropistAdmin") &&
    home.includes("PhilanthropistSponsorsTable") &&
    home.includes("PhilanthropistMatchGift") &&
    nav.includes("PHILANTHROPIST_ADMIN_NAV") &&
    nav.includes("PHILANTHROPIST_ADMIN_PATH") &&
    nav.includes("getElementById(PHILANTHROPIST_ADMIN_ID)") &&
    home.includes("PHILANTHROPIST_ADMIN_ID") &&
    home.includes("scrollIntoView") &&
    home.includes("adminRecord") &&
    !isLocalClimateSponsor("The Smith Foundation", {
      jobTitle: "Philanthropist",
    }) &&
    sponsorHomePath("The Smith Foundation", {
      jobTitle: "Philanthropist",
    }) === PHILANTHROPIST_HOME_PATH &&
    readFileSync("app/sponsor/local/page.tsx", "utf8").includes(
      "PHILANTHROPIST_HOME_PATH"
    ) &&
    readFileSync("app/sponsor/login/page.tsx", "utf8").includes(
      "isPhilanthropistSponsor(brandName, { jobTitle })"
    ) &&
    nav.includes("showInvitations = true") &&
    nav.includes("inviteTabFlashClass") &&
    admin.includes("PHILANTHROPIST_ADMIN_COPY") &&
    table.includes("PHILANTHROPIST_PST_COPY") &&
    table.includes("Your position") &&
    table.includes("data-pst-area"),
  "Philanthropist home, nav and PST copy are wired to My S4P Admin"
);

if (failures.length > 0) {
  console.error("verify-philanthropist-admin failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-philanthropist-admin: ok");
