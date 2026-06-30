"use client";

import { useEffect, useState } from "react";

type Episode = {
  id: number;
  title: string;
  episodeNo: number;
  videoUrl: string | null;
};

export default function EpisodePlaybackPage({
  params,
}: {
  params: Promise<{
    id: string;
    episodeId: string;
  }>;
}) {
  const [episode, setEpisode] =
    useState<Episode | null>(null);

  useEffect(() => {
    async function loadEpisode() {
      const { episodeId } = await params;

      const res = await fetch(
        `/api/episodes/${episodeId}`
      );

      const data = await res.json();

      setEpisode(data);
    }

    loadEpisode();
  }, [params]);

  if (!episode) {
    return (
      <div className="p-6 text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Episode {episode.episodeNo}
      </h1>

      <h2 className="mb-6">
        {episode.title}
      </h2>

      <video
        controls
        autoPlay
        className="w-full rounded-xl"
      >
        <source
          src={episode.videoUrl || ""}
          type="video/mp4"
        />
      </video>
    </div>
  );
}