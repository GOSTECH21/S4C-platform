import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/play-p4p-optional-logo-18f9";
const BUST = "play-p4p-optional-logo-1";
const FILES = [
  "app/components/home/HomeJoinMission.tsx",
  "app/components/home/HomeFrontPage.tsx",
  "app/components/fan/P4pLiveChallengePreview.tsx",
  "app/sponsor/game-time/page.tsx",
  "app/preview/game-time/page.tsx",
  "app/components/auth/RoleLoginForm.tsx",
  "scripts/verify-play-p4p-optional-logo.ts",
  "scripts/verify-fan-p4p-copy.ts",
  "scripts/verify-homepage.ts",
  "scripts/verify-club-passion-copy.ts",
  "scripts/verify-game-time-sponsored-by.ts",
];

let failed = 0;
for (const rel of FILES) {
  const url = `https://raw.githubusercontent.com/GOSTECH21/S4C-platform/${BRANCH}/${rel}?v=${BUST}`;
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    mkdirSync(dirname(join(rel)), { recursive: true });
    writeFileSync(rel, Buffer.from(await response.arrayBuffer()));
    console.log("Pulled", rel);
  } catch (err) {
    failed += 1;
    console.error(
      `Could not pull ${rel}. Stay in the S4C-platform folder and check the network.`,
      err instanceof Error ? err.message : err
    );
  }
}

const join = "app/components/home/HomeJoinMission.tsx";
const board = "app/components/fan/P4pLiveChallengePreview.tsx";
const page = "app/sponsor/game-time/page.tsx";
if (existsSync(join) && existsSync(board) && existsSync(page)) {
  const joinSrc = readFileSync(join, "utf8");
  const boardSrc = readFileSync(board, "utf8");
  const pageSrc = readFileSync(page, "utf8");
  if (
    !joinSrc.includes("play-p4p-fan-login-v1") ||
    !joinSrc.includes("FAN_LOGIN_PATH") ||
    !boardSrc.includes("sponsored-by-first-v1") ||
    boardSrc.indexOf("{P4P_GAME_TIME_SPONSORED_BY_LABEL}") >
      boardSrc.indexOf("Add logo") ||
    pageSrc.includes("pointer-events-none opacity-40") ||
    pageSrc.includes("Add your logo next to Sponsored By.")
  ) {
    failed += 1;
    console.error(
      "Play P4P or the Game-Time logo is still in the old place. Pull the files above, then hard-refresh."
    );
  }
} else {
  failed += 1;
  console.error("Play P4P and Game-Time files are missing.");
}

if (failed) process.exit(1);
console.log(
  "OK: Play P4P opens Fan Login (with Register here), and Game-Time shows Sponsored By before an optional logo. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
