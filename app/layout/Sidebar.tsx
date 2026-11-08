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
    <aside className="w-full border-b border-emerald-400/20 bg-slate-900/80 p-4 text-white backdrop-blur md:min-h-screen md:w-56 md:border-b-0 md:border-r md:p-6">
      <div className="mb-4 md:mb-10">
        <Link href={HOME_PATH} aria-label="S4P SCORE-FOR-PLANET">
          <S4PLockup className="h-12 w-auto max-w-[11rem] object-contain object-left" />
        </Link>
        <p className="mt-2 text-sm text-slate-400">Score-For-Planet</p>
      </div>

      <nav className="flex flex-wrap gap-2 md:block md:space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white md:block"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
