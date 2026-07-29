"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";

import type { Entertainment } from "@/types/entertainment";


interface Props {
  entertainments: Entertainment[];
}


export default function RelatedEntertainments({
  entertainments,
}: Props) {


  const scrollRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);

  const startX = useRef(0);

  const scrollLeft = useRef(0);



  if (!entertainments.length) return null;



  const handleScroll = (
    direction: "left" | "right"
  ) => {

    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left: direction === "left" ? -500 : 500,
      behavior: "smooth",
    });

  };



  const handleMouseDown = (
    e: React.MouseEvent<HTMLDivElement>
  ) => {

    if (!scrollRef.current) return;

    setIsDragging(true);

    startX.current =
      e.pageX - scrollRef.current.offsetLeft;

    scrollLeft.current =
      scrollRef.current.scrollLeft;

  };



  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement>
  ) => {

    if (!isDragging || !scrollRef.current)
      return;


    e.preventDefault();


    const x =
      e.pageX - scrollRef.current.offsetLeft;


    const walk =
      (x - startX.current) * 1.5;


    scrollRef.current.scrollLeft =
      scrollLeft.current - walk;

  };



  const stopDragging = () => {
    setIsDragging(false);
  };



  return (

    <section className="relative mt-12">

      <h2 className="mb-6 text-2xl font-bold text-white">
        You may also like this
      </h2>


      <button
        onClick={() => handleScroll("left")}
        className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/70 p-2 text-white transition hover:bg-black"
      >
        <ChevronLeft size={30}/>
      </button>



      <button
        onClick={() => handleScroll("right")}
        className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/70 p-2 text-white transition hover:bg-black"
      >
        <ChevronRight size={30}/>
      </button>




      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
        className={`flex gap-6 overflow-x-auto scroll-smooth px-10 select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      >


        {entertainments.map((item) => (

          <Link
            key={item.id}
            href={`/entertainments/${item.id}`}
            className="group w-[260px] shrink-0 overflow-hidden rounded-2xl bg-zinc-900 transition hover:scale-[1.03]"
          >


            <div className="relative aspect-[2/3]">


              <img
                src={item.thumbnail || "/images/no-image.png"}
                alt={item.title}
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />



              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"/>



              <div className="absolute bottom-0 left-0 right-0 p-5">


                <h3 className="line-clamp-2 text-xl font-bold text-white">
                  {item.title}
                </h3>


                <p className="mt-3 text-sm text-gray-300">
                  {item.category || "Entertainment"}
                </p>


                <p className="text-sm text-gray-400">
                  {item.releaseYear ?? "-"}
                </p>


              </div>


            </div>


          </Link>

        ))}


      </div>


    </section>

  );

}