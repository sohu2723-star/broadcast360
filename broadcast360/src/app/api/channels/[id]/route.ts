import { fetchChannelById,removeChannel } 
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

// DELETE CHANNEL
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id:string }> }) {

    try {
        const { id } = await params;
        await removeChannel(Number(id));
        return Response.json({
        message:"Channel deleted"
  });
    } catch (error) {
    console.error("Database operation failed: to delete channel", error);
    return Response.json(
      {message: "Failed to delete channel"},
      {status:500}
    );
  }
}