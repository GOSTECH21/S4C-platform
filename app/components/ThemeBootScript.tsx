import { S4P_THEME_BOOT_SCRIPT } from "@/app/lib/s4p-themes";

/** Runs in the document head so a saved design trial is applied before paint. */
export function ThemeBootScript() {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: S4P_THEME_BOOT_SCRIPT }}
    />
  );
}
