import { NextResponse } from "next/server";

import { uploadMediaFile } from "@/lib/media/storage";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size <= 0) {
      return NextResponse.json(
        { message: "No logo file" },
        { status: 400 },
      );
    }

    const url = await uploadMediaFile(file, "logos");
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Logo upload failed", error);
    return NextResponse.json(
      { message: "Logo upload failed" },
      { status: 500 },
    );
  }
}
