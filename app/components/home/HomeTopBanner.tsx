import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CLIMATE_CREDITS_PATH,
  S4P_IMPACT_TABLES_PATH,
} from "@/app/lib/routes";

const MARK_GREEN = "#5bc662";

const NAV: Array<{
  href: string;
  label: string;
  icon: "home" | "gear" | "leaf" | "file" | "news";
}> = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/#how-s4p-works", label: "How it works", icon: "gear" },
  { href: S4P_IMPACT_TABLES_PATH, label: "Impact", icon: "leaf" },
  { href: CLIMATE_CREDITS_PATH, label: "Projects", icon: "file" },
  { href: "/#", label: "News", icon: "news" },
];

const FEATURES: Array<{
  label: string;
  icon: "target" | "coins" | "leaf" | "bars";
}> = [
  { label: "Measure emissions", icon: "target" },
  { label: "Unlock funding", icon: "coins" },
  { label: "Support climate projects", icon: "leaf" },
  { label: "Show real impact", icon: "bars" },
];

function NavIcon({ name }: { name: (typeof NAV)[number]["icon"] }) {
  const common = "h-5 w-5";
  if (name === "home") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden>
        <path d="M12 3.2 3.2 10.4V21h6.2v-6.2h5.2V21h6.2V10.4L12 3.2Z" />
      </svg>
    );
  }
  if (name === "gear") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden>
        <path d="M10.1 3h3.8l.5 2.2a6.8 6.8 0 0 1 1.7.9l2.1-.8 1.9 3.3-1.6 1.5c.1.5.2 1 .2 1.5s-.1 1-.2 1.5l1.6 1.5-1.9 3.3-2.1-.8a6.8 6.8 0 0 1-1.7.9L13.9 21h-3.8l-.5-2.2a6.8 6.8 0 0 1-1.7-.9l-2.1.8-1.9-3.3 1.6-1.5A7 7 0 0 1 5 12c0-.5.1-1 .2-1.5L3.6 9l1.9-3.3 2.1.8a6.8 6.8 0 0 1 1.7-.9L10.1 3ZM12 9.2A2.8 2.8 0 1 0 14.8 12 2.8 2.8 0 0 0 12 9.2Z" />
      </svg>
    );
  }
  if (name === "leaf") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden>
        <path d="M19 4c-7.2.4-13 5.2-13 12 0 1.8.5 3.3 1.4 4.5L4 22l.8 1.1 4.2-2.8c.7.3 1.5.5 2.4.5 5.6 0 8.8-5.3 8.6-10.6C19.9 6.8 18.4 4.4 19 4Zm-6.4 14.2c-2.4 0-4-1.8-4-4.2 0-4 3.4-6.7 7.1-6.9 2.2.4 3 1.6 3.1 3.1.2 3.8-2.2 8-6.2 8Z" />
      </svg>
    );
  }
  if (name === "file") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden>
        <path d="M6.2 3.2h7.2L18.8 8.6V20.8H6.2V3.2Zm7.4 1.8v4h4l-4-4ZM8.4 12h7.2v1.6H8.4V12Zm0 3.2h7.2V17H8.4v-1.8Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden>
      <path d="M5.2 4.2h13.6v15.6H5.2V4.2Zm2 2.2v2.4h9.6V6.4H7.2Zm0 4.2v1.6h9.6V10.6H7.2Zm0 3.2v1.6h6.2v-1.6H7.2Z" />
    </svg>
  );
}

function FeatureIcon({ name }: { name: (typeof FEATURES)[number]["icon"] }) {
  const common = "h-7 w-7";
  if (name === "target") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill={MARK_GREEN} aria-hidden>
        <path d="M12 3.2A8.8 8.8 0 1 0 20.8 12 8.8 8.8 0 0 0 12 3.2Zm0 2.2A6.6 6.6 0 1 1 5.4 12 6.6 6.6 0 0 1 12 5.4Zm0 2.4A4.2 4.2 0 1 0 16.2 12 4.2 4.2 0 0 0 12 7.8Zm-.2 1.7 4.6-1.2-1.2 4.6-3.4-3.4Z" />
      </svg>
    );
  }
  if (name === "coins") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill={MARK_GREEN} aria-hidden>
        <path d="M7 8.2c3.3 0 6 .9 6 2.1s-2.7 2.1-6 2.1-6-.9-6-2.1 2.7-2.1 6-2.1Zm0 5.4c3.3 0 6 .9 6 2.1s-2.7 2.1-6 2.1-6-.9-6-2.1 2.7-2.1 6-2.1Zm10.2-2.6c3 0 5.4.8 5.4 1.9s-2.4 1.9-5.4 1.9-5.4-.8-5.4-1.9 2.4-1.9 5.4-1.9Zm0 4.6c3 0 5.4.8 5.4 1.9s-2.4 1.9-5.4 1.9-5.4-.8-5.4-1.9 2.4-1.9 5.4-1.9Z" />
      </svg>
    );
  }
  if (name === "leaf") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill={MARK_GREEN} aria-hidden>
        <path d="M17.2 4.2C12.4 4.5 7 8.2 7 14.2c0 2 .6 3.7 1.7 5L5 21.8l.9 1.3 4.6-3.1c.8.4 1.7.6 2.7.6 6 0 9.4-5.8 9.2-11.4-.1-2.4-1.6-4.7-5.2-5ZM12.8 18.4c-2.6 0-4.3-2-4.3-4.6 0-4.4 3.8-7.4 7.8-7.6 2.4.4 3.3 1.8 3.4 3.4.2 4.2-2.4 8.8-6.9 8.8Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={common} fill={MARK_GREEN} aria-hidden>
      <path d="M4.2 18.8h2.4V12H4.2v6.8Zm4.4 0h2.4V8.2H8.6v10.6Zm4.4 0h2.4V5.2h-2.4v13.6Zm4.4 0h2.4V9.6h-2.4v9.2Z" />
    </svg>
  );
}

export default function HomeTopBanner({
  children,
}: {
  children?: ReactNode;
}) {
  return (
    <header className="relative isolate border-b-2 border-emerald-400/20 text-black">
      <div
        className="h-0.5 w-full"
        style={{ backgroundColor: MARK_GREEN }}
        aria-hidden
      />
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-5 py-4 md:px-10 xl:flex-row xl:items-center xl:justify-between xl:gap-6 xl:py-3">
        <div className="flex min-w-0 flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
          <Image
            src="/images/home/s4p-lockup.png"
            alt="S4P SCORE-FOR-PLANET"
            width={1087}
            height={458}
            className="h-[4.25rem] w-auto shrink-0 sm:h-[4.75rem]"
            unoptimized
            priority
          />
          <div className="hidden h-14 w-px shrink-0 border-l border-emerald-400/40 sm:block" />
          <div className="min-w-0">
            <p className="text-base font-black uppercase leading-tight tracking-tight sm:text-lg xl:text-xl">
              Sport unites people.{" "}
              <span className="whitespace-nowrap" style={{ color: MARK_GREEN }}>
                Together we drive change.
              </span>
            </p>
            <p className="mt-1.5 text-sm font-semibold leading-6 sm:text-base">
              One Platform. Five Major Sports. Real Climate Action. A Cleaner,
              Greener Future.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-start gap-x-4 gap-y-3 xl:shrink-0 xl:justify-end">
          <nav aria-label="Homepage" className="flex flex-wrap items-end gap-3 sm:gap-4">
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex w-[4.4rem] flex-col items-center text-center text-[0.7rem] font-bold leading-tight hover:text-s4p-mint sm:w-[4.7rem] sm:text-xs"
              >
                <span style={{ color: MARK_GREEN }}>
                  <NavIcon name={item.icon} />
                </span>
                <span className="mt-1">{item.label}</span>
              </Link>
            ))}
          </nav>
          {children}
        </div>
      </div>

      <div className="mx-auto grid max-w-[1600px] items-center gap-6 px-5 pb-6 pt-2 md:px-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-4 lg:pb-4">
        <div className="min-w-0">
          <h1 className="text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-5xl xl:text-[3.35rem]">
            A global sports
            <br />
            platform turning
            <br />
            <span style={{ color: MARK_GREEN }}>passion into progress.</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm font-semibold leading-6 sm:text-base">
            We help elite sports clubs, their fans, sponsors and partners
            tackle match-day emissions and fund real climate projects.
          </p>
          <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 xl:grid-cols-4">
            {FEATURES.map((item) => (
              <li key={item.label} className="flex items-center gap-2.5">
                <FeatureIcon name={item.icon} />
                <span className="text-sm font-bold leading-tight">
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative min-w-0">
          <Image
            src="/images/home/global-sports-cluster.png"
            alt="Football, rugby, NFL, basketball and cricket athletes looking toward Earth. Five major sports. A cleaner, greener planet."
            width={912}
            height={364}
            className="h-auto w-full select-none"
            unoptimized
            priority
          />
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 h-[52%] w-[4.25rem]"
            style={{
              backgroundImage:
                "linear-gradient(90deg, #f7f4e8 0%, #f7f4e8 35%, transparent 100%)",
            }}
          />
        </div>
      </div>
    </header>
  );
}
