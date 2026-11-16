"use client";
/* philanthropist-register-v1 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentSponsor } from "@/app/services/current-sponsor.service";
import {
  PHILANTHROPIST_REGISTER_PATH,
  SPONSOR_LOGIN_PATH,
} from "@/app/lib/routes";
import { PhilanthropistAdmin } from "@/app/components/sponsor/PhilanthropistAdmin";
import { PhilanthropistSponsorsTable } from "@/app/components/sponsor/PhilanthropistSponsorsTable";
import {
  PHILANTHROPIST_HOME_EMPTY,
  PHILANTHROPIST_HOME_HEADING,
  PHILANTHROPIST_KICKER,
  philanthropistDisplayName,
  philanthropistGiftCopy,
  readPhilanthropistRecord,
  type PhilanthropistRecord,
} from "@/app/lib/philanthropist";

export default function PhilanthropistHomePage() {
  const [record, setRecord] = useState<PhilanthropistRecord | null>(null);
  const [brand, setBrand] = useState("");

  useEffect(() => {
    setRecord(readPhilanthropistRecord());
    void getCurrentSponsor()
      .then((sponsor) => {
        setBrand(String(sponsor.name ?? "").trim());
      })
      .catch(() => {
        setBrand("");
      });
  }, []);

  const headingName = record ? philanthropistDisplayName(record) : brand;

  return (
    <div
      className="mx-auto max-w-5xl py-10"
      data-philanthropist-home="philanthropist-register-v1"
      data-testid="philanthropist-home"
    >
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
        {PHILANTHROPIST_KICKER}
      </p>
      <h1 className="mt-3 text-4xl font-black">{PHILANTHROPIST_HOME_HEADING}</h1>
      {headingName ? (
        <p className="mt-2 text-lg font-semibold text-white">{headingName}</p>
      ) : null}
      <p className="mt-4 text-slate-300">
        {record ? philanthropistGiftCopy(record) : PHILANTHROPIST_HOME_EMPTY}
      </p>
      {record ? (
        <>
          <PhilanthropistAdmin record={record} />
          <PhilanthropistSponsorsTable record={record} />
        </>
      ) : (
        <p className="mt-8 flex flex-wrap gap-3">
          <Link
            href={PHILANTHROPIST_REGISTER_PATH}
            className="inline-flex items-center justify-center rounded-xl bg-green-500 px-5 py-3 font-bold text-slate-950 hover:bg-green-400"
          >
            Register as Philanthropist
          </Link>
          <Link
            href={SPONSOR_LOGIN_PATH}
            className="inline-flex items-center justify-center rounded-xl border border-s4p-mark bg-s4p-mark/15 px-5 py-3 font-bold text-slate-950 hover:bg-s4p-mark/30"
          >
            Login
          </Link>
        </p>
      )}
    </div>
  );
}
