interface Props {
  name: string;
  avatar?: string;
  size?: number;
}

export default function Avatar({ name, avatar, size = 40 }: Props) {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        style={{
          width: size,
          height: size,
        }}
        className="rounded-full object-cover"
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
      }}
      className="flex items-center justify-center rounded-full bg-blue-600 font-semibold text-white"
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
