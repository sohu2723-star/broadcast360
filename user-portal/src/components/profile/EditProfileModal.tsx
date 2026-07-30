import ProfileModal from "./ProfileModal";

import Input from "./Input";

interface Props {
  name: string;

  email: string;

  phone: string;

  avatarPreview: string;

  saving: boolean;

  errors: {
    name?: string;
    email?: string;
    phone?: string;
  };

  setName: (v: string) => void;

  setEmail: (v: string) => void;

  setPhone: (v: string) => void;

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
}: Props) {
  return (
    <ProfileModal title="Edit Profile">
      <div
        className="
flex
items-center
gap-5
mb-5
"
      >
        <div
          className="
h-24
w-24
overflow-hidden
rounded-full
bg-blue-600
flex
items-center
justify-center
text-3xl
font-bold
text-white
"
        >
          {avatarPreview ? (
            <img
              src={avatarPreview}
              className="
h-full
w-full
object-cover
"
            />
          ) : (
            name.charAt(0).toUpperCase()
          )}
        </div>

        <label
          className="
cursor-pointer
rounded-xl
border
border-white/10
bg-white/5
px-5
py-3
text-white
"
        >
          Upload Image
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </label>
      </div>

      <Input
        label="Name"
        value={name}
        placeholder="Your name"
        error={errors.name}
        onChange={setName}
      />

      <Input
        label="Email"
        value={email}
        placeholder="example@gmail.com"
        error={errors.email}
        onChange={setEmail}
      />

      <Input
        label="Phone"
        value={phone}
        placeholder="09xxxxxxxxx"
        error={errors.phone}
        onChange={setPhone}
      />

      <div
        className="
mt-6
flex
gap-3
"
      >
        <button
          disabled={saving}
          onClick={saveProfile}
          className="
flex-1
rounded-xl
bg-blue-600
py-3
font-semibold
text-white
disabled:opacity-50
"
        >
          {saving ? "Saving..." : "Save"}
        </button>

        <button
          onClick={close}
          className="
flex-1
rounded-xl
border
border-white/10
bg-white/5
text-white
"
        >
          Cancel
        </button>
      </div>
    </ProfileModal>
  );
}
