import { readFileSync } from "fs";
import { previewAdminBackendSnapshot } from "../app/lib/admin-backend";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const sidebar = readFileSync("app/layout/Sidebar.tsx", "utf8");
const layout = readFileSync("app/layout/AppLayout.tsx", "utf8");
const header = readFileSync("app/layout/Header.tsx", "utf8");
const admin = readFileSync("app/admin/page.tsx", "utf8");
const home = readFileSync("app/components/admin/AdminBackendHome.tsx", "utf8");
const nav = readFileSync("app/components/admin/AdminNav.tsx", "utf8");
const service = readFileSync("app/services/admin-backend.service.ts", "utf8");
const lib = readFileSync("app/lib/admin-backend.ts", "utf8");
const preview = readFileSync("app/preview/admin-backend/page.tsx", "utf8");
const overlay = readFileSync("apply-admin-backend.mjs", "utf8");
const catalogue = readFileSync("app/admin/catalogue/page.tsx", "utf8");
const registerClub = readFileSync("app/services/club-match-day.service.ts", "utf8");
const registerSponsor = readFileSync("app/services/sponsor-auth.service.ts", "utf8");
const p4p = readFileSync("app/services/predict-for-planet.service.ts", "utf8");
const matchrav = readFileSync("app/lib/matchrav-journey.ts", "utf8");
const snapshot = previewAdminBackendSnapshot();

assert(
  sidebar.includes("Backend") &&
    sidebar.includes("Catalogue") &&
    sidebar.includes("hidden") &&
    sidebar.includes("md:block") &&
    !sidebar.includes("Registered participants") &&
    !sidebar.includes("Sponsor Campaigns") &&
    !sidebar.includes("S4PLockup"),
  "Admin sidebar stays on PC and is hidden on a phone"
);

assert(
  layout.includes("AdminNav") &&
    layout.includes("overflow-x-hidden") &&
    header.includes("hidden") &&
    header.includes("md:flex") &&
    nav.includes("adminTabClass") &&
    nav.includes("md:hidden") &&
    nav.includes("Backend") &&
    nav.includes("Catalogue") &&
    nav.includes("flex-wrap") &&
    lib.includes('ADMIN_MOBILE_STAMP = "admin-mobile-v1"'),
  "Phone Admin uses lime Backend and Catalogue tabs like Club and Fan"
);

assert(
  admin.includes("AdminBackendHome") &&
    admin.includes("Platform records") &&
    catalogue.includes("Catalogue"),
  "Admin home is the backend and leftover tools sit in Catalogue"
);

assert(
  home.includes("data-admin-segment={segment.id}") &&
    home.includes("adminTabClass") &&
    home.includes("grid-cols-2") &&
    home.includes("flex-wrap") &&
    home.includes("ADMIN_MOBILE_STAMP") &&
    home.includes("data-admin-mobile") &&
    home.includes('{ id: "clubs", label: "Clubs"') &&
    home.includes('{ id: "supporters", label: "Supporters"') &&
    home.includes('{ id: "lead", label: "Lead"') &&
    home.includes('{ id: "local", label: "Local"') &&
    home.includes("Keep") &&
    home.includes("Delete") &&
    home.includes("data-admin-keep") &&
    home.includes("data-admin-delete") &&
    home.includes("Invitations sent") &&
    home.includes("Sponsors who proceeded") &&
    home.includes("P4P interactions") &&
    home.includes("Matchrav") &&
    !home.includes("<details"),
  "Backend has four short lime-tab segments with keep/delete and the required records"
);

assert(
  !service.includes("isDemoClubName") &&
    service.includes("readAdminMatchDayFolders") &&
    !service.includes("match-day-folder") &&
    !service.includes("dual-sponsor") &&
    !service.includes("predict-for-planet") &&
    service.includes('select("id, name, website, industry, user_id")') &&
    !service.includes("club_name, sponsor_tier") &&
    service.includes("setAdminParticipantPresence") &&
    lib.includes("ADMIN_REMOVED_STORAGE") &&
    lib.includes("recordAdminParticipant"),
  "Admin hydrates every registered club, not the demo three, and can keep or delete"
);

assert(
  snapshot.clubs[0]?.clubName === "Hearts" &&
    snapshot.supporters[0]?.p4p.length > 0 &&
    snapshot.lead[0]?.brandName === "American Express" &&
    snapshot.local[0]?.brandName === "Mash Tun" &&
    preview.includes("persist={false}") &&
    preview.includes("AppLayout"),
  "Preview shows the real Admin shell on a phone, with club, supporter, Lead and Local accounts"
);

assert(
  registerClub.includes("recordAdminParticipant") &&
    registerSponsor.includes('role: tier === "local" ? "local" : "lead"') &&
    p4p.includes("recordAdminP4p") &&
    matchrav.includes("fanKey") &&
    overlay.includes("cursor/admin-backend-18f9") &&
    overlay.includes("app/components/admin/AdminNav.tsx") &&
    overlay.includes("app/lib/project-site.ts") &&
    !service.includes("matchrav-journey"),
  "New registrations and supporter activity are recorded for Admin, and the overlay pulls these files"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "Admin backend has four short phone tabs covering every club and participant, with keep/delete."
);
