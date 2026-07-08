import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-black text-green-400">
          S4C
        </Link>

        <nav className="hidden gap-8 text-sm font-medium md:flex">
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/clubs">Clubs</Link>
          <Link href="/sponsors">Sponsors</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/contact">Contact</Link>
        </nav>

        <div className="flex gap-3">
          <Link
            href="/login"
            className="rounded-lg border border-slate-600 px-4 py-2 text-white hover:bg-slate-800"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="rounded-lg bg-green-400 px-4 py-2 font-semibold text-slate-950 hover:bg-green-300"
          >
            Register
          </Link>
        </div>
      </div>
    </header>
  );
}