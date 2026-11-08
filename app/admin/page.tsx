"use client";

import { useEffect, useState } from "react";
import AppLayout from "../layout/AppLayout";
import { AdminBackendHome } from "@/app/components/admin/AdminBackendHome";
import {
  emptyAdminSnapshot,
  type AdminBackendSnapshot,
} from "@/app/lib/admin-backend";
import { loadAdminBackend } from "@/app/services/admin-backend.service";
import { supabase } from "@/app/lib/supabase";
import { ADMIN_LOGIN_PATH } from "@/app/lib/routes";

export default function S4PAdminHomePage() {
  const [snapshot, setSnapshot] = useState<AdminBackendSnapshot>(
    emptyAdminSnapshot()
  );
  const [loading, setLoading] = useState(true);

  async function reload() {
    const next = await loadAdminBackend();
    setSnapshot(next);
    return next;
  }

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = ADMIN_LOGIN_PATH;
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
              S4P Admin Backend
            </p>
            <h1 className="mt-2 text-4xl font-black">Platform records</h1>
            <p className="mt-3 max-w-3xl text-slate-300">
              Every registered club, supporter, Lead Climate Sponsor and Local
              Business Climate Sponsor. Keep a participant on the platform or
              delete them from it.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            className="rounded-xl border border-slate-600 px-5 py-3 font-semibold"
          >
            Logout
          </button>
        </div>

        {snapshot.error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
            {snapshot.error}
          </div>
        )}

        {loading ? (
          <p className="text-slate-400">Loading platform records...</p>
        ) : (
          <AdminBackendHome
            snapshot={snapshot}
            onChange={setSnapshot}
            persist
          />
        )}
      </div>
    </AppLayout>
  );
}
