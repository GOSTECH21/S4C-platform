import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/club-register-hydration-18f9";
const FILES = ["app/club/register/page.tsx", "scripts/verify-club-register-step1.ts"];

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

const page = "app/club/register/page.tsx";
if (existsSync(page)) {
  const src = readFileSync(page, "utf8");
  if (
    !src.includes("suppressHydrationWarning") ||
    !src.includes("formReady") ||
    !src.includes("<form")
  ) {
    failed += 1;
    console.error(
      "The Club Registration hydration fix did not land. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: Club Registration no longer hydrates against Chrome-injected form attributes. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
