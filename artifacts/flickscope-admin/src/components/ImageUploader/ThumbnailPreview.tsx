
import { ImageIcon } from "lucide-react";

type Props = {
  title?: string;
  image?: string;
  portrait?: boolean;
};

export default function ThumbnailPreview({
  title = "Thumbnail Preview",
  image,
  portrait = true,
}: Props) {
  return (
    <div className="rounded-2xl bg-[#151D3B] p-6">
      <h3 className="mb-4 text-sm font-semibold tracking-wide text-slate-400 uppercase">
        {title}
      </h3>

      <div
        className={`flex items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#0D1328] ${
          portrait ? "h-[430px]" : "h-[250px]"
        }`}
      >
        {image ? (
          <img
            src={image}
            alt="Thumbnail"
            width={portrait ? 300 : 500}
            height={portrait ? 450 : 281}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="text-center text-slate-500">
            <div className="mb-3 flex justify-center text-[#7898bf]"><ImageIcon size={48} strokeWidth={1.5} aria-hidden="true" /></div>

            <p>No thumbnail selected</p>

            <p className="mt-2 text-xs">Select an image to preview</p>
          </div>
        )}
      </div>
    </div>
  );
}
