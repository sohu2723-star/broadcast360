import { NextRequest, NextResponse } from "next/server";
import { StreamService } from "@/services/stream.service";


const service = new StreamService();


// GET ALL STREAMS
export async function GET(request: Request) {

  try {

    const { searchParams } = new URL(request.url);


    const page = Math.max(
      1,
      Number(searchParams.get("page") ?? 1)
    );


    const limit = Math.max(
      1,
      Number(searchParams.get("limit") ?? 10)
    );


    const search =
      searchParams.get("search") ?? undefined;



    const streams = await service.getAll({
      page,
      limit,
      search,
    });



    return NextResponse.json({

      success:true,

      ...streams,

    });



  } catch(error) {


    console.error(
      "GET streams error:",
      error
    );


    return NextResponse.json(

      {
        success:false,
        message:"Failed to fetch streams"
      },

      {
        status:500
      }

    );

  }

}



// CREATE STREAM
export async function POST(
  req:NextRequest
){

  try {

    const body = await req.json();


    const stream = await service.create({
      channelId:Number(body.channelId),
      name:body.name,
      url:body.url,
      protocol:body.protocol,
      description:body.description,
    });



    return NextResponse.json(
      {
        success:true,
        data:stream,
      },
      {
        status:201
      }
    );


  }catch(error:unknown){

    console.error(error);


    return NextResponse.json(
      {
        success:false,
        message:error ?? "Create failed"
      },
      {
        status:400
      }
    );

  }

}