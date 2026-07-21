import { NextRequest, NextResponse } from "next/server";

import {
    fetchEntertainmentById,
    editEntertainment,
    removeEntertainment,
} from "@/services/entertainment.service";


// GET ENTERTAINMENT BY ID

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {

    try {

        const { id } = await params;

        const entertainmentId = Number(id);


        if (isNaN(entertainmentId)) {

            return NextResponse.json(
                {
                    message: "Invalid ID",
                },
                {
                    status: 400,
                }
            );

        }



        const entertainment =
            await fetchEntertainmentById(
                entertainmentId
            );



        if (!entertainment) {

            return NextResponse.json(
                {
                    message: "Entertainment not found",
                },
                {
                    status: 404,
                }
            );

        }



        return NextResponse.json(
            entertainment
        );



    } catch (error) {

        console.error(
            "Failed to get entertainment:",
            error
        );


        return NextResponse.json(
            {
                message:
                    "Failed to get entertainment",
            },
            {
                status: 500,
            }
        );

    }

}





// UPDATE ENTERTAINMENT

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {

    try {


        const { id } = await params;


        const entertainmentId =
            Number(id);



        if (isNaN(entertainmentId)) {

            return NextResponse.json(
                {
                    message: "Invalid ID",
                },
                {
                    status: 400,
                }
            );

        }



        const formData =
            await req.formData();

const videoFile = formData.get("video");

const thumbnailFile = formData.get("thumbnail");


const data = {
    title: String(formData.get("title") || ""),
    description: String(formData.get("description") || ""),
    category: String(formData.get("category") || ""),
    releaseYear: Number(formData.get("releaseYear")),
    duration: Number(formData.get("duration")),

    thumbnail:
      thumbnailFile instanceof File &&
      thumbnailFile.size > 0
        ? thumbnailFile
        : undefined,

    video:
      videoFile instanceof File &&
      videoFile.size > 0
        ? videoFile
        : undefined,
};


        const updatedEntertainment =
            await editEntertainment(
                entertainmentId,
                data
            );




        return NextResponse.json(
            updatedEntertainment
        );



    } catch (error) {


    console.error(
        "Failed to update entertainment:",
        error
    );


    return NextResponse.json(
        {
            message:
                error instanceof Error
                    ? error.message
                    : "Update failed",
        },
        {
            status: 500,
        }
    );


}
}





// DELETE ENTERTAINMENT

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {


    try {


        const { id } = await params;


        const entertainmentId =
            Number(id);




        if (isNaN(entertainmentId)) {

            return NextResponse.json(
                {
                    message: "Invalid ID",
                },
                {
                    status: 400,
                }
            );

        }





        const entertainment =
            await fetchEntertainmentById(
                entertainmentId
            );




        if (!entertainment) {

            return NextResponse.json(
                {
                    message:
                        "Entertainment not found",
                },
                {
                    status: 404,
                }
            );

        }





        await removeEntertainment(
            entertainmentId
        );




        return NextResponse.json(
            {
                message:
                    "Entertainment deleted successfully",
            }
        );




    } catch (error) {


        console.error(
            "Failed to delete entertainment:",
            error
        );



        return NextResponse.json(
            {
                message:
                    "Delete failed",
            },
            {
                status: 500,
            }
        );


    }

}


