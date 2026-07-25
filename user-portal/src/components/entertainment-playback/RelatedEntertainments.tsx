"use client";

import Image from "next/image";
import Link from "next/link";

import type { Entertainment } from "@/types/entertainment";


interface Props {
  entertainments: Entertainment[];
}


export default function RelatedEntertainments({
  entertainments,
}: Props) {


  if (!entertainments.length) return null;


  return (

    <section className="mt-12">

      <h2 className="mb-6 text-2xl font-bold text-white">
        You may also like this
      </h2>


      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">


        {entertainments.map((item) => (

          <Link
            key={item.id}
            href={`/entertainments/${item.id}`}
            className="group overflow-hidden rounded-2xl bg-zinc-900"
          >

            <div className="relative aspect-[2/3]">


              <Image

                src={
                  item.thumbnail ||
                  "/images/no-image.png"
                }

                alt={item.title}

                fill

                unoptimized

                className="object-cover transition duration-500 group-hover:scale-105"

              />


              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />


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