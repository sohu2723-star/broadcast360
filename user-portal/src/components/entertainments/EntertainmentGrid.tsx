import type { Entertainment } from "@/types/entertainment";

import EntertainmentCard from "./EntertainmentCard";


interface Props {
  entertainments: Entertainment[];
}


export default function EntertainmentGrid({
  entertainments,
}: Props) {

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {entertainments.map((item) => (
        <EntertainmentCard
          key={item.id}
          entertainment={item}
        />
      ))}
    </div>
  );

}