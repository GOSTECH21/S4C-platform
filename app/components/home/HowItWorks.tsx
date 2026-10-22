import Image from "next/image";

const MARK_GREEN = "#5bc662";

const steps: Array<{
  number: string;
  title: string;
  description: string;
}> = [
  {
    number: "01",
    title: "CLUBS CHOOSE PROJECTS",
    description:
      "Clubs select five eligible Climate Projects for supporters to fund. The selected Projects help to mitigate the Club's Match-Day Carbon emissions",
  },
  {
    number: "02",
    title: "SPONSORS FUND THE IMPACT MOMENTS",
    description:
      "Local Businesses fund fan participation. Lead Sponsors fund the Goals-Scored & unlock additional funding through Impact Moments",
  },
  {
    number: "03",
    title: "FANS DIRECT THE FUNDING",
    description:
      "Fans press FUND-IT up to 5 times, taking £0.20 once from each Carbon Wallet onto any Climate Project they want to support (creating a DIRECT FAN ENGAGEMENT FOR LOCAL BUSINESSES)",
  },
  {
    number: "04",
    title: "PROJECTS DELIVER THE IMPACT",
    description:
      "Climate Project Providers receive funding and deliver measurable climate action",
  },
  {
    number: "05",
    title: "EVERYONE CREATES IMPACT",
    description:
      "Clubs address Match-Day carbon footprints, Sponsors engage supporters, Fans direct funding & Climate Projects turn it into action",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-s4p-works" className="pb-8 md:pb-12">
      <div className="border-y border-emerald-400/20">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-5 px-5 py-5 md:px-10 xl:flex-row xl:items-center xl:justify-between xl:gap-8 xl:py-4">
          <div className="flex min-w-0 flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
            <Image
              src="/images/home/s4p-lockup.png"
              alt="S4P SCORE-FOR-PLANET"
              width={1087}
              height={458}
              className="h-[4.75rem] w-auto shrink-0 sm:h-20"
              unoptimized
            />
            <div className="hidden h-16 w-px shrink-0 border-l border-emerald-400/40 sm:block" />
            <div className="min-w-0">
              <h2 className="text-3xl font-black uppercase leading-none tracking-tight sm:text-4xl xl:text-[2.4rem]">
                How S<span style={{ color: MARK_GREEN }}>4</span>P Works
              </h2>
              <p className="mt-2 text-sm font-bold uppercase leading-6 sm:text-base">
                Same passion. Cleaner planet.{" "}
                <span style={{ color: MARK_GREEN }}>
                  Every score counts. Every fan counts.
                </span>
              </p>
            </div>
          </div>
          <p
            className="shrink-0 -rotate-3 self-start rounded-md bg-s4p-mark px-4 py-3 text-center text-sm font-black uppercase leading-tight text-black shadow-sm xl:self-center xl:px-5 xl:text-base"
          >
            A quick guide to
            <br />
            making a real difference
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1800px] px-6 pb-4 pt-10 md:px-12 xl:px-16">
        <div className="grid grid-cols-1 items-stretch gap-12 sm:grid-cols-2 xl:grid-cols-5 xl:gap-x-16 xl:gap-y-12">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="s4p-navy-panel flex flex-col items-center rounded-3xl px-4 py-6 text-center xl:px-5"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-s4p-mark text-3xl font-black text-black shadow-xl">
                {step.number}
              </div>
              <h3 className="mt-8 text-xl font-bold uppercase md:text-2xl">
                {step.title}
              </h3>
              <p className="mt-5 text-sm leading-7 md:text-[0.95rem] md:leading-8">
                {step.description}
              </p>
              {index < steps.length - 1 && (
                <div className="mt-auto hidden w-3/4 pt-10 xl:block">
                  <div className="h-1 w-full rounded-full bg-s4p-mark" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
