import ProfileModal from "./ProfileModal";
import Input from "./Input";

interface Props {
  currentPassword: string;

  newPassword: string;

  confirmPassword: string;

  showPassword: boolean;

  errors: {
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  };

  setCurrentPassword: (value: string) => void;

  setNewPassword: (value: string) => void;

  setConfirmPassword: (value: string) => void;

  setShowPassword: (value: boolean) => void;

  changePassword: () => void;

  close: () => void;
}

export default function ChangePasswordModal({
  currentPassword,

  newPassword,

  confirmPassword,

  showPassword,

  errors,

  setCurrentPassword,

  setNewPassword,

  setConfirmPassword,

  setShowPassword,

  changePassword,

  close,
}: Props) {
  return (
    <ProfileModal title="Change Password">
      <Input
        label="Current Password"
        type="password"
        value={currentPassword}
        error={errors.currentPassword}
        onChange={setCurrentPassword}
      />

      <div className="relative">
        <Input
          label="New Password"
          type={showPassword ? "text" : "password"}
          value={newPassword}
          error={errors.newPassword}
          onChange={setNewPassword}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="
absolute
right-4
top-9
text-sm
text-blue-400
"
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>

      <Input
        label="Confirm Password"
        type="password"
        value={confirmPassword}
        error={errors.confirmPassword}
        onChange={setConfirmPassword}
      />

      <div
        className="
mt-6
flex
gap-3
"
      >
        <button
          onClick={changePassword}
          className="
flex-1
rounded-xl
bg-gradient-to-r
from-yellow-500
to-orange-500
py-3
font-semibold
text-white
"
        >
          Update Password
        </button>

        <button
          onClick={close}
          className="
flex-1
rounded-xl
border
border-white/10
bg-white/5
py-3
text-gray-300
"
        >
          Cancel
        </button>
      </div>
    </ProfileModal>
  );
}
