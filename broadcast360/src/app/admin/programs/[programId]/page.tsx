import ProgramCard from "@/components/admin/programs/ProgramCard";
import PlaylistList from "@/components/admin/playlists/PlaylistList";
import Link from "next/link";

async function getProgram(id: number) {
  const res = await fetch(`http://localhost:3000/api/programs/${id}`, {
    cache: "no-store",
  });

  return res.json();
}

async function getPlaylists(id: number, page: number) {
  const res = await fetch(
    `http://localhost:3000/api/programs/${id}/playlists?page=${page}`,
    { cache: "no-store" },
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
  console.log("PAGE PLAYLIST DATA:", playlistData);

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

            className="mt-5 inline-block rounded-lg bg-[#106EE9] px-5 py-3 text-white"
          >
            + Add Playlist
          </Link>
        </div>
      </div>

      {/* PROGRAM INFO */}
      <ProgramCard program={programData.data} />

      {/* PLAYLIST SECTION */}
      <div className="rounded-xl border border-white/10 bg-[#0B1026] p-4">
        <h2 className="mb-4 font-semibold text-white">Playlists</h2>

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
