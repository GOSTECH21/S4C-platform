import { readFileSync } from "fs";
import {
  LEAD_CLIMATE_SPONSOR_LABEL,
  LOCAL_BUSINESS_SPONSOR_LABEL,
} from "../app/lib/dual-sponsor";
import {
  DEFAULT_SPONSOR_LEADERBOARD_CATEGORY,
  DEFAULT_SPONSOR_LEADERBOARD_SCOPE,
  SPONSOR_LEADERBOARD_CATEGORY_OPTIONS,
  SPONSOR_LEADERBOARD_SCOPE_OPTIONS,
  donationEntriesForClubSponsors,
  leaderboardForCategory,
  leaderboardForClub,
  leaderboardForScope,
  rankSponsorDonations,
  sponsorIndustryCategory,
} from "../app/lib/sponsor-leaderboard";

const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const ranked = rankSponsorDonations([
  {
    brandName: "Mash Tun",
    donationGbp: 500,
    clubName: "Hibernian",
    kind: LOCAL_BUSINESS_SPONSOR_LABEL,
  },
  {
    brandName: "American Express",
    donationGbp: 50000,
    clubName: "Hibernian",
    kind: LEAD_CLIMATE_SPONSOR_LABEL,
  },
  {
    brandName: "Tax Assist",
    donationGbp: 750,
    clubName: "Hibernian",
    kind: LOCAL_BUSINESS_SPONSOR_LABEL,
  },
  {
    brandName: "Mash Tun",
    donationGbp: 500,
    clubName: "Hibernian",
    kind: LOCAL_BUSINESS_SPONSOR_LABEL,
  },
  {
    brandName: "Top Cellar",
    donationGbp: 0,
    clubName: "Hibernian",
    kind: LOCAL_BUSINESS_SPONSOR_LABEL,
  },
]);

assert(ranked[0]?.brandName === "American Express", "Largest donation ranks first");
assert(ranked[0]?.rank === 1 && ranked[0]?.donationGbp === 50000, "Amex is rank 1 at £50,000");
assert(ranked[1]?.brandName === "Tax Assist" && ranked[1]?.donationGbp === 750, "Next largest donation is second");
assert(
  ranked.find((row) => row.brandName === "Mash Tun")?.donationGbp === 500,
  "The same Mash Tun pledge is not counted twice"
);
assert(
  ranked.every((row) => row.brandName !== "Top Cellar"),
  "A £0 donation does not appear on the leaderboard"
);
assert(
  ranked.map((row) => row.donationGbp).join(",") === "50000,750,500",
  "Donations run from biggest to smallest"
);

assert(
  DEFAULT_SPONSOR_LEADERBOARD_SCOPE === "global",
  "The Sponsor tab opens on the Global Leaderboard"
);
const globalBoard = leaderboardForScope(ranked, "global");
assert(
  globalBoard.length === 1 &&
    globalBoard[0]?.brandName === "American Express" &&
    globalBoard[0]?.rank === 1,
  "Global Leaderboard ranks Lead Climate Sponsors only"
);
const localBoard = leaderboardForScope(ranked, "local");
assert(
  localBoard[0]?.brandName === "Tax Assist" &&
    localBoard[0]?.rank === 1 &&
    localBoard.every((row) => row.brandName !== "American Express"),
  "Local Leaderboard ranks Local Business Climate Sponsors from largest donation"
);

