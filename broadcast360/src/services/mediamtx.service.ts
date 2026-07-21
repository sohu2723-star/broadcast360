export class MediaMTXService {

  private rtmpHost = process.env.MEDIAMTX_RTMP_HOST ?? "localhost:1935";

  private hlsHost = process.env.MEDIAMTX_HLS_HOST ?? "localhost:8888";

  private webrtcHost =
    process.env.MEDIAMTX_WEBRTC_HOST ?? "localhost:8889";


  getPublishUrl(streamKey: string) {

    return `rtmp://${this.rtmpHost}/${streamKey}`;

  }


  getHlsUrl(streamKey: string) {

    return `http://${this.hlsHost}/${streamKey}/index.m3u8`;

  }


  getWebRTCUrl(streamKey: string) {

    return `http://${this.webrtcHost}/${streamKey}`;

  }


  getStreamInfo(streamKey: string) {

    return {

      streamKey,

      publishUrl:
        this.getPublishUrl(streamKey),

      hlsUrl:
        this.getHlsUrl(streamKey),

      webrtcUrl:
        this.getWebRTCUrl(streamKey),

    };

  }

}

export const mediaMTXService = new MediaMTXService();