"use client";

import { useEffect, useState } from "react";


interface Movie {

  id:number;

  title:string;

}


interface Props {

  value:number | null;

  onSelect:(id:number)=>void;

}



export default function MovieSelector({

  value,

  onSelect

}:Props){


const [movies,setMovies] =
useState<Movie[]>([]);



useEffect(()=>{


async function loadMovies(){


const res =
await fetch("/api/movies");


const data =
await res.json();



setMovies(
data.data ?? []
);


}


loadMovies();


},[]);





return (

<div>


<label className="block text-white mb-2">

Select Movie

</label>



<select

value={value ?? ""}

onChange={(e)=>
onSelect(
Number(e.target.value)
)
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

Choose movie

</option>



{

movies.map(movie=>(


<option

key={movie.id}

value={movie.id}

>

{movie.title}

</option>


))

}



</select>


</div>

);

}