import { ProgramDetailsType } from "@/types/program";

interface Props {
  program: ProgramDetailsType;
}

export default function ProgramCard({ program }: Props) {
  return (
    <div
      className="
        bg-[#0B1026]
        border
        border-[#1a2140]
        rounded-2xl
        p-6
        mb-6
        shadow-lg
      "
    >

      <div className="flex justify-between items-start">

        <div>

          <h2
            className="
              text-2xl
              font-bold
              text-white
            "
          >
            {program.title}
          </h2>



          <p
            className="
              text-white-400
              text-sm
              mt-2
            "
          >
            Channel: {program.channel}
          </p>

        </div>



        <span
          className="
            px-4
            py-1
            rounded-full
            text-xs
            font-semibold
            bg-[#400FD3]
            text-white
          "
        >
          {program.type}
        </span>


      </div>



      {
        program.description && (

          <p
            className="
              text-gray-300
              mt-5
              leading-relaxed
            "
          >
            {program.description}
          </p>

        )
      }




      <div
        className="
          mt-6
          flex
          justify-between
          items-center
          text-sm
        "
      >


        <div
          className="
            flex
            items-center
            gap-2
            text-gray-400
          "
        >

          <span
            className="
              w-2
              h-2
              rounded-full
              bg-[#1CFE10]
            "
          />

          Program Active

        </div>




        <p
          className="
            text-gray-500
          "
        >

          Created:
          {" "}
          {new Date(
            program.createdAt
          ).toLocaleDateString()}

        </p>


      </div>


    </div>
  );
}