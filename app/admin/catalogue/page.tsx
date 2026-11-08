"use client";

import Link from "next/link";
import AppLayout from "../../layout/AppLayout";

const GROUPS = [
  {
    title: "Sporting calendar",
    links: [
      { label: "Sports", href: "/admin/sports" },
      { label: "Competitions", href: "/admin/competitions" },
      { label: "Clubs", href: "/admin/clubs" },
      { label: "Fixtures", href: "/admin/fixtures" },
    ],
  },
  {
    title: "Climate tools",
    links: [
      { label: "Impact Opportunities", href: "/admin/impact-opportunities" },
      { label: "Climate Assets", href: "/admin/climate-assets" },
      { label: "Matchrav", href: "/admin/matchrav" },
      { label: "Match Centre", href: "/admin/match-centre" },
    ],
  },
  {
    title: "Credits",
    links: [
      { label: "Sponsor Credits", href: "/admin/sponsor-credits" },
      { label: "My Climate Credits", href: "/admin/my-climate-credits" },
      { label: "Supporter Portfolio", href: "/admin/supporter-portfolio" },
      { label: "Notifications", href: "/admin/notifications" },
    ],
  },
];

export default function AdminCataloguePage() {
  return (
    <AppLayout>
      <div className="min-w-0 space-y-6 overflow-x-hidden sm:space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-green-400 sm:text-sm sm:tracking-[0.3em]">
            S4P Admin Backend
          </p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">Catalogue</h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Reference lists used by the platform. Participant records live on
            Backend.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {GROUPS.map((group) => (
            <section
              key={group.title}
              className="rounded-3xl border border-slate-700 bg-slate-900 p-6"
            >
              <h2 className="text-xl font-black">{group.title}</h2>
              <ul className="mt-4 space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block rounded-xl px-3 py-2 text-slate-200 hover:bg-slate-800"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
