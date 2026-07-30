interface ModalProps {
  title: string;
  children: React.ReactNode;
}

export default function ProfileModal({ title, children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[450px] space-y-5 rounded-3xl border border-white/10 bg-[#111936] p-7 shadow-2xl">
        <h2 className="text-2xl font-bold text-white">{title}</h2>

        {children}
      </div>
    </div>
  );
}
