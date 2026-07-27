import { notFound } from "next/navigation";

import PlaybackLayout from "@/components/entertainment-playback/PlaybackLayout";
import { getEntertainments } from "@/services/entertainment.service";

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

  const entertainments: Entertainment[] =
    await getEntertainments();

  // Find exact entertainment by entertainmentKey
  const entertainment = entertainments.find(
    (item) => item.entertainmentKey === id,
  );

  if (!entertainment) {
    notFound();
  }

  // Same category related entertainments
  const relatedEntertainments =
    entertainments.filter(
      (item) =>
        item.entertainmentKey !==
          entertainment.entertainmentKey &&
        item.category ===
          entertainment.category,
    );

  return (
    <PlaybackLayout
      entertainment={entertainment}
      relatedEntertainments={
        relatedEntertainments
      }
    />
  );
}