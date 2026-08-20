"use client";

import { useEffect, useState } from "react";
import { Film, Flame } from "lucide-react";

import type { Entertainment } from "@/types/entertainment";
import type { Channel } from "@/types/channel";

import { getEntertainments } from "@/services/entertainment.service";

import { channelService } from "@/services/channel.service";

import EntertainmentSearch from "./EntertainmentSearch";

import ChannelFilter from "./ChannelFilter";

import HotEntertainmentSection from "./HotEntertainmentSection";

import EntertainmentGrid from "./EntertainmentGrid";

export default function EntertainmentPage() {
  const [entertainments, setEntertainments] = useState<Entertainment[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [selectedChannel, setSelectedChannel] = useState("");

  const [channels, setChannels] = useState<Channel[]>([]);

  const [currentPage, setCurrentPage] = useState(1);

  const entertainmentsPerPage = 10;

  useEffect(() => {
    async function loadData() {
      try {
        const [entertainmentData, channelData] = await Promise.all([
          getEntertainments(),
          channelService.getAllChannels(),
        ]);

        console.log("PAGE DATA:", entertainmentData);

        console.log("CHANNEL DATA:", channelData);

        setEntertainments(entertainmentData);

        setChannels(channelData);
      } catch (error) {
        console.error("Failed loading entertainments:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredEntertainments = entertainments.filter((item) => {
    const keyword = search.toLowerCase();

    const matchSearch =
      item.title.toLowerCase().includes(keyword) ||
      item.category?.toLowerCase().includes(keyword);

    const matchChannel =
      selectedChannel === "" || item.channelId?.toString() === selectedChannel;

    return matchSearch && matchChannel;
  });

  const hotEntertainments = [...filteredEntertainments]
    .sort(() => Math.random() - 0.5)
    .slice(0, 8);

  const totalPages = Math.ceil(
    filteredEntertainments.length / entertainmentsPerPage,
  );

  const paginatedEntertainments = filteredEntertainments.slice(
    (currentPage - 1) * entertainmentsPerPage,

    currentPage * entertainmentsPerPage,
  );

 return (
  <main className="min-h-screen bg-black px-6 py-10 text-white">
    <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-4xl font-bold">ENTERTAINMENTS</h1>

        <div className="mb-8 flex gap-4">
          <EntertainmentSearch
            value={search}
            onChange={(value) => {
              setSearch(value);
              setCurrentPage(1);
            }}
          />

          <ChannelFilter
            value={selectedChannel}
            channels={channels}
            onChange={(value) => {
              setSelectedChannel(value);
              setCurrentPage(1);
            }}
          />
        </div>

        <section className="mb-16">
          {loading ? (
            <div>Loading entertainments...</div>
          ) : filteredEntertainments.length === 0 ? (
            <div>No entertainments found.</div>
          ) : (
            <EntertainmentGrid
              title={<span className="inline-flex items-center gap-2"><Flame size={18} strokeWidth={1.8} className="text-[#d7b36a]" aria-hidden="true" />HOT ENTERTAINMENTS</span>}
              entertainments={hotEntertainments}
              horizontal
            />
          )}
        </section>

        <section>
          <h2 className="mb-8 text-2xl font-bold">
             <span className="inline-flex items-center gap-2"><Film size={22} strokeWidth={1.8} className="text-[#7898bf]" aria-hidden="true" />ALL ENTERTAINMENTS ARCHIVE</span>
          </h2>

          <EntertainmentGrid entertainments={paginatedEntertainments} />

          <div className="mt-12 flex justify-center gap-5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="rounded-lg bg-[#0B1026] px-5 py-2"
            >
              Previous
            </button>

            <span>
              Page {currentPage} / {totalPages || 1}
            </span>

            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="rounded-lg bg-[#106EE9] px-5 py-2"
            >
              Next
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
