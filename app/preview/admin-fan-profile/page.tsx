import { AdminFanProfileView } from "@/app/components/admin/AdminFanProfileView";
import { sampleStaffFanProfile } from "@/app/lib/admin-fan-profile";

export default function AdminFanProfilePreviewPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-3xl">
        <AdminFanProfileView profile={sampleStaffFanProfile()} />
      </div>
    </main>
  );
}
