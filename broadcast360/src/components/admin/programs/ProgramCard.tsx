import { ProgramDetailsType } from "@/types/program";

interface Props {
  program: ProgramDetailsType;
}

export default function ProgramCard({ program }: Props) {
  return (
    <div className="mb-6 rounded-2xl border border-[#1a2140] bg-[#0B1026] p-6 shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{program.title}</h2>

          <p className="text-white-400 mt-2 text-sm">
            Channel: {program.channel}
          </p>
        </div>

        <span className="rounded-full bg-[#400FD3] px-4 py-1 text-xs font-semibold text-white">
          {program.type}
        </span>
      </div>

      {program.description && (
        <p className="mt-5 leading-relaxed text-gray-300">
          {program.description}
        </p>
      )}

      <div className="mt-6 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-gray-400">
          <span className="h-2 w-2 rounded-full bg-[#1CFE10]" />
          Program Active
        </div>

        <p className="text-gray-500">
          Created: {new Date(program.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
