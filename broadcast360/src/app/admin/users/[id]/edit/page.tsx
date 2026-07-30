import UserForm from "@/components/admin/users/UserForm";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditUserPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="max-w-3xl">

      <UserForm mode="edit" userId={Number(id)} />
    </div>
  );
}
