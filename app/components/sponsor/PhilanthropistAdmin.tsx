"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PHILANTHROPIST_ADMIN_COPY,
  PHILANTHROPIST_ADMIN_HEADING,
  philanthropistDisplayName,
  type PhilanthropistRecord,
} from "@/app/lib/philanthropist";
import {
  philanthropistAdminSnapshot,
  type PhilanthropistAdminSnapshot,
} from "@/app/lib/philanthropist-admin";
import { PHILANTHROPIST_ADMIN_ID } from "@/app/lib/routes";
import { listLocalWalletTakes } from "@/app/lib/climate-wallet-takes";
import { listClimateWallets } from "@/app/services/sponsor-wallet.service";

export function PhilanthropistAdmin({
  record,
}: {
  record: PhilanthropistRecord;
}) {
  const brand = philanthropistDisplayName(record);
  const [snapshot, setSnapshot] = useState<PhilanthropistAdminSnapshot>(() =>
    philanthropistAdminSnapshot({ record })
  );

  useEffect(() => {
    setSnapshot(
      philanthropistAdminSnapshot({
        record,
        takes: listLocalWalletTakes(),
        wallets: listClimateWallets(),
      })
    );
  }, [record]);

  const clubsLabel = useMemo(() => {
    if (snapshot.clubs.length === 1) return snapshot.clubs[0].clubName;
    return `${snapshot.clubs.length} clubs`;
  }, [snapshot.clubs]);

  return (
    <section
      id={PHILANTHROPIST_ADMIN_ID}
      data-testid="philanthropist-admin"
      data-my-s4p-admin="philanthropist-admin-pst-v1"
      className="mt-12 scroll-mt-6 rounded-3xl border border-slate-700 bg-slate-900 p-6 sm:p-8"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
        {PHILANTHROPIST_ADMIN_HEADING}
      </p>
      <h2 className="mt-2 text-3xl font-black">{PHILANTHROPIST_ADMIN_HEADING}</h2>
      <p className="mt-3 max-w-3xl text-slate-300">{PHILANTHROPIST_ADMIN_COPY}</p>
      <p className="mt-4 text-sm font-semibold text-slate-400">
        {brand} · {clubsLabel} · {snapshot.fansEngaged} fans engaged
      </p>

      <h3 className="mt-8 text-sm font-black uppercase tracking-[0.18em] text-green-300">
        Clubs
      </h3>
      {snapshot.clubs.length === 0 ? (
        <p className="mt-3 text-sm font-semibold text-slate-400">
          You have not put money up for a club yet.
        </p>
      ) : (
        <>
        <ul className="mt-3 space-y-3 md:hidden">
          {snapshot.clubs.map((club) => (
            <li
              key={club.clubName}
              className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3"
            >
              <p className="font-black">{club.clubName}</p>
              <p className="mt-1 text-sm font-semibold text-slate-300">
                {club.country} · {club.giftLabel}
              </p>
              <p className="mt-1 text-sm font-semibold text-green-300">
                {club.fansEngaged} fans engaged
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-3 hidden overflow-x-auto rounded-2xl border border-slate-700 md:block">
          <table className="w-full min-w-[28rem] text-left">
            <thead className="bg-slate-950 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Club</th>
                <th className="px-4 py-3 font-semibold">Area</th>
                <th className="px-4 py-3 text-right font-semibold">Gift</th>
                <th className="px-4 py-3 text-right font-semibold">Fans engaged</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.clubs.map((club) => (
                <tr key={club.clubName} className="border-t border-slate-800">
                  <td className="px-4 py-3.5 font-semibold">{club.clubName}</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-300">
                    {club.country}
                  </td>
                  <td className="px-4 py-3.5 text-right font-semibold text-green-300">
                    {club.giftLabel}
                  </td>
                  <td className="px-4 py-3.5 text-right font-semibold text-green-300">
                    {club.fansEngaged}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      <h3 className="mt-8 text-sm font-black uppercase tracking-[0.18em] text-green-300">
        Matches
      </h3>
      {snapshot.matches.length === 0 ? (
        <p className="mt-3 text-sm font-semibold text-slate-400">
          Choose a Club and Match above, then enter how much you are putting
          into that sponsorship.
        </p>
      ) : (
        <>
        <ul className="mt-3 space-y-3 md:hidden">
          {snapshot.matches.map((match) => (
            <li
              key={match.id}
              className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3"
            >
              <p className="text-xs font-black uppercase tracking-[0.14em] text-green-300">
                {match.statusLabel}
              </p>
              <p className="mt-1 font-black">{match.fixtureName}</p>
              <p className="mt-1 text-sm font-semibold text-slate-300">
                {match.clubName} · {match.when}
              </p>
              <p className="mt-1 text-sm font-semibold text-green-300">
                {match.amountLabel} · {match.league}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-3 hidden overflow-x-auto rounded-2xl border border-slate-700 md:block">
          <table className="w-full min-w-[32rem] text-left">
            <thead className="bg-slate-950 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Match</th>
                <th className="px-4 py-3 font-semibold">Club</th>
                <th className="px-4 py-3 font-semibold">When</th>
                <th className="px-4 py-3 text-right font-semibold">Amount</th>
                <th className="px-4 py-3 text-right font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.matches.map((match) => (
                <tr key={match.id} className="border-t border-slate-800">
                  <td className="px-4 py-3.5 font-semibold">
                    {match.fixtureName}
                    <p className="mt-1 text-xs font-semibold text-slate-400">
                      {match.league}
                    </p>
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-slate-300">
                    {match.clubName}
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-slate-300">
                    {match.when}
                  </td>
                  <td className="px-4 py-3.5 text-right font-semibold text-green-300">
                    {match.amountLabel}
                  </td>
                  <td className="px-4 py-3.5 text-right font-semibold text-green-300">
                    {match.statusLabel}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}
    </section>
  );
}
