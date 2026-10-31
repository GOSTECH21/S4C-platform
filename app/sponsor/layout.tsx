import Link from "next/link";
import { ReactNode } from "react";
import { HOME_PATH } from "@/app/lib/routes";
import { SponsorNav } from "./sponsor-nav";

export default function SponsorLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen text-white">
      <header className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto flex max-w-7xl min-w-0 flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link href={HOME_PATH} className="text-2xl font-black text-green-400">
            S4P
          </Link>
          <nav className="flex min-w-0 max-w-full flex-wrap items-center justify-end gap-2 overflow-x-auto text-sm font-semibold text-slate-300">
            <SponsorNav />
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full min-w-0 max-w-7xl px-4 py-6 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
