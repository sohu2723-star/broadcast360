"use client";

import { useEffect, useMemo, useState } from "react";
import { Tv } from "lucide-react";
import ChannelPlayer from "./ChannelPlayer";

interface Channel {
    id: number;
    name: string;
    streamKey: string;
}

interface ChannelApiResponse {
    data?: Channel[];
    channels?: Channel[];
    items?: Channel[];
}

const GROUP_SIZE = 5;

export default function TVPage() {
    const [channels, setChannels] = useState<Channel[]>([]);
    const [loading, setLoading] = useState(true);

    // Current group
    // 0 = CH 1-5
    // 1 = CH 6-10
    // etc.
    const [groupIndex, setGroupIndex] = useState(0);

    // Main / focused channel
    const [selectedChannelId, setSelectedChannelId] =
        useState<number | null>(null);

    /*
     * ============================================================
     * LOAD CHANNELS
     * ============================================================
     */

    useEffect(() => {
        async function loadChannels() {
            try {
                setLoading(true);

                const response = await fetch(
                    "/api/channels?page=1&limit=100",
                    {
                        cache: "no-store",
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        `Channel API returned ${response.status}`
                    );
                }

                const result =
                    (await response.json()) as
                    | Channel[]
                    | ChannelApiResponse;

                console.log(" Channel API:", result);

                let channelList: Channel[] = [];

                if (Array.isArray(result)) {
                    channelList = result;
                } else if (Array.isArray(result.data)) {
                    channelList = result.data;
                } else if (
                    Array.isArray(result.channels)
                ) {
                    channelList = result.channels;
                } else if (
                    Array.isArray(result.items)
                ) {
                    channelList = result.items;
                }

                console.log(
                    " Channels loaded:",
                    channelList
                );

                setChannels(channelList);

                if (channelList.length > 0) {
                    setSelectedChannelId(
                        channelList[0].id
                    );
                }
            } catch (error) {
                console.error(
                    " Failed to load channels:",
                    error
                );

                setChannels([]);
            } finally {
                setLoading(false);
            }
        }

        loadChannels();
    }, []);

    /*
     * ============================================================
     * CREATE GROUPS OF 5
     * ============================================================
     */

    const channelGroups = useMemo(() => {
        const groups: Channel[][] = [];

        for (
            let i = 0;
            i < channels.length;
            i += GROUP_SIZE
        ) {
            groups.push(
                channels.slice(
                    i,
                    i + GROUP_SIZE
                )
            );
        }

        return groups;
    }, [channels]);

    /*
     * ============================================================
     * CURRENT GROUP
     * ============================================================
     */

    const currentGroup =
        channelGroups[groupIndex] ?? [];

    /*
     * ============================================================
     * CURRENT MAIN CHANNEL
     * ============================================================
     */

    const selectedChannel =
        currentGroup.find(
            (channel) =>
                channel.id ===
                selectedChannelId
        ) ?? null;

    /*
     * ============================================================
     * OTHER CHANNELS
     * ============================================================
     */

    const otherChannels =
        currentGroup.filter(
            (channel) =>
                channel.id !==
                selectedChannelId
        );

    /*
     * ============================================================
     * MAKE SURE MAIN CHANNEL BELONGS TO CURRENT GROUP
     * ============================================================
     */

    useEffect(() => {
        if (currentGroup.length === 0) {
            setSelectedChannelId(null);
            return;
        }

        const selectedExists =
            currentGroup.some(
                (channel) =>
                    channel.id ===
                    selectedChannelId
            );

        if (!selectedExists) {
            setSelectedChannelId(
                currentGroup[0].id
            );
        }
    }, [
        currentGroup,
        selectedChannelId,
    ]);

    /*
     * ============================================================
     * CHANGE GROUP
     * ============================================================
     */

    function handleGroupChange(
        newGroupIndex: number
    ) {
        setGroupIndex(newGroupIndex);

        const newGroup =
            channelGroups[newGroupIndex];

        /*
         * Automatically make the first
         * channel of the group the main.
         */
        if (
            newGroup &&
            newGroup.length > 0
        ) {
            setSelectedChannelId(
                newGroup[0].id
            );
        }
    }

    /*
     * ============================================================
     * CHANGE MAIN CHANNEL
     * ============================================================
     */

    function handleChannelChange(
        channelId: number
    ) {
        /*
         * Make sure the selected channel
         * is actually inside the current group.
         */
        const existsInGroup =
            currentGroup.some(
                (channel) =>
                    channel.id === channelId
            );

        if (!existsInGroup) {
            return;
        }

        setSelectedChannelId(channelId);
    }

    /*
     * ============================================================
     * LOADING
     * ============================================================
     */

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black text-white">
                <div className="text-center">

                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-700 border-t-blue-500" />

                    <p className="mt-4 text-sm text-gray-400">
                        Loading channels...
                    </p>

                </div>
            </div>
        );
    }

    /*
     * ============================================================
     * NO CHANNELS
     * ============================================================
     */

    if (channels.length === 0) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black text-white">

                <div className="text-center">

                    <div className="flex justify-center text-[#7898bf]">
                        <Tv size={48} strokeWidth={1.5} aria-hidden="true" />
                    </div>

                    <h2 className="mt-4 text-xl font-semibold">
                        No channels found
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        Please create a channel first.
                    </p>

                </div>

            </div>
        );
    }

    /*
     * ============================================================
     * PAGE
     * ============================================================
     */

    return (
        <div className="min-h-screen bg-black text-white">

            {/* ======================================================
          HEADER
      ======================================================= */}

            <header className="border-b border-gray-800 bg-gray-950">

                <div className="mx-auto max-w-[1800px] px-6 py-4">

                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                        <div>

                            <h1 className="text-xl font-bold">
                                FlickScope
                            </h1>

                            <p className="text-sm text-gray-400">
                                TV Channel Monitor
                            </p>

                        </div>

                        <div className="text-sm text-gray-400">

                            Total Channels:

                            <span className="ml-2 font-bold text-white">
                                {channels.length}
                            </span>

                        </div>

                    </div>

                </div>

            </header>

            {/* ======================================================
          CONTROL BAR
      ======================================================= */}

            <div className="border-b border-gray-800 bg-gray-950">

                <div className="mx-auto max-w-[1800px] px-6 py-4">

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

                        {/* =================================================
                GROUP SELECTOR
            ================================================== */}

                        <div className="flex items-center gap-3">

                            <label
                                htmlFor="channel-group"
                                className="whitespace-nowrap text-sm font-medium text-gray-400"
                            >
                                Channel Group
                            </label>

                            <select
                                id="channel-group"
                                value={groupIndex}
                                onChange={(event) =>
                                    handleGroupChange(
                                        Number(
                                            event.target.value
                                        )
                                    )
                                }
                                className="min-w-[230px] rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-white outline-none transition focus:border-blue-500"
                            >

                                {channelGroups.map(
                                    (group, index) => {

                                        const firstChannel =
                                            index *
                                            GROUP_SIZE +
                                            1;

                                        const lastChannel =
                                            firstChannel +
                                            group.length -
                                            1;

                                        return (
                                            <option
                                                key={index}
                                                value={index}
                                            >
                                                Group {index + 1} — CH{" "}
                                                {firstChannel}–
                                                {lastChannel}
                                            </option>
                                        );
                                    }
                                )}

                            </select>

                        </div>

                        {/* =================================================
    ALL CHANNEL SELECTOR
================================================== */}

                        <div className="flex items-center gap-3">

                            <label
                                htmlFor="main-channel"
                                className="whitespace-nowrap text-sm font-medium text-gray-400"
                            >
                                Main Channel
                            </label>

                            <select
                                id="main-channel"
                                value={selectedChannelId ?? ""}
                                onChange={(event) => {
                                    const channelId = Number(
                                        event.target.value
                                    );

                                    const channel =
                                        channels.find(
                                            (item) =>
                                                item.id === channelId
                                        );

                                    if (!channel) {
                                        return;
                                    }

                                    /*
                                     * Find which group contains
                                     * this channel.
                                     */
                                    const newGroupIndex =
                                        Math.floor(
                                            channels.findIndex(
                                                (item) =>
                                                    item.id === channelId
                                            ) / GROUP_SIZE
                                        );

                                    /*
                                     * Switch to that group.
                                     */
                                    setGroupIndex(
                                        newGroupIndex
                                    );

                                    /*
                                     * Make selected channel
                                     * the main channel.
                                     */
                                    setSelectedChannelId(
                                        channelId
                                    );
                                }}
                                className="min-w-[280px] rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-white outline-none transition focus:border-blue-500"
                            >

                                {channels.map((channel) => (
                                    <option
                                        key={channel.id}
                                        value={channel.id}
                                    >
                                        CH {channel.id} — {channel.name}
                                    </option>
                                ))}

                            </select>

                        </div>

                        {/* =================================================
                CURRENT GROUP INFO
            ================================================== */}

                        <div className="ml-auto flex items-center gap-3">

                            <span className="text-sm text-gray-500">
                                Monitoring
                            </span>

                            <span className="rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm font-semibold text-white">
                                {currentGroup.length}/5
                            </span>

                        </div>

                    </div>

                </div>

            </div>

            {/* ======================================================
          TV MONITOR
      ======================================================= */}

            <main className="mx-auto max-w-[1800px] px-6 py-6">

                {selectedChannel && (
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">

                        {/* =================================================
                LEFT PREVIEWS
            ================================================== */}

                        <div className="flex flex-col gap-5 lg:col-span-3">

                            {otherChannels
                                .slice(0, 2)
                                .map((channel) => (

                                    <button
                                        key={channel.id}
                                        type="button"
                                        onClick={() =>
                                            handleChannelChange(
                                                channel.id
                                            )
                                        }
                                        className="block w-full cursor-pointer text-left transition hover:scale-[1.02]"
                                    >

                                        <ChannelPlayer
                                            channel={channel}
                                            isMain={false}
                                        />

                                    </button>

                                ))}

                        </div>

                        {/* =================================================
                MAIN PLAYER
            ================================================== */}

                        <div className="lg:col-span-6">

                            <div className="overflow-hidden rounded-xl border-2 border-blue-500">

                                <ChannelPlayer
                                    channel={
                                        selectedChannel
                                    }
                                    isMain={true}
                                />

                            </div>

                            {/* MAIN INFORMATION */}

                            <div className="mt-4 text-center">

                                <span className="inline-flex items-center gap-2 rounded-full bg-[#4f6689] px-4 py-1.5 text-xs font-bold">

                                    <span className="h-2 w-2 rounded-full bg-white" />

                                    MAIN CHANNEL

                                </span>

                                <h2 className="mt-3 text-2xl font-bold">
                                    {selectedChannel.name}
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Channel{" "}
                                    {selectedChannel.id}
                                </p>

                            </div>

                        </div>

                        {/* =================================================
                RIGHT PREVIEWS
            ================================================== */}

                        <div className="flex flex-col gap-5 lg:col-span-3">

                            {otherChannels
                                .slice(2, 4)
                                .map((channel) => (

                                    <button
                                        key={channel.id}
                                        type="button"
                                        onClick={() =>
                                            handleChannelChange(
                                                channel.id
                                            )
                                        }
                                        className="block w-full cursor-pointer text-left transition hover:scale-[1.02]"
                                    >

                                        <ChannelPlayer
                                            channel={channel}
                                            isMain={false}
                                        />

                                    </button>

                                ))}

                        </div>

                    </div>
                )}

                {/* ======================================================
            CURRENT CHANNEL LIST
        ======================================================= */}

                <div className="mt-6 rounded-xl border border-gray-800 bg-gray-950 p-4">

                    <div className="mb-3 flex items-center justify-between">

                        <div>

                            <h3 className="text-sm font-semibold text-white">
                                Current Group
                            </h3>

                            <p className="text-xs text-gray-500">
                                Select a channel to focus it
                            </p>

                        </div>

                        <span className="text-xs text-gray-500">
                            Group {groupIndex + 1}
                        </span>

                    </div>

                    <div className="flex flex-wrap gap-2">

                        {currentGroup.map(
                            (channel) => {

                                const isSelected =
                                    channel.id ===
                                    selectedChannelId;

                                return (
                                    <button
                                        key={channel.id}
                                        type="button"
                                        onClick={() =>
                                            handleChannelChange(
                                                channel.id
                                            )
                                        }
                                        className={`rounded-lg border px-4 py-2 text-sm transition ${isSelected
                                                ? "border-blue-500 bg-[#4f6689] text-white"
                                                : "border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-500 hover:text-white"
                                            }`}
                                    >
                                        CH {channel.id}{" "}
                                        — {channel.name}
                                    </button>
                                );
                            }
                        )}

                    </div>

                </div>

            </main>

        </div>
    );
}