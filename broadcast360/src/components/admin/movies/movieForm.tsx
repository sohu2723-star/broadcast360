"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MovieFormData } from "@/types/movie";

type Props = {
  initialData?: MovieFormData;
  movieId?: number;
  onSubmit: (data: MovieFormData) => Promise<void>;
};

export default function MovieForm({
  initialData,
  onSubmit,
}: Props) {

  const router = useRouter();


  const [form, setForm] = useState<MovieFormData>(
    initialData ?? {
      title: "",
      description: "",
      video: null,
      releaseYear: new Date().getFullYear(),
    }
  );


  return (

    <div className="bg-[#0B1026] border border-white/10 rounded-2xl p-8 max-w-3xl">


      <form

        className="space-y-5"

        onSubmit={(e)=>{

          e.preventDefault();

          onSubmit(form);

        }}

      >


        <div>

          <label className="block mb-2">
            Movie Title
          </label>


          <input

          className="
          w-full 
          bg-[#111936]
          border
          border-white/10
          rounded-xl
          p-3
          "

          value={form.title}

          onChange={(e)=>

            setForm({

              ...form,

              title:e.target.value

            })

          }

          />

        </div>



        <div>

        <label className="block mb-2">
          Description
        </label>


        <textarea

        rows={4}

        className="
        w-full
        bg-[#111936]
        border
        border-white/10
        rounded-xl
        p-3
        "

        value={form.description}

        onChange={(e)=>

          setForm({

            ...form,

            description:e.target.value

          })

        }

        />


        </div>

        {/* CHANGE HERE */}

        <div>

        <label className="block mb-2">
          Movie File
        </label>


        <input

        type="file"

        accept="video/*"

        className="
        w-full
        bg-[#111936]
        border
        border-white/10
        rounded-xl
        p-3
        "

        onChange={(e)=>


          setForm({

            ...form,

            video:e.target.files?.[0] ?? null


          })


        }


        />


        </div>





        <div className="grid grid-cols-2 gap-4">

          <div>

          <label className="block mb-2">
          Release Year
          </label>


          <input
  type="number"
  min={1900}
  max={2026}
  placeholder="YYYY"
  value={form.releaseYear}
  onChange={(e) =>
    setForm({
      ...form,
      releaseYear: Number(e.target.value),
    })
  }
/>

          </div>


        </div>





        <div className="flex gap-4 pt-4">


        <button

        type="submit"

        className="
        flex-1
        bg-[#106EE9]
        py-3
        rounded-xl
        font-bold
        hover:opacity-80
        "

        >

        Save Movie

        </button>





        <button

        type="button"

        onClick={()=>router.push("/admin/movies")}


        className="
        bg-[#F41010]
        px-6
        py-3
        rounded-xl
        font-bold
        hover:opacity-80
        "

        >

        Cancel

        </button>



        </div>


      </form>


    </div>

  );

}