type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function ScheduleSearch({
  value,
  onChange,
}: Props) {
  return (
    <input
      type="text"
      placeholder="Search channel or playlist..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-[#0B1026] text-white border border-white/10 rounded-xl px-4 py-3"
    />
  );
}