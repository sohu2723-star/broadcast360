"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";


export default function CreateChannel(){

const router = useRouter();

const [name,setName]=useState("");
const [country,setCountry]=useState("");
const [description,setDescription]=useState("");
const [logo,setLogo] = useState<File | null>(null);
const [logoUrl,setLogoUrl] = useState("");

async function uploadLogo(){
if(!logo) return null;
const form = new FormData();
form.append("file",logo);

const res = await fetch(
"/api/upload/logo",
{
method:"POST",
body:form
});

const data = await res.json();
return data.url;
}

async function createChannel(){

const logoPath = await uploadLogo();
await fetch("/api/channels",{

method:"POST",

headers:{"Content-Type":"application/json"},

body:JSON.stringify({
name,
country,
description,
logo:logoPath
})
});

router.push("/admin/channels");
}

return (
<div>

<h1 className="text-3xl font-bold mb-8">

Create Channel

</h1>
<div className="
bg-[#0B1026]
p-8
rounded-2xl
space-y-5
max-w-xl
">



<input

placeholder="Channel name"

className="
w-full
p-3
bg-[#010312]
rounded-xl
"

onChange={
e=>setName(e.target.value)
}
/>

<input
placeholder="Country"
className="
w-full
p-3
bg-[#010312]
rounded-xl
"
onChange={
e=>setCountry(e.target.value)
}

/>


<div>

<label className="block mb-2">
Channel Logo
</label>

<input
type="file"

accept="image/*"

onChange={(e)=>{

const file = e.target.files?.[0];

if(file){
setLogo(file);
setLogoUrl(`/logos/${file.name}`);
}

}}

className="w-full p-3 bg-[#010312] rounded-xl"
/>

</div>

<textarea

placeholder="Description"

className="w-full p-3 bg-[#010312] rounded-xl"

onChange={
e=>setDescription(e.target.value)
}
/>
<div className="flex gap-4">


<button

onClick={createChannel}

className="
bg-[#1CFE10]
text-black
px-6
py-3
rounded-xl
font-bold
hover:opacity-80
"
>

Save

</button>



<button

type="button"

onClick={()=>router.push("/admin/channels")}

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
</div>
</div>
)}