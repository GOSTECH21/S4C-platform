import Image from "next/image";
import Link from "next/link";
import { HOME_PATH } from "@/app/lib/routes";

export const S4P_LOCKUP_SRC = "/images/home/s4p-lockup.png";
export const S4P_LOCKUP_ALT = "S4P SCORE-FOR-PLANET";
export const S4P_LOGO_BACK_HOME = "s4p-logo-back-home-v1";

const LOCKUP_CLASS =
  "h-14 w-auto max-w-[12rem] object-contain object-left sm:h-16 sm:max-w-[15rem]";

export function S4PLockup({
  className = LOCKUP_CLASS,
  priority = true,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={S4P_LOCKUP_SRC}
      alt={S4P_LOCKUP_ALT}
      width={1087}
      height={458}
      className={className}
      unoptimized
      priority={priority}
    />
  );
}

export function BackToHomeButton() {
  return (
    <Link
      href={HOME_PATH}
      data-testid="back-to-home"
      className="inline-flex shrink-0 items-center justify-center rounded-lg border border-s4p-mark bg-s4p-mark px-3 py-2 text-center text-[11px] font-bold leading-tight text-slate-950 hover:brightness-110 sm:px-4 sm:text-sm"
    >
      ← Back to home
    </Link>
  );
}

export function S4PBrandRow({
  markTestId = "s4p-lockup",
}: {
  markTestId?: string;
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3">
      <Link
        href={HOME_PATH}
        data-testid={markTestId}
        className="min-w-0 shrink"
        aria-label={S4P_LOCKUP_ALT}
      >
        <S4PLockup />
      </Link>
      <BackToHomeButton />
    </div>
  );
}
