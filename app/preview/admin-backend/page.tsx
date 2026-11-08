"use client";

import { useState } from "react";
import AppLayout from "@/app/layout/AppLayout";
import { AdminBackendHome } from "@/app/components/admin/AdminBackendHome";
import {
  ADMIN_BACKEND_STAMP,
  previewAdminBackendSnapshot,
  type AdminBackendSnapshot,
} from "@/app/lib/admin-backend";

export default function AdminBackendPreviewPage() {
  const [snapshot, setSnapshot] = useState<AdminBackendSnapshot>(
    previewAdminBackendSnapshot()
  );

  return (
    <div data-admin-backend-preview={ADMIN_BACKEND_STAMP}>
      <AppLayout>
        <div className="min-w-0 space-y-6 overflow-x-hidden sm:space-y-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-green-400 sm:text-sm sm:tracking-[0.3em]">
            S4P Admin Backend
          </p>
          <h1 className="text-3xl font-black sm:text-4xl">Platform records</h1>
          <p className="max-w-3xl text-sm text-slate-300 sm:text-base">
            Clubs, supporters, Lead Climate Sponsors and Local Business Climate
            Sponsors — keep them on the platform or delete them.
          </p>
          <AdminBackendHome
            snapshot={snapshot}
            persist={false}
            onChange={setSnapshot}
          />
        </div>
      </AppLayout>
    </div>
  );
}
