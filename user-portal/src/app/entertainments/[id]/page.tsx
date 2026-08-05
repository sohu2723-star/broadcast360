import { notFound } from "next/navigation";

import PlaybackLayout from "@/components/entertainment-playback/PlaybackLayout";

import type { Entertainment } from "@/types/entertainment";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EntertainmentPlaybackPage({ params }: PageProps) {
  const { id } = await params;

  const response = await fetch(
    `http://localhost:3000/api/user-portal/entertainments/${id}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    notFound();
  }

  const data = await response.json();

  console.log("API DATA:", data);

  const entertainment: Entertainment = data.currentItem;

  const playlistItems: Entertainment[] = data.items;

  const relatedEntertainments: Entertainment[] =
    data.relatedEntertainments || [];

  const playlistName = data.playlist?.name || "Playlist";

  return (
    <PlaybackLayout
      entertainment={entertainment}
      playlistItems={playlistItems}
      playlistName={playlistName}
      relatedEntertainments={relatedEntertainments}
    />
  );
}
