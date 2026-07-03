import { prisma } from "@/lib/prisma";
import { PlaylistCreateInput } from "@/types/playlist";


export const PlaylistRepository = {


  create: (
    programId: number,
    data: PlaylistCreateInput
  ) => {

    return prisma.playlist.create({

      data: {

        programId,

        name: data.name,

      },

    });

  },

   findByProgramId: async (
    programId:number,
    page:number,
    limit:number
  )=>{


    const skip =
    (page - 1) * limit;



    const [playlists,total] =
    await Promise.all([


      prisma.playlist.findMany({

        where:{
          programId
        },

        orderBy:{
          createdAt:"desc"
        },

        skip,

        take:limit

      }),



      prisma.playlist.count({

        where:{
          programId
        }

      })

    ]);



    return {

      playlists,

      page,

      totalPages:
        Math.ceil(total / limit)

    };


  },



  countByProgramId: (programId: number) => {


    return prisma.playlist.count({

      where: {

        programId,

      },

    });


  },




  findById: (id: number) => {

    return prisma.playlist.findUnique({

      where: {

        id,

      },


      include: {


        program: {

          include: {

            channel: true,

          },

        },


        items: {


          orderBy: {

            order: "asc"

          },


          include: {


            movie: true,

            episode: true,

            advertisement: true,

            news: true,

            stream: true,

            entertainment: true,


          },


        },


      },


    });

  },

  update: (
    id: number,
    data: {
      name: string
    }
  ) => {


    return prisma.playlist.update({

      where: {
        id
      },


      data: {


        name: data.name


      }

    });


  },

  delete: (id: number) => {
  return prisma.playlist.delete({
    where: {
      id,
    },
  });
},

};