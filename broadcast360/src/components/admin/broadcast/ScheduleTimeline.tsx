const schedules = [
  {
    time: "12:00",
    name: "Movie",
  },

  {
    time: "14:00",
    name: "Live News",
  },

  {
    time: "15:00",
    name: "Entertainment",
  },
];

export default function ScheduleTimeline() {
  return (
    <div className="rounded-xl border border-[#106EE9]/20 bg-[#0B1026] p-5">
      <h2 className="font-semibold">Schedule Timeline</h2>

      <div className="mt-5 space-y-4">
        {schedules.map((s) => (
          <div
            key={s.time}
            className="flex gap-5 border-l border-blue-500 pl-4"
          >
            <div className="text-blue-400">{s.time}</div>

            <div>{s.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
