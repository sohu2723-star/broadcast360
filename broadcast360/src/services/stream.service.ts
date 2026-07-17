import { StreamRepository } from "@/repositories/stream.repository";

import { CreateStreamInput, UpdateStreamInput } from "@/types/stream.types";

import {
  createStreamSchema,
  updateStreamSchema,
} from "@/lib/validators/stream.validation";

export class StreamService {
  async getAll({
    page,
    limit,
    search,
  }: {
    page: number;
    limit: number;
    search?: string;
  }) {
    return StreamRepository.findAllPaginated({
      page,
      limit,
      search,
    });
  }

  async getById(id: number) {
    const stream = await StreamRepository.findById(id);

    if (!stream) {
      throw new Error("Stream not found");
    }

    return stream;
  }

  async getByChannel(channelId: number) {
    return StreamRepository.findByChannel(channelId);
  }

  async create(data: CreateStreamInput) {
    const validated = createStreamSchema.parse(data);

    return StreamRepository.create(validated);
  }

  async update(id: number, data: UpdateStreamInput) {
    const existing = await StreamRepository.findById(id);

    if (!existing) {
      throw new Error("Stream not found");
    }

    const validated = updateStreamSchema.parse(data);

    return StreamRepository.update(id, validated);
  }

  async delete(id: number) {
    const existing = await StreamRepository.findById(id);

    if (!existing) {
      throw new Error("Stream not found");
    }

    return StreamRepository.delete(id);
  }
}
