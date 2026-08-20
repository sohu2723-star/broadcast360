"use client";

import { ProgramDetailsType, ProgramPlaylist } from "@/types/program";
import { useRouter } from "next/navigation";

type Props = {
  program: ProgramDetailsType;
};

export default function ProgramDetails({ program }: Props) {
  const router = useRouter();

  return (
    <div className="space-y-8">
      <div className="rounded-xl bg-[#0B1026] p-8">
        <h1 className="mb-5 text-3xl font-bold">{program.title}</h1>

        <p>
          <b>Channel:</b> {program.channel}
        </p>

        <p>
          <b>Type:</b> {program.type}
        </p>

        <p>
          <b>Description:</b> {program.description}
        </p>

        <p>
          <b>Created:</b> {new Date(program.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Playlists</h2>

        <button
          onClick={() =>
            router.push(`/admin/programs/${program.id}/playlists/create`)
          }
          className="rounded-xl bg-[#4f6689] px-5 py-3"
        >
          + Create Playlist
        </button>
      </div>

      <div className="rounded-xl bg-[#0B1026] p-5">
        {program.playlists.length === 0 && (
          <p className="text-gray-400">No playlists found</p>
        )}

        {program.playlists.map((playlist: ProgramPlaylist) => (
          <div
            key={playlist.id}
            className="flex justify-between border-b border-white/10 py-4"
          >
            <div>
              <h3 className="font-bold">{playlist.name}</h3>

              <p className="text-gray-400">
                {new Date(playlist.createdAt).toLocaleDateString()}
              </p>
            </div>

            <button
              onClick={() => router.push(`/admin/playlists/${playlist.id}`)}

              className="rounded bg-gray-700 px-4 py-2"
            >
              View
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
