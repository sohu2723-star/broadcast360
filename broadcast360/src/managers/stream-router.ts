export class StreamRouter {
  private active = new Map<number, "VOD" | "LIVE">();

  setVOD(channelId: number) {
    this.active.set(channelId, "VOD");
  }

  setLIVE(channelId: number) {
    this.active.set(channelId, "LIVE");
  }

  get(channelId: number) {
    return this.active.get(channelId) ?? null;
  }

  /**
   * Final channel output.
   *
   * This is what the viewer consumes through
   * HLS / WebRTC.
   */
  getOutput(streamKey: string) {
    return `rtmp://127.0.0.1:1935/channel/${streamKey}`;
  }

  /**
   * Internal normalized live source.
   */
  getSource(streamKey: string) {
    return `rtmp://127.0.0.1:1935/source/${streamKey}`;
  }

  /**
   * External live input path.
   *
   * Larix / other RTMP publisher uses:
   * rtmp://SERVER:1935/live/{streamKey}
   */
  getLiveInput(streamKey: string) {
    return `rtmp://127.0.0.1:1935/live/${streamKey}`;
  }
}