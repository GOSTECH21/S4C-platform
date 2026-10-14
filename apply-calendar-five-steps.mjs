import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/calendar-five-steps-18f9";
const FILES = [
  "app/lib/global-match-day.ts",
  "app/components/sponsor/SportingCalendarBoard.tsx",
  "scripts/verify-sporting-calendar.ts",
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

const intro = "app/lib/global-match-day.ts";
const board = "app/components/sponsor/SportingCalendarBoard.tsx";
if (existsSync(intro) && existsSync(board)) {
  const copy = readFileSync(intro, "utf8");
  const ui = readFileSync(board, "utf8");
  if (
    !copy.includes("Look at the Sporting Calendar") ||
    !copy.includes("Proceed to your Carbon Wallet to complete transaction") ||
    copy.includes("Open any day on the 2026/27 Sporting Calendar") ||
    !ui.includes("GLOBAL_MATCH_DAY_STEPS") ||
    !ui.includes("list-decimal")
  ) {
    failed += 1;
    console.error(
      "The five Sporting Calendar steps did not land. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: the Sporting Calendar uses the five numbered steps. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5). Open /sponsor/calendar or /preview/sporting-calendar."
);
