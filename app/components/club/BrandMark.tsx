import { brandInitials } from "@/app/lib/climate-sponsors";

export function BrandMark({
  name,
  logoUrl,
  large = false,
}: {
  name: string;
  logoUrl?: string | null;
  large?: boolean;
}) {
  const size = large ? "h-16 w-16 text-xl" : "h-12 w-12 text-sm";
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={`${name} branding`}
        className={`${size} rounded-xl object-cover`}
      />
    );
  }
  return (
    <div
      className={`${size} flex items-center justify-center rounded-xl bg-green-500 font-black text-slate-950`}
    >
      {brandInitials(name)}
    </div>
  );
}
