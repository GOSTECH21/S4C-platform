import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/match-sponsorship-18f9";
const FILES = [
  "app/components/sponsor/ClimateSponsorshipWallet.tsx",
  "app/components/sponsor/ClubChosenProjectsPanel.tsx",
  "app/lib/match-day-carbon-offset.ts",
  "app/lib/sponsor-card-payment.ts",
  "app/lib/sponsor-wallet.ts",
  "app/lib/sponsor-listings.ts",
  "app/sponsor/wallet/page.tsx",
];

console.log("Folder:", process.cwd());

function findWalletFiles(dir, depth, found) {
  if (depth > 6) return;
  let entries = [];
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (
      entry.name === "node_modules" ||
      entry.name === ".next" ||
      entry.name === ".git"
    ) {
      continue;
    }
    const path = join(dir, entry.name);
    if (entry.isDirectory()) findWalletFiles(path, depth + 1, found);
    else if (entry.name === "ClimateSponsorshipWallet.tsx") found.push(path);
  }
}

const wallets = [];
findWalletFiles(process.cwd(), 0, wallets);
if (wallets.length === 0) {
  console.error(
    "Could not find ClimateSponsorshipWallet.tsx under this folder. In the SAME terminal where you run npm run dev, cd to S4C-platform and run this again."
  );
  process.exit(1);
}

const roots = [
  ...new Set(
    wallets.map((file) => dirname(dirname(dirname(dirname(file)))))
  ),
];
console.log("Updating wallet files:");
for (const file of wallets) console.log(" ", file);

async function pullFile(root, rel) {
  const url = `https://raw.githubusercontent.com/GOSTECH21/S4C-platform/${BRANCH}/${rel}`;
  let lastError = null;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const dest = join(root, rel);
      mkdirSync(dirname(dest), { recursive: true });
      writeFileSync(dest, Buffer.from(await response.arrayBuffer()));
      console.log("Pulled", dest);
      return true;
    } catch (err) {
      lastError = err;
      await new Promise((resolve) => setTimeout(resolve, attempt * 400));
    }
  }
  console.error(
    `Could not pull ${rel}.`,
    lastError instanceof Error ? lastError.message : lastError
  );
  return false;
}

let failed = 0;
for (const root of roots) {
  for (const rel of FILES) {
    const ok = await pullFile(root, rel);
    if (!ok) failed += 1;
  }
}

for (const file of wallets) {
  const wallet = existsSync(file) ? readFileSync(file, "utf8") : "";
  if (!wallet.includes("s4p-match-sponsorship-wallet-v2")) {
    failed += 1;
    console.error("Still old wallet:", file);
  } else {
    console.log("Updated wallet:", file);
  }
}

if (failed) process.exit(1);
console.log(
  "OK: Every ClimateSponsorshipWallet.tsx now has Match-Sponsorship + 5% Platform Fee. In the npm run dev terminal: Ctrl+C, then rmdir /s /q .next && npm run dev, then Ctrl+F5."
);
