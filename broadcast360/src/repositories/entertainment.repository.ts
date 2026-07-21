import { prisma } from "@/lib/prisma";


/* =========================
   GET ALL
========================= */
export function getEntertainments() {

  return prisma.entertainment.findMany({

    orderBy: {
      id: "desc",
    },

  });

}


/**
 * Get single entertainment by ID
 */

export function getEntertainmentById(
  id: number
) {

  return prisma.entertainment.findUnique({

    where: {
      id,
    },

  });

}


/**
 * Get paginated entertainment list with search
 */
export async function getPaginatedEntertainments({

  page,

  limit,

  search,

}: {

  page:number;

  limit:number;

  search?:string;

}) {


  const skip =
    (page - 1) * limit;



  const whereClause = search

    ? {

        OR: [

          {

            title: {

              contains: search,

              mode:
              "insensitive" as const,

            },

          },


          {

            category: {

              contains: search,

              mode:
              "insensitive" as const,

            },

          },


        ],

      }

    : {};





 const [
  data,
  total
] = await prisma.$transaction([

  prisma.entertainment.findMany({

    where: whereClause,

    skip,

    take: limit,

    orderBy: {
      id: "desc",
    },

  }),

  prisma.entertainment.count({

    where: whereClause,

  }),

]);



const formattedData = data.map((item)=>({

  id: item.id,

  title: item.title,

  category: item.category,

  thumbnail: item.thumbnail,

  duration: item.duration,

  releaseYear: item.releaseYear,

  createdAt: item.createdAt,

}));



  return {

    data:formattedData,

    total,

  };


}

/* =========================
   CREATE
========================= */
export function createEntertainment(
  data: {
    title: string;
    description: string;
    category: string;
    releaseYear: number;
    duration: number;
    thumbnail: string;
    videoUrl: string;
  }
) {

  return prisma.entertainment.create({
    data,
  });

}





/* =========================
   UPDATE
========================= */
export async function updateEntertainment(
  id: number,

  data: {
    title: string;
    description: string;
    category: string;
    releaseYear: number;
    duration?: number;
    thumbnail?: string;
    videoUrl?: string;
  }

): Promise<any> {

  return prisma.entertainment.update({

    where: {
      id,
    },

    data,

  });

}



/**
 * Delete entertainment + episodes
 */
export async function deleteEntertainment(
 id:number
){


 return prisma.$transaction(async(tx)=>{

   return tx.entertainment.delete({

     where:{

       id,

     },

   });


 });


}