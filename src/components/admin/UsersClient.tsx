"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { suspendUser, unsuspendUser } from "@/lib/actions/admin/users";
import type { AdminUser } from "@/lib/actions/admin/users";

export default function UsersClient({
  users,
}: {
  users: AdminUser[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      (u.full_name ?? "").toLowerCase().includes(q)
    );
  });

  function doToggle(user: AdminUser) {
    startTransition(async () => {
      if (user.is_suspended) {
        await unsuspendUser(user.id);
      } else {
        await suspendUser(user.id);
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[18px]">
          search
        </span>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full bg-background border border-surface-border rounded-xl pl-10 pr-4 py-2.5 text-text-primary font-body text-sm placeholder:text-text-muted/50 focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-surface-border">
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="border-b border-surface-border bg-surface">
              <th className="text-left px-4 py-3 text-text-muted font-medium uppercase tracking-widest text-xs">
                User
              </th>
              <th className="text-left px-4 py-3 text-text-muted font-medium uppercase tracking-widest text-xs">
                Role
              </th>
              <th className="text-right px-4 py-3 text-text-muted font-medium uppercase tracking-widest text-xs">
                Orders
              </th>
              <th className="text-right px-4 py-3 text-text-muted font-medium uppercase tracking-widest text-xs">
                Reserv.
              </th>
              <th className="text-right px-4 py-3 text-text-muted font-medium uppercase tracking-widest text-xs">
                Points
              </th>
              <th className="text-center px-4 py-3 text-text-muted font-medium uppercase tracking-widest text-xs">
                Status
              </th>
              <th className="text-center px-4 py-3 text-text-muted font-medium uppercase tracking-widest text-xs">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-text-muted">
                  No users found.
                </td>
              </tr>
            )}
            {filtered.map((user) => (
              <tr key={user.id} className="hover:bg-surface/50 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-text-primary font-medium">
                    {user.full_name ?? <span className="text-text-muted italic">No name</span>}
                  </p>
                  <p className="text-text-muted text-xs mt-0.5">{user.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border capitalize ${
                      user.role === "admin"
                        ? "bg-primary/15 text-primary border-primary/30"
                        : user.role === "staff"
                        ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                        : "bg-white/5 text-text-muted border-white/10"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-text-primary">{user.order_count}</td>
                <td className="px-4 py-3 text-right text-text-primary">{user.reservation_count}</td>
                <td className="px-4 py-3 text-right text-amber-400">{user.loyalty_points.toLocaleString()}</td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border ${
                      user.is_suspended
                        ? "bg-red-500/15 text-red-400 border-red-500/20"
                        : "bg-green-500/15 text-green-400 border-green-500/20"
                    }`}
                  >
                    {user.is_suspended ? "Suspended" : "Active"}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {user.role !== "admin" && (
                    <button
                      onClick={() => doToggle(user)}
                      disabled={isPending}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-40 ${
                        user.is_suspended
                          ? "border-green-500/40 text-green-400 hover:bg-green-500/10"
                          : "border-primary/40 text-primary hover:bg-primary/10"
                      }`}
                    >
                      {user.is_suspended ? "Unsuspend" : "Suspend"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-text-muted font-body text-xs text-right">
        {filtered.length} of {users.length} users
      </p>
    </div>
  );
}
