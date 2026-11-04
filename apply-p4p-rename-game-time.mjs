import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "fs";
import { dirname, join } from "path";
import { spawnSync } from "child_process";

const PIN = "pending";
const REFS = ["cursor/p4p-rename-game-time-18f9", "main", PIN];
const BUST = "p4p-rename-game-time-1";
const STAMP = "p4p-rename-game-time-v1";
const SELF = "apply-p4p-rename-game-time.mjs";
const FILES = [
  "app/lib/predict-for-planet.ts",
  "app/lib/sponsor-listings.ts",
  "app/lib/sports.ts",
  "app/lib/home-stakeholders.ts",
  "app/sponsor/sponsor-nav.tsx",
  "app/sponsor/game-time/page.tsx",
  "app/sponsor/register/page.tsx",
  "app/preview/game-time/page.tsx",
  "app/preview/fan-p4p-complete/page.tsx",
  "app/preview/p4p-donate/page.tsx",
  "app/components/fan/PredictForPlanetPlay.tsx",
  "app/components/fan/P4pLiveChallengePreview.tsx",
  "app/components/home/PredictForPlanet.tsx",
  "app/climate-sponsorship/page.tsx",
  "app/dashboard/supporter/vote/page.tsx",
  "apply-p4p-rename-game-time.ps1",
  "scripts/verify-p4p-rename-game-time.ts",
  "scripts/verify-predict-for-planet.ts",
  "scripts/verify-sponsor-tabs-visible.ts",
  "scripts/verify-sponsor-dashboard.ts",
  "scripts/verify-game-time-slot-heading.ts",
  "scripts/verify-score-for-planet.ts",
];

console.log("Working folder:", process.cwd());
console.log(
  "LIVE page: https://s4-c-platform.vercel.app/preview/game-time"
);
if (!existsSync("app/sponsor/game-time/page.tsx")) {
  console.error(
    "This is not the S4C-platform folder. cd into the folder that contains app/sponsor/game-time/page.tsx, then run this script again."
  );
  process.exit(1);
}

function rawUrl(ref, rel) {
  return `https://raw.githubusercontent.com/GOSTECH21/S4C-platform/${ref}/${rel}?v=${BUST}&t=${Date.now()}`;
}

function gitCheckoutFromMain() {
  if (!existsSync(".git")) return false;
  const refs = ["cursor/p4p-rename-game-time-18f9", "main"];
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
      console.log("Checked out P4P rename files from origin/" + branch + ".");
      return true;
    }
  }
  console.log("git checkout failed; downloading files from GitHub instead.");
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
  console.log("Cleared .next so Next.js cannot keep Game-Time on the P4P tab.");
} catch {
  console.log(
    "Could not clear .next; stop npm run dev, delete the .next folder, then start it again."
  );
}

const nav = "app/sponsor/sponsor-nav.tsx";
const page = "app/sponsor/game-time/page.tsx";
if (existsSync(nav) && existsSync(page)) {
  const navSrc = readFileSync(nav, "utf8");
  const pageSrc = readFileSync(page, "utf8");
  console.log("Check P4P tab:", navSrc.includes("GAME_TIME_NAV_LABEL"));
  console.log("Check P4P page:", pageSrc.includes("P4P_SHORT"));
  if (
    !navSrc.includes(STAMP) ||
    !navSrc.includes("GAME_TIME_NAV_LABEL") ||
    navSrc.includes("          Game-Time") ||
    !pageSrc.includes("Buy another {P4P_SHORT} slot") ||
    pageSrc.includes("Game-Time")
  ) {
    failed += 1;
    console.error(
      "Game-Time is still on the tab or P4P page. This script did not land in the folder npm run dev is using."
    );
  }
} else {
  failed += 1;
  console.error("P4P rename files are missing from", process.cwd());
}

if (failed) process.exit(1);
console.log(
  "OK: Game-Time copy is now P4P on tabs, buttons and page text."
);
console.log("1. Stop npm run dev (Ctrl+C)");
console.log("2. Run npm run dev again");
console.log("3. Hard-refresh (Ctrl+F5)");
console.log("4. Or open https://s4-c-platform.vercel.app/preview/game-time");
