"use client";

import Link from "next/link";
import {
  PHILANTHROPIST_MIN_GBP,
  philanthropistDisplayName,
  type PhilanthropistRecord,
} from "@/app/lib/philanthropist";
import { sponsorPayPath } from "@/app/lib/routes";
import {
  PAY_WITH_CARD_LABEL,
  isMatchDayCardPaymentConfirmed,
} from "@/app/lib/sponsor-card-payment";
import {
  PLATFORM_FEE_LABEL,
  formatWalletGbp,
  localWalletTopUp,
} from "@/app/lib/sponsor-wallet";

export function PhilanthropistPaymentDue({
  record,
}: {
  record: PhilanthropistRecord;
}) {
  const brandName = philanthropistDisplayName(record);
  const byClub = new Map<
    string,
    { clubName: string; fixtureName: string; amountGbp: number }
  >();
  const matches =
    record.matchSponsorships && record.matchSponsorships.length > 0
      ? record.matchSponsorships
      : record.clubName && record.giftGbp >= PHILANTHROPIST_MIN_GBP
        ? [
            {
              clubName: record.clubName,
              fixtureName: "",
              amountGbp: record.giftGbp,
            },
          ]
        : [];
  for (const row of matches) {
    const key = row.clubName.trim().toLowerCase();
    if (!key || row.amountGbp < PHILANTHROPIST_MIN_GBP) continue;
    const current = byClub.get(key);
    if (current) {
      current.amountGbp += row.amountGbp;
      if (row.fixtureName) current.fixtureName = row.fixtureName;
    } else {
      byClub.set(key, {
        clubName: row.clubName,
        fixtureName: row.fixtureName,
        amountGbp: row.amountGbp,
      });
    }
  }
  const due = [...byClub.values()].filter(
    (row) =>
      !isMatchDayCardPaymentConfirmed({
        clubName: row.clubName,
        brandName,
      })
  );
  if (due.length === 0) return null;

  return (
    <div className="mt-6 space-y-4" data-philanthropist-payment="philanthropist-pay-v1">
      {due.map((row) => {
        const topUp = localWalletTopUp(row.amountGbp);
        return (
          <section
            key={row.clubName}
            className="rounded-3xl border border-amber-400/40 bg-slate-900 p-6"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-300">
              Payment
            </p>
            <h2 className="mt-2 text-2xl font-black">Pay for this sponsorship</h2>
            <p className="mt-3 text-slate-300">
              {row.fixtureName
                ? `${row.clubName} · ${row.fixtureName}. `
                : `${row.clubName}. `}
              A 5% Platform Fee is added on top of your sponsorship. Pay with
              your card to put the sponsorship into the Philanthropist Carbon
              Wallet.
            </p>
            <dl className="mt-4 grid gap-3 sm:grid-cols-3">
              <div>
                <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
                  Sponsorship
                </dt>
                <dd className="text-xl font-black">
                  {formatWalletGbp(topUp.sponsorshipGbp)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
                  {PLATFORM_FEE_LABEL}
                </dt>
                <dd className="text-xl font-black">
                  {formatWalletGbp(topUp.managementFeeGbp)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
                  You pay
                </dt>
                <dd className="text-xl font-black">
                  {formatWalletGbp(topUp.paidGbp)}
                </dd>
              </div>
            </dl>
            <Link
              href={sponsorPayPath(row.clubName)}
              className="mt-5 inline-flex rounded-xl bg-[#635BFF] px-5 py-3 font-bold text-white"
            >
              {PAY_WITH_CARD_LABEL}
            </Link>
          </section>
        );
      })}
    </div>
  );
}
