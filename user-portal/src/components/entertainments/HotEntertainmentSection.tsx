import type { Entertainment } from "@/types/entertainment";

import EntertainmentCard from "./EntertainmentCard";


interface Props {
  entertainments: Entertainment[];
}


export default function HotEntertainmentSection({
  entertainments,
}:Props){


const latest =
[
...entertainments
]
.sort((a,b)=>{

const dateA =
new Date(
a.scheduleEnd ??
a.createdAt ??
""
).getTime();


const dateB =
new Date(
b.scheduleEnd ??
b.createdAt ??
""
).getTime();


return dateB-dateA;


})
.slice(0,5);



return (

<div

className="
grid
grid-cols-1
sm:grid-cols-2
lg:grid-cols-3
xl:grid-cols-5
gap-7
"

>


{
latest.map((item,index)=>(

<EntertainmentCard

key={`${item.id}-${index}`}

entertainment={item}

/>

))
}


</div>

);

}