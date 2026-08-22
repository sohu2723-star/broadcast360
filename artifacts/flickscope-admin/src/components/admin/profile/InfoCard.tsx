interface InfoCardProps {
  title: string;
  value?: string | null;
  icon?: React.ReactNode;
}

export default function InfoCard({ title, value, icon }: InfoCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0B1026] p-5 transition hover:border-white/20">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-blue-400">
            {icon}
          </div>
        )}

        <div>
          <p className="text-sm text-gray-400">{title}</p>

          <p className="mt-1 font-semibold break-all text-white">
            {value || "Not provided"}
          </p>
        </div>
      </div>
    </div>
  );
}
