"use client";

import { useState } from "react";

import type { Entertainment } from "@/types/entertainment";


function formatDuration(seconds:number){

  if(!seconds || seconds <= 0)
    return "-";


  const hours = Math.floor(seconds / 3600);

  const minutes = Math.floor(
    (seconds % 3600) / 60
  );

  const sec = seconds % 60;


  if(hours > 0){
    return `${hours}h ${minutes}m ${sec}s`;
  }


  if(minutes > 0){
    return `${minutes}m ${sec}s`;
  }


  return `${sec}s`;
}




export default function EntertainmentMetadata({
  entertainment,
}:{
  entertainment: Entertainment;
}){


  const [showMore,setShowMore] =
    useState(false);


  const limit = 50;


  const description =
    entertainment.description ||
    "No description available.";


  const shortDescription =
    description.length > limit
    ? description.slice(0,limit) + "..."
    : description;



  return (

    <div className="w-full">


      <div className="flex flex-wrap items-center gap-3">


        <h1 className="text-2xl font-bold text-white">

          {entertainment.title}

        </h1>



        <span className="rounded-full bg-[#106EE9] px-3 py-1 text-xs text-white">

          🎭 {entertainment.category || "Entertainment"}

        </span>



        <span className="rounded-full border border-[#106EE9]/30 bg-[#010312] px-3 py-1 text-xs text-gray-300">

          📅 {entertainment.releaseYear || "-"}

        </span>



        <span className="rounded-full border border-[#106EE9]/30 bg-[#010312] px-3 py-1 text-xs text-gray-300">

          ⏱ {formatDuration(entertainment.duration)}

        </span>


      </div>




      <div className="mt-4 text-sm leading-6 text-gray-400 break-words">


        <p>


          {showMore
            ? description
            : shortDescription}



          {description.length > limit && (

            <button

              onClick={() =>
                setShowMore(!showMore)
              }

              className="ml-2 text-[#106EE9] hover:underline"

            >

              {showMore
                ? "Show Less"
                : "More"}

            </button>

          )}


        </p>


      </div>


    </div>

  );
}