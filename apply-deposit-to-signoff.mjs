import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/deposit-to-signoff-18f9";
const FILES = [
  "app/sponsor/wallet/page.tsx",
  "app/sponsor/dashboard/page.tsx",
  "app/lib/routes.ts",
  "app/lib/s4p-themes.ts",
  "app/services/climate-sponsors.service.ts",
  "scripts/verify-sponsor-dashboard.ts",
  "scripts/verify-sponsor-completion-flow.ts",
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

const previewLine = 'export const DESIGN_PREVIEW_PATH = "/preview/design";';
for (const rel of ["app/lib/routes.ts", "app/lib/s4p-themes.ts"]) {
  if (!existsSync(rel)) continue;
  let src = readFileSync(rel, "utf8");
  if (src.includes('export { DESIGN_PREVIEW_PATH } from "./s4p-themes"')) {
    src = src.replace(
      /export \{ DESIGN_PREVIEW_PATH \} from "\.\/s4p-themes";?/,
      previewLine
    );
    writeFileSync(rel, src);
    console.log("Replaced s4p-themes re-export in", rel);
  } else if (!/export const DESIGN_PREVIEW_PATH/.test(src)) {
    src += `\n${previewLine}\n`;
    writeFileSync(rel, src);
    console.log("Patched", rel);
  }
}

if (failed) process.exit(1);
console.log(
  "OK: Deposit into the Climate Sponsorship Wallet now opens Terms & Conditions + sign-off. Stop npm run dev, start it again, and hard-refresh."
);
