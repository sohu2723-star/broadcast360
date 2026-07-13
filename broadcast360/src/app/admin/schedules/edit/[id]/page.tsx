import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ScheduleForm from "@/components/admin/schedules/ScheduleForm";

interface EditSchedulePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSchedulePage({ params }: EditSchedulePageProps) {
  const { id } = await params;
  const scheduleId = Number(id);

  if (isNaN(scheduleId)) {
    return notFound();
  }

  // Fetch the schedule item along with its playlist tracking metrics
  const schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId },
    include: {
      playlist: {
        select: {
          programId: true, // Needed so the cascading dropdown can auto-select the Program row
        },
      },
    },
  });

  if (!schedule) {
    return notFound();
  }

  function formatLocalDateTime(date: Date | null) {
  if (!date) return "";

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  const hours = String(
    date.getHours()
  ).padStart(2, "0");

  const minutes = String(
    date.getMinutes()
  ).padStart(2, "0");


  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

const formattedInitialData = {
  id: schedule.id,
  channelId: schedule.channelId,
  playlistId: schedule.playlistId,
  programId: schedule.playlist?.programId ?? 0,

  startTime: formatLocalDateTime(
    schedule.startTime
  ),

  endTime: formatLocalDateTime(
    schedule.endTime
  ),
};

  return (
    <div className="container mx-auto py-10 px-4">
      <ScheduleForm initialData={formattedInitialData} />
    </div>
  );
}