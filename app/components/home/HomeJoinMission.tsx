"use client";

const MARK_GREEN = "#5bc662";

const POINTS: Array<{
  title: string;
  detail: string;
  icon: "check" | "calendar" | "leaf" | "fans";
}> = [
  {
    title: "Free to join",
    detail: "No ticket required",
    icon: "check",
  },
  {
    title: "Follow your team",
    detail: "Matches and climate missions",
    icon: "calendar",
  },
  {
    title: "Direct climate funding",
    detail: "Unlock sponsor-funded allocations",
    icon: "leaf",
  },
  {
    title: "Every fan counts",
    detail: "At the stadium or remotely",
    icon: "fans",
  },
];

function PointIcon({ name }: { name: (typeof POINTS)[number]["icon"] }) {
  const common = "mt-0.5 h-6 w-6 shrink-0";
  if (name === "check") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill={MARK_GREEN} aria-hidden>
        <path d="M12 2.2A9.8 9.8 0 1 0 21.8 12 9.8 9.8 0 0 0 12 2.2Zm-1.2 13.4-3.3-3.3 1.4-1.4 1.9 1.9 4.5-4.5 1.4 1.4-5.9 5.9Z" />
      </svg>
    );
  }
  if (name === "calendar") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill={MARK_GREEN} aria-hidden>
        <path d="M7 3.2h1.8v1.4h6.4V3.2H17v1.4h2.2A1.8 1.8 0 0 1 21 6.4v12.4a1.8 1.8 0 0 1-1.8 1.8H4.8A1.8 1.8 0 0 1 3 18.8V6.4a1.8 1.8 0 0 1 1.8-1.8H7V3.2ZM4.8 9.2v9.6h14.4V9.2H4.8Zm3.2 2.2h2.4V14H8v-2.6Zm3.8 0h2.4V14h-2.4v-2.6Zm3.8 0h2.4V14h-2.4v-2.6Z" />
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
      <path d="M8.2 9.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Zm7.6 0a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8ZM3.6 19c.4-2.8 2.6-4.7 5.1-4.7 1 0 1.9.3 2.7.8-.4.7-.7 1.5-.8 2.4l-.2 1.5H3.6Zm9.2 0 .2-1.6c.2-1.6 1-3 2.2-3.9 1 .5 2.1.8 3.3.8 2.5 0 4.6-1.7 5.1-4.5h-3.8c-.3 1.2-1.3 2.1-2.5 2.4-1 .2-1.9-.1-2.5-.7-.4.7-.6 1.5-.7 2.3L13 19h-.2Z" />
    </svg>
  );
}

export default function HomeJoinMission({
  onRegister,
  onLogin,
}: {
  onRegister: () => void;
  onLogin: () => void;
}) {
  return (
    <section
      id="join-s4p-community"
      aria-labelledby="join-s4p-community-heading"
      className="scroll-mt-24 px-5 pb-2 pt-4 md:px-10"
    >
      <div className="s4p-navy-panel mx-auto max-w-[1100px] rounded-[1.75rem] border border-emerald-400/30 px-6 py-8 shadow-sm sm:px-10 sm:py-9">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-s4p-mint">
          Join the S<span style={{ color: MARK_GREEN }}>4</span>P community
        </p>
        <h2
          id="join-s4p-community-heading"
          className="mt-3 text-3xl font-black uppercase leading-tight tracking-tight sm:text-4xl"
        >
          Join your team&apos;s climate mission today.
        </h2>
        <p className="mt-4 max-w-3xl text-base font-semibold leading-7 sm:text-lg sm:leading-8">
          Be part of a global community of supporters helping their clubs tackle
          match-day emissions. Join for free, follow your team&apos;s matches and
          direct sponsor-funded contributions to climate projects.
        </p>
        <ul className="mt-7 grid gap-5 sm:grid-cols-2 sm:gap-x-10">
          {POINTS.map((point) => (
            <li key={point.title} className="flex items-start gap-3">
              <PointIcon name={point.icon} />
              <div>
                <p className="font-black leading-tight">{point.title}</p>
                <p className="mt-1 text-sm font-semibold leading-6">
                  {point.detail}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onRegister}
          className="mt-8 flex w-full items-center justify-center rounded-full bg-s4p-mark px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-black hover:brightness-110 sm:text-base"
        >
          Register free <span aria-hidden> →</span>
        </button>
        <p className="mt-4 text-center text-sm font-semibold">
          Already a member?{" "}
          <button
            type="button"
            onClick={onLogin}
            className="font-black underline decoration-s4p-mint underline-offset-4 hover:text-s4p-mint"
          >
            Log in to your S4P account
          </button>
          .
        </p>
      </div>
    </section>
  );
}
