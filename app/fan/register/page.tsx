"use client";

import RoleRegisterForm from "@/app/components/auth/RoleRegisterForm";
import { FAN_LOGIN_PATH } from "@/app/lib/routes";

export default function FanRegisterPage() {
  return (
    <RoleRegisterForm
      title="Join as a Fan"
      subtitle="Create your S4P supporter account."
      role="supporter"
      loginHref={FAN_LOGIN_PATH}
    />
  );
}
