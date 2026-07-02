import ProgramCard from "@/components/admin/programs/ProgramCard";
import PlaylistList from "@/components/admin/playlists/PlaylistList";


async function getProgram(id:number){

const res =
await fetch(
`http://localhost:3000/api/programs/${id}`,
{
cache:"no-store"
}
);


return res.json();

}



async function getPlaylists(
id:number,
page:number
){


const res =
await fetch(
`http://localhost:3000/api/programs/${id}/playlists?page=${page}`,
{
cache:"no-store"
}
);


const result =
await res.json();


return result.data;


}



interface Props {

  playlists: Playlist[];

  programId:number;

  page:number;

  totalPages:number;

}



export default async function Page({
params,
searchParams
}:Props){


const {programId}=await params;


const {page}=await searchParams;


const id=Number(programId);



const programData =
await getProgram(id);



const playlistData =
await getPlaylists(
id,
Number(page ?? 1)
);



return (

<div className="p-6 space-y-6">


<ProgramCard

program={
programData.data
}

/>



<PlaylistList

programId={id}

playlists={
playlistData.playlists
}

page={
playlistData.page
}

totalPages={
playlistData.totalPages
}

/>



</div>

);


}