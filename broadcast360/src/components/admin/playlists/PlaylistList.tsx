import Link from "next/link";
import PlaylistCard from "./PlaylistCard";


interface Playlist {

  id:number;

  name:string;

  totalDuration:number | null;

}


interface Props {

  playlists: Playlist[];

  programId:number;

  page:number;

  totalPages:number;

}



export default function PlaylistList({

  playlists,

  programId,

  page,

  totalPages,

}: Props) {


return (

<div className="space-y-6">


  {
    playlists.length === 0 ? (

      <p className="text-gray-400">
        No playlists yet
      </p>

    ) : (

      playlists.map((playlist)=>(

        <PlaylistCard

          key={playlist.id}

          playlist={playlist}

          programId={programId}

        />

      ))

    )
  }



  {/* Pagination */}

  <div className="flex gap-4 items-center">


    {
      page > 1 && (

        <Link

          href={`?page=${page - 1}`}

          className="text-white bg-gray-700 px-4 py-2 rounded"

        >

          Previous

        </Link>

      )
    }



    <span className="text-white">

      {page} / {totalPages}

    </span>




    {
      page < totalPages && (

        <Link

          href={`?page=${page + 1}`}

          className="text-white bg-blue-600 px-4 py-2 rounded"

        >

          Next

        </Link>

      )
    }


  </div>



</div>

);


}