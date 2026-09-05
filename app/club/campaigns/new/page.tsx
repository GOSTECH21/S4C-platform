"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

export default function NewMatchCampaignPage() {

    const router = useRouter();

    const [title, setTitle] = useState("");
    const [competition, setCompetition] = useState("");
    const [opponent, setOpponent] = useState("");
    const [kickOff, setKickOff] = useState("");
    const [sponsor, setSponsor] = useState("");
    const [amount, setAmount] = useState("");

    const [saving, setSaving] = useState(false);

    async function createCampaign() {

        if (
            !title ||
            !competition ||
            !opponent ||
            !kickOff ||
            !sponsor ||
            !amount
        ) {

            alert("Please complete all fields.");

            return;

        }

        setSaving(true);

        const {
            data: { user }
        } = await supabase.auth.getUser();

        if (!user) {

            router.push("/club/login");

            return;

        }

        const { data: account } = await supabase
            .from("club_accounts")
            .select("club_id")
            .eq("auth_user_id", user.id)
            .single();

        if (!account) {

            alert("Club account not found.");

            return;

        }

        const { data, error } = await supabase
            .from("match_campaigns")
            .insert({
                club_id: account.club_id,
                title,
                competition,
                opponent,
                kick_off: kickOff,
                sponsor,
                sponsorship_per_goal: Number(amount),
                status: "draft"
            })
            .select()
            .single();

        setSaving(false);

        if (error) {

            console.error(error);

            alert("Campaign could not be created.");

            return;

        }

        router.push(`/club/campaigns/${data.id}/portfolio`);

    }

    return (

        <main className="min-h-screen bg-slate-950 text-white">

            <div className="mx-auto max-w-3xl p-10">

                <h1 className="text-5xl font-black">

                    Create Match Campaign

                </h1>

                <div className="mt-10 space-y-5">

                    <input
                        placeholder="Campaign Title"
                        value={title}
                        onChange={(e)=>setTitle(e.target.value)}
                        className="w-full rounded-xl bg-slate-800 p-4"
                    />

                    <input
                        placeholder="Competition"
                        value={competition}
                        onChange={(e)=>setCompetition(e.target.value)}
                        className="w-full rounded-xl bg-slate-800 p-4"
                    />

                    <input
                        placeholder="Opponent"
                        value={opponent}
                        onChange={(e)=>setOpponent(e.target.value)}
                        className="w-full rounded-xl bg-slate-800 p-4"
                    />

                    <input
                        type="datetime-local"
                        value={kickOff}
                        onChange={(e)=>setKickOff(e.target.value)}
                        className="w-full rounded-xl bg-slate-800 p-4"
                    />

                    <input
                        placeholder="Sponsor"
                        value={sponsor}
                        onChange={(e)=>setSponsor(e.target.value)}
                        className="w-full rounded-xl bg-slate-800 p-4"
                    />

                    <input
                        placeholder="Sponsor Commitment Per Goal (£)"
                        value={amount}
                        onChange={(e)=>setAmount(e.target.value)}
                        className="w-full rounded-xl bg-slate-800 p-4"
                    />

                    <button
                        onClick={createCampaign}
                        disabled={saving}
                        className="w-full rounded-xl bg-green-500 py-4 text-xl font-bold text-black hover:bg-green-400"
                    >
                        {saving
                            ? "Creating Campaign..."
                            : "Create Campaign"}
                    </button>

                </div>

            </div>

        </main>

    );

}