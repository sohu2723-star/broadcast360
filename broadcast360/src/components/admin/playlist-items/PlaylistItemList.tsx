interface Item {
  id: number;
  type: string;
  order: number;
}

interface Props {
  items: Item[];
}

export default function PlaylistItemList({
  items,
}: Props) {
  return (
    <div className="space-y-2">
      {items
        .sort((a, b) => a.order - b.order)
        .map((item) => (
          <div
            key={item.id}
            className="border p-2 rounded"
          >
            {item.type} - Order: {item.order}
          </div>
        ))}
    </div>
  );
}