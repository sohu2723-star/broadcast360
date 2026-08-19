import { notFound } from "next/navigation";

import { getNews } from "@/services/news.service";

import PlaybackLayout from "@/components/news/NewsPlaybackLayout";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function NewsDetailPage({
  params,
}: Props) {
  const { id } = await params;

  const news = await getNews();

  const newsId = Number(id);

  if (!Number.isInteger(newsId)) {
    notFound();
  }

  const currentNews = news.find(
    (item) => item.id === newsId
  );

  if (!currentNews) {
    notFound();
  }

  const relatedNews = news
    .filter((item) => item.id !== currentNews.id)
    .filter(
      (item) =>
        item.channel?.id === currentNews.channel?.id
    )
    .slice(0, 6);

  return (
    <PlaybackLayout
      news={currentNews}
      relatedNews={relatedNews}
    />
  );
}