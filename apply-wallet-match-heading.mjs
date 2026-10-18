import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/wallet-match-heading-18f9";
const FILES = [
  "app/lib/match-day-carbon-offset.ts",
  "app/components/sponsor/ClubChosenProjectsPanel.tsx",
  "app/components/sponsor/ClimateSponsorshipWallet.tsx",
  "app/sponsor/wallet/page.tsx",
  "app/preview/match-day-lock-in/page.tsx",
  "scripts/verify-wallet-match-heading.ts",
  "scripts/verify-match-day-carbon-offset.ts",
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

const wallet = "app/sponsor/wallet/page.tsx";
const copy = "app/lib/match-day-carbon-offset.ts";
if (existsSync(wallet) && existsSync(copy)) {
  const walletSrc = readFileSync(wallet, "utf8");
  const copySrc = readFileSync(copy, "utf8");
  if (
    !walletSrc.includes("climateWalletHeading") ||
    !walletSrc.includes("climateWalletFansCopy") ||
    !copySrc.includes("v Selected Opponent") ||
    !copySrc.includes("Preferred Climate Project") ||
    !copySrc.includes("saved in a Folder for your Record")
  ) {
    failed += 1;
    console.error(
      "Wallet match heading files did not land. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: Climate Sponsorship Wallet names the Match, fans put cash into their Preferred Climate Project, and Match Day Record is the folder copy. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
