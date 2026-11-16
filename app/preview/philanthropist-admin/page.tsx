"use client";

import { useEffect, useState } from "react";
import { PhilanthropistAdmin } from "@/app/components/sponsor/PhilanthropistAdmin";
import { PhilanthropistMatchGift } from "@/app/components/sponsor/PhilanthropistMatchGift";
import { PhilanthropistSponsorsTable } from "@/app/components/sponsor/PhilanthropistSponsorsTable";
import {
  PHILANTHROPIST_HOME_HEADING,
  PHILANTHROPIST_KICKER,
  philanthropistDisplayName,
  philanthropistGiftCopy,
  readPhilanthropistRecord,
  writePhilanthropistRecord,
  type PhilanthropistRecord,
} from "@/app/lib/philanthropist";
import { depositPhilanthropistClimateWallet } from "@/app/services/sponsor-wallet.service";

const SMITH: PhilanthropistRecord = {
  name: "Alex Smith",
  organisation: "The Smith Foundation",
  email: "alex@smith-foundation.test",
  clubName: "Brighton & Hove Albion",
  giftGbp: 17500,
  createdAt: "2026-11-16T10:00:00.000Z",
};

export default function PhilanthropistAdminPreviewPage() {
  const [record, setRecord] = useState<PhilanthropistRecord | null>(null);

  useEffect(() => {
    const existing = readPhilanthropistRecord();
    const seeded =
      existing?.email === SMITH.email
        ? existing
        : (() => {
            writePhilanthropistRecord(SMITH);
            return SMITH;
          })();
    depositPhilanthropistClimateWallet({
      clubName: seeded.clubName,
      brandName: philanthropistDisplayName(seeded),
      giftGbp: seeded.giftGbp,
    });
    setRecord(seeded);
  }, []);

  if (!record) {
    return (
      <main className="min-h-screen p-6 text-white">
        Loading My S4P Admin...
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 text-white sm:p-10">
      <div className="mx-auto max-w-5xl py-6">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
          {PHILANTHROPIST_KICKER}
        </p>
        <h1 className="mt-3 text-4xl font-black">{PHILANTHROPIST_HOME_HEADING}</h1>
        <p className="mt-2 text-lg font-semibold text-white">
          {philanthropistDisplayName(record)}
        </p>
        <p className="mt-4 text-slate-300">{philanthropistGiftCopy(record)}</p>
        <PhilanthropistMatchGift
          identity={{
            name: record.name,
            organisation: record.organisation,
            email: record.email,
            createdAt: record.createdAt,
          }}
          record={record}
          brandName={philanthropistDisplayName(record)}
          onSaved={setRecord}
        />
        <PhilanthropistAdmin record={record} />
        <PhilanthropistSponsorsTable record={record} />
      </div>
    </main>
  );
}
