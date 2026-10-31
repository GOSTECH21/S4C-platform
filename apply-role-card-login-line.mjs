import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/role-card-login-line-18f9";
const BUST = "role-card-login-line-1";
const FILES = [
  "app/components/home/HomeRoleSection.tsx",
  "app/lib/home-stakeholders.ts",
  "scripts/verify-role-card-login-line.ts",
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
    !src.includes("role-card-login-v1") ||
    !src.includes("card.loginText") ||
    !src.includes("RoleLoginLine")
  ) {
    failed += 1;
    console.error(
      "The Already registered? Login line is not under the role CTAs. Pull the files above, then hard-refresh."
    );
  }
} else {
  failed += 1;
  console.error("app/components/home/HomeRoleSection.tsx is missing.");
}

if (failed) process.exit(1);
console.log(
  "OK: Each role card now has Already registered? Login under the green button. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
