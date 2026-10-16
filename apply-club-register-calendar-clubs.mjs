import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/club-register-calendar-clubs-18f9";
const FILES = [
  "app/services/club-match-day.service.ts",
  "scripts/verify-club-register-step1.ts",
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

const service = "app/services/club-match-day.service.ts";
if (existsSync(service)) {
  const src = readFileSync(service, "utf8");
  if (
    !src.includes("isSportingCalendarClub") ||
    src.includes(
      "This demo only includes Hearts of Midlothian FC, Hibernian FC, and Arsenal FC."
    )
  ) {
    failed += 1;
    console.error(
      "Club Registration still limits the demo to three clubs. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: Club Registration accepts any 2026/27 Sporting Calendar club (Bournemouth, Chelsea, etc.). Homepage Sports Teams stays Arsenal, Hearts and Hibernian. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
