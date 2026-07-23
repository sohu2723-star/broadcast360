import ChannelForm from "@/components/admin/channels/ChannelForm";

async function getChannel(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/channels/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch channel");
  }
  return res.json();
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
      }}
    />
  );
}