const mixed = rankSponsorDonations([
  {
    brandName: "American Express",
    donationGbp: 50000,
    clubName: "Hibernian",
    kind: LEAD_CLIMATE_SPONSOR_LABEL,
  },
  {
    brandName: "Diageo",
    donationGbp: 40000,
    clubName: "Liverpool",
    kind: LEAD_CLIMATE_SPONSOR_LABEL,
  },
  {
    brandName: "Mash Tun",
    donationGbp: 500,
    clubName: "Hibernian",
    kind: LOCAL_BUSINESS_SPONSOR_LABEL,
  },
]);
const affiliates = leaderboardForScope(mixed, "affiliates", ["Hibernian"]);
assert(
  affiliates.map((row) => row.brandName).join(",") === "American Express,Mash Tun",
  "Affiliates ranks only sponsors of the club on the board"
);
assert(
  affiliates.every((row) => row.brandName !== "Diageo"),
  "Affiliates does not include sponsors of another club"
);
assert(
  affiliates[0]?.rank === 1 &&
    affiliates[0]?.donationGbp === 50000 &&
    affiliates[1]?.rank === 2 &&
    affiliates[1]?.donationGbp === 500,
  "Affiliates ranks chosen-club sponsors from largest donation to smallest"
);
assert(
  affiliates.some((row) => row.kind === LEAD_CLIMATE_SPONSOR_LABEL) &&
    affiliates.some((row) => row.kind === LOCAL_BUSINESS_SPONSOR_LABEL),
  "Affiliates includes both lead and local sponsors of the chosen club"
);
assert(
  leaderboardForScope(mixed, "affiliates", []).length === 0,
  "Affiliates is empty until a club is provided"
);

const arsenalVsHibs = rankSponsorDonations([
  {
    brandName: "Puma",
    donationGbp: 3500,
    clubName: "Arsenal",
    kind: LEAD_CLIMATE_SPONSOR_LABEL,
  },
  {
    brandName: "The Fountain",
    donationGbp: 800,
    clubName: "Arsenal",
    kind: LOCAL_BUSINESS_SPONSOR_LABEL,
  },
  {
    brandName: "American Express",
    donationGbp: 998.5,
    clubName: "Hibernian",
    kind: LEAD_CLIMATE_SPONSOR_LABEL,
  },
  {
    brandName: "Mash Tun",
    donationGbp: 1500,
    clubName: "Hibernian",
    kind: LOCAL_BUSINESS_SPONSOR_LABEL,
  },
  {
    brandName: "Kokobean Cafe",
    donationGbp: 1200,
    clubName: "Hibernian",
    kind: LOCAL_BUSINESS_SPONSOR_LABEL,
  },
  {
    brandName: "Interval",
    donationGbp: 1000,
    clubName: "Hibernian",
    kind: LOCAL_BUSINESS_SPONSOR_LABEL,
  },
  {
    brandName: "Top Cellar",
    donationGbp: 500,
    clubName: "Hibernian",
    kind: LOCAL_BUSINESS_SPONSOR_LABEL,
  },
]);
const arsenalClub = ["Arsenal FC"];
const arsenalLocal = leaderboardForScope(arsenalVsHibs, "local", arsenalClub);
const arsenalRestaurants = leaderboardForCategory(arsenalLocal, "restaurants");
assert(
  arsenalLocal.length === 1 &&
    arsenalLocal[0]?.brandName === "The Fountain" &&
    arsenalLocal[0]?.clubNames.join(",") === "Arsenal",
  "Arsenal Local Leaderboard keeps The Fountain and drops Hibernian restaurants"
);
assert(
  arsenalLocal.every(
    (row) =>
      !/hibernian|mash tun|kokobean|interval|top cellar/i.test(
        `${row.brandName} ${row.clubNames.join(" ")}`
      )
  ),
  "Arsenal Local Leaderboard never lists Mash Tun, Kokobean Cafe, Interval or Top Cellar"
);
assert(
  arsenalRestaurants.length === 0,
  "Arsenal Restaurants is empty when only Hibernian pubs are in the leftover data"
);
assert(
  leaderboardForScope(arsenalVsHibs, "global", arsenalClub).map(
    (row) => row.brandName
  ).join(",") === "Puma" &&
    leaderboardForScope(arsenalVsHibs, "global", arsenalClub).every(
      (row) => row.brandName !== "American Express"
    ),
  "Arsenal Global Leaderboard is Puma, not Hibernian's American Express"
);
assert(
  leaderboardForClub(arsenalVsHibs, arsenalClub).every((row) =>
    row.clubNames.every((club) => /arsenal/i.test(club))
  ) &&
    !leaderboardForClub(arsenalVsHibs, arsenalClub).some((row) =>
      /mash tun|kokobean/i.test(row.brandName)
    ),
  "The club board only keeps sponsors of the stated club"
);

