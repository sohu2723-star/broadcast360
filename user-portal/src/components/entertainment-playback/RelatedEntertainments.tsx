"use client";

import Link from "next/link";
import Image from "next/image";

import type { Entertainment } from "@/types/entertainment";


function formatDuration(seconds:number){

  if(!seconds || seconds <= 0)
    return "-";


  const minutes =
    Math.floor(seconds / 60);

  const sec =
    seconds % 60;


  return `${minutes}m ${sec}s`;
}




export default function RelatedEntertainments({
  entertainments,
}:{
  entertainments: Entertainment[];
}){


  const related =
    Array.from(
      new Map(
        entertainments.map(
          (item)=>[
            item.id,
            item
          ]
        )
      ).values()
    );



  if(!related.length){

    return (

      <div className="rounded-xl border border-[#106EE9]/20 bg-[#0B1026] p-3 text-center text-xs text-gray-400">

        No related entertainments found.

      </div>

    );

  }



  return (

    <div className="space-y-2">


      {related.map((item)=>(
        

        <Link

          key={item.id}

          href={`/entertainments/${item.entertainmentKey}`}

          className="group flex h-[72px] gap-2 rounded-lg border border-white/10 bg-[#010312] p-2 hover:border-[#106EE9]"

        >


          <div className="relative h-14 w-20 overflow-hidden rounded-md bg-black">


            {item.thumbnail ? (

              <Image

                src={item.thumbnail}

                alt={item.title}

                fill

                className="object-cover"

                unoptimized

              />

            ):(
              <div className="flex h-full items-center justify-center text-xs text-gray-500">

                🎬

              </div>
            )}


          </div>




          <div className="min-w-0 flex-1">


            <h3 className="truncate text-xs font-bold">

              {item.title}

            </h3>



            <p className="text-[10px] text-gray-400">

              🎭 {item.category || "Entertainment"}

            </p>



            <p className="text-[10px] text-gray-500">

              ⏱ {formatDuration(item.duration)}

            </p>


          </div>


        </Link>


      ))}


    </div>

  );
}