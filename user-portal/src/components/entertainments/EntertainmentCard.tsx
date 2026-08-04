import Link from "next/link";
import Image from "next/image";

import type { Entertainment } from "@/types/entertainment";


interface Props {
  entertainment: Entertainment;
}


function formatDuration(seconds:number){

  if(!seconds || seconds <=0)
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



export default function EntertainmentCard({
  entertainment,
}:Props){

return (

<Link
  href={`/entertainments/${entertainment.playlistId}`}
  className="group relative block h-[380px] w-[250px] flex-shrink-0 overflow-hidden rounded-xl bg-zinc-900"
>


<Image

src={
entertainment.thumbnail ||
"/images/no-image.png"
}

alt={entertainment.title}

fill

className="object-cover transition duration-300 group-hover:scale-110"

unoptimized

/>


<div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />



<div className="absolute bottom-0 left-0 right-0 p-5 text-white">


<h3 className="mb-2 line-clamp-1 text-lg font-bold">
  {entertainment.title}
</h3>

<p className="mb-2 line-clamp-1 text-sm text-gray-300">
  {entertainment.channelName}
</p>

<div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
  <span>{entertainment.category || "Entertainment"}</span>

  <span>•</span>

  <span>{entertainment.releaseYear ?? "-"}</span>

  
</div>



</div>


</Link>

);

}