const arsenalInbound = rankSponsorDonations(
  donationEntriesForClubSponsors({
    clubName: "Arsenal FC",
    leads: [{ brandName: "Puma" }],
    locals: [
      {
        brandName: "The Fountain",
        pledgeGbp: 800,
        matchSponsorships: [{ amountGbp: 800 }],
      },
    ],
    walletAmounts: [{ brandName: "Puma", amountGbp: 3499.8 }],
  })
);
assert(
  arsenalInbound.map((row) => row.brandName).join(",") ===
    "Puma,The Fountain" &&
    arsenalInbound[0]?.kind === LEAD_CLIMATE_SPONSOR_LABEL &&
    arsenalInbound[1]?.kind === LOCAL_BUSINESS_SPONSOR_LABEL &&
    arsenalInbound[1]?.donationGbp === 800,
  "Arsenal's inbound board lists Puma and The Fountain"
);
assert(
  leaderboardForScope(arsenalInbound, "global", ["Arsenal"]).map(
    (row) => row.brandName
  ).join(",") === "Puma",
  "Arsenal Global Leaderboard is the Lead Climate Sponsor Puma"
);
assert(
  leaderboardForScope(arsenalInbound, "local", ["Arsenal"]).map(
    (row) => row.brandName
  ).join(",") === "The Fountain",
  "Arsenal Local Leaderboard is The Fountain"
);
assert(
  !arsenalInbound.some((row) =>
    /american express|aberdeen|budweiser|gillette|diageo|mash tun/i.test(
      row.brandName
    )
  ),
  "Arsenal inbound sponsors never include other clubs' brands"
);

const hibsMisfiledLeads = rankSponsorDonations(
  donationEntriesForClubSponsors({
    clubName: "Hibernian",
    leads: [
      { brandName: "American Express" },
      { brandName: "Interval" },
      { brandName: "Kokobean Cafe" },
      { brandName: "Tax Assist" },
      { brandName: "Top Cellar" },
    ],
    locals: [{ brandName: "Mash Tun", pledgeGbp: 500 }],
  })
);
assert(
  hibsMisfiledLeads
    .filter((row) => row.kind === LEAD_CLIMATE_SPONSOR_LABEL)
    .map((row) => row.brandName)
    .join(",") === "American Express",
  "Hibernian Global Leaderboard is only American Express"
);
assert(
  hibsMisfiledLeads
    .filter((row) => row.kind === LOCAL_BUSINESS_SPONSOR_LABEL)
    .map((row) => row.brandName)
    .sort()
    .join(",") === "Interval,Kokobean Cafe,Mash Tun,Tax Assist,Top Cellar",
  "Misfiled Hibernian locals move to the Local Business Climate Sponsor board"
);
assert(
  !hibsMisfiledLeads.some((row) => /puma|fountain|aberdeen|budweiser/i.test(row.brandName)),
  "Hibernian inbound sponsors never include Arsenal or other clubs' brands"
);
assert(
  rankSponsorDonations(
    donationEntriesForClubSponsors({
      clubName: "Arsenal",
      leads: [{ brandName: "Puma" }],
      locals: [],
    })
  ).some((row) => row.brandName === "Puma"),
  "An inbound Lead Climate Sponsor still appears before cash is recorded"
);

