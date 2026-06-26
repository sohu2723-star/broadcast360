"use client";

import { useRouter } from "next/navigation";
import MovieForm from "@/components/admin/movies/movieForm";
import type { MovieFormData } from "@/types/movie";

export default function CreateMoviePage(){
console.log("What is MovieForm?", MovieForm); // Add this line
const router = useRouter();

async function handleSubmit(
data:MovieFormData
){

const formData = new FormData();

formData.append("title",data.title);

formData.append("description",data.description);

formData.append("releaseYear",String(data.releaseYear));

if(data.video){

formData.append("video",data.video);}

const res = await fetch(
"/api/movies",
{

method:"POST",

body:formData,

}
);

if(res.ok){

router.push("/admin/movies");

router.refresh();

}
}

return (

<div>

<h1 className="text-3xl font-bold text-white mb-8">
Create Movie
</h1>

<MovieForm

onSubmit={handleSubmit}

/>

</div>
)

}