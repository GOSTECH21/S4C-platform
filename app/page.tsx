import HomeFrontPage from "@/app/components/home/HomeFrontPage";
import HowItWorks from "@/app/components/home/HowItWorks";
import Footer from "@/app/components/home/Footer";
import { emptyImpactTables } from "@/app/lib/s4p-impact-tables";
import { loadS4pImpactTables } from "@/app/services/s4p-impact-tables.service";

export default async function Home() {
  let impactTables = emptyImpactTables();
  try {
    impactTables = await loadS4pImpactTables();
  } catch {
    // CILT still ranks from the current-season roster when live CIST/CIFT data is unavailable.
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <HomeFrontPage impactTables={impactTables}>
        <HowItWorks />
      </HomeFrontPage>
      <Footer />
    </main>
  );
}
