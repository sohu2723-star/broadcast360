import { createProgram, getProgramById, updateProgram, getProgramDetails, programRepository } 
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

// list all programs with filters
class ProgramService {
  public async getAllPrograms(filters: { search?: string; type?: string; channelName?: string; page?: number; limit?: number }) {

    const programs = await programRepository.findMany(filters);

    return programs.map((p) => ({
      id: p.id,
      channel: p.channel?.name || "Unassigned",
      title: p.title,
      type: p.type,
      description: p.channel?.description || "",
      createdAt: p.createdAt.toISOString().split("T")[0],
    }));
  }

  public async deleteProgram(id: number) {
    const existing = await programRepository.findById(id);
    if (!existing) {
      throw new Error("Target program context index not found inside storage");
    }
    
    return await programRepository.delete(id);
  }
}

export const programService = new ProgramService();
