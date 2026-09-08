import Link from "next/link";
import UserTypeCards from "@/app/components/home/UserTypeCards";
import HowItWorks from "@/app/components/home/HowItWorks";
import Footer from "@/app/components/home/Footer";
import Image from "next/image";
import FeaturedProject from "@/app/components/dashboard/FeaturedProject";
export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* ================= HERO ================= */}

      <section className="mx-auto max-w-[1600px] flex flex-col items-center px-10 py-24 text-center">

        <div className="mb-8">

          <span className="rounded-full border border-green-500/40 bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-400">

            <div className="flex flex-col items-center text-center">

  <Image
    src="/images/s4p-logo.png"
    alt="Score-For-Our-Planet"
    width={320}
    height={320}
    priority
    className="w-[300px] md:w-[400px] h-auto"
  />

  </div>
            <p className="mt-6 text-3xl md:text-4xl font-bold tracking-wide text-white">
  Where Sport Creates Climate Action
</p>
          </span>

        </div>

                        <p className="mx-auto mt-12 max-w-6xl text-center text-3xl font-bold leading-relaxed text-green-300 md:text-4xl">

  Score-For-Our-Planet transforms

  <span className="text-white">
    {" "}every sporting moment{" "}
  </span>

  into real climate action by connecting

  <span className="text-white">
    {" "}Fans
  </span>,

  <span className="text-white">
    {" "}Sports Clubs
  </span>,

  <span className="text-white">
    {" "}Climate Sponsors
</span>
{" and "}
<span className="text-white">
  Climate Partners
</span>

</p>

      </section>

      {/* ================= WHO ARE YOU ================= */}

      <section className="mx-auto max-w-[1700px] px-14 pb-20">

        <div className="mb-16 text-center">

          <h2 className="text-4xl font-black">

            WHO ARE YOU?

          </h2>

          <p className="mt-3 text-[1.15rem] text-slate-300">
  Choose the role that best describes you.
</p>

        </div>

        <UserTypeCards />
<HowItWorks />
      </section>
<Footer />
    </main>
  );
}