import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "fs";
import { dirname, join } from "path";
import { spawnSync } from "child_process";

const PIN = "cb24417";
const REFS = ["cursor/club-sponsors-address-books-18f9", "main", PIN];
const BUST = "club-sponsors-address-books-pc-4";
const STAMP = "club-sponsors-address-books-v1";
const SELF = "apply-club-sponsors-address-books.mjs";
const FILES = [
  "app/lib/routes.ts",
  "app/lib/partner-projects.ts",
  "app/lib/sponsor-listings.ts",
  "app/lib/club-address-book.ts",
  "app/services/sponsor-listings.service.ts",
  "app/components/club/ClubAddressBookPanel.tsx",
  "app/components/club/ClubSponsorsAddressBooks.tsx",
  "app/components/club/ClubSponsorsListings.tsx",
  "app/components/club/SendInvitationToSponsorsLink.tsx",
  "app/club/sponsors/page.tsx",
  "app/club/admin/page.tsx",
  "app/club/dashboard/page.tsx",
  "app/club/projects/select/page.tsx",
  "app/preview/club-admin/page.tsx",
  "app/preview/club-choose-projects/page.tsx",
  "app/preview/club-sponsors-address-books/page.tsx",
  "app/preview/club-pending-invite/page.tsx",
  "apply-club-sponsors-address-books.ps1",
  "scripts/verify-club-sponsors-address-books.ts",
  "scripts/verify-club-choose-projects.ts",
  "scripts/verify-club-my-admin.ts",
  "scripts/verify-sponsor-listings.ts",
];

console.log("Working folder:", process.cwd());
console.log(
  "LIVE page: https://s4-c-platform.vercel.app/preview/club-pending-invite"
);
if (!existsSync("app/club/dashboard/page.tsx")) {
  console.error(
    "This is not the S4C-platform folder. cd into the folder that contains app/club/dashboard/page.tsx, then run this script again."
  );
  process.exit(1);
}

function rawUrl(ref, rel) {
  return `https://raw.githubusercontent.com/GOSTECH21/S4C-platform/${ref}/${rel}?v=${BUST}&t=${Date.now()}`;
}

function gitCheckoutFromMain() {
  if (!existsSync(".git")) return false;
  const refs = ["cursor/club-sponsors-address-books-18f9", "main"];
  for (const branch of refs) {
    const fetch = spawnSync("git", ["fetch", "origin", branch], {
      encoding: "utf8",
    });
    if (fetch.status !== 0) continue;
    const checkout = spawnSync(
      "git",
      ["checkout", `origin/${branch}`, "--", ...FILES],
      { encoding: "utf8" }
    );
    if (checkout.status === 0) {
      console.log("Checked out Sponsors Address Book files from origin/" + branch + ".");
      return true;
    }
  }
  console.log(
    "git checkout failed; downloading files from GitHub instead."
  );
  return false;
}

if (process.env.S4P_OVERLAY_SELF !== "1") {
  const localSelf = existsSync(SELF) ? readFileSync(SELF, "utf8") : "";
  if (
    localSelf.includes(`BUST = "${BUST}"`) &&
    localSelf.includes("Working folder:") &&
    localSelf.includes("git fetch")
  ) {
    // Already the git-first overlay.
  } else {
    let refreshed = false;
    for (const ref of REFS) {
      if (ref === "pending") continue;
      const url = rawUrl(ref, SELF);
      try {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) continue;
        const buf = Buffer.from(await response.arrayBuffer());
        const current = existsSync(SELF) ? readFileSync(SELF) : Buffer.alloc(0);
        if (current.equals(buf)) {
          refreshed = true;
          break;
        }
        writeFileSync(SELF, buf);
        console.log("Updated", SELF, "from", ref);
        const rerun = spawnSync(process.execPath, [SELF], {
          stdio: "inherit",
          env: { ...process.env, S4P_OVERLAY_SELF: "1" },
        });
        process.exit(rerun.status ?? 1);
      } catch {
        // try the next ref
      }
    }
    if (!refreshed) {
      console.log(
        "Could not refresh",
        SELF,
        "from GitHub; using the local copy."
      );
    }
  }
}

async function pull(rel) {
  let lastError = "not found";
  for (const ref of REFS) {
    if (ref === "pending") continue;
    const url = rawUrl(ref, rel);
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) {
        lastError = `HTTP ${response.status}`;
        continue;
      }
      mkdirSync(dirname(join(rel)), { recursive: true });
      writeFileSync(rel, Buffer.from(await response.arrayBuffer()));
      console.log("Pulled", rel);
      return true;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }
  console.error(
    `Could not pull ${rel}. Stay in the S4C-platform folder and check the network.`,
    lastError
  );
  return false;
}

let failed = 0;
if (!gitCheckoutFromMain()) {
  for (const rel of FILES) {
    if (!(await pull(rel))) failed += 1;
  }
}

try {
  rmSync(".next", { recursive: true, force: true });
  console.log("Cleared .next so Next.js cannot keep Address Books on My Admin.");
} catch {
  console.log(
    "Could not clear .next; stop npm run dev, delete the .next folder, then start it again."
  );
}

const sponsors = "app/club/sponsors/page.tsx";
const admin = "app/club/admin/page.tsx";
const dashboard = "app/club/dashboard/page.tsx";
const listings = "app/components/club/ClubSponsorsListings.tsx";
if (
  existsSync(sponsors) &&
  existsSync(admin) &&
  existsSync(dashboard) &&
  existsSync(listings)
) {
  const sponsorsSrc = readFileSync(sponsors, "utf8");
  const adminSrc = readFileSync(admin, "utf8");
  const dashboardSrc = readFileSync(dashboard, "utf8");
  const listingsSrc = readFileSync(listings, "utf8");
  console.log(
    "Check Address Books on Sponsors:",
    sponsorsSrc.includes("ClubSponsorsAddressBooks")
  );
  console.log(
    "Check Existing Sponsors:",
    listingsSrc.includes("EXISTING_SPONSORS_HEADING")
  );
  if (
    !sponsorsSrc.includes("ClubSponsorsAddressBooks") ||
    !listingsSrc.includes("EXISTING_SPONSORS_HEADING") ||
    !listingsSrc.includes(STAMP) ||
    listingsSrc.includes("onInviteAll") ||
    listingsSrc.includes("Sponsor Leaderboard") ||
    listingsSrc.includes("Match Day:") ||
    !listingsSrc.includes("meetsInviteMinimum") ||
    adminSrc.includes("ClubAddressBookPanel") ||
    !dashboardSrc.includes("SendInvitationToSponsorsLink") ||
    !existsSync("app/components/club/SendInvitationToSponsorsLink.tsx")
  ) {
    failed += 1;
    console.error(
      "Address Books are still on My Admin. This script did not land in the folder npm run dev is using."
    );
  }
} else {
  failed += 1;
  console.error("Sponsors Address Book files are missing from", process.cwd());
}

if (failed) process.exit(1);
console.log(
  "OK: Address Books are on Sponsors with Existing Sponsors. Send Invitation to Sponsors opens that section."
);
console.log("1. Stop npm run dev (Ctrl+C)");
console.log("2. Run npm run dev again");
console.log("3. Hard-refresh (Ctrl+F5)");
console.log(
  "4. Or open https://s4-c-platform.vercel.app/preview/club-sponsors-address-books"
);
