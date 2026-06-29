import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { advertisementSchema } from "@/lib/validators/advertisement.validator";
import { addAdvertisement, checkTitleExists } from "@/services/advertisement.service";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // extract raw data
    const rawData = {
      title: formData.get("title"),
      active: formData.get("active"),
      videoFile: formData.get("videoFile"),
    };

    // Base Zod Validation (Required Fields & Format Checklist)
    const result = advertisementSchema.safeParse(rawData);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Uploading failed",
          errors: result.error.flatten(),
        },
        { status: 400 }
      );
    }

    const validatedData = result.data;

    // Double Check: Database Title Unique Validation (Server-side Guard)
    // Frontend က စစ်ထားပေမယ့် API ခေါ်ယူမှု တိုက်ရိုက်လာပါက ကာကွယ်ရန်
    const isDuplicate = await checkTitleExists(validatedData.title);
    if (isDuplicate) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: {
            fieldErrors: {
              title: ["This advertisement title is already taken. Please use a unique title."]
            }
          }
        },
        { status: 400 }
      );
    }

    // File Size Calculation
    const file = validatedData.videoFile as File;
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1) + "MB";

    // Storage Destination Setup
    const uploadDir = path.join(process.cwd(), "public/uploads/advertisements");
    await fs.mkdir(uploadDir, { recursive: true });

    const uniqueFileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const filePath = path.join(uploadDir, uniqueFileName);

    // Save File to Public Storage
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    const videoUrl = `/uploads/advertisements/${uniqueFileName}`;

    // Call Service to handle FFmpeg processing & Database layer save
    const newAd = await addAdvertisement(filePath, {
      title: validatedData.title,
      videoUrl: videoUrl,
      size: sizeInMB,
      active: validatedData.active,
    });

    return NextResponse.json(newAd, { status: 201 });
  } catch (error) {
    console.error("POST ERROR =", error);
    return NextResponse.json(
      { message: "Create error" },
      { status: 500 }
    );
  }
}