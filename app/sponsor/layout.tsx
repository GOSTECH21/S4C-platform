import { ReactNode } from "react";
import { S4P_SPONSOR_MARK } from "@/app/lib/s4p-tabs";
import { SponsorNav } from "./sponsor-nav";

export default function SponsorLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen text-white">
      <header
        data-sponsor-tabs-visible="sponsor-tabs-visible-v1"
        data-s4p-logo-back-home="s4p-logo-back-home-v1"
        className="border-b border-slate-800 bg-slate-950"
      >
        <div className="mx-auto flex max-w-7xl min-w-0 flex-col gap-3 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-6">
          <p className="sr-only" data-testid="s4p-sponsor-mark">
            {S4P_SPONSOR_MARK}
          </p>
          <nav className="w-full min-w-0 overflow-x-hidden text-sm font-semibold text-slate-300 sm:w-auto sm:max-w-full">
            <SponsorNav />
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full min-w-0 max-w-7xl px-4 py-6 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
