import { fetchChannels} 
from "@/services/channel.service";

// get all channels
export async function GET() {
  try {
    const channels = await fetchChannels();
    return Response.json(channels);

  } catch (error) {
    console.error("Database operation failed: to get channels", error);
    return Response.json(
      {message: "Failed to get channels"},
      {status:500}
    );
  }
}

