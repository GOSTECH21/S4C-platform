"use client";

import { useState } from "react";
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
    <main
      data-admin-backend-preview={ADMIN_BACKEND_STAMP}
      className="min-h-screen bg-slate-950 p-4 text-white sm:p-10"
    >
      <div className="mx-auto max-w-6xl space-y-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
          S4P Admin Backend
        </p>
        <h1 className="text-4xl font-black">Platform records</h1>
        <p className="max-w-3xl text-slate-300">
          Clubs, supporters, Lead Climate Sponsors and Local Business Climate
          Sponsors — keep them on the platform or delete them.
        </p>
        <AdminBackendHome
          snapshot={snapshot}
          persist={false}
          onChange={setSnapshot}
        />
      </div>
    </main>
  );
}
