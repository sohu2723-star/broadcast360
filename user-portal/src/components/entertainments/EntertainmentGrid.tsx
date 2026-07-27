import type { Entertainment } from "@/types/entertainment";

import EntertainmentCard from "./EntertainmentCard";


interface Props {
  entertainments: Entertainment[];
}


export default function EntertainmentGrid({
  entertainments,
}:Props){

return (

<div

className="
grid
grid-cols-1
sm:grid-cols-2
lg:grid-cols-3
xl:grid-cols-5
gap-x-12
gap-y-14
"

>


{
entertainments.map((item,index)=>(

<EntertainmentCard

key={`${item.id}-${index}`}

entertainment={item}

/>

))
}


</div>

);

}