import type { Entertainment } from "@/types/entertainment";
import EntertainmentCard from "./EntertainmentCard";

interface Props {
  entertainments: Entertainment[];
}

export default function HotEntertainmentSection({
  entertainments,
}: Props) {
  const hotEntertainment = [...entertainments]
    .map((item) => ({
      ...item,
      views: Math.floor(Math.random() * 10000),
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 8);

  return (
   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-7">
      {hotEntertainment.map((item, index) => (
        <EntertainmentCard
          key={`${item.id}-${index}`}
          entertainment={item}
        />
      ))}
    </div>
  );
}