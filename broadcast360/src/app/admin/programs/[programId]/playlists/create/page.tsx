import PlaylistForm from "@/components/admin/playlists/PlaylistForm";
import { fetchProgramById } from "@/services/program.service";


interface PageProps {

  params: Promise<{
    programId:string;
  }>;

}




export default async function CreatePlaylistPage({

params

}:PageProps){



const {programId} =
await params;



const id =
Number(programId);



const program = await fetchProgramById(id);

if (!program) {
  throw new Error("Program not found");
}



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
program.channel?.name ?? "Unassigned"
}


programName={
program.title
}


/>



</div>

);

}