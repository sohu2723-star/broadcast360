"use client";

import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import Image from "next/image";

export default function EditChannel({
params}:{
params:Promise<{id:string}>}){

const router=useRouter();

const [id, setId] = useState("");
const [name,setName]=useState("");
const [country,setCountry]=useState("");
const [description,setDescription]=useState("");
const [logoUrl, setLogoUrl] = useState("");
const [logo, setLogo] = useState<File | null>(null);

useEffect(()=>{

async function load(){
const {id}=await params;
setId(id);
const res=await fetch(
`/api/channels/${id}`
);

const data=await res.json();
setName(data.name);
setCountry(data.country ?? "");
setDescription(data.description ?? "");
setLogoUrl(data.logo ?? "");
}
load();
},[params]);

async function uploadLogo(){
if(!logo) return logoUrl;
const formData = new FormData();

formData.append("file",logo);
const res = await fetch("/api/upload/logo",
{
method:"POST",
body:formData
});

const data = await res.json();
return data.url;
}

async function update(){


const newLogoUrl = await uploadLogo();



await fetch(

`/api/channels/${id}`,

{

method:"PUT",

headers:{
"Content-Type":"application/json"
},


body:JSON.stringify({

name,

country,

description,

logo:newLogoUrl

})

}

);

router.push("/admin/channels");


}

return (
<div>
<h1 className="text-3xl font-bold mb-8">
Edit Channel
</h1>
<div
className="bg-[#0B1026] p-8 rounded-2xl max-w-xl space-y-5 border border-white/10">

{/* Name */}
<div>
<label className="block mb-2">
Channel Name
</label>
<input
value={name}
onChange={(e)=>setName(e.target.value)}
className="w-full p-3 bg-[#010312] rounded-xl border border-white/10"/>
</div>

{/* Country */}
<div>
<label className="block mb-2">
Country
</label>

<input
value={country}
onChange={(e)=>setCountry(e.target.value)}
className="w-full p-3 bg-[#010312] rounded-xl border border-white/10"/>
</div>

{/* Description */}
<div>
<label className="block mb-2">
Description
</label>
<textarea
value={description}
onChange={(e)=>setDescription(e.target.value)}
rows={4}
className="
w-full
p-3
bg-[#010312]
rounded-xl
border
border-white/10
"

/>

</div>


{/* Logo */}

<div>
  <label className="block mb-2">
    Logo
  </label>

  {logoUrl && (
    <div className="mb-4">
      <p className="mb-2 text-sm text-gray-400">
        Current Logo
      </p>

      <Image
        src={logoUrl}
        alt="Channel Logo"
        width={96}
        height={96}
        className="
            rounded-xl
            object-cover
            border
            border-white/10
        "
       />
    </div>
  )}

  <input
    type="file"
    accept="image/*"
    onChange={(e) => {
      const file = e.target.files?.[0];

      if (file) {
        setLogo(file);
      }
    }}
    className="
      w-full
      p-3
      bg-[#010312]
      rounded-xl
      border
      border-white/10
    "
  />

  {logo && (
    <p className="mt-2 text-sm text-green-400">
      Selected: {logo.name}
    </p>
  )}
</div>

{/* Buttons */}

<div className="flex gap-4">


<button

onClick={update}

className="
bg-[#106EE9]
px-6
py-3
rounded-xl
font-semibold
hover:opacity-80
"

>

Update

</button>



<button

type="button"

onClick={()=>router.push("/admin/channels")}

className="
bg-[#F41010]
px-6
py-3
rounded-xl
font-semibold
hover:opacity-80
"

>

Cancel

</button>


</div>


</div>



</div>


)

}