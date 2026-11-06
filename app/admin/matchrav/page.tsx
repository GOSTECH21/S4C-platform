"use client";

import AppLayout from "../../layout/AppLayout";
import { MatchravOpsBoard } from "@/app/components/admin/MatchravOpsBoard";

export default function MatchravAdminPage() {
  return (
    <AppLayout>
      <MatchravOpsBoard />
    </AppLayout>
  );
}
