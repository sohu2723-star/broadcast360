import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from 'wouter';
import { CalendarDays, ChevronLeft, ChevronRight, Film, Timer } from "lucide-react";
import { useParams } from 'wouter';

// =====================================================
// TYPES
// =====================================================

type Episode = {
  id: number;
  title: string;
  episodeNo: number;
  videoUrl: string;
  thumbnailUrl: string | null;
  createdAt: string;
};

type Series = {
  id: number;
  title: string;
  episodes: Episode[];
};

// =====================================================
// GET PART NUMBER FROM TITLE
// =====================================================

function getPartNumber(title: string): number {
  const match = title.match(
    /-\s*Part\s+(\d+)\s*$/i,
  );

  if (!match) {
    return 0;
  }

  const part = Number(match[1]);

  if (
    !Number.isInteger(part) ||
    part < 1
  ) {
    return 0;
  }

  return part;
}

// =====================================================
// SORT EPISODES
// =====================================================

function sortEpisodes(
  episodes: Episode[],
): Episode[] {
  return [...episodes].sort((a, b) => {
    // 1. Episode Number
    if (a.episodeNo !== b.episodeNo) {
      return a.episodeNo - b.episodeNo;
    }

    // 2. Part Number
    const partA = getPartNumber(a.title);
    const partB = getPartNumber(b.title);

    if (partA !== partB) {
      return partA - partB;
    }

    // 3. Created Date
    const createdA = new Date(
      a.createdAt,
    ).getTime();

    const createdB = new Date(
      b.createdAt,
    ).getTime();

    if (createdA !== createdB) {
      return createdA - createdB;
    }

    // 4. ID
    return a.id - b.id;
  });
}

// =====================================================
// FORMAT DURATION
// =====================================================

function formatDuration(
  seconds: number,
): string {
  const hrs = Math.floor(
    seconds / 3600,
  );

  const mins = Math.floor(
    (seconds % 3600) / 60,
  );

  const secs = Math.floor(
    seconds % 60,
  );

  const hh = String(hrs).padStart(
    2,
    "0",
  );

  const mm = String(mins).padStart(
    2,
    "0",
  );

  const ss = String(secs).padStart(
    2,
    "0",
  );

  return `${hh}:${mm}:${ss}`;
}

// =====================================================
// PAGE
// =====================================================

export default function EpisodePlayerPage() {
  const params = useParams();

  const seriesId =
    params?.id as string;

  const episodeId =
    params?.episodeId as string;

  // ===================================================
  // STATE
  // ===================================================

  const [series, setSeries] =
    useState<Series | null>(null);

  const [episode, setEpisode] =
    useState<Episode | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [duration, setDuration] =
    useState("");

  // ===================================================
  // LOAD DATA
  // ===================================================

  useEffect(() => {
    if (
      !seriesId ||
      !episodeId
    ) {
      return;
    }

    let cancelled = false;

    async function loadData() {
      try {
        const res = await fetch(
          `/api/series/${seriesId}`,
        );

        if (!res.ok) {
          throw new Error(
            "Failed to fetch series",
          );
        }

        const data =
          await res.json();

        const foundSeries =
          data.data;

        if (!foundSeries) {
          throw new Error(
            "Series not found",
          );
        }

        const sortedEpisodes =
          sortEpisodes(
            foundSeries.episodes ?? [],
          );

        const sortedSeries: Series = {
          ...foundSeries,
          episodes:
            sortedEpisodes,
        };

        const foundEpisode =
          sortedEpisodes.find(
            (ep: Episode) =>
              Number(ep.id) ===
              Number(episodeId),
          );

        if (cancelled) {
          return;
        }

        setSeries(sortedSeries);

        setEpisode(
          foundEpisode ?? null,
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(error);

        setSeries(null);
        setEpisode(null);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [
    seriesId,
    episodeId,
  ]);

  // ===================================================
  // SORTED EPISODES
  // ===================================================

  const sortedEpisodes =
    useMemo(() => {
      return sortEpisodes(
        series?.episodes ?? [],
      );
    }, [series]);

  // ===================================================
  // CURRENT INDEX
  // ===================================================

  const currentIndex =
    sortedEpisodes.findIndex(
      (ep) =>
        ep.id === episode?.id,
    );

  // ===================================================
  // PREVIOUS EPISODE
  // ===================================================

  const previousEpisode =
    currentIndex > 0
      ? sortedEpisodes[
          currentIndex - 1
        ]
      : null;

  // ===================================================
  // NEXT EPISODE
  // ===================================================

  const nextEpisode =
    currentIndex >= 0 &&
    currentIndex <
      sortedEpisodes.length - 1
      ? sortedEpisodes[
          currentIndex + 1
        ]
      : null;

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <div className="text-white p-6">
        Loading...
      </div>
    );
  }

  // ===================================================
  // NOT FOUND
  // ===================================================

  if (
    !series ||
    !episode
  ) {
    return (
      <div className="text-white p-6">
        Episode not found
      </div>
    );
  }

  // ===================================================
  // UI
  // ===================================================

  return (
    <div className="flex h-screen overflow-hidden bg-black text-white">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <div className="w-80 bg-[#0B1026] border-r border-white/10 flex flex-col h-screen min-h-0">

        {/* HEADER */}

        <div className="p-4 shrink-0">
          <h2 className="text-xl font-bold mt-4 mb-4">
            {series.title}
          </h2>
        </div>

        {/* EPISODE LIST */}

        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 custom-scrollbar">

          <div className="space-y-2">

            {sortedEpisodes.map(
              (ep) => (
                <Link
                  key={ep.id}
                  href={`/admin/series/${series.id}/episodes/${ep.id}`}
                  className={`block p-3 rounded-lg ${
                    ep.id === episode.id
                      ? "bg-[#4f6689]"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  {/* EPISODE NUMBER */}

                  <div className="font-semibold">
                    EP{" "}
                    {ep.episodeNo}
                  </div>

                  {/* EPISODE TITLE */}

                  <div className="text-sm text-gray-300">
                    {ep.title}
                  </div>
                </Link>
              ),
            )}

          </div>

        </div>

      </div>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <div className="flex-1 flex flex-col min-h-0">

        {/* =================================================
            TOP BAR
        ================================================= */}

        <div className="h-16 border-b border-white/10 bg-[#0B1026] flex items-center justify-between px-6 shrink-0">

          <h1 className="font-bold">
            {series.title}
          </h1>

          <Link
            href={`/admin/series/${series.id}`}
            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
          >
            Back
          </Link>

        </div>

        {/* =================================================
            PLAYER
        ================================================= */}

        <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">

          <div className="max-w-6xl mx-auto w-full">

            {/* VIDEO */}

            <div className="w-full overflow-hidden rounded-xl bg-black">

              <video
                src={episode.videoUrl}
                controls
                autoPlay
                controlsList="nodownload noremoteplayback"
                disablePictureInPicture
                playsInline
                className="block w-full max-h-[55vh] rounded-xl bg-black"
                onContextMenu={(event) => {
                  event.preventDefault();
                }}
                onLoadedMetadata={(event) => {
                  const totalSeconds =
                    Math.floor(
                      event.currentTarget
                        .duration,
                    );

                  setDuration(
                    formatDuration(
                      totalSeconds,
                    ),
                  );
                }}
              />

            </div>

            {/* =================================================
                EPISODE INFORMATION
            ================================================= */}

            <div className="mt-6">

              {/* SERIES */}

              <p className="text-blue-400 text-sm">
                {series.title}
              </p>

              {/* TITLE */}

              <h2 className="text-3xl font-bold mt-1">
                Episode{" "}
                {episode.episodeNo}:{" "}
                {episode.title}
              </h2>

              {/* =================================================
                  DETAILS
              ================================================= */}

              <div className="flex items-center gap-6 mt-4 text-gray-300">

                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1">
                  <Film size={13} strokeWidth={1.8} aria-hidden="true" />
                  Ep{" "}
                  {episode.episodeNo}
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1">
                  <Timer size={13} strokeWidth={1.8} aria-hidden="true" />
                  {duration ||
                    "Loading..."}
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1">
                  <CalendarDays size={13} strokeWidth={1.8} aria-hidden="true" />
                  {new Date(
                    episode.createdAt,
                  ).toLocaleDateString()}
                </span>

              </div>

              {/* =================================================
                  NAVIGATION
              ================================================= */}

              <div className="flex justify-between pt-6 pb-6">

                {/* PREVIOUS */}

                {previousEpisode ? (
                  <Link
                    href={`/admin/series/${series.id}/episodes/${previousEpisode.id}`}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10"
                  >
                    <span className="inline-flex items-center gap-1.5"><ChevronLeft size={16} aria-hidden="true" />Previous Episode</span>
                  </Link>
                ) : (
                  <div />
                )}

                {/* NEXT */}

                {nextEpisode ? (
                  <Link
                    href={`/admin/series/${series.id}/episodes/${nextEpisode.id}`}
                    className="px-4 py-2 bg-[#4f6689] rounded-lg hover:bg-[#7898bf]/30"
                  >
                    <span className="inline-flex items-center gap-1.5">Next Episode<ChevronRight size={16} aria-hidden="true" /></span>
                  </Link>
                ) : (
                  <div />
                )}

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}