"use client";

import React, { useState } from "react";
import BroadcastScheduleForm from "@/components/admin/schedules/ScheduleForm"; // Path to your form component
import ScheduleDetailsView from "@/components/admin/schedules/ScheduleDetails";
// Initial realistic database mock data matching your structural keys
const initialMockDatabaseRecord = {
  id: "SCH-2026-8801",
  channelName: "Primary Sports HD",
  programName: "Late Night Live Playout",
  playlistName: "Q3_Premium_Sponsor_Loop_V4",
  startTime: "2026-07-05T22:00:00",
  endTime: "2026-07-05T23:30:00",
  status: "LIVE" as "LIVE" | "PENDING" | "ERROR",
  relationalKeys: {
    channelId: 104,
    programId: 1882,
    playlistId: 90432,
  },
  assetMeta: {
    codec: "H.264 / AAC",
    resolution: "1080p 60fps",
    bitrate: "12.5 Mbps",
  },
};

// Mock dependencies for the Form View
const mockChannels = [
  { id: 104, name: "Primary Sports HD" },
  { id: 105, name: "Cinema Action Showcase" },
];
const mockPrograms = [
  { id: 1882, name: "Late Night Live Playout" },
  { id: 1990, name: "Pre-Game Analysis Wrap" },
];
const mockPlaylists = [
  { id: 90432, name: "Q3_Premium_Sponsor_Loop_V4" },
  { id: 90433, name: "Main_Feature_HD_Master" },
];

export default function SchedulePage() {
  // Navigation & Screen States
  const [isEditing, setIsEditing] = useState(false);
  const [schedule, setSchedule] = useState(initialMockDatabaseRecord);

  // Form Processing States
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedChannelId, setSelectedChannelId] = useState<number | null>(schedule.relationalKeys.channelId);
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(schedule.relationalKeys.programId);
  
  const [formData, setFormData] = useState({
    channelId: schedule.relationalKeys.channelId,
    playlistId: schedule.relationalKeys.playlistId,
    startTime: schedule.startTime,
    endTime: schedule.endTime,
  });

  // Simulation handlers for infrastructure control
  const handleForceSkip = () => {
    alert("Signal Pipeline Directive: Skipping current media package asset frame buffer...");
  };

  const handleEmergencyStop = () => {
    const confirmKill = confirm("CRITICAL WARNING: Are you sure you want to terminate the live playout signal output? This will disrupt active viewers.");
    if (confirmKill) {
      setSchedule((prev) => ({ ...prev, status: "ERROR" }));
    }
  };

  // Form Submission Execution
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.startTime || !formData.endTime) {
      setError("Time allocation windows must be accurately mapped to write changes.");
      return;
    }

    setLoading(true);

    // Simulate database write operational lag
    setTimeout(() => {
      const selectedProgObj = mockPrograms.find(p => p.id === selectedProgramId);
      const selectedChanObj = mockChannels.find(c => c.id === selectedChannelId);
      const selectedPlayObj = mockPlaylists.find(p => p.id === formData.playlistId);

      setSchedule((prev) => ({
        ...prev,
        channelName: selectedChanObj?.name || prev.channelName,
        programName: selectedProgObj?.name || prev.programName,
        playlistName: selectedPlayObj?.name || prev.playlistName,
        startTime: formData.startTime,
        endTime: formData.endTime,
        status: "PENDING", // Changes status to pending deployment verification
        relationalKeys: {
          channelId: selectedChannelId || prev.relationalKeys.channelId,
          programId: selectedProgramId || prev.relationalKeys.programId,
          playlistId: formData.playlistId || prev.relationalKeys.playlistId,
        }
      }));

      setLoading(false);
      setIsEditing(false); // Return smoothly to dashboard details display
    }, 1200);
  };

  return (
    <main className="min-h-screen w-full bg-[#010312] py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      
      {/* Dynamic View State Transition */}
      {isEditing ? (
        <div className="space-y-4">
          {/* Form Cancel Trigger */}
          <div className="max-w-xl mx-auto flex justify-start">
            <button
              onClick={() => { setError(null); setIsEditing(false); }}
              className="text-xs uppercase font-bold tracking-wider text-[#106EE9] hover:text-[#FFFFFF] transition-colors flex items-center gap-1"
            >
              ← Terminate Edit State
            </button>
          </div>
          
          <BroadcastScheduleForm
            initialData={{ id: schedule.id }}
            handleSubmit={handleFormSubmit}
            error={error}
            selectedChannelId={selectedChannelId}
            setSelectedChannelId={setSelectedChannelId}
            selectedProgramId={selectedProgramId}
            setSelectedProgramId={setSelectedProgramId}
            formData={formData}
            setFormData={setFormData}
            channels={mockChannels}
            programs={mockPrograms}
            playlists={mockPlaylists}
            loadingPrograms={false}
            loadingPlaylists={false}
            loading={loading}
            getCurrentDateTimeString={() => "2026-01-01T00:00"}
          />
        </div>
      ) : (
        <ScheduleDetailsView
          scheduleData={schedule}
          onEdit={() => setIsEditing(true)}
          onForceSkip={handleForceSkip}
          onEmergencyStop={handleEmergencyStop}
        />
      )}
      
    </main>
  );
}