export class StreamRouter {

  private active =
    new Map<number, "VOD" | "LIVE">();


  setVOD(channelId:number){

    this.active.set(
      channelId,
      "VOD"
    );

  }


  setLIVE(channelId:number){

    this.active.set(
      channelId,
      "LIVE"
    );

  }


  get(channelId:number){

    return (
      this.active.get(channelId)
      ?? null
    );

  }


  getOutput(streamKey:string){

    return (
      `rtmp://127.0.0.1:1935/live/${streamKey}`
    );

  }


}