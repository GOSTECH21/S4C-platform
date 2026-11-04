"use client";

import {
  CLUB_FIXTURE_COLUMN_CLASS,
  PHONE_COLUMN_CLASS,
} from "@/app/components/home/PhoneFrame";
import SelectMatchFixtures, {
  SelectMatchPhone,
  SelectMatchProvider,
  type SelectMatchMode,
} from "@/app/components/home/SelectMatchFixtures";
import {
  HOW_S4P_SELECT_MATCH,
  howS4pSelectMatchCopy,
  type HowS4pSelectMatchAudience,
} from "@/app/lib/how-s4p-works";

const MARK_GREEN = "#5bc662";

const MODE_FOR: Record<HowS4pSelectMatchAudience, SelectMatchMode> = {
  fan: "view",
  sponsor: "sponsor",
  club: "club",
};

export default function HowS4pSelectMatch({
  audience,
  initialClub,
  clubLocked = false,
  clubOptions = null,
  className = "",
}: {
  audience: HowS4pSelectMatchAudience;
  initialClub?: string;
  clubLocked?: boolean;
  clubOptions?: string[] | null;
  className?: string;
}) {
  const copy = howS4pSelectMatchCopy(audience);
  const mode = MODE_FOR[audience];

  return (
    <SelectMatchProvider
      active
      initialClub={initialClub}
      clubLocked={clubLocked}
      clubOptions={clubOptions}
      mode={mode}
    >
      <section
        data-how-s4p-select-match={audience}
        data-club-pc-no-phone-frame={
          audience === "club" ? "club-pc-no-phone-frame-v1" : undefined
        }
        className={`s4p-navy-panel overflow-hidden rounded-[1.75rem] border border-emerald-400/30 px-3 py-6 text-black sm:px-6 sm:py-8 md:px-8 ${className}`}
      >
        <div className="flex min-w-0 flex-col items-center gap-8 px-1 lg:flex-row lg:items-center lg:gap-12">
          <div
            className={`${
              audience === "club"
                ? CLUB_FIXTURE_COLUMN_CLASS
                : PHONE_COLUMN_CLASS
            } order-2 lg:order-1`}
          >
            <SelectMatchPhone
              src={HOW_S4P_SELECT_MATCH.src}
              alt={HOW_S4P_SELECT_MATCH.alt}
            />
          </div>
          <div className="order-1 min-w-0 flex-1 lg:order-2">
            <h3
              className={
                audience === "club"
                  ? "text-4xl font-black uppercase leading-none tracking-tight sm:text-5xl md:text-6xl"
                  : "text-3xl font-black uppercase leading-none tracking-tight sm:text-4xl md:text-5xl"
              }
            >
              {copy.title}
            </h3>
            <p
              className={
                audience === "club"
                  ? "mt-5 max-w-xl text-lg font-semibold leading-8 sm:text-xl sm:leading-9"
                  : "mt-4 max-w-xl text-base font-semibold leading-7 sm:text-lg sm:leading-8"
              }
            >
              {copy.caption}
            </p>
            <ul className={audience === "club" ? "mt-6 space-y-4" : "mt-5 space-y-3"}>
              {copy.points.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex shrink-0 items-center justify-center rounded-full font-black text-black ${
                      audience === "club" ? "h-6 w-6 text-base" : "h-5 w-5 text-sm"
                    }`}
                    style={{ backgroundColor: MARK_GREEN }}
                    aria-hidden
                  >
                    ✓
                  </span>
                  <span
                    className={
                      audience === "club"
                        ? "text-base font-semibold leading-7 sm:text-lg"
                        : "text-sm font-semibold leading-6 sm:text-base"
                    }
                  >
                    {point}
                  </span>
                </li>
              ))}
            </ul>
            <SelectMatchFixtures />
          </div>
        </div>
      </section>
    </SelectMatchProvider>
  );
}
