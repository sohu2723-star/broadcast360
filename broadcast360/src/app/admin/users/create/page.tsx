import UserForm from "@/components/admin/users/UserForm";

export default function CreateUserPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-3xl font-bold text-white">Create User</h1>

      <UserForm mode="create" />
    </div>
  );
}
