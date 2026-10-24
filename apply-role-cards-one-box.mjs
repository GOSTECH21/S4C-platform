import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/role-cards-one-box-18f9";
const FILES = [
  "app/components/home/HomeRoleSection.tsx",
  "scripts/verify-homepage.ts",
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

const roles = "app/components/home/HomeRoleSection.tsx";
if (existsSync(roles)) {
  const src = readFileSync(roles, "utf8");
  if (
    src.includes("Whether you are a Fan/supporter") ||
    src.includes("reach your goals") ||
    !src.includes("data-role-cards-panel") ||
    !src.includes("data-role-cards-grid") ||
    src.indexOf("data-role-cards-panel") > src.indexOf("data-role-cards-grid")
  ) {
    failed += 1;
    console.error(
      "The sandwich paragraph is still there or the heading is not in the same box as the photos. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: Different Roles and the six photographs sit in one box. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
