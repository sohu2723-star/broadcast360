import { prisma } from "@/lib/prisma";
import { StreamRepository } from "@/repositories/stream.repository";

import {
  CreateStreamInput,
  UpdateStreamInput,
} from "@/types/stream.types";

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

    const channel = await prisma.channel.findUnique({
      where: {
        id: validated.channelId,
      },
    });

    if (!channel) {
      throw new Error("Channel not found");
    }

    if (!channel.streamKey) {
      throw new Error("Channel stream key is missing");
    }

    const url = `rtmp://localhost:1935/${channel.streamKey}`;

    return StreamRepository.create({
      ...validated,
      url,
    });
  }

  async update(id: number, data: UpdateStreamInput) {
    const existing = await StreamRepository.findById(id);

    if (!existing) {
      throw new Error("Stream not found");
    }

    const validated = updateStreamSchema.parse(data);

    let url = existing.url;

    if (
      validated.channelId &&
      validated.channelId !== existing.channelId
    ) {
      const channel = await prisma.channel.findUnique({
        where: {
          id: validated.channelId,
        },
      });

      if (!channel) {
        throw new Error("Channel not found");
      }

      if (!channel.streamKey) {
        throw new Error("Channel stream key is missing");
      }

      url = `rtmp://localhost:1935/${channel.streamKey}`;
    }

    return StreamRepository.update(id, {
      ...validated,
      url,
    });
  }

  async delete(id: number) {
    const existing = await StreamRepository.findById(id);

    if (!existing) {
      throw new Error("Stream not found");
    }

    return StreamRepository.delete(id);
  }
}