const splitBrand = rankSponsorDonations([
  {
    brandName: "American Express",
    donationGbp: 50000,
    clubName: "Hibernian",
    kind: LEAD_CLIMATE_SPONSOR_LABEL,
  },
  {
    brandName: "American Express",
    donationGbp: 20000,
    clubName: "Hearts of Midlothian",
    kind: LEAD_CLIMATE_SPONSOR_LABEL,
  },
]);
const hibsAffiliates = leaderboardForScope(splitBrand, "affiliates", [
  "Hibernian FC",
]);
assert(
  hibsAffiliates.length === 1 &&
    hibsAffiliates[0]?.donationGbp === 50000 &&
    hibsAffiliates[0]?.clubNames.join(",") === "Hibernian",
  "Affiliates counts only the donation to the selected club"
);
assert(
  SPONSOR_LEADERBOARD_SCOPE_OPTIONS.find((option) => option.value === "affiliates")
    ?.label === "Affiliates",
  "The select menu labels the section Affiliates"
);
assert(
  SPONSOR_LEADERBOARD_SCOPE_OPTIONS.some((option) => option.value === "affiliates") &&
    readFileSync("app/components/fan/SponsorLeaderboard.tsx", "utf8").includes(
      "affiliateClubs"
    ),
  "The select menu includes Affiliates"
);
assert(
  readFileSync("app/components/fan/SponsorLeaderboard.tsx", "utf8").includes(
    "Select leaderboard"
  ) &&
    readFileSync("app/components/fan/SponsorLeaderboard.tsx", "utf8").includes(
      "DEFAULT_SPONSOR_LEADERBOARD_SCOPE"
    ),
  "The Sponsor Leaderboard has a select menu that defaults to Global"
);

const nav = readFileSync("app/dashboard/supporter/components/FanNav.tsx", "utf8");
assert(
  !nav.includes('label: "Sponsor"') && !nav.includes("SUPPORTER_SPONSOR_PATH"),
  "Fan navigation no longer has a Sponsor tab"
);
assert(
  readFileSync("app/dashboard/supporter/sponsors/page.tsx", "utf8").includes(
    "redirect(SUPPORTER_CAMPAIGN_PATH)"
  ),
  "The old fan Sponsor URL sends supporters back to My S4P"
);
assert(
  readFileSync("app/lib/routes.ts", "utf8").includes(
    "CLUB_SPONSOR_LEADERBOARD_PATH"
  ) &&
    readFileSync("app/components/club/ClubNav.tsx", "utf8").includes(
      'label: "Sponsor"'
    ) &&
    readFileSync("app/components/club/ClubNav.tsx", "utf8").includes(
      "CLUB_SPONSOR_LEADERBOARD_PATH"
    ),
  "Club navigation has the Sponsor tab"
);
assert(
  readFileSync("app/club/sponsor/page.tsx", "utf8").includes(
    "Sponsor Leaderboard"
  ) &&
    readFileSync("app/club/sponsor/page.tsx", "utf8").includes(
      "loadClubSponsorLeaderboard(session.club.name)"
    ) &&
    readFileSync("app/club/sponsor/page.tsx", "utf8").includes(
      "affiliateClubs={[clubName]}"
    ) &&
    readFileSync("app/club/sponsor/page.tsx", "utf8").includes(
      "This board is"
    ) &&
    readFileSync("app/club/sponsor/page.tsx", "utf8").includes(
      "one Lead Climate Sponsor"
    ) &&
    readFileSync("app/club/sponsor/page.tsx", "utf8").includes("ClubNav"),
  "The club Sponsor tab loads and ranks only that club's Lead and Local sponsors"
);
assert(
  readFileSync("app/club/dashboard/page.tsx", "utf8").includes("<ClubNav") &&
    readFileSync("app/club/projects/select/page.tsx", "utf8").includes(
      "<ClubNav"
    ),
  "Club Dashboard and Climate Projects keep the Sponsor tab in reach while choosing projects"
);

