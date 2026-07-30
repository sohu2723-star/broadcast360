"use client";

import type { Channel } from "@/types/channel";


interface Props {
  value: string;
  channels: Channel[];
  onChange: (value: string) => void;
}


export default function ChannelFilter({
  value,
  channels,
  onChange,
}: Props) {


  return (

    <select
  value={value}
  onChange={(e) => onChange(e.target.value)}
  className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-[#106EE9]"
>

      <option value="">
        All Channels
      </option>


      {channels.map((channel) => (

        <option
          key={channel.id}
          value={channel.id}
        >

          {channel.name}

        </option>

      ))}


    </select>

  );

}