import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  fetchEntertainments,
  addEntertainment,
} from "@/services/entertainment.service";

/* -------------------------
   VALIDATION
--------------------------*/
const entertainmentSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required"),

  description: z
    .string()
    .min(1, "Description is required"),

  category: z
    .string()
    .min(1, "Category is required"),

    releaseYear: z.number().optional(),

  duration: z.number().optional(),
});


/* -------------------------
   GET ENTERTAINMENTS
   pagination + search
--------------------------*/
export async function GET(
  request: NextRequest
) {
  try {

    const { searchParams } =
      new URL(request.url);


    const page = Math.max(
      1,
      parseInt(
        searchParams.get("page") ?? "1",
        10
      )
    );


    const limit = Math.max(
      1,
      parseInt(
        searchParams.get("limit") ?? "10",
        10
      )
    );


    const search =
      searchParams.get("search")
      ?? undefined;

   const result =
  await fetchEntertainments({
    page,
    limit,
    search,
  });


    return NextResponse.json({
  data: result.data,
  pagination: {
    page,
    limit,
    total: result.total,
  },
});


  } catch (error) {

    console.error(
      "GET ENTERTAINMENT ERROR =",
      error
    );


    return NextResponse.json(
      {
        message:
          "Failed to fetch entertainments",
      },
      {
        status:500,
      }
    );
  }
}



/* -------------------------
   CREATE ENTERTAINMENT
--------------------------*/
export async function POST(
  req: NextRequest
) {

  try {

    const formData =
      await req.formData();


    const rawData = {

      title:
        String(
          formData.get("title") ?? ""
        ),

      description:
        String(
          formData.get("description") ?? ""
        ),

      category:
        String(
          formData.get("category") ?? ""
        ),

      releaseYear:
        formData.get("releaseYear")
          ? Number(
              formData.get("releaseYear")
            )
          : undefined,


      duration:
        undefined,

    };


    const result =
      entertainmentSchema.safeParse(
        rawData
      );


    if (!result.success) {

      return NextResponse.json(
        {
          message:
            "Validation failed",

          errors:
            result.error.flatten(),
        },
        {
          status:400,
        }
      );

    }



    const video =
      formData.get("video");


    if (!(video instanceof File)) {

      return NextResponse.json(
        {
          message:
            "Video file is required",
        },
        {
          status:400,
        }
      );

    }



    const thumbnail =
      formData.get("thumbnail");


    if (!(thumbnail instanceof File)) {

      return NextResponse.json(
        {
          message:
            "Thumbnail is required",
        },
        {
          status:400,
        }
      );

    }



    const entertainment =
      await addEntertainment(
        formData
      );


    return NextResponse.json(
      entertainment,
      {
        status:201,
      }
    );


  }catch(error) {

  console.error(
    "POST ENTERTAINMENT ERROR =",
    error
  );


  // Duplicate title error
  if (
    error instanceof Error &&
    error.message.includes("Unique constraint")
  ) {

    return NextResponse.json(
      {
        message:
          "Entertainment title already exists",
      },
      {
        status:400,
      }
    );

  }


  return NextResponse.json(
    {
      message:
        error instanceof Error
          ? error.message
          : "Create entertainment error",
    },
    {
      status:400,
    }
  );

}
}