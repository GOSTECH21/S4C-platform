import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "fs";
import { dirname, join } from "path";
import { spawnSync } from "child_process";

const PIN = "b170b05";
const REFS = ["cursor/club-projects-local-national-18f9", PIN];
const BUST = "club-choose-projects-pc-3";
const SELF = "apply-club-choose-projects.mjs";
const FILES = [
  "app/lib/routes.ts",
  "app/lib/partner-projects.ts",
  "app/lib/s4p-climate-projects.ts",
  "app/lib/project-site.ts",
  "app/lib/stadium-nearby-projects.ts",
  "app/components/club/ClubChooseProjectsCopy.tsx",
  "app/components/club/ClubClimateProjectScopeChooser.tsx",
  "app/club/dashboard/page.tsx",
  "app/club/projects/select/page.tsx",
  "app/club/s4p-climate-projects/page.tsx",
  "app/club/admin/page.tsx",
  "app/preview/club-choose-projects/page.tsx",
  "app/preview/club-admin/page.tsx",
  "scripts/verify-club-choose-projects.ts",
  "scripts/verify-club-match-day.ts",
  "scripts/verify-club-my-admin.ts",
  "scripts/verify-project-site.ts",
  "scripts/verify-dual-sponsor.ts",
  "scripts/verify-club-sponsor-tabs.ts",
  "scripts/verify-lead-tab-after-signoff.ts",
  "scripts/verify-sponsor-listings.ts",
];

console.log("Working folder:", process.cwd());
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
  const fetch = spawnSync("git", ["fetch", "origin", "main"], {
    encoding: "utf8",
  });
  if (fetch.status !== 0) {
    console.log(
      "git fetch origin main failed; downloading files from GitHub instead.",
      (fetch.stderr || fetch.stdout || "").trim()
    );
    return false;
  }
  const checkout = spawnSync(
    "git",
    ["checkout", "origin/main", "--", ...FILES],
    { encoding: "utf8" }
  );
  if (checkout.status !== 0) {
    console.log(
      "git checkout origin/main failed; downloading files from GitHub instead.",
      (checkout.stderr || checkout.stdout || "").trim()
    );
    return false;
  }
  console.log("Checked out Choose Projects files from origin/main.");
  return true;
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
  console.log(
    "Cleared .next so Next.js cannot keep the old Choose Projects page."
  );
} catch {
  console.log(
    "Could not clear .next; stop npm run dev, delete the .next folder, then start it again."
  );
}

const dashboard = "app/club/dashboard/page.tsx";
const picker = "app/club/projects/select/page.tsx";
const chooser = "app/components/club/ClubClimateProjectScopeChooser.tsx";
const copy = "app/components/club/ClubChooseProjectsCopy.tsx";
const admin = "app/club/admin/page.tsx";
if (
  existsSync(dashboard) &&
  existsSync(picker) &&
  existsSync(chooser) &&
  existsSync(copy) &&
  existsSync(admin)
) {
  const dashboardSrc = readFileSync(dashboard, "utf8");
  const pickerSrc = readFileSync(picker, "utf8");
  const chooserSrc = readFileSync(chooser, "utf8");
  const copySrc = readFileSync(copy, "utf8");
  const adminSrc = readFileSync(admin, "utf8");
  console.log(
    "Check dashboard stamp:",
    dashboardSrc.includes("club-choose-projects-scopes-v1")
  );
  console.log(
    "Check numbered steps gone:",
    !copySrc.includes("CLUB_CHOOSE_PROJECTS_STEPS")
  );
  console.log(
    "Check Local/National/International:",
    chooserSrc.includes("CLIMATE_PROJECT_SCOPE_PROMPT")
  );
  if (
    dashboardSrc.includes("<ClubClimateSponsorTabs") ||
    dashboardSrc.includes("CLUB_CHOOSE_PROJECTS_STEPS") ||
    copySrc.includes("CLUB_CHOOSE_PROJECTS_STEPS") ||
    !dashboardSrc.includes("club-choose-projects-scopes-v1") ||
    !copySrc.includes("clubDashboardClimateProjectsIntroCopy") ||
    !pickerSrc.includes("club-choose-projects-scopes-v1") ||
    !pickerSrc.includes("SEND_INVITATION_LABEL") ||
    !pickerSrc.includes("ClubClimateProjectScopeChooser") ||
    !chooserSrc.includes("CLIMATE_PROJECT_SCOPE_PROMPT")
  ) {
    failed += 1;
    console.error(
      "Choose Projects is still the long numbered list. This script did not land in the folder npm run dev is using."
    );
  }
} else {
  failed += 1;
  console.error("Choose Projects files are missing from", process.cwd());
}

if (failed) process.exit(1);
console.log(
  "OK: Choose Projects is the blue Select Climate Projects prompt with Local, National and International lists."
);
console.log("1. Stop npm run dev (Ctrl+C)");
console.log("2. Run npm run dev again");
console.log("3. Hard-refresh (Ctrl+F5)");
console.log(
  "4. Or open https://s4-c-platform.vercel.app/preview/club-choose-projects on this PC to see the live page without local files"
);
