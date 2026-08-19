import { notFound } from "next/navigation";
import { apiUrl } from "@/lib/api-url";

import PlaybackLayout from "@/components/entertainment-playback/PlaybackLayout";

import type { Entertainment } from "@/types/entertainment";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EntertainmentPlaybackPage({
  params,
}: PageProps) {
  const { id } = await params;

  const response = await fetch(
    apiUrl(`/api/user-portal/entertainments/${id}`),
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    notFound();
  }

  const data = await response.json();

  console.log("ENTERTAINMENT API DATA:", data);

  // -----------------------------------------
  // CURRENT ENTERTAINMENT
  // -----------------------------------------

  if (!data?.currentItem) {
    console.error(
      "Entertainment currentItem is missing:",
      data
    );

    notFound();
  }

  const entertainment: Entertainment =
    data.currentItem;

  // -----------------------------------------
  // PLAYLIST
  // -----------------------------------------

  const playlistItems: Entertainment[] =
    Array.isArray(data.items)
      ? data.items
      : [];

  // -----------------------------------------
  // RELATED
  // -----------------------------------------

  const relatedEntertainments: Entertainment[] =
    Array.isArray(data.relatedEntertainments)
      ? data.relatedEntertainments
      : [];

  // -----------------------------------------
  // PLAYLIST NAME
  // -----------------------------------------

  const playlistName =
    data.playlist?.name ?? "Playlist";

  return (
    <PlaybackLayout
      entertainment={entertainment}
      playlistItems={playlistItems}
      playlistName={playlistName}
      relatedEntertainments={relatedEntertainments}
    />
  );
}