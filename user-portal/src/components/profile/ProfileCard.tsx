import type { User } from "@/types/user";

interface Props {
  user: User;
}

export default function ProfileCard({ user }: Props) {
  return (
    <div
      className="
rounded-2xl
border
border-white/10
bg-white/5
p-6
flex
items-center
gap-6
"
    >
      <div
        className="
h-24
w-24
rounded-full
overflow-hidden
bg-blue-600
flex
items-center
justify-center
text-3xl
font-bold
text-white
"
      >
        {user.avatar ? (
          <img src={user.avatar} className="h-full w-full object-cover" />
        ) : (
          user.name.charAt(0).toUpperCase()
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white">{user.name}</h2>

        <p className="text-gray-400">{user.email}</p>

        {user.phone && <p className="text-gray-400">{user.phone}</p>}
      </div>
    </div>
  );
}
