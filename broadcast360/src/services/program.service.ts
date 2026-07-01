import { programRepository } from "@/repositories/program.repository";

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