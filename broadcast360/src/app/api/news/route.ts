import { NextResponse } from "next/server";
import { NewsRepository } from "@/repositories/news.repository";


export async function GET() {

  try {

    const news =
      await NewsRepository.findAll();


    return NextResponse.json(
      news,
      {
        status:200,
      }
    );


  } catch(error){

    console.error(
      "GET NEWS ERROR",
      error
    );


    return NextResponse.json(
      {
        message:"Failed to fetch news"
      },
      {
        status:500,
      }
    );

  }

}