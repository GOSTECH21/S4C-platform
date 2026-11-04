import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "fs";
import { dirname, join } from "path";
import { spawnSync } from "child_process";

const PIN = "67245e2";
const REFS = ["main", "cursor/club-pc-no-phone-frame-18f9", PIN];
const BUST = "club-pc-no-phone-pc-2";
const SELF = "apply-club-pc-no-phone.mjs";
const FILES = [
  "app/components/home/PhoneFrame.tsx",
  "app/components/home/SelectMatchFixtures.tsx",
  "app/components/home/HowS4pSelectMatch.tsx",
  "app/lib/how-s4p-works.ts",
  "app/preview/club-select-match/page.tsx",
  "apply-club-pc-no-phone.ps1",
  "scripts/verify-club-pc-no-phone.ts",
  "scripts/verify-how-s4p-split.ts",
  "scripts/verify-club-my-admin.ts",
  "scripts/verify-homepage.ts",
];

console.log("Working folder:", process.cwd());
console.log(
  "LIVE page (no local files needed): https://s4-c-platform.vercel.app/preview/club-select-match"
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
  console.log("Checked out Club Select Match files from origin/main.");
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
    "Cleared .next so Next.js cannot keep the old Club Select Match phone frame."
  );
} catch {
  console.log(
    "Could not clear .next; stop npm run dev, delete the .next folder, then start it again."
  );
}

const frame = "app/components/home/PhoneFrame.tsx";
const fixtures = "app/components/home/SelectMatchFixtures.tsx";
const select = "app/components/home/HowS4pSelectMatch.tsx";
if (existsSync(frame) && existsSync(fixtures) && existsSync(select)) {
  const frameSrc = readFileSync(frame, "utf8");
  const fixturesSrc = readFileSync(fixtures, "utf8");
  const selectSrc = readFileSync(select, "utf8");
  console.log(
    "Check unframed club list:",
    fixturesSrc.includes('framed={mode !== "club"}')
  );
  console.log(
    "Check larger Select this Match:",
    fixturesSrc.includes("data-select-this-match") &&
      fixturesSrc.includes("sm:text-base md:text-lg")
  );
  if (
    !frameSrc.includes("framed = true") ||
    !frameSrc.includes("data-phone-unframed") ||
    !fixturesSrc.includes('framed={mode !== "club"}') ||
    !fixturesSrc.includes("club-pc-no-phone-frame-v1") ||
    !fixturesSrc.includes("data-select-this-match") ||
    !selectSrc.includes("CLUB_FIXTURE_COLUMN_CLASS") ||
    !selectSrc.includes("club-pc-no-phone-frame-v1")
  ) {
    failed += 1;
    console.error(
      "Club Select Match still has the phone surroundings. This script did not land in the folder npm run dev is using."
    );
  }
} else {
  failed += 1;
  console.error("Club Select Match files are missing from", process.cwd());
}

if (failed) process.exit(1);
console.log(
  "OK: this folder now has the fixture list without the phone bezel."
);
console.log("If you still see a phone, this is not the folder npm run dev is using.");
console.log("1. Stop npm run dev (Ctrl+C)");
console.log("2. Run npm run dev again");
console.log("3. Hard-refresh the Club dashboard (Ctrl+F5)");
console.log(
  "Or skip local files and open https://s4-c-platform.vercel.app/preview/club-select-match"
);
console.log("Club login: https://s4-c-platform.vercel.app/club/login");
