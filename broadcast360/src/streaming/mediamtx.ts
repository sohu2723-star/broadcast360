import http from "http";

import { MediaPathListResponse } from "@/types/broadcast.types";

export class MediaMTX {
  private apiUrl = "http://127.0.0.1:9997";

  /*
  ==================================
  Check MediaMTX API
  ==================================
  */

  async health(): Promise<boolean> {
    try {
      await this.request<MediaPathListResponse>("/v3/paths/list");

      return true;
    } catch (error) {
      console.error("❌ MediaMTX health failed", error);

      return false;
    }
  }

  /*
  ==================================
  Check publisher exists
  ==================================
  */

  async isPublisherAlive(pathName: string): Promise<boolean> {
    try {
      const data = await this.request<MediaPathListResponse>("/v3/paths/list");

      const path = data.items.find((item) => item.name === pathName);

      if (!path) {
        return false;
      }

      /*
        RTMP publisher from
        FFmpeg / OBS / Larix

        example:
        source.type = rtspSession
        source.type = rtmpSession
      */

      return !!path.source;
    } catch (error) {
      console.error("❌ Publisher check error", error);

      return false;
    }
  }

  /*
  ==================================
  Check HLS output
  ==================================
  */

  async isHLSEnabled(streamKey: string): Promise<boolean> {
    return new Promise((resolve) => {
      const url = `http://127.0.0.1:8888/live/${streamKey}/index.m3u8`;

      http
        .get(url, (res) => {
          resolve(res.statusCode === 200);
        })
        .on("error", () => {
          resolve(false);
        });
    });
  }

  /*
  ==================================
  HTTP REQUEST
  ==================================
  */

  private async request<T>(path: string): Promise<T> {
    return new Promise((resolve, reject) => {
      http
        .get(this.apiUrl + path, (res) => {
          let body = "";

          res.on("data", (chunk) => {
            body += chunk;
          });

          res.on("end", () => {
            try {
              const json = JSON.parse(body);

              resolve(json as T);
            } catch (error) {
              reject(error);
            }
          });
        })
        .on("error", reject);
    });
  }
}
