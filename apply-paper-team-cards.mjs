import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/paper-team-cards-18f9";
const FILES = [
  "app/globals.css",
  "app/components/fan/MyTeamsList.tsx",
  "app/components/fan/TeamPicker.tsx",
  "app/dashboard/GlobalSchoolsSolar.tsx",
  "app/dashboard/supporter/calendar/page.tsx",
  "app/dashboard/supporter/climate-impact-table/page.tsx",
  "app/preview/my-teams/page.tsx",
  "scripts/verify-pitch-theme.ts",
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

const cssPath = "app/globals.css";
const teams = "app/components/fan/MyTeamsList.tsx";
if (existsSync(cssPath) && existsSync(teams)) {
  const css = readFileSync(cssPath, "utf8");
  const list = readFileSync(teams, "utf8");
  if (
    !css.includes('[class~="bg-green-400"]') ||
    !css.includes('[class*="bg-green-950"]') ||
    list.includes("bg-green-400 p-4")
  ) {
    failed += 1;
    console.error(
      "My Teams still uses a dark green fill. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: My Teams and other dark fills sit on paper. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
