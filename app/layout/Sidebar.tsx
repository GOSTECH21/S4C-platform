import Link from "next/link";
import { S4PLockup } from "@/app/components/S4PLockup";
import { HOME_PATH } from "@/app/lib/routes";

const navItems = [
  { label: "Registered participants", href: "/admin" },
  { label: "Sports", href: "/admin/sports" },
  { label: "Competitions", href: "/admin/competitions" },
  { label: "Clubs", href: "/admin/clubs" },
  { label: "Fixtures", href: "/admin/fixtures" },
  { label: "Matchrav", href: "/admin/matchrav" },
  { label: "Impact Opportunities", href: "/admin/impact-opportunities" },
  { label: "Climate Assets", href: "/admin/climate-assets" },
  { label: "Carbon Impact League Table", href: "/carbon-impact-league-table" },
  { label: "Sponsors", href: "/admin/sponsors" },
  { label: "Sponsor Campaigns", href: "/admin/sponsor-campaigns" },
  { label: "Match Centre", href: "/admin/match-centre" },
  { label: "Sponsor Credits", href: "/admin/sponsor-credits" },
  { label: "Notifications", href: "/admin/notifications" },
  
  {
    label: "My Climate Credits",
    href: "/admin/my-climate-credits",
},
  
{ label: "Supporter Portfolio", href: "/admin/supporter-portfolio" },
{ label: "Supporters", href: "/admin/supporters" },
{ label: "Settings", href: "/settings" },
];

export default function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-72 border-r border-emerald-400/20 bg-slate-900/80 p-6 text-white backdrop-blur md:block">
      <div className="mb-10">
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