import { SessionManager } from "@/managers/session.manager";
import { FFmpegManager } from "@/managers/ffmpeg.manager";
import { PlaylistResolverService } from "@/services/playlist-resolver.service";
import { PlaylistManager } from "@/managers/playlist.manager";
import { ScheduleWithRelations } from "@/types/schedule.types";
import { getDefaultPlaylist } from "@/repositories/channel.repository";

export class BroadcastService {
  private session = new SessionManager();
  private ffmpeg = new FFmpegManager();
  private resolver = new PlaylistResolverService();

  // per-channel playlist state
  private playlists = new Map<number, PlaylistManager>();

  /**
   * START BROADCAST
   */
  async start(schedule: ScheduleWithRelations | null, channelId: number): Promise<void> {

      console.log("DEBUG schedule:", schedule);
      console.log("DEBUG channelId:", channelId);

  // prevent duplicate broadcast
  if (this.session.isLive(channelId)) {
    console.log("⚠ Channel already live");
    return;
  }


  let playlist;


  // 1. use scheduled playlist
  if (schedule?.playlist) {

    playlist = schedule.playlist;

    console.log(
      "📺 Using scheduled playlist:",
      playlist.name
    );

  } 
  else {

    // 2. fallback to default playlist
    const channel = await getDefaultPlaylist(channelId);

    playlist = channel?.defaultPlaylist;


    if (!playlist) {
      console.log(
        "⚠ No schedule and no default playlist"
      );
      return;
    }


    console.log(
      "📺 Using default playlist:",
      playlist.name
    );
  }

console.log("Playlist:", playlist);
console.log("Items:", playlist.items);
console.log("Items count:", playlist.items?.length);

  const items = playlist.items;


  if (!items || items.length === 0) {
    console.log("⚠ Playlist has no items");
    return;
  }



  // create session
  this.session.start(channelId);



  // create playlist manager
  const manager = new PlaylistManager();

  manager.load(items);


  this.playlists.set(
    channelId,
    manager
  );


  console.log(
    `▶ Broadcast started channel ${channelId}`
  );


  await this.playNext(channelId);
}

  /**
   * PLAY NEXT ITEM
   */
  private async playNext(channelId: number): Promise<void> {
    const manager = this.playlists.get(channelId);

    if (!manager) return;

    const item = manager.current();

    if (!item) {
      console.log("📺 Playlist ended");
      this.stop(channelId);
      return;
    }

    const inputs = this.resolver.resolve([item]);

    const input = inputs[0];

    if (!input) {
      console.log("⚠ Skip invalid item");
      manager.next();
      return this.playNext(channelId);
    }

    const outputDir = `./public/streams/channel-${channelId}`;

    console.log(`▶ Playing: ${input}`);

    const ffmpeg = this.ffmpeg.start(
      channelId,
      [input],
      outputDir
    );

    if (!ffmpeg) {
      console.log("❌ FFmpeg failed");
      return;
    }


    ffmpeg.on("close", async () => {
  console.log("⏭ Video finished");

  manager.next();

  setTimeout(() => {
    this.playNext(channelId);
  }, 1000);
});
  }

  /**
   * STOP BROADCAST
   */
  stop(channelId: number): void {
    this.ffmpeg.stop(channelId);
    this.session.stop(channelId);
    this.playlists.delete(channelId);

    console.log(`🛑 Broadcast stopped for channel ${channelId}`);
  }
}