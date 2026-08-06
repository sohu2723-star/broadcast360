export class MediaMTXManager {
  private api = "http://127.0.0.1:9997";

  /* ==========================
        GET PATH
  ========================== */
  async getPath(path: string) {
    try {
      const response = await fetch(`${this.api}/v3/paths/get/${path}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.log("❌ MediaMTX API ERROR", error);
      return null;
    }
  }

  /* ==========================
        CHECK PUBLISHER
  ========================== */
  async isOnline(path: string): Promise<boolean> {
    const data = await this.getPath(path);
    if (!data) return false;
    return data.source !== null && data.source !== undefined;
  }

  /* ==========================
        WAIT PUBLISHER
  ========================== */
  async waitPublisher(path: string, timeout = 15000) {
    console.log("⏳ WAIT MEDIA PATH", path);
    const start = Date.now();

    while (Date.now() - start < timeout) {
      if (await this.isOnline(path)) {
        console.log("✅ MEDIA PATH READY", path);
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log("❌ MEDIA PATH TIMEOUT", path);
    throw new Error(`MediaMTX timeout: ${path}`);
  }

  /*
  ==========================
        ADDITION: STREAM HEALTH
  ==========================
  */
  async getStreamHealth(path: string) {
    try {
      const pathData = await this.getPath(path);

      if (!pathData) {
        return {
          mediaMTX: "Offline",
          rtmp: "Disconnected",
          hls: "Unavailable",
          readersCount: 0,
        };
      }

      const hasSource = pathData.source !== null && pathData.source !== undefined;

      return {
        mediaMTX: "Healthy",
        rtmp: hasSource ? "Connected" : "Disconnected",
        hls: pathData.ready ? "Available" : "Unavailable",
        readersCount: Array.isArray(pathData.readers) ? pathData.readers.length : 0,
      };
    } catch (error) {
      return {
        mediaMTX: "Unhealthy",
        rtmp: "Disconnected",
        hls: "Unavailable",
        readersCount: 0,
      };
    }
  }
}