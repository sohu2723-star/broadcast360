import { ProgramType } from "@/generated/prisma/client";


export interface CreateProgramInput {
  channelId: number;
  title: string;
  type: ProgramType;
  description?: string;
}


export interface UpdateProgramInput {
  channelId: number;
  title: string;
  type: ProgramType;
  description?: string;
}


export interface ProgramFormData {
  id: number;
  channelId: number;
  title: string;
  type: ProgramType;
  description: string | null;
}