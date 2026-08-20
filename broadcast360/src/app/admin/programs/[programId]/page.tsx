import ProgramCard from "@/components/admin/programs/ProgramCard";
import PlaylistList from "@/components/admin/playlists/PlaylistList";
import Link from "next/link";
import { fetchProgramDetails } from "@/services/program.service";
import { PlaylistService } from "@/services/playlist.service";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ programId: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { programId } = await params;
  const { page } = await searchParams;

  const id = Number(programId);
  const currentPage = Number(page ?? 1);

  const programData = await fetchProgramDetails(id);
  const playlistData = await PlaylistService.getProgramPlaylists(id, currentPage, 10);

  if (!programData) {
    throw new Error("Program not found");
  }

  return (
    <div className="space-y-6 p-6">
      {/* HEADER ACTIONS */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/programs"
          className="inline-block rounded-lg bg-gray-700 px-4 py-2 text-white"
        >
          Back
        </Link>

        <div className="flex gap-3">
          <Link
            href={`/admin/programs/${programId}/playlists/create`}

            className="mt-5 inline-block rounded-lg bg-[#4f6689] px-5 py-3 text-white"
          >
            + Add Playlist
          </Link>
        </div>
      </div>

      {/* PROGRAM INFO */}
      <ProgramCard program={{ ...programData, channel: programData.channel?.name ?? "Unassigned" }} />

      {/* PLAYLIST SECTION */}
      <div className="rounded-xl border border-white/10 bg-[#0B1026] p-4">
        <h2 className="mb-4 font-semibold text-white">Playlists</h2>

        <PlaylistList
          programId={id}
          playlists={playlistData.playlists}
          page={playlistData.page}
          totalPages={playlistData.totalPages}
        />
      </div>
    </div>
  );
}
