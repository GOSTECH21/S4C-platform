import { loadPlatformStats } from "@/app/services/platform-stats.service";

export async function GET() {
  try {
    const stats = await loadPlatformStats();
    return Response.json(stats, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Could not load platform stats.",
      },
      { status: 500 }
    );
  }
}
