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

function BannerIcon({
  name,
}: {
  name: (typeof BANNER_ICONS)[number]["icon"];
}) {
  const common = "h-7 w-7 text-[#f4f7fb]";
  if (name === "stadium") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden>
        <path d="M8 10a2.2 2.2 0 1 0 0-4.4A2.2 2.2 0 0 0 8 10Zm8 0a2.2 2.2 0 1 0 0-4.4A2.2 2.2 0 0 0 16 10ZM3.2 18.5c.4-2.6 2.4-4.2 4.8-4.2s4.4 1.6 4.8 4.2H3.2Zm8.2 0c.3-1.8 1.2-3.3 2.7-4.1.9.6 2 1 3.1 1 2.4 0 4.4-1.6 4.8-4.2h-3.8c-.3 1.2-1.2 2.2-2.5 2.5-1 .3-2-.1-2.7-.7-.4.6-.7 1.3-1 2.1h-.6Z" />
      </svg>
    );
  }
  if (name === "remote") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden>
        <path d="M4 5h16a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 20 17H4a1.5 1.5 0 0 1-1.5-1.5v-9A1.5 1.5 0 0 1 4 5Zm6.5 14h3l1.2 2H9.3L10.5 19Z" />
      </svg>
    );
  }
  if (name === "leaf") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden>
        <path d="M17.2 4.2C12.4 4.5 7 8.2 7 14.2c0 2 .6 3.7 1.7 5L5 21.8l.9 1.3 4.6-3.1c.8.4 1.7.6 2.7.6 6 0 9.4-5.8 9.2-11.4-.1-2.4-1.6-4.7-5.2-5ZM12.8 18.4c-2.6 0-4.3-2-4.3-4.6 0-4.4 3.8-7.4 7.8-7.6 2.4.4 3.3 1.8 3.4 3.4.2 4.2-2.4 8.8-6.9 8.8Z" />
      </svg>
    );
  }
  if (name === "hands") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden>
        <path d="M8.2 11.4 6 9.2a1.5 1.5 0 0 0-2.1 2.1l3.4 3.4c.9.9 2.1 1.4 3.4 1.4h2.6l5.4 3.2 1.1-1.8-5.1-3.1V9.8a1.4 1.4 0 1 0-2.8 0v3.2H10.7c-.5 0-1-.2-1.4-.6l-1.1-1Zm7.5-6.2c-1 0-1.9.4-2.5 1.1l-.4.5.9.8.4-.4a1.6 1.6 0 1 1 2.6 1.8l-1.2 1.4 1.1.9 1.2-1.4A3.2 3.2 0 0 0 15.7 5.2Z" />
      </svg>
    );
  }
  if (name === "direct") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden>
        <path d="M8 9.5a2.3 2.3 0 1 0 0-4.6A2.3 2.3 0 0 0 8 9.5Zm8.2 0a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6ZM3.4 19c.4-2.8 2.6-4.6 5.1-4.6.9 0 1.7.2 2.4.6L8.6 17.3h2.4l2.1-2.4c.4.7.7 1.5.8 2.4l.1 1.7H3.4Zm10.4 0 .1-1.6c.1-1.4.7-2.6 1.6-3.5 1 .6 2.2 1 3.4 1 2.4 0 4.4-1.6 4.8-4.2h-3.6c-.3 1.2-1.2 2.1-2.4 2.4-.8.2-1.5 0-2.1-.4-.2.7-.3 1.4-.3 2.1L14 19h-.2Z" />
      </svg>
    );
  }
  if (name === "clubs") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden>
        <path d="M12 3.2 13.7 8h4.8l-3.9 3 1.5 4.8L12 13.7 7.9 15.8 9.4 11 5.5 8h4.8L12 3.2Zm-6.5 14.2h13v1.7h-13v-1.7Zm1.4 2.8h10.2V22H6.9v-1.8Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden>
      <path d="M12 3a9 9 0 1 0 0 18A9 9 0 0 0 12 3Zm0 1.7c.5 0 1.6 1.3 2.2 3.6H9.8C10.4 6 11.5 4.7 12 4.7ZM8.2 10h7.6A12.6 12.6 0 0 1 12 17.6 12.6 12.6 0 0 1 8.2 10ZM6.6 8.3h2C8 6.8 7.3 5.6 6.6 5.1 5.7 6 5.1 7.1 4.8 8.3h1.8Zm10.6 0h1.8c-.3-1.2-.9-2.3-1.8-3.2-.7.5-1.4 1.7-1.8 3.2h1.8ZM5 11.8h1.5a14.4 14.4 0 0 0 2.2 5.7A7.2 7.2 0 0 1 5 11.8Zm12.3 5.7a14.4 14.4 0 0 0 2.2-5.7H21a7.2 7.2 0 0 1-3.7 5.7Z" />
    </svg>
  );
}

function BannerCopy() {
  return (
    <>
      <div className="flex items-center gap-4">
        <div className="shrink-0 text-center leading-none">
          <p className="text-4xl font-black tracking-tight text-[#f4f7fb] sm:text-5xl">
            S<span className="text-s4p-mark">4</span>P
          </p>
          <p className="mt-1 text-[0.62rem] font-bold tracking-[0.18em] text-[#f4f7fb]">
            SCORE-FOR-PLANET
          </p>
        </div>
        <div className="hidden h-14 w-px bg-[#f4f7fb]/40 sm:block" />
        <div className="min-w-0">
          <h1 className="text-xl font-black uppercase leading-tight tracking-tight text-[#f4f7fb] sm:text-2xl lg:text-[1.7rem]">
            Every score counts.{" "}
            <span className="text-s4p-mark">Every fan counts.</span>
          </h1>
          <p className="mt-1 text-xs font-medium text-[#d5dde6] sm:text-sm">
            One Club. One Match. Two Climate Missions. Four Sponsor Channels.
            Five Climate Projects. A Cleaner, Greener Future.
          </p>
        </div>
      </div>
      <ul className="grid grid-cols-4 gap-3 sm:grid-cols-7 lg:flex lg:shrink-0 lg:gap-4">
        {BANNER_ICONS.map((item) => (
          <li
            key={item.label}
            className="flex min-w-[4.5rem] flex-col items-center text-center"
          >
            <BannerIcon name={item.icon} />
            <span className="mt-1 max-w-[5.5rem] text-[0.65rem] font-semibold leading-tight text-[#f4f7fb]">
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

export default function HomeTopBanner() {
  return (
    <header className="relative isolate overflow-hidden bg-black">
      <Image
        src="/images/home/every-score-counts-banner.png"
        alt="S4P SCORE-FOR-PLANET. Every score counts. Every fan counts. One Club. One Match. Two Climate Missions. Four Sponsor Channels. Five Climate Projects. A Cleaner, Greener Future."
        width={1536}
        height={102}
        className="hidden h-auto w-full min-[1200px]:block"
        unoptimized
        priority
      />
      <div
        className="relative min-[1200px]:hidden"
        style={{
          backgroundImage: "url(/images/home/every-score-counts-banner.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6">
          <BannerCopy />
        </div>
      </div>
    </header>
  );
}
