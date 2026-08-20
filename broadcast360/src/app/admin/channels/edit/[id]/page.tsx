import ChannelForm from "@/components/admin/channels/ChannelForm";
import { fetchChannelById } from "@/services/channel.service";

async function getChannel(id: string) {
  const channel = await fetchChannelById(Number(id));

  if (!channel) {
    throw new Error("Channel not found");
  }

  return channel;
}

export default async function EditChannelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const channel = await getChannel(id);

  return (
    <ChannelForm
      mode="edit"

      initialData={{
        id: channel.id,
        name: channel.name,
        country: channel.country ?? "",
        description: channel.description ?? "",
        logo: channel.logo ?? "",
         accessType:
          channel.accessType ?? "FREE",
      }}
    />
  );
}
