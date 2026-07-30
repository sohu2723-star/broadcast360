interface InputProps {
  label: string;
  value: string;
  type?: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

export default function Input({
  label,
  value,
  type = "text",
  placeholder,
  onChange,
}: InputProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-gray-300">{label}</label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-[#0B1026] px-4 py-3 text-white transition outline-none placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
      />
    </div>
  );
}
