import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/lock-straight-to-wallet-18f9";
const FILES = [
  "app/lib/routes.ts",
  "app/lib/global-match-day.ts",
  "app/components/sponsor/MatchDayLockIn.tsx",
  "app/components/sponsor/SportingCalendarBoard.tsx",
  "app/components/sponsor/SignedSponsorHome.tsx",
  "app/sponsor/dashboard/page.tsx",
  "app/sponsor/calendar/page.tsx",
  "app/sponsor/wallet/page.tsx",
  "app/preview/match-day-lock-in/page.tsx",
  "scripts/verify-sporting-calendar.ts",
  "scripts/verify-sponsor-dashboard.ts",
];

let failed = 0;
for (const rel of FILES) {
  const url = `https://raw.githubusercontent.com/GOSTECH21/S4C-platform/${BRANCH}/${rel}`;
  try {
    const response = await fetch(url);
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

const lockIn = "app/components/sponsor/MatchDayLockIn.tsx";
const wallet = "app/sponsor/wallet/page.tsx";
const home = "app/components/sponsor/SignedSponsorHome.tsx";
if (existsSync(lockIn) && existsSync(wallet) && existsSync(home)) {
  const lockSrc = readFileSync(lockIn, "utf8");
  const walletSrc = readFileSync(wallet, "utf8");
  const homeSrc = readFileSync(home, "utf8");
  if (
    !lockSrc.includes("onMatchLocked") ||
    !walletSrc.includes("SPONSOR_ANOTHER_TEAM_PROMPT") ||
    !walletSrc.includes("SPONSOR_CLUB_TYPE_IN_PATH") ||
    !homeSrc.includes("onChosenMatch")
  ) {
    failed += 1;
    console.error(
      "Straight-to-wallet files did not land. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: Choosing a Match opens the Carbon Wallet. Want to see or sponsor another team? Click here returns to Club type-in. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
