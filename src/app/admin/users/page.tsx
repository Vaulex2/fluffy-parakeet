import { getUsers } from "@/lib/actions/admin/users";
import UsersClient from "@/components/admin/UsersClient";

export const metadata = {
  title: "Users | Admin | SushiGO",
};

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="font-headline text-3xl tracking-tight text-text-primary">Users</h1>
        <p className="text-text-muted font-body text-sm mt-1">
          {users.length} registered account{users.length !== 1 ? "s" : ""}
        </p>
      </div>

      <UsersClient users={users} />
    </div>
  );
}
