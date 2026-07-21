import { PlaylistItemWithRelations } from "@/types/playlist";

export class PlaylistLoopManager {

  private playlists = new Map<
    number,
    PlaylistItemWithRelations[]
  >();


  load(
    channelId:number,
    items:PlaylistItemWithRelations[]
  ){

    this.playlists.set(
      channelId,
      items
    );

  }


  getItems(channelId:number){

    return this.playlists.get(channelId) || [];

  }


  clear(channelId:number){

    this.playlists.delete(channelId);

  }

}