"use client";
import UsersTable from "@/components/featured/UsersTable";
import { useUserStore, useUsersStore } from "@/stores";
import { useEffect } from "react";
import { useStore } from "zustand";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const userObject = useStore(useUserStore, (state) => state.userObject);

  if (userObject?.Roles !== "admin" || !userObject) {
    router.push("/");
  }

  const users = useStore(useUsersStore, (state) => state.users);
  const { fetchUsers } = useUsersStore();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-start gap-16 pt-16">
      <span className="text-5xl font-semibold pt-10">Users</span>
      <div className=" max-w-[70%]">
        <UsersTable users={users ?? []} />
      </div>
    </main>
  );
}
