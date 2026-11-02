import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/sponsor-tabs-visible-18f9";
const BUST = "sponsor-tabs-visible-1";
const FILES = [
  "app/sponsor/sponsor-nav.tsx",
  "app/sponsor/layout.tsx",
  "app/preview/sponsor-nav/page.tsx",
  "app/components/sponsor/LeadSponsorHome.tsx",
  "app/lib/lead-sponsor-home.ts",
  "scripts/verify-sponsor-tabs-visible.ts",
  "scripts/verify-sponsor-dashboard.ts",
  "scripts/verify-lead-sponsor-home.ts",
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
const layout = "app/sponsor/layout.tsx";
if (existsSync(nav) && existsSync(layout)) {
  const navSrc = readFileSync(nav, "utf8");
  const layoutSrc = readFileSync(layout, "utf8");
  if (
    !navSrc.includes("sponsor-tabs-visible-v1") ||
    !navSrc.includes("grid-cols-5") ||
    !layoutSrc.includes("overflow-x-hidden") ||
    layoutSrc.includes("overflow-x-auto")
  ) {
    failed += 1;
    console.error(
      "Sponsor tabs are still chopping off on a phone. Pull the files above, then hard-refresh."
    );
  }
} else {
  failed += 1;
  console.error("Sponsor nav files are missing.");
}

if (failed) process.exit(1);
console.log(
  "OK: All sponsor tabs stay on screen on a phone. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
