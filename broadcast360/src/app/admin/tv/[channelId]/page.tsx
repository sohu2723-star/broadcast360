"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";
import { useParams } from "next/navigation";

export default function TVPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const hlsRef = useRef<Hls | null>(null);
  const checkTimerRef = useRef<NodeJS.Timeout | null>(null);

  const params = useParams();
  const channelId = params.channelId;


  useEffect(() => {

    const video = videoRef.current;

    if (!video || !channelId) return;


    const streamUrl =
      `/streams/channel-${channelId}/index.m3u8`;


    const startPlayer = () => {

      console.log("▶ Starting HLS player");


      // prevent duplicate player
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }


      const hls = new Hls({
        liveSyncDurationCount: 3,
        enableWorker: true,
      });


      hlsRef.current = hls;


      hls.loadSource(streamUrl);

      hls.attachMedia(video);


      hls.on(
        Hls.Events.MANIFEST_PARSED,
        () => {

          console.log("✅ HLS ready");

          video.play()
            .catch(() => {});

        }
      );


      hls.on(
        Hls.Events.ERROR,
        (_, data) => {

          console.log(
            "HLS error:",
            data
          );


          if (!data.fatal) return;


          switch(data.type){

            case Hls.ErrorTypes.NETWORK_ERROR:

              console.log(
                "Recover network"
              );

              hls.startLoad();

              break;


            case Hls.ErrorTypes.MEDIA_ERROR:

              console.log(
                "Recover media"
              );

              hls.recoverMediaError();

              break;


            default:

              hls.destroy();

              setTimeout(
                startPlayer,
                3000
              );

          }

        }
      );

    };



    const waitForStream = () => {


      checkTimerRef.current =
        setInterval(async()=>{

          try {

            const res =
              await fetch(
                `${streamUrl}?t=${Date.now()}`
              );


            if(res.ok){

              console.log(
                "✅ Stream found"
              );


              if(checkTimerRef.current){

                clearInterval(
                  checkTimerRef.current
                );

                checkTimerRef.current=null;
              }


              startPlayer();

            }


          } catch {

            console.log(
              "⏳ Waiting stream..."
            );

          }


        },3000);

    };



    // Safari native HLS
    if(
      video.canPlayType(
        "application/vnd.apple.mpegurl"
      )
    ){

      video.src = streamUrl;

      video.play()
        .catch(()=>{});


    }
    else if(
      Hls.isSupported()
    ){

      waitForStream();

    }



    return ()=>{


      if(checkTimerRef.current){

        clearInterval(
          checkTimerRef.current
        );

      }


      hlsRef.current?.destroy();

      hlsRef.current=null;


    };


  },[channelId]);



  return (

    <div
      style={{
        background:"black",
        height:"100vh"
      }}
    >

      <video
        ref={videoRef}
        controls
        autoPlay
        muted
        playsInline
        style={{
          width:"100%",
          height:"100%"
        }}
      />

    </div>

  );
}