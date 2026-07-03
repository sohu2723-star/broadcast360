import Link from "next/link";

interface Props {
  channelName: string;
  programName: string;
  playlistName: string;
  duration: number | null;

  programId: number;
  playlistId: number;
}


function formatDuration(seconds:number | null){

  if(!seconds) return "00:00:00";

  const h = Math.floor(seconds / 3600);

  const m = Math.floor(
    (seconds % 3600) / 60
  );

  const s = seconds % 60;


  return [
    h,
    m,
    s
  ]
  .map(v => String(v).padStart(2,"0"))
  .join(":");

}



export default function PlaylistInfoCard({

  channelName,
  programName,
  playlistName,
  duration,
  programId,
  playlistId,

}:Props){


return (

<div
className="
bg-[#0B1026]
rounded-2xl
border
border-[#1A2148]
p-6
text-white
shadow-lg
space-y-6
"
>


{/* TOP */}

<div className="
flex
justify-between
items-start
">


<div>


<p className="
text-sm
text-gray-400
">

Channel

</p>


<h2 className="
text-xl
font-semibold
mt-1
">

{channelName}

</h2>


<div className="
flex
items-center
gap-2
mt-4
text-gray-400
">

<span>
Program
</span>

<span className="text-white">
/
</span>


<span className="text-[#106EE9]">
{programName}
</span>


</div>


</div>



<div
className="
flex
gap-3
"
>



<Link

href={`/admin/programs/${programId}/playlists/${playlistId}/items/create`}

className="
bg-[#106EE9]
px-5
py-3
rounded-xl
hover:opacity-90
transition
"

>

+ Add Item

</Link>


</div>


</div>





{/* PLAYLIST TITLE */}


<div
className="
bg-[#010312]
rounded-xl
p-5
flex
justify-between
items-center
"
>


<div>


<p className="
text-sm
text-gray-400
">

Playlist

</p>


<h1
className="
text-3xl
font-bold
mt-2
"
>

{playlistName}

</h1>


</div>




<div
className="
text-right
"
>


<p className="
text-sm
text-gray-400
"
>

Total Duration

</p>


<div
className="
text-3xl
font-bold
text-[#1CFE10]
mt-2
"
>

{formatDuration(duration)}

</div>


</div>


</div>




</div>

);

}