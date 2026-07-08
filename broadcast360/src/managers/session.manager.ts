export class SessionManager {
  private active = new Map<number, boolean>();

  isLive(channelId: number) {
    return this.active.get(channelId) === true;
  }

  start(channelId: number) {
    if (this.isLive(channelId)) {
      throw new Error("Channel already live");
    }
    this.active.set(channelId, true);
  }

  stop(channelId: number) {
    this.active.set(channelId, false);
  }
}