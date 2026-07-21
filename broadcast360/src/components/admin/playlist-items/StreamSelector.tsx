"use client";

import { useEffect, useState } from "react";


type Stream = {
  id: number;
  name: string;
};


interface Props {
  value: number | null;
  onSelect: (id: number) => void;
}


export default function StreamSelector({
  value,
  onSelect,
}: Props) {

  const [streams, setStreams] = useState<Stream[]>([]);


  useEffect(() => {

    async function loadStreams() {

      try {

        const res = await fetch("/api/streams");

        const json = await res.json();


        console.log("STREAM RESPONSE:", json);


        /*
          Your API returns:

          {
            success:true,
            data:[]
          }

        */

        setStreams(json.data ?? []);

      } catch(error) {

        console.error(
          "Load streams error",
          error
        );

      }

    }


    loadStreams();

  }, []);



  return (

    <div>

      <label className="block text-white mb-2">
        Select Stream
      </label>


      <select

        value={value ?? ""}

        onChange={(e)=>
          onSelect(Number(e.target.value))
        }

        className="
          w-full
          bg-[#0B1026]
          text-white
          border
          border-gray-700
          rounded-lg
          p-3
        "

      >

        <option value="">
          Choose Stream
        </option>


        {streams.map((stream)=>(

          <option
            key={stream.id}
            value={stream.id}
          >

            {stream.name}

          </option>

        ))}


      </select>


    </div>

  );

}