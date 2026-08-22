import { Link } from "wouter";

type Props = {
  id: number;
};

export default function ScheduleButton({ id }: Props) {
  const handleDelete = async () => {
    if (!confirm("Delete this schedule?")) return;

    await fetch(`/api/schedules/${id}`, {
      method: "DELETE",
    });

    window.location.reload();
  };

  return (
    <div className="flex gap-3">

      <Link
        href={`/admin/schedules/${id}`}
        className="bg-[#4f6689] px-4 py-2 rounded-lg text-sm"
      >
        View
      </Link>

      <button
        onClick={handleDelete}
        className="bg-red-600 px-4 py-2 rounded-lg text-sm"
      >
        Delete
      </button>

    </div>
  );
}