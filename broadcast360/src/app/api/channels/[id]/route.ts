import { fetchChannelById, editChannel } 
from "@/services/channel.service";

export async function GET(
  _request:Request,
  {params}:{params:Promise<{ id:string }>}){
    try{
        const { id } = await params;
        const channel = await fetchChannelById(Number(id));
         return Response.json(channel);
    } catch (error) {
    console.error("Database operation failed: to get channel by id", error);
    return Response.json(
      {message: "Failed to get channel by id"},
      {status:500}
    );
  }
}

// UPDATE CHANNEL
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id:string }> }) {
    try {
        const body = await request.json();
        const { id } = await params;
        const channel = await editChannel(
            Number(id),
            body
        );
        return Response.json(channel);
    } catch (error) {
    console.error("Database operation failed: to update channels", error);
    return Response.json(
      {message: "Failed to update channels"},
      {status:500}
    );
  }
}
