import FanNav from "@/app/dashboard/supporter/components/FanNav";
import HowS4pSelectMatch from "@/app/components/home/HowS4pSelectMatch";

export default function MyTeamsPreviewPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <FanNav />
        <HowS4pSelectMatch
          audience="fan"
          initialClub="Real Madrid"
          clubOptions={["Real Madrid", "Everton"]}
        />
      </div>
    </main>
  );
}
