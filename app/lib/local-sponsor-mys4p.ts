/** My S4P for a signed-in Local Business Climate Sponsor. */

import { brandsMatch } from "./climate-sponsors";
import {
  sumWalletTakesGbp,
  type ClimateWalletTake,
} from "./climate-wallet-takes";
import { sameNamedFixture } from "./club-fixtures";
import {
  isSignedOffLocalSponsor,
  totalLocalPledge,
  uniqueLocalClubBrandRecords,
  type LocalSponsorRecord,
} from "./local-sponsor";
import { formatFundingGbp } from "./platform-stats";
import { clubsMatch } from "./sponsor-dashboard";
import {
  DEFAULT_WALLET_VOTE_GBP,
  remainingGbp,
  roundGbp,
  type ClimateWallet,
} from "./sponsor-wallet";

export const LOCAL_MY_S4P_NAV = "My S4P";
export const LOCAL_MY_S4P_HEADING = "My S4P";
export const LOCAL_MY_S4P_COPY =
  "Records for the Climate Projects you have sponsored, how much you have spent, and how many Fans have taken money from your Carbon Wallet — and seen your brand.";

export type LocalMyS4pProjectRow = {
  key: string;
  name: string;
  clubName: string;
  spentGbp: number;
  spentLabel: string;
  takenGbp: number;
  takenLabel: string;
  fans: number;
};

export type LocalMyS4pSnapshot = {
  spentGbp: number;
  spentLabel: string;
  remainingGbp: number;
  remainingLabel: string;
  takenGbp: number;
  takenLabel: string;
  fansEngaged: number;
  brandSightings: number;
  projects: LocalMyS4pProjectRow[];
};

export function localFansFromAllocated(allocatedGbp: number): number {
  const vote = DEFAULT_WALLET_VOTE_GBP;
  if (vote <= 0) return 0;
  return Math.max(0, Math.round((Number(allocatedGbp) || 0) / vote));
}

function namedProject(
  record: LocalSponsorRecord,
  wallet?: ClimateWallet | null
): string {
  return (
    String(record.sponsoredProjectName ?? "").trim() ||
    String(wallet?.sponsoredProjectName ?? "").trim() ||
    (record.matchSponsorships ?? [])
      .map((row) => String(row.projectName ?? "").trim())
      .find(Boolean) ||
    "Club Climate Projects"
  );
}

function withLabels(
  row: Omit<LocalMyS4pProjectRow, "spentLabel" | "takenLabel">
): LocalMyS4pProjectRow {
  return {
    ...row,
    spentLabel: formatFundingGbp(row.spentGbp),
    takenLabel: formatFundingGbp(row.takenGbp),
  };
}

