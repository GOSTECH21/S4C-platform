import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/sponsor-nav-pc-fix-18f9";
const BUST = "sponsor-nav-pc-fix-1";
const FILES = [
  "app/sponsor/sponsor-nav.tsx",
  "app/sponsor/layout.tsx",
  "scripts/verify-sponsor-tabs-visible.ts",
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

const nav = "app/sponsor/sponsor-nav.tsx";
if (existsSync(nav)) {
  const navSrc = readFileSync(nav, "utf8");
  if (
    !navSrc.includes("sponsor-nav-pc-fix-v1") ||
    navSrc.includes("local-sponsor.service")
  ) {
    failed += 1;
    console.error(
      "Sponsor nav still imports local-sponsor.service. Pull the files above, then hard-refresh."
    );
  }
} else {
  failed += 1;
  console.error("Sponsor nav file is missing.");
}

if (failed) process.exit(1);
console.log(
  "OK: Sponsor header no longer needs local-sponsor.service. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
