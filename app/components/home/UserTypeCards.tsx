"use client";

import Link from "next/link";

const users = [
  {
    title: "Fans",
    icon: "⚽",
    description:
      "Support your favourite club, earn Climate Credits and fund verified climate projects.",
    button: "Join as a Fan",
    href: "/register",
  },
  {
    title: "Football Clubs",
    icon: "🏟️",
    description:
      "Turn every sporting moment into measurable climate action for your supporters.",
    button: "Register Your Club",
    href: "/club/register",
  },
  {
    title: "Sponsors",
    icon: "🤝",
    description:
      "Sponsor sporting moments and create measurable environmental impact.",
    button: "Become a Sponsor",
    href: "/sponsor/register",
  },
  {
    title: "Climate Projects",
    icon: "🌱",
    description:
      "Register your organisation and receive Climate Credits from supporters.",
    button: "Register Climate Project",
    href: "/projects/register",
  },
];

export default function UserTypeCards() {
  return (
    <section className="mt-24">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-white">
          Who Uses S4P?
        </h2>

        <p className="mt-4 text-slate-400 max-w-3xl mx-auto">
          Score-4-Our-Planet connects supporters, clubs, sponsors and
          verified climate projects into one ecosystem where every sporting
          moment creates measurable environmental impact.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">

        {users.map((user) => (

          <div
            key={user.title}
            className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl transition hover:-translate-y-2 hover:border-green-500"
          >

            <div className="text-5xl">
              {user.icon}
            </div>

            <h3 className="mt-6 text-2xl font-bold text-white">
              {user.title}
            </h3>

            <p className="mt-4 text-slate-400 leading-7">
              {user.description}
            </p>

            <Link
              href={user.href}
              className="mt-8 block rounded-xl bg-green-500 py-3 text-center font-bold text-black transition hover:bg-green-400"
            >
              {user.button}
            </Link>

          </div>

        ))}

      </div>
    </section>
  );
}