type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function ScheduleFilter({
  value,
  onChange,
}: Props) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-[#0B1026] text-white border border-white/10 rounded-xl px-4 py-3"
    />
  );
}