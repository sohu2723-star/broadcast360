export default function Button({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-[#106EE9] text-white px-4 py-2 rounded-lg hover:opacity-90"
    >
      {children}
    </button>
  );
}
