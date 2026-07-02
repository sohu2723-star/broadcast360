import PlaylistForm from "@/components/admin/playlists/PlaylistForm";


interface PageProps {

  params: Promise<{
    programId:string;
  }>;

}



async function getProgram(programId:number){

const res = await fetch(

`http://localhost:3000/api/programs/${programId}`,

{
cache:"no-store"
}

);


if(!res.ok){

throw new Error(
"Failed to load program"
);

}


return res.json();

}





export default async function CreatePlaylistPage({

params

}:PageProps){



const {programId} =
await params;



const id =
Number(programId);



const data =
await getProgram(id);



const program =
data.data;



return (

<div
className="
p-8
bg-[#010312]
min-h-screen
"
>


<h1
className="
text-2xl
text-white
font-bold
mb-6
"
>

Create Playlist

</h1>



<PlaylistForm

programId={id}


channelName={
program.channel
}


programName={
program.title
}


/>



</div>

);

}