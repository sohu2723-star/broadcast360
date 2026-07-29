"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import type { Entertainment } from "@/types/entertainment";

import VideoPlayer from "./VideoPlayer";
import EntertainmentMetadata from "./EntertainmentMetadata";
import RelatedEntertainments from "./RelatedEntertainments";
import PlaylistParts from "./PlaylistParts";


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
   console.log("playlistName:", playlistName);
  const [currentEntertainment, setCurrentEntertainment] =
    useState(entertainment);


  const leftRef = useRef<HTMLDivElement>(null);
  const playlistContentRef = useRef<HTMLDivElement>(null);


  const [leftHeight, setLeftHeight] = useState(0);
  const [playlistHeight, setPlaylistHeight] = useState(0);



  // Measure left side (Video + Metadata)
  useEffect(() => {

    if (!leftRef.current) return;


    const observer = new ResizeObserver(() => {

      if (leftRef.current) {
        setLeftHeight(
          leftRef.current.offsetHeight
        );
      }

    });


    observer.observe(leftRef.current);


    return () => observer.disconnect();


  }, []);



  // Measure playlist content
  useEffect(() => {

    if (!playlistContentRef.current) return;


    const observer = new ResizeObserver(() => {

      if (playlistContentRef.current) {

        setPlaylistHeight(
          playlistContentRef.current.offsetHeight
        );

      }

    });


    observer.observe(playlistContentRef.current);


    return () => observer.disconnect();


  }, [playlistItems]);



  const needScroll =
    playlistHeight > leftHeight;



  const playlistBoxHeight =
    needScroll
      ? leftHeight
      : "auto";



  return (
    <main className="min-h-screen bg-[#010312] text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <Link
          href="/entertainments"
          className="mb-5 inline-flex rounded-full border border-[#106EE9]/30 bg-[#0B1026] px-4 py-2 text-sm"
        >
          ← Back to Entertainments
        </Link>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[2fr_1fr]">
          {/* LEFT */}

          <div
            ref={leftRef}
            className="
              overflow-hidden
              rounded-xl
              border
              border-[#106EE9]/20
              bg-[#0B1026]
              p-4
            "
          >
            <VideoPlayer entertainment={currentEntertainment} />

            <div
              className="
                mt-5
                border-t
                border-white/10
                pt-5
              "
            >
              <EntertainmentMetadata entertainment={currentEntertainment} />
            </div>
          </div>

          {/* PLAYLIST */}

          <div
            style={{
              height: playlistBoxHeight,
            }}
            className="
              flex
              flex-col
              overflow-hidden
              rounded-xl
              border
              border-[#106EE9]/20
              bg-[#0B1026]
              p-4
            "
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
          </div>
        </div>

        <RelatedEntertainments entertainments={relatedEntertainments} />
      </div>
    </main>
  );
}