import { prisma } from "@/lib/prisma";
import { uploadMediaFile } from "@/lib/media/storage";

import {
  createSeries,
  deleteSeries,
  getSeriesById,
  getPaginatedSeries,
  getSeries,
  findSeriesByTitle,
} from "@/repositories/serie.repository";

/* =====================================================
   GET ALL SERIES
===================================================== */

export async function fetchSeries() {
  return getSeries();
}

/* =====================================================
   GET PAGINATED SERIES
===================================================== */

export async function fetchPaginatedSeries(
  page: number,
  limit: number,
  search?: string,
) {
  const validatedPage = Math.max(
    1,
    page,
  );

  const validatedLimit = Math.max(
    1,
    limit,
  );

  const {
    data,
    total,
  } = await getPaginatedSeries({
    page: validatedPage,
    limit: validatedLimit,
    search,
  });

  return {
    data,
    pagination: {
      page: validatedPage,
      limit: validatedLimit,
      total,
    },
  };
}

/* =====================================================
   GET SERIES BY ID
===================================================== */

export function fetchSeriesById(
  id: number,
  opts?: {
    skip: number;
    take: number;
  },
) {
  return getSeriesById(
    id,
    opts,
  );
}

/* =====================================================
   DELETE SERIES
===================================================== */

export function removeSeries(
  id: number,
) {
  return deleteSeries(id);
}

/* =====================================================
   SAVE THUMBNAIL
===================================================== */

async function saveThumbnail(file: File) {
  return uploadMediaFile(file, "thumbnails/series");
}

/* =====================================================
   EDIT SERIES
===================================================== */

export async function editSeries(
  id: number,
  data: {
    title: string;
    description: string;
    genre: string;
    releaseYear: number;
    thumbnail: File | null;
  },
) {
  /* ===================================================
     VALIDATE ID
  =================================================== */

  if (
    !Number.isInteger(id) ||
    id < 1
  ) {
    throw new Error(
      "Invalid series ID",
    );
  }

  /* ===================================================
     VALIDATE TITLE
  =================================================== */

  const title =
    data.title.trim();

  if (!title) {
    throw new Error(
      "Series name is required",
    );
  }

  /* ===================================================
     CHECK CURRENT SERIES
  =================================================== */

  const currentSeries =
    await prisma.series.findUnique({
      where: {
        id,
      },
    });

  if (!currentSeries) {
    throw new Error(
      "Series not found",
    );
  }

  /* ===================================================
     CHECK DUPLICATE SERIES NAME
     
     Current series ID is excluded.
     
     Example:
     
     Series 1 = One Piece
     
     Editing Series 1:
     One Piece -> allowed
     
     Series 2 = One Piece:
     Not allowed
  =================================================== */

  const existingSeries =
    await prisma.series.findFirst({
      where: {
        title: {
          equals: title,
          mode: "insensitive",
        },

        NOT: {
          id,
        },
      },

      select: {
        id: true,
        title: true,
      },
    });

  if (existingSeries) {
    throw new Error(
      "Series name already exists",
    );
  }

  /* ===================================================
     VALIDATE OTHER DATA
  =================================================== */

  if (
    !data.description.trim()
  ) {
    throw new Error(
      "Description is required",
    );
  }

  if (!data.genre.trim()) {
    throw new Error(
      "Genre is required",
    );
  }

  if (
    !Number.isInteger(
      data.releaseYear,
    )
  ) {
    throw new Error(
      "Invalid release year",
    );
  }

  /* ===================================================
     THUMBNAIL
     
     No new image:
     Keep old thumbnail.
     
     New image:
     Save new thumbnail.
  =================================================== */

  let thumbnailUrl:
    | string
    | undefined;

  if (
    data.thumbnail instanceof File &&
    data.thumbnail.size > 0
  ) {
    thumbnailUrl =
      await saveThumbnail(
        data.thumbnail,
      );
  }

  /* ===================================================
     UPDATE DATA
  =================================================== */

  const updateData: {
    title: string;
    description: string;
    genre: string;
    releaseYear: number;
    thumbnail?: string;
  } = {
    title,
    description:
      data.description.trim(),
    genre:
      data.genre.trim(),
    releaseYear:
      data.releaseYear,
  };

  /*
   * Only replace thumbnail when
   * a new thumbnail was uploaded.
   */

  if (thumbnailUrl) {
    updateData.thumbnail =
      thumbnailUrl;
  }

  /* ===================================================
     UPDATE DATABASE
  =================================================== */

  return prisma.series.update({
    where: {
      id,
    },

    data: updateData,
  });
}

/* =====================================================
   ADD SERIES
===================================================== */

export async function addSeries(
  formData: FormData,
) {
  /* ===================================================
     GET FORM DATA
  =================================================== */

  const title =
    String(
      formData.get("title") || "",
    ).trim();

  const description =
    String(
      formData.get("description") || "",
    ).trim();

  const genre =
    String(
      formData.get("genre") || "",
    ).trim();

  const releaseYear =
    Number(
      formData.get(
        "releaseYear",
      ),
    );

  const thumbnailValue =
    formData.get(
      "thumbnail",
    );

  const thumbnail =
    thumbnailValue instanceof File
      ? thumbnailValue
      : null;

  /* ===================================================
     VALIDATION
  =================================================== */

  if (!title) {
    throw new Error(
      "Series name is required",
    );
  }

  if (!description) {
    throw new Error(
      "Description is required",
    );
  }

  if (!genre) {
    throw new Error(
      "Genre is required",
    );
  }

  if (
    !Number.isInteger(
      releaseYear,
    )
  ) {
    throw new Error(
      "Invalid release year",
    );
  }

  /* ===================================================
     CHECK DUPLICATE SERIES NAME
  =================================================== */

  const existingSeries =
    await findSeriesByTitle(
      title,
    );

  if (existingSeries) {
    throw new Error(
      "Series name already exists",
    );
  }

  /* ===================================================
     THUMBNAIL
  =================================================== */

  let thumbnailUrl = "";

  if (
    thumbnail instanceof File &&
    thumbnail.size > 0
  ) {
    thumbnailUrl =
      await saveThumbnail(
        thumbnail,
      );
  }

  /* ===================================================
     CREATE SERIES
  =================================================== */

  return createSeries({
    title,
    description,
    genre,
    releaseYear,
    thumbnail:
      thumbnailUrl,
  });
}