import Link from "next/link";
import DesignThemePicker from "@/app/components/design/DesignThemePicker";

export default function DesignPreviewPage() {
  return (
    <main className="min-h-screen px-6 py-16 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-s4p-mint">
          Design trials
        </p>
        <h1 className="mt-3 text-4xl font-black text-s4p-ivory">Try a new look</h1>
        <p className="mt-4 max-w-3xl text-lg leading-7 text-slate-300">
          Quiet wave is saved as the restore point — the design the platform is using now.
          Trials live only in this browser. Restore puts Quiet wave back on every page.
        </p>
        <p className="mt-3 text-sm text-slate-400">
          <Link href="/" className="text-s4p-mint underline-offset-2 hover:underline">
            Home
          </Link>
          {" · "}
          After you pick a look, walk the rest of the site. A restore bar stays at the bottom
          until you switch back.
        </p>
        <div className="mt-10">
          <DesignThemePicker />
        </div>
      </div>
    </main>
  );
}
