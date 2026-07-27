"use client";

import { useEffect, useRef } from "react";

import type { Entertainment } from "@/types/entertainment";


export default function VideoPlayer({
  entertainment,
}: {
  entertainment: Entertainment;
}) {


  const videoRef = useRef<HTMLVideoElement>(null);



  useEffect(() => {

    if (
      !videoRef.current ||
      !entertainment.videoUrl
    ) {
      return;
    }


    videoRef.current.src =
      entertainment.videoUrl;


    videoRef.current.load();


  }, [entertainment.videoUrl]);




  if (!entertainment.videoUrl) {

    return (

      <div className="flex aspect-video items-center justify-center rounded-xl bg-black text-gray-500">

        No video available

      </div>

    );

  }




  return (

    <video

      ref={videoRef}

      controls

      playsInline

      preload="metadata"

      controlsList="nodownload"

      disablePictureInPicture

      className="aspect-video w-full rounded-xl bg-black object-contain"

    />

  );
}