"use client";

import { useEffect, useState } from "react";
import { PredictForPlanetPlay } from "@/app/components/fan/PredictForPlanetPlay";
import { FAN_LOGIN_PATH } from "@/app/lib/routes";
import { P4P_FALLBACK_PROJECTS } from "@/app/lib/predict-for-planet";
import { getOrCreateSupporter } from "@/app/services/votes.service";
import { getSupportedTeams } from "@/app/services/teams.service";
import {
  fanVisibleProjects,
  visibleMatchDayFolderForClub,
} from "@/app/services/match-day-folder.service";

export default function PredictForPlanetPage() {
  const [fanId, setFanId] = useState<string | null>(null);
  const [clubName, setClubName] = useState("Arsenal");
  const [fixtureName, setFixtureName] = useState("Arsenal vs Chelsea");
  const [projects, setProjects] = useState<string[]>(P4P_FALLBACK_PROJECTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const supporter = await getOrCreateSupporter();
        if (!supporter) {
          window.location.href = FAN_LOGIN_PATH;
          return;
        }
        setFanId(supporter.email || supporter.id || "fan");
        const teams = await getSupportedTeams(supporter);
        const club = teams[0]?.name || "Arsenal";
        setClubName(club);
        const folder = visibleMatchDayFolderForClub({
          clubId: teams[0]?.id,
          clubName: club,
        });
        const listed = fanVisibleProjects(folder, teams[0]?.id ?? null);
        if (listed.length > 0) {
          setProjects(listed.map((row) => row.name));
        }
        const home = club.replace(/\s+fc$/i, "").trim();
        setFixtureName(`${home} vs Chelsea`);
      } catch {
        window.location.href = FAN_LOGIN_PATH;
        return;
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  if (loading || !fanId) {
    return (
      <main className="mx-auto max-w-3xl px-6 pb-16 text-white">
        Loading Predict-For Planet...
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 pb-16 text-white">
      <PredictForPlanetPlay
        fanId={fanId}
        clubName={clubName}
        fixtureName={fixtureName}
        projects={projects}
      />
    </main>
  );
}
