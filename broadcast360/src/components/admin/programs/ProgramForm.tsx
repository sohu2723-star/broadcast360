"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProgramType } from "@/generated/prisma/client";
import { createProgramSchema } from "@/lib/validators/program.validator";
import type { ProgramFormData } from "@/types/program";

type Channel = {
  id: number;
  name: string;
};

type ProgramFormProps = {
  channels: Channel[];

  initialData?: ProgramFormData;

  mode?: "create" | "edit";
};


export default function ProgramForm({
  channels,
  initialData,
  mode = "create",
}: ProgramFormProps) {


  const router = useRouter();


  const [channelId, setChannelId] = useState(
    initialData?.channelId?.toString() || ""
  );


  const [title, setTitle] = useState(
    initialData?.title || ""
  );


  const [type, setType] = useState<ProgramType>(
    initialData?.type || ProgramType.MOVIE
  );


  const [description, setDescription] = useState(
    initialData?.description || ""
  );


  const [message, setMessage] = useState("");

  const [errors, setErrors] =
    useState<Record<string,string>>({});


  const [loading,setLoading] = useState(false);



  async function submit(){


    const payload = {

      channelId:Number(channelId),

      title:title.trim(),

      type,

      description:description.trim(),

    };



    const result =
      createProgramSchema.safeParse(payload);



    if(!result.success){

      const fieldErrors =
        result.error.flatten().fieldErrors;


      setErrors({

        channelId:
        fieldErrors.channelId?.[0] || "",


        title:
        fieldErrors.title?.[0] || "",


        type:
        fieldErrors.type?.[0] || "",


        description:
        fieldErrors.description?.[0] || "",

      });


      return;

    }



    try{


      setLoading(true);

      setErrors({});



      const url =
      mode === "edit"
      ? `/api/programs/${initialData?.id}`
      : "/api/programs";



      const method =
      mode === "edit"
      ? "PUT"
      : "POST";




      const res = await fetch(
        url,
        {

        method,

        headers:{
          "Content-Type":"application/json"
        },


        body:JSON.stringify(result.data)

        }

      );



      const data = await res.json();



      if(res.ok){


        setMessage(
          mode==="edit"
          ? "Program updated successfully"
          : "Program created successfully"
        );


        router.push("/admin/programs");


      }else{


        setMessage(
          data.message || "Something went wrong"
        );


      }



    }catch(error){

      console.log(error);

      setMessage("Server error");


    }finally{

      setLoading(false);

    }


  }



return (

<div className="bg-[#0B1026] p-8 rounded-xl max-w-xl space-y-5">


<h1 className="text-2xl font-bold">

{
mode==="edit"
?
"Edit Program"
:
"Create Program"
}

</h1>



<select

value={channelId}

onChange={(e)=>setChannelId(e.target.value)}

className="w-full p-3 bg-black rounded"

>


<option value="">
Select Channel
</option>



{
channels.map((channel)=>(

<option
key={channel.id}
value={channel.id}
>

{channel.name}

</option>


))

}


</select>


{
errors.channelId &&

<p className="text-red-500 text-sm">

{errors.channelId}

</p>

}




<input

placeholder="Program title"

value={title}

onChange={(e)=>setTitle(e.target.value)}

className="w-full p-3 bg-black rounded"

/>



{
errors.title &&

<p className="text-red-500 text-sm">

{errors.title}

</p>

}





<select

value={type}

onChange={(e)=>
setType(e.target.value as ProgramType)
}

className="w-full p-3 bg-black rounded"

>


{
Object.values(ProgramType)
.map((item)=>(

<option
key={item}
value={item}
>

{item}

</option>

))

}


</select>



{
errors.type &&

<p className="text-red-500 text-sm">

{errors.type}

</p>

}





<textarea

placeholder="Description"

value={description}

onChange={(e)=>setDescription(e.target.value)}

className="w-full p-3 bg-black rounded"

/>



{
errors.description &&

<p className="text-red-500 text-sm">

{errors.description}

</p>

}




<div className="flex gap-4">


<button

disabled={loading}

onClick={submit}

className="bg-blue-600 px-5 py-3 rounded"

>


{
loading
?
"Saving..."
:
mode==="edit"
?
"Update"
:
"Create"
}


</button>



<button

onClick={()=>router.push("/admin/programs")}

className="bg-[#F41010] px-5 py-3 rounded"

>

Cancel

</button>



</div>



{
message &&

<p>

{message}

</p>

}



</div>

);


}