export default function Input({
  placeholder,
  value,
  onChange,
}: {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <input
      className="w-full px-3 py-2 rounded-lg bg-[#0B1026] text-white outline-none"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
}
