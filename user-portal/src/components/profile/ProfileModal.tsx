interface Props {
  title: string;
  children: React.ReactNode;
}

export default function ProfileModal({ title, children }: Props) {
  return (
    <div
      className="
fixed
inset-0
z-50
flex
items-center
justify-center
bg-black/70
"
    >
      <div
        className="
w-full
max-w-md
rounded-3xl
border
border-white/10
bg-[#111936]
p-7
shadow-2xl
"
      >
        <h2
          className="
mb-5
text-2xl
font-bold
text-white
"
        >
          {title}
        </h2>

        {children}
      </div>
    </div>
  );
}
