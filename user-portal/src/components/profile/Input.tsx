interface InputProps {
  label: string;

  value: string;

  type?: string;

  placeholder?: string;

  error?: string;

  onChange: (value: string) => void;
}

export default function Input({
  label,

  value,

  type = "text",

  placeholder,

  error,

  onChange,
}: InputProps) {
  return (
    <div>
      <label
        className="
mb-2
block
text-sm
text-gray-300
"
      >
        {label}
      </label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`
w-full
rounded-xl
border
bg-[#0B1026]
px-4
py-3
text-white
outline-none

${error ? "border-red-500" : "border-white/10 focus:border-blue-500"}

`}
      />

      {error && (
        <p
          className="
mt-2
text-sm
text-red-400
"
        >
          {error}
        </p>
      )}
    </div>
  );
}
