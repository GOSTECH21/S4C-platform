export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Sport Creates Excitement",
      description:
        "Every goal, try, point and sporting achievement creates an opportunity for climate action.",
    },
    {
      number: "02",
      title: "Climate Sponsors Step In",
      description:
        "Sponsors commit funding to sporting moments, competitions and clubs.",
    },
    {
      number: "03",
      title: "Fans Earn Climate Credits",
      description:
        "Supporters receive Climate Credits through their passion for sport.",
    },
    {
      number: "04",
      title: "Climate Partners Benefit",
      description:
        "Fans direct their Climate Credits towards verified Climate Partners and projects.",
    },
    {
      number: "05",
      title: "Everyone Wins",
      description:
        "Together we create measurable climate action while strengthening sport.",
    },
  ];

  return (
    <section className="mx-auto max-w-[1700px] px-12 py-24">

      <div className="text-center">

        <h2 className="text-5xl font-black text-white">
          How Score-For-Our-Planet Works
        </h2>

        <p className="mt-5 text-xl text-slate-400">
          Five simple steps that transform sporting passion into measurable climate action.
        </p>

      </div>

      <div className="mt-24 flex items-start justify-between">

        {steps.map((step, index) => (

          <div
            key={step.number}
            className="flex w-[18%] flex-col items-center text-center"
          >

            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500 text-3xl font-black text-black shadow-xl">

              {step.number}

            </div>

            <h3 className="mt-8 text-2xl font-bold text-white">

              {step.title}

            </h3>

            <p className="mt-5 leading-8 text-slate-400">

              {step.description}

            </p>

            {index < steps.length - 1 && (

              <div className="mt-10 hidden h-1 w-full rounded-full bg-gradient-to-r from-green-500 to-green-300 xl:block" />

            )}

          </div>

        ))}

      </div>

    </section>
  );
}