import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/national-sponsor-card-copy-18f9";
const FILES = ["app/lib/home-stakeholders.ts", "scripts/verify-homepage.ts"];

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

const stakeholders = "app/lib/home-stakeholders.ts";
if (existsSync(stakeholders)) {
  const src = readFileSync(stakeholders, "utf8");
  if (
    !src.includes("e.g a Goal-scored") ||
    !src.includes("feature on our Climate Impact Sponsor Table (CIST)") ||
    src.includes("measure your environmental impact and feature on the Climate Impact Sponsor Table")
  ) {
    failed += 1;
    console.error(
      "The National/Global Climate Sponsor card still uses the old CIST sentence. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: the National/Global Climate Sponsor card uses the new Goal-scored sentence. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
