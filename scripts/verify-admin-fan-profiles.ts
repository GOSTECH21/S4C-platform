import { readFileSync } from "fs";
import {
  ADMIN_FAN_PROFILE_STAMP,
  buildStaffFanProfile,
  formatFanDonationGbp,
  p4pCategoryLabels,
  sampleStaffFanProfile,
  staffFanProfileHref,
  totalFanDonationsGbp,
} from "../app/lib/admin-fan-profile";
import { adminFanProfilePath } from "../app/lib/routes";

const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const sample = sampleStaffFanProfile();
assert(sample.fan.fullName === "Alex Mobile", "Sample profile keeps the fan name");
assert(
  sample.totalDonationsGbp === 12.9,
  "Total donations add Carbon Wallet takes and P4P funds"
);
assert(
  formatFanDonationGbp(12.9) === "£12.90",
  "Donation totals display as pounds"
);
assert(
  sample.projects.some((row) => row.projectName === "Global Schools Solar") &&
    sample.predictions[0]?.categoryLabels.includes("Corner awarded") &&
    sample.matchrav[0]?.outboundMode === "Train",
  "Profile carries Climate Projects, P4P predictions and Matchrav"
);
assert(
  totalFanDonationsGbp([{ amountGbp: 10 }, { amountGbp: 0.4 }]) === 10.4,
  "Donation helper rounds a mixed wallet and P4P total"
);
assert(
  p4pCategoryLabels({
    categoryId: "corner",
    categoryIds: ["corner", "yellow-card", "foul"],
  }).join(",") === "Corner awarded,Yellow card issued,Foul committed",
  "P4P profile rows name the three chosen events"
);
assert(
  staffFanProfileHref("abc-123") === adminFanProfilePath("abc-123") &&
    adminFanProfilePath("abc-123") === "/admin/fans/abc-123",
  "Each fan opens /admin/fans/{id}"
);

const built = buildStaffFanProfile({
  fan: {
    id: "1",
    fullName: "Sam Fan",
    email: "sam@example.com",
    clubName: "Rangers",
  },
  donations: [
    {
      projectName: "Wee Spoke Hub",
      clubName: "Rangers",
      brandName: "P4P",
      amountGbp: 0.4,
      source: "p4p",
      at: "2026-11-09T12:00:00.000Z",
    },
  ],
});
assert(built.totalDonationsGbp === 0.4, "Built profiles total the listed donations");
assert(built.clubs.join(",") === "Rangers", "Profile clubs keep the registered team");

const adminPage = readFileSync("app/admin/page.tsx", "utf8");
const profilePage = readFileSync("app/admin/fans/[id]/page.tsx", "utf8");
const view = readFileSync("app/components/admin/AdminFanProfileView.tsx", "utf8");
const activity = readFileSync("app/services/fan-activity.service.ts", "utf8");
const p4p = readFileSync("app/services/predict-for-planet.service.ts", "utf8");
const matchrav = readFileSync("app/components/fan/FanMatchravPanel.tsx", "utf8");
const takes = readFileSync("app/services/climate-wallet-takes.service.ts", "utf8");
const sql = readFileSync("supabase/migrations/0021_admin_fan_profiles.sql", "utf8");
const workspace = readFileSync("app/components/fan/FanCampaignWorkspace.tsx", "utf8");

assert(
  adminPage.includes("staffFanProfileHref") &&
    adminPage.includes("data-admin-fan-link") &&
    /Climate Projects they funded/i.test(adminPage),
  "Admin Fans by club names open individual profiles"
);
assert(
  profilePage.includes("loadStaffFanProfile") &&
    profilePage.includes("AdminFanProfileView"),
  "Admin fan route loads the staff profile"
);
assert(
  view.includes("ADMIN_FAN_PROFILE_STAMP") &&
    view.includes("Climate Projects allotted funds") &&
    view.includes("Donations") &&
    view.includes("P4P predictions") &&
    view.includes("Matchrav") &&
    view.includes("ADMIN_PATH"),
  "Fan profile shows projects, donations, P4P and Matchrav"
);
assert(
  activity.includes("fan_p4p_predictions") &&
    activity.includes("fan_p4p_project_funds") &&
    activity.includes("fan_matchrav_trips") &&
    activity.includes("loadStaffFanProfile"),
  "Staff profiles read hosted P4P, funds and Matchrav rows"
);
assert(
  p4p.includes("persistStaffP4pPrediction") &&
    p4p.includes("persistStaffP4pFund") &&
    matchrav.includes("persistStaffMatchravTrip") &&
    takes.includes("supporter_id") &&
    workspace.includes("syncFanActivityToStaff"),
  "Phone P4P, Matchrav and wallet takes save against the signed-in fan"
);
assert(
  sql.includes("fan_p4p_predictions") &&
    sql.includes("fan_matchrav_trips") &&
    sql.includes("S4P staff can view supporter votes") &&
    sql.includes("create or replace function public.is_s4p_staff()") &&
    sql.includes("create table if not exists public.climate_wallet_takes") &&
    sql.indexOf("create table if not exists public.climate_wallet_takes") <
      sql.indexOf("add column if not exists supporter_id") &&
    /Copy ALL of this SQL/i.test(sql),
  "Hosted SQL is pasteable SQL text and creates the Admin fan-profile tables"
);
assert(
  readFileSync("app/preview/admin-fan-profile/page.tsx", "utf8").includes(
    "sampleStaffFanProfile"
  ),
  "Preview page renders a staff fan profile"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Admin fan profiles: projects, donations, P4P and Matchrav.");
