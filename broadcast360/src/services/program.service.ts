import { createProgram } 
from "@/repositories/program.repository";

import { CreateProgramInput } 
from "@/types/program";


export async function addProgram(
 data:CreateProgramInput
){

 const program = await createProgram(data);


 return {
  id:program.id,
  title:program.title,
  type:program.type,
  channel:program.channel.name
 };

}