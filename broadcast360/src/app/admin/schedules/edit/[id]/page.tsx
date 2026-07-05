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

  // Format the data structure cleanly to match the form initialData properties
  const formattedInitialData = {
    id: schedule.id,
    channelId: schedule.channelId,
    playlistId: schedule.playlistId,
    programId: schedule.playlist?.programId ?? 0, // Injected program dependency configuration
    // / Checks if startTime exists, otherwise defaults to an empty string
    startTime: schedule.startTime ? schedule.startTime.toISOString().slice(0, 16) : "", 
    
    // FIX: Checks if endTime exists, otherwise defaults to an empty string
    endTime: schedule.endTime ? schedule.endTime.toISOString().slice(0, 16) : "",
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <ScheduleForm initialData={formattedInitialData} />
    </div>
  );
}