export function localSponsorMyS4pSnapshot({
  brandName,
  records,
  wallets = [],
  takes = [],
}: {
  brandName: string;
  records: LocalSponsorRecord[];
  wallets?: ClimateWallet[];
  takes?: ClimateWalletTake[];
}): LocalMyS4pSnapshot {
  const ownRecords = uniqueLocalClubBrandRecords(
    records.filter((row) => brandsMatch(row.brandName, brandName))
  );
  const ownWallets = wallets.filter(
    (wallet) =>
      wallet.kind === "local" && brandsMatch(wallet.brandName, brandName)
  );
  const ownTakes = takes.filter((take) =>
    brandsMatch(take.brandName, brandName)
  );

  const spentFromWallets = roundGbp(
    ownWallets.reduce((sum, wallet) => {
      const paid = Math.max(0, Number(wallet.paidGbp) || 0);
      const sponsorship = Math.max(0, Number(wallet.sponsorshipGbp) || 0);
      return sum + (paid > 0 ? paid : sponsorship);
    }, 0)
  );
  const spentFromRecords = roundGbp(
    ownRecords.reduce((sum, row) => sum + totalLocalPledge(row), 0)
  );
  const spentGbp = roundGbp(Math.max(spentFromWallets, spentFromRecords));
  const remaining = roundGbp(
    ownWallets.reduce((sum, wallet) => sum + remainingGbp(wallet), 0)
  );
  const takenFromWallets = roundGbp(
    ownWallets.reduce(
      (sum, wallet) => sum + Math.max(0, Number(wallet.allocatedGbp) || 0),
      0
    )
  );
  const takenGbp = roundGbp(
    Math.max(takenFromWallets, sumWalletTakesGbp(ownTakes))
  );
  const fansEngaged = Math.max(
    ownTakes.length,
    localFansFromAllocated(takenFromWallets)
  );

  const projects: LocalMyS4pProjectRow[] = [];
  const seen = new Set<string>();

  function add(
    row: Omit<LocalMyS4pProjectRow, "spentLabel" | "takenLabel">
  ) {
    const key = row.key.toLowerCase();
    const existing = projects.find((item) => item.key.toLowerCase() === key);
    if (existing) {
      existing.spentGbp = roundGbp(existing.spentGbp + row.spentGbp);
      existing.takenGbp = roundGbp(existing.takenGbp + row.takenGbp);
      existing.fans += row.fans;
      existing.spentLabel = formatFundingGbp(existing.spentGbp);
      existing.takenLabel = formatFundingGbp(existing.takenGbp);
      return;
    }
    seen.add(key);
    projects.push(withLabels(row));
  }

  for (const record of ownRecords) {
    const wallet = ownWallets.find((row) =>
      clubsMatch(row.clubName, record.clubName)
    );
    const name = namedProject(record, wallet);
    const clubTakes = ownTakes.filter((take) =>
      clubsMatch(take.clubName, record.clubName)
    );
    const projectTakes = clubTakes.filter((take) => {
      const takeName = String(take.projectName ?? "").trim();
      return !takeName || takeName.toLowerCase() === name.toLowerCase();
    });
    const spent = roundGbp(
      Math.max(
        totalLocalPledge(record),
        wallet
          ? Number(wallet.paidGbp) || Number(wallet.sponsorshipGbp) || 0
          : 0
      )
    );
    const taken = roundGbp(
      Math.max(
        sumWalletTakesGbp(projectTakes.length ? projectTakes : clubTakes),
        wallet ? Number(wallet.allocatedGbp) || 0 : 0
      )
    );
    add({
      key: `${record.clubName}:${name}`,
      name,
      clubName: record.clubName,
      spentGbp: spent,
      takenGbp: taken,
      fans: Math.max(
        projectTakes.length || clubTakes.length,
        localFansFromAllocated(wallet?.allocatedGbp ?? 0)
      ),
    });
  }

  for (const wallet of ownWallets) {
    const name =
      String(wallet.sponsoredProjectName ?? "").trim() ||
      "Club Climate Projects";
    const key = `${wallet.clubName}:${name}`;
    if (seen.has(key.toLowerCase())) continue;
    const clubTakes = ownTakes.filter((take) =>
      clubsMatch(take.clubName, wallet.clubName)
    );
    add({
      key,
      name,
      clubName: wallet.clubName,
      spentGbp: roundGbp(
        Number(wallet.paidGbp) || Number(wallet.sponsorshipGbp) || 0
      ),
      takenGbp: roundGbp(
        Math.max(Number(wallet.allocatedGbp) || 0, sumWalletTakesGbp(clubTakes))
      ),
      fans: Math.max(
        clubTakes.length,
        localFansFromAllocated(wallet.allocatedGbp)
      ),
    });
  }

  for (const take of ownTakes) {
    const name =
      String(take.projectName ?? "").trim() || "Club Climate Projects";
    const key = `${take.clubName}:${name}`;
    if (seen.has(key.toLowerCase())) continue;
    const group = ownTakes.filter((row) => {
      const rowName =
        String(row.projectName ?? "").trim() || "Club Climate Projects";
      return clubsMatch(row.clubName, take.clubName) && rowName === name;
    });
    add({
      key,
      name,
      clubName: take.clubName,
      spentGbp: 0,
      takenGbp: sumWalletTakesGbp(group),
      fans: group.length,
    });
  }

  return {
    spentGbp,
    spentLabel: formatFundingGbp(spentGbp),
    remainingGbp: remaining,
    remainingLabel: formatFundingGbp(remaining),
    takenGbp,
    takenLabel: formatFundingGbp(takenGbp),
    fansEngaged,
    brandSightings: fansEngaged,
    projects: projects.sort(
      (left, right) =>
        right.spentGbp - left.spentGbp || right.fans - left.fans
    ),
  };
}

export function localInviteDealtBySignedRecord(
  round: { clubName: string; matchLabel: string },
  brandName: string,
  records: LocalSponsorRecord[]
): boolean {
  return uniqueLocalClubBrandRecords(
    records.filter(
      (row) =>
        brandsMatch(row.brandName, brandName) && isSignedOffLocalSponsor(row)
    )
  ).some((row) => {
    if (!clubsMatch(row.clubName, round.clubName)) return false;
    const matches = row.matchSponsorships ?? [];
    if (matches.length === 0) return true;
    return matches.some((match) =>
      sameNamedFixture(match.fixtureName, round.matchLabel)
    );
  });
}
