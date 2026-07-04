"use client";


interface Ad {

  id:number;

  title:string;

}



interface Props {

  value:number | null;

  onSelect:(id:number)=>void;

}



export default function AdSelector({

  value,

  onSelect

}:Props){


const ads:Ad[]=[

{
id:1,
title:"Coca Cola Ad"
},

{
id:2,
title:"Samsung Promo"
}

];



return (

<div className="space-y-2">


<label className="block text-white">

Select Advertisement

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

Choose Ad

</option>



{

ads.map(ad=>(

<option

key={ad.id}

value={ad.id}

>

{ad.title}

</option>

))

}


</select>



</div>

);

}