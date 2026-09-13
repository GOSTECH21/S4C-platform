import FanNav from "../components/FanNav";

export default function MyS4PLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 pt-6">
        <FanNav />
      </div>
      {children}
    </div>
  );
}
