"use client";

import RoleLoginForm from "@/app/components/auth/RoleLoginForm";
import {
  ADMIN_PATH,
  ADMIN_REGISTER_PATH,
} from "@/app/lib/routes";
import { supabase } from "@/app/lib/supabase";
import { requireS4PStaff } from "@/app/services/signed-in-role.service";

export default function AdminLoginPage() {
  return (
    <RoleLoginForm
      title="S4P Staff Login"
      subtitle="Authorized Score-For-Our-Planet staff only. This is not Fan, Club or Sponsor login."
      destination={ADMIN_PATH}
      registerHref={ADMIN_REGISTER_PATH}
      afterSignIn={async () => {
        const staff = await requireS4PStaff();
        if (staff) return null;
        await supabase.auth.signOut();
        return "This email is not an S4P staff account. Use Fan, Club or Sponsor login instead.";
      }}
    />
  );
}
