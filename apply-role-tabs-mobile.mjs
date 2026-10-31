import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/role-tabs-mobile-18f9";
const BUST = "role-tabs-mobile-1";
const FILES = [
  "app/lib/home-stakeholders.ts",
  "app/components/home/HomeRoleSection.tsx",
  "scripts/verify-role-tabs-mobile.ts",
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

const roles = "app/components/home/HomeRoleSection.tsx";
if (existsSync(roles)) {
  const src = readFileSync(roles, "utf8");
  if (
    !src.includes("role-tabs-mobile-v1") ||
    !src.includes("Who are you joining as?") ||
    !src.includes("Turn every match into a climate mission.") ||
    !src.includes("selected.image") ||
    !src.includes("hidden md:grid")
  ) {
    failed += 1;
    console.error(
      "The mobile role tabs are not in place. Pull the files above, then hard-refresh."
    );
  }
} else {
  failed += 1;
  console.error("app/components/home/HomeRoleSection.tsx is missing.");
}

if (failed) process.exit(1);
console.log(
  "OK: Mobile roles now use the six tabs. Selecting a tab shows that role image and a short description. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
