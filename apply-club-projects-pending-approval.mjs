import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/club-projects-pending-approval-18f9";
const FILES = [
  "app/lib/partner-projects.ts",
  "app/lib/match-day-post.ts",
  "app/club/dashboard/page.tsx",
  "app/services/club-match-day.service.ts",
  "scripts/verify-club-match-day.ts",
  "scripts/verify-wallet-vote.ts",
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

const page = "app/club/dashboard/page.tsx";
if (existsSync(page)) {
  const src = readFileSync(page, "utf8");
  if (
    !src.includes("MATCH_DAY_PENDING_APPROVAL_LABEL") ||
    !src.includes("orderedSelected") ||
    !src.includes("matchDayProjectApprovalLabel")
  ) {
    failed += 1;
    console.error(
      "Chosen projects with pending approval did not land. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: Chosen Match Day projects list on the Club Dashboard as pending approval, then Approved after sponsor sign-off. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
