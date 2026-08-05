"use client";

import { useState } from "react";

import type { Entertainment } from "@/types/entertainment";

function formatScheduleDate(date?: string | null) {
  if (!date) return "-";

  const d = new Date(date);

  return `${d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
  })} ${d.getFullYear()}, ${d.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })}`;
}
export default function EntertainmentMetadata({
  entertainment,
}: {
  entertainment: Entertainment;
}) {
  console.log("Entertainment Metadata:", entertainment);

  const [showMore, setShowMore] = useState(false);

  const limit = 150;

  const description = entertainment.description || "No description available.";

  const shortDescription =
    description.length > limit
      ? description.slice(0, limit) + "..."
      : description;

  return (
    <div className="w-full">
      {/* Title */}

      <h1 className="text-2xl font-bold text-white">{entertainment.title}</h1>

      {/* Channel */}

      <div className="mt-3 flex items-center gap-3">
        {entertainment.channelLogo && (
          <img
            src={entertainment.channelLogo}
            alt={entertainment.channelName || "Channel"}
            className="h-10 w-10 rounded-full object-cover"
          />
        )}

        <p className="text-base font-bold text-white">
          {entertainment.channelName || "-"}
        </p>
      </div>

      {/* Metadata */}

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-400">
        <span>
          {entertainment.category || "Entertainment"}

          {entertainment.releaseYear && ` (${entertainment.releaseYear})`}
        </span>

        {entertainment.scheduleStart && (
          <>

            <span>{formatScheduleDate(entertainment.scheduleStart)}</span>
          </>
        )}
      </div>

      {/* Description */}

      <div className="mt-2 text-sm leading-6 text-gray-400 break-words">
        <p>
          {showMore ? description : shortDescription}

          {description.length > limit && (
            <button
              onClick={() => setShowMore(!showMore)}
              className="ml-2 text-[#106EE9] hover:underline"
            >
              {showMore ? "Show Less" : "More"}
            </button>
          )}
        </p>
      </div>
    </div>
  );
}
