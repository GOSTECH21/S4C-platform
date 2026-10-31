import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/club-register-mobile-scale-18f9";
const BUST = "club-register-mobile-scale-1";
const FILES = [
  "app/club/register/page.tsx",
  "app/globals.css",
  "scripts/verify-club-register-mobile-scale.ts",
  "scripts/verify-club-register-step1.ts",
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

const page = "app/club/register/page.tsx";
const css = "app/globals.css";
if (existsSync(page) && existsSync(css)) {
  const src = readFileSync(page, "utf8");
  const cssSrc = readFileSync(css, "utf8");
  if (
    !src.includes('data-club-register-scale="club-register-mobile-scale-v1"') ||
    !src.includes("px-4 py-8 sm:px-8 sm:py-20") ||
    !src.includes("CLUB_REGISTER_FIELD_CLASS") ||
    !src.includes("CLUB_REGISTER_CONTINUE_CLASS") ||
    !cssSrc.includes("max-width: 100%")
  ) {
    failed += 1;
    console.error(
      "Club Registration is still using desktop padding on the phone. Pull the files above, then hard-refresh."
    );
  }
} else {
  failed += 1;
  console.error("Club Registration files are missing.");
}

if (failed) process.exit(1);
console.log(
  "OK: Club Registration now fits a phone width. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
