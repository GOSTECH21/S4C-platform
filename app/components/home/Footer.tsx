import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950">

      <div className="mx-auto max-w-7xl px-6 py-20">

        <div className="grid gap-12 md:grid-cols-4">

          {/* Logo */}

          <div>

            <h2 className="text-2xl font-black text-green-400">
              S4P
            </h2>

            <p className="mt-4 leading-7 text-slate-400">

              Score-For-Our-Planet transforms every sporting moment into
              meaningful climate action.

            </p>

          </div>

          {/* Platform */}

          <div>

            <h3 className="font-bold text-white">
              Platform
            </h3>

            <div className="mt-5 space-y-3">

              <Link href="/" className="block text-slate-400 hover:text-white">
                Home
              </Link>

              <Link href="/club/register" className="block text-slate-400 hover:text-white">
                Sports Clubs
              </Link>

              <Link href="/supporter/register" className="block text-slate-400 hover:text-white">
                Fans
              </Link>

              <Link href="/sponsor/register" className="block text-slate-400 hover:text-white">
                Climate Sponsors
              </Link>

              <Link href="/partner/register" className="block text-slate-400 hover:text-white">
                Climate Partners
              </Link>

            </div>

          </div>

          {/* Solutions */}

          <div>

            <h3 className="font-bold text-white">
              Solutions
            </h3>

            <div className="mt-5 space-y-3">

              <p className="text-slate-400">
                Climate Sponsorship
              </p>

              <p className="text-slate-400">
                Climate Credits
              </p>

              <p className="text-slate-400">
                Climate Impact League
              </p>

              <p className="text-slate-400">
                Global Schools Solar
              </p>

            </div>

          </div>

          {/* Contact */}

          <div>

            <h3 className="font-bold text-white">
              Score-For-Our-Planet
            </h3>

            <div className="mt-5 space-y-3 text-slate-400">

              <p>
                Connecting Sport with Climate Action.
              </p>

              <p>
                Built for Clubs, Fans, Sponsors and Climate Partners.
              </p>

            </div>

          </div>

        </div>

        <div className="mt-16 border-t border-slate-800 pt-8 text-center text-sm text-slate-500">

          © {new Date().getFullYear()} Score-For-Our-Planet (S4P). All Rights Reserved.

        </div>

      </div>

    </footer>
  );
}