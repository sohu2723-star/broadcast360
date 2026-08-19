"use client";

import { useEffect, useRef } from "react";
import type { NewsItem } from "@/services/news.service";
import authApi from "@/lib/authapi";

interface Props {
    news: NewsItem;
}

export default function NewsVideoPlayer({
    news,
}: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);

    const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const resumeAppliedRef = useRef(false);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

    const getFullUrl = (url: string | null) => {
        if (!url) return null;

        return url.startsWith("http")
            ? url
            : `${baseUrl}${url}`;
    };

    const videoUrl = getFullUrl(news.videoUrl);

    useEffect(() => {
        const video = videoRef.current;

        if (!video || !videoUrl) {
            return;
        }

        video.pause();

        video.src = videoUrl;

        video.load();

        resumeAppliedRef.current = false;

        // =====================================
        // LOAD PREVIOUS WATCH PROGRESS
        // =====================================

        const loadProgress = async () => {
            try {
                const response = await authApi.get(
                    "/api/user-portal/auth/history"
                );

                const history = response.data.history ?? [];

                console.log("Watch history:", history);

                // =====================================
                // FIND NEWS DIRECTLY
                // =====================================

                const newsHistory = history.find(
                    (item: any) => Number(item.news?.id) === Number(news.id)
                );

                if (!newsHistory) {
                    console.log(
                        "No previous history for news:",
                        news.id
                    );
                    return;
                }

                const progress = Number(
                    newsHistory.progressSeconds ?? 0
                );

                const savedDuration = Number(
                    newsHistory.durationSeconds ?? 0
                );

                console.log("News history found:", {
                    newsId: news.id,
                    progress,
                    savedDuration,
                });

                if (progress <= 0) {
                    return;
                }

                // =====================================
                // APPLY RESUME AFTER VIDEO METADATA LOADS
                // =====================================

                const applyProgress = () => {
                    if (resumeAppliedRef.current) {
                        return;
                    }

                    if (
                        !Number.isFinite(video.duration) ||
                        video.duration <= 0
                    ) {
                        console.log(
                            "Video duration is not ready yet"
                        );
                        return;
                    }

                    // Don't resume if finished
                    if (
                        progress >= video.duration - 5
                    ) {
                        console.log(
                            "News was already completed"
                        );
                        return;
                    }

                    video.currentTime = Math.min(
                        progress,
                        video.duration - 1
                    );

                    resumeAppliedRef.current = true;

                    console.log(
                        `✅ Resuming news ${news.id} from ${progress}s`
                    );
                };

                // Metadata already available
                if (
                    video.readyState >= 1 &&
                    Number.isFinite(video.duration)
                ) {
                    applyProgress();
                } else {
                    // Wait for metadata
                    video.addEventListener(
                        "loadedmetadata",
                        applyProgress,
                        { once: true }
                    );
                }
            } catch (error: any) {
                console.log(
                    "No news watch history available:",
                    error?.response?.status
                );
            }
        };

        loadProgress();

        // =====================================
        // SAVE WATCH HISTORY
        // =====================================

        const saveHistory = async () => {
            if (
                !video.duration ||
                !Number.isFinite(video.duration)
            ) {
                return;
            }

            const progressSeconds = Math.floor(
                video.currentTime
            );

            if (progressSeconds <= 0) {
                return;
            }

            try {
                await authApi.post(
                    "/api/user-portal/auth/history",
                    {
                        newsId: news.id,

                        progressSeconds,

                        durationSeconds: Math.floor(
                            video.duration
                        ),
                    }
                );

                console.log(
                    "News watch history saved:",
                    news.id,
                    progressSeconds
                );
            } catch (error: any) {
                console.log(
                    "News watch history not saved:",
                    error?.response?.status
                );
            }
        };

        // =====================================
        // START PERIODIC SAVE
        // =====================================

        const handleMetadata = () => {
            console.log(
                "News video metadata loaded:",
                video.duration
            );

            if (saveIntervalRef.current) {
                clearInterval(
                    saveIntervalRef.current
                );
            }

            saveIntervalRef.current =
                setInterval(saveHistory, 10000);
        };

        video.addEventListener(
            "loadedmetadata",
            handleMetadata
        );

        // =====================================
        // SAVE WHEN VIDEO ENDS
        // =====================================

        video.addEventListener(
            "ended",
            saveHistory
        );

        // =====================================
        // CLEANUP
        // =====================================

        return () => {
            video.removeEventListener(
                "loadedmetadata",
                handleMetadata
            );

            video.removeEventListener(
                "ended",
                saveHistory
            );

            if (saveIntervalRef.current) {
                clearInterval(
                    saveIntervalRef.current
                );

                saveIntervalRef.current = null;
            }

            video.pause();
            video.removeAttribute("src");
            video.load();
        };
    }, [news.id, news.videoUrl]);

    // =====================================
    // NO VIDEO
    // =====================================

    if (!videoUrl) {
        return (
            <div className="flex aspect-video items-center justify-center rounded-xl bg-black text-gray-500">
                No video available
            </div>
        );
    }

    // =====================================
    // PLAYER
    // =====================================

    return (
        <video
            key={news.id}
            ref={videoRef}
            controls
            autoPlay
            playsInline
            preload="metadata"
            controlsList="nodownload"
            disablePictureInPicture
            className="aspect-video w-full rounded-xl bg-black object-contain"
        />
    );
}