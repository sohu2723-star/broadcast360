import ProfileModal from "./ProfileModal";
import Input from "./Input";

interface Errors {
  name: string;
  email: string;
  phone: string;
}

interface EditProfileModalProps {
  name: string;

  email: string;

  phone: string;

  avatarPreview: string;

  saving: boolean;

  errors: Errors;

  setName: (value: string) => void;

  setEmail: (value: string) => void;

  setPhone: (value: string) => void;

  handleAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  saveProfile: () => void;

  close: () => void;
}

export default function EditProfileModal({
  name,

  email,

  phone,

  avatarPreview,

  saving,

  errors,

  setName,

  setEmail,

  setPhone,

  handleAvatarChange,

  saveProfile,

  close,
}: EditProfileModalProps) {
  return (
    <ProfileModal title="Edit Profile">
      {/* Avatar */}

      <div className="flex items-center gap-5">
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-3xl font-bold text-white">
          {avatarPreview ? (
            <img
              src={avatarPreview}

              alt="avatar"

              className="h-full w-full object-cover"
            />
          ) : (
            name.charAt(0).toUpperCase()
          )}
        </div>

        <label className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white hover:bg-white/10">
          Upload Image
          <input
            type="file"

            accept="image/*"

            className="hidden"

            onChange={handleAvatarChange}
          />
        </label>
      </div>

      {/* Name */}

      <div>
        <Input
          label="Name"

          value={name}

          placeholder="Enter your name"

          onChange={setName}
        />

        {errors.name && (
          <p className="mt-1 text-sm text-red-400">{errors.name}</p>
        )}
      </div>

      {/* Email */}

      <div>
        <Input
          label="Email"

          value={email}

          placeholder="example@gmail.com"

          onChange={setEmail}
        />

        {errors.email && (
          <p className="mt-1 text-sm text-red-400">{errors.email}</p>
        )}
      </div>

      {/* Phone */}

      <div>
        <Input
          label="Phone"

          value={phone}

          placeholder="09xxxxxxxxx"

          onChange={setPhone}
        />

        {errors.phone && (
          <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
        )}
      </div>

      {/* Buttons */}

      <div className="mt-6 flex gap-3">
        <button
          onClick={saveProfile}

          disabled={saving}

          className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-semibold text-white transition hover:scale-[1.02] disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        <button
          onClick={close}

          className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 font-semibold text-gray-300 hover:bg-white/10"
        >
          Cancel
        </button>
      </div>
    </ProfileModal>
  );
}
