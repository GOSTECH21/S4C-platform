"use client";

export default function Header() {
  return (
    <header className="hidden h-16 items-center justify-between border-b border-slate-800 bg-slate-950 px-6 text-white md:flex">
      <div>
        <p className="text-sm text-slate-400">Welcome back</p>
        <h2 className="font-semibold">S4P staff</h2>
      </div>
    </header>
  );
}
