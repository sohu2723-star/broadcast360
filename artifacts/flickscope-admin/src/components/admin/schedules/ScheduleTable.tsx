import ScheduleButton from "./ScheduleButton";
import { Schedule } from "@/pages/admin-schedules";

type Props = {
  schedules: Schedule[];
  loading: boolean;
};

const formatDate = (value: string | null) => {
  if (!value) return "-";

  return new Date(value).toLocaleString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export default function ScheduleTable({
  schedules,
  loading,
}: Props) {
  if (loading) {
    return (
      <div className="p-10 text-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-[#0B1026] rounded-2xl border border-white/10 overflow-hidden">

      <table className="w-full">

        <thead>
          <tr className="border-b border-white/10 text-gray-400">
            <th className="p-5 text-left">Channel</th>
            <th className="p-5 text-left">Playlist</th>
            <th className="p-5 text-left">Start</th>
            <th className="p-5 text-left">End</th>
            <th className="p-5 text-left">Action</th>
          </tr>
        </thead>

        <tbody>

          {schedules.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="p-10 text-center text-gray-500"
              >
                No schedules found.
              </td>
            </tr>
          ) : (
            schedules.map((schedule) => (
              <tr
                key={schedule.id}
                className="border-b border-white/10"
              >
                <td className="p-5">{schedule.channel.name}</td>

                <td className="p-5">{schedule.playlist.name}</td>

                <td className="p-5">
                  {formatDate(schedule.startTime)}
                </td>

                <td className="p-5">
                  {formatDate(schedule.endTime)}
                </td>

                <td className="p-5">
                  <ScheduleButton id={schedule.id} />
                </td>
              </tr>
            ))
          )}

        </tbody>

      </table>

    </div>
  );
}