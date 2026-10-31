import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/local-sponsor-fans-copy-18f9";
const BUST = "local-sponsor-fans-copy-1";
const FILES = [
  "app/lib/home-stakeholders.ts",
  "scripts/verify-local-sponsor-fans-copy.ts",
  "scripts/verify-homepage.ts",
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

const stakeholders = "app/lib/home-stakeholders.ts";
if (existsSync(stakeholders)) {
  const src = readFileSync(stakeholders, "utf8");
  if (
    !src.includes(
      "Fund climate projects through Match-Day sponsorship and attract sports fans as customers."
    ) ||
    src.includes('"Fund climate projects through match-day sponsorship."')
  ) {
    failed += 1;
    console.error(
      "The Local Businesses copy is still the old version. Pull the files above, then hard-refresh."
    );
  }
} else {
  failed += 1;
  console.error("app/lib/home-stakeholders.ts is missing.");
}

if (failed) process.exit(1);
console.log(
  "OK: Local Businesses now says Fund climate projects through Match-Day sponsorship and attract sports fans as customers. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
