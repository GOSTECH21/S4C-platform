"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

import ProjectCard from "./components/ProjectCard";
import SelectionBar from "./components/SelectionBar";
import PublishButton from "./components/PublishButton";

export default function MatchPortfolioPage() {

    const router = useRouter();
    const params = useParams();

    const campaignId = params.id as string;

    const [campaign, setCampaign] = useState<any>(null);
    const [projects, setProjects] = useState<any[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPage();
    }, []);

    async function loadPage() {

        const { data: campaignData } = await supabase
            .from("match_campaigns")
            .select("*")
            .eq("id", campaignId)
            .single();

        setCampaign(campaignData);

        const { data: library } = await supabase
            .from("climate_projects")
            .select("*")
            .eq("status", "active")
            .order("name");

        setProjects(library || []);

        setLoading(false);

    }

    function toggleProject(projectId: string) {

        if (selected.includes(projectId)) {

            setSelected(
                selected.filter(id => id !== projectId)
            );

            return;

        }

        if (selected.length >= 5) {

            alert("You can only select FIVE projects.");

            return;

        }

        setSelected([
            ...selected,
            projectId
        ]);

    }

    async function publishPortfolio() {

        if (selected.length !== 5) {

            alert("Please select exactly FIVE projects.");

            return;

        }

        await supabase
            .from("campaign_projects")
            .delete()
            .eq("campaign_id", campaignId);

        const rows = selected.map((projectId, index) => ({
            campaign_id: campaignId,
            climate_project_id: projectId,
            display_order: index + 1
        }));

        const { error } = await supabase
            .from("campaign_projects")
            .insert(rows);

        if (error) {

            console.error(error);

            alert("Portfolio could not be published.");

            return;

        }

        alert("✅ Match Portfolio Published");

        router.push("/club/dashboard");

    }

    if (loading) {

        return (

            <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white">

                Loading Match Portfolio...

            </main>

        );

    }

    return (

        <main className="min-h-screen bg-slate-950 p-10">

            <div className="mx-auto max-w-7xl">

                <h1 className="text-5xl font-black text-white">

                    Match Portfolio Builder

                </h1>

                <p className="mt-3 text-slate-400 text-xl">

                    {campaign?.title}

                </p>

                <div className="mt-10 grid gap-8 lg:grid-cols-2">

                    {projects.map((project) => (

                        <ProjectCard

                            key={project.id}

                            project={project}

                            selected={selected.includes(project.id)}

                            onToggle={() => toggleProject(project.id)}

                        />

                    ))}

                </div>

                <div className="mt-10">

                    <SelectionBar

                        selected={selected.length}

                    />

                </div>

                <div className="mt-6">

                    <PublishButton

                        disabled={selected.length !== 5}

                        onPublish={publishPortfolio}

                    />

                </div>

            </div>

        </main>

    );

}