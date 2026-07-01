"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";


export default function EditPlaylistPage() {


  const router = useRouter();

  const params = useParams();


  const playlistId =
    params.playlistId as string;



  const [name,setName] =
  useState("");


  const [error,setError] =
  useState("");


  const [loading,setLoading] =
  useState(false);



  // get current playlist name
  useEffect(()=>{


    async function loadPlaylist(){


      const res =
      await fetch(
        `/api/playlists/${playlistId}`
      );


      const data =
      await res.json();



      if(res.ok){

        setName(
          data.data.name
        );

      }


    }


    loadPlaylist();


  },[playlistId]);





  async function submit(){


    setError("");



    if(!name.trim()){


      setError(
        "Playlist name is required"
      );


      return;

    }



    if(name.trim().length < 3){


      setError(
        "Playlist name must be at least 3 characters"
      );


      return;

    }



    setLoading(true);



    const res =
    await fetch(

      `/api/playlists/${playlistId}`,

      {

        method:"PUT",

        headers:{

          "Content-Type":"application/json"

        },


        body:JSON.stringify({

          name:name.trim()

        })

      }

    );



    const data =
    await res.json();



    if(!res.ok){


      setError(

        data.errors?.name?.[0]
        ??
        "Failed to update"

      );


      setLoading(false);

      return;

    }



    router.back();


  }






  return (

    <div
    className="
    min-h-screen
    bg-[#010312]
    p-8
    "
    >


      <div
      className="
      max-w-xl
      bg-[#0B1026]
      p-6
      rounded-xl
      "
      >


        <h1
        className="
        text-white
        text-xl
        mb-5
        "
        >

        Edit Playlist

        </h1>
        <input

        value={name}

        onChange={(e)=>{

          setName(e.target.value);

          setError("");

        }}

        placeholder="Playlist name"

        className="
        w-full
        p-3
        rounded-lg
        bg-[#010312]
        text-white
        border
        border-gray-700
        "

        />

         {error && (

          <p
          className="
          text-[#F41010]
          mb-3
          "
          >

          {error}

          </p>

        )}




        <div
        className="
        flex
        gap-3
        mt-5
        "
        >



        <button

        onClick={()=>router.back()}

        className="
        bg-gray-700
        text-white
        px-5
        py-2
        rounded-lg
        "

        >

        Cancel

        </button>





        <button

        onClick={submit}

        disabled={loading}

        className="
        bg-[#106EE9]
        text-white
        px-5
        py-2
        rounded-lg
        "

        >

        {
        loading
        ?
        "Saving..."
        :
        "Save"
        }


        </button>



        </div>


      </div>


    </div>

  );

}