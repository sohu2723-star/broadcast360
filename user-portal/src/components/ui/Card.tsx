export default function Card({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-[#0B1026] p-4 rounded-xl text-white hover:bg-[#106EE9] transition cursor-pointer">
      <h3 className="font-semibold">{title}</h3>

      {subtitle && <p className="text-sm text-gray-300 mt-1">{subtitle}</p>}
    </div>
  );
}
