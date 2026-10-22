import type { ReactNode } from "react";
import Image from "next/image";

const BANNER_ICONS: Array<{
  label: string;
  icon: "stadium" | "remote" | "leaf" | "hands" | "direct" | "clubs" | "globe";
}> = [
  { label: "Fans at the stadium", icon: "stadium" },
  { label: "Fans watching remotely", icon: "remote" },
  { label: "Real climate action", icon: "leaf" },
  { label: "Sponsors fund it", icon: "hands" },
  { label: "Fans direct it", icon: "direct" },
  { label: "Clubs make it happen", icon: "clubs" },
  { label: "A cleaner planet", icon: "globe" },
];

const MARK_GREEN = "#5bc662";

function BannerIcon({
  name,
}: {
  name: (typeof BANNER_ICONS)[number]["icon"];
}) {
  const common = "h-8 w-8";
  if (name === "stadium") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill={MARK_GREEN} aria-hidden>
        <path d="M8 10a2.2 2.2 0 1 0 0-4.4A2.2 2.2 0 0 0 8 10Zm8 0a2.2 2.2 0 1 0 0-4.4A2.2 2.2 0 0 0 16 10ZM3.2 18.5c.4-2.6 2.4-4.2 4.8-4.2s4.4 1.6 4.8 4.2H3.2Zm8.2 0c.3-1.8 1.2-3.3 2.7-4.1.9.6 2 1 3.1 1 2.4 0 4.4-1.6 4.8-4.2h-3.8c-.3 1.2-1.2 2.2-2.5 2.5-1 .3-2-.1-2.7-.7-.4.6-.7 1.3-1 2.1h-.6Z" />
      </svg>
    );
  }
  if (name === "remote") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill={MARK_GREEN} aria-hidden>
        <path d="M4 5h16a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 20 17H4a1.5 1.5 0 0 1-1.5-1.5v-9A1.5 1.5 0 0 1 4 5Zm6.5 14h3l1.2 2H9.3L10.5 19Z" />
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
  if (name === "hands") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill={MARK_GREEN} aria-hidden>
        <path d="M8.2 11.4 6 9.2a1.5 1.5 0 0 0-2.1 2.1l3.4 3.4c.9.9 2.1 1.4 3.4 1.4h2.6l5.4 3.2 1.1-1.8-5.1-3.1V9.8a1.4 1.4 0 1 0-2.8 0v3.2H10.7c-.5 0-1-.2-1.4-.6l-1.1-1Zm7.5-6.2c-1 0-1.9.4-2.5 1.1l-.4.5.9.8.4-.4a1.6 1.6 0 1 1 2.6 1.8l-1.2 1.4 1.1.9 1.2-1.4A3.2 3.2 0 0 0 15.7 5.2Z" />
      </svg>
    );
  }
  if (name === "direct") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill={MARK_GREEN} aria-hidden>
        <path d="M8 9.5a2.3 2.3 0 1 0 0-4.6A2.3 2.3 0 0 0 8 9.5Zm8.2 0a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6ZM3.4 19c.4-2.8 2.6-4.6 5.1-4.6.9 0 1.7.2 2.4.6L8.6 17.3h2.4l2.1-2.4c.4.7.7 1.5.8 2.4l.1 1.7H3.4Zm10.4 0 .1-1.6c.1-1.4.7-2.6 1.6-3.5 1 .6 2.2 1 3.4 1 2.4 0 4.4-1.6 4.8-4.2h-3.6c-.3 1.2-1.2 2.1-2.4 2.4-.8.2-1.5 0-2.1-.4-.2.7-.3 1.4-.3 2.1L14 19h-.2Z" />
      </svg>
    );
  }
  if (name === "clubs") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill={MARK_GREEN} aria-hidden>
        <path d="M12 3.2 13.7 8h4.8l-3.9 3 1.5 4.8L12 13.7 7.9 15.8 9.4 11 5.5 8h4.8L12 3.2Zm-6.5 14.2h13v1.7h-13v-1.7Zm1.4 2.8h10.2V22H6.9v-1.8Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={common} fill={MARK_GREEN} aria-hidden>
      <path d="M12 3a9 9 0 1 0 0 18A9 9 0 0 0 12 3Zm0 1.7c.5 0 1.6 1.3 2.2 3.6H9.8C10.4 6 11.5 4.7 12 4.7ZM8.2 10h7.6A12.6 12.6 0 0 1 12 17.6 12.6 12.6 0 0 1 8.2 10ZM6.6 8.3h2C8 6.8 7.3 5.6 6.6 5.1 5.7 6 5.1 7.1 4.8 8.3h1.8Zm10.6 0h1.8c-.3-1.2-.9-2.3-1.8-3.2-.7.5-1.4 1.7-1.8 3.2h1.8ZM5 11.8h1.5a14.4 14.4 0 0 0 2.2 5.7A7.2 7.2 0 0 1 5 11.8Zm12.3 5.7a14.4 14.4 0 0 0 2.2-5.7H21a7.2 7.2 0 0 1-3.7 5.7Z" />
    </svg>
  );
}

export default function HomeTopBanner({
  children,
}: {
  children?: ReactNode;
}) {
  return (
    <header className="relative isolate border-b border-emerald-400/20">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-5 px-5 py-5 md:px-10 xl:flex-row xl:items-center xl:justify-between xl:gap-6 xl:py-3">
        <div className="flex min-w-0 flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
          <Image
            src="/images/home/s4p-lockup.png"
            alt="S4P SCORE-FOR-PLANET"
            width={1087}
            height={458}
            className="h-[4.75rem] w-auto shrink-0 sm:h-20"
            unoptimized
            priority
          />
          <div className="hidden h-16 w-px shrink-0 border-l border-emerald-400/40 sm:block" />
          <div className="min-w-0">
            <h1 className="text-2xl font-black uppercase leading-tight tracking-tight sm:text-3xl xl:text-[1.7rem]">
              Every score counts.{" "}
              <span style={{ color: MARK_GREEN }}>Every fan counts.</span>
            </h1>
            <p className="mt-2 text-sm font-semibold leading-6 sm:text-base">
              One Club. One Match. Two Climate Missions. Four Sponsor Channels.
              Five Climate Projects. A Cleaner, Greener Future.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-start gap-x-4 gap-y-3 xl:shrink-0 xl:justify-end">
          <ul className="grid grid-cols-4 gap-3 sm:grid-cols-7 xl:flex xl:gap-3">
            {BANNER_ICONS.map((item) => (
              <li
                key={item.label}
                className="flex w-[4.25rem] flex-col items-center text-center"
              >
                <BannerIcon name={item.icon} />
                <span className="mt-1.5 text-[0.7rem] font-bold leading-tight xl:text-xs">
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
          {children}
        </div>
      </div>
    </header>
  );
}
