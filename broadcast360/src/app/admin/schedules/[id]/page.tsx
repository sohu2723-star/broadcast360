"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ScheduleDetailsView, { ScheduleDetailsProps } from "@/components/admin/schedules/ScheduleDetails";

export default function SchedulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Next.js 15 requires unwrapping async params in client components using React.use()
  const { id } = use(params);
  const router = useRouter();
  
  const [scheduleData, setScheduleData] = useState<ScheduleDetailsProps["scheduleData"]>();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchScheduleData = async () => {
      try {
        // Adjust the fetch path if your API route is located elsewhere
        const res = await fetch(`/api/schedules/${id}`);
        
        if (!res.ok) {
          throw new Error(res.status === 404 ? "Schedule not found" : "Failed to fetch telemetry");
        }
        
        const data = await res.json();
        setScheduleData(data);
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchScheduleData();

    // Poll the API every 30 seconds to update the LIVE progress bar and time remaining
    const intervalId = setInterval(fetchScheduleData, 30000);
    return () => clearInterval(intervalId);
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#010312] text-[#106EE9] font-mono text-sm animate-pulse">
        Establishing telemetry connection...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#010312] text-[#F41010] p-6 space-y-4">
        <h2 className="text-xl font-bold uppercase">Signal Lost</h2>
        <p className="font-mono text-sm">{error}</p>
        <button 
          onClick={() => router.push("/admin/schedules")}
          className="px-4 py-2 border border-[#F41010]/40 rounded hover:bg-[#F41010]/10 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <ScheduleDetailsView
      scheduleData={scheduleData}
      onEdit={() => {
        // Handle edit logic (e.g., opening a modal or routing to an edit form)
        console.log(`Editing schedule: ${id}`);
      }}
      onForceSkip={() => {
        if (confirm("Warning: Skipping this asset will immediately cue the next item. Proceed?")) {
          console.log(`Force skipped asset on schedule: ${id}`);
        }
      }}
      onEmergencyStop={async () => {
        if (confirm("EMERGENCY OVERRIDE: Are you absolutely sure you want to kill this broadcast signal?")) {
          try {
            await fetch(`/api/schedule/${id}`, { method: "DELETE" });
            router.push("/admin/schedules");
          } catch (err) {
            console.error("Failed to terminate broadcast", err);
          }
        }
      }}
    />
  );
}