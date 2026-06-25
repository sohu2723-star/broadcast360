import { addChannel } 
from "@/services/channel.service";

// create channel
export async function POST(request:Request){
    try{
        const body = await request.json();
        const channel = await addChannel(body);
        return Response.json(channel);
    } catch (error) {
    console.error("Database operation failed: to create channels", error);
    return Response.json(
      {message: "Failed to create channels"},
      {status:500}
    );
  }
}