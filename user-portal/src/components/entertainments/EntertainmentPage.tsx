
"use client";


import {
useEffect,
useState
} from "react";


import type { Entertainment } from "@/types/entertainment";


import {
getEntertainments
} from "@/services/entertainment.service";


import EntertainmentSearch from "./EntertainmentSearch";

import ChannelFilter from "./ChannelFilter";

import HotEntertainmentSection from "./HotEntertainmentSection"; 

import EntertainmentGrid from "./EntertainmentGrid"; 






export default function EntertainmentPage(){


const [
entertainments,
setEntertainments
]=useState<Entertainment[]>([]);



const [
loading,
setLoading
]=useState(true);



const [
search,
setSearch
]=useState("");

const [
selectedChannel,
setSelectedChannel
] = useState("");

const [
channels,
setChannels
] = useState([]);

const [
currentPage,
setCurrentPage
]=useState(1);



const entertainmentsPerPage = 10;



useEffect(()=>{


async function loadData(){

try{


const data =
await getEntertainments();

console.log("PAGE DATA:", data);

setEntertainments(data);


}catch(error){

console.error(
"Failed loading entertainments:",
error
);


}finally{

setLoading(false);

}

}


loadData();


},[]);




const filteredEntertainments =
entertainments.filter((item)=>{


return item.title

.toLowerCase()

.includes(
search.toLowerCase()
);


});



const hotEntertainments =
filteredEntertainments.slice(0,5);



const totalPages =
Math.ceil(
filteredEntertainments.length /
entertainmentsPerPage
);



const paginatedEntertainments =
filteredEntertainments.slice(

(currentPage-1)
*
entertainmentsPerPage,

currentPage
*
entertainmentsPerPage

);

return (

<main className="min-h-screen bg-[#010312] text-white">


<div className="mx-2 md:mx-4 lg:mx-6 max-w-7xl py-10">


<h1 className="mb-8 text-4xl font-bold">
ENTERTAINMENTS
</h1>



<div className="mb-12 rounded-2xl border border-[#106EE9]/20 bg-[#0B1026] p-5">

  <div className="grid gap-4 md:grid-cols-2">

    <EntertainmentSearch
      value={search}
      onChange={(value)=>{
        setSearch(value);
        setCurrentPage(1);
      }}
    />

    <ChannelFilter
      value={selectedChannel}
      channels={channels}
      onChange={(value)=>{
        setSelectedChannel(value);
        setCurrentPage(1);
      }}
    />

  </div>

</div>



<section className="mb-16">


<h2 className="mb-6 text-2xl font-bold">

🔥 HOT ENTERTAINMENTS SHOWCASE

</h2>



{
loading ?

<div>
Loading entertainments...
</div>

:

filteredEntertainments.length===0 ?

<div>
No entertainments found.
</div>

:

<HotEntertainmentSection

entertainments={
hotEntertainments
}

/>

}


</section>





<section>


<h2 className="mb-8 text-2xl font-bold">

🎬 ALL ENTERTAINMENTS ARCHIVE

</h2>



<EntertainmentGrid

entertainments={
paginatedEntertainments
}

/>



<div className="mt-12 flex justify-center gap-5">


<button

disabled={currentPage===1}

onClick={()=>
setCurrentPage(
p=>p-1
)
}

className="rounded-lg bg-[#0B1026] px-5 py-2"

>

Previous

</button>



<span>

Page {currentPage} / {totalPages || 1}

</span>




<button

disabled={
currentPage===totalPages ||
totalPages===0
}

onClick={()=>
setCurrentPage(
p=>p+1
)
}

className="rounded-lg bg-[#106EE9] px-5 py-2"

>

Next

</button>


</div>


</section>



</div>


</main>

);

}
