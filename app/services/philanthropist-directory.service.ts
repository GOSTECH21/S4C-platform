import { supabase } from "../lib/supabase";
import {
  loadPhilanthropistDirectory,
  mergePhilanthropistDirectory,
  type PhilanthropistDirectoryEntry,
} from "../lib/philanthropist-directory";

/** Catalog file plus registrations stored on this browser and on the sponsors table. */
export async function loadPlatformPhilanthropists(): Promise<
  PhilanthropistDirectoryEntry[]
> {
  const local = loadPhilanthropistDirectory();
  try {
    const { data, error } = await supabase
      .from("sponsors")
      .select("id, name, website, industry")
      .ilike("industry", "%philanthrop%");
    if (error || !data) return local;
    const remote: PhilanthropistDirectoryEntry[] = data
      .map((row) => ({
        id: `philanthropist:${String(row.id)}`,
        organisation: String(row.name ?? "").trim(),
        contactName: String(row.website ?? "").trim() || String(row.name ?? "").trim(),
        email: "",
        clubName: "",
        giftGbp: 0,
        createdAt: new Date().toISOString(),
        source: "registered" as const,
      }))
      .filter((row) => row.organisation);
    return mergePhilanthropistDirectory(remote);
  } catch {
    return local;
  }
}
