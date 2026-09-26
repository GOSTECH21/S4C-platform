"use client";

import { S4PStaffGate } from "@/app/components/admin/S4PStaffGate";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <S4PStaffGate>{children}</S4PStaffGate>;
}
