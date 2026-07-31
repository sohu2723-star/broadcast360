import UserForm from "@/components/admin/users/UserForm";

export default function CreateUserPage() {
  return (
    <div className="max-w-3xl">
      <UserForm mode="create" />
    </div>
  );
}
