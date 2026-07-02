import PlaylistItemList from "@/components/admin/playlist-items/PlaylistItemList";
import Link from "next/link";


async function getPlaylist(
  playlistId:number
){

const res = await fetch(
`http://localhost:3000/api/playlists/${playlistId}`,
{
cache:"no-store"
}
);


if(!res.ok){

throw new Error(
"Failed to load playlist"
);

}


return res.json();

}



interface Props{

params:Promise<{
programId:string;
playlistId:string;
}>

}



export default async function PlaylistPage({
params
}:Props){


const {
programId,
playlistId
}=await params;


const playlistIdNumber =
Number(playlistId);



const data =
await getPlaylist(
playlistIdNumber
);



const playlist =
data.data;



return (

<div className="
p-6
space-y-6
">


{/* Header */}

<div
className="
bg-[#0B1026]
p-6
rounded-xl
"
>

<h1
className="
text-white
text-2xl
font-bold
"
>

{playlist.name}

</h1>


<p
className="
text-gray-400
mt-2
"
>

Duration:
{playlist.totalDuration ?? 0}

</p>



<Link

href={
`/admin/programs/${programId}/playlists/${playlistId}/items/create`
}

className="
inline-block
mt-5
bg-[#106EE9]
text-white
px-5
py-3
rounded-lg
"
>

+ Add Playlist Item

</Link>


</div>




<PlaylistItemList

items={
playlist.items ?? []
}

/>



</div>


);

}