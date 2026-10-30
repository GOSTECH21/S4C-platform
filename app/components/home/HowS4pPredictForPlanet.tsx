"use client";

import type { ReactNode } from "react";
import { PHONE_COLUMN_CLASS } from "@/app/components/home/PhoneFrame";
import { SelectMatchProvider } from "@/app/components/home/SelectMatchFixtures";
import {
  PredictForPlanetPanel,
  PredictForPlanetPhone,
} from "@/app/components/home/PredictForPlanet";
import { HOW_S4P_P4P } from "@/app/lib/how-s4p-works";
import {
  P4P_LABEL,
  p4pHowItWorksCaption,
  p4pHowItWorksPoints,
} from "@/app/lib/predict-for-planet";

export default function HowS4pPredictForPlanet({
  initialClub,
  clubOptions = null,
  fixtureName,
  children,
  className = "",
}: {
  initialClub?: string;
  clubOptions?: string[] | null;
  fixtureName?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <SelectMatchProvider
      active
      initialClub={initialClub}
      clubOptions={clubOptions}
      mode="view"
    >
      <section
        data-how-s4p-p4p
        className={`s4p-navy-panel overflow-hidden rounded-[1.75rem] border border-emerald-400/30 px-3 py-6 text-black sm:px-6 sm:py-8 md:px-8 ${className}`}
      >
        <div className="flex min-w-0 flex-col items-center gap-8 px-1 lg:flex-row lg:items-center lg:gap-12">
          <PredictForPlanetPanel
            title={P4P_LABEL}
            caption={p4pHowItWorksCaption()}
            points={p4pHowItWorksPoints()}
          />
          <div className={PHONE_COLUMN_CLASS}>
            <PredictForPlanetPhone
              src={HOW_S4P_P4P.src}
              alt={HOW_S4P_P4P.alt}
              fixtureName={fixtureName}
            />
          </div>
        </div>
        {children ? <div className="mt-10">{children}</div> : null}
      </section>
    </SelectMatchProvider>
  );
}
