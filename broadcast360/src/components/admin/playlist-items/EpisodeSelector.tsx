"use client";

import { useEffect, useState } from "react";

interface Episode {
  id: number;
  title: string;
  episodeNo: number;
}

interface Props {
  seriesId: number | null;
  value: number | null;
  onSelect: (id: number) => void;
}

export default function EpisodeSelector({
  seriesId,
  value,
  onSelect,
}: Props) {

  const [episodes, setEpisodes] = useState<Episode[]>([]);


  useEffect(()=>{

 async function loadEpisodes(){

   if(!seriesId){
      return;
   }


   const res = await fetch(
     `/api/episodes?seriesId=${seriesId}`
   );


   const json = await res.json();


   setEpisodes(json.data ?? []);

 }


 loadEpisodes();


},[seriesId]);



  return (

    <div>

      <label className="block text-white mb-2">
        Select Episode
      </label>


      <select

        value={value ?? ""}

        onChange={(e)=>
          onSelect(Number(e.target.value))
        }

        className="
          w-full
          bg-[#0B1026]
          text-white
          border
          border-gray-700
          rounded-lg
          p-3
        "

      >

        <option value="">
          Choose Episode
        </option>


        {episodes.map((episode)=>(

          <option
            key={episode.id}
            value={episode.id}
          >

            Episode {episode.episodeNo} - {episode.title}

          </option>

        ))}


      </select>


    </div>

  );
}