"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  programId: number;
  channelName: string;
  programName: string;
}

export default function PlaylistForm({

  programId,

  channelName,

  programName

}: Props) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `/api/programs/${programId}/playlists`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name }),
        }
      );

      const data = await res.json();

      if(!name.trim()){

        setError(
        "Playlist name is required"
        );

        return;

        }


        if(name.length < 3){

        setError(
        "Playlist name must be at least 3 characters"
        );

        return;

        }



        if (!res.ok) {

        throw new Error(

        data.message ||
        "Failed to create playlist"

        );

        }

      router.push(`/admin/programs/${programId}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-md"
    >
     
      <div
      className="
      bg-[#0B1026]
      p-4
      rounded-xl
      text-white
      "
      >

      <p>
      Channel:
      <span className="text-[#106EE9] ml-2">
      {channelName}
      </span>
      </p>


      <p>
      Program:
      <span className="text-[#106EE9] ml-2">
      {programName}
      </span>
      </p>


      </div>

      <input

      type="text"

      placeholder="Playlist name"

      value={name}

      onChange={(e)=>{

      setName(e.target.value);

      setError("");

      }}

      className="
      w-full
      bg-[#010312]
      text-white
      border
      border-gray-700
      px-4
      py-3
      rounded-lg
      "

      />
       {error && (
        <p className="text-red-500">{error}</p>
      )}


       <button
          type="button"
          onClick={()=>
            router.back()
          }

          className="
          bg-gray-700
          text-white
          px-5
          py-2
          mr-4
          rounded-lg
          "

          >

          Cancel

          </button>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg"
      >
        {loading ? "Creating..." : "Create Playlist"}
      </button>
    </form>
  );
}