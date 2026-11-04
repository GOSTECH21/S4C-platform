import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "fs";
import { dirname, join } from "path";
import { spawnSync } from "child_process";

const PIN = "b1dd5b5";
const REFS = ["cursor/p4p-timer-complete-18f9", "main", PIN];
const BUST = "p4p-timer-complete-1";
const STAMP = "p4p-timer-complete-v1";
const SELF = "apply-p4p-timer-complete.mjs";
const FILES = [
  "app/lib/predict-for-planet.ts",
  "app/components/fan/PredictForPlanetPlay.tsx",
  "app/preview/fan-p4p-complete/page.tsx",
  "app/preview/fan-p4p-awaiting/page.tsx",
  "apply-p4p-timer-complete.ps1",
  "scripts/verify-p4p-timer-complete.ts",
  "scripts/verify-p4p-slot-timer.ts",
  "scripts/verify-p4p-slot-wipe.ts",
  "scripts/verify-predict-for-planet.ts",
];

console.log("Working folder:", process.cwd());
console.log(
  "LIVE page: https://s4-c-platform.vercel.app/preview/fan-p4p"
);
if (!existsSync("app/components/fan/PredictForPlanetPlay.tsx")) {
  console.error(
    "This is not the S4C-platform folder. cd into the folder that contains app/components/fan/PredictForPlanetPlay.tsx, then run this script again."
  );
  process.exit(1);
}

function rawUrl(ref, rel) {
  return `https://raw.githubusercontent.com/GOSTECH21/S4C-platform/${ref}/${rel}?v=${BUST}&t=${Date.now()}`;
}

function gitCheckoutFromMain() {
  if (!existsSync(".git")) return false;
  const refs = ["cursor/p4p-timer-complete-18f9", "main"];
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
      console.log("Checked out P4P timer files from origin/" + branch + ".");
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
  console.log("Cleared .next so Next.js cannot keep the old P4P board.");
} catch {
  console.log(
    "Could not clear .next; stop npm run dev, delete the .next folder, then start it again."
  );
}

const play = "app/components/fan/PredictForPlanetPlay.tsx";
const lib = "app/lib/predict-for-planet.ts";
if (existsSync(play) && existsSync(lib)) {
  const playSrc = readFileSync(play, "utf8");
  const libSrc = readFileSync(lib, "utf8");
  console.log("Check 5-minute timer:", playSrc.includes("p4p-slot-timer"));
  console.log(
    "Check COMPLETE:",
    playSrc.includes("P4P_SLOT_COMPLETE_LABEL")
  );
  console.log(
    "Check awaiting:",
    playSrc.includes("P4P_AWAITING_NEW_SPONSORED_LABEL")
  );
  if (
    !playSrc.includes(STAMP) ||
    !playSrc.includes("P4P_WINDOW_TIMER_LABEL") ||
    !playSrc.includes("P4P_SLOT_COMPLETE_LABEL") ||
    !playSrc.includes("P4P_AWAITING_NEW_SPONSORED_LABEL") ||
    !libSrc.includes("p4pIsAfterMatchDay") ||
    !libSrc.includes("gameTimeSlotIsComplete")
  ) {
    failed += 1;
    console.error(
      "P4P is still missing the 5-minute timer, COMPLETE slot, or Awaiting New Sponsored P4P. This script did not land in the folder npm run dev is using."
    );
  }
} else {
  failed += 1;
  console.error("P4P timer files are missing from", process.cwd());
}

if (failed) process.exit(1);
console.log(
  "OK: P4P shows a 5-minute countdown, marks a played 30-minute slot COMPLETE, and awaits a new sponsored P4P the next day."
);
console.log("1. Stop npm run dev (Ctrl+C)");
console.log("2. Run npm run dev again");
console.log("3. Hard-refresh (Ctrl+F5)");
console.log("4. Or open https://s4-c-platform.vercel.app/preview/fan-p4p");
