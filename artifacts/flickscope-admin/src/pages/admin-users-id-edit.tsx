import { useParams } from "wouter";
import UserForm from "@/components/admin/users/UserForm";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default function EditUserPage() {
  const params = useParams();

  const { id } = params;

  return (
    <div className="max-w-3xl">

      <UserForm mode="edit" userId={Number(id)} />
    </div>
  );
}
