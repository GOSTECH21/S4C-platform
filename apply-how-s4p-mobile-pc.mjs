import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "fs";
import { dirname, join } from "path";
import { spawnSync } from "child_process";

const PIN = "483307b";
const REFS = ["cursor/how-s4p-mobile-pc-18f9", "main", PIN];
const BUST = "how-s4p-mobile-pc-1";
const STAMP = "how-s4p-mobile-pc-v1";
const SELF = "apply-how-s4p-mobile-pc.mjs";
const FILES = [
  "app/components/home/HomeFrontPage.tsx",
  "app/components/home/HowItWorks.tsx",
  "app/components/home/HomeTopBanner.tsx",
  "app/components/home/HowS4pPredictForPlanet.tsx",
  "apply-how-s4p-mobile-pc.ps1",
  "scripts/verify-how-s4p-mobile-pc.ts",
  "scripts/verify-how-s4p-split.ts",
  "scripts/verify-homepage.ts",
  "scripts/verify-join-community-tab.ts",
  "scripts/verify-home-mobile-simplify.ts",
];

console.log("Working folder:", process.cwd());
console.log("LIVE page: https://s4-c-platform.vercel.app/#how-s4p-works");
if (!existsSync("app/components/home/HowItWorks.tsx")) {
  console.error(
    "This is not the S4C-platform folder. cd into the folder that contains app/components/home/HowItWorks.tsx, then run this script again."
  );
  process.exit(1);
}

function rawUrl(ref, rel) {
  return `https://raw.githubusercontent.com/GOSTECH21/S4C-platform/${ref}/${rel}?v=${BUST}&t=${Date.now()}`;
}

function gitCheckoutFromMain() {
  if (!existsSync(".git")) return false;
  const refs = ["cursor/how-s4p-mobile-pc-18f9", "main"];
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
      console.log("Checked out How S4P mobile/PC files from origin/" + branch + ".");
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
  console.log("Cleared .next so Next.js cannot keep How S4P Works off the phone.");
} catch {
  console.log(
    "Could not clear .next; stop npm run dev, delete the .next folder, then start it again."
  );
}

const how = "app/components/home/HowItWorks.tsx";
const front = "app/components/home/HomeFrontPage.tsx";
if (existsSync(how) && existsSync(front)) {
  const howSrc = readFileSync(how, "utf8");
  const frontSrc = readFileSync(front, "utf8");
  console.log("Check How S4P stamp:", howSrc.includes(STAMP));
  if (
    !howSrc.includes(STAMP) ||
    howSrc.includes("hidden md:block") ||
    !frontSrc.includes(STAMP) ||
    frontSrc.includes("hidden md:block")
  ) {
    failed += 1;
    console.error(
      "How S4P Works is still desktop-only. This script did not land in the folder npm run dev is using."
    );
  }
} else {
  failed += 1;
  console.error("How S4P Works files are missing from", process.cwd());
}

if (failed) process.exit(1);
console.log("OK: How S4P Works Access & Join is now on mobile and PC.");
console.log("1. Stop npm run dev (Ctrl+C)");
console.log("2. Run npm run dev again");
console.log("3. Hard-refresh (Ctrl+F5)");
console.log("4. Or open https://s4-c-platform.vercel.app/#how-s4p-works");
