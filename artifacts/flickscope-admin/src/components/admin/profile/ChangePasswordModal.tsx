import ProfileModal from "./ProfileModal";
import Input from "./Input";

interface Errors {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ChangePasswordModalProps {
  currentPassword: string;

  newPassword: string;

  confirmPassword: string;

  showPassword: boolean;

  errors: Errors;

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
}: ChangePasswordModalProps) {
  return (
    <ProfileModal title="Change Password">
      {/* Current Password */}

      <div>
        <Input
          label="Current Password"

          type="password"

          value={currentPassword}

          placeholder="Enter current password"

          onChange={setCurrentPassword}
        />

        {errors.currentPassword && (
          <p className="mt-1 text-sm text-red-400">{errors.currentPassword}</p>
        )}
      </div>

      {/* New Password */}

      <div className="relative">
        <Input
          label="New Password"

          type={showPassword ? "text" : "password"}

          value={newPassword}

          placeholder="Enter new password"

          onChange={setNewPassword}
        />

        <button
          type="button"

          onClick={() => setShowPassword(!showPassword)}

          className="absolute top-9 right-4 text-sm text-blue-400 hover:text-blue-300"
        >
          {showPassword ? "Hide" : "Show"}
        </button>

        {errors.newPassword && (
          <p className="mt-1 text-sm text-red-400">{errors.newPassword}</p>
        )}

        <p className="mt-2 text-xs text-gray-400">
          Password must contain at least 8 characters, uppercase letter, number
          and special character.
        </p>
      </div>

      {/* Confirm Password */}

      <div>
        <Input
          label="Confirm Password"

          type="password"

          value={confirmPassword}

          placeholder="Confirm new password"

          onChange={setConfirmPassword}
        />

        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
        )}
      </div>

      {/* Buttons */}

      <div className="mt-6 flex gap-3">
        <button
          onClick={changePassword}

          className="flex-1 rounded-xl bg-[#400FD3] py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#400FD3]/20 transition duration-200 hover:opacity-90"
        >
          Update Password
        </button>

        <button
          onClick={close}

          className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 font-semibold text-gray-300 transition hover:bg-white/10"
        >
          Cancel
        </button>
      </div>
    </ProfileModal>
  );
}
