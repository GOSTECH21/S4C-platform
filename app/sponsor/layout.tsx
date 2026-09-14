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
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href={HOME_PATH} className="text-2xl font-black text-green-400">
            S4P
          </Link>
          <nav className="flex items-center gap-6 text-sm font-semibold text-slate-300">
            <SponsorNav />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
    </div>
  );
}
