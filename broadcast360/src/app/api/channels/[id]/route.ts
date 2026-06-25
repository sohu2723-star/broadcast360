import { fetchChannelById } 
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
