import HomeFrontPage from "@/app/components/home/HomeFrontPage";
import HowItWorks from "@/app/components/home/HowItWorks";
import Footer from "@/app/components/home/Footer";
import { connection } from "next/server";
import { emptyImpactTables } from "@/app/lib/s4p-impact-tables";
import { mergePlatformStats } from "@/app/lib/platform-stats";
import { loadS4pImpactTables } from "@/app/services/s4p-impact-tables.service";
import { loadPlatformStats } from "@/app/services/platform-stats.service";

export default async function Home() {
  await connection();
  let impactTables = emptyImpactTables();
  let stats = mergePlatformStats();
  try {
    impactTables = await loadS4pImpactTables();
  } catch {
    // CILT still ranks from the current-season roster when live CIST/CIFT data is unavailable.
  }
  try {
    stats = await loadPlatformStats();
  } catch {
    // The client still loads the bar from the roster tables.
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <HomeFrontPage impactTables={impactTables} initialStats={stats}>
        <HowItWorks />
      </HomeFrontPage>
      <Footer />
    </main>
  );
}
