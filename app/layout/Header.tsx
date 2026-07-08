export default function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950 px-6 text-white">
      <div>
        <p className="text-sm text-slate-400">Welcome back</p>
        <h2 className="font-semibold">Godwin</h2>
      </div>

      <div className="flex items-center gap-4">
        <button className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300">
          Notifications
        </button>

        <div className="rounded-full bg-green-500 px-3 py-2 text-sm font-bold text-slate-950">
          GO
        </div>
      </div>
    </header>
  );
}