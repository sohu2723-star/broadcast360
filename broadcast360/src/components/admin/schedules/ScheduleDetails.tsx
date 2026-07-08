import React from 'react';

export default function ScheduleDetailsView({
  scheduleData = {
    id: "SCH-2026-8801",
    channelName: "Primary Sports HD",
    programName: "Late Night Live Playout",
    playlistName: "Q3_Premium_Sponsor_Loop_V4",
    startTime: "2026-07-05T22:00:00",
    endTime: "2026-07-05T23:30:00",
    status: "LIVE", // LIVE, PENDING, ERROR
    relationalKeys: {
      channelId: 104,
      programId: 1882,
      playlistId: 90432
    },
    assetMeta: {
      codec: "H.264 / AAC",
      resolution: "1080p 60fps",
      bitrate: "12.5 Mbps"
    }
  },
  onEdit,
  onForceSkip,
  onEmergencyStop
}) {
  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4 sm:p-6 text-[#FFFFFF] bg-[#010312] min-h-screen">
      
      {/* 1. HERO HEADER BANNER */}
      <div className="w-full bg-[#0B1026] border border-[#106EE9]/30 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold tracking-widest text-[#106EE9] uppercase bg-[#106EE9]/10 px-2.5 py-1 rounded border border-[#106EE9]/20">
              {scheduleData.id}
            </span>
            {/* Status Pill */}
            <span className={`text-xs font-bold px-2.5 py-1 rounded flex items-center gap-1.5 border ${
              scheduleData.status === 'LIVE' 
                ? 'bg-[#1CFE10]/10 border-[#1CFE10] text-[#1CFE10]' 
                : 'bg-zinc-500/10 border-zinc-500 text-zinc-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${scheduleData.status === 'LIVE' ? 'bg-[#1CFE10] animate-pulse' : 'bg-zinc-400'}`} />
              {scheduleData.status} STATUS
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight mt-2">{scheduleData.programName}</h1>
          <p className="text-sm text-zinc-400">Target Channel: <span className="text-[#FFFFFF] font-medium">{scheduleData.channelName}</span></p>
        </div>

        {/* Action Tray */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button 
            onClick={onEdit}
            className="flex-1 sm:flex-initial px-4 h-10 bg-[#010312] hover:bg-[#106EE9]/10 border border-[#106EE9]/40 rounded-lg text-sm font-medium transition-all"
          >
            Modify Window
          </button>
          <button 
            onClick={onForceSkip}
            className="flex-1 sm:flex-initial px-4 h-10 bg-gradient-to-r from-[#106EE9] to-[#400FD3] hover:opacity-90 rounded-lg text-sm font-medium transition-all shadow-md shadow-[#400FD3]/20"
          >
            Force Skip Asset
          </button>
        </div>
      </div>

      {/* 2. TWO-COLUMN TELETRAMRY DISPLAY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT/CENTER: TECHNICAL SPECS (2 Columns wide) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Timeline & Metadata */}
          <div className="bg-[#0B1026] border border-[#106EE9]/15 rounded-xl p-6 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#106EE9]">
              Playout Timeline Configuration
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-4 bg-[#010312] border border-[#106EE9]/10 rounded-lg">
                <span className="text-xs text-zinc-400 block mb-1">Scheduled Start</span>
                <span className="font-mono text-base font-semibold">{new Date(scheduleData.startTime).toLocaleString()}</span>
              </div>
              <div className="p-4 bg-[#010312] border border-[#106EE9]/10 rounded-lg">
                <span className="text-xs text-zinc-400 block mb-1">Scheduled End</span>
                <span className="font-mono text-base font-semibold">{new Date(scheduleData.endTime).toLocaleString()}</span>
              </div>
            </div>

            {/* Custom Live Progress Indicator */}
            {scheduleData.status === 'LIVE' && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-mono text-zinc-400">
                  <span>Elapsed: 42m</span>
                  <span className="text-[#1CFE10]">Progress (46%)</span>
                  <span>Remaining: 48m</span>
                </div>
                <div className="w-full h-2 bg-[#010312] rounded-full overflow-hidden border border-[#106EE9]/10">
                  <div className="h-full bg-gradient-to-r from-[#106EE9] to-[#1CFE10] w-[46%] rounded-full animate-pulse" />
                </div>
              </div>
            )}
          </div>

          {/* Database Relational Integrity Mapping */}
          <div className="bg-[#0B1026] border border-[#106EE9]/15 rounded-xl p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#106EE9] mb-4">
              Relational Database Micro-Keys
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-3 bg-[#010312] rounded-lg border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-500">channel_id:</span>
                <span className="text-white font-bold">{scheduleData.relationalKeys.channelId}</span>
              </div>
              <div className="p-3 bg-[#010312] rounded-lg border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-500">program_id:</span>
                <span className="text-white font-bold">{scheduleData.relationalKeys.programId}</span>
              </div>
              <div className="p-3 bg-[#010312] rounded-lg border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-500">playlist_id:</span>
                <span className="text-white font-bold">{scheduleData.relationalKeys.playlistId}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ASSETS & INFRASTRUCTURE MONITOR */}
        <div className="space-y-6">
          
          {/* Source Asset Panel */}
          <div className="bg-[#0B1026] border border-[#106EE9]/15 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#106EE9]">
              Source Asset Target
            </h3>
            <div className="space-y-1.5">
              <span className="text-xs text-zinc-400 block">Linked Playlist Bundle</span>
              <p className="text-sm font-medium bg-[#010312] p-3 rounded-lg border border-[#106EE9]/10 font-mono break-all">
                {scheduleData.playlistName}
              </p>
            </div>

            {/* Media details micro table */}
            <div className="border-t border-[#106EE9]/10 pt-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Stream Codec:</span>
                <span className="font-mono">{scheduleData.assetMeta.codec}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Target Output:</span>
                <span className="font-mono">{scheduleData.assetMeta.resolution}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Network Bitrate:</span>
                <span className="font-mono text-[#1CFE10]">{scheduleData.assetMeta.bitrate}</span>
              </div>
            </div>
          </div>

          {/* Danger System Fail-safes */}
          <div className="bg-[#0B1026] border border-[#F41010]/20 rounded-xl p-6 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#F41010]">
              Emergency Directives
            </h3>
            <p className="text-xs text-zinc-400">
              Executing these actions forcefully breaks database sync cycles and terminates active output. Use with caution.
            </p>
            <button
              onClick={onEmergencyStop}
              className="w-full h-10 mt-1 bg-[#F41010]/10 hover:bg-[#F41010] text-[#F41010] hover:text-white border border-[#F41010] rounded-lg text-xs font-bold tracking-wide transition-all uppercase"
            >
              Kill Broadcast Signal
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}