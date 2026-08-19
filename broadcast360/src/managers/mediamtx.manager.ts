export class MediaMTXManager {

  private api =
    "http://127.0.0.1:9997";

  /*
   * ==========================================
   * GET PATH
   * ==========================================
   */

  async getPath(path: string) {

    try {

      const encodedPath = path
        .split("/")
        .map(encodeURIComponent)
        .join("/");

      const response = await fetch(
        `${this.api}/v3/paths/get/${encodedPath}`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        return null;
      }

      return await response.json();

    } catch (error) {

      console.error(
        "❌ MediaMTX GET PATH ERROR:",
        path,
        error
      );

      return null;
    }
  }


  /*
   * ==========================================
   * PATH ONLINE
   * ==========================================
   */

  async isOnline(
    path: string
  ): Promise<boolean> {

    const data =
      await this.getPath(path);

    return data?.online === true;
  }


  /*
   * ==========================================
   * LIVE INPUT
   *
   * Larix -> live/{streamKey}
   * ==========================================
   */

  async isLiveInputOnline(
    streamKey: string
  ): Promise<boolean> {

    return this.isOnline(
      `live/${streamKey}`
    );
  }


  /*
   * ==========================================
   * PROCESSED LIVE SOURCE
   *
   * FFmpeg -> source/{streamKey}
   * ==========================================
   */

  async isLiveSourceOnline(
    streamKey: string
  ): Promise<boolean> {

    return this.isOnline(
      `source/${streamKey}`
    );
  }


  /*
   * ==========================================
   * VOD
   * ==========================================
   */

  async isVodOnline(
    channelId: number
  ): Promise<boolean> {

    return this.isOnline(
      `vod/${channelId}`
    );
  }


  /*
   * ==========================================
   * FINAL CHANNEL
   *
   * RelayRouter -> channel/{streamKey}
   * ==========================================
   */

  async isChannelOnline(
    streamKey: string
  ): Promise<boolean> {

    return this.isOnline(
      `channel/${streamKey}`
    );
  }


  /*
   * ==========================================
   * COMPLETE CHANNEL STATE
   * ==========================================
   */

  async getChannelState(
    channelId: number,
    streamKey: string
  ) {

    const [
      liveInput,
      liveSource,
      vod,
      channel,
    ] = await Promise.all([

      this.getPath(
        `live/${streamKey}`
      ),

      this.getPath(
        `source/${streamKey}`
      ),

      this.getPath(
        `vod/${channelId}`
      ),

      this.getPath(
        `channel/${streamKey}`
      ),

    ]);


    const liveInputOnline =
      liveInput?.online === true;

    const liveSourceOnline =
      liveSource?.online === true;

    const vodOnline =
      vod?.online === true;

    const channelOnline =
      channel?.online === true;


    let status:
      | "live"
      | "vod"
      | "offline";


    /*
     * Processed LIVE source has priority.
     */

    if (liveSourceOnline) {

      status = "live";

    } else if (vodOnline) {

      status = "vod";

    } else {

      status = "offline";
    }


    return {

      status,

      liveInputOnline,

      liveSourceOnline,

      vodOnline,

      channelOnline,

      liveInput,

      liveSource,

      vod,

      channel,

    };
  }


  /*
   * ==========================================
   * WAIT FOR PATH
   * ==========================================
   */

  async waitPublisher(
    path: string,
    timeout = 15000
  ) {

    console.log(
      "⏳ WAIT MEDIA PATH:",
      path
    );

    const start =
      Date.now();


    while (
      Date.now() - start <
      timeout
    ) {

      if (
        await this.isOnline(path)
      ) {

        console.log(
          "✅ MEDIA PATH READY:",
          path
        );

        return true;
      }


      await new Promise(
        resolve =>
          setTimeout(resolve, 500)
      );
    }


    throw new Error(
      `MediaMTX timeout: ${path}`
    );
  }


  /*
   * ==========================================
   * STREAM HEALTH
   * ==========================================
   */

  async getStreamHealth(
    path: string
  ) {

    try {

      const data =
        await this.getPath(path);


      if (!data) {

        return {
          mediaMTX: "Offline",
          source: "Disconnected",
          hls: "Unavailable",
          readersCount: 0,
          online: false,
          ready: false,
        };
      }


      const online =
        data.online === true;

      const ready =
        data.ready === true;


      return {

        mediaMTX:
          online
            ? "Healthy"
            : "Idle",

        source:
          online
            ? "Connected"
            : "Disconnected",

        hls:
          ready
            ? "Available"
            : "Unavailable",

        readersCount:
          Array.isArray(data.readers)
            ? data.readers.length
            : 0,

        online,

        ready,
      };

    } catch (error) {

      console.error(
        "❌ STREAM HEALTH ERROR:",
        error
      );

      return {

        mediaMTX: "Unhealthy",

        source: "Disconnected",

        hls: "Unavailable",

        readersCount: 0,

        online: false,

        ready: false,
      };
    }
  }
}