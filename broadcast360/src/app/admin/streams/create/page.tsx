"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import StreamForm from "@/components/admin/streams/StreamForm";

type Channel = {
  id: number;
  name: string;
};

export default function CreateStreamPage() {
  const router = useRouter();

  const [channels, setChannels] = useState<Channel[]>([]);

  const [loading, setLoading] = useState(false);

  async function fetchChannels() {
    try {
      const res = await fetch("/api/channels?page=1&limit=100");

      const json = await res.json();

      console.log("CHANNEL API:", json);

      /*
        API response:

        {
          data:[
            {
              id:1,
              name:"Channel 1"
            }
          ],
          total:1
        }

      */

      setChannels(json.data ?? []);
    } catch (error) {
      console.error("Channel fetch error", error);
    }
  }

  useEffect(() => {
    fetchChannels();
  }, []);

  async function createStream(data: any) {
    try {
      setLoading(true);

      const res = await fetch("/api/streams", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(data),
      });

      const json = await res.json();

      console.log("CREATE STREAM RESPONSE:", json);

      if (!res.ok) {
        alert(json.message ?? "Create failed");

        return;
      }

      router.push("/admin/streams");
    } catch (error) {
      console.error(error);

      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
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
      <div
        className="
        max-w-3xl
        "
      >
        <h1
          className="
          text-2xl
          font-bold
          mb-6
          "
        >
          Create Stream
        </h1>

        <StreamForm
          channels={channels}
          onSubmit={createStream}
          loading={loading}
          onCancel={() =>
    router.push("/admin/streams")
  }
        />
      </div>
    </div>
  );
}
