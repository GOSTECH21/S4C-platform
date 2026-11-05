import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "fs";
import { dirname, join } from "path";
import { spawnSync } from "child_process";

const PIN = "8e592ad";
const REFS = ["cursor/matchrav-below-club-18f9", "main", PIN];
const BUST = "matchrav-below-club-1";
const STAMP = "matchrav-fan-tabs-v1";
const SELF = "apply-matchrav-fan-tabs.mjs";
const FILES = [
  "app/lib/matchrav.ts",
  "app/components/home/HomeJoinMission.tsx",
  "app/components/home/HomeFrontPage.tsx",
  "app/components/home/HomeTopBanner.tsx",
  "app/preview/matchrav/page.tsx",
  "apply-matchrav-fan-tabs.ps1",
  "scripts/verify-matchrav-fan-tabs.ts",
  "scripts/verify-fan-p4p-copy.ts",
  "scripts/verify-club-passion-copy.ts",
  "scripts/verify-homepage.ts",
  "scripts/verify-play-p4p-optional-logo.ts",
];

console.log("Working folder:", process.cwd());
console.log("LIVE page: http://localhost:3000/preview/matchrav");
console.log("Homepage: http://localhost:3000/");
if (!existsSync("app/components/home/HomeJoinMission.tsx")) {
  console.error(
    "This is not the S4C-platform folder. cd into the folder that contains app/components/home/HomeJoinMission.tsx, then run this script again."
  );
  process.exit(1);
}

function rawUrl(ref, rel) {
  return `https://raw.githubusercontent.com/GOSTECH21/S4C-platform/${ref}/${rel}?v=${BUST}&t=${Date.now()}`;
}

function gitCheckoutFromMain() {
  if (!existsSync(".git")) return false;
  const refs = ["cursor/matchrav-below-club-18f9", "main"];
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
      console.log("Checked out Matchrav fan tabs from origin/" + branch + ".");
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
  console.log("Cleared .next so Next.js cannot keep Join free / Play P4P.");
} catch {
  console.log(
    "Could not clear .next; stop npm run dev, delete the .next folder, then start it again."
  );
}

const join = "app/components/home/HomeJoinMission.tsx";
const matchrav = "app/lib/matchrav.ts";
if (existsSync(join) && existsSync(matchrav)) {
  const joinSrc = readFileSync(join, "utf8");
  const matchravSrc = readFileSync(matchrav, "utf8");
  console.log("Check Matchrav:", matchravSrc.includes("Matchrav"));
  console.log("Check three tabs:", joinSrc.includes("grid-cols-3"));
  if (
    !matchravSrc.includes(STAMP) ||
    !matchravSrc.includes("Matchrav") ||
    matchravSrc.includes("Matrav") ||
    !joinSrc.includes("grid-cols-3") ||
    !joinSrc.includes("JOIN_S4P_FREE_LABEL") ||
    !joinSrc.includes("matchrav-below-club-v1") ||
    joinSrc.indexOf("club-director-heading") > joinSrc.indexOf("<FanJoinPanel") ||
    joinSrc.includes("Over 50% of a Match Day carbon emissions")
  ) {
    failed += 1;
    console.error(
      "The fan card still has Join free / Play P4P. This script did not land in the folder npm run dev is using."
    );
  }
} else {
  failed += 1;
  console.error("Matchrav fan-join files are missing from", process.cwd());
}

if (failed) process.exit(1);
console.log(
  "OK: Fan panel now has Matchrav, P4P and S4P tabs. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
console.log("1. Stop npm run dev (Ctrl+C)");
console.log("2. Run npm run dev again");
console.log("3. Hard-refresh (Ctrl+F5)");
console.log("4. Open http://localhost:3000/ or http://localhost:3000/preview/matchrav");
