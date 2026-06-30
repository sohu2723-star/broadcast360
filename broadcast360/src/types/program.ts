import { ProgramType } from "@/generated/prisma/client";

export interface CreateProgramInput {
  channelId:number;
  title:string;
  type:ProgramType;
  description?:string;
}