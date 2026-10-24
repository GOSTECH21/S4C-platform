import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/local-register-hydration-18f9";
const FILES = [
  "app/components/forms/SafeFormField.tsx",
  "app/lib/role-login.ts",
  "app/sponsor/local/register/page.tsx",
  "app/sponsor/register/page.tsx",
  "app/partner/register/page.tsx",
  "app/components/sponsor/BrandLogoField.tsx",
  "app/components/sponsor/ClubNetworkPicker.tsx",
  "app/components/sponsor/MatchSponsorshipPicker.tsx",
  "scripts/verify-homepage.ts",
  "scripts/verify-role-login.ts",
  "scripts/verify-local-lobi-home.ts",
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

const page = "app/sponsor/local/register/page.tsx";
const field = "app/components/forms/SafeFormField.tsx";
if (existsSync(page) && existsSync(field)) {
  const src = readFileSync(page, "utf8");
  const safe = readFileSync(field, "utf8");
  if (
    !src.includes("formReady") ||
    !src.includes("SafeInput") ||
    !src.includes('roleRegisterAccount("local")') ||
    src.includes("<input") ||
    !safe.includes("suppressHydrationWarning")
  ) {
    failed += 1;
    console.error(
      "The Local Sponsor registration hydration fix did not land. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: Local Sponsor registration no longer hydrates against Chrome-injected form attributes. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
