"use client";

import { ProgramDetailsType, ProgramPlaylist } from "@/types/program";
import { useRouter } from "next/navigation";

type Props = {
 program:ProgramDetailsType;
};

export default function ProgramDetails({
 program
}:Props){

const router = useRouter();

return (

<div className="space-y-8">
<div className="bg-[#0B1026] p-8 rounded-xl">
<h1 className="text-3xl font-bold mb-5">
{program.title}
</h1>

<p>
<b>Channel:</b> {program.channel}
</p>

<p>
<b>Type:</b> {program.type}
</p>

<p>
<b>Description:</b> {program.description}
</p>

<p>
<b>Created:</b>{" "}
{new Date(program.createdAt).toLocaleDateString()}
</p>
</div>

<div className="flex justify-between">

<h2 className="text-2xl font-bold">
Playlists
</h2>

<button
onClick={()=>router.push(
`/admin/programs/${program.id}/playlists/create`
)}
className="bg-blue-600 px-5 py-3 rounded-xl"
>
+ Create Playlist
</button>

</div>

<div className="bg-[#0B1026] rounded-xl p-5">

{
program.playlists.length ===0 && (

<p className="text-gray-400">
No playlists found
</p>
)

}

{
program.playlists.map((playlist:ProgramPlaylist)=>(
<div

key={playlist.id}
className="flex justify-between border-b border-white/10 py-4"
>
<div>
<h3 className="font-bold">
{playlist.name}
</h3>

<p className="text-gray-400">
{
new Date(
playlist.createdAt
)
.toLocaleDateString()
}

</p>
</div>

<button

onClick={()=>router.push(
`/admin/playlists/${playlist.id}`
)}

className="bg-gray-700 px-4 py-2 rounded"
>
View
</button>
</div>
))
}
</div>
</div>

)

}