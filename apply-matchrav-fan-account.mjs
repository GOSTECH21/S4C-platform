import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "fs";
import { dirname, join } from "path";
import { spawnSync } from "child_process";

const PIN = "37be6a4";
const REFS = ["cursor/matchrav-fan-tab-18f9", "main", PIN];
const BUST = "matchrav-fan-account-1";
const STAMP = "matchrav-fan-account-v1";
const PLANNER = "matchrav-planner-mobile-pc-v1";
const SELF = "apply-matchrav-fan-account.mjs";
const FILES = [
  "app/lib/matchrav.ts",
  "app/lib/routes.ts",
  "app/fan/login/page.tsx",
  "app/register/page.tsx",
  "app/dashboard/supporter/components/FanTabBar.tsx",
  "app/components/fan/FanMatchravPanel.tsx",
  "app/supporter/dashboard/matchrav/page.tsx",
  "app/dashboard/supporter/matchrav/page.tsx",
  "app/preview/fan-tabs/page.tsx",
  "apply-matchrav-fan-account.ps1",
  "scripts/verify-matchrav-fan-account.ts",
  "scripts/verify-matchrav-fan-tabs.ts",
  "scripts/verify-fan-five-tabs.ts",
  "scripts/verify-sponsor-leaderboard.ts",
];

console.log("Working folder:", process.cwd());
console.log("LIVE page: http://localhost:3000/supporter/dashboard/matchrav");
console.log("Homepage Explore Matchrav: http://localhost:3000/");
if (!existsSync("app/dashboard/supporter/components/FanTabBar.tsx")) {
  console.error(
    "This is not the S4C-platform folder. cd into the folder that contains app/dashboard/supporter/components/FanTabBar.tsx, then run this script again."
  );
  process.exit(1);
}

function rawUrl(ref, rel) {
  return `https://raw.githubusercontent.com/GOSTECH21/S4C-platform/${ref}/${rel}?v=${BUST}&t=${Date.now()}`;
}

function gitCheckoutFromMain() {
  if (!existsSync(".git")) return false;
  const refs = ["cursor/matchrav-fan-tab-18f9", "main"];
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
      console.log("Checked out Matchrav fan account from origin/" + branch + ".");
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
  console.log("Cleared .next so Next.js cannot keep the old fan tabs.");
} catch {
  console.log(
    "Could not clear .next; stop npm run dev, delete the .next folder, then start it again."
  );
}

const tabs = "app/dashboard/supporter/components/FanTabBar.tsx";
const matchrav = "app/lib/matchrav.ts";
const login = "app/fan/login/page.tsx";
const panel = "app/components/fan/FanMatchravPanel.tsx";
if (
  existsSync(tabs) &&
  existsSync(matchrav) &&
  existsSync(login) &&
  existsSync(panel)
) {
  const tabsSrc = readFileSync(tabs, "utf8");
  const matchravSrc = readFileSync(matchrav, "utf8");
  const loginSrc = readFileSync(login, "utf8");
  const panelSrc = readFileSync(panel, "utf8");
  console.log("Check Matchrav tab:", tabsSrc.includes('label: "Matchrav"'));
  console.log("Check Explore Matchrav login:", matchravSrc.includes("fanLoginPath"));
  console.log("Check planner:", panelSrc.includes(PLANNER));
  if (
    !matchravSrc.includes(STAMP) ||
    !matchravSrc.includes("fanLoginPath(SUPPORTER_MATCHRAV_PATH)") ||
    matchravSrc.includes("FAN_REGISTER_PATH") ||
    !tabsSrc.includes('label: "Matchrav"') ||
    !tabsSrc.includes('data-fan-tabs="6"') ||
    !loginSrc.includes("fanRegisterPath(destination)") ||
    !loginSrc.includes("useSearchParams") ||
    !panelSrc.includes(PLANNER) ||
    !panelSrc.includes("lg:grid-cols-2") ||
    panelSrc.includes("PhoneFrame")
  ) {
    failed += 1;
    console.error(
      "The Matchrav fan tab did not land. This script did not land in the folder npm run dev is using."
    );
  }
} else {
  failed += 1;
  console.error("Matchrav fan-account files are missing from", process.cwd());
}

if (failed) process.exit(1);
console.log(
  "OK: Explore Matchrav opens Fan Login, and Fan accounts have a Matchrav tab. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
console.log("1. Stop npm run dev (Ctrl+C)");
console.log("2. Run npm run dev again");
console.log("3. Hard-refresh (Ctrl+F5)");
console.log("4. Open http://localhost:3000/ and click Explore Matchrav");
