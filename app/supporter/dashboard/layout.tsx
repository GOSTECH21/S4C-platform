import FanNav from "@/app/dashboard/supporter/components/FanNav";

export default function SupporterDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto w-full min-w-0 max-w-6xl px-4 pt-6 sm:px-6">
        <FanNav />
      </div>
      {children}
    </div>
  );
}
