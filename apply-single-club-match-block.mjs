import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/single-club-match-block-18f9";
const FILES = [
  "app/sponsor/dashboard/page.tsx",
  "app/sponsor/wallet/page.tsx",
  "app/sponsor/offers/page.tsx",
  "app/sponsor/offers/OfferSignOff.tsx",
  "app/sponsor/offers/OfferSignOffPage.tsx",
  "app/lib/sponsor-completion-flow.ts",
  "app/services/climate-sponsors.service.ts",
  "app/services/sponsor-offers.service.ts",
  "app/components/sponsor/ClubMatchMenus.tsx",
  "app/components/sponsor/SeeMatchDetails.tsx",
  "app/components/club/ClubClimateSponsorTabs.tsx",
  "app/lib/climate-sponsors.ts",
  "app/lib/sponsor-home.ts",
  "app/lib/local-sponsor.ts",
  "app/lib/routes.ts",
  "scripts/verify-sponsor-dashboard.ts",
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

const localSponsor = "app/lib/local-sponsor.ts";
if (existsSync(localSponsor)) {
  let src = readFileSync(localSponsor, "utf8");
  if (!src.includes("export function clubNameForLocalBrand")) {
    src += `
export function clubNameForLocalBrand(brandName) {
  const name = String(brandName ?? "").trim().toLowerCase();
  if (!name) return null;
  const record = readLocalSponsorRecord() ?? localRecordFromProfile();
  if (record && record.brandName.trim().toLowerCase() === name) {
    return record.clubName;
  }
  return null;
}
`;
    writeFileSync(localSponsor, src);
    console.log("Patched", localSponsor);
  }
}

const sponsorHome = "app/lib/sponsor-home.ts";
if (existsSync(sponsorHome)) {
  let src = readFileSync(sponsorHome, "utf8");
  let patched = false;
  if (!src.includes("export function isLocalClimateSponsor")) {
    src += `
export function isLocalClimateSponsor(brandName, hints = {}) {
  const name = String(brandName ?? "").trim();
  const job = String(hints.jobTitle ?? "");
  if (/local\\s+business/i.test(job)) return true;
  return false;
}
`;
    patched = true;
  }
  if (!src.includes("export function isLeadSponsorHome")) {
    src += `
export function isLeadSponsorHome(brandName, hints = {}) {
  return !isLocalClimateSponsor(brandName, hints);
}
`;
    patched = true;
  }
  if (!src.includes("export function rememberLocalSponsorSession")) {
    src += `
export function rememberLocalSponsorSession(sponsor) {
  if (typeof window === "undefined") return;
  const companyName = String(sponsor?.name ?? "").trim();
  const jobTitle = String(sponsor?.industry ?? "").trim();
  if (!companyName) return;
  try {
    const raw = window.localStorage.getItem("s4p.sponsor.profile");
    const previous = raw ? JSON.parse(raw) : {};
    window.localStorage.setItem(
      "s4p.sponsor.profile",
      JSON.stringify({
        ...previous,
        companyName,
        jobTitle: jobTitle || previous.jobTitle || "Local Business Climate Sponsor",
        tier: /local\\s+business/i.test(jobTitle) ? "local" : previous.tier,
        clubName: previous.clubName ?? null,
      })
    );
  } catch {}
}
`;
    patched = true;
  }
  if (!src.includes("export function sponsorHomePath")) {
    src += `
export function sponsorHomePath(brandName, hints = {}) {
  return isLocalClimateSponsor(brandName, hints)
    ? "/sponsor/wallet"
    : "/sponsor/dashboard";
}
`;
    patched = true;
  }
  if (patched) {
    writeFileSync(sponsorHome, src);
    console.log("Patched", sponsorHome);
  }
}

if (failed) process.exit(1);
console.log(
  "OK: Sponsor dashboard now has one Select a Club / Select the Match block above the Climate Sponsorship Wallet. Stop npm run dev, start it again, and hard-refresh."
);
