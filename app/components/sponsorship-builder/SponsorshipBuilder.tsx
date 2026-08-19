"use client";

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { SponsorshipProduct } from "@/app/data/sponsorship-products";

import { createSponsorship } from "@/app/services/sponsorships.service.v2";

import ProgressBar from "./ProgressBar";
import CompetitionStep from "./CompetitionStep";
import FixtureSelector from "./FixtureSelector";
import TeamSelector from "./TeamSelector";
import ClimateImpactStep from "./ClimateImpactStep";
import BudgetStep from "./BudgetStep";
import ReviewStep from "./ReviewStep";

type Props = {
  product: SponsorshipProduct;
};

export default function SponsorshipBuilder({
  product,
}: Props) {

  const router = useRouter();

  const TOTAL_STEPS = 6;

  const [step, setStep] = useState(1);

  const [competition, setCompetition] = useState("");

  const [fixture, setFixture] = useState("");

  const [selectedTeam, setSelectedTeam] = useState("");

  const [impactValue, setImpactValue] = useState(0);

  const [budget, setBudget] = useState(0);

  const [loading, setLoading] = useState(false);

  async function handleLaunch() {

    try {

      setLoading(true);

      await createSponsorship({

        productId: product.id,

        sport: product.sport,

        competition,

        fixture,

        sponsoredTeam: selectedTeam,

        trigger: product.trigger,

        climateImpactValue: impactValue,

        marketingBudget: budget,

      });

      alert("Sponsorship launched successfully!");

      router.push("/sponsor/dashboard");

    } catch (err: any) {

      alert(err.message);

    } finally {

      setLoading(false);

    }
  }
return (

  <div className="mx-auto max-w-4xl">

    <ProgressBar
      step={step}
      totalSteps={TOTAL_STEPS}
    />

    {step === 1 && (

      <CompetitionStep
        product={product}
        competition={competition}
        setCompetition={setCompetition}
        onContinue={() => setStep(2)}
      />

    )}

    {step === 2 && (

      <FixtureSelector
        competition={competition}
        fixture={fixture}
        setFixture={setFixture}
        onContinue={() => setStep(3)}
      />

    )}

    {step === 3 && (

      <TeamSelector
        fixture={fixture}
        selectedTeam={selectedTeam}
        setSelectedTeam={setSelectedTeam}
        onContinue={() => setStep(4)}
      />

    )}

    {step === 4 && (

      <ClimateImpactStep
        impactValue={impactValue}
        setImpactValue={setImpactValue}
        onContinue={() => setStep(5)}
      />

    )}

    {step === 5 && (

      <BudgetStep
        budget={budget}
        setBudget={setBudget}
        onContinue={() => setStep(6)}
      />

    )}

    {step === 6 && (

      <ReviewStep
        product={product}
        competition={competition}
        fixture={fixture}
        selectedTeam={selectedTeam}
        impactValue={impactValue}
        budget={budget}
        onLaunch={handleLaunch}
      />

    )}

    {loading && (

      <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">

        <p className="font-semibold text-emerald-700">
          Launching Sponsorship...
        </p>

      </div>
    )}

  </div>

);

}