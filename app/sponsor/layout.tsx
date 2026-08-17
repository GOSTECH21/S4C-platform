import Link from "next/link";
import { ReactNode } from "react";

export default function SponsorLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            href="/sponsor"
            className="text-2xl font-bold text-green-700"
          >
            Score-For-Our-Planet
          </Link>

          <nav className="flex gap-6">
            <Link href="/sponsor">Home</Link>
            <Link href="/sponsor/register">Become a Sponsor</Link>
            <Link href="/sponsor/login">Sign In</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {children}
      </main>

      <footer className="border-t bg-white py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Score-For-Our-Planet (S4P)
      </footer>
    </div>
  );
}