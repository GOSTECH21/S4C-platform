import { readFileSync } from "fs";
import { previewAdminBackendSnapshot } from "../app/lib/admin-backend";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const sidebar = readFileSync("app/layout/Sidebar.tsx", "utf8");
const admin = readFileSync("app/admin/page.tsx", "utf8");
const home = readFileSync("app/components/admin/AdminBackendHome.tsx", "utf8");
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
    !sidebar.includes("Registered participants") &&
    !sidebar.includes("Sponsor Campaigns"),
  "Admin sidebar is shortened to Backend and Catalogue"
);

assert(
  admin.includes("AdminBackendHome") &&
    admin.includes("Platform records") &&
    catalogue.includes("Catalogue"),
  "Admin home is the backend and leftover tools sit in Catalogue"
);

assert(
  home.includes("data-admin-segment={segment.id}") &&
    home.includes('{ id: "clubs", label: "Clubs" }') &&
    home.includes('{ id: "supporters", label: "Supporters" }') &&
    home.includes('{ id: "lead", label: "Lead Climate Sponsors" }') &&
    home.includes(
      '{ id: "local", label: "Local Business Climate Sponsors" }'
    ) &&
    home.includes("Keep") &&
    home.includes("Delete") &&
    home.includes("data-admin-keep") &&
    home.includes("data-admin-delete") &&
    home.includes("Invitations sent") &&
    home.includes("Sponsors who proceeded") &&
    home.includes("P4P interactions") &&
    home.includes("Matchrav"),
  "Backend has four short segments with keep/delete and the required records"
);

assert(
  !service.includes("isDemoClubName") &&
    service.includes("listAllMatchDayFolders") &&
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
    preview.includes("persist={false}"),
  "Preview shows club, supporter, Lead and Local accounts"
);

assert(
  registerClub.includes("recordAdminParticipant") &&
    registerSponsor.includes('role: tier === "local" ? "local" : "lead"') &&
    p4p.includes("recordAdminP4p") &&
    matchrav.includes("fanKey") &&
    overlay.includes("cursor/admin-backend-18f9"),
  "New registrations and supporter activity are recorded for Admin, and the overlay pulls these files"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "Admin backend has four short segments covering every club and participant, with keep/delete."
);
