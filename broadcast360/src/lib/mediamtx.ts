export const MEDIA_MTX = {
  host: process.env.MEDIA_MTX_HOST || "localhost",

  rtmpPort: process.env.MEDIA_MTX_RTMP_PORT || "1935",

  hlsPort: process.env.MEDIA_MTX_HLS_PORT || "8888",

  webRtcPort: process.env.MEDIA_MTX_WEBRTC_PORT || "8889",

  rtspPort: process.env.MEDIA_MTX_RTSP_PORT || "8554",
};

export function getRTMPPublishUrl(streamKey: string) {
  return `rtmp://${MEDIA_MTX.host}:${MEDIA_MTX.rtmpPort}/${streamKey}`;
}

export function getRTSPPublishUrl(streamKey: string) {
  return `rtsp://${MEDIA_MTX.host}:${MEDIA_MTX.rtspPort}/${streamKey}`;
}

export function getHLSPlaybackUrl(streamKey: string) {
  return `http://${MEDIA_MTX.host}:${MEDIA_MTX.hlsPort}/${streamKey}/index.m3u8`;
}

export function getWebRTCPlaybackUrl(streamKey: string) {
  return `http://${MEDIA_MTX.host}:${MEDIA_MTX.webRtcPort}/${streamKey}`;
}