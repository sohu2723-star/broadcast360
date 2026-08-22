import { z } from "zod";


const baseEntertainmentSchema = z.object({

    title: z
        .string()
        .trim()
        .min(1, "Entertainment title is required")
        .max(100, "Title must be less than 100 characters"),


    description: z
        .string()
        .trim()
        .min(1, "Description is required")
        .max(1000, "Description is too long"),


    category: z
        .string()
        .trim()
        .min(1, "Category is required"),


        releaseYear: z
        .union([z.string(), z.number()])
        .transform((val) => {
            if (val === "" || val === null || val === undefined) {
                return NaN;
            }

            return Number(val);
        })
        .refine(
            (val) => !isNaN(val),
            "Release year is required"
        )
        .refine(
            (val) => Number.isInteger(val),
            "Invalid release year"
        )
        .refine(
            (val) => val >= 1900,
            "Release year must be after 1900"
        )
        .refine(
            (val) => val <= new Date().getFullYear(),
            "Release year cannot be in the future"
        ),

        duration: z
    .union([z.string(), z.number()])
    .transform((val) => {
        if (val === "" || val === null || val === undefined) {
            return 0;
        }

        return Number(val);
    })
    .refine(
        (val) => !isNaN(val),
        "Duration is required"
    )
    .refine(
        (val) => Number.isInteger(val),
        "Invalid duration"
    )
    .refine(
        (val) => val >= 0,
        "Duration cannot be negative"
    ),

});

// CREATE
// CREATE
export const createEntertainmentSchema =
    baseEntertainmentSchema.extend({

        thumbnail: z
            .instanceof(File, {
                message: "Thumbnail is required",
            })
            .refine(
                (file) =>
                    [
                        "image/jpeg",
                        "image/png",
                        "image/webp",
                    ].includes(file.type),
                "Invalid thumbnail format"
            ),


        video: z
            .instanceof(File, {
                message: "Video file is required",
            })
            .refine(
                (file) =>
                    [
                        "video/mp4",
                        "video/webm",
                        "video/quicktime",
                    ].includes(file.type),
                "Invalid video format"
            ),

    });

// EDIT
export const editEntertainmentSchema =
    baseEntertainmentSchema.extend({

        thumbnail: z
            .instanceof(File)
            .nullable()
            .optional(),


        video: z
            .instanceof(File)
            .nullable()
            .optional(),

    });