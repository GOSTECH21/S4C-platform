import Link from "next/link";
import { S4PLockup } from "@/app/components/S4PLockup";
import {
  ADMIN_CATALOGUE_PATH,
  ADMIN_PATH,
  HOME_PATH,
} from "@/app/lib/routes";

const navItems = [
  { label: "Backend", href: ADMIN_PATH },
  { label: "Catalogue", href: ADMIN_CATALOGUE_PATH },
];

export default function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-56 border-r border-emerald-400/20 bg-slate-900/80 p-6 text-white backdrop-blur md:block">
      <div className="mb-4 md:mb-10">
        <Link href={HOME_PATH} aria-label="S4P SCORE-FOR-PLANET">
          <S4PLockup className="h-12 w-auto max-w-[11rem] object-contain object-left" />
        </Link>
        <p className="mt-2 text-sm text-slate-400">Score-For-Planet</p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
