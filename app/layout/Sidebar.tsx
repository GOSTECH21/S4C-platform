import Link from "next/link";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Sports", href: "/admin/sports" },
  { label: "Competitions", href: "/admin/competitions" },
  { label: "Clubs", href: "/admin/clubs" },
  { label: "Fixtures", href: "/admin/fixtures" },
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
    <aside className="hidden min-h-screen w-72 border-r border-slate-800 bg-slate-950 p-6 text-white md:block">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-green-400">S4P</h1>
        <p className="text-sm text-slate-400">Score for Climate</p>
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