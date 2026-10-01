import HomeFrontPage from "@/app/components/home/HomeFrontPage";
import HowItWorks from "@/app/components/home/HowItWorks";
import Footer from "@/app/components/home/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <HomeFrontPage />
      <HowItWorks />
      <Footer />
    </main>
  );
}
