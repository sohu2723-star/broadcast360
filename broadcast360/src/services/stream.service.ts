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
  /*
   * ==========================================================
   * GET ALL
   * ==========================================================
   */

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

  /*
   * ==========================================================
   * GET BY ID
   * ==========================================================
   */

  async getById(id: number) {
    const stream = await StreamRepository.findById(id);

    if (!stream) {
      throw new Error("Stream not found");
    }

    return stream;
  }

  /*
   * ==========================================================
   * GET BY CHANNEL
   * ==========================================================
   */

  async getByChannel(channelId: number) {
    return StreamRepository.findByChannel(channelId);
  }

  /*
   * ==========================================================
   * GENERATE SOURCE URL
   * ==========================================================
   */

  private generateSourceUrl(
    protocol: string,
    streamKey: string
  ): string {
    const host =
      process.env.MEDIA_SERVER_HOST || "127.0.0.1";

    switch (protocol) {
      case "RTSP":
        return `rtsp://${host}:8554/live/${streamKey}`;

      case "RTMP":
        return `rtmp://${host}:1935/live/${streamKey}`;

      case "HLS":
        return `http://${host}:8888/live/${streamKey}/index.m3u8`;

      case "WEBRTC":
        return `http://${host}:8889/live/${streamKey}/`;

      default:
        throw new Error(
          `Unsupported stream protocol: ${protocol}`
        );
    }
  }

  /*
   * ==========================================================
   * CREATE
   * ==========================================================
   */

  async create(data: CreateStreamInput) {
    /*
     * Validate frontend data.
     */
    const validated =
      createStreamSchema.parse(data);

    /*
     * Find selected channel.
     */
    const channel =
      await prisma.channel.findUnique({
        where: {
          id: validated.channelId,
        },
      });

    if (!channel) {
      throw new Error("Channel not found");
    }

    /*
     * Channel must have a stream key.
     */
    if (!channel.streamKey) {
      throw new Error(
        "Channel stream key is missing"
      );
    }

    /*
     * Generate source URL automatically.
     *
     * RTSP:
     * rtsp://SERVER:8554/live/streamKey
     *
     * RTMP:
     * rtmp://SERVER:1935/live/streamKey
     */
    const url =
      this.generateSourceUrl(
        validated.protocol,
        channel.streamKey
      );

    console.log("🎥 CREATE STREAM", {
      channelId: channel.id,
      channel: channel.name,
      protocol: validated.protocol,
      streamKey: channel.streamKey,
      url,
    });

    /*
     * Save stream.
     */
    return StreamRepository.create({
      channelId: validated.channelId,
      name: validated.name,
      protocol: validated.protocol,
      description: validated.description,
      url,
    });
  }

  /*
   * ==========================================================
   * UPDATE
   * ==========================================================
   */

  async update(
    id: number,
    data: UpdateStreamInput
  ) {
    /*
     * Find existing stream.
     */
    const existing =
      await StreamRepository.findById(id);

    if (!existing) {
      throw new Error("Stream not found");
    }

    /*
     * Validate update data.
     */
    const validated =
      updateStreamSchema.parse(data);

    /*
     * Determine which channel should be used.
     */
    const channelId =
      validated.channelId ??
      existing.channelId;

    /*
     * Find channel.
     */
    const channel =
      await prisma.channel.findUnique({
        where: {
          id: channelId,
        },
      });

    if (!channel) {
      throw new Error("Channel not found");
    }

    if (!channel.streamKey) {
      throw new Error(
        "Channel stream key is missing"
      );
    }

    /*
     * If protocol or channel changes,
     * regenerate the source URL.
     *
     * Otherwise keep the existing URL.
     */
    let url = existing.url;

    if (
      validated.protocol !== undefined ||
      validated.channelId !== undefined
    ) {
      const protocol =
        validated.protocol ??
        existing.protocol;

      url = this.generateSourceUrl(
        protocol,
        channel.streamKey
      );
    }

    /*
     * Update database.
     */
    return StreamRepository.update(
      id,
      {
        ...validated,
        url,
      }
    );
  }

  /*
   * ==========================================================
   * DELETE
   * ==========================================================
   */

  async delete(id: number) {
    const existing =
      await StreamRepository.findById(id);

    if (!existing) {
      throw new Error("Stream not found");
    }

    return StreamRepository.delete(id);
  }
}