"use client";

import Link from "next/link";

import type { Entertainment } from "@/types/entertainment";

import VideoPlayer from "./VideoPlayer";
import EntertainmentMetadata from "./EntertainmentMetadata";
import RelatedEntertainments from "./RelatedEntertainments";


interface Props {
  entertainment: Entertainment;
  relatedEntertainments: Entertainment[];
}


export default function PlaybackLayout({
  entertainment,
  relatedEntertainments,
}: Props) {

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


          {/* LEFT VIDEO */}

          <div className="overflow-hidden rounded-xl border border-[#106EE9]/20 bg-[#0B1026] p-4">


            <VideoPlayer
              entertainment={entertainment}
            />


            <div className="mt-5 border-t border-white/10 pt-5">

              <EntertainmentMetadata
                entertainment={entertainment}
              />

            </div>


          </div>



          {/* RIGHT RELATED */}

          <div className="rounded-xl border border-[#106EE9]/20 bg-[#0B1026] p-4">


            <h2 className="mb-4 text-lg font-bold">
              👀 Related Entertainments
            </h2>


            <RelatedEntertainments
              entertainments={relatedEntertainments}
            />


          </div>


        </div>


      </div>


    </main>
  );
}