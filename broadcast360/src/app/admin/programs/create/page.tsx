import ProgramForm 
from "@/components/admin/programs/ProgramForm";

import { prisma } from "@/lib/prisma";

export default async function CreateProgramPage(){

const channels = await prisma.channel.findMany({

 select:{
  id:true,
  name:true
 }

});



return (

<div>


<h1 className="text-3xl font-bold mb-8">
Program Management
</h1>


<ProgramForm
 channels={channels}
/>


</div>

)

}