export default function ClimateTimeline() {
  const events = [
    {
      date: "23 Aug 2026",
      fixture: "Hearts 2–0 Aberdeen",
      goals: 2,
      credits: "£11,000",
      supporters: "1,462",
      school: "Tynecastle High School",
      progress: "£83,500 / £95,000",
    },
    {
      date: "30 Aug 2026",
      fixture: "Hearts 1–1 Hibernian",
      goals: 1,
      credits: "£5,500",
      supporters: "840",
      school: "Tynecastle High School",
      progress: "£89,000 / £95,000",
    },
    {
      date: "13 Sept 2026",
      fixture: "Hearts 3–1 Rangers",
      goals: 3,
      credits: "£16,500",
      supporters: "2,103",
      school: "Tynecastle High School",
      progress: "PROJECT COMPLETE ✅",
    },
  ];

  return (
    <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-8">

      <p className="uppercase tracking-[0.3em] text-green-400">
        Climate Timeline
      </p>

      <h2 className="mt-2 text-4xl font-black">
        Every Match Creates Climate Action
      </h2>

      <div className="mt-8 space-y-6">

        {events.map((event, index) => (

          <div
            key={index}
            className="rounded-2xl border border-slate-700 bg-slate-950 p-6"
          >

            <p className="text-green-400 font-semibold">
              {event.date}
            </p>

            <h3 className="mt-2 text-3xl font-bold">
              {event.fixture}
            </h3>

            <div className="mt-6 grid md:grid-cols-4 gap-6">

              <div>
                <p className="text-slate-400">Goals</p>
                <h4 className="text-2xl font-bold">{event.goals}</h4>
              </div>

              <div>
                <p className="text-slate-400">Climate Credits</p>
                <h4 className="text-2xl font-bold">{event.credits}</h4>
              </div>

              <div>
                <p className="text-slate-400">Supporters</p>
                <h4 className="text-2xl font-bold">{event.supporters}</h4>
              </div>

              <div>
                <p className="text-slate-400">{event.school}</p>
                <h4 className="text-xl font-bold text-green-400">
                  {event.progress}
                </h4>
              </div>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
}