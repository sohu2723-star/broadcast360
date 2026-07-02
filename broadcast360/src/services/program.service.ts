import { createProgram, getProgramById, updateProgram, getProgramDetails } 
from "@/repositories/program.repository";

import { CreateProgramInput, UpdateProgramInput } 
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

export function fetchProgramById(id:number){
  return getProgramById(id);
}


export function editProgram(
 id:number,
 data:UpdateProgramInput
){
 return updateProgram(id,data);
}

export async function fetchProgramDetails(
  id:number
){

  if(!id || isNaN(id)){

    throw new Error(
      "Invalid program id"
    );

  }


  return getProgramDetails(id);

}