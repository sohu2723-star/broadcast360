"use client";

import { useEffect, useRef, useState } from "react";

import type { Entertainment } from "@/types/entertainment";

import VideoPlayer from "./VideoPlayer";
import EntertainmentMetadata from "./EntertainmentMetadata";
import RelatedEntertainments from "./RelatedEntertainments";
import PlaylistParts from "./PlaylistParts";
import BackButton from "@/components/common/BackButton";

interface Props {
  entertainment: Entertainment;
  playlistItems: Entertainment[];
  playlistName: string;
  relatedEntertainments: Entertainment[];
}

export default function PlaybackLayout({
  entertainment,
  playlistItems,
  playlistName,
  relatedEntertainments,
}: Props) {
  const [currentEntertainment, setCurrentEntertainment] =
    useState<Entertainment>(entertainment);

  const leftRef = useRef<HTMLDivElement>(null);
  const playlistContentRef = useRef<HTMLDivElement>(null);

  const [leftHeight, setLeftHeight] = useState(0);
  const [playlistHeight, setPlaylistHeight] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // =====================================
  // UPDATE CURRENT ENTERTAINMENT
  // =====================================

  useEffect(() => {
    setCurrentEntertainment(entertainment);
  }, [entertainment]);

  // =====================================
  // MEASURE LEFT SIDE
  // =====================================

  useEffect(() => {
    if (!leftRef.current) return;

    const element = leftRef.current;

    const updateHeight = () => {
      setLeftHeight(element.offsetHeight);
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);

    observer.observe(element);

    return () => observer.disconnect();
  }, [currentEntertainment]);

  // =====================================
  // MEASURE PLAYLIST
  // =====================================

  useEffect(() => {
    if (!playlistContentRef.current) return;

    const element = playlistContentRef.current;

    const updateHeight = () => {
      setPlaylistHeight(element.offsetHeight);
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);

    observer.observe(element);

    return () => observer.disconnect();
  }, [playlistItems]);

  // =====================================
  // PLAYLIST SCROLL
  // =====================================

  const needScroll =
    mounted && playlistHeight > leftHeight;

  const playlistBoxHeight =
    needScroll ? leftHeight : "auto";

  return (
    <main className="min-h-screen bg-[#010312] text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <BackButton />

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[2fr_1fr]">
          {/* ============================
              VIDEO + METADATA
          ============================ */}

          <section
            ref={leftRef}
            className="overflow-hidden rounded-xl border border-[#106EE9]/20 bg-[#0B1026] p-4"
          >
            <VideoPlayer
              entertainment={currentEntertainment}
            />

            <div className="mt-5 border-t border-white/10 pt-5">
              <EntertainmentMetadata
                entertainment={currentEntertainment}
              />
            </div>
          </section>

          {/* ============================
              PLAYLIST
          ============================ */}

          <aside
            style={{
              height: playlistBoxHeight,
            }}
            className="flex flex-col overflow-hidden rounded-xl border border-[#106EE9]/20 bg-[#0B1026] p-4"
          >
            <div
              className={
                needScroll
                  ? "min-h-0 flex-1 overflow-y-auto playlist-scroll"
                  : ""
              }
            >
              <div ref={playlistContentRef}>
                <PlaylistParts
                  entertainments={playlistItems}
                  playlistName={playlistName}
                  selectedId={currentEntertainment.id}
                  onSelect={setCurrentEntertainment}
                />
              </div>
            </div>
          </aside>
        </div>

        {/* ============================
            RELATED ENTERTAINMENTS
        ============================ */}

        <section className="mt-12">
          <RelatedEntertainments
            entertainments={relatedEntertainments}
          />
        </section>
      </div>
    </main>
  );
}