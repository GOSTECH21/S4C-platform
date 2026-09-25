import { readFileSync } from "fs";
import {
  LEAD_CLIMATE_SPONSOR_LABEL,
  LOCAL_BUSINESS_SPONSOR_LABEL,
} from "../app/lib/dual-sponsor";
import { rankSponsorDonations } from "../app/lib/sponsor-leaderboard";

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

const nav = readFileSync("app/dashboard/supporter/components/FanNav.tsx", "utf8");
assert(
  nav.includes('label: "Sponsor"') && nav.includes("SUPPORTER_SPONSOR_PATH"),
  "Fan navigation has a Sponsor tab"
);
assert(
  readFileSync("app/dashboard/supporter/sponsors/page.tsx", "utf8").includes(
    "Sponsor Leaderboard"
  ),
  "The Sponsor tab shows the donation leaderboard"
);
assert(
  readFileSync("app/lib/routes.ts", "utf8").includes("SUPPORTER_SPONSOR_PATH"),
  "Sponsor tab has a supporter route"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Sponsor tab ranks donations from largest to smallest.");
