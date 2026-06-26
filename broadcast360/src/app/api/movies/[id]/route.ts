import { NextRequest, NextResponse } from "next/server";

import {
  fetchMovieById,
  removeMovie,
  editMovie,
} from "@/services/movie.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const movie = await fetchMovieById(
    Number(id)
  );

  return NextResponse.json(movie);
}

export async function PUT(
req:NextRequest,
{params}:{params:Promise<{id:string}>}
){

try{

const {id}=await params;


const body = await req.json();


const movie = await editMovie(
Number(id),
{
title:body.title,
description:body.description,
releaseYear:body.releaseYear
}
);


return NextResponse.json(movie);


}catch(error){

console.error(error);


return NextResponse.json(
{
message:"Update failed"
},
{
status:500
}
);


}

}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await removeMovie(
    Number(id)
  );

  return NextResponse.json({
    message: "deleted",
  });
}