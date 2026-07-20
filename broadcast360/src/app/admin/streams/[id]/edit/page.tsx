"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import StreamForm from "@/components/admin/streams/StreamForm";

type Channel = {
  id: number;
  name: string;
};

export default function EditStreamPage() {
  const router = useRouter();

  const params = useParams();

  const id = params.id;

  const [channels, setChannels] = useState<Channel[]>([]);

  const [stream, setStream] = useState<any>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {

async function load(){

try{

const c = await fetch(
"/api/channels?page=1&limit=100"
);

const cj = await c.json();


setChannels(cj.data ?? []);



const s = await fetch(
`/api/streams/${id}`
);


const sj = await s.json();



if(sj.success){

setStream({

name:sj.data.name,

url:sj.data.url,

protocol:sj.data.protocol,

channelId:sj.data.channelId,

description:sj.data.description ?? ""

});

}


}catch(error){

console.error(error);

}


}


load();


},[id]);

  async function update(data: any) {
    try {
      setLoading(true);

      await fetch(`/api/streams/${id}`, {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(data),
      });

      router.push("/admin/streams");
    } finally {
      setLoading(false);
    }
  }

  if (!stream) {
    return <div className="p-8 text-white">Loading...</div>;
  }

  return (
    <div
      className="
min-h-screen
bg-[#010312]
p-8
text-white
"
    >
      <h1
        className="
text-2xl
font-bold
mb-6
"
      >
        Edit Stream
      </h1>

      <StreamForm
        channels={channels}
        initialData={stream}
        onSubmit={update}
        onCancel={() => router.back()}
        loading={loading}
      />
    </div>
  );
}
