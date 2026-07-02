import Link from "next/link";


interface Props {

 playlist:{
   id:number;
   name:string;
   totalDuration: number | null;
 };

 programId:number;

}

export default function PlaylistCard({
 playlist,
 programId
}:Props){


return (

<div
className="
bg-[#0B1026]
border
border-[#1a2140]
rounded-xl
p-5
flex
justify-between
items-center
">


<div>

<h3
className="
text-white
font-bold
text-lg
"
>
{playlist.name}
</h3>


<p
className="
text-gray-400
text-sm
mt-2
"
>

Duration:
{" "}
{playlist.totalDuration ?? 0}
min

</p>


</div>



<div className="flex gap-3">


<Link

href={`/admin/programs/${programId}/playlists/${playlist.id}`}

className="
bg-[#106EE9]
px-4
py-2
rounded-lg
text-white
text-sm
"
>

View

</Link>

<Link

href={`/admin/programs/${programId}/playlists/${playlist.id}/edit`}

className="
bg-[#400FD3]
px-4
py-2
rounded-lg
text-white
text-sm
"
>

Edit

</Link>


<button

className="
bg-[#F41010]
px-4
py-2
rounded-lg
text-white
text-sm
"

>

Delete

</button>



</div>


</div>


);


}