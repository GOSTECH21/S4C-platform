import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/local-sponsor-anywhere-18f9";
const FILES = [
  "app/sponsor/local/register/page.tsx",
  "app/preview/nearby-projects/page.tsx",
];

let failed = 0;
for (const rel of FILES) {
  const url = `https://raw.githubusercontent.com/GOSTECH21/S4C-platform/${BRANCH}/${rel}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    if (rel.includes("register") && text.includes("must trade within 5 miles")) {
      throw new Error("Downloaded register page still has the 5-mile rule");
    }
    mkdirSync(dirname(join(rel)), { recursive: true });
    writeFileSync(rel, text);
    console.log("Pulled", rel);
  } catch (err) {
    failed += 1;
    console.error(
      `Could not pull ${rel}. Stay in the S4C-platform folder and check the network.`,
      err instanceof Error ? err.message : err
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: Local Business Climate Sponsors can choose any club. Stop npm run dev, start it again, and open local register in Incognito."
);
