import ProgramCard from "@/components/admin/programs/ProgramCard";
import PlaylistList from "@/components/admin/playlists/PlaylistList";
import Link from "next/link";

async function getProgram(id: number) {
  const res = await fetch(
    `http://localhost:3000/api/programs/${id}`,
    { cache: "no-store" }
  );

  return res.json();
}

async function getPlaylists(id: number, page: number) {
  const res = await fetch(
    `http://localhost:3000/api/programs/${id}/playlists?page=${page}`,
    { cache: "no-store" }
  );

  return res.json();
}

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

  const programData = await getProgram(id);
  const playlistData = await getPlaylists(id, currentPage);

  return (
    <div className="p-6 space-y-6">
      
      {/* HEADER ACTIONS */}
      <div className="flex justify-between items-center">
        <Link
          href="/admin/programs"
          className="px-4 py-2 bg-gray-700 rounded-lg text-white inline-block"
        >
          Back
        </Link>

        <div className="flex gap-3">

          <Link

            href={
            `/admin/programs/${programId}/playlists/create`
            }

            className="
            inline-block
            mt-5
            bg-[#106EE9]
            text-white
            px-5
            py-3
            rounded-lg
            "
            >

            + Add Playlist

            </Link>



        </div>
      </div>

      {/* PROGRAM INFO */}
      <ProgramCard program={programData.data} />

      {/* PLAYLIST SECTION */}
      <div className="bg-[#0B1026] border border-white/10 rounded-xl p-4">
        <h2 className="text-white font-semibold mb-4">
          Playlists
        </h2>

        <PlaylistList
          programId={id}
          playlists={playlistData.data.playlists}
          page={playlistData.data.page}
          totalPages={playlistData.data.totalPages}
        />
      </div>
    </div>
  );
}