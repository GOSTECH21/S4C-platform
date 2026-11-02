"use client";
/* s4p-logo-back-home-v1 */

import { usePathname } from "next/navigation";
import { S4P_LOGO_BACK_HOME, S4PBrandRow } from "@/app/components/S4PLockup";

export function GlobalSiteBar() {
  const pathname = usePathname();
  if (!pathname || pathname === "/") return null;

  return (
    <header
      data-s4p-logo-back-home={S4P_LOGO_BACK_HOME}
      className="sticky top-0 z-50 border-b border-emerald-400/20 bg-[var(--s4p-canvas)] text-slate-950"
    >
      <div className="mx-auto flex h-[4.75rem] max-w-7xl items-center px-4 sm:h-[5.25rem] sm:px-6">
        <div className="w-full">
          <S4PBrandRow markTestId="s4p-lockup" />
        </div>
      </div>
    </header>
  );
}
