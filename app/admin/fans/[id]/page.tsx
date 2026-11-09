"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AppLayout from "../../../layout/AppLayout";
import { AdminFanProfileView } from "@/app/components/admin/AdminFanProfileView";
import { loadStaffFanProfile } from "@/app/services/fan-activity.service";
import type { StaffFanProfile } from "@/app/lib/admin-fan-profile";
import { ADMIN_PATH } from "@/app/lib/routes";
import Link from "next/link";

export default function AdminFanProfilePage() {
  const params = useParams<{ id: string }>();
  const id = String(params?.id ?? "").trim();
  const [profile, setProfile] = useState<StaffFanProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setError("Missing fan id.");
      setLoading(false);
      return;
    }
    loadStaffFanProfile(id)
      .then((next) => {
        if (!next) {
          setError("That Fan/Supporter is not in the Admin database.");
          return;
        }
        setProfile(next);
      })
      .catch((err) =>
        setError(
          err instanceof Error
            ? err.message
            : "Could not load this Fan/Supporter profile."
        )
      )
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <AppLayout>
      {loading ? (
        <p className="text-slate-400">Loading fan profile...</p>
      ) : error ? (
        <div className="space-y-4">
          <Link
            href={ADMIN_PATH}
            className="text-sm font-semibold text-green-400 hover:underline"
          >
            Back to registered fans
          </Link>
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        </div>
      ) : profile ? (
        <AdminFanProfileView profile={profile} />
      ) : null}
    </AppLayout>
  );
}