assert(
  sponsorIndustryCategory("Kokobean Cafe") === "restaurants" &&
    sponsorIndustryCategory("Mash Tun") === "restaurants" &&
    sponsorIndustryCategory("BMW") === "car-companies" &&
    sponsorIndustryCategory("Marriott") === "hotels" &&
    sponsorIndustryCategory("Puma") === "fashion-retailers" &&
    sponsorIndustryCategory("American Express") === "others" &&
    sponsorIndustryCategory("Tax Assist") === "others",
  "Sponsors map to Restaurants, Car Companies, Hotels, Fashion Retailers, or Others"
);
assert(
  DEFAULT_SPONSOR_LEADERBOARD_CATEGORY === "all" &&
    SPONSOR_LEADERBOARD_CATEGORY_OPTIONS.map((option) => option.label).join(",") ===
      "All Categories,Restaurants,Car Companies,Hotels,Fashion Retailers,Others",
  "Sort-Selector lists the sponsor categories"
);

const mixedCategories = rankSponsorDonations([
  {
    brandName: "American Express",
    donationGbp: 50000,
    clubName: "Hibernian",
    kind: LEAD_CLIMATE_SPONSOR_LABEL,
  },
  {
    brandName: "BMW",
    donationGbp: 30000,
    clubName: "Liverpool",
    kind: LEAD_CLIMATE_SPONSOR_LABEL,
  },
  {
    brandName: "Puma",
    donationGbp: 25000,
    clubName: "Liverpool",
    kind: LEAD_CLIMATE_SPONSOR_LABEL,
  },
  {
    brandName: "Marriott",
    donationGbp: 12000,
    clubName: "Hibernian",
    kind: LEAD_CLIMATE_SPONSOR_LABEL,
  },
  {
    brandName: "Mash Tun",
    donationGbp: 750,
    clubName: "Hibernian",
    kind: LOCAL_BUSINESS_SPONSOR_LABEL,
  },
  {
    brandName: "Kokobean Cafe",
    donationGbp: 1000,
    clubName: "Hibernian",
    kind: LOCAL_BUSINESS_SPONSOR_LABEL,
  },
  {
    brandName: "Tax Assist",
    donationGbp: 500,
    clubName: "Hibernian",
    kind: LOCAL_BUSINESS_SPONSOR_LABEL,
  },
]);
const restaurants = leaderboardForCategory(mixedCategories, "restaurants");
assert(
  restaurants.map((row) => row.brandName).join(",") === "Kokobean Cafe,Mash Tun" &&
    restaurants[0]?.rank === 1 &&
    restaurants[1]?.rank === 2,
  "Sort-Selector ranks Restaurants from the largest donation"
);
assert(
  leaderboardForCategory(mixedCategories, "car-companies").map(
    (row) => row.brandName
  ).join(",") === "BMW",
  "Sort-Selector ranks Car Companies"
);
assert(
  leaderboardForCategory(mixedCategories, "hotels")[0]?.brandName === "Marriott",
  "Sort-Selector ranks Hotels"
);
assert(
  leaderboardForCategory(mixedCategories, "fashion-retailers")[0]?.brandName ===
    "Puma",
  "Sort-Selector ranks Fashion Retailers"
);
const others = leaderboardForCategory(
  leaderboardForScope(mixedCategories, "global"),
  "others"
);
assert(
  others.map((row) => row.brandName).join(",") === "American Express" &&
    others[0]?.rank === 1,
  "Others on Global Leaderboard is re-ranked without car, hotel, or fashion brands"
);
assert(
  leaderboardForCategory(mixedCategories, "all").length === mixedCategories.length,
  "All Categories keeps the full leaderboard ranking"
);
assert(
  readFileSync("app/components/fan/SponsorLeaderboard.tsx", "utf8").includes(
    "Sort-Selector"
  ) &&
    readFileSync("app/components/fan/SponsorLeaderboard.tsx", "utf8").includes(
      "sm:flex-row"
    ),
  "Sort-Selector sits beside the Leaderboard select"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Club Sponsor tab ranks donations from largest to smallest.");
