import Header from "./Header";
import Sidebar from "./Sidebar";
import AdminNav from "@/app/components/admin/AdminNav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen min-w-0 flex-col md:flex-row">
      <Sidebar />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Header />
        <AdminNav />

        <main className="min-w-0 flex-1 overflow-x-hidden bg-slate-900 p-4 text-white sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}