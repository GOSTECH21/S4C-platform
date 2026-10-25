import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/club-philanthropist-copy-18f9";
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

function read(rel) {
  return existsSync(rel) ? readFileSync(rel, "utf8") : "";
}

const stakeholders = read("app/lib/home-stakeholders.ts");
if (
  !stakeholders.includes(
    "Mobilize your fans to unlock sponsored funding to deliver approved climate projects & offset your Match Day carbon footprint"
  ) ||
  stakeholders.includes("Measure match-day emissions, engage your fans") ||
  !stakeholders.includes("any amount per match") ||
  !stakeholders.includes("Climate Impact League Table (CILT)") ||
  stakeholders.includes("£10,000 per match")
) {
  failed += 1;
  console.error(
    "Sports Clubs or Philanthropists copy is not in place. Pull the files above, then hard-refresh."
  );
}

if (failed) process.exit(1);
console.log(
  "OK: Sports Clubs and Philanthropists role-card copy is in place. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
