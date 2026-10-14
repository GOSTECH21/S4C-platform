import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/fan-card-fund-copy-18f9";
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
    !src.includes(
      "Fund up to 5 Climate Projects with monies from Sponsors on every Match Day"
    ) ||
    src.includes("FUND-IT up to 5 times and climb")
  ) {
    failed += 1;
    console.error(
      "The Fan card still uses the old FUND-IT sentence. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: the Fan card uses the new Match Day Climate Projects sentence. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
