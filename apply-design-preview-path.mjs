import { existsSync, readFileSync, writeFileSync } from "fs";

const rel = "app/lib/routes.ts";
if (!existsSync(rel)) {
  console.error("Stay in the S4C-platform folder (the one that contains app\\lib\\routes.ts).");
  process.exit(1);
}

let src = readFileSync(rel, "utf8");
if (src.includes("DESIGN_PREVIEW_PATH")) {
  console.log("OK: DESIGN_PREVIEW_PATH is already in app/lib/routes.ts. Stop npm run dev, start it again, and hard-refresh.");
  process.exit(0);
}

const line = 'export const DESIGN_PREVIEW_PATH = "/preview/design";';
if (src.includes("GLOBAL_SCHOOLS_SOLAR_PATH")) {
  src = src.replace(
    /export const GLOBAL_SCHOOLS_SOLAR_PATH = "\/global-schools-solar";/,
    `$&\n${line}`
  );
} else {
  src += `\n${line}\n`;
}

if (!src.includes("DESIGN_PREVIEW_PATH")) {
  console.error("Could not insert DESIGN_PREVIEW_PATH. Add this line to app/lib/routes.ts:");
  console.error(line);
  process.exit(1);
}

writeFileSync(rel, src);
console.log(
  "OK: added DESIGN_PREVIEW_PATH. Stop npm run dev, start it again, and hard-refresh."